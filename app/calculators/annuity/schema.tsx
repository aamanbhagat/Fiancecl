import { Metadata } from 'next';

// Define the JSON-LD schema for the annuity calculator
export function generateAnnuitySchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Calculator tool schema
      {
        '@type': 'SoftwareApplication',
        'name': 'Annuity Calculator',
        'description': 'Calculate the present and future values of your annuity payments, and understand how your money grows over time with different payment and interest scenarios.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Present value calculation',
          'Future value projection',
          'Ordinary and due annuity options',
          'Multiple payment frequency options',
          'Inflation adjustment',
          'Tax impact modeling',
          'Interactive growth charts',
          'Payment schedule breakdown',
          'PDF export functionality'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/annuity`,
            'description': 'Calculate annuity present and future values'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Annuity'
          }
        }
      },
      
      // BreadcrumbList schema with simplified structure
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
            'name': 'Annuity Calculator',
            'item': `${baseUrl}/calculators/annuity`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is an annuity?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'An annuity is a financial contract between you and an insurance company designed to provide a guaranteed income stream. You make a lump sum payment or series of payments, and in return, the insurer commits to regular disbursements beginning either immediately or at some point in the future. Annuities serve as a crucial retirement planning tool by addressing one of retirees\' biggest concerns: outliving their savings.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between ordinary annuity and annuity due?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'An ordinary annuity (also called annuity immediate) has payments occurring at the end of each period. This is common for loans, mortgages, and most rental payments. An annuity due features payments at the beginning of each period, which is typical for leases and insurance premiums. Annuity due typically results in slightly higher present and future values because payments are made earlier, allowing for additional time for interest to compound.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does inflation affect annuity payments?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Inflation represents one of the greatest threats to annuity income, particularly for fixed payouts that remain constant over decades while the cost of living increases. For example, a $2,000 monthly annuity payment would have the purchasing power of only $1,107 after 20 years with 3% annual inflation. To combat this, consider inflation-protected annuities that provide increasing payments over time, though these start with lower initial payments.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are the tax implications of annuities?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The tax treatment of annuities depends on how they\'re funded. Annuities purchased with qualified funds (IRA, 401(k)) result in payments that are fully taxable as ordinary income. Non-qualified annuities (purchased with after-tax money) generate partially taxable payments based on an exclusion ratio. Annuities funded through Roth IRAs may provide tax-free payments if annuitized after age 59½ and the account has been open for more than 5 years.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are the primary types of annuities?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The main types of annuities are: 1) Fixed Annuities - offer guaranteed interest rates and predictable income payments; 2) Variable Annuities - payments fluctuate based on the performance of underlying investments; 3) Indexed Annuities - returns tied to market index performance with downside protection; and 4) Immediate vs. Deferred Annuities - begin payments right away or after a specified accumulation period. Each type serves different needs and risk tolerances.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Annuity Calculator | Calculate Present & Future Value',
  description: 'Use our free annuity calculator to determine the present and future values of your payments, with options for inflation adjustment, tax impact, and different payment frequencies.',
  keywords: [
    'annuity calculator',
    'present value calculator',
    'future value calculator',
    'retirement income calculator',
    'annuity due calculator',
    'ordinary annuity calculator',
    'income planning',
    'annuity payments',
    'inflation adjusted annuity',
    'retirement planning tool'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function AnnuitySchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateAnnuitySchema('https://calculatorhub.space/calculators/annuity')),
      }}
    />
  );
}