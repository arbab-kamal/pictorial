import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/queries";
import { AccountForm } from "@/components/account/AccountForm";
import { SecuritySettings } from "@/components/account/SecuritySettings";
import { Metadata } from 'next'
import { redirect } from "next/navigation";


export const metadata: Metadata = {
  title: "Account Settings | Pictoria AI",
  description: "Account settings for Pictoria AI",
}

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="container mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-8">
        <AccountForm user={user} />
        <SecuritySettings user={user} />
      </div>
    </div>
  );
}