import { Metadata } from 'next';

// Define the JSON-LD schema for the credit cards payoff calculator
export function generateCreditCardsPayoffSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Credit Cards Payoff Calculator',
        'description': 'Create a debt payoff strategy for multiple credit cards, compare different methods, and track your journey to becoming debt-free.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Multiple credit card management',
          'Debt snowball strategy simulation',
          'Debt avalanche strategy simulation',
          'Custom strategy planning',
          'Payoff timeline visualization',
          'Interest savings comparison',
          'Payment schedule generation',
          'Progress tracking metrics',
          'PDF export functionality',
          'Visual debt reduction charts'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/credit-cards-payoff`,
            'description': 'Compare debt payoff strategies for multiple credit cards'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Credit Card Debt Strategies'
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
            'name': 'Credit Cards Payoff Calculator',
            'item': `${baseUrl}/calculators/credit-cards-payoff`
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
              'text': 'The debt snowball method, popularized by Dave Ramsey, focuses on paying off debts from smallest balance to largest, regardless of interest rates. You make minimum payments on all debts while putting extra money toward the smallest balance. Once that debt is eliminated, you "snowball" its payment amount to the next-smallest debt, creating increasing momentum. The psychological benefit of quick wins makes this method effective for many people—a National Bureau of Economic Research study found consumers using this approach were more likely to stick with their debt repayment plan. Though mathematically it may cost more in interest than the avalanche method, its psychological advantages often lead to greater success in becoming debt-free.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is the debt avalanche method?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The debt avalanche method prioritizes paying off debts from highest interest rate to lowest, mathematically minimizing interest and total repayment time. With this approach, you make minimum payments on all debts while directing extra funds to the highest-interest debt first. For example, with three credit cards charging 24.99%, 19.99%, and 14.99% APR respectively, you\'d focus on the 24.99% card first regardless of balance size. Once that\'s paid off, move to the 19.99% card, and so on. This method typically saves hundreds or thousands in interest compared to the snowball method. For someone with $15,000 across multiple cards, the avalanche method might save $1,000-2,000 in interest over the repayment period.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do I determine which debt payoff strategy is best for me?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The best debt payoff strategy depends on both financial and psychological factors. Consider these aspects: 1) If your credit card interest rates vary significantly (5%+ difference), the avalanche method will save more money; 2) If you struggle with motivation or have several small balances, the snowball method\'s quick wins may be more effective; 3) For balances that are similar in size with similar interest rates, either method will work comparably; 4) Some people benefit from a hybrid approach—starting with snowball for motivation, then switching to avalanche for larger balances. Research shows the most important factor is consistency, so choose the strategy you\'re most likely to maintain over time.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How much extra should I pay toward my credit card debt each month?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Financial experts recommend allocating as much as realistically sustainable toward credit card debt—ideally 15-20% of your take-home pay, though even $50-100 above minimum payments significantly accelerates payoff. For example, on $10,000 of debt at 18% APR, increasing monthly payments from $250 to $350 cuts the payoff timeline from 62 months to 36 months and saves $2,400 in interest. To determine your maximum sustainable payment: 1) Create a detailed budget identifying potential expense reductions; 2) Consider temporary income increases through side work; 3) Avoid the temptation to reduce payments when balances decrease; and 4) Automate payments to maintain consistency. Every additional dollar toward debt repayment offers an immediate guaranteed return equal to your interest rate.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Should I consolidate my credit card debt?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Debt consolidation may be beneficial if you can secure a significantly lower interest rate than your current weighted average. Options include: 1) 0% APR balance transfer cards, which typically charge 3-5% transfer fees but offer 12-21 months interest-free (best for those who can pay off debt within the promotional period); 2) Personal debt consolidation loans, often offering fixed rates between 6-36% depending on credit score; 3) Home equity loans or HELOCs (lowest rates but risk your home as collateral); and 4) 401(k) loans (avoid if possible due to retirement impact). Consolidation works best when combined with a concrete payoff plan and addressing the underlying spending issues that created the debt initially.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Credit Cards Payoff Calculator | Multiple Card Debt Strategies',
  description: 'Create a debt payoff strategy for multiple credit cards with our free calculator that compares snowball and avalanche methods to find your fastest path to freedom.',
  keywords: [
    'credit cards payoff calculator',
    'multiple card debt calculator',
    'debt snowball calculator',
    'debt avalanche calculator',
    'debt payoff strategy',
    'credit card debt elimination',
    'debt repayment planner',
    'interest savings calculator',
    'debt freedom calculator',
    'multiple debt comparison tool'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function CreditCardsPayoffSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateCreditCardsPayoffSchema('https://calculatorhub.space/calculators/credit-cards-payoff')),
      }}
    />
  );
}