import { Metadata } from 'next';

// Define the JSON-LD schema for the compound interest calculator
export function generateCompoundInterestSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // SoftwareApplication schema
      {
        '@type': 'SoftwareApplication',
        'name': 'Compound Interest Calculator',
        'description': 'Calculate compound interest growth, see how your savings and investments multiply over time with different compounding frequencies and contribution schedules.',
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
          'Multiple compounding frequencies',
          'Regular contribution support',
          'Initial principal growth projection',
          'Interest earned breakdown',
          'Growth visualization charts',
          'Year-by-year breakdown table',
          'Comparison scenarios',
          'PDF export functionality',
          'Investment timeline analysis'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/compound-interest`,
            'description': 'Calculate compound interest growth and investment returns'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Compound Interest Analysis'
          }
        }
      },

      // BreadcrumbList schema
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
            'name': 'Compound Interest Calculator',
            'item': `${baseUrl}/calculators/compound-interest`
          }
        ]
      },

      // HowTo schema for educational content
      {
        '@type': 'HowTo',
        'name': 'How to Calculate Compound Interest',
        'description': 'Learn how to calculate compound interest for your savings and investments using our step-by-step guide.',
        'step': [
          {
            '@type': 'HowToStep',
            'position': 1,
            'name': 'Enter your initial investment',
            'text': 'Start by entering your initial principal amount - the starting sum you want to invest or have already saved.'
          },
          {
            '@type': 'HowToStep',
            'position': 2,
            'name': 'Set the interest rate',
            'text': 'Enter the annual interest rate (APY) you expect to earn. For savings accounts, this is typically 0.5-5%. For investments, historical stock market returns average 7-10%.'
          },
          {
            '@type': 'HowToStep',
            'position': 3,
            'name': 'Choose compounding frequency',
            'text': 'Select how often interest compounds: daily, monthly, quarterly, or annually. More frequent compounding results in higher returns.'
          },
          {
            '@type': 'HowToStep',
            'position': 4,
            'name': 'Set the time period',
            'text': 'Enter how many years you plan to let your investment grow. The longer the time period, the more dramatic the compound growth effect.'
          },
          {
            '@type': 'HowToStep',
            'position': 5,
            'name': 'Add regular contributions (optional)',
            'text': 'If you plan to add money regularly, enter your contribution amount and frequency. Regular contributions significantly boost your final balance.'
          },
          {
            '@type': 'HowToStep',
            'position': 6,
            'name': 'Review your results',
            'text': 'See your projected final balance, total interest earned, and year-by-year growth breakdown. Use the charts to visualize how your money grows over time.'
          }
        ],
        'totalTime': 'PT2M'
      },

      // FAQPage schema for informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is compound interest and how does it work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods. Unlike simple interest, which only earns on the original amount, compound interest creates a snowball effect where your money grows exponentially over time. The formula is A = P(1 + r/n)^(nt), where A is the final amount, P is principal, r is annual rate, n is compounding frequency, and t is time in years. For example, $10,000 at 5% compounded monthly for 10 years grows to $16,470, while simple interest would yield only $15,000.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does compounding frequency affect my returns?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'More frequent compounding results in higher returns because interest is added to your principal more often, which then earns additional interest. For a $10,000 investment at 5% over 10 years: annual compounding yields $16,289; quarterly yields $16,436; monthly yields $16,470; and daily yields $16,487. While the differences may seem small, they become significant with larger amounts and longer time periods. This is why understanding APY (Annual Percentage Yield), which accounts for compounding frequency, is more useful than just looking at the stated interest rate.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is the Rule of 72?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The Rule of 72 is a simple formula to estimate how long it takes for an investment to double with compound interest. Divide 72 by the annual interest rate to get the approximate years to double your money. For example, at 6% interest, your money doubles in about 12 years (72 ÷ 6 = 12). At 8%, it doubles in about 9 years. This rule helps visualize the power of compound interest and makes it easy to compare different investment options. It works best for rates between 6-10% and becomes less accurate at very high or low rates.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Should I prioritize higher interest rates or more frequent contributions?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Both factors significantly impact your final returns, but their relative importance depends on your situation. For long-term investing (20+ years), a higher return rate has enormous impact due to exponential growth. For shorter periods, regular contributions often matter more. Ideally, maximize both: seek competitive returns while contributing consistently. For example, $200/month at 7% for 30 years yields $244,000, while $300/month at 5% yields only $249,000. The combination of reasonable returns with consistent contributions is the most reliable wealth-building strategy.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does inflation affect compound interest calculations?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Inflation reduces the real purchasing power of your money over time. While your investment may show impressive nominal growth, the real return is the nominal return minus inflation. For example, if your investment earns 7% but inflation is 3%, your real return is roughly 4%. Over 30 years, $100,000 growing at 7% nominal becomes $761,000, but with 3% inflation, its purchasing power is equivalent to only $314,000 in today\'s dollars. Always consider real returns when planning long-term investments, and aim for investments that historically outpace inflation, such as diversified stock portfolios.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Compound Interest Calculator | Calculate Investment Growth',
  description: 'Calculate compound interest growth and see how your savings multiply over time. Free calculator with charts, contribution support, and year-by-year projections.',
  keywords: [
    'compound interest calculator',
    'compound interest formula',
    'investment growth calculator',
    'savings calculator',
    'interest calculator',
    'compound growth calculator',
    'rule of 72 calculator',
    'APY calculator',
    'investment return calculator',
    'compound interest example'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function CompoundInterestSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateCompoundInterestSchema('https://calculatorhub.space/calculators/compound-interest')),
      }}
    />
  );
}