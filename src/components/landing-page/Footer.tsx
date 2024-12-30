import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="container mx-auto flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center border-t">
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} Pictoria AI Inc. All rights reserved.
      </p>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        <Link className="text-xs hover:underline underline-offset-4" href="#">
          Terms of Service
        </Link>
        <Link className="text-xs hover:underline underline-offset-4" href="#">
          Privacy
        </Link>
      </nav>
    </footer>
  );
};

export default Footer;
