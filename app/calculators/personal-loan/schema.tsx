import { Metadata } from 'next';

// Define the JSON-LD schema for the personal loan calculator
export function generatePersonalLoanSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Personal Loan Calculator',
        'description': 'Calculate monthly payments, total interest costs, and compare different personal loan options with our comprehensive calculator.',
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
          'Total interest cost calculation',
          'Amortization schedule generation',
          'Loan comparison tool',
          'Early payoff scenario modeling',
          'Debt consolidation analysis',
          'APR vs interest rate comparison',
          'Loan affordability assessment',
          'PDF export functionality',
          'Prepayment impact calculation'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/personal-loan`,
            'description': 'Calculate monthly payments and total costs for personal loans'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Personal Loan Analysis'
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
            'name': 'Personal Loan Calculator',
            'item': `${baseUrl}/calculators/personal-loan`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What factors determine personal loan interest rates?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Personal loan interest rates are determined by multiple factors: 1) Credit score - typically the most influential factor, with excellent scores (740+) qualifying for rates 5-10 percentage points lower than fair scores (580-669); 2) Income and debt-to-income ratio - lenders assess your ability to repay based on your income relative to existing debt obligations; 3) Loan amount and term - larger loans or longer terms may have different rates due to increased risk exposure; 4) Secured vs. unsecured status - loans backed by collateral generally offer lower rates; 5) Relationship discounts - existing banking relationships may qualify you for rate reductions; 6) Market conditions - benchmark interest rates influence the overall rate environment; 7) Lender type - traditional banks, credit unions, online lenders, and peer-to-peer platforms each have different rate structures; and 8) Loan purpose - some lenders offer better rates for specific uses like debt consolidation. Rate differences between the best and worst offers for the same borrower can exceed 10 percentage points, highlighting the importance of comparison shopping across multiple lenders.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between secured and unsecured personal loans?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Secured and unsecured personal loans differ fundamentally in their collateral requirements and associated risks. Secured personal loans require collateral—valuable assets like vehicles, savings accounts, certificates of deposit, or investment accounts that the lender can claim if you default. This reduced lender risk typically translates to lower interest rates (often 2-5 percentage points less), higher borrowing limits, longer repayment terms, and more lenient approval criteria, making them accessible to borrowers with fair or rebuilding credit. However, you risk losing the pledged asset if you fail to repay. Unsecured personal loans require no collateral, relying solely on your creditworthiness for approval. They offer the advantage of not putting specific assets at risk and typically feature faster approval processes with less documentation. However, they generally have stricter qualification requirements, higher interest rates, lower borrowing limits, and shorter repayment terms. Most personal loans are unsecured, but secured options can be valuable for borrowers seeking better terms or working with credit limitations.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How can I qualify for the best personal loan rates?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'To qualify for the best personal loan rates, focus on these key strategies: 1) Improve your credit score - aim for 740+ by paying bills on time, reducing credit utilization below 30%, disputing errors on your credit report, and avoiding new credit applications before applying; 2) Reduce your debt-to-income ratio to below 36% by paying down existing debt and/or increasing income; 3) Apply with a co-signer who has excellent credit if your own profile needs strengthening; 4) Choose shorter loan terms, which typically carry lower interest rates despite higher monthly payments; 5) Consider a secured loan using collateral like savings accounts or CDs; 6) Compare offers from multiple lenders, including traditional banks, credit unions (which often offer lower rates), and online lenders; 7) Look for relationship discounts from institutions where you already have accounts; 8) Set up autopay, which many lenders reward with rate discounts of 0.25-0.5%; and 9) Negotiate with lenders using competing offers as leverage. Remember that prequalification with soft credit checks allows you to explore potential rates without impacting your credit score.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are alternatives to personal loans?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Several alternatives to personal loans exist, each with distinct advantages and disadvantages: 1) Credit cards - accessible but typically carry higher interest rates unless you qualify for a 0% APR promotional offer, which can provide interest-free financing for 12-21 months; 2) Home equity loans or lines of credit - offer lower interest rates secured by your home but put your property at risk and involve closing costs; 3) 401(k) loans - allow borrowing from yourself with no credit check and competitive rates but reduce retirement growth and risk tax penalties if not repaid; 4) Peer-to-peer lending - connects borrowers directly with investors, sometimes offering competitive rates for those with good credit; 5) Family loans - potentially feature favorable terms but can complicate relationships if repayment issues arise; 6) Buy now, pay later services - offer short-term, often interest-free installment plans for specific purchases; 7) Cash advances from employers or dedicated apps - provide early access to earned wages with minimal fees; and 8) Nonprofit credit counseling - offers debt management plans that can consolidate payments and reduce interest rates for those struggling financially. The best alternative depends on your specific needs, repayment timeline, available assets, and creditworthiness.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Should I pay off my personal loan early?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Whether to pay off a personal loan early depends on several financial considerations: 1) Prepayment penalties - first check if your loan includes fees for early repayment, typically ranging from 1-5% of the remaining balance or several months\' interest; 2) Interest savings - paying off high-interest loans early can save significant money; for example, paying off a 5-year, $15,000 loan at 12% APR two years early could save over $1,500 in interest; 3) Opportunity cost - compare the loan\'s interest rate to potential returns from alternative uses of your money, like investing or paying other higher-interest debt; 4) Credit score impact - while paying off installment debt can temporarily lower scores slightly, maintaining positive payment history and reducing overall debt typically benefits your credit profile long-term; 5) Cash flow considerations - weigh the benefits of interest savings against maintaining cash reserves for emergencies; and 6) Psychological benefits - eliminating a debt payment can reduce financial stress and improve monthly cash flow flexibility. For most borrowers with adequate emergency savings and no prepayment penalties, paying off high-interest personal loans early is financially advantageous if the interest rate exceeds potential investment returns.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Personal Loan Calculator | Compare Loan Options & Payments',
  description: 'Calculate monthly payments, total interest costs, and compare different personal loan options with our comprehensive calculator.',
  keywords: [
    'personal loan calculator',
    'loan payment calculator',
    'loan interest calculator',
    'loan comparison tool',
    'debt consolidation calculator',
    'loan amortization calculator',
    'loan payoff calculator',
    'loan affordability calculator',
    'unsecured loan calculator',
    'installment loan calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function PersonalLoanSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generatePersonalLoanSchema('https://calculatorhub.space/calculators/personal-loan')),
      }}
    />
  );
}