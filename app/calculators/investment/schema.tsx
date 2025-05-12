import { Metadata } from 'next';

// Define the JSON-LD schema for the investment calculator
export function generateInvestmentSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Investment Calculator',
        'description': 'Plan your investment strategy and see how your money can grow over time with different scenarios and contribution strategies.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Investment growth projection',
          'Regular contribution modeling',
          'Contribution growth adjustment',
          'Multiple compounding frequencies',
          'Risk level analysis',
          'Inflation adjustment',
          'Management fee impact',
          'Tax consideration',
          'Multiple scenario comparison',
          'PDF export functionality'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/investment`,
            'description': 'Calculate investment growth and plan your investment strategy'
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
            'name': 'Investment Calculator',
            'item': `${baseUrl}/calculators/investment`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How does compound interest affect investment growth?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Compound interest significantly accelerates investment growth by generating earnings on both your original investment and previously accumulated interest. Unlike simple interest, where earnings are calculated only on the principal amount, compound interest creates a snowball effect that can dramatically increase long-term returns. For example, a $10,000 investment earning 7% annually would grow to about $20,000 after 10 years with compound interest, but only $17,000 with simple interest. The compounding frequency also matters—the more frequently interest compounds (daily vs. monthly vs. annually), the greater the final amount, though the difference is often modest. This demonstrates the importance of starting early and allowing investments to grow undisturbed, as time magnifies the compounding effect.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do regular contributions impact investment performance?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Regular contributions dramatically accelerate investment growth by combining the power of dollar-cost averaging with compound interest. For example, investing $10,000 initially with no additional contributions at 7% annual return would grow to about $76,000 after 30 years. However, adding just $200 monthly would result in approximately $283,000—more than three times as much. Contribution growth (gradually increasing your contributions over time, such as with salary increases) compounds this effect further. Contributing early in the investment timeline is particularly powerful due to the longer compounding period; a $5,000 contribution at age 25 potentially produces significantly more by retirement than the same $5,000 contributed at age 45. This principle underlies the effectiveness of retirement savings strategies that emphasize consistent contributions starting as early as possible.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How should investment risk be balanced with time horizon?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Investment risk and time horizon have a critical relationship: longer time horizons generally support higher risk tolerance due to more time to recover from market downturns. For short-term goals (1-3 years), conservative investments like high-yield savings accounts and short-term bonds are appropriate despite lower returns, as principal preservation is paramount. For medium-term goals (3-10 years), a balanced approach with moderate stock exposure (perhaps 40-60%) balances growth potential with reasonable stability. For long-term goals (10+ years), a growth-oriented portfolio with significant stock allocation (70-90%) historically produces the highest returns despite short-term volatility. This time-based approach to risk follows the principle that stocks, while volatile short-term, have consistently outperformed other asset classes over periods exceeding 10 years. The classic rule of thumb—subtract your age from 110 to determine stock percentage—provides a simple starting framework that becomes more conservative as retirement approaches.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do fees and taxes impact investment returns?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Fees and taxes can significantly erode investment returns through their compound effect over time. Even small differences in fees have major long-term implications—a 1% higher annual fee can reduce a portfolio\'s final value by over 20% after 30 years. For example, a $100,000 investment growing at 7% annually would reach about $761,000 after 30 years with no fees, but only about $574,000 with a 1% annual fee. Similarly, taxes on investment earnings can substantially reduce returns. Strategies to minimize these impacts include: using tax-advantaged accounts (401(k)s, IRAs, HSAs); selecting low-cost index funds and ETFs over actively managed funds; holding investments long-term to qualify for lower capital gains tax rates; implementing tax-loss harvesting; and considering municipal bonds for tax-free income in taxable accounts. The calculator\'s fee and tax inputs allow investors to quantify these effects and make more informed decisions about investment vehicles and account types.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does inflation affect real investment returns?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Inflation erodes purchasing power over time, making the distinction between nominal returns (before inflation) and real returns (after inflation) critical for investors. For example, with 3% annual inflation, $100,000 today will have the purchasing power of only about $41,000 in 30 years. This means a 7% nominal investment return during 3% inflation actually provides only a 4% real return—substantially changing the growth trajectory. To maintain purchasing power, investments must at minimum match inflation rates. This explains why seemingly "safe" cash holdings can actually lose value in real terms if their interest rates fall below inflation. Different asset classes have historically performed differently against inflation: stocks and real estate have generally provided strong inflation protection over long periods, while fixed-rate bonds and cash equivalents may struggle during high-inflation periods. Including inflation adjustments in investment projections, as this calculator allows, provides a more accurate picture of future purchasing power.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Investment Calculator | Plan Your Investment Strategy',
  description: 'Plan your investment strategy and see how your money can grow over time with different scenarios and contribution strategies using our comprehensive investment calculator.',
  keywords: [
    'investment calculator',
    'compound interest calculator',
    'portfolio growth calculator',
    'investment return calculator',
    'investment projection tool',
    'retirement planning calculator',
    'investment comparison tool',
    'contribution calculator',
    'investment growth visualization',
    'portfolio projection calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function InvestmentSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateInvestmentSchema('https://calculatorhub.space/calculators/investment')),
      }}
    />
  );
}