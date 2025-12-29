import { Metadata } from 'next';

// Define the JSON-LD schema for the mortgage payoff calculator
export function generateMortgagePayoffSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Mortgage Payoff Calculator',
        'description': 'Calculate how extra payments can help you pay off your mortgage early and save thousands in interest with our mortgage payoff calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Early payoff date calculation',
          'Interest savings analysis',
          'Extra payment impact visualization',
          'Lump sum vs. regular extra payment comparison',
          'Amortization schedule with extra payments',
          'Biweekly payment strategy modeling',
          'Refinance vs. extra payment comparison',
          'Break-even timeline calculation',
          'PDF export functionality',
          'Multiple payoff strategy comparison'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/mortgage-payoff`,
            'description': 'Calculate how extra payments can help you pay off your mortgage early'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Mortgage Payoff Analysis'
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
            'name': 'Mortgage Payoff Calculator',
            'item': `${baseUrl}/calculators/mortgage-payoff`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How do extra mortgage payments affect my loan?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Extra mortgage payments directly reduce your principal balance, which produces three significant benefits: 1) Shortened loan term - even small additional payments can substantially reduce your payoff timeline, for example, $100 extra monthly on a $250,000, 30-year mortgage at 4% could shorten the loan by over 4 years; 2) Interest savings - because interest is calculated on the remaining principal, every dollar of principal reduction saves you interest for all remaining years of the loan, potentially saving tens of thousands of dollars; 3) Accelerated equity building - increasing your home equity faster provides greater financial flexibility and security. Extra payments are most effective when made early in the loan term when your regular payments are primarily going toward interest rather than principal. Additionally, most modern mortgages don\'t have prepayment penalties, but it\'s always wise to verify with your lender that extra payments will be applied directly to principal reduction rather than future payments.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s better: making extra monthly payments or a one-time lump sum payment?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Both extra monthly payments and one-time lump sum payments can effectively reduce your mortgage term and interest costs, but they offer different advantages. Regular extra monthly payments provide discipline and consistency—even $100-200 monthly can significantly impact your mortgage over time. This approach works well for those with stable income who can budget for a higher effective mortgage payment. Lump sum payments, such as from tax refunds, bonuses, or windfalls, provide immediate large principal reduction, which maximizes interest savings from that point forward. Mathematically, making a lump sum payment earlier rather than accumulating the same amount over time for a later payment saves more interest. Ideally, combining both approaches is most effective—making regular extra payments while also applying occasional lump sums when available. The best strategy depends on your cash flow, financial discipline, and whether you have better investment opportunities for your money.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Should I pay off my mortgage early or invest the extra money?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The decision between early mortgage payoff and investing involves both math and personal preference. From a purely mathematical perspective, compare your mortgage interest rate to your expected investment returns after taxes. If your mortgage rate is 4% and you expect to earn 7% on investments, investing may be financially advantageous. However, this calculation must account for risk—investment returns are uncertain while mortgage interest savings are guaranteed. Personal factors to consider include: 1) Risk tolerance—debt-free homeownership provides security that volatile investments cannot; 2) Time horizon—longer investment periods generally favor investing due to compound growth; 3) Tax considerations—mortgage interest deductions and investment tax treatment affect the net benefit of each option; 4) Psychological value—many homeowners highly value the peace of mind from being debt-free; 5) Liquidity needs—invested funds remain accessible while home equity can be difficult to access quickly. A balanced approach often works best for many homeowners: establishing emergency savings, maximizing matched retirement contributions, then splitting additional funds between mortgage prepayment and diversified investments.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is a bi-weekly payment strategy and how does it work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'A bi-weekly payment strategy involves making half your monthly mortgage payment every two weeks instead of a full payment once a month. This approach effectively results in 13 monthly payments annually instead of 12, as there are 26 bi-weekly periods in a year. For example, if your monthly payment is $1,500, you would pay $750 every two weeks, totaling $19,500 annually instead of $18,000, essentially making one extra payment each year. This strategy typically reduces a 30-year mortgage by approximately 4-6 years and saves thousands in interest without dramatically changing your budget. The bi-weekly approach works particularly well for homeowners paid on a bi-weekly schedule, creating natural alignment with income. However, it\'s important to ensure your lender properly applies bi-weekly payments to your principal rather than holding them until a full payment accumulates. Some lenders offer official bi-weekly payment programs, though these sometimes include fees. Alternatively, you can self-manage by making your regular monthly payment plus 1/12 extra principal each month to achieve the same effect.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Is refinancing or making extra payments better for reducing my mortgage term?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Whether refinancing or making extra payments is better for reducing your mortgage term depends on several factors. Refinancing from a 30-year to a 15-year mortgage typically offers a lower interest rate (usually 0.5-0.75% less), which combines with the shorter term to dramatically reduce total interest costs. This approach enforces discipline through contractually higher payments. However, refinancing involves closing costs (typically 2-5% of the loan amount), requires qualifying for a new loan, and reduces payment flexibility if financial circumstances change. Making extra payments on your existing mortgage avoids closing costs, preserves the flexibility to reduce or stop extra payments if needed, and doesn\'t require requalification. The best approach depends on interest rate differentials, how long you plan to stay in the home, your discipline in making voluntary extra payments, and your need for payment flexibility. Often, the ideal strategy for those who can afford higher payments is refinancing to a lower rate while continuing to make extra payments, particularly if current rates are significantly lower than your existing rate.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Mortgage Payoff Calculator | Pay Off Your Mortgage Early',
  description: 'Calculate how extra payments can help you pay off your mortgage early and save thousands in interest with our mortgage payoff calculator.',
  keywords: [
    'mortgage payoff calculator',
    'early mortgage payoff',
    'extra payment calculator',
    'mortgage interest savings',
    'biweekly mortgage payments',
    'mortgage principal reduction',
    'pay off mortgage faster',
    'mortgage amortization calculator',
    'lump sum payment calculator',
    'mortgage payoff strategies'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function MortgagePayoffSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateMortgagePayoffSchema('https://calculatorhub.space/calculators/mortgage-payoff')),
      }}
    />
  );
}