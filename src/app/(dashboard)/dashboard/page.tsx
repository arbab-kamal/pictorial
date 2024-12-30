import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentImages } from "@/components/dashboard/RecentImages";
import { RecentModels } from "@/components/dashboard/RecentModels";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { getImages } from "@/app/actions/image-actions";
import { getCredits } from "@/app/actions/credit-actions";
import { fetchModels } from "@/app/actions/model-actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Pictoria AI",
  description: "Dashboard for Pictoria AI",
};

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/login");
  }

  const { data: models, count: modelCount } = await fetchModels();
  const { data: credits } = await getCredits();
  const { data: images } = await getImages();
  const imageCount = images?.length || 0;
  return (
    <div className="container mx-auto flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.user_metadata.full_name}
        </h2>
      </div>
      <StatsCards
        imageCount={imageCount}
        modelCount={modelCount}
        credits={Array.isArray(credits) ? credits[0] : credits}
      />
      <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
        <RecentImages images={images?.slice(0, 6) ?? []} />
        <div className="col-span-full xl:col-span-1 gap-6 xl:gap-0 xl:space-y-6 flex flex-col sm:flex-row xl:flex-col h-full">
          <QuickActions />
          <RecentModels models={models ? models.slice(0, 3) : []} />
        </div>
      </div>
    </div>
  );
}
