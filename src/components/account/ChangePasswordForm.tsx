"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { changePassword } from "@/app/actions/auth-actions";
import { cn } from "@/lib/utils";

const passwordValidationRegex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
);

const formSchema = z
  .object({
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(8, {
        message: "Password must be at least 8 characters long.",
      })
      .regex(passwordValidationRegex, {
        message:
          "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.",
      }),
    confirmPassword: z.string({
      required_error: "Confirm password is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export function ChangePasswordForm({ className = "" }: { className?: string }) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const toastId = React.useId();

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    toast.loading("Changing password...", { id: toastId });

    try {
      const { success, error } = await changePassword(values.password);
      if (success) {
        toast.success("Password changed successfully", { id: toastId });
        router.push("/login");
      } else {
        toast.error(String(error), { id: toastId });
      }
    } catch (error) {
      toast.error("Failed to change password", { id: toastId });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-6", className)}>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Change Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below to change your password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter a strong password that meets the requirements above
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Re-enter your new password to confirm
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Changing Password..." : "Change Password"}
            </Button>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Make sure to remember your new password or store it securely
          </div>
        </form>
      </Form>
    </div>
  );
}
