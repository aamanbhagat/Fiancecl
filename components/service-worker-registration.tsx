'use client'

import { useEffect } from 'react'

/**
 * Service Worker Registration Component
 * Registers the service worker for PWA offline functionality
 */
export function ServiceWorkerRegistration() {
    useEffect(() => {
        // Only register in production and if service worker is supported
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // Register after page load for better performance
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then((registration) => {
                        console.log('[PWA] Service Worker registered successfully:', registration.scope)

                        // Check for updates periodically
                        setInterval(() => {
                            registration.update()
                        }, 60 * 60 * 1000) // Check every hour
                    })
                    .catch((error) => {
                        console.log('[PWA] Service Worker registration failed:', error)
                    })
            })
        }
    }, [])

    return null
}

export default ServiceWorkerRegistration
