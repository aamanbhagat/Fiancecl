import { Metadata } from 'next';

// Define the JSON-LD schema for the auto lease calculator
export function generateAutoLeaseSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Auto Lease Calculator',
        'description': 'Calculate your monthly lease payments and understand the total cost of leasing a vehicle with our comprehensive auto lease calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Monthly lease payment calculation',
          'Depreciation and finance charge breakdown',
          'Total lease cost analysis',
          'Comparison of different lease terms',
          'Payment component visualization',
          'Inclusion of taxes and fees',
          'Residual value calculation',
          'Money factor to APR conversion',
          'Multiple term comparison',
          'PDF export functionality'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/auto-lease`,
            'description': 'Calculate your monthly auto lease payments and total lease cost'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Auto Lease'
          }
        }
      },
      
      // Simplified BreadcrumbList schema
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
            'name': 'Auto Lease Calculator',
            'item': `${baseUrl}/calculators/auto-lease`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How is a lease payment calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'A lease payment consists of three main components: depreciation, finance charge, and taxes. Depreciation is the difference between the vehicle\'s negotiated price (adjusted capitalized cost) and its expected value at lease end (residual value), divided by the number of months in the lease. The finance charge is calculated by multiplying the money factor (interest rate equivalent) by the sum of the adjusted capitalized cost and residual value. Sales tax is then applied to the payment according to your local tax laws.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is a money factor and how does it relate to interest rate?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The money factor is a way of expressing the interest charged on a lease. To convert a money factor to an equivalent APR (annual percentage rate), multiply it by 2400. For example, a money factor of 0.00125 equals a 3% APR (0.00125 × 2400 = 3%). A lower money factor means a lower finance charge on your lease. Consumers with excellent credit typically qualify for money factors equivalent to 1-3% APR.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is residual value and how does it affect my lease payment?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Residual value represents the projected worth of the vehicle at the end of the lease term, typically expressed as a percentage of the vehicle\'s MSRP (Manufacturer\'s Suggested Retail Price). A higher residual value percentage means the vehicle is expected to retain more of its value, which reduces the depreciation amount you pay during the lease and results in lower monthly payments. Luxury vehicles and models known for reliability often have higher residual values than average vehicles.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What fees should I expect when leasing a vehicle?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Common lease fees include: 1) Acquisition fee ($395-$995) charged at lease inception; 2) Disposition fee ($300-$400) charged when returning the vehicle; 3) Documentation fee (varies by dealer); 4) Registration and title fees; 5) Security deposit (sometimes waived for qualified lessees); 6) Excess mileage fees (typically $0.15-$0.30 per mile over allowance); and 7) Excess wear-and-tear charges. Make sure to request a complete breakdown of all fees before signing a lease agreement.'
            }
          },
          {
            '@type': 'Question',
            'name': 'When is leasing better than buying a vehicle?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Leasing typically makes more sense than buying when: 1) You prefer driving newer vehicles with the latest technology every 2-3 years; 2) You drive fewer than 15,000 miles per year; 3) You use the vehicle for business (possible tax advantages); 4) You prefer predictable costs with minimal repair concerns; 5) You want lower monthly payments than with a purchase loan; or 6) You\'re leasing a vehicle with a high residual value. However, buying is usually better for high-mileage drivers, those who modify their vehicles, or those who keep vehicles long-term.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Auto Lease Calculator | Calculate Car Lease Payments & Costs',
  description: 'Calculate your monthly lease payments, understand payment components, and analyze the total cost of leasing a vehicle with our free auto lease calculator.',
  keywords: [
    'auto lease calculator',
    'car lease calculator',
    'lease payment calculator',
    'vehicle lease cost',
    'money factor calculator',
    'residual value calculator',
    'lease vs buy comparison',
    'monthly lease payment',
    'lease depreciation calculator',
    'total lease cost calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function AutoLeaseSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateAutoLeaseSchema('https://calculatorhub.space/calculators/auto-lease')),
      }}
    />
  );
}