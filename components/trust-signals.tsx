'use client'

import { Calendar, CheckCircle, RefreshCw } from 'lucide-react'

interface LastUpdatedProps {
    date: string
    version?: string
    className?: string
}

/**
 * Last Updated Component
 * Displays when a calculator was last updated for trust and SEO
 */
export function LastUpdated({ date, version, className = '' }: LastUpdatedProps) {
    return (
        <div className={`flex flex-wrap items-center gap-4 text-sm text-muted-foreground ${className}`}>
            <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Last updated: <time dateTime={date}>{date}</time></span>
            </div>
            {version && (
                <div className="flex items-center gap-1.5">
                    <RefreshCw className="h-4 w-4" />
                    <span>Version {version}</span>
                </div>
            )}
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span>Verified formulas</span>
            </div>
        </div>
    )
}

interface CalculatorSourcesProps {
    sources: {
        name: string
        url?: string
    }[]
    className?: string
}

/**
 * Calculator Sources Component
 * Shows source citations for financial formulas
 */
export function CalculatorSources({ sources, className = '' }: CalculatorSourcesProps) {
    return (
        <div className={`mt-6 p-4 bg-muted/50 rounded-lg border text-sm ${className}`}>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Sources & Methodology
            </h4>
            <p className="text-muted-foreground mb-3">
                Our calculations are based on industry-standard formulas and data from:
            </p>
            <ul className="space-y-1">
                {sources.map((source, index) => (
                    <li key={index} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {source.url ? (
                            <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                {source.name}
                            </a>
                        ) : (
                            <span>{source.name}</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}

// Common sources for different calculator types
export const calculatorSources = {
    mortgage: [
        { name: 'Federal Reserve Economic Data (FRED)', url: 'https://fred.stlouisfed.org/' },
        { name: 'Consumer Financial Protection Bureau (CFPB)', url: 'https://www.consumerfinance.gov/' },
        { name: 'Freddie Mac Primary Mortgage Market Survey' },
    ],
    investment: [
        { name: 'Securities and Exchange Commission (SEC)', url: 'https://www.sec.gov/' },
        { name: 'S&P 500 Historical Data' },
        { name: 'Federal Reserve Interest Rates' },
    ],
    retirement: [
        { name: 'IRS Publication 590-A (IRAs)', url: 'https://www.irs.gov/publications/p590a' },
        { name: 'Social Security Administration', url: 'https://www.ssa.gov/' },
        { name: 'Department of Labor (401k limits)', url: 'https://www.dol.gov/' },
    ],
    tax: [
        { name: 'Internal Revenue Service (IRS)', url: 'https://www.irs.gov/' },
        { name: 'Tax Foundation', url: 'https://taxfoundation.org/' },
        { name: 'State Tax Departments' },
    ],
    loan: [
        { name: 'Federal Reserve Board Regulation Z' },
        { name: 'Truth in Lending Act (TILA)' },
        { name: 'Consumer Financial Protection Bureau', url: 'https://www.consumerfinance.gov/' },
    ],
}

export default LastUpdated
