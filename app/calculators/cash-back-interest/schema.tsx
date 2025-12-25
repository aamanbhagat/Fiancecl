import { Metadata } from 'next';

// Define the JSON-LD schema for the cash back interest calculator
export function generateCashBackInterestSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Cash Back vs. Low Interest Calculator',
        'description': 'Compare dealer incentives to find whether taking a cash rebate or opting for low APR financing will save you more money when purchasing a vehicle.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Cash rebate vs. low APR comparison',
          'Monthly payment calculation',
          'Total interest analysis',
          'Break-even point determination',
          'Amortization schedule comparison',
          'Tax and fee inclusion',
          'Trade-in value consideration',
          'Visual cost comparison charts',
          'PDF export functionality',
          'Customizable term scenarios'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/cash-back-interest`,
            'description': 'Compare cash rebate and low interest financing options'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Auto Financing Options'
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
            'name': 'Cash Back vs. Low Interest Calculator',
            'item': `${baseUrl}/calculators/cash-back-interest`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'Should I take the cash rebate or special low APR financing?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The better option depends primarily on your loan term length and the size of the cash rebate versus the interest rate differential. Generally, cash rebates are more beneficial for shorter loans (36-48 months), while low APR offers provide greater savings for longer loans (60+ months). For example, with a $30,000 vehicle offering either a $3,000 rebate with 6.5% APR or 0.9% special APR financing, the low APR option saves $1,143.60 over a 60-month loan term. Our calculator performs this analysis based on your specific situation.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do cash rebates and low interest financing work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'A cash rebate is an immediate reduction in the vehicle\'s purchase price, which lowers your loan amount but typically comes with a standard (higher) interest rate. For example, a $30,000 vehicle with a $3,000 rebate would be financed at $27,000. Low interest financing (sometimes as low as 0% APR) maintains the original price but reduces your financing costs over the loan term. These offers are mutually exclusive because manufacturers subsidize either the price reduction or the interest rate reduction, but not both simultaneously.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is the break-even point in a cash back vs. low APR decision?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The break-even point is the specific month in your loan term when the total cost of one option equals the other. Before this point, one option has the cost advantage; after this point, the other option becomes more economical. For example, if you save $2,000 upfront with a rebate but pay an extra $50 monthly in interest compared to the low APR option, the break-even would occur at 40 months ($2,000 ÷ $50 = 40). This point is crucial because if you plan to keep the loan for less time than the break-even point, the initially cheaper option remains the better choice.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Does my credit score affect which option is better?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes, your credit score significantly impacts this decision because special low APR offers typically require excellent credit (usually 720+ FICO score). If your credit score doesn\'t qualify you for the promotional rate, you\'ll be offered a higher standard rate, which dramatically changes the comparison. In this case, taking the cash rebate is often the better choice. Cash rebates, on the other hand, are generally available to buyers across all credit tiers, making them more accessible for those with average or below-average credit.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What other factors should I consider besides the math?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Beyond the pure numbers, consider: 1) Early payoff potential - if you might pay off early, the cash rebate is usually better; 2) Opportunity cost - what else could you do with the cash rebate amount?; 3) Down payment needs - cash rebates can help meet minimum down payment requirements; 4) Cash flow concerns - low APR typically means lower monthly payments; and 5) Hidden restrictions - some manufacturers limit special rates to certain models or trim levels. Also check for rebate stacking possibilities, as some rebates (military, college grad) might be combinable with other offers.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Cash Back vs. Low Interest Calculator | Auto Financing Comparison',
  description: 'Compare dealer incentives to determine whether taking a cash rebate or low APR financing will save you more money when buying a vehicle.',
  keywords: [
    'cash back vs low interest calculator',
    'auto rebate calculator',
    'car financing comparison',
    'vehicle incentive calculator',
    'dealer rebate vs low APR',
    'auto loan interest calculator',
    'car purchase incentives',
    'auto financing calculator',
    'best car financing option',
    'cash rebate calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function CashBackInterestSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateCashBackInterestSchema('https://calculatorshub.store/calculators/cash-back-interest')),
      }}
    />
  );
}