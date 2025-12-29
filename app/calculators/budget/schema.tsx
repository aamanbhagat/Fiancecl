import { Metadata } from 'next';

// Define the JSON-LD schema for the budget calculator
export function generateBudgetSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Budget Calculator',
        'description': 'Track your income, expenses, and savings to create a balanced budget that helps you achieve your financial goals.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Income and expense tracking',
          'Budget category management',
          'Expense breakdown analysis',
          'Savings rate calculation',
          '50/30/20 budget rule comparison',
          'Visual expense distribution',
          'Budget health indicators',
          'Monthly trend visualization',
          'PDF export functionality',
          'Custom category creation'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/budget`,
            'description': 'Create and analyze your personal budget'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Personal Budget'
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
            'name': 'Budget Calculator',
            'item': `${baseUrl}/calculators/budget`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How should I allocate my monthly income?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'A popular framework is the 50/30/20 rule, which suggests allocating 50% of your income to needs (housing, utilities, food, transportation), 30% to wants (dining out, entertainment, hobbies), and 20% to savings and debt repayment. This provides a balanced approach that ensures essential expenses are covered while still allowing for enjoyment and future financial security. Adjust these percentages based on your specific situation, such as higher housing costs in expensive areas or aggressive debt repayment goals.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Why is tracking expenses important for budgeting?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Expense tracking is the foundation of successful budgeting because it creates awareness of your spending patterns. Studies show that people who track expenses consistently save up to 20% more than those who don\'t, simply through increased awareness. Tracking helps identify forgotten recurring expenses, highlights spending categories that may be disproportionate to their value, reveals opportunities for easy spending cuts, and creates accountability for financial decisions. Most people significantly underestimate how much they spend in discretionary categories until they start tracking.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What budgeting method works best for beginners?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'For beginners, the 50/30/20 method is often most effective because of its simplicity. It requires minimal tracking while providing clear guidelines for spending allocation. Another beginner-friendly approach is the envelope system (physical or digital), which allocates specific amounts to spending categories. The most important aspect for beginners is selecting a method they\'ll actually use consistently. Start with basic tracking of expenses for 30 days to understand current spending patterns before attempting a more structured budgeting method. Remember that the best budget is one that you can maintain over time.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How often should I review and adjust my budget?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'A well-maintained budget requires multiple review frequencies: weekly check-ins (15 minutes) to track expenses and ensure you\'re on target, monthly reviews (30 minutes) to compare actual spending with your plan and make small adjustments, quarterly planning sessions (1 hour) to adjust budget categories based on changing priorities or life circumstances, and annual overhauls (2-3 hours) for comprehensive review and long-term financial planning. These regular reviews help identify problems early and keep your budget aligned with your evolving financial goals and life situation.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How can I handle irregular expenses in my budget?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Irregular expenses like annual insurance premiums, car repairs, or holiday gifts can derail budgets when not properly planned for. The most effective approach is creating sinking funds—dedicated savings for specific irregular expenses. For example, if your car insurance costs $600 annually, set aside $50 monthly in a dedicated car insurance fund. Review past bank statements and credit card bills to identify all irregular expenses, estimate their annual costs, divide by 12, and include these amounts in your monthly budget. This converts unpredictable expenses into manageable monthly line items, preventing budget emergencies and reducing financial stress.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Budget Calculator | Track Income & Expenses Easily',
  description: 'Create a balanced budget that tracks your income, expenses, and savings with our free calculator. Visualize spending patterns and improve financial health.',
  keywords: [
    'budget calculator',
    'expense tracker',
    'personal finance',
    '50/30/20 budget',
    'income and expense calculator',
    'spending categories',
    'savings rate calculator',
    'financial planning tool',
    'budget visualization',
    'expense breakdown'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function BudgetSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateBudgetSchema('https://calculatorhub.space/calculators/budget')),
      }}
    />
  );
}