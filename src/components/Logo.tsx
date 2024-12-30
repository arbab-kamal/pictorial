import React from 'react'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Sparkles className="size-8" strokeWidth={1.5} />
      <span className="text-lg font-semibold">Pictoria AI</span>
    </Link>
  )
}

export default Logo