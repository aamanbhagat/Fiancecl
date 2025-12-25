import { Metadata } from 'next';

// Define the JSON-LD schema for the refinance calculator
export function generateRefinanceSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Refinance Calculator',
        'description': 'Calculate potential savings from refinancing your mortgage, determine break-even points, and analyze different refinance scenarios with our comprehensive calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Monthly payment comparison',
          'Total interest savings calculation',
          'Break-even point analysis',
          'Cash-out refinancing options',
          'Term reduction modeling',
          'Closing cost analysis',
          'APR comparison',
          'Amortization schedule generation',
          'PDF export functionality',
          'Multiple refinance scenario comparison'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/refinance`,
            'description': 'Calculate potential savings from refinancing your mortgage'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Mortgage Refinance Analysis'
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
            'name': 'Refinance Calculator',
            'item': `${baseUrl}/calculators/refinance`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'When does refinancing a mortgage make financial sense?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Refinancing makes financial sense in several scenarios: 1) Lower interest rates - the traditional rule suggests refinancing when rates are at least 0.75-1% below your current rate, though this varies with loan size and how long you\'ll stay in the home; 2) Improved credit score - if your credit has significantly improved since your original mortgage, you might qualify for much better rates; 3) Shortened loan term - refinancing from a 30-year to a 15-year mortgage can save substantial interest over the long term; 4) Converting from adjustable to fixed rate - locking in a predictable payment before rates rise; 5) Eliminating mortgage insurance - refinancing can remove PMI if your home has appreciated enough to give you 20% equity; 6) Debt consolidation - using home equity to consolidate high-interest debts might make sense if you have the discipline to avoid accumulating new debt; and 7) Major financial needs - accessing equity for significant expenses like education or home improvements. To determine if refinancing makes sense, calculate the break-even point by dividing closing costs by monthly savings to see how many months it takes to recoup costs. Refinancing generally doesn\'t make sense if you plan to move before reaching this break-even point.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What costs are associated with refinancing a mortgage?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Refinancing involves various costs that typically range from 2-5% of the loan amount: 1) Loan origination fees (0.5-1% of loan amount) - charged by lenders for processing the new loan; 2) Discount points (optional) - prepaid interest that lowers your interest rate, with each point costing 1% of the loan amount; 3) Application fee ($250-500) - covers the lender\'s administrative costs; 4) Appraisal fee ($300-600) - required to determine current home value; 5) Credit report fee ($30-50) - covers checking your credit history; 6) Title search and insurance ($700-900) - protects against ownership disputes; 7) Attorney/settlement fees ($500-1,000) - for document preparation and closing services; 8) Recording fees ($25-250) - charged by local government to record the new mortgage; 9) Prepayment penalty (varies) - some original mortgages charge this for early payoff. Some refinance options like FHA Streamline or VA IRRRL have reduced costs. While many lenders offer "no-closing-cost" refinances, these typically either roll fees into the loan amount (increasing your principal) or charge a slightly higher interest rate to offset their costs. Understanding the full cost structure is essential for accurately calculating your refinance break-even point.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are the different types of mortgage refinance options?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Several mortgage refinance options address different financial needs: 1) Rate-and-term refinance - the most common type that replaces your existing mortgage with one offering better terms, either a lower interest rate or different loan duration; 2) Cash-out refinance - borrow more than you currently owe and take the difference in cash, useful for debt consolidation or home improvements, but resulting in higher loan balances and potentially higher rates; 3) Cash-in refinance - bring money to closing to pay down principal, potentially securing better rates or eliminating mortgage insurance; 4) FHA Streamline refinance - simplified process with reduced documentation and potentially no appraisal for existing FHA loans; 5) VA Interest Rate Reduction Refinance Loan (IRRRL) - streamlined option for VA loan holders with minimal paperwork and potentially no appraisal; 6) USDA Streamline refinance - simplified refinancing for existing USDA loan borrowers; 7) Reverse mortgage refinance - for seniors to potentially access more equity or get better terms on existing reverse mortgages; and 8) Short refinance - rare option where lenders agree to refinance for less than the current mortgage balance for struggling homeowners. Each type has specific qualification requirements, benefits, and limitations, making it important to match the refinance option to your financial goals.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do I calculate the break-even point for refinancing?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Calculating the break-even point for refinancing helps determine how long it takes to recover the costs of refinancing through monthly savings. The basic formula is: Break-even point (in months) = Total refinancing costs ÷ Monthly savings. For example, if refinancing costs $4,000 and saves $200 monthly, the break-even point is 20 months. However, a more comprehensive calculation should consider: 1) Tax implications - if you itemize deductions, refinancing may change your mortgage interest deduction; 2) Time value of money - future savings are worth less than present costs; 3) Opportunity cost - what else you could do with the money spent on closing costs; 4) Loan term extension - restarting a 30-year clock on a partially paid mortgage extends your total payment timeline; 5) Additional principal payments - if you\'ll pay the same amount monthly despite a lower required payment, putting the difference toward principal; and 6) How long you plan to stay in the home. Online refinance calculators can help incorporate these factors. As a rule of thumb, refinancing typically makes sense if you\'ll stay in the home at least 2-3 years beyond the break-even point to realize meaningful savings.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What should I consider before getting a cash-out refinance?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Before pursuing a cash-out refinance, consider these important factors: 1) Purpose of the cash - using funds for home improvements or debt consolidation can be financially sound, while vacation or luxury purchases may not justify the long-term cost; 2) New loan terms - cash-out refinances typically come with slightly higher interest rates than rate-and-term refinances; 3) Equity reduction - tapping equity reduces your ownership stake and increases foreclosure risk; 4) Closing costs - typically 2-5% of the loan amount, which can significantly impact the net cash received; 5) Tax implications - interest may be tax-deductible if used for home improvements, but not necessarily for other purposes since the Tax Cuts and Jobs Act; 6) Alternative options - home equity loans or HELOCs might be more cost-effective if your existing mortgage already has favorable terms; 7) Future housing plans - if you might sell within a few years, the closing costs may outweigh the benefits; 8) Total debt picture - while consolidating high-interest debt can make sense mathematically, it requires financial discipline to avoid accumulating new debt; and 9) Loan-to-value ratio - most lenders cap cash-out refinances at 80% LTV, though FHA allows up to 85%. Cash-out refinancing should be approached as a strategic financial move rather than an easy way to access cash.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Refinance Calculator | Analyze Mortgage Refinancing Options',
  description: 'Calculate potential savings from refinancing your mortgage, determine break-even points, and analyze different refinance scenarios with our comprehensive calculator.',
  keywords: [
    'refinance calculator',
    'mortgage refinance calculator',
    'refinance savings calculator',
    'break-even calculator',
    'cash-out refinance calculator',
    'mortgage comparison tool',
    'interest savings calculator',
    'refinancing cost calculator',
    'loan term calculator',
    'mortgage APR comparison'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function RefinanceSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateRefinanceSchema('https://calculatorshub.store/calculators/refinance')),
      }}
    />
  );
}