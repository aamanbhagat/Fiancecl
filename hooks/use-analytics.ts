'use client'

import { useCallback } from 'react'

export type AnalyticsEvent = 
  | 'calculator_calculation'
  | 'calculator_export_pdf'
  | 'calculator_reset'
  | 'calculator_toggle_advanced'
  | 'related_calculator_click'
  | 'calculator_share'
  | 'calculator_print'
  | 'calculator_copy_link'
  | 'calculator_view'
  | 'calculator_engagement'
  | 'conversion_goal'

interface AnalyticsEventData {
  calculator_name: string
  [key: string]: string | number | boolean
}

export function useAnalytics() {
  const trackEvent = useCallback((event: AnalyticsEvent, data: AnalyticsEventData) => {
    // Track to Vercel Analytics if available
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', event, data)
    }

    // Track to Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, {
        event_category: 'Calculator',
        event_label: data.calculator_name,
        ...data
      })
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event, data)
    }
  }, [])

  const trackCalculation = useCallback((calculatorName: string, values: Record<string, any>) => {
    trackEvent('calculator_calculation', {
      calculator_name: calculatorName,
      ...values
    })
  }, [trackEvent])

  const trackExport = useCallback((calculatorName: string, format: string = 'pdf') => {
    trackEvent('calculator_export_pdf', {
      calculator_name: calculatorName,
      export_format: format
    })
  }, [trackEvent])

  const trackReset = useCallback((calculatorName: string) => {
    trackEvent('calculator_reset', {
      calculator_name: calculatorName
    })
  }, [trackEvent])

  const trackRelatedClick = useCallback((from: string, to: string) => {
    trackEvent('related_calculator_click', {
      calculator_name: from,
      destination: to
    })
  }, [trackEvent])

  const trackShare = useCallback((calculatorName: string, platform: string) => {
    trackEvent('calculator_share', {
      calculator_name: calculatorName,
      share_platform: platform
    })
  }, [trackEvent])

  const trackPrint = useCallback((calculatorName: string) => {
    trackEvent('calculator_print', {
      calculator_name: calculatorName
    })
  }, [trackEvent])

  const trackCopyLink = useCallback((calculatorName: string) => {
    trackEvent('calculator_copy_link', {
      calculator_name: calculatorName
    })
  }, [trackEvent])

  const trackView = useCallback((calculatorName: string) => {
    trackEvent('calculator_view', {
      calculator_name: calculatorName,
      timestamp: Date.now()
    })
  }, [trackEvent])

  const trackEngagement = useCallback((calculatorName: string, timeSpent: number) => {
    trackEvent('calculator_engagement', {
      calculator_name: calculatorName,
      time_spent_seconds: Math.round(timeSpent / 1000),
      engagement_level: timeSpent > 60000 ? 'high' : timeSpent > 30000 ? 'medium' : 'low'
    })
  }, [trackEvent])

  const trackConversion = useCallback((goalName: string, value?: number) => {
    trackEvent('conversion_goal', {
      calculator_name: goalName,
      conversion_type: goalName,
      conversion_value: value || 0
    })
  }, [trackEvent])

  return {
    trackEvent,
    trackCalculation,
    trackExport,
    trackReset,
    trackRelatedClick,
    trackShare,
    trackPrint,
    trackCopyLink,
    trackView,
    trackEngagement,
    trackConversion
  }
}
