"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function NotFound() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Handle .txt extensions by redirecting to the proper path
    if (pathname?.endsWith('.txt')) {
      const newPath = pathname.replace('.txt', '/')
      router.replace(newPath)
      return
    }

    // If not a .txt path, redirect to home after 5 seconds
    const timeout = setTimeout(() => {
      router.push('/')
    }, 5000)

    return () => clearTimeout(timeout)
  }, [pathname, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="text-muted-foreground">
          Redirecting you to the homepage in a few seconds...
        </p>
      </div>
    </div>
  )
}