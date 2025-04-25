import { Metadata } from 'next';

// Define the JSON-LD schema for the compound interest calculator
export function generateCompoundInterestSchema(url: string) {
  // Extract the base URL (without the path)
  const baseUrl = url.replace('/calculators/compound-interest', '');
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // WebApplication schema for the calculator itself
      {
        '@type': 'WebApplication',
        'name': 'Compound Interest Calculator',
        'description': 'Calculate how your investments grow over time with different compounding frequencies, additional contributions, and inflation adjustments.',
        'applicationCategory': 'FinanceApplication',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Principal and interest calculation',
          'Multiple compounding frequency options',
          'Regular contribution modeling',
          'Inflation adjustment',
          'Tax impact calculation',
          'Year-by-year breakdown',
          'Interactive growth charts',
          'Principal vs interest visualization',
          'PDF export functionality',
          'Rule of 72 estimation'
        ],
        'screenshot': {
          '@type': 'ImageObject',
          'url': `${baseUrl}/images/calculators/compound-interest-screenshot.jpg`
        }
      },
      
      // BreadcrumbList schema for navigation
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
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How does compound interest work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Compound interest is the mechanism by which interest earned on an investment begins earning interest itself—essentially "interest on interest." Unlike simple interest, which calculates interest only on the initial principal, compound interest applies the interest rate to both the principal and accumulated interest. This creates an accelerating growth pattern that becomes more powerful over time. For example, $10,000 invested at 7% simple interest would earn $700 annually, reaching $24,000 after 20 years. With compound interest, the same investment would grow to over $38,600—a 60% greater return.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is the difference between simple and compound interest?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Simple interest calculates interest only on the original principal amount, whereas compound interest calculates interest on both the principal and previously earned interest. With simple interest, your returns grow linearly—at a constant rate. With compound interest, your returns grow exponentially—at an accelerating rate. The formula for simple interest is I = P × r × t (where I is interest, P is principal, r is rate, and t is time). The formula for compound interest is A = P(1 + r)^t (where A is the final amount). The difference becomes dramatic over long time periods, making compound interest significantly more powerful for wealth building.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does compounding frequency affect investment returns?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Compounding frequency refers to how often interest is calculated and added to your principal—daily, monthly, quarterly, semi-annually, or annually. More frequent compounding results in higher returns because interest begins earning interest sooner. For example, $10,000 invested for 10 years at 6% compounded annually would grow to $17,908. The same investment with monthly compounding would yield $18,193, and with daily compounding $18,221. The difference becomes more pronounced with higher interest rates and longer time periods. This is why when comparing investments, it\'s important to look at the Annual Percentage Yield (APY), which accounts for compounding frequency.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is the Rule of 72 and how is it used?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The Rule of 72 is a simple mental math shortcut to estimate how long an investment will take to double at a given interest rate. Simply divide 72 by the annual interest rate to determine the approximate number of years required. For example, at 8% interest, an investment would double in approximately 9 years (72 ÷ 8 = 9). At 6%, it would take 12 years to double (72 ÷ 6 = 12). The rule is reasonably accurate for interest rates between 6% and 10%. For lower rates, the Rule of 69.3 is more precise, while for rates above 10%, the rule slightly overestimates doubling time. This quick calculation helps investors understand the power of different returns over time.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does inflation impact compound interest returns?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Inflation erodes the purchasing power of investment returns over time, making it crucial to consider real (inflation-adjusted) returns rather than nominal returns. To calculate real returns, subtract the inflation rate from your nominal investment return. For example, if your investment grows at 7% annually while inflation averages 2%, your real return is approximately 5%. Over long periods, this difference is substantial—after 30 years, $10,000 growing at 7% would reach $76,123, but its purchasing power at 2% inflation would be only $42,726. This is why considering inflation-adjusted returns is essential for retirement planning and long-term investment strategies.'
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
  description: 'Calculate how your investments grow over time with our free compound interest calculator, featuring adjustable compounding periods and contribution options.',
  keywords: [
    'compound interest calculator',
    'investment growth calculator',
    'interest calculator',
    'compounding calculator',
    'investment return calculator',
    'savings growth calculator',
    'rule of 72 calculator',
    'retirement calculator',
    'wealth building calculator',
    'investment compounding tool'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function CompoundInterestSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateCompoundInterestSchema(process.env.NEXT_PUBLIC_SITE_URL + '/calculators/compound-interest')),
      }}
    />
  );
}