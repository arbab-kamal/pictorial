"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@database.types";

interface ModelResponse {
  error: string | null;
  success: boolean;
  data: Database["public"]["Tables"]["models"]["Row"][] | null;
  count: number;
}

export async function fetchModels(): Promise<ModelResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Unauthorized",
      success: false,
      data: null,
      count: 0,
    };
  }

  const { data, error, count } = await supabase
    .from("models")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return {
    error: error?.message || null,
    success: !error,
    data: data || null,
    count: count || 0,
  };
}

export async function deleteModel(
  id: number,
  model_id: string,
  model_version: string,
) {
  const supabase = await createClient();

  if (model_version) {
    try {
      const res = await fetch(
        `https://api.replicate.com/v1/models/${process.env.NEXT_PUBLIC_REPLICATE_USER_NAME}/${model_id}/versions/${model_version}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          },
        },
      );
      if (!res.ok) {
        throw new Error("Failed to delete model version from Replicate");
      }
    } catch (e) {
      console.error("Failed to delete model version from Replicate:", e);
      return {
        error: "Failed to delete model version from Replicate",
        success: false,
      };
    }
  }

  if (model_id) {
    try {
      // replicate_id format is "owner/model_name"

      const res = await fetch(
        `https://api.replicate.com/v1/models/${process.env.NEXT_PUBLIC_REPLICATE_USER_NAME}/${model_id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to delete model from Replicate");
      }
    } catch (e) {
      console.error("Failed to delete model from Replicate:", e);
      return {
        error: "Failed to delete model from Replicate",
        success: false,
      };
    }
  }

  const { error } = await supabase
    .from("models")
    .delete()
    .eq("id", id);

  return { error: error?.message || null, success: !error };
}
