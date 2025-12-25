import { Metadata } from 'next';

// Define the JSON-LD schema for the savings calculator
export function generateSavingsSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Savings Calculator',
        'description': 'Calculate compound interest, project savings growth, and plan for financial goals with our comprehensive savings calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Compound interest calculation',
          'Savings goal projection',
          'Regular deposit analysis',
          'Interest rate comparison',
          'Emergency fund planning',
          'Time to goal estimation',
          'Tax impact modeling',
          'Inflation adjustment',
          'PDF export functionality',
          'Different savings frequency options'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/savings`,
            'description': 'Calculate compound interest and project savings growth'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Savings Growth Analysis'
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
            'name': 'Savings Calculator',
            'item': `${baseUrl}/calculators/savings`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How does compound interest work in savings accounts?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Compound interest is often called the "eighth wonder of the world" because it allows your savings to grow exponentially over time as you earn interest not only on your initial principal but also on the accumulated interest. Unlike simple interest, which is calculated only on the original principal, compound interest generates "interest on interest." The formula for calculating compound interest is: A = P(1 + r/n)^(nt), where A is the final amount, P is the principal (initial investment), r is the annual interest rate (as a decimal), n is the number of times interest compounds per year, and t is time in years. For example, $10,000 invested at 5% compounded annually would grow to approximately $16,289 after 10 years—$5,000 in simple interest plus $1,289 in compound interest. The frequency of compounding affects the total return—daily compounding yields slightly more than monthly compounding, which yields more than annual compounding. The power of compounding becomes more dramatic with longer time horizons due to exponential growth. For instance, the same $10,000 at 5% would grow to about $26,533 after 20 years and $43,219 after 30 years. This time advantage explains why starting to save early is so important for long-term financial goals.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are the best types of accounts for different savings goals?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Different savings goals require different types of accounts based on factors like time horizon, liquidity needs, and tax considerations. For emergency funds and short-term goals (under 2 years), high-yield savings accounts and money market accounts offer safety, FDIC insurance, and reasonable liquidity, though with modest returns (currently 3-5% annually). Certificates of Deposit (CDs) provide slightly higher yields in exchange for locking funds for specific terms, making them suitable for known expenses 1-5 years away. For medium-term goals (3-10 years), consider a balanced approach: I Bonds offer inflation protection with tax advantages, Series EE Bonds double in value after 20 years, and conservative investment portfolios with bond/stock mixes appropriate to your timeline and risk tolerance. For long-term goals like retirement (10+ years away), tax-advantaged accounts offer significant benefits: 401(k)s and Traditional IRAs provide upfront tax deductions but tax withdrawals, Roth IRAs and Roth 401(k)s use after-tax contributions but offer tax-free growth and withdrawals, and HSAs offer triple tax advantages for medical expenses. For education savings, 529 plans provide tax-free growth for qualified education expenses, while Coverdell ESAs offer more flexibility for K-12 costs. The optimal strategy often involves using multiple account types, with allocation based on each goal\'s time horizon, tax situation, and need for accessibility.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How much should I have in an emergency fund?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The traditional guideline for emergency funds is 3-6 months of essential expenses, but the optimal amount varies based on personal circumstances. Several factors should influence your target: Income stability (freelancers or commission-based workers generally need larger funds than those with stable salaries), household structure (single-income households typically need larger reserves than dual-income households), debt obligations (higher debt payments suggest larger emergency funds), health considerations (chronic conditions may require more substantial reserves), and home/car ownership (homeowners face potential repair costs that renters don\'t). Based on these factors, appropriate emergency funds might range from 3 months of expenses (dual stable incomes, good health insurance, minimal debt, renters) to 12+ months (self-employed, single income supporting dependents, variable earnings). Rather than focusing solely on months of coverage, consider potential emergency scenarios specific to your situation—job loss, medical issues, major repairs, family emergencies—and their associated costs. Building your emergency fund gradually is perfectly acceptable; start with a mini-fund of $1,000-2,000 for smaller emergencies while paying down high-interest debt, then build toward your full target. The funds should be kept in highly liquid accounts like high-yield savings or money market accounts where they\'re accessible within 1-2 business days without withdrawal penalties.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What strategies can help me save money more effectively?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Effective saving combines behavioral techniques with practical systems. Start by making savings automatic—set up direct deposits from your paycheck to savings accounts before you have a chance to spend the money. The "pay yourself first" approach ensures saving happens consistently rather than saving whatever\'s left at month-end (which is often nothing). Implementing the 50/30/20 budget guideline helps allocate income appropriately: 50% to needs, 30% to wants, and 20% to savings and debt repayment. To overcome psychological barriers, try methods like the 52-week money challenge (save $1 week one, $2 week two, etc.) or the save-all-$5-bills technique. Breaking larger goals into smaller milestones with specific target dates makes progress more visible and motivating. Utilizing technology can significantly boost savings effectiveness—apps like Digit or Qapital automatically analyze spending patterns and move small amounts to savings, while round-up services like Acorns invest spare change from purchases. For spending management, implement a 24-hour rule for non-essential purchases over a certain amount, giving yourself time to consider whether the purchase aligns with your priorities. Lastly, finding accountability through sharing goals with friends, joining saving groups, or working with a financial advisor provides the external motivation many people need for long-term saving success.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does inflation affect my savings and what can I do about it?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Inflation erodes purchasing power over time, meaning today\'s savings will buy less in the future. With the historical U.S. inflation average around 3% annually, $100,000 today would have the purchasing power of only about $74,400 after 10 years—a silent but significant wealth reduction. Traditional saving vehicles like regular savings accounts, CDs, and money market accounts often fail to keep pace with inflation, particularly during high-inflation periods, resulting in negative real returns (nominal returns minus inflation). To combat inflation\'s impact, consider these strategies: 1) For short-term savings, seek high-yield savings accounts and short-term CDs that adjust relatively quickly to changing interest rates; 2) For mid-term goals, consider Treasury Inflation-Protected Securities (TIPS) and I Bonds, which are specifically designed to protect against inflation by adjusting their value or interest rate based on CPI changes; 3) For long-term savings, maintain appropriate exposure to stocks and real estate, which historically outpace inflation over extended periods; 4) Consider commodities and other alternative investments that often perform well during inflationary periods; 5) Regularly review and adjust your savings and investment allocations as inflation rates change; and 6) When setting long-term savings goals, always factor in inflation—if you\'re saving for a goal 20 years away, you\'ll need nearly twice the nominal amount at 3% inflation.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Savings Calculator | Compound Interest & Financial Goal Planner',
  description: 'Calculate compound interest, project savings growth, and plan for financial goals with our comprehensive savings calculator.',
  keywords: [
    'savings calculator',
    'compound interest calculator',
    'savings goal calculator',
    'emergency fund calculator',
    'interest projection tool',
    'financial goal planner',
    'savings growth calculator',
    'savings rate calculator',
    'regular deposit calculator',
    'money growth estimator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function SavingsSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateSavingsSchema('https://calculatorshub.store/calculators/savings')),
      }}
    />
  );
}