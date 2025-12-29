import { Metadata } from 'next';

// Define the JSON-LD schema for the interest rate calculator
export function generateInterestRateSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Interest Rate Calculator',
        'description': 'Calculate effective interest rates, compare APR vs. APY, and determine how different rates impact loans, mortgages, and investments.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'APR to APY conversion',
          'Effective interest rate calculation',
          'Loan interest rate comparison',
          'Rate impact on monthly payments',
          'Interest rate differential analysis',
          'Blended rate calculation',
          'Interest rate spread visualization',
          'Rate scenario modeling',
          'PDF export functionality',
          'Historical rate comparison'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/interest-rate`,
            'description': 'Calculate effective interest rates and compare different rate scenarios'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Interest Rate Analysis'
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
            'name': 'Interest Rate Calculator',
            'item': `${baseUrl}/calculators/interest-rate`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What\'s the difference between APR and APY?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'APR (Annual Percentage Rate) and APY (Annual Percentage Yield) represent different ways of expressing interest rates. APR is the simple interest rate for a year without accounting for compounding, while APY includes the effect of compounding over a year. For example, a 12% APR compounded monthly has an APY of 12.68% because the interest earned each month itself earns interest in subsequent months. The mathematical relationship is: APY = (1 + APR/n)^n - 1, where n is the number of compounding periods per year. Lenders typically advertise APR for loans (making costs appear lower) and APY for savings products (making returns appear higher). Understanding both metrics is crucial for accurate financial comparisons—APR alone doesn\'t tell the full cost story when compounding is involved, while APY provides the true annual return or cost including compounding effects.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do interest rates affect loan payments?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Interest rates significantly impact loan payments, with even small rate changes causing substantial differences in total cost and monthly payments. For example, on a 30-year $300,000 mortgage, a 1% interest rate increase from 5% to 6% would raise the monthly payment from $1,610 to $1,799 (an 11.7% increase), and add $68,064 to the total interest paid over the loan term. The relationship between rates and payments isn\'t linear—the impact of a 1% increase is greater at lower base rates than at higher ones. Interest rates also affect the amortization schedule; lower rates allow more of each payment to go toward principal earlier in the loan. Additionally, the loan term magnifies rate impacts—a 1% difference affects a 30-year loan much more than a 5-year loan. This sensitivity to interest rates explains why even small rate movements cause significant changes in housing affordability and refinancing activity.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What factors determine the interest rate I receive?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The interest rate you receive is determined by several key factors: 1) Credit score - typically the most significant factor, with each 20-point score drop potentially increasing rates by 0.25-0.5%; 2) Loan-to-value ratio - higher down payments generally secure lower rates; 3) Loan term - shorter terms usually offer lower rates than longer terms; 4) Loan type - government-backed loans (FHA, VA) often have different rate structures than conventional loans; 5) Property type - primary residences typically qualify for lower rates than investment properties; 6) Loan amount - very small or very large (jumbo) loans may have higher rates; 7) Debt-to-income ratio - lower ratios demonstrate less risk; 8) Economic conditions - Federal Reserve policy and inflation expectations influence baseline rates; 9) Market competition - lender efficiency and competitive positioning impact offered rates; and 10) Relationship factors - existing banking relationships and rate buydowns can affect final terms.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do I calculate the effective interest rate with fees included?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'To calculate the effective interest rate with fees included, you need to account for all costs associated with the loan or investment. For loans, use this approach: 1) Add up all loan fees (origination fees, points, etc.); 2) Add this amount to the loan interest; 3) Divide by the loan amount; 4) If calculating APY, account for compounding using the formula APY = (1 + r/n)^n - 1, where r is the rate and n is compounding periods. For example, a $200,000 loan at 5% with $4,000 in fees has an effective first-year rate of: ($10,000 interest + $4,000 fees) ÷ $200,000 = 7%. For investments, subtract fees from returns: if a 6% return has a 1% management fee, the effective return is 5%. For more precise calculations across multi-year periods, use the Internal Rate of Return (IRR) formula, which determines the single rate that equalizes all cash flows, providing the true economic cost or return including all fees and timing considerations.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are interest rate spreads and why are they important?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Interest rate spreads represent the difference between two related interest rates and serve as crucial indicators of economic conditions and financial risk. Common spreads include: 1) Bank spread - the difference between loan and deposit rates, representing bank profitability; 2) Treasury yield curve - spreads between long-term and short-term government bonds, with inversions (negative spreads) often predicting recessions; 3) Credit spread - the difference between corporate bond yields and similar-term government bonds, indicating perceived corporate default risk; 4) TED spread - the difference between three-month LIBOR and Treasury bills, reflecting perceived banking system risk; and 5) Mortgage spread - the difference between mortgage rates and Treasury yields, indicating mortgage market conditions. Widening spreads typically signal increased risk or economic stress, while narrowing spreads suggest improved conditions. For consumers, understanding these spreads helps with timing financial decisions—wide mortgage spreads might suggest waiting for more favorable terms, while tight spreads might indicate optimal borrowing conditions.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Interest Rate Calculator | Compare and Convert Rates',
  description: 'Calculate effective interest rates, compare APR vs. APY, and determine how different rates impact loans, mortgages, and investments.',
  keywords: [
    'interest rate calculator',
    'APR calculator',
    'APY calculator',
    'effective interest rate',
    'loan rate comparison',
    'mortgage rate calculator',
    'rate conversion calculator',
    'blended rate calculator',
    'interest rate spread',
    'real interest rate calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function InterestRateSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateInterestRateSchema('https://calculatorhub.space/calculators/interest-rate')),
      }}
    />
  );
}