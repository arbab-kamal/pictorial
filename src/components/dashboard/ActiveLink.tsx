"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const ActiveLink = ({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={cn(
        className,
        "rounded-none",
        pathname === href
          ? "text-primary bg-primary/5"
          : "text-muted-foreground "
      )}
    >
      {children}
    </Link>
  );
};

export default ActiveLink;
