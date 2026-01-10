import { NextResponse } from 'next/server'
import { getAllCalculators } from '@/lib/calculator-data'
import { seoConfig } from '@/lib/seo-config'

export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

/**
 * Image Sitemap for Google Image Search
 * 
 * This sitemap helps Google discover and index calculator images for Google Image Search.
 * Improves visibility in image search results for calculator-related queries.
 * 
 * Submit to Google Search Console: https://calculatorhub.space/image-sitemap.xml
 */

interface ImageEntry {
  url: string
  title: string
  caption?: string
  location?: string
}

function generateImageSitemap() {
  const images: ImageEntry[] = []
  const calculators = getAllCalculators()

  // Add calculator-specific images (if they exist)
  calculators.forEach((calc) => {
    // Add featured image for each calculator
    images.push({
      url: `${seoConfig.baseUrl}/calculators/${calc.slug}/featured.png`,
      title: `${calc.name} - Free Online Calculator`,
      caption: calc.description,
      location: `${seoConfig.baseUrl}/calculators/${calc.slug}`,
    })

    // Add calculator icon/screenshot
    images.push({
      url: `${seoConfig.baseUrl}/calculators/${calc.slug}/screenshot.png`,
      title: `${calc.name} Screenshot`,
      caption: `How to use the ${calc.name.toLowerCase()}`,
      location: `${seoConfig.baseUrl}/calculators/${calc.slug}`,
    })
  })

  // Add logo and brand images
  images.push({
    url: `${seoConfig.baseUrl}/og-image.png`,
    title: 'CalculatorHub - Free Financial Calculators',
    caption: 'Access 60+ free online financial calculators',
    location: seoConfig.baseUrl,
  })

  images.push({
    url: `${seoConfig.baseUrl}/calculator.png`,
    title: 'CalculatorHub Logo',
    caption: 'Financial calculator tools',
    location: seoConfig.baseUrl,
  })

  // Build XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'

  // Group images by page URL
  const imagesByPage = new Map<string, ImageEntry[]>()
  images.forEach((img) => {
    const pageUrl = img.location || seoConfig.baseUrl
    if (!imagesByPage.has(pageUrl)) {
      imagesByPage.set(pageUrl, [])
    }
    imagesByPage.get(pageUrl)!.push(img)
  })

  // Generate URL entries with image references
  imagesByPage.forEach((imgs, pageUrl) => {
    xml += '  <url>\n'
    xml += `    <loc>${pageUrl}</loc>\n`
    
    imgs.forEach((img) => {
      xml += '    <image:image>\n'
      xml += `      <image:loc>${img.url}</image:loc>\n`
      if (img.title) {
        xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`
      }
      if (img.caption) {
        xml += `      <image:caption>${escapeXml(img.caption)}</image:caption>\n`
      }
      xml += '    </image:image>\n'
    })
    
    xml += '  </url>\n'
  })

  xml += '</urlset>'

  return xml
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const imageSitemap = generateImageSitemap()

  return new NextResponse(imageSitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
