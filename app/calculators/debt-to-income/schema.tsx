import { Metadata } from 'next';

// Define the JSON-LD schema for the debt-to-income calculator
export function generateDebtToIncomeSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Debt-to-Income Ratio Calculator',
        'description': 'Calculate your debt-to-income ratio to understand your financial health and determine your borrowing capacity for mortgages and other loans.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Front-end and back-end DTI calculation',
          'Loan qualification assessment',
          'Visual ratio breakdown',
          'Housing expense ratio analysis',
          'Non-housing debt ratio analysis',
          'Customizable debt categories',
          'Income adjustment planning',
          'Loan approval likelihood estimation',
          'PDF export functionality',
          'Financial health indicators'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/debt-to-income`,
            'description': 'Calculate your debt-to-income ratio'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Debt-to-Income Analysis'
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
            'name': 'Debt-to-Income Ratio Calculator',
            'item': `${baseUrl}/calculators/debt-to-income`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is a debt-to-income ratio and how is it calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Your debt-to-income (DTI) ratio is the percentage of your gross monthly income that goes toward paying debts. It\'s calculated by dividing your total monthly debt payments by your gross monthly income and multiplying by 100. Lenders use two types of DTI: front-end ratio, which includes only housing expenses (mortgage/rent, property taxes, insurance), and back-end ratio, which includes all debt obligations. For example, if your gross monthly income is $6,000 and your monthly debt payments total $2,100, your back-end DTI would be 35% ($2,100 ÷ $6,000 × 100). DTI is a key factor lenders use to evaluate your ability to manage monthly payments and repay debts.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is considered a good debt-to-income ratio?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Lenders generally prefer a front-end DTI ratio below 28% and a back-end ratio below 36%, with these thresholds considered good for financial health. DTI ratios fall into distinct categories: below 36% is considered excellent, allowing for optimal loan terms; 36-42% is good but may slightly impact borrowing options; 43-49% is the maximum threshold for many qualified mortgages and indicates financial strain; and 50% or higher is considered poor, significantly limiting loan options and signaling potential financial distress. For conventional mortgages, 45% is typically the maximum allowed back-end ratio, while FHA loans might permit up to 50% for borrowers with compensating factors like excellent credit or substantial down payment.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does my debt-to-income ratio affect loan approval and interest rates?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Your debt-to-income ratio significantly influences both loan approval decisions and the interest rates you\'re offered. A lower DTI ratio demonstrates stronger financial capacity to take on new debt, improving approval chances and qualifying you for lower interest rates. For example, improving your DTI from 42% to 36% could reduce a mortgage rate by 0.25-0.5%, potentially saving thousands over the loan term. Lenders view DTI as a future performance indicator—research shows borrowers with DTIs exceeding 43% have significantly higher default rates. For auto loans and credit cards, DTI impacts both approval and credit limits, with each 5% improvement in DTI potentially qualifying you for 15-20% higher borrowing capacity.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are effective ways to improve my debt-to-income ratio?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'To improve your debt-to-income ratio, use a two-pronged approach targeting both components of the equation. To reduce debt: 1) Pay down high-interest debts first; 2) Avoid taking on new debt; 3) Consider debt consolidation to lower monthly payments; 4) Refinance existing loans for better terms; and 5) Sell assets to eliminate selected debts. To increase income: 1) Request a salary review or promotion; 2) Take on side gigs or part-time work; 3) Monetize skills through freelancing; 4) Rent out available space or assets; and 5) Ask a lender about including non-borrower household income. For quick improvement before loan applications, focus on paying down revolving debt like credit cards, which can provide the most immediate DTI benefit.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How is a debt-to-income ratio different from a credit score?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'While both affect lending decisions, debt-to-income ratio and credit score measure different aspects of financial health. Credit scores (300-850) primarily reflect payment history and credit management, focusing on how reliably you\'ve repaid past debts. DTI ratio measures current financial capacity, showing what percentage of your income goes toward debt payments. A high credit score with a high DTI creates a mixed profile—you\'ve handled debt well historically but may be overextended currently. Conversely, a low credit score with a low DTI suggests payment problems despite having financial capacity. Lenders evaluate both metrics, with credit scores typically influencing approval and interest rates, while DTI determines loan amount and affordability.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Debt-to-Income Ratio Calculator | Analyze Your Financial Health',
  description: 'Calculate your debt-to-income ratio to understand your financial health and determine your borrowing capacity for mortgages and other loans.',
  keywords: [
    'debt-to-income calculator',
    'DTI calculator',
    'debt ratio calculator',
    'mortgage qualification calculator',
    'front-end DTI',
    'back-end DTI',
    'loan qualification tool',
    'financial health calculator',
    'borrowing capacity calculator',
    'housing ratio calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function DebtToIncomeSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateDebtToIncomeSchema('https://calculatorhub.space/calculators/debt-to-income')),
      }}
    />
  );
}