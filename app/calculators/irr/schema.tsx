import { Metadata } from 'next';

// Define the JSON-LD schema for the IRR calculator
export function generateIRRSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'IRR Calculator',
        'description': 'Calculate the Internal Rate of Return (IRR) for investments and projects with varying cash flows and time periods.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Internal Rate of Return (IRR) calculation',
          'Modified IRR (MIRR) calculation',
          'Multiple cash flow analysis',
          'NPV comparison',
          'IRR vs required rate of return',
          'Investment period adjustments',
          'Project comparison visualization',
          'Irregular cash flow handling',
          'PDF export functionality',
          'Sensitivity analysis'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/irr`,
            'description': 'Calculate the Internal Rate of Return for investment projects'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Investment Return Analysis'
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
            'name': 'IRR Calculator',
            'item': `${baseUrl}/calculators/irr`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is Internal Rate of Return (IRR) and how is it calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The Internal Rate of Return (IRR) is the discount rate that makes the net present value (NPV) of all cash flows from a project or investment equal to zero. In other words, it\'s the rate at which an investment breaks even. Mathematically, IRR solves the equation: 0 = CF₀ + CF₁/(1+IRR) + CF₂/(1+IRR)² + ... + CFₙ/(1+IRR)ⁿ, where CF represents cash flows (negative for investments, positive for returns) and n is the number of periods. Unlike simpler metrics, IRR cannot be solved with a direct formula and requires iterative calculation methods. For example, if you invest $1,000 today and receive $1,200 in one year, the IRR would be 20%. For investments with multiple or irregular cash flows, IRR provides a standardized rate of return that accounts for the timing of all cash movements, making it valuable for comparing opportunities with different cash flow patterns.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How is IRR used in investment decision-making?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'IRR is a key decision metric in investment analysis, typically compared against a hurdle rate (minimum acceptable return rate). The basic decision rule is: if IRR exceeds the hurdle rate, the investment is considered financially attractive; if IRR falls below it, the investment should be rejected. For capital rationing situations (limited investment funds), projects can be ranked by IRR to prioritize those with the highest rates of return. In corporate finance, IRR helps evaluate capital expenditures, acquisitions, and expansion projects. In real estate, it\'s commonly used to analyze property investments and development projects. For personal investing, IRR helps compare opportunities like business investments, rental properties, or alternative investments. Its primary advantage is that it considers the time value of money and provides a percentage return that\'s intuitively understood by most decision-makers, unlike absolute dollar metrics like NPV.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between IRR, NPV, and ROI?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'IRR, NPV, and ROI are complementary investment metrics that serve different analytical purposes. IRR (Internal Rate of Return) expresses return as an annualized percentage rate that makes NPV equal zero, accounting for the time value of money. It\'s useful for comparing investments with different sizes and durations. NPV (Net Present Value) calculates the current dollar value of all future cash flows discounted at a required rate of return, showing absolute profit after accounting for time value and opportunity cost. A positive NPV indicates value creation. ROI (Return on Investment) is the simplest metric, calculated as (Net Profit / Cost of Investment) × 100%, giving a percentage return without considering the timing of cash flows. For example, an investment costing $100,000 that returns $150,000 after three years has an ROI of 50%, an IRR of about 14.5% annually, and an NPV of approximately $24,600 (assuming a 7% discount rate). Best practice is using these metrics together: NPV for absolute value created, IRR for percentage returns, and ROI for simple comparisons.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are the limitations and potential pitfalls of using IRR?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Despite its popularity, IRR has several important limitations: 1) Multiple IRR problem - projects with alternating positive and negative cash flows can have multiple mathematically valid IRR values, creating ambiguity; 2) Reinvestment rate assumption - IRR implicitly assumes all interim cash flows can be reinvested at the IRR rate itself, which may be unrealistic for high-IRR projects; 3) Project scale blindness - IRR doesn\'t account for investment size, potentially favoring small projects with high percentage returns over larger projects that create more absolute value; 4) Conflicts with NPV - in mutually exclusive project comparisons, IRR and NPV can give contradictory rankings; 5) Issues with non-conventional cash flows - projects starting with positive cash flows or having multiple sign changes create computational challenges; and 6) No consideration for risk differences between investments. Due to these limitations, financial experts recommend using IRR alongside other metrics, particularly NPV, and understanding when Modified IRR (MIRR) might provide a more realistic assessment.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is Modified IRR (MIRR) and when should it be used?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Modified IRR (MIRR) addresses key limitations of standard IRR by incorporating more realistic assumptions about reinvestment rates. While traditional IRR assumes interim cash flows are reinvested at the IRR itself (often an unrealistic assumption), MIRR allows for separate specification of financing and reinvestment rates. The formula is: MIRR = (Future Value of Positive Cash Flows / Present Value of Negative Cash Flows)^(1/n) - 1, where n is the number of periods. MIRR should be used when: 1) Projects have non-conventional cash flow patterns with multiple sign changes; 2) A project\'s calculated IRR is substantially higher than likely reinvestment opportunities; 3) You need to compare projects with radically different risk profiles; or 4) Multiple mathematical IRR solutions exist for a project. For example, a venture with high initial returns might show an IRR of 25%, but if those returns can only realistically be reinvested at 10%, MIRR provides a more conservative and accurate return estimate. MIRR also has the advantage of always providing a single solution, eliminating the multiple IRR problem.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'IRR Calculator | Calculate Internal Rate of Return',
  description: 'Calculate the Internal Rate of Return (IRR) for investments and projects with varying cash flows and time periods with our comprehensive calculator.',
  keywords: [
    'IRR calculator',
    'internal rate of return calculator',
    'MIRR calculator',
    'investment return calculator',
    'project evaluation tool',
    'cash flow analysis',
    'NPV comparison calculator',
    'financial decision tool',
    'investment analysis calculator',
    'capital budgeting calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function IRRSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateIRRSchema('https://calculatorshub.store/calculators/irr')),
      }}
    />
  );
}