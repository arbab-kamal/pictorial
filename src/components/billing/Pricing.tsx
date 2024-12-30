"use client";
import { Tables } from "@database.types";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { usePathname, useRouter } from "next/navigation";
import { checkoutWithStripe, createStripePortal } from "@/lib/stripe/server";
import { getErrorRedirect } from "@/lib/helpers";
import { getStripe } from "@/lib/stripe/client";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { revalidateTag } from "next/cache";

type Subscription = Tables<"subscriptions">;
type Product = Tables<"products">;
type Price = Tables<"prices">;
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
  children?: React.ReactNode;
  showInterval?: boolean;
  className?: string;
  activeProduct?: string;
  mostPopularProduct?: string;
}

type BillingInterval = "year" | "month";

const renderPricingButton = ({
  subscription,
  user,
  product,
  price,
  priceIdLoading,
  mostPopularProduct,
  handleStripePortalRequest,
  handleStripeCheckout,
}: {
  subscription: SubscriptionWithProduct | null;
  user: User | null | undefined;
  product: ProductWithPrices;
  price: Price;
  priceIdLoading: string | undefined;
  mostPopularProduct: string;
  handleStripePortalRequest: () => Promise<void>;
  handleStripeCheckout: (price: Price) => Promise<void>;
}) => {
  // Case 1: User has active subscription for this product
  if (user && subscription && subscription.prices?.products?.name?.toLowerCase() === product.name?.toLowerCase()) {
    return (
      <Button
        className="mt-8 w-full font-semibold"
        onClick={handleStripePortalRequest}
      >
        Manage Subscription
      </Button>
    );
  }
  // Case 2: User is logged in and has an active subscription for a different product
  if (user && subscription) {
    return (
      <Button 
        className="mt-8 w-full font-semibold"
        onClick={handleStripePortalRequest}
        variant={"secondary"}
      >
        Switch Plan
      </Button>
    );
  }

  // Case 3: Logged in user with no subscription or different subscription
  if (user && !subscription) {
    return (
      <Button
        className="mt-8 w-full font-semibold"
        onClick={() => handleStripeCheckout(price)}
        variant={product.name?.toLowerCase() === mostPopularProduct.toLowerCase() ? "default" : "secondary"}
        disabled={priceIdLoading === price.id}
      >
        {priceIdLoading === price.id && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Subscribe
      </Button>
    );
  }

  // Case 4: No user logged in
  return (
    <Button
      className="mt-8 w-full font-semibold"
      variant={product.name?.toLowerCase() === mostPopularProduct.toLowerCase() ? "default" : "secondary"}
      disabled={priceIdLoading === price.id}
      onClick={() => handleStripeCheckout(price)}
    >
      {priceIdLoading === price.id && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      Subscribe
    </Button>
  );
};

const Pricing = ({
  user,
  products,
  subscription,
  showInterval = true,
  className = "",
  activeProduct = "",
  mostPopularProduct = "",
}: Props) => {

  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("month");
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const currentPath = usePathname();
  const router = useRouter();


  const handleStripeCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push("/login");
    }

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      price,
      currentPath
    );

    if (errorRedirect) {
      setPriceIdLoading(undefined);
      return router.push(errorRedirect);
    }

    if (!sessionId) {
      setPriceIdLoading(undefined);
      return router.push(
        getErrorRedirect(
          currentPath,
          "An unknown error occurred.",
          "Please try again later or contact a system administrator."
        )
      );
    }

    const stripe = await getStripe();
    stripe?.redirectToCheckout({ sessionId });

    setPriceIdLoading(undefined);
    revalidateTag("credits");
  };

  const handleStripePortalRequest = async () => {
    toast.info("Redirecting to Stripe portal...");
    const redirectUrl = await createStripePortal(currentPath);
    return router.push(redirectUrl);
  };

  return (
    <div
      className={cn(
        "max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 flex flex-col",
        className
      )}
    >
      {showInterval && (
        <div className="flex justify-center items-center space-x-4">
          <Label
            htmlFor="yearly-pricing"
            className="font-semibold text-base text-muted-foreground"
          >
            Monthly
          </Label>
          <Switch
            id="yearly-pricing"
            checked={billingInterval === "year"}
            onCheckedChange={(checked) =>
              setBillingInterval(checked ? "year" : "month")
            }
          />
          <Label
            htmlFor="yearly-pricing"
            className="font-semibold text-base text-muted-foreground"
          >
            Yearly
          </Label>
        </div>
      )}

      <div className="space-y-4 sm:space-y-0 grid-cols-1 sm:grid sm:grid-cols-2 lg:grid-cols-2 sm:gap-8 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3 place-items-center">
        {products.map((product) => {
          const price = product?.prices?.find(
            (price) => price.interval === billingInterval
          );
          if (!price) return null;
          const priceString = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: price.currency!,
            minimumFractionDigits: 0,
          }).format((price?.unit_amount || 0) / 100);

          return (
            <div
              key={product.id}
              className={cn(
                "border bg-background rounded-xl shadow-sm divide-y divide-border h-fit",
                product.name?.toLowerCase() === activeProduct.toLowerCase()
                  ? "border-primary bg-background drop-shadow-md"
                  : "border-border"
              )}
            >
              <div className="p-6">
                <h2 className="text-2xl leading-6 font-semibold text-foreground flex items-center justify-between">
                  {product.name}

                  {product.name?.toLowerCase() === activeProduct ? (
                    <Badge
                      className="border-border font-semibold"
                      variant={"default"}
                    >
                      Selected
                    </Badge>
                  ) : (
                    ""
                  )}
                  {product.name?.toLowerCase() === mostPopularProduct ? (
                    <Badge
                      className="border-border font-semibold"
                      variant={"default"}
                    >
                      Most Popular
                    </Badge>
                  ) : (
                    ""
                  )}
                </h2>
                <p className="mt-4 text-sm text-muted-foreground">
                  {product.description}
                </p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-foreground">
                    {priceString}
                  </span>
                  <span className="text-base font-medium text-muted-foreground">
                    /{billingInterval === "year" ? "year" : "month"}
                  </span>
                </p>

                {renderPricingButton({
                  subscription,
                  user,
                  product,
                  price,
                  priceIdLoading,
                  mostPopularProduct,
                  handleStripePortalRequest,
                  handleStripeCheckout,
                })}
              </div>
             
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pricing;
