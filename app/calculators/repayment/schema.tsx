import { Metadata } from 'next';

// Define the JSON-LD schema for the repayment calculator
export function generateRepaymentSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Loan Repayment Calculator',
        'description': 'Calculate loan payoff timelines, compare different repayment strategies, and analyze the impact of extra payments with our comprehensive repayment calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Loan payoff timeline calculation',
          'Debt avalanche vs. snowball comparison',
          'Extra payment impact analysis',
          'Interest savings calculation',
          'Amortization schedule generation',
          'Multiple loan comparison',
          'Debt consolidation analysis',
          'Early payoff strategies',
          'PDF export functionality',
          'Payment frequency optimization'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/repayment`,
            'description': 'Calculate loan payoff timelines and repayment strategies'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Loan Repayment Analysis'
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
            'name': 'Repayment Calculator',
            'item': `${baseUrl}/calculators/repayment`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What\'s the difference between the debt avalanche and debt snowball methods?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The debt avalanche and debt snowball are two popular debt repayment strategies with different approaches and psychological mechanics. The debt avalanche method prioritizes repaying debts with the highest interest rates first, regardless of balance. After making minimum payments on all debts, you direct extra money toward the highest-interest debt until it\'s eliminated, then move to the next highest-interest debt, and so on. This approach minimizes total interest paid and is mathematically optimal. For example, if you have credit cards at 22%, 18%, and 15% interest, you\'d focus on the 22% card first. The debt snowball method, popularized by Dave Ramsey, prioritizes paying off debts by balance size, starting with the smallest balance first. After making minimum payments on all debts, extra money goes toward the smallest debt until it\'s paid off, creating quick wins that provide psychological momentum. Research suggests the snowball method may be more effective for many people despite its mathematical disadvantages, as the motivational boost from early successes helps maintain commitment to the repayment plan. The best method depends on your personal psychology—choose the avalanche if you\'re motivated by mathematical optimization, or the snowball if you benefit from quick wins and visible progress.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do extra payments affect loan repayment?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Extra payments have a powerful impact on loan repayment through several mechanisms. First, they directly reduce the principal balance, which means less interest accrues on all future payments. For example, on a $20,000, 5-year car loan at 6% interest, adding just $50 monthly to the $387 minimum payment would save $315 in interest and repay the loan 5 months early. The effect is even more dramatic for longer-term debts—adding $100 monthly to a $200,000, 30-year mortgage at 4% would save over $27,000 in interest and shorten the loan by over 4 years. Second, extra payments early in the loan term have the greatest impact because that\'s when your balance (and therefore interest) is highest. A one-time extra $1,000 payment in the first year of a mortgage saves significantly more than the same payment made in year 15. Third, consistent small increases can have surprisingly large effects due to compounding—paying just 10% extra each month on a 30-year mortgage could shorten it by almost 5 years. To maximize benefits, ensure extra payments are applied directly to principal rather than prepaying future installments, and verify your loan doesn\'t have prepayment penalties that would offset the advantages.'
            }
          },
          {
            '@type': 'Question',
            'name': 'When is debt consolidation a good strategy?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Debt consolidation can be beneficial under specific circumstances but isn\'t right for everyone. It\'s typically a good strategy when: 1) You can secure a substantially lower interest rate than your current debts—consolidating high-interest credit cards (often 18-25%) with a personal loan (potentially 7-12%) or home equity loan (potentially 4-7%) can save thousands in interest; 2) You\'re committed to not accumulating new debt after consolidation—many people who consolidate continue using credit cards, creating a double debt problem; 3) The math works in your favor after accounting for all fees, closing costs, and loan terms; 4) You\'re struggling with managing multiple payment dates and want simplification; 5) Your debt-to-income ratio and credit score qualify you for favorable consolidation terms. Warning signs that consolidation might not be appropriate include: using it repeatedly, stretching debts over a much longer term (which increases total interest despite lower rates), using consolidation to solve spending problems rather than addressing root financial behaviors, or putting your home at risk by converting unsecured debt to secured debt (as with home equity loans). Successful consolidation should be part of a comprehensive financial plan that includes budgeting, emergency savings, and lifestyle adjustments to prevent future debt accumulation.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How can I calculate how long it will take to pay off my debt?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'To calculate debt payoff time, you\'ll need different approaches depending on your payment strategy and debt type. For credit cards with minimum payments that decrease as the balance decreases, the calculation is complex because the payment amount constantly changes. If you pay only minimums (typically 1-3% of the balance), repayment can take decades—a $5,000 balance at 18% interest with 2% minimum payments would take over 30 years to repay. For fixed payment loans like mortgages or car loans, the formula is: Number of months = -log(1 - (r × P/M)) ÷ log(1 + r), where P is the principal, r is the monthly interest rate, and M is the monthly payment. For example, a $15,000 loan at 6% annual interest (0.5% monthly) with $290 monthly payments would take 60 months to repay. To estimate payoff time with additional payments, you can either use the same formula with the increased payment amount or utilize online calculators specifically designed for this purpose. When managing multiple debts with different interest rates and payment strategies (like avalanche or snowball methods), specialized debt payoff calculators or apps provide the most accurate projections by handling the sequential nature of focusing on one debt at a time while making minimum payments on others.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Should I prioritize debt repayment or investing?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The debt repayment versus investing decision depends on several factors, with the most important being interest rate comparisons. Generally, you should prioritize paying off high-interest debt (typically above 6-8%) before investing beyond any employer 401(k) match, as high-interest debt effectively represents a guaranteed negative return that exceeds likely investment gains. However, the decision becomes more nuanced with lower-interest debt. A balanced approach often works best: First, ensure you\'re capturing any available employer retirement match, as this represents an immediate 50-100% return that outperforms both debt repayment and other investments. Second, build a basic emergency fund of 1-3 months\' expenses to prevent new debt accumulation. Third, aggressively pay down high-interest debt (credit cards, personal loans, private student loans). Fourth, balance additional debt repayment against investing based on: interest rates, tax deductibility of the debt, your risk tolerance, emotional relationship with debt, job security, and other financial goals. For example, many financial planners suggest investing rather than accelerating payments on a mortgage below 4% or federal student loans with tax-deductible interest, while simultaneously building retirement savings. The optimal strategy isn\'t purely mathematical—it should align with your personal financial psychology and sleep-well-at-night factor.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Loan Repayment Calculator | Debt Payoff Strategy Tool',
  description: 'Calculate loan payoff timelines, compare different repayment strategies, and analyze the impact of extra payments with our comprehensive repayment calculator.',
  keywords: [
    'loan repayment calculator',
    'debt payoff calculator',
    'debt snowball calculator',
    'debt avalanche calculator',
    'extra payment calculator',
    'early loan payoff calculator',
    'debt consolidation calculator',
    'interest savings calculator',
    'loan comparison tool',
    'amortization calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function RepaymentSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateRepaymentSchema('https://calculatorhub.space/calculators/repayment')),
      }}
    />
  );
}