"use client"

import Link from "next/link"
import { RainbowButton } from "../ui/rainbow-button"

export default function UpgradeBtn() {

  return (
    <Link href="/billing" className="inline-block w-full">
      <RainbowButton 
        className="w-full text-sm font-semibold rounded-md mb-2"
      >
        Upgrade Plan ✨
      </RainbowButton>
    </Link>
  )
}
