"use client";

import * as React from "react";
import LoginForm from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type AuthMode = "login" | "signup" | "reset";

export function AuthForm({state}: {state: string}) {
  const [mode, setMode] = React.useState<AuthMode>(state ? state as AuthMode : "login");

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "reset"
            ? "Reset Password"
            : mode === "login"
            ? "Login"
            : "Sign Up"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "reset"
            ? "Enter your email below to reset your password"
            : mode === "login"
            ? "Enter your email below to login to your account"
            : "Enter your information below to create an account"}
        </p>
      </div>
      {mode === "login" && (
        <>
          <LoginForm />
          <div className="text-center flex justify-between flex-col md:flex-row">
            <Button
              variant="link"
              className="p-0"
              onClick={() => setMode("signup")}
            >
              Need an account? Sign up
            </Button>
            <Button
              variant="link"
              className="p-0"
              onClick={() => setMode("reset")}
            >
              Forgot password?
            </Button>
          </div>
        </>
      )}
      {mode === "signup" && (
        <>
          <SignupForm />
          <div className="text-center">
            <Button variant="link" onClick={() => setMode("login")}>
              Already have an account? Log in
            </Button>
          </div>
        </>
      )}
      {mode === "reset" && (
        <>
          <ResetPasswordForm />
          <div className="text-center">
            <Button variant="link" onClick={() => setMode("login")}>
              Back to login
            </Button>
          </div>
        </>
      )}
      {mode === "signup" && (
        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking sign up, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      )}
    </div>
  );
}
