'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Twitter, Linkedin, Mail } from 'lucide-react'

export interface Author {
    name: string
    role: string
    bio: string
    image?: string
    twitter?: string
    linkedin?: string
    email?: string
}

// Predefined authors for the site
export const authors: Record<string, Author> = {
    'Sarah Johnson': {
        name: 'Sarah Johnson',
        role: 'Senior Financial Analyst',
        bio: 'Sarah is a certified financial planner with over 10 years of experience in mortgage lending and real estate. She specializes in helping first-time homebuyers navigate the complex world of home financing.',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        twitter: 'https://twitter.com/calculatorhub',
        linkedin: 'https://linkedin.com/company/calculatorhub',
    },
    'David Chen': {
        name: 'David Chen',
        role: 'Personal Finance Expert',
        bio: 'David is a debt management specialist who has helped thousands of clients become debt-free. He previously worked as a credit counselor and now shares his expertise through educational content.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        twitter: 'https://twitter.com/calculatorhub',
        linkedin: 'https://linkedin.com/company/calculatorhub',
    },
    'Michael Rodriguez': {
        name: 'Michael Rodriguez',
        role: 'Retirement Planning Specialist',
        bio: 'Michael is a CFP® professional specializing in retirement planning and 401(k) optimization. With 15 years in the financial services industry, he helps clients maximize their retirement savings.',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
        twitter: 'https://twitter.com/calculatorhub',
        linkedin: 'https://linkedin.com/company/calculatorhub',
    },
}

interface AuthorBioProps {
    authorName?: string
    author?: Author
    publishDate?: string
}

/**
 * SEO-optimized Author Bio component with structured data
 * Displays author information and links to social profiles
 */
export function AuthorBio({ authorName, author: authorProp, publishDate }: AuthorBioProps) {
    const author = authorProp || (authorName ? authors[authorName] : null)

    if (!author) {
        return null
    }

    // Generate Person structured data for SEO
    const personStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: author.name,
        jobTitle: author.role,
        description: author.bio,
        image: author.image,
        sameAs: [
            author.twitter,
            author.linkedin,
        ].filter(Boolean),
        worksFor: {
            '@type': 'Organization',
            name: 'CalculatorHub',
            url: 'https://calculatorhub.space',
        },
    }

    return (
        <>
            {/* Author Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(personStructuredData),
                }}
            />

            {/* Visual Author Bio */}
            <div className="mt-12 border-t pt-8">
                <div className="flex items-start gap-4 sm:gap-6">
                    {/* Author Image */}
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary/20">
                        {author.image ? (
                            <Image
                                src={author.image}
                                alt={`Photo of ${author.name}`}
                                fill
                                className="object-cover"
                                loading="lazy"
                                sizes="80px"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-2xl font-bold text-primary">
                                {author.name.charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Author Details */}
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <h3 className="text-lg font-bold">{author.name}</h3>
                                <p className="text-sm text-muted-foreground">{author.role}</p>
                            </div>

                            {/* Social Links */}
                            <div className="flex items-center gap-2">
                                {author.twitter && (
                                    <Link
                                        href={author.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-full hover:bg-muted transition-colors"
                                        aria-label={`Follow ${author.name} on Twitter`}
                                    >
                                        <Twitter className="h-4 w-4" />
                                    </Link>
                                )}
                                {author.linkedin && (
                                    <Link
                                        href={author.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-full hover:bg-muted transition-colors"
                                        aria-label={`Connect with ${author.name} on LinkedIn`}
                                    >
                                        <Linkedin className="h-4 w-4" />
                                    </Link>
                                )}
                                {author.email && (
                                    <Link
                                        href={`mailto:${author.email}`}
                                        className="p-2 rounded-full hover:bg-muted transition-colors"
                                        aria-label={`Email ${author.name}`}
                                    >
                                        <Mail className="h-4 w-4" />
                                    </Link>
                                )}
                            </div>
                        </div>

                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                            {author.bio}
                        </p>

                        {publishDate && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                Published on {publishDate}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default AuthorBio
