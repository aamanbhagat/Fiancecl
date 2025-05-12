import { Metadata } from 'next';

// Define the JSON-LD schema for the student loan calculator
export function generateStudentLoanSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Student Loan Calculator',
        'description': 'Calculate student loan payments, compare repayment plans, and analyze forgiveness options with our comprehensive student loan calculator.',
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
          'Total repayment estimation',
          'Income-driven repayment analysis',
          'Loan forgiveness projection',
          'Refinancing comparison',
          'Extra payment impact calculation',
          'Interest capitalization modeling',
          'Debt-to-income ratio analysis',
          'PDF export functionality',
          'Multiple repayment plan comparison'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/student-loan`,
            'description': 'Calculate student loan payments and compare repayment options'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Student Loan Analysis'
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
            'name': 'Student Loan Calculator',
            'item': `${baseUrl}/calculators/student-loan`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What\'s the difference between federal and private student loans?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Federal and private student loans differ significantly in terms of origination, benefits, and repayment options. Federal student loans are issued by the U.S. Department of Education and offer numerous borrower protections, including fixed interest rates (currently between 5.5% and 7.05% for undergraduates), income-driven repayment plans that cap payments based on income, deferment and forbearance options for financial hardship, loan forgiveness programs for public service and long-term repayment, no credit check requirements (except for PLUS loans), and standardized loan limits. Private student loans, in contrast, are issued by banks, credit unions, and online lenders with terms that vary widely by lender. They typically require credit checks and often a cosigner for students with limited credit history, may have variable or fixed interest rates based on creditworthiness (ranging from about 4% to 14% or higher), offer far fewer repayment flexibility options, rarely provide forgiveness opportunities, have lender-specific loan limits often based on cost of attendance, and may include origination fees or prepayment penalties. Financial advisors generally recommend exhausting federal loan options before considering private loans due to the significantly better borrower protections and flexibility offered by federal programs.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are income-driven repayment plans and how do they work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Income-driven repayment (IDR) plans are federal student loan programs that tie monthly payments to a borrower\'s income and family size, typically capping payments at 10-20% of discretionary income with loan forgiveness after 20-25 years of qualifying payments. The Department of Education currently offers four main IDR options: Income-Based Repayment (IBR), Pay As You Earn (PAYE), Revised Pay As You Earn (REPAYE), and Income-Contingent Repayment (ICR), with a new SAVE (Saving on a Valuable Education) plan being introduced in 2023. These plans calculate "discretionary income" as the difference between your adjusted gross income and 150% of the federal poverty guideline for your family size and location. Monthly payments are recalculated annually based on updated income information and family size that borrowers must certify. Key advantages include affordable payments during periods of lower income, potential forgiveness of remaining balances, and eligibility for Public Service Loan Forgiveness for those working in qualifying public service jobs. However, IDR plans typically extend repayment periods, which may increase the total interest paid over the life of the loan. Additionally, any loan amount forgiven under these plans may be considered taxable income (though forgiveness through PSLF is not taxed). Borrowers can enroll in IDR plans through their federal loan servicer or at StudentAid.gov, with eligibility generally limited to federal Direct Loans and some FFEL Program loans.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does Public Service Loan Forgiveness (PSLF) work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Public Service Loan Forgiveness (PSLF) is a federal program that forgives remaining federal student loan balances for borrowers who have made 120 qualifying monthly payments while working full-time for eligible public service employers. To qualify, you must meet several specific criteria: 1) Have Direct Loans or consolidate other federal loans into a Direct Consolidation Loan; 2) Be enrolled in an income-driven repayment plan; 3) Make 120 qualifying payments (payments need not be consecutive); 4) Work full-time (at least 30 hours per week) for a qualifying employer throughout the payment period; and 5) Complete and submit the PSLF form periodically to certify employment. Qualifying employers include government organizations (federal, state, local, tribal), 501(c)(3) non-profit organizations, and certain other non-profits providing qualifying public services. The program has undergone significant improvements since 2021, including the Limited PSLF Waiver (ended October 2022) and the IDR Account Adjustment (through December 2023), which allowed previously ineligible payment periods to count toward forgiveness. To maximize PSLF benefits: consolidate non-Direct federal loans, certify employment annually rather than waiting until reaching 120 payments, maintain records of all submissions and communications, and stay informed about program changes and temporary waivers. Unlike other forgiveness programs, PSLF forgiveness is tax-free at the federal level.'
            }
          },
          {
            '@type': 'Question',
            'name': 'When does refinancing student loans make sense?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Student loan refinancing involves replacing existing loans with a new private loan at a different interest rate and term, which can be advantageous in specific circumstances. Refinancing typically makes the most sense when: 1) You have private student loans with high interest rates and qualify for significantly lower rates based on improved credit and income since original borrowing; 2) You have a stable, high-income career and strong emergency savings; 3) You won\'t benefit from federal loan forgiveness programs like PSLF or income-driven forgiveness; 4) You\'re comfortable giving up federal protections like income-driven repayment plans and extended deferment/forbearance options; and 5) Current interest rate environments favor refinancing. However, refinancing federal loans into private loans is generally inadvisable if: you work in public service and might qualify for PSLF; your income is variable or uncertain; you may need income-driven repayment options in the future; or you anticipate needing deferment or forbearance protections. When evaluating refinancing offers, compare the total cost over the full repayment period rather than focusing solely on monthly payment amounts. Factors to consider include fixed vs. variable interest rates, loan term length, potential fees, lender reputation and customer service quality, hardship options, and available discounts such as autopay reductions.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does interest capitalization affect student loan repayment?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Interest capitalization occurs when unpaid interest is added to your principal balance, causing future interest to accrue on the higher principal amount—essentially charging "interest on interest." This can significantly increase the total amount repaid over the life of a student loan. For federal student loans, capitalization typically occurs at specific events: when a grace period ends, when deferment or forbearance periods end, when your loan status changes (such as from deferred to repayment), when you consolidate federal loans, or when you fail to recertify income for income-driven repayment plans or switch between different repayment plans. Private loans have lender-specific capitalization policies, often capitalizing interest more frequently. To illustrate the impact: if you have a $30,000 loan with $5,000 in accrued interest that capitalizes, your new principal becomes $35,000, and future interest calculations use this higher amount—potentially adding thousands to your overall repayment. Strategies to minimize the effects of capitalization include: making at least interest-only payments during periods of deferment or forbearance when possible, recertifying income-driven repayment plans on time, avoiding frequent switching between repayment plans, and targeting extra payments toward loans with already capitalized interest. Recent changes under the SAVE plan will eliminate most capitalization events for federal loans enrolled in this new income-driven repayment plan, providing significant long-term savings for many borrowers.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Student Loan Calculator | Education Debt Repayment Planner',
  description: 'Calculate student loan payments, compare repayment plans, and analyze forgiveness options with our comprehensive student loan calculator.',
  keywords: [
    'student loan calculator',
    'education debt calculator',
    'loan repayment estimator',
    'PSLF calculator',
    'income-driven repayment calculator',
    'student loan refinancing calculator',
    'loan forgiveness estimator',
    'federal student loan calculator',
    'private student loan calculator',
    'student debt payoff planner'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function StudentLoanSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateStudentLoanSchema('https://calculatorhub.space/calculators/student-loan')),
      }}
    />
  );
}