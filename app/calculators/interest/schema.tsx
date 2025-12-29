import { Metadata } from 'next';

// Define the JSON-LD schema for the interest calculator
export function generateInterestSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Interest Calculator',
        'description': 'Calculate interest earnings or payments with options for compound interest, simple interest, regular contributions, and inflation adjustment.',
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
          'Withdrawal planning',
          'Multiple compounding frequency options',
          'Inflation adjustment',
          'Tax impact calculation',
          'Effective rate calculation',
          'PDF export functionality',
          'Interactive growth charts'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/interest`,
            'description': 'Calculate interest earnings or payments'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Interest Analysis'
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
            'name': 'Interest Calculator',
            'item': `${baseUrl}/calculators/interest`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is the difference between simple and compound interest?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Simple interest is calculated only on the initial principal amount, using the formula Interest = Principal × Rate × Time. For example, $1,000 at 5% for 3 years generates $150 in simple interest. Compound interest, however, calculates interest on both the initial principal and previously accumulated interest, using the formula A = P(1 + r/n)^(nt), where A is the final amount, P is the principal, r is the interest rate, n is the compounding frequency, and t is time. The same $1,000 at 5% compounded annually for 3 years yields $1,157.63. This "interest on interest" effect creates exponential growth over time, making compound interest significantly more powerful for long-term investments and more costly for long-term loans.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does compounding frequency affect interest calculations?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Compounding frequency—how often interest is calculated and added to your principal—significantly impacts long-term results. For example, $10,000 invested at 5% for 10 years would grow to: $16,289 with annual compounding; $16,436 with semi-annual compounding; $16,512 with quarterly compounding; $16,568 with monthly compounding; and $16,583 with daily compounding. More frequent compounding produces higher returns because interest is added to the principal more often, creating more opportunities for that interest to earn additional interest. For investors and savers, more frequent compounding is advantageous, while for borrowers, it means higher costs. This effect becomes more pronounced with higher interest rates and longer time periods, making compounding frequency an important consideration in financial decisions.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is the Rule of 72 and how is it used to estimate investment growth?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The Rule of 72 is a simple mathematical shortcut to estimate how long it will take for an investment to double in value at a fixed annual rate of return. The formula is: Years to Double = 72 ÷ Interest Rate. For example, at 6% interest, money doubles in approximately 72 ÷ 6 = 12 years; at 9% interest, it doubles in about 8 years; and at 3% interest, it doubles in roughly 24 years. This rule highlights the dramatic effect of different interest rates—a 3% increase from 3% to 6% cuts the doubling time in half. While not perfectly precise (especially at very high or low rates), the Rule of 72 provides a quick mental calculation for understanding compound growth potential without complex formulas, helping investors make quick comparisons between different investment opportunities.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do regular contributions affect interest earnings over time?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Regular contributions dramatically accelerate interest earnings by increasing the principal amount that earns interest over time. For example, $10,000 invested at 7% for 30 years would grow to $76,123 without additional contributions. However, adding just $200 monthly over the same period would result in a final balance of $284,939—more than 3.7 times greater. This amplification occurs because each contribution begins earning compound interest immediately after being added, and earlier contributions have more time to grow. The frequency of contributions also matters—more frequent additions (monthly vs. quarterly or annually) generally result in better outcomes. This principle underlies the effectiveness of regular investment strategies like dollar-cost averaging and demonstrates why consistent, automated contributions to retirement accounts are so powerful for long-term wealth building.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How can inflation and taxes impact effective interest returns?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Inflation and taxes both erode the real value of interest returns. Inflation reduces purchasing power over time, meaning that nominal returns must exceed the inflation rate to achieve real growth. For example, an investment earning 6% during a period of 3% inflation has a real return of only about 3%. The adjustment formula is: Real Return ≈ Nominal Return - Inflation Rate. Taxes further reduce returns, as interest income is typically taxed at ordinary income rates. If you\'re in a 25% tax bracket, a 6% return effectively becomes 4.5% after taxes. Combined, inflation and taxes can significantly diminish returns—a nominal 6% return with 3% inflation and 25% taxes results in a real after-tax return of just 1.5%. This is why tax-advantaged accounts (like IRAs and 401(k)s) and inflation-protected securities are valuable tools for long-term investors.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Interest Calculator | Calculate Simple and Compound Interest',
  description: 'Calculate interest earnings or payments with options for compound interest, simple interest, regular contributions, and inflation adjustment.',
  keywords: [
    'interest calculator',
    'compound interest calculator',
    'simple interest calculator',
    'investment calculator',
    'savings calculator',
    'compounding frequency',
    'interest growth calculator',
    'loan interest calculator',
    'effective interest rate',
    'rule of 72 calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function InterestSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateInterestSchema('https://calculatorhub.space/calculators/interest')),
      }}
    />
  );
}