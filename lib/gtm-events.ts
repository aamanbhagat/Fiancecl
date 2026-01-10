/**
 * Google Tag Manager Event Helper
 * 
 * Provides type-safe methods to push events to GTM dataLayer
 * for conversion tracking, custom events, and enhanced ecommerce.
 */

declare global {
  interface Window {
    dataLayer?: any[]
  }
}

export interface GTMEvent {
  event: string
  [key: string]: any
}

/**
 * Push a custom event to GTM dataLayer
 */
export function pushToDataLayer(eventData: GTMEvent) {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(eventData)

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('GTM Event:', eventData)
  }
}

/**
 * Track calculator usage event
 */
export function trackCalculatorUse(
  calculatorName: string,
  action: 'view' | 'calculate' | 'reset' | 'export',
  value?: number
) {
  pushToDataLayer({
    event: 'calculator_interaction',
    calculator_name: calculatorName,
    calculator_action: action,
    calculator_value: value,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track conversion goal completion
 */
export function trackConversion(
  goalName: string,
  value?: number,
  currency: string = 'USD'
) {
  pushToDataLayer({
    event: 'conversion',
    conversion_name: goalName,
    conversion_value: value || 0,
    currency: currency,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track social share action
 */
export function trackShare(
  platform: string,
  url: string,
  calculatorName?: string
) {
  pushToDataLayer({
    event: 'social_share',
    share_platform: platform,
    share_url: url,
    calculator_name: calculatorName,
  })
}

/**
 * Track user engagement time
 */
export function trackEngagement(
  pageName: string,
  timeSpent: number,
  scrollDepth?: number
) {
  pushToDataLayer({
    event: 'user_engagement',
    page_name: pageName,
    engagement_time_seconds: Math.round(timeSpent / 1000),
    scroll_depth_percentage: scrollDepth,
  })
}

/**
 * Track page view (use when Next.js router changes page)
 */
export function trackPageView(url: string, title: string) {
  pushToDataLayer({
    event: 'page_view',
    page_url: url,
    page_title: title,
    page_location: typeof window !== 'undefined' ? window.location.href : url,
  })
}

/**
 * Track error or exception
 */
export function trackError(
  errorMessage: string,
  errorLocation: string,
  fatal: boolean = false
) {
  pushToDataLayer({
    event: 'exception',
    error_message: errorMessage,
    error_location: errorLocation,
    fatal: fatal,
  })
}

/**
 * Track custom dimension/metric
 */
export function trackCustomMetric(
  metricName: string,
  metricValue: string | number | boolean
) {
  pushToDataLayer({
    event: 'custom_metric',
    metric_name: metricName,
    metric_value: metricValue,
  })
}

/**
 * Set user properties in GTM
 */
export function setUserProperties(properties: Record<string, any>) {
  pushToDataLayer({
    event: 'user_properties',
    ...properties,
  })
}

/**
 * Track outbound link click
 */
export function trackOutboundLink(url: string, linkText: string) {
  pushToDataLayer({
    event: 'outbound_link',
    link_url: url,
    link_text: linkText,
  })
}

/**
 * Track file download
 */
export function trackDownload(fileName: string, fileType: string) {
  pushToDataLayer({
    event: 'file_download',
    file_name: fileName,
    file_type: fileType,
  })
}
