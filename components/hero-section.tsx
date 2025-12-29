"use client"

import { useEffect, useState, memo } from "react"
import { Search } from "@/components/search"
import { cn } from "@/lib/utils"

// Memoized search placeholder to prevent layout shift
const SearchPlaceholder = memo(function SearchPlaceholder() {
  return (
    <div className="relative w-full">
      <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 bg-muted rounded-full" />
      <div className="h-9 xl:h-10 w-full rounded-md bg-muted animate-pulse" />
    </div>
  )
})

export function HeroSection() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <section className="relative overflow-hidden py-6 flex items-center justify-center">
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
      <div className="container relative z-10 max-w-screen-xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
            Financial Calculators for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">
              Smarter Decisions
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Access our suite of free financial calculators to plan your mortgage, 
            analyze investments, and make informed financial decisions with confidence.
          </p>
          
          {/* Hero search bar with placeholder to prevent CLS */}
          <div className={cn(
            "mt-6 w-full max-w-md mx-auto transition-all duration-500",
            "sm:max-w-lg md:max-w-xl lg:max-w-2xl"
          )}>
            {isMounted ? (
              <Search expandOnFocus={true} />
            ) : (
              <SearchPlaceholder />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}