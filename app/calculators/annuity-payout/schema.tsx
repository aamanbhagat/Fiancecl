import { Metadata } from 'next';

// Define the JSON-LD schema for the annuity payout calculator
export function generateAnnuityPayoutSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Annuity Payout Calculator',
        'description': 'Calculate how much regular income you can receive from your retirement savings or investment portfolio using our comprehensive annuity payout calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Lump sum to income conversion',
          'Multiple payment frequency options',
          'Inflation adjustment modeling',
          'Tax impact calculation',
          'Ordinary and due annuity options',
          'Interactive payment breakdown charts',
          'Detailed payment schedule visualization',
          'Balance projection over time',
          'PDF export functionality'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/annuity-payout`,
            'description': 'Calculate how much income you can receive from your annuity'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Annuity Payout'
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
            'name': 'Annuity Payout Calculator',
            'item': `${baseUrl}/calculators/annuity-payout`
          }
        ]
      },
      
      // FAQPage schema for the informational content (keeping this as it's valuable)
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What are annuity payouts?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Annuity payouts represent the regular income distributions you receive from an annuity contract. These payments transform your accumulated savings into a reliable income stream designed to provide financial security throughout retirement or for a specified period. Unlike other retirement assets that may fluctuate with market conditions, annuity payouts offer predictability—knowing exactly how much income you\'ll receive and for how long.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do interest rates affect annuity payouts?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Interest rates significantly impact annuity payout rates, as insurers base their calculations on returns they can generate from your premium. For example, a 1% increase in interest rates can boost monthly payouts by 8-10%. When rates rise, insurance companies can offer better payouts since they can earn more on their investments. Conversely, in low interest rate environments, annuity payouts tend to decrease. This is why timing your annuity purchase can substantially affect your retirement income.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between ordinary annuity and annuity due?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'An ordinary annuity (also called annuity immediate) has payments occurring at the end of each period, which is common for loans, mortgages, and most rental payments. An annuity due features payments at the beginning of each period, which is typical for leases and insurance premiums. Annuity due typically results in slightly higher present and future values because payments are made earlier, allowing for additional time for interest to compound. The choice affects both the payment amount and overall return.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does inflation affect annuity income over time?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Inflation represents one of the greatest threats to annuity income, particularly for fixed payouts that remain constant over decades while the cost of living increases. For example, a $2,000 monthly annuity payment would have the purchasing power of only $1,107 after 20 years with 3% annual inflation. To combat this, consider inflation-protected annuities that provide increasing payments over time, though these start with lower initial payments. Our calculator allows you to model the impact of inflation on your income.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What factors determine how much income I can receive from my annuity?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Several key factors determine your annuity payout amount: 1) Size of your premium/lump sum - larger investments generate more income; 2) Your age when payments begin - older ages generally yield higher payouts due to shorter life expectancy; 3) Interest rates - higher rates allow insurance companies to offer better payouts; 4) Payment options selected - features like joint life coverage or guaranteed periods reduce payouts; 5) Payout period - whether lifetime or fixed period; and 6) Inflation protection - adding inflation adjustment reduces initial payments but increases them over time.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Annuity Payout Calculator | Calculate Your Retirement Income',
  description: 'Calculate how much regular income you can receive from your retirement savings or investment portfolio with our free annuity payout calculator.',
  keywords: [
    'annuity payout calculator',
    'retirement income calculator',
    'lump sum to income calculator',
    'annuity income planning',
    'annuitization calculator',
    'pension payout calculator',
    'retirement distribution calculator',
    'inflation adjusted income',
    'annuity payment schedule',
    'retirement withdrawal calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function AnnuityPayoutSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateAnnuityPayoutSchema('https://calculatorhub.space/calculators/annuity-payout')),
      }}
    />
  );
}