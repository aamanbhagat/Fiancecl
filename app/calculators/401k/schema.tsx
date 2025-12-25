import { Metadata } from 'next';

// Define the JSON-LD schema for the 401k calculator
export function generate401kSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Calculator tool schema
      {
        '@type': 'SoftwareApplication',
        'name': '401(k) Calculator',
        'description': 'Project your retirement savings with our comprehensive 401(k) calculator, including employer matching contributions and investment growth projections.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Retirement savings projection',
          'Employer match calculation',
          'Investment return modeling',
          'Interactive charts and visualizations',
          'Inflation adjustment', 
          'Contribution strategy analysis',
          'Tax savings estimation',
          'Catch-up contribution planning',
          'PDF export functionality',
          'Multiple scenario comparison'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/401k`,
            'description': 'Calculate 401(k) retirement savings and employer match benefits'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': '401(k) Retirement Analysis'
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
            'name': '401(k) Calculator',
            'item': `${baseUrl}/calculators/401k`
          }
        ]
      },
      
      // FAQPage schema for the informational content - this is valuable for SEO
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is a 401(k) plan?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'A 401(k) plan is an employer-sponsored retirement account that allows employees to contribute a portion of their wages on a pre-tax basis. These contributions, along with any employer matching contributions, grow tax-deferred until retirement. Many employers offer matching contributions, essentially providing "free money" toward your retirement savings.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How much should I contribute to my 401(k)?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'At minimum, you should contribute enough to get your full employer match (typically 3-6% of your salary). Financial experts often recommend saving 10-15% of your income for retirement. Our calculator can help you see how different contribution amounts affect your retirement savings over time.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is employer matching?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Employer matching is when your company contributes additional money to your 401(k) based on your contributions. A common arrangement is a 50% match on the first 6% of salary you contribute. For example, if you earn $50,000 and contribute 6% ($3,000), your employer would add $1,500 (50% of $3,000). Not contributing enough to get the full match means leaving free money on the table.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do catch-up contributions work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'If you\'re age 50 or older, you can make additional "catch-up" contributions to your 401(k) beyond the standard annual limit. For 2023, the catch-up contribution limit is $7,500, allowing older workers to contribute a total of $30,000 annually ($22,500 standard limit plus $7,500 catch-up). This feature helps those closer to retirement accelerate their savings.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do fees affect my 401(k) growth?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Even small differences in fees can have a significant impact on your 401(k) balance over time. For instance, a 1% increase in annual fees could reduce your final balance by 20% or more over a 30-year period. Our calculator allows you to account for management fees so you can see their long-term effect on your retirement savings.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: '401(k) Calculator | Retirement Savings Estimator',
  description: 'Project your retirement savings with our comprehensive 401(k) calculator, including employer matching contributions and investment growth projections.',
  keywords: [
    '401k calculator',
    'retirement savings calculator',
    'employer match calculator',
    'retirement planning tool',
    '401k contribution calculator',
    'retirement investment calculator',
    'tax-advantaged savings calculator',
    'retirement growth calculator',
    '401k fees calculator',
    'catch-up contribution calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function Schema401k() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generate401kSchema('https://calculatorshub.store/calculators/401k')),
      }}
    />
  );
}