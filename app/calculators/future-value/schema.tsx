import { Metadata } from 'next';

// Define the JSON-LD schema for the future value calculator
export function generateFutureValueSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Future Value Calculator',
        'description': 'Calculate the future value of investments and savings with options for compound interest, periodic contributions, and inflation adjustments.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Compound interest calculation',
          'Simple interest calculation',
          'Regular contribution modeling',
          'Inflation adjustment',
          'Investment growth visualization',
          'Multiple compounding frequency options',
          'Principal vs interest breakdown',
          'Goal-based savings planning',
          'PDF export functionality',
          'Interactive growth charts'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/future-value`,
            'description': 'Calculate the future value of investments and savings'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Investment Growth Analysis'
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
            'name': 'Future Value Calculator',
            'item': `${baseUrl}/calculators/future-value`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is future value and how is it calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Future value (FV) represents what an investment or sum of money will be worth at a specific point in the future, given a certain interest rate and time period. For a single principal amount with compound interest, the formula is FV = P × (1 + r)^t, where P is the principal, r is the interest rate per period, and t is the number of periods. For example, $10,000 invested for 5 years at 6% annual compound interest would grow to $10,000 × (1 + 0.06)^5 = $13,382.26. With periodic contributions (PMT), the formula expands to FV = P × (1 + r)^t + PMT × [(1 + r)^t - 1]/r. Future value calculations are fundamental to retirement planning, education saving, and any long-term financial goal where growth needs to be projected.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does compound interest differ from simple interest in future value calculations?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Simple interest and compound interest produce significantly different future values, especially over longer time periods. Simple interest calculates interest only on the original principal, using the formula FV = P × (1 + r × t), where P is principal, r is rate, and t is time. Compound interest calculates interest on both the principal and previously earned interest, using FV = P × (1 + r)^t. For example, $10,000 invested for 20 years at 6%: with simple interest would grow to $10,000 × (1 + 0.06 × 20) = $22,000; with compound interest would grow to $10,000 × (1 + 0.06)^20 = $32,071. The difference of $10,071 represents the "interest on interest" effect—the power of compounding. This difference becomes more dramatic with higher interest rates or longer time periods, illustrating why compound interest is often called "the eighth wonder of the world."'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do regular contributions affect the future value of an investment?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Regular contributions dramatically accelerate growth in future value calculations through a powerful combination of dollar-cost averaging and compound interest. For example, comparing a one-time $10,000 investment to the same amount plus $200 monthly contributions (both at 7% annual return) over 20 years: the lump sum grows to about $38,697, while the contribution strategy reaches approximately $119,515—over three times more. The impact is particularly significant for longer time horizons due to the compounding effect. Additionally, contribution timing matters: beginning-of-period contributions yield slightly higher returns than end-of-period ones. This principle demonstrates why consistent investing, even with small amounts, is typically more effective for wealth building than waiting to accumulate a large lump sum.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does inflation impact the future value of money?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Inflation erodes the purchasing power of future values, making the real (inflation-adjusted) future value lower than the nominal future value. To calculate real future value, use the formula: Real FV = Nominal FV ÷ (1 + inflation rate)^n, where n is the number of periods. For example, $100,000 in 20 years with an average 3% annual inflation will have a real purchasing power of only $55,368 in today\'s dollars. This means investment returns must exceed inflation to achieve real growth. Financial planners often use the "Rule of 72" to estimate inflation\'s impact—dividing 72 by the inflation rate gives the approximate years it takes for purchasing power to halve (at 3% inflation, purchasing power halves every 24 years). For retirement planning, accounting for inflation is critical to ensure savings maintain adequate purchasing power through potentially decades of retirement.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are some practical applications of future value calculations?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Future value calculations have numerous practical applications: 1) Retirement planning - determining how much to save monthly to reach retirement goals; 2) Education funding - calculating contributions needed for future college expenses; 3) Major purchase planning - saving for down payments on homes or vehicles; 4) Investment comparison - evaluating different investment options with varying rates of return; 5) Business capital budgeting - projecting the future value of business investments; 6) Emergency fund planning - ensuring emergency savings keep pace with inflation; 7) Debt analysis - comparing the opportunity cost of debt repayment versus investing; and 8) Legacy planning - estimating inheritance values for estate planning. Future value calculations provide the mathematical foundation for nearly all long-term financial planning decisions, helping individuals and businesses make informed choices between current consumption and future financial benefits.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Future Value Calculator | Project Investment Growth Over Time',
  description: 'Calculate the future value of investments and savings with options for compound interest, periodic contributions, and inflation adjustments.',
  keywords: [
    'future value calculator',
    'investment growth calculator',
    'compound interest calculator',
    'savings projection calculator',
    'investment return calculator',
    'retirement savings calculator',
    'periodic contribution calculator',
    'inflation adjustment calculator',
    'financial planning tool',
    'wealth projection calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function FutureValueSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateFutureValueSchema('https://calculatorhub.space/calculators/future-value')),
      }}
    />
  );
}