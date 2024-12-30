"use client";
import React, { useEffect, useState } from "react";
import Logo from "../Logo";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "../ui/sheet";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const NavItems = () => (
    <>
      <Link
        className="text-sm font-medium hover:underline underline-offset-4"
        href="#features"
      >
        Features
      </Link>
      <Link
        className="text-sm font-medium hover:underline underline-offset-4"
        href="#pricing"
      >
        Pricing
      </Link>
      <Link
        className="text-sm font-medium hover:underline underline-offset-4"
        href="#faqs"
      >
        FAQs
      </Link>
      <Link
        className="text-sm font-medium hover:underline underline-offset-4"
        href="/login?state=signup"
      >
        <Button>Sign up</Button>
      </Link>
    </>
  );

  return (
    <div
      className={cn(
        "w-full bg-background/60 backdrop-blur-md fixed top-0 px-8 py-4 z-50 shadow-xl overflow-hidden",
        isScrolled
          ? "max-w-[90vw] bg-background shadow-md rounded-full container mx-auto transition-all duration-300 mt-4"
          : ""
      )}
    >
      <header
        className={cn(
          `container mx-auto flex items-center`,
          isScrolled ? "rounded-full" : ""
        )}
      >
        <Logo />
        
        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex items-center justify-center gap-6">
          <NavItems />
        </nav>

        {/* Mobile Navigation */}
        <div className="ml-auto md:hidden overflow-hidden">
          <Sheet>
            <SheetTrigger asChild>
                <Menu className="h-6 w-6" strokeWidth={1.5} />
            </SheetTrigger>
            <SheetContent>
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <nav className="flex flex-col gap-4 mt-12">
                <NavItems />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  );
};

export default Navigation;
