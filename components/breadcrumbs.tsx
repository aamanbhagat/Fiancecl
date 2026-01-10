'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import Script from 'next/script'

interface BreadcrumbItem {
    name: string
    href: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
    baseUrl?: string
}

/**
 * SEO-optimized Breadcrumb component with JSON-LD structured data
 * 
 * Usage:
 * <Breadcrumbs 
 *   items={[
 *     { name: 'Calculators', href: '/calculators' },
 *     { name: 'Mortgage Calculator', href: '/calculators/mortgage' }
 *   ]} 
 * />
 */
export function Breadcrumbs({ items, baseUrl = 'https://calculatorhub.space' }: BreadcrumbsProps) {
    // Build full breadcrumb list including Home
    const fullItems = [
        { name: 'Home', href: '/' },
        ...items
    ]

    // Generate JSON-LD structured data for BreadcrumbList
    const breadcrumbStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: fullItems.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${baseUrl}${item.href}`
        }))
    }

    return (
        <>
            {/* Structured Data for Breadcrumbs */}
            <Script
                id="breadcrumb-structured-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbStructuredData)
                }}
            />

            {/* Visual Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="mb-6">
                <ol
                    className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
                    itemScope
                    itemType="https://schema.org/BreadcrumbList"
                >
                    {fullItems.map((item, index) => {
                        const isLast = index === fullItems.length - 1

                        return (
                            <li
                                key={item.href}
                                className="flex items-center gap-1.5"
                                itemScope
                                itemProp="itemListElement"
                                itemType="https://schema.org/ListItem"
                            >
                                {index > 0 && (
                                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
                                )}

                                {isLast ? (
                                    <span
                                        className="font-medium text-foreground"
                                        itemProp="name"
                                        aria-current="page"
                                    >
                                        {item.name}
                                    </span>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className="transition-colors hover:text-foreground flex items-center gap-1"
                                        itemProp="item"
                                    >
                                        {index === 0 && <Home className="h-3.5 w-3.5" aria-hidden="true" />}
                                        <span itemProp="name">{item.name}</span>
                                    </Link>
                                )}
                                <meta itemProp="position" content={String(index + 1)} />
                            </li>
                        )
                    })}
                </ol>
            </nav>
        </>
    )
}

export default Breadcrumbs
