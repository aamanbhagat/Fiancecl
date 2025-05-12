import { Metadata } from 'next';

// Define the JSON-LD schema for the finance calculator
export function generateFinanceSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Finance Calculator',
        'description': 'Calculate various financial metrics including present value, future value, loan payments, investment returns, and more with our comprehensive finance calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Present value calculation',
          'Future value projection',
          'Internal rate of return (IRR)',
          'Net present value (NPV)',
          'Loan payment calculation',
          'Investment return estimation',
          'Cash flow analysis',
          'Time value of money calculation',
          'PDF export functionality',
          'Financial scenario comparison'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/finance`,
            'description': 'Calculate financial metrics and investment returns'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Financial Analysis'
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
            'name': 'Finance Calculator',
            'item': `${baseUrl}/calculators/finance`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is the time value of money?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The time value of money is a fundamental financial concept that recognizes money available today is worth more than the same amount in the future due to its earning potential. This principle forms the foundation for most financial calculations, including loans, investments, capital budgeting, and retirement planning. The concept stems from three factors: 1) Opportunity cost - money can be invested to earn returns; 2) Inflation - money loses purchasing power over time; and 3) Risk - future money has uncertainty. For example, $10,000 today invested at 5% annual return would grow to $16,289 in 10 years. Conversely, to have $10,000 in 10 years, you would only need to invest about $6,139 today at the same rate—demonstrating why future money is "discounted" in financial calculations.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between present value and future value?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Present value (PV) and future value (FV) represent two sides of the time value of money concept. Present value is the current worth of a future sum of money given a specified rate of return. It answers the question: "What is X amount in the future worth today?" Future value is what an investment or sum of money will grow to over time at a given interest rate. It answers: "What will X amount today be worth in the future?" The relationship is expressed as FV = PV × (1 + r)^t, where r is the interest rate and t is time in periods. For example, $10,000 today (PV) invested at 5% annually for 10 years would have a future value of $16,289. Conversely, to receive $16,289 in 10 years, you would need a present value of $10,000 today at 5% interest.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do I calculate Net Present Value (NPV) and what does it tell me?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Net Present Value (NPV) measures the profitability of an investment by calculating the present value of all cash flows (both inflows and outflows) discounted at an appropriate rate. The formula is: NPV = Initial Investment + Σ(Cash Flow_t / (1+r)^t), where t represents the time period and r is the discount rate. A positive NPV indicates the investment is expected to add value, while a negative NPV suggests it would subtract value. For example, a business project requiring a $100,000 investment that generates cash flows of $30,000 annually for 5 years, discounted at 8%, would have an NPV of approximately $16,300, making it a value-adding investment. NPV is superior to simpler metrics because it accounts for the timing of cash flows, the time value of money, and the project\'s risk through the discount rate.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is Internal Rate of Return (IRR) and how is it used?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Internal Rate of Return (IRR) is the discount rate that makes an investment\'s Net Present Value (NPV) equal to zero. It represents the annualized effective compounded return rate an investment earns. IRR is particularly useful for comparing different investments regardless of their size or duration. For example, between two projects—one requiring $50,000 with an IRR of 15% and another requiring $200,000 with an IRR of 12%—the first project offers better returns relative to investment. When making decisions, IRR is typically compared against a hurdle rate (minimum acceptable return rate). Decision rules include: 1) If IRR > hurdle rate, accept the investment; 2) If IRR < hurdle rate, reject it; and 3) If comparing investments, higher IRR projects are generally preferred. However, IRR has limitations, particularly for non-conventional cash flows or when comparing mutually exclusive projects with different scales.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are the most important financial ratios for analyzing investments?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Key financial ratios for investment analysis include: 1) Profitability ratios - Return on Investment (ROI) measures overall return, Return on Equity (ROE) shows returns on shareholder capital (15%+ is typically considered good), and Profit Margin indicates how efficiently revenue converts to profit; 2) Valuation ratios - Price-to-Earnings (P/E) compares share price to earnings (industry-dependent, but typically 15-25 for stable companies), Price-to-Book compares market value to book value, and Dividend Yield shows annual dividend payments relative to share price; 3) Liquidity ratios - Current Ratio (ideally 1.5-3.0) and Quick Ratio measure short-term paying ability; 4) Efficiency ratios - Asset Turnover and Inventory Turnover show how efficiently resources generate sales; and 5) Leverage ratios - Debt-to-Equity (typically under 2.0) and Interest Coverage Ratio measure financial risk. When analyzing investments, compare these ratios over time and against industry benchmarks to identify trends and relative performance.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Finance Calculator | Comprehensive Financial Analysis Tool',
  description: 'Calculate various financial metrics including present value, future value, investment returns, and more with our comprehensive finance calculator.',
  keywords: [
    'finance calculator',
    'present value calculator',
    'future value calculator',
    'NPV calculator',
    'IRR calculator',
    'investment return calculator',
    'time value of money',
    'cash flow analysis',
    'financial ratio calculator',
    'business finance calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function FinanceSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateFinanceSchema('https://calculatorhub.space/calculators/finance')),
      }}
    />
  );
}