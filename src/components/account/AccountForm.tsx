"use client"

import { User } from "@supabase/supabase-js"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { updateProfile } from "@/app/actions/auth-actions"

const profileFormSchema = z.object({
  fullName: z.string().min(2).max(50),
  email: z.string().email(),
})

interface AccountFormProps {
  user: User
}

export function AccountForm({ user }: AccountFormProps) {
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || "",
      email: user?.email || "",
    },
  })

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    try {
      // Add your update logic here
      // console.log("values", values)
      const {success, error} = await updateProfile(values)
      if (!success) {
        toast.error(error)
      } else {
        toast.success("Profile updated successfully")
      }
    } catch (error) {
      console.error("Error updating profile", error)
      toast.error("Failed to update profile")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update your personal information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormDescription>
                    Your email address is used for sign in and communications
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Update profile</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 