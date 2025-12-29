'use client'

import { useCallback } from 'react'

export type AnalyticsEvent = 
  | 'calculator_calculation'
  | 'calculator_export_pdf'
  | 'calculator_reset'
  | 'calculator_toggle_advanced'
  | 'related_calculator_click'

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

  return {
    trackEvent,
    trackCalculation,
    trackExport,
    trackReset,
    trackRelatedClick
  }
}
