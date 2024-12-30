import { createClient } from "@/lib/supabase/server";
import { getUser, getProducts, getSubscription } from "@/lib/supabase/queries";
import PlanSummary from "@/components/billing/PlanSummary";
import { getCredits } from "@/app/actions/credit-actions";
import Pricing from "@/components/billing/Pricing";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Billing | Pictoria AI",
  description: "Billing for Pictoria AI",
};

export default async function BillingPage() {
  const supabase = await createClient();
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase),
  ]);
  if (!user) {
    return redirect("/login");
  }

  const { data: credits } = await getCredits();

  return (
    <div className="container mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plans & Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      <div className="grid gap-10">
        <PlanSummary
          credits={Array.isArray(credits) ? credits[0] : credits}
          subscription={subscription}
          user={user}
          products={products ?? []}
        />
        {subscription?.status === "active" ? (
          <Pricing
            user={user}
            products={products ?? []}
            subscription={subscription}
            showInterval={false}
            className="!p-0 max-w-full"
            activeProduct={
              subscription?.prices?.products?.name?.toLowerCase() || "pro"
            }
          />
        ) : null}
      </div>
    </div>
  );
}
