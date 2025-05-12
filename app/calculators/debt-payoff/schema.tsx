import { Metadata } from 'next';

// Define the JSON-LD schema for the debt payoff calculator
export function generateDebtPayoffSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Debt Payoff Calculator',
        'description': 'Create a personalized debt elimination plan with our calculator that compares different payoff strategies and provides a clear path to becoming debt-free.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Multiple debt management',
          'Debt snowball strategy simulation',
          'Debt avalanche strategy simulation',
          'Custom payoff strategy planning',
          'Interest savings calculation',
          'Payoff timeline visualization',
          'Payment scheduling',
          'Progress tracking metrics',
          'PDF export functionality',
          'Visual debt reduction charts'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/debt-payoff`,
            'description': 'Calculate your debt payoff timeline and strategy'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Debt Payoff Strategies'
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
            'name': 'Debt Payoff Calculator',
            'item': `${baseUrl}/calculators/debt-payoff`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is the debt snowball method?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The debt snowball method, popularized by Dave Ramsey, focuses on paying off debts from smallest balance to largest, regardless of interest rates. You make minimum payments on all debts while directing extra money toward the smallest balance first. Once that debt is paid off, you roll its payment amount to the next smallest debt, creating a "snowball" effect of increasing payment power. This approach provides quick psychological wins as debts are eliminated faster, which can help maintain motivation throughout your debt repayment journey. Research by the Harvard Business Review found that consumers using this method were more likely to stay focused and successfully eliminate their debt compared to other approaches.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is the debt avalanche method?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The debt avalanche method prioritizes paying off debts with the highest interest rates first, while making minimum payments on all other debts. Mathematically, this strategy minimizes total interest paid and typically results in a faster overall payoff timeline. For example, if you have a $5,000 credit card at 22% APR and a $3,000 card at 15% APR, the avalanche method would direct extra payments to the 22% card first, even though it has a higher balance. Once the highest-interest debt is eliminated, you move to the next highest, and so on. The avalanche method is optimal for those who are motivated by financial optimization rather than quick psychological wins.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How much should I allocate to debt repayment each month?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Financial experts recommend dedicating 15-20% of your take-home pay toward debt repayment, excluding mortgage payments. However, the ideal amount depends on your financial situation and debt payoff timeline goals. To determine your optimal payment: 1) Calculate your total minimum payments; 2) Review your budget to identify any non-essential spending that could be redirected to debt; 3) Consider increasing income temporarily through side work; and 4) Set a realistic deadline for becoming debt-free and work backward to determine the monthly payment required. Remember that even an extra $50-100 per month can significantly accelerate your payoff timeline—adding just $100 monthly to a $5,000 balance at 18% APR reduces the payoff time from 145 to 40 months and saves over $2,000 in interest.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Should I save money or pay off debt first?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The recommended approach is a balanced one: first establish a small emergency fund of $1,000-2,000 to avoid new debt from unexpected expenses, then focus on high-interest debt (above 8-10%), while still contributing to retirement accounts at least up to any employer match. For debts with interest rates below 5-6%, the mathematical advantage may favor investing over accelerated repayment, as the stock market has historically returned 7-10% annually over the long term. The decision also depends on psychological factors—some people prefer the guaranteed return of debt payoff and the security of eliminating monthly obligations, while others prioritize investment growth potential. Ultimately, the best strategy combines elements of both saving and debt reduction.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What strategies can help me pay off debt faster?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'To accelerate debt payoff: 1) Use windfalls (tax refunds, bonuses, gifts) for debt reduction rather than spending; 2) Make bi-weekly instead of monthly payments to squeeze in an extra payment annually; 3) Round up payments—if your minimum is $83, pay $100; 4) Temporarily reduce retirement contributions above the matched amount; 5) Negotiate lower interest rates with creditors or explore balance transfers; 6) Consider a side gig dedicated solely to debt repayment; 7) Implement a spending freeze for 30-90 days on discretionary categories; 8) Sell unused items and apply proceeds to debt; 9) Automate payments to prevent missed deadlines and additional fees; and 10) Regularly review and update your debt payoff plan as your financial situation changes.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Debt Payoff Calculator | Create Your Debt Freedom Plan',
  description: 'Create a personalized debt elimination plan comparing snowball vs. avalanche methods with our free calculator that shows your path to becoming debt-free.',
  keywords: [
    'debt payoff calculator',
    'debt freedom calculator',
    'snowball method calculator',
    'avalanche method calculator',
    'debt elimination calculator',
    'debt repayment strategy',
    'debt free calculator',
    'debt reduction planner',
    'interest savings calculator',
    'multiple debt calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function DebtPayoffSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateDebtPayoffSchema('https://calculatorhub.space/calculators/debt-payoff')),
      }}
    />
  );
}