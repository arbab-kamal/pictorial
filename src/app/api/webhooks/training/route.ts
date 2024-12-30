import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { Resend } from "resend";
import EmailTemplate from "@/components/email-templates/EmailTemplate";

// Types
interface WebhookParams {
  userId: string;
  modelName: string;
  fileName: string;
}

interface WebhookHeaders {
  id: string;
  timestamp: string;
  signature: string;
}

interface TrainingResponse {
  status: "succeeded" | "failed" | "canceled";
  metrics?: {
    total_time: number;
  };
  output?: {
    version: string;
  };
}

// Constants
const ADMIN_EMAIL = "Picshot AI <support@picshotai.com>";

// Service instances
const resend = new Resend(process.env.RESEND_API_KEY);
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
const supabaseAdmin = createAdminClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
);

// Helper functions
function getWebhookParams(url: URL): WebhookParams {
  return {
    userId: url.searchParams.get("userId") ?? "",
    modelName: url.searchParams.get("modelName") ?? "",
    fileName: url.searchParams.get("fileName") ?? "",
  };
}

function getWebhookHeaders(headers: Headers): WebhookHeaders {
  return {
    id: headers.get("webhook-id") ?? "",
    timestamp: headers.get("webhook-timestamp") ?? "",
    signature: headers.get("webhook-signature") ?? "",
  };
}

async function verifyWebhookSignature(
  headers: WebhookHeaders,
  body: TrainingResponse,
): Promise<boolean> {
  const signedContent = `${headers.id}.${headers.timestamp}.${
    JSON.stringify(body)
  }`;
  const secret = await replicate.webhooks.default.secret.get();

  if (!secret) return false;

  const secretBytes = Buffer.from(secret.key.split("_")[1], "base64");
  const signature = crypto
    .createHmac("sha256", secretBytes)
    .update(signedContent)
    .digest("base64");

  const expectedSignatures = headers.signature.split(" ").map((sig: string) =>
    sig.split(",")[1]
  );
  return expectedSignatures.some((expectedSignature) =>
    expectedSignature === signature
  );
}

async function handleSuccessfulTraining(
  userId: string,
  modelName: string,
  fileName: string,
  body: TrainingResponse,
  userEmail: string,
  userName: string,
) {
  await Promise.all([
    // Send email
    resend.emails.send({
      from: ADMIN_EMAIL,
      to: [userEmail],
      subject: "Model Training Completed",
      react: EmailTemplate({
        userName,
        message: "Your model training has completed.",
      }),
    }),

    // Update model details
    supabaseAdmin
      .from("models")
      .update({
        training_status: body.status,
        training_time: body.metrics?.total_time ?? null,
        version: body.output?.version.split(":")[1] ?? null,
      })
      .eq("user_id", userId)
      .eq("model_name", modelName),

    // Delete training file
    supabaseAdmin
      .storage
      .from("training_data")
      .remove([`${userId}/${fileName}`]),
  ]);
}

// Main handler
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TrainingResponse;
    const url = new URL(req.url);
    const { userId, modelName, fileName } = getWebhookParams(url);
    const webhookHeaders = getWebhookHeaders(req.headers);

    // Validation checks
    if (!userId || !modelName) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    const isValid = await verifyWebhookSignature(webhookHeaders, body);
    if (!isValid) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    // Get user data
    const { data: user, error: userError } = await supabaseAdmin.auth.admin
      .getUserById(userId);

    if (userError || !user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const { data: userCredits, error: userCreditsError } = await supabaseAdmin
      .from("credits")
      .select("model_training_count")
      .eq("user_id", userId)
      .single();

    if (userCreditsError) {
      throw new Error("Error fetching user credits");
    }

    const oldCredits = userCredits?.model_training_count ?? 1;
    const userEmail = user.user.email ?? "";
    const userName = user.user.user_metadata.full_name ?? "";

    if (body.status === "succeeded") {
      await handleSuccessfulTraining(
        userId,
        modelName,
        fileName,
        body,
        userEmail,
        userName,
      );
    } else {
      // Handle failed or canceled training
      await Promise.all([
        resend.emails.send({
          from: ADMIN_EMAIL,
          to: [userEmail],
          subject: `Model Training ${body.status}`,
          react: EmailTemplate({
            userName,
            message: `Your model training has been ${body.status}.`,
          }),
        }),

        supabaseAdmin
          .from("models")
          .update({ training_status: body.status })
          .eq("user_id", userId)
          .eq("model_name", modelName),

        supabaseAdmin
          .from("credits")
          .update({ model_training_count: oldCredits + 1 })
          .eq("user_id", userId),

        supabaseAdmin
          .storage
          .from("training_data")
          .remove([fileName]),
      ]);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
