import Pricing from "@/components/landing-page/Pricing";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getUser, getProducts } from "@/lib/supabase/queries";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Navigation from "@/components/landing-page/Navigation";
import HeroSection from "@/components/landing-page/HeroSection";
import Features from "@/components/landing-page/Features";
import Testimonials from "@/components/landing-page/Testimonials";
import Faqs from "@/components/landing-page/Faqs";
import Footer from "@/components/landing-page/Footer";

export const metadata: Metadata = {
  title: "Pictoria AI",
  description:
    "Pictoria AI is a platform for creating and sharing images with AI",
};

export default async function Home() {
  const supabase = await createClient();

  // Here Promise.all() takes an array of promises and returns a single promise.  It's a performance optimization technique that runs all promises in parallel rather than sequentially. The results are destructured into three variables: user, products, and subscription
  const [user, products] = await Promise.all([
    getUser(supabase), // Gets the currently authenticated user
    getProducts(supabase), // Gets all active products with their prices
  ]);

  if (user) {
    return redirect("/dashboard");
  }

  return (
    <main className="flex flex-col min-h-screen items-center justify-center">
      <Navigation />
      <HeroSection />
      <Features />
      <Testimonials />

      <Pricing products={products ?? []} mostPopularProduct="pro" />
      <Faqs />

      <section className="w-full mt-16 py-16 bg-muted">
        <div className="container px-6 xs:px-8 sm:px-0 sm:mx-8 lg:mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h2 className="subHeading font-bold">
              Ready to Transform Your Photos?
            </h2>
            <p className="subText mt-4 text-center">
              Join thousands of users who are already creating amazing
              AI-generated images.
            </p>
            <Link href="/login?state=signup">
              <Button className="rounded-md text-base h-12">
                ✨ Create Your First AI Model ✨
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
