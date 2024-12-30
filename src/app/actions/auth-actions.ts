"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface AuthResponse {
  error: null | string;
  success: boolean;
  data: unknown | null;
}

export async function login(formData: FormData): Promise<AuthResponse> {
  const supabase = await createClient();
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: loginData, error } = await supabase.auth.signInWithPassword(
    data,
  );

  return {
    error: error?.message || "There was an error logging in!",
    success: !error,
    data: loginData || null,
  };
}

export async function signup(formData: FormData): Promise<AuthResponse> {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: formData.get("full_name") as string,
      },
    },
  };

  const { data: signupData, error } = await supabase.auth.signUp(data);

  return {
    error: error?.message || "There was an error signing up!",
    success: !error,
    data: signupData || null,
  };
}

export async function resetPassword(
  values: { email: string },
): Promise<AuthResponse> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.resetPasswordForEmail(
    values.email,
  );

  return {
    error: error?.message ||
      "There was an error sending the reset password email!",
    success: !error,
    data: data || null,
  };
}

export async function updateProfile(
  values: { fullName: string },
): Promise<AuthResponse> {
  const supabase = await createClient();
  const full_name = values.fullName;

  const { data, error } = await supabase.auth.updateUser({
    data: { full_name },
  });

  if (!error) {
    const { error: profileError } = await supabase
      .from("users")
      .update({ full_name })
      .eq("id", data?.user?.id);

    if (profileError) {
      return {
        error: profileError.message,
        success: false,
        data: null,
      };
    }
  }

  return {
    error: error?.message || "There was an error updating the profile!",
    success: !error,
    data: data || null,
  };
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function changePassword(
  newPassword: string,
): Promise<AuthResponse> {
  const supabase = await createClient();

  const { error, data } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return {
    error: error?.message || "There was an error changing the password!",
    success: !error,
    data: data || null,
  };
}

export async function updatePassword(
  newPassword: string,
): Promise<AuthResponse> {
  const supabase = await createClient();

  const { error, data } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return {
    error: error?.message || "There was an error changing the password!",
    success: !error,
    data: data || null,
  };
}
