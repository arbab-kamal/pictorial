"use client"

import { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { resetPassword } from "@/app/actions/auth-actions"
import { useId } from "react"

interface SecuritySettingsProps {
  user: User
}

export function SecuritySettings({ user }: SecuritySettingsProps) {
  const toastId = useId()

  const handleChangePassword = async () => {
    toast.loading("Sending password reset email...", { id: toastId })
    try {
      const {success, error} = await resetPassword({ email: user.email || "" })
      if (!success) {
        toast.error(String(error), {
        id: toastId
        })
      } else {
        toast.success("Password reset email sent! Please check your email for instructions.", {
        id: toastId
        })
      }
    } catch (error) {
      console.error("Error sending reset email", error)
      toast.error("Failed to send reset email", { id: toastId })
    }
  }



  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Password</h3>
          <p className="text-sm text-muted-foreground">
            Change your password to keep your account secure
          </p>
          <Button variant="outline" onClick={handleChangePassword}>
            Change password
          </Button>
        </div>
      
      </CardContent>
    </Card>
  )
} 