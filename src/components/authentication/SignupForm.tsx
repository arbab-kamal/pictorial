"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { signup } from "@/app/actions/auth-actions"
import { toast } from "sonner"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const passwordValidationRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})');
// The above regex ensures that the password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.

const formSchema = z.object({
  full_name: z.string().min(3, {
    message: "First name must be at least 3 characters long.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string({
    required_error: 'Password is required',
  }).min(8, {
    message: "Password must be at least 8 characters long.",
  }).regex(passwordValidationRegex, {
    message: "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.",
  }), 

  confirmPassword: z.string({
    required_error: 'Confirm password is required',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type FormValues = z.infer<typeof formSchema>

export function SignupForm() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })
  const toastId = React.useId();

  async function onSubmit(values: FormValues) {
  
    setIsLoading(true)
    toast.loading("Signing up...", { id: toastId })
    const formData = new FormData()
    formData.append("full_name", values.full_name)
    formData.append("email", values.email)
    formData.append("password", values.password)
    // await signup(formData)
    const {success, error} = await signup(formData);
    if (!success) {
      toast.error(String(error), { id: toastId })
    } else {
      toast.success("Signed up successfully! Please confirm your email address.", { id: toastId })
      revalidatePath("/", "layout");
      redirect("/login");
    }

    setIsLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="your full name" {...field} />
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
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="add password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="confirm your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign Up
        </Button>
      </form>
    </Form>
  )
}