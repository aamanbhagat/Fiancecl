import { Metadata } from 'next';

// Define the JSON-LD schema for the credit card calculator
export function generateCreditCardSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Credit Card Payoff Calculator',
        'description': 'Calculate how long it will take to pay off credit card debt and how much interest you\'ll pay with different payment strategies.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Debt payoff time calculation',
          'Total interest cost analysis',
          'Minimum payment vs fixed payment comparison',
          'Multiple payoff strategy simulation',
          'Debt avalanche method',
          'Debt snowball method',
          'Payment schedule visualization',
          'Accelerated payment planning',
          'PDF export functionality',
          'Multiple card comparison'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/credit-card`,
            'description': 'Calculate credit card payoff time and interest costs'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Credit Card Debt'
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
            'name': 'Credit Card Payoff Calculator',
            'item': `${baseUrl}/calculators/credit-card`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How are credit card minimum payments calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Credit card minimum payments are typically calculated as either a percentage of your total balance (usually 1-3%) or a fixed amount (often $25-35), whichever is greater. Some issuers use a formula like "interest + fees + 1% of principal." For example, on a $3,000 balance with 18% APR, your minimum might be $60-90 (2-3% of balance). These minimums are designed to extend your repayment period, maximizing interest charges—paying only the minimum on a $3,000 balance at 18% APR could take over 16 years and cost over $3,000 in interest. For faster debt elimination, pay significantly more than the minimum whenever possible.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between the debt avalanche and debt snowball methods?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The debt avalanche method prioritizes paying off debts with the highest interest rates first, which mathematically saves the most money and time. With this approach, you make minimum payments on all debts while putting extra funds toward the highest-interest balance. The debt snowball method, popularized by Dave Ramsey, focuses on paying smallest balances first, regardless of interest rate. While this costs more in interest, it creates psychological wins through faster elimination of individual debts, potentially providing stronger motivation. For someone with a $10,000 balance spread across multiple cards, the avalanche method might save $500-1,000 in interest, while the snowball method could provide faster momentum by eliminating smaller accounts first.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does credit card interest compounding work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Credit card interest compounds daily, making it particularly expensive compared to other forms of debt. Your annual percentage rate (APR) is divided by 365 to determine the daily periodic rate. This rate is applied to your average daily balance throughout the billing cycle. For example, with a 20% APR, your daily rate is approximately 0.055%. If your average daily balance is $3,000, you\'d accrue about $1.65 in interest daily, or roughly $50 monthly. This daily compounding means interest accrues on previously accumulated interest, creating an accelerating debt cycle. Furthermore, most cards lack a grace period for balances carried forward, meaning interest begins accruing immediately on unpaid balances.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How much faster will I pay off debt by increasing monthly payments?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Even small increases in monthly payments dramatically reduce payoff time and interest costs due to credit cards\' compound interest structure. For example, on a $5,000 balance at 18% APR with 2% minimum payments ($100 initially), paying the minimum would take about 32 years and cost $7,517 in interest. Increasing to a fixed $150 monthly payment cuts payoff time to just 4 years (87% reduction) and interest to $2,114 (72% savings). Adding just $50 more for a $200 monthly payment reduces the timeline to 2.8 years and interest to $1,516. This demonstrates why fixed payments above the minimum are essential for efficient debt elimination—every additional dollar dramatically accelerates your debt freedom.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Should I transfer my balance to a new card with a 0% introductory rate?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Balance transfers can be valuable tools when used strategically. A 0% introductory APR can save substantial interest—transferring a $5,000 balance from an 18% APR card to a 0% card for 15 months would save approximately $1,125 in interest. However, consider these factors: 1) Most cards charge balance transfer fees (typically 3-5% of the transferred amount); 2) The 0% rate is temporary, usually 12-18 months; 3) You need good-to-excellent credit to qualify for the best offers; 4) Missing payments can trigger penalty APRs; and 5) Opening new accounts affects your credit score. Balance transfers work best when you have a clear plan to pay off the debt during the promotional period and avoid accumulating new debt on either card.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Credit Card Payoff Calculator | Plan Your Debt Freedom',
  description: 'Calculate how long it will take to pay off credit card debt and the total interest cost with our free calculator featuring multiple payment strategies.',
  keywords: [
    'credit card payoff calculator',
    'credit card interest calculator',
    'debt payoff calculator',
    'minimum payment calculator',
    'debt avalanche calculator',
    'debt snowball calculator',
    'credit card debt calculator',
    'interest cost calculator',
    'balance transfer calculator',
    'debt freedom planner'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function CreditCardSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateCreditCardSchema('https://calculatorshub.store/calculators/credit-card')),
      }}
    />
  );
}