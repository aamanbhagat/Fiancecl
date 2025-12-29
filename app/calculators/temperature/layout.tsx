import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Temperature Converter Calculator | CalculateHub",
  description: "Convert between Celsius, Fahrenheit, Kelvin and more with our free temperature conversion calculator. Simple, fast, and accurate temperature conversions.",
  keywords: "temperature calculator, temperature converter, celsius to fahrenheit, fahrenheit to celsius, kelvin converter, temperature conversion tool",
  openGraph: {
    title: "Temperature Converter Calculator | CalculateHub",
    description: "Convert between different temperature units quickly and accurately with our easy-to-use calculator.",
    type: "website",
    url: "https://calculatorhub.space/calculators/temperature",
    images: [
      {
        url: "https://images.unsplash.com/photo-1594761051613-8093ab52e2a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Temperature Converter Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Temperature Converter Calculator | CalculateHub",
    description: "Convert between different temperature units quickly and accurately with our easy-to-use calculator.",
    images: ["https://images.unsplash.com/photo-1594761051613-8093ab52e2a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function TemperatureCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/temperature" 
      />
      {children}
    </>
  )
}