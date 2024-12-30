import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidateTag } from "next/cache";

// Types
interface TrainingInput {
  fileKey: string;
  modelName: string;
  gender: "man" | "women" | null;
}

// Constants
const TRIGGER_WORD = "ohwx";
const TRAINING_STEPS = 1200;
const SIGNED_URL_EXPIRY = 3600; // 1 hour
const CREDITS_REVALIDATION_DELAY = 4000; // 4 seconds

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN ?? '',
});

const WEBHOOK_HOST = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NGROK_HOST;

// Helper functions
function createModelId(userId: string, modelName: string): string {
  return `${userId}_${Date.now()}_${modelName.toLowerCase().replaceAll(" ", "_")}`;
}

function createWebhookUrl(userId: string, modelName: string, fileName: string): string | undefined {
  if (!WEBHOOK_HOST) return undefined;
  
  return `${WEBHOOK_HOST}/api/webhooks/training?userId=${userId}&modelName=${
    encodeURIComponent(modelName)
  }&fileName=${encodeURIComponent(fileName)}`;
}

async function validateUserCredits(userId: string) {
  const { data: userCredits, error } = await supabaseAdmin
    .from("credits")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw new Error("Error getting user credits");
  
  const credits = userCredits?.model_training_count ?? 0;
  if (credits <= 0) {
    throw new Error("No credits left for training");
  }
  
  return credits;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("The REPLICATE_API_TOKEN environment variable is not set");
    }

    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate input
    const formData = await request.formData();
    const input: TrainingInput = {
      fileKey: formData.get("fileKey") as string,
      modelName: formData.get("modelName") as string,
      gender: formData.get("gender") as "man" | "women" | null,
    };

    if (!input.fileKey || !input.modelName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate credits
    const oldCredits = await validateUserCredits(user.id);

    // Get file URL
    const fileName = input.fileKey.replace("training_data/", "");
    const { data: fileUrl } = await supabaseAdmin.storage
      .from("training_data")
      .createSignedUrl(fileName, SIGNED_URL_EXPIRY);

    if (!fileUrl?.signedUrl) {
      throw new Error("Failed to get file URL");
    }

    // Create model and start training
    const modelId = createModelId(user.id, input.modelName);
    console.log("Model ID", modelId);
    const webhookUrl = createWebhookUrl(user.id, input.modelName, fileName);

    // const hardwareList = await replicate.hardware.list();
    // console.log("Hardware list", hardwareList);
    await replicate.models.create(`${process.env.NEXT_PUBLIC_REPLICATE_USER_NAME}`, modelId, {
      visibility: "private",
      hardware: "gpu-a100-large",
    });

    const training = await replicate.trainings.create(
      "ostris",
      "flux-dev-lora-trainer",
      "e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497",
      {
        destination: `${process.env.NEXT_PUBLIC_REPLICATE_USER_NAME}/${modelId}`,
        input: {
          steps: TRAINING_STEPS,
          resolution: "1024",
          input_images: fileUrl.signedUrl,
          trigger_word: TRIGGER_WORD,
        },
        webhook: webhookUrl,
        webhook_events_filter: ["completed"],
        // webhook_events_filter: ["start", "completed", "output", "logs"],
      },
    );

    // Store model details
    await Promise.all([
      supabaseAdmin.from("models").insert({
        model_id: modelId,
        user_id: user.id,
        model_name: input.modelName,
        gender: input.gender,
        training_status: training.status,
        trigger_word: TRIGGER_WORD,
        training_steps: TRAINING_STEPS,
        training_id: training.id,
      }),
      supabaseAdmin
        .from("credits")
        .update({ model_training_count: oldCredits - 1 })
        .eq("user_id", user.id),
    ]);

    // Revalidate credits after a delay
    setTimeout(() => revalidateTag("credits"), CREDITS_REVALIDATION_DELAY);

    return NextResponse.json(training, { status: 201 });
  } catch (error) {
    console.error("Training error:", error);
    const message = error instanceof Error ? error.message : "Failed to start model training";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
