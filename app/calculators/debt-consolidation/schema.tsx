import { Metadata } from 'next';

// Define the JSON-LD schema for the debt consolidation calculator
export function generateDebtConsolidationSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Debt Consolidation Calculator',
        'description': 'Compare your current debts with a consolidation loan to see if you can save money and simplify your payments.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Multiple debt tracking',
          'Interest savings analysis',
          'Monthly payment comparison',
          'Break-even calculation',
          'Consolidation loan modeling',
          'Amortization schedule visualization',
          'Origination fee impact analysis',
          'Interactive payment comparison charts',
          'PDF export functionality',
          'Payoff timeline visualization'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/debt-consolidation`,
            'description': 'Compare debt consolidation options and calculate potential savings'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Debt Consolidation Loan'
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
            'name': 'Debt Consolidation Calculator',
            'item': `${baseUrl}/calculators/debt-consolidation`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is debt consolidation?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Debt consolidation is the process of combining multiple debts into a single, new loan or credit line. This strategy simplifies your finances by replacing several monthly payments with just one, potentially at a lower interest rate and with more manageable terms. Common types of debt that people consolidate include credit card balances, student loans, auto loans, store credit accounts, and medical debt. Debt consolidation isn\'t a one-size-fits-all solution, but when used appropriately, it can be a powerful tool for regaining control of your financial situation and potentially saving money on interest payments.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are the different methods of debt consolidation?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Common debt consolidation methods include: 1) Balance Transfer Credit Cards - offering 0% introductory APRs for 12-21 months with typical 3-5% transfer fees, best for credit card debt; 2) Personal Consolidation Loans - fixed-rate loans with terms of 2-7 years and APRs ranging from 6-36%, suitable for multiple debt types; 3) Home Equity Options - using your home\'s equity to secure a loan with lower rates (4-10%) over 5-30 years, best for large debt amounts but risks foreclosure; and 4) 401(k) Loans - borrowing against retirement savings with rates around prime + 1-2% over 5 years, generally considered a last resort due to impact on retirement savings and potential penalties.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do I know if debt consolidation is right for me?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Debt consolidation may be right for you if: 1) You\'re paying high interest rates (above 15%) and qualify for a lower rate; 2) You have good credit (680+) to qualify for competitive consolidation offers; 3) You\'re juggling multiple monthly debt payments that are becoming stressful to manage; 4) You have stable income to confidently commit to the new payment schedule; and 5) You have a plan to avoid accumulating new debt. Warning signs that consolidation might not be appropriate include: consistently overspending, a debt-to-income ratio exceeding 50%, when the math doesn\'t result in savings, when you\'re close to paying off existing debts, or if you have unstable income.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is the break-even analysis for debt consolidation?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The break-even analysis calculates the time required for interest savings to exceed any fees associated with debt consolidation. The formula is: Break-Even (months) = Consolidation Fees ÷ Monthly Interest Savings. For example, with a $300 balance transfer fee (3% of $10,000), current monthly interest of $175, and new monthly interest of $50, your monthly savings would be $125. The break-even point would be $300 ÷ $125 = 2.4 months. This analysis is crucial because it determines whether consolidation makes financial sense if you plan to take longer than the break-even period to pay off the debt.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are common mistakes to avoid when consolidating debt?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Common debt consolidation mistakes include: 1) Not addressing the root cause - consolidating without changing spending habits that created the debt; 2) Ignoring the fine print - overlooking fees, rate changes, or terms that may negate benefits; 3) Closing original accounts - immediately closing credit cards after transferring balances, which can harm your credit score; and 4) Extending repayment too long - choosing the longest loan term to minimize monthly payments without considering the higher total interest cost. Better approaches include creating a budget alongside consolidation, reading all terms carefully, keeping accounts open with zero balances, and choosing the shortest term you can reasonably afford.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Debt Consolidation Calculator | Compare Loan Options & Save Money',
  description: 'Compare your current debts with consolidation options to see if you can save money and simplify your payments with our free calculator.',
  keywords: [
    'debt consolidation calculator',
    'loan consolidation calculator',
    'debt refinance calculator',
    'consolidation savings calculator',
    'debt interest calculator',
    'multiple debt calculator',
    'credit card consolidation',
    'personal loan calculator',
    'debt repayment calculator',
    'balance transfer calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function DebtConsolidationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateDebtConsolidationSchema('https://calculatorhub.space/calculators/debt-consolidation')),
      }}
    />
  );
}