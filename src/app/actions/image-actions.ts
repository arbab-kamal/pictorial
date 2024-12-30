/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { Database } from "@database.types";
import { randomUUID } from "crypto";
import { revalidateTag } from "next/cache";
import Replicate from "replicate";
import { imageMeta } from "image-meta";
import { getCredits } from "./credit-actions";
import { createClient } from "@/lib/supabase/server";
import { createClientWithOptions } from "@/lib/supabase/server-fetch";
import { supabaseAdmin } from "@/lib/supabase/admin";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  useFileOutput: false,
});

interface GenerateImageInput {
  model: string;
  prompt: string;
  num_inference_steps: number;
  num_outputs: number;
  guidance: number;
  aspect_ratio: string;
  output_format: string;
  output_quality: number;
}

interface ImageResponse {
  error: string | null;
  success: boolean;
  data: any | null;
}

export async function generateImage(
  input: GenerateImageInput,
): Promise<ImageResponse> {
  if (!process.env.REPLICATE_API_TOKEN) {
    return {
      error: "Missing API token",
      success: false,
      data: null,
    };
  }
  const { data: credits } = await getCredits();
  if (!credits?.image_generation_count || credits.image_generation_count <= 0) {
    return {
      error: "No credits available",
      success: false,
      data: null,
    };
  }

  const modelInput =
    input.model.startsWith(`${process.env.NEXT_PUBLIC_REPLICATE_USER_NAME}/`)
      ? {
        model: "dev",
        prompt: input.prompt,
        lora_scale: 1,
        aspect_ratio: input.aspect_ratio,
        guidance: input.guidance,
        num_outputs: input.num_outputs,
        num_inference_steps: input.num_inference_steps,
        output_format: input.output_format,
        output_quality: input.output_quality,
        prompt_strength: 0.8,
        extra_lora_scale: 0,
      }
      : input;

  try {
    const output = await replicate.run(input.model as `${string}/${string}`, {
      input: modelInput,
    });

    revalidateTag("credits");
    revalidateTag("dashboard-images");
    return {
      error: null,
      success: true,
      data: output,
    };
  } catch (error: any) {
    return {
      error: error.message || "Failed to generate image",
      success: false,
      data: null,
    };
  }
}

type StoreImageInput = {
  url: string;
} & Database["public"]["Tables"]["generated_images"]["Insert"];

export async function storeImages(
  data: StoreImageInput[],
): Promise<ImageResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Unauthorized",
      success: false,
      data: null,
    };
  }

  const uploadResults = [];

  for (const img of data) {
    const arrayBuffer = await imgUrlToBlob(img.url);
    const { width, height, type } = imageMeta(new Uint8Array(arrayBuffer));

    const fileName = `image_${randomUUID()}.${type}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: storageError } = await supabase.storage
      .from("generated_images")
      .upload(filePath, arrayBuffer, {
        contentType: `image/${type}`,
        cacheControl: "3600",
        upsert: false,
      });

    if (storageError) {
      uploadResults.push({
        fileName,
        error: storageError.message,
        success: false,
        data: null,
      });
      continue;
    }

    const { data: dbData, error: dbError } = await supabase
      .from("generated_images")
      .insert([{
        user_id: user.id,
        model: img.model,
        prompt: img.prompt,
        aspect_ratio: img.aspect_ratio,
        guidance: img.guidance,
        num_inference_steps: img.num_inference_steps,
        output_format: img.output_format,
        image_name: fileName,
        width,
        height,
      }])
      .select();

    uploadResults.push({
      fileName,
      error: dbError?.message || null,
      success: !dbError,
      data: dbData || null,
    });
  }

  revalidateTag("gallery-images");
  revalidateTag("dashboard-images");

  return {
    error: null,
    success: true,
    data: { results: uploadResults },
  };
}

export async function imgUrlToBlob(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  const blob = await response.blob();
  return blob.arrayBuffer();
}

export async function getPresignedStorageUrl(filePath: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: urlData, error } = await supabaseAdmin.storage.from(
    "training_data",
  ).createSignedUploadUrl(`${user?.id}/${new Date().getTime()}_${filePath}`, {
    upsert: false,
  });
  return { signedUrl: urlData?.signedUrl || "", error: error?.message || null };
}

export async function getImages(limit?: number) {
  const cacheOptions = {
    cache: "force-cache",
    next: {
      tags: ["dashboard-images", "gallery-images"],
    },
  };

  const supabase = await createClientWithOptions(cacheOptions);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Unauthorized",
      success: false,
      data: null,
    };
  }

  let query = supabase
    .from("generated_images")
    .select("*")
    .eq("user_id", user?.id || "")
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    return {
      error: error.message || "Failed to fetch images",
      success: false,
      data: null,
    };
  }

  const imagesWithUrls = await Promise.all(
    data.map(
      async (
        image: Database["public"]["Tables"]["generated_images"]["Row"],
      ) => {
        const { data: urlData } = await supabase
          .storage
          .from("generated_images")
          .createSignedUrl(`${user?.id || ""}/${image.image_name}`, 3600);

        return {
          ...image,
          url: urlData?.signedUrl,
        };
      },
    ),
  );

  return {
    error: null,
    success: true,
    data: imagesWithUrls || null,
  };
}

export async function deleteImage(id: string, imageName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // throw new Error("Unauthorized");
    return {
      error: "Unauthorized",
      success: false,
      message: "Failed to delete image",
    };
  }

  const { error, data } = await supabase.from("generated_images").delete().eq(
    "id",
    id,
  ).eq("user_id", user.id);

  if (error) {
    return { error: error.message, success: false, data: null };
  }

  await supabase.storage.from("generated_images").remove([
    `${user.id}/${imageName}`,
  ]);

  revalidateTag("dashboard-images");
  revalidateTag("gallery-images");

  return { error: null, success: true, data: data };
}
