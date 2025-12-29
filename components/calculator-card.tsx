"use client"

import Link from "next/link"
import { memo } from "react"
import { DivideIcon as LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CalculatorCardProps {
  title: string
  description: string
  icon: React.ElementType
  href: string
  className?: string
}

export const CalculatorCard = memo(function CalculatorCard({ title, description, icon: Icon, href, className }: CalculatorCardProps) {
  return (
    <Link href={href} className="block h-full">
      <Card 
        className={cn(
          "h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50 hover:scale-[1.02]",
          "cursor-pointer relative group bg-transparent",
          className
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
        
        <CardHeader className="pb-2 pt-6">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-3 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
              <Icon className="h-7 w-7 text-primary transition-transform duration-300 group-hover:rotate-3" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="min-h-[70px] text-sm">{description}</CardDescription>
        </CardContent>
        <CardFooter className="pb-6">
          <Button 
            className="w-full transition-all duration-300 bg-transparent border border-primary/30 text-foreground hover:bg-primary hover:text-primary-foreground transform group-hover:translate-y-0 translate-y-0 opacity-90 group-hover:opacity-100 group-hover:shadow-md"
            aria-label={`Use ${title}`}
          >
            <span className="relative z-10 flex items-center gap-1">
              <span>Use Calculator</span>
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
})