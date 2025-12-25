import { Metadata } from 'next';

// Define the JSON-LD schema for the present value calculator
export function generatePresentValueSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Present Value Calculator',
        'description': 'Calculate the present value of future money, analyze investment opportunities, and make time-value-of-money decisions with our comprehensive calculator.',
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
          'Future value to present value conversion',
          'Discount rate analysis',
          'Cash flow timing adjustments',
          'Annuity present value calculation',
          'Growing annuity calculation',
          'Investment comparison tools',
          'Inflation adjustment',
          'PDF export functionality',
          'Multiple scenario modeling'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/present-value`,
            'description': 'Calculate the present value of future money'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Present Value Analysis'
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
            'name': 'Present Value Calculator',
            'item': `${baseUrl}/calculators/present-value`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is present value and how is it calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Present value (PV) is the current worth of a future sum of money or stream of cash flows given a specified rate of return or discount rate. It\'s a foundational concept in finance that recognizes money available today is worth more than the same amount in the future due to its potential earning capacity. The basic formula for calculating present value is: PV = FV ÷ (1 + r)^n, where FV is the future value, r is the discount rate (expressed as a decimal), and n is the number of time periods. For example, $1,100 received one year from now with a 10% discount rate has a present value of $1,000 ($1,100 ÷ 1.10). For multiple cash flows or annuities, each future payment is discounted individually and then summed. Present value calculations help determine if future returns justify current investments and allow for objective comparison between different investment opportunities with varying timelines and payment structures.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does the discount rate affect present value?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The discount rate has an inverse relationship with present value—as the discount rate increases, present value decreases, and vice versa. This relationship reflects the opportunity cost of money over time. For example, $10,000 received in 5 years has dramatically different present values depending on the discount rate: at 3%, the PV is $8,626; at 7%, it\'s $7,130; and at 12%, it\'s only $5,674. This effect becomes more pronounced as time periods increase—the same $10,000 received in 15 years would be worth $6,419, $3,624, or $1,827 at those same discount rates. The choice of discount rate is therefore critical in valuation and depends on several factors: the risk-free rate (typically government bond yields), risk premium associated with the investment, inflation expectations, and the opportunity cost of capital. Riskier future cash flows should be discounted at higher rates to reflect their uncertainty. In corporate settings, the weighted average cost of capital (WACC) is often used as the discount rate, while individuals might use their expected returns from alternative investments.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between present value and net present value?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Present value (PV) and net present value (NPV) are related concepts that serve different analytical purposes. Present value calculates the current worth of future cash flows or a single future payment using a specified discount rate. It answers the question, "What is X amount of future money worth today?" Net present value builds on this concept but specifically measures the profitability of an investment by calculating the difference between the present value of all cash inflows and the present value of all cash outflows (typically the initial investment). The formula is: NPV = Present value of benefits - Present value of costs. While PV is expressed as a dollar amount representing current equivalent worth, NPV indicates whether an investment creates (positive NPV) or destroys (negative NPV) value. For example, if a project requires a $50,000 investment and generates cash flows with a present value of $65,000, the NPV is $15,000. NPV is widely used in capital budgeting because it accounts for the time value of money, risk, and the opportunity cost of capital in evaluating investments.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are some real-world applications of present value calculations?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Present value calculations have numerous practical applications across finance and everyday decision-making: 1) Investment analysis - comparing different investment opportunities with varying cash flow timings, such as bonds with different maturities and coupon rates; 2) Business valuation - determining the worth of a company based on projected future earnings or cash flows; 3) Capital budgeting - evaluating whether to proceed with projects by comparing the present value of expected benefits against costs; 4) Loan evaluation - determining the true cost of different loan options or the benefit of refinancing existing debt; 5) Lottery winnings - calculating whether to take a lump sum payment or annuity option; 6) Legal settlements - determining fair compensation for future damages or lost earnings; 7) Real estate decisions - evaluating lease vs. buy options or comparing different mortgage terms; 8) Retirement planning - calculating how much to save today to fund future retirement needs; 9) Insurance pricing - setting premiums based on the present value of potential future claims; and 10) Environmental economics - quantifying the current value of future environmental costs or benefits.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How is the present value of an annuity calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The present value of an annuity represents the current worth of a series of equal payments made at regular intervals over a specified period. Unlike calculating the present value of a single future payment, annuities require a specialized formula: PV = PMT × [(1 - (1 + r)^-n) ÷ r], where PMT is the periodic payment amount, r is the discount rate per period, and n is the number of periods. For example, an annuity paying $1,000 annually for 10 years with a 6% annual discount rate has a present value of approximately $7,360, significantly less than the $10,000 total of nominal payments. There are two main types of annuities: ordinary annuities (payments occur at the end of each period) and annuities due (payments occur at the beginning of each period). Annuities due have slightly higher present values because payments occur earlier. For growing annuities, where payments increase at a constant rate, the formula must be adjusted to account for this growth rate. Present value of annuity calculations is essential for retirement planning, loan amortization, lease analysis, and valuing structured settlements or insurance payments.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Present Value Calculator | Time Value of Money Analysis',
  description: 'Calculate the present value of future money, analyze investment opportunities, and make time-value-of-money decisions with our comprehensive calculator.',
  keywords: [
    'present value calculator',
    'PV calculator',
    'time value of money calculator',
    'discount rate calculator',
    'NPV calculator',
    'future value to present value',
    'investment analysis tool',
    'annuity present value calculator',
    'cash flow discounting calculator',
    'financial decision calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function PresentValueSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generatePresentValueSchema('https://calculatorshub.store/calculators/present-value')),
      }}
    />
  );
}