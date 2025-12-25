import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Student Loan Calculator | CalculateHub",
  description: "Calculate student loan payments, analyze repayment options, and plan your education debt strategy with our free student loan calculator.",
  keywords: "student loan calculator, education loan calculator, college loan calculator, student debt calculator, loan repayment calculator, student loan interest calculator",
  openGraph: {
    title: "Student Loan Calculator | CalculateHub",
    description: "Calculate your student loan payments and understand repayment options to manage your education debt.",
    type: "website",
    url: "https://calculatorshub.store/calculators/student-loan",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Student Loan Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Loan Calculator | CalculateHub",
    description: "Calculate your student loan payments and understand repayment options to manage your education debt.",
    images: ["https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  // Remove this problematic property entirely
  // alternates: {
  //   canonical: "https://calculatorshub.store/calculators/student-loan"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function StudentLoanCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/student-loan" 
      />
      {children}
    </>
  )
}