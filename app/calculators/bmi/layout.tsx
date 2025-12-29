import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "BMI Calculator | CalculateHub",
  description: "Calculate your Body Mass Index (BMI), assess weight categories, and track your fitness progress with our free BMI calculator.",
  keywords: "BMI calculator, body mass index calculator, weight calculator, health calculator, fitness calculator, weight category calculator",
  openGraph: {
    title: "BMI Calculator | CalculateHub",
    description: "Calculate your Body Mass Index (BMI) and determine your weight category based on height and weight.",
    type: "website",
    url: "https://calculatorhub.space/calculators/bmi",
    images: [
      {
        url: "https://images.unsplash.com/photo-1535914254981-b5012eebbd15?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "BMI Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "BMI Calculator | CalculateHub",
    description: "Calculate your Body Mass Index (BMI) and determine your weight category based on height and weight.",
    images: ["https://images.unsplash.com/photo-1535914254981-b5012eebbd15?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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

export default function BMICalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/bmi" 
      />
      {children}
    </>
  )
}