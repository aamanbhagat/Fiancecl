import Script from 'next/script'

interface CalculatorSchemaProps {
  name: string
  description: string
  category: string
  url: string
}

export function CalculatorSchema({ name, description, category, url }: CalculatorSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": name,
    "description": description,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": url,
    "datePublished": "2025-12-29",
    "dateModified": "2025-12-29",
    "author": {
      "@type": "Organization",
      "name": "CalculatorHub"
    }
  }

  return (
    <Script
      id={`schema-${category}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="afterInteractive"
    />
  )
}
