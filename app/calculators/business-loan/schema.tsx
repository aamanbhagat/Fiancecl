import { Metadata } from 'next';

// Define the JSON-LD schema for the business loan calculator
export function generateBusinessLoanSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Business Loan Calculator',
        'description': 'Calculate business loan payments, analyze costs, understand amortization schedules, and determine break-even points for your business financing.',
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
          'Total interest and cost analysis',
          'Amortization schedule visualization',
          'Break-even point calculation',
          'Variable rate modeling',
          'Prepayment savings analysis',
          'Balloon payment inclusion',
          'Processing fee calculation',
          'Interactive charts and graphs',
          'PDF export functionality'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/business-loan`,
            'description': 'Calculate business loan payments and total financing costs'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Business Loan'
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
            'name': 'Business Loan Calculator',
            'item': `${baseUrl}/calculators/business-loan`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How is a business loan payment calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'A business loan payment is calculated using the formula: Payment = P × (r × (1 + r)^n) ÷ ((1 + r)^n - 1), where P = Principal amount, r = periodic interest rate (annual rate ÷ periods per year), and n = total number of payments. This formula accounts for both principal and interest components, ensuring the loan is fully amortized over its term. Additional factors like processing fees, down payments, and balloon payments may also affect the final payment amount.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is the Debt Service Coverage Ratio and why is it important?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The Debt Service Coverage Ratio (DSCR) is a financial metric that measures a business\'s ability to service debt with its current income. It\'s calculated by dividing annual net operating income by annual debt payments. Lenders typically require a minimum DSCR of 1.25, meaning your business generates 25% more income than needed for loan payments. A DSCR below 1.0 indicates negative cash flow, 1.0-1.24 is considered risky, 1.25-1.5 is acceptable to most lenders, and above 1.5 demonstrates a strong financial position. This ratio is critical for loan approvals and determining borrowing capacity.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do loan terms affect total cost and monthly payments?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Loan term length significantly impacts both monthly payments and total interest costs. Shorter terms (e.g., 3 years) result in higher monthly payments but substantially lower total interest costs. For example, a $250,000 loan at 6% would cost $7,643 monthly over 3 years with $25,148 total interest, versus $4,831 monthly over 5 years with $39,860 interest, or $2,776 monthly over 10 years with $83,120 interest. Shorter terms offer faster debt elimination and financial freedom, while longer terms provide improved cash flow flexibility but at a higher total cost. The optimal term depends on your business\'s cash flow needs and long-term financial strategy.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between fixed and variable interest rates for business loans?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Fixed rate business loans maintain the same interest rate throughout the loan term, providing payment stability and predictability. They\'re ideal for long-term planning and fixed budgets, offering protection from rising interest rates, though typically starting with slightly higher rates. Variable rate loans have interest rates that fluctuate based on market indexes, offering potential savings but increased uncertainty. They often start with lower initial rates and benefit from falling interest environments. For short-term loans (1-3 years), variable rates often provide cost advantages, while for longer terms, fixed rates may offer better stability, especially in low-rate environments where future increases are likely.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What additional fees should I consider when calculating the true cost of a business loan?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Beyond principal and interest, business loans often include additional costs that impact the true price of borrowing. Common fees include: 1) Origination fees - typically 1-5% of the loan amount; 2) Application fees - $75-500 depending on the lender; 3) Underwriting fees - $1,000-5,000 for larger loans; 4) Closing costs - including legal, appraisal, and documentation fees; and 5) Prepayment penalties - often 1-3% of the remaining balance. The Annual Percentage Rate (APR) incorporates all these costs into an annualized rate, calculated as ((Fees + Total Interest) ÷ Principal) ÷ Loan Term in Years × 100. This provides a more comprehensive view of borrowing costs than the interest rate alone.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Business Loan Calculator | Calculate Commercial Financing Costs',
  description: 'Calculate business loan payments, analyze costs, understand amortization schedules, and determine break-even points for your business financing needs.',
  keywords: [
    'business loan calculator',
    'commercial loan calculator',
    'business financing calculator',
    'loan amortization calculator',
    'business debt calculator',
    'loan payment calculator',
    'break-even calculator',
    'DSCR calculator',
    'variable rate loan calculator',
    'balloon payment calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function BusinessLoanSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateBusinessLoanSchema('https://calculatorshub.store/calculators/business-loan')),
      }}
    />
  );
}