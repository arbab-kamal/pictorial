import React from "react";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Tables } from "@database.types";
import PricingSheet from "./PricingSheet";
import { User } from "@supabase/supabase-js";
import { format } from "date-fns";

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
interface PlanSummaryProps {
  credits: Tables<"credits"> | null;
  subscription: SubscriptionWithProduct | null;
  user: User | null;
  products: ProductWithPrices[] | null;
}

const PlanSummary = ({
  credits,
  subscription,
  user,
  products,
}: PlanSummaryProps) => {
  const {
    products: subscriptionProduct,
    unit_amount,
    currency,
  } = subscription?.prices ?? {};

  if (!credits || !subscription || subscription.status !== "active") {
    return (
      <Card className="max-w-5xl">
        <CardContent className="px-5 py-4">
          <h3 className="pb-4 text-base font-semibold flex flex-wrap items-center gap-x-2">
            <span>Plan Summary</span>
            <Badge variant="secondary" className="bg-primary/10">
              No Plan
            </Badge>
          </h3>

          <div className="grid grid-cols-3 gap-4 md:grid-cols-8">
            <div className="col-span-5 flex flex-col pr-12">
              <div className="flex-1 text-xs font-normal flex w-full justify-between pb-1">
                <span className="text-sm font-normal text-muted-foreground ml-1 lowercase">
                  Image Generation credits left
                </span>
                <span className="text-sm font-medium">0 remaining</span>
              </div>
              <div className="mb-1 flex items-end">
                <Progress value={0} className="w-full h-2" />
              </div>
            </div>

            <div className="col-span-5 flex flex-col pr-12">
              <div className="flex-1 text-xs font-normal flex w-full justify-between pb-1">
                <span className="text-sm font-normal text-muted-foreground ml-1 lowercase">
                  Model Training credits left
                </span>
                <span className="text-sm font-medium">0 remaining</span>
              </div>
              <div className="mb-1 flex items-end">
                <Progress value={0} className="w-full h-2" />
              </div>
            </div>

            <div className="col-span-full flex flex-col">
              Please upgrade to a plan to continue using the app.
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-border px-4 py-3 bg-">
          <span className="flex flex-col gap-2 sm:ml-auto sm:flex-row">
            <PricingSheet
              user={user}
              products={products ?? []}
              subscription={subscription}
            />
          </span>
        </CardFooter>
      </Card>
    );
  } else {
    const imageGenerationCount = credits.image_generation_count ?? 0;
    const modelTrainingCount = credits.model_training_count ?? 0;
    const maxImageGenerationCount = credits.max_image_generation_count ?? 0;
    const maxModelTrainingCount = credits.max_model_training_count ?? 0;
    const priceString = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency!,
      minimumFractionDigits: 0,
    }).format((unit_amount || 0) / 100);
    return (
      <Card className="max-w-5xl">
        <CardContent className="px-5 py-4 pb-8">
          <h3 className="pb-4 text-base font-semibold flex flex-wrap items-center gap-x-2">
            <span>Plan Summary</span>
            <Badge variant="secondary" className="bg-primary/10">
              {subscriptionProduct?.name} Plan
            </Badge>
          </h3>

          <div className="grid grid-cols-3 gap-4 xl:grid-cols-8">
            <div className="col-span-5 flex flex-col sm:pr-12">
              <div className="flex-1 pb-2 text-xs font-normal md:pb-0 flex justify-between items-center">
                <span className="text-base font-semibold">
                  {imageGenerationCount} / {maxImageGenerationCount}
                </span>
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  image generation credits
                </span>
              </div>
              <div className="mb-1 flex items-end">
                <Progress
                  value={(imageGenerationCount / maxImageGenerationCount) * 100}
                  className="w-full h-2"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 xl:grid-cols-8 mt-4 ">
            <div className="col-span-full xl:col-span-5 flex flex-col sm:pr-12">
              <div className="flex-1 pb-2 text-xs font-normal md:pb-0 flex justify-between items-center">
                <span className="text-base font-semibold">
                  {modelTrainingCount} / {maxModelTrainingCount}
                </span>
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  model training credits
                </span>
              </div>
              <div className="mb-1 flex items-end">
                <Progress
                  value={(modelTrainingCount / maxModelTrainingCount) * 100}
                  className="w-full h-2"
                />
              </div>
            </div>

            <div className="col-span-full xl:col-span-3 flex flex-row justify-between flex-wrap">
              <div className="flex flex-col pb-2 xs:pb-0">
                <div className="flex-1 text-xs font-normal">Price/Month</div>
                <div className="flex-1 pt-1 text-sm font-medium">
                  {priceString}
                </div>
              </div>
              <div className="flex flex-col pb-2 xs:pb-0">
                <div className="flex-1 text-xs font-normal">
                  Included Credits
                </div>
                <div className="flex-1 pt-1 text-sm font-medium">
                  {maxImageGenerationCount}
                </div>
              </div>
              <div className="flex flex-col pb-2 xs:pb-0">
                <div className="flex-1 text-xs font-normal">Renewal Date</div>
                <div className="flex-1 pt-1 text-sm font-medium">
                  {format(
                    new Date(subscription.current_period_end),
                    "MMM d, yyyy"
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
};

export default PlanSummary;
