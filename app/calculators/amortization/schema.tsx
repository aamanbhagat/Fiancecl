import { Metadata } from 'next';

// Define the JSON-LD schema for the amortization calculator
export function generateAmortizationSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Calculator tool schema
      {
        '@type': 'SoftwareApplication',
        'name': 'Amortization Calculator',
        'description': 'Calculate loan payments, view amortization schedules, and analyze different loan scenarios with our advanced calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Loan payment calculation',
          'Complete amortization schedule',
          'Extra payment analysis',
          'Interactive charts and graphs',
          'Adjustable rate modeling',
          'Export to CSV and PDF'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/amortization`,
            'description': 'Calculate loan payments and generate amortization schedules'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Loan Amortization'
          }
        }
      },
      
      // BreadcrumbList schema with properly formatted structure
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': `${baseUrl}/`
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Calculators',
            'item': `${baseUrl}/calculators`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': 'Amortization Calculator',
            'item': `${baseUrl}/calculators/amortization`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is amortization?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Amortization is the process of paying off a debt (like a mortgage or car loan) through regular scheduled payments that include both principal and interest. While your payment remains constant, the components within that payment shift over time, with more going toward principal and less toward interest.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How is a loan payment calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The payment amount in an amortizing loan is calculated using the formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1], where P = Payment amount, L = Loan principal, c = Monthly interest rate (annual rate ÷ 12), and n = Total number of payments (years × 12).'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is an amortization schedule?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'An amortization schedule is a complete table of periodic loan payments showing the amount of principal and interest that comprise each payment until the loan is paid off. It typically includes payment number/date, payment amount, principal portion, interest portion, remaining balance, and cumulative interest paid.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do extra payments affect my loan?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Adding even a small amount to your regular monthly payment can significantly reduce your loan term and total interest. For example, on a $250,000, 30-year loan at 5.75%, an extra $100/month can save 4.3 years and over $51,000 in interest. Extra payments made early in your loan term have the greatest impact on interest savings.'
            }
          },
          {
            '@type': 'Question',
            'name': 'When should I consider refinancing my loan?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Consider refinancing when interest rates drop by at least 0.75-1% from your current rate, you plan to stay in your home long enough to recoup closing costs, you can maintain or improve your loan term, your credit score has significantly improved, or you want to change from an adjustable to fixed rate loan.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Amortization Calculator | Calculate Loan Payments and Schedules',
  description: 'Calculate your loan payments, view detailed amortization schedules, and analyze how extra payments can save you money with our free amortization calculator.',
  keywords: [
    'amortization calculator',
    'loan payment calculator',
    'mortgage calculator',
    'loan amortization schedule',
    'extra payment calculator',
    'loan interest calculator',
    'refinance calculator',
    'mortgage amortization',
    'loan payoff calculator',
    'principal and interest calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function AmortizationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateAmortizationSchema('https://calculatorshub.store/calculators/amortization')),
      }}
    />
  );
}