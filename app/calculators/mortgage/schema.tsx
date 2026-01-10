import { Metadata } from 'next';

// Define the JSON-LD schema for the mortgage calculator
export function generateMortgageSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Mortgage Calculator',
        'description': 'Calculate monthly mortgage payments, total interest costs, amortization schedules, and compare different loan scenarios with our comprehensive mortgage calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Monthly payment calculation',
          'Amortization schedule generation',
          'Principal vs interest breakdown',
          'Down payment impact analysis',
          'Total interest cost calculation',
          'Loan term comparison',
          'Early payoff scenarios',
          'Extra payment modeling',
          'Refinance comparison',
          'PDF export functionality'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/mortgage`,
            'description': 'Calculate monthly mortgage payments and total costs'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Mortgage Analysis'
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
            'name': 'Mortgage Calculator',
            'item': `${baseUrl}/calculators/mortgage`
          }
        ]
      },

      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How is a monthly mortgage payment calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'A monthly mortgage payment is calculated using the formula: M = P[r(1+r)^n]/[(1+r)^n-1], where M is the monthly payment, P is the principal (loan amount), r is the monthly interest rate (annual rate divided by 12), and n is the total number of payments (loan term in years multiplied by 12). For example, on a $300,000 loan with a 30-year term and 4.5% annual interest rate, the monthly principal and interest payment would be about $1,520. However, the total mortgage payment typically includes additional components known as PITI: Principal and Interest (calculated by the formula), plus property Taxes and homeowner\'s Insurance, which are often collected by the lender and held in an escrow account. Some loans may also include Private Mortgage Insurance (PMI) for down payments less than 20%.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are the different types of mortgage loans available?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Common mortgage types include: 1) Conventional loans - traditional mortgages not backed by the government, typically requiring good credit and at least 3-5% down; 2) FHA loans - government-backed loans with lower down payment requirements (3.5% with 580+ credit score) and more flexible qualifying criteria; 3) VA loans - for veterans and service members with no down payment requirement; 4) USDA loans - for rural homebuyers with moderate incomes and no down payment; 5) Jumbo loans - for loan amounts exceeding conforming loan limits ($726,200 in most areas for 2023); 6) Fixed-rate mortgages - maintain the same interest rate for the entire term (typically 15, 20, or 30 years); 7) Adjustable-rate mortgages (ARMs) - feature rates that change after an initial fixed period (e.g., 5/1 ARM has a fixed rate for 5 years, then adjusts annually); 8) Interest-only mortgages - allow payment of only interest for an initial period; and 9) Balloon mortgages - require a large final payment after a period of smaller payments.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does the down payment affect a mortgage?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The down payment affects a mortgage in several significant ways: 1) Loan amount - a larger down payment reduces the principal, resulting in lower monthly payments and less total interest paid over the loan term; 2) Interest rate - lenders often offer lower rates for larger down payments due to reduced risk; 3) Private Mortgage Insurance (PMI) - conventional loans with less than 20% down typically require PMI, adding 0.5-1% of the loan amount annually to payments; 4) Loan approval - a substantial down payment can help overcome other qualification challenges like less-than-perfect credit; 5) Equity position - starting with more equity provides a buffer against market downturns; 6) Loan options - certain mortgage programs have specific down payment requirements (e.g., 3.5% for FHA, 0% for VA and USDA); and 7) Cash reserves - balancing down payment size with maintaining emergency savings is important for financial security. For example, on a $400,000 home, increasing a down payment from 5% ($20,000) to 20% ($80,000) eliminates PMI and could reduce monthly payments by hundreds of dollars.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is mortgage amortization and how does it work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Mortgage amortization is the gradual process of paying off a mortgage through regular payments that include both principal and interest. In a typical amortizing mortgage, each payment is calculated to be the same amount over the loan term, but the proportion allocated to principal versus interest changes over time. Initially, payments are predominantly interest—for example, in the first year of a 30-year mortgage at 4.5%, approximately 65-70% of each payment goes toward interest. As the loan progresses, this ratio shifts, with an increasing portion going toward principal reduction. This happens because interest is calculated on the remaining balance, which decreases with each payment. An amortization schedule shows this progression month by month, revealing how each payment affects the loan balance. Understanding amortization helps borrowers recognize the benefits of additional principal payments early in the loan term, which can significantly reduce total interest costs and shorten the loan term.'
            }
          },
          {
            '@type': 'Question',
            'name': 'When does refinancing a mortgage make financial sense?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Refinancing makes financial sense in several scenarios: 1) Lower interest rates - the traditional rule of thumb suggests refinancing when rates are at least 0.75-1% lower than your current rate, though this varies based on loan size and how long you\'ll stay in the home; 2) Better loan terms - switching from an adjustable-rate to a fixed-rate mortgage when rates are low, or shortening the loan term to build equity faster; 3) Eliminating PMI - refinancing can remove private mortgage insurance if your home has appreciated enough to give you 20% equity; 4) Cash-out refinancing - tapping home equity might be worthwhile for home improvements, debt consolidation, or other significant expenses if the new rate is reasonable; 5) Improved credit score - if your credit has significantly improved since your original mortgage, you might qualify for better terms. To determine if refinancing makes sense, calculate the break-even point by dividing closing costs by monthly savings to see how many months it takes to recoup costs. Refinancing generally doesn\'t make sense if you plan to move before reaching this break-even point.'
            }
          }
        ]
      },

      // HowTo schema for educational SEO content
      {
        '@type': 'HowTo',
        'name': 'How to Calculate Your Monthly Mortgage Payment',
        'description': 'Step-by-step guide to calculating your monthly mortgage payment, including principal, interest, taxes, and insurance.',
        'step': [
          {
            '@type': 'HowToStep',
            'position': 1,
            'name': 'Enter the home price or loan amount',
            'text': 'Input the total price of the home you want to buy, or if you already know your loan amount, enter that directly.'
          },
          {
            '@type': 'HowToStep',
            'position': 2,
            'name': 'Set your down payment percentage',
            'text': 'Enter your down payment as a percentage of the home price. A 20% down payment avoids PMI, but many loans allow as little as 3-5% down.'
          },
          {
            '@type': 'HowToStep',
            'position': 3,
            'name': 'Enter the interest rate',
            'text': 'Input the annual interest rate offered by your lender. Rates vary based on credit score, loan type, and market conditions.'
          },
          {
            '@type': 'HowToStep',
            'position': 4,
            'name': 'Select your loan term',
            'text': 'Choose your mortgage term, typically 15 or 30 years. Shorter terms have higher payments but save substantial interest over the life of the loan.'
          },
          {
            '@type': 'HowToStep',
            'position': 5,
            'name': 'Add property taxes and insurance',
            'text': 'Enter your estimated annual property tax rate and homeowner\'s insurance cost to see your true monthly payment (PITI).'
          },
          {
            '@type': 'HowToStep',
            'position': 6,
            'name': 'Review your results',
            'text': 'Examine your monthly payment breakdown, total cost over the loan term, and amortization schedule showing how your balance decreases over time.'
          }
        ],
        'totalTime': 'PT3M'
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Mortgage Calculator | Calculate Monthly Payments & Total Costs',
  description: 'Calculate monthly mortgage payments, total interest costs, amortization schedules, and compare different loan scenarios with our comprehensive mortgage calculator.',
  keywords: [
    'mortgage calculator',
    'home loan calculator',
    'monthly mortgage payment',
    'amortization schedule',
    'mortgage principal and interest',
    'down payment calculator',
    'mortgage refinance calculator',
    'extra payment calculator',
    'mortgage comparison tool',
    'PITI calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function MortgageSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateMortgageSchema('https://calculatorhub.space/calculators/mortgage')),
      }}
    />
  );
}