'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent
    }
}

/**
 * PWA Install Prompt Component
 * Shows a banner prompting users to install the app on their device
 */
export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showPrompt, setShowPrompt] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
            return
        }

        // Check if iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        setIsIOS(isIOSDevice)

        // Check if user has dismissed the prompt before
        const dismissed = localStorage.getItem('pwa-prompt-dismissed')
        if (dismissed) {
            const dismissedTime = parseInt(dismissed, 10)
            // Don't show for 7 days after dismissal
            if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
                return
            }
        }

        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
            // Prevent Chrome 67+ from automatically showing the prompt
            e.preventDefault()
            // Store the event for later use
            setDeferredPrompt(e)
            // Show the custom install prompt after a delay
            setTimeout(() => setShowPrompt(true), 3000)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        // For iOS, show prompt after delay
        if (isIOSDevice) {
            setTimeout(() => setShowPrompt(true), 5000)
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        // Show the install prompt
        deferredPrompt.prompt()

        // Wait for user choice
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt')
            setIsInstalled(true)
        }

        // Clear the deferred prompt
        setDeferredPrompt(null)
        setShowPrompt(false)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
    }

    // Don't show if already installed or prompt is hidden
    if (isInstalled || !showPrompt) {
        return null
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="relative bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg shadow-2xl p-4">
                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
                    aria-label="Dismiss install prompt"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
                        <Smartphone className="h-6 w-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">Install CalculatorHub</h3>
                        <p className="text-xs text-primary-foreground/80 mt-1">
                            {isIOS
                                ? "Tap Share → Add to Home Screen"
                                : "Add to your home screen for quick access to all calculators, even offline!"}
                        </p>

                        {/* Install button (non-iOS) */}
                        {!isIOS && deferredPrompt && (
                            <Button
                                onClick={handleInstall}
                                size="sm"
                                variant="secondary"
                                className="mt-3 w-full"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Install App
                            </Button>
                        )}

                        {/* iOS instructions */}
                        {isIOS && (
                            <div className="mt-3 text-xs bg-white/10 rounded p-2">
                                <ol className="space-y-1">
                                    <li>1. Tap the <strong>Share</strong> button</li>
                                    <li>2. Scroll and tap <strong>Add to Home Screen</strong></li>
                                    <li>3. Tap <strong>Add</strong></li>
                                </ol>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PWAInstallPrompt
