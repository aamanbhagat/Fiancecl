'use client'

/**
 * Performance monitoring utilities for Core Web Vitals tracking
 * Sends metrics to analytics for SEO monitoring
 */

export interface WebVitalsMetric {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  navigationType: string
}

// Core Web Vitals thresholds (Google's recommended values)
const THRESHOLDS = {
  // Largest Contentful Paint (LCP)
  LCP: { good: 2500, needsImprovement: 4000 },
  // First Input Delay (FID)
  FID: { good: 100, needsImprovement: 300 },
  // Cumulative Layout Shift (CLS)
  CLS: { good: 0.1, needsImprovement: 0.25 },
  // First Contentful Paint (FCP)
  FCP: { good: 1800, needsImprovement: 3000 },
  // Time to First Byte (TTFB)
  TTFB: { good: 800, needsImprovement: 1800 },
  // Interaction to Next Paint (INP)
  INP: { good: 200, needsImprovement: 500 },
}

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.needsImprovement) return 'needs-improvement'
  return 'poor'
}

/**
 * Send web vitals metrics to Google Analytics
 */
export function sendToAnalytics(metric: WebVitalsMetric) {
  // Send to Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      metric_rating: metric.rating,
      non_interaction: true,
    })
  }

  // Send to Vercel Analytics
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('track', 'Web Vitals', {
      metric: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
    })
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vitals:', {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
    })
  }
}

/**
 * Report Core Web Vitals using the web-vitals library
 * Call this from your root layout or _app component
 */
export function reportWebVitals(metric: any) {
  const webVitalsMetric: WebVitalsMetric = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    delta: metric.delta,
    navigationType: metric.navigationType || 'navigate',
  }

  sendToAnalytics(webVitalsMetric)
}

/**
 * Monitor page load performance
 */
export function monitorPageLoad() {
  if (typeof window === 'undefined') return

  window.addEventListener('load', () => {
    // Use Navigation Timing API
    const perfData = window.performance.timing
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
    const connectTime = perfData.responseEnd - perfData.requestStart
    const renderTime = perfData.domComplete - perfData.domLoading

    // Send custom metrics to analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', 'page_load_metrics', {
        event_category: 'Performance',
        page_load_time: Math.round(pageLoadTime),
        connect_time: Math.round(connectTime),
        render_time: Math.round(renderTime),
        non_interaction: true,
      })
    }
  })
}

/**
 * Track long tasks that block the main thread
 */
export function monitorLongTasks() {
  if (typeof window === 'undefined') return
  
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Report tasks longer than 50ms
        if (entry.duration > 50) {
          if ((window as any).gtag) {
            (window as any).gtag('event', 'long_task', {
              event_category: 'Performance',
              duration: Math.round(entry.duration),
              non_interaction: true,
            })
          }
        }
      }
    })

    observer.observe({ entryTypes: ['longtask'] })
  } catch (e) {
    // PerformanceObserver not supported
  }
}
