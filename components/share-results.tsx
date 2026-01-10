'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Share2,
    Printer,
    Copy,
    Check,
    Twitter,
    Facebook,
    Linkedin,
    Mail,
    Link2
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useAnalytics } from '@/hooks/use-analytics'

interface ShareResultsProps {
    title: string
    description?: string
    url?: string
    onPrint?: () => void
    calculatorName?: string
}

/**
 * Share & Print Results Component
 * Allows users to share calculator results on social media or print them
 */
export function ShareResults({
    title,
    description = '',
    url,
    onPrint,
    calculatorName = 'unknown'
}: ShareResultsProps) {
    const [copied, setCopied] = useState(false)
    const { trackShare, trackPrint, trackCopyLink } = useAnalytics()

    // Get current URL if not provided
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(title)
    const encodedDescription = encodeURIComponent(description)

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
            // Track copy link event
            trackCopyLink(calculatorName)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handlePrint = () => {
        // Track print event
        trackPrint(calculatorName)
        if (onPrint) {
            onPrint()
        } else {
            window.print()
        }
    }

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: description,
                    url: shareUrl,
                })
                // Track native share event
                trackShare(calculatorName, 'native')
            } catch (err) {
                // User cancelled or error
            }
        }
    }

    return (
        <div className="flex items-center gap-2">
            {/* Print Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-2"
            >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
            </Button>

            {/* Share Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Share2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Share</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    {/* Native Share (Mobile) */}
                    {typeof navigator !== 'undefined' && 'share' in navigator && (
                        <>
                            <DropdownMenuItem onClick={handleNativeShare}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share...
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    )}

                    {/* Social Share Options */}
                    <DropdownMenuItem asChild>
                        <a 
                            href={shareLinks.twitter} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={() => trackShare(calculatorName, 'twitter')}
                        >
                            <Twitter className="h-4 w-4 mr-2" />
                            Share on Twitter
                        </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <a 
                            href={shareLinks.facebook} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={() => trackShare(calculatorName, 'facebook')}
                        >
                            <Facebook className="h-4 w-4 mr-2" />
                            Share on Facebook
                        </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <a 
                            href={shareLinks.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={() => trackShare(calculatorName, 'linkedin')}
                        >
                            <Linkedin className="h-4 w-4 mr-2" />
                            Share on LinkedIn
                        </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <a 
                            href={shareLinks.email}
                            onClick={() => trackShare(calculatorName, 'email')}
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            Email Results
                        </a>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Copy Link */}
                    <DropdownMenuItem onClick={handleCopyLink}>
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 mr-2 text-green-600" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Link2 className="h-4 w-4 mr-2" />
                                Copy Link
                            </>
                        )}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

interface SaveResultsProps {
    onSave?: () => void
    isSaved?: boolean
}

/**
 * Save Results Button
 * Allows users to save calculation results (placeholder for future implementation)
 */
export function SaveResults({ onSave, isSaved = false }: SaveResultsProps) {
    const [saved, setSaved] = useState(isSaved)

    const handleSave = () => {
        setSaved(!saved)
        if (onSave) onSave()
    }

    return (
        <Button
            variant={saved ? 'default' : 'outline'}
            size="sm"
            onClick={handleSave}
            className="gap-2"
        >
            {saved ? (
                <>
                    <Check className="h-4 w-4" />
                    <span className="hidden sm:inline">Saved</span>
                </>
            ) : (
                <>
                    <Copy className="h-4 w-4" />
                    <span className="hidden sm:inline">Save</span>
                </>
            )}
        </Button>
    )
}

export default ShareResults
