'use client'

import { useEffect } from 'react'
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals'
import { reportWebVitals } from '@/lib/performance-monitor'

/**
 * Web Vitals Reporter Component
 * 
 * Automatically tracks Core Web Vitals and sends to analytics:
 * - LCP (Largest Contentful Paint): Loading performance
 * - CLS (Cumulative Layout Shift): Visual stability
 * - FCP (First Contentful Paint): Initial render
 * - TTFB (Time to First Byte): Server response
 * - INP (Interaction to Next Paint): Responsiveness
 * 
 * Note: FID (First Input Delay) is deprecated in web-vitals v3+, replaced by INP
 */
export function WebVitals() {
  useEffect(() => {
    // Register all Core Web Vitals metrics
    onCLS(reportWebVitals)
    onFCP(reportWebVitals)
    onLCP(reportWebVitals)
    onTTFB(reportWebVitals)
    onINP(reportWebVitals)
  }, [])

  // This component doesn't render anything
  return null
}
