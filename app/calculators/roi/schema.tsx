import { Metadata } from 'next';

// Define the JSON-LD schema for the ROI calculator
export function generateRoiSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'ROI Calculator',
        'description': 'Calculate return on investment for business projects, marketing campaigns, and investments with our comprehensive ROI calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Simple ROI calculation',
          'Annualized ROI calculation',
          'Time-adjusted return analysis',
          'Project comparison tools',
          'Break-even point identification',
          'Cash flow ROI visualization',
          'Marketing campaign analysis',
          'Investment portfolio comparison',
          'PDF export functionality',
          'Multiple scenario modeling'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/roi`,
            'description': 'Calculate return on investment for business projects and investments'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Return on Investment Analysis'
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
            'name': 'ROI Calculator',
            'item': `${baseUrl}/calculators/roi`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How is ROI calculated and what does it mean?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Return on Investment (ROI) is a financial metric that measures the profitability of an investment relative to its cost. The basic ROI formula is: ROI = (Net Profit ÷ Cost of Investment) × 100%. For example, if you invest $10,000 and receive $13,000 back, your ROI is (($13,000 - $10,000) ÷ $10,000) × 100% = 30%. This percentage represents how much your initial investment has grown or shrunk. A positive ROI indicates a profitable investment, while a negative ROI indicates a loss. The higher the ROI, the more efficient the investment. However, basic ROI has limitations—it doesn\'t account for time, risk, or inflation. For investments held over different time periods, annualized ROI provides a better comparison: Annualized ROI = ((1 + ROI)^(1/n) - 1) × 100%, where n is the number of years. For example, a 30% ROI achieved over 3 years equals an annualized ROI of about 9.1%. Despite its simplicity, ROI remains one of the most widely used metrics for evaluating investments because it\'s easily understood and applicable across various types of investments and projects.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between ROI and other financial metrics like IRR or NPV?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'ROI, IRR, and NPV are distinct financial metrics with different approaches to evaluating investments. Return on Investment (ROI) is the simplest measure, calculating the percentage return by dividing net profit by investment cost. Its strengths include simplicity and intuitive understanding, but it ignores the time value of money and cash flow timing. Internal Rate of Return (IRR) is the discount rate that makes the net present value (NPV) of all cash flows equal to zero. Unlike basic ROI, IRR accounts for the time value of money and irregular cash flows. However, IRR can present multiple or misleading results with unconventional cash flow patterns. Net Present Value (NPV) calculates the present value of all future cash flows minus the initial investment, explicitly accounting for the time value of money using a specified discount rate. Unlike ROI and IRR, which provide percentage returns, NPV gives an absolute dollar value of added wealth. Each metric has specific uses: ROI for simple comparisons and communication with non-financial stakeholders; IRR for comparing investment opportunities with different timelines; and NPV for making decisions that maximize shareholder value. Comprehensive investment analysis typically employs all three metrics together, as they provide complementary insights into different aspects of investment performance.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How is marketing ROI calculated and what\'s a good return?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Marketing ROI measures the effectiveness of marketing expenditures and is calculated as: Marketing ROI = ((Revenue Attributable to Marketing - Marketing Cost) ÷ Marketing Cost) × 100%. For example, if a $10,000 campaign generates $30,000 in revenue, the marketing ROI is (($30,000 - $10,000) ÷ $10,000) × 100% = 200%. However, accurately calculating marketing ROI involves several complexities: 1) Attribution challenges - determining which sales resulted directly from specific marketing efforts; 2) Profit vs. revenue - using gross profit rather than revenue provides a more accurate picture; 3) Long-term effects - some campaigns build brand value over time beyond immediate sales; 4) Multiple touchpoints - customers often interact with several marketing channels before purchasing. Industry benchmarks for "good" marketing ROI vary significantly by sector, channel, and campaign objectives. As a general guideline, a 5:1 ratio (400% ROI) is considered strong performance, while 10:1 (900% ROI) is exceptional. Digital marketing channels often deliver higher measurable ROIs than traditional media due to better tracking capabilities. Email marketing frequently shows the highest ROI (often exceeding 3,000%), followed by SEO, content marketing, and paid search. However, the most appropriate target depends on your industry, competition, and business goals.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How can I improve the ROI of my business investments?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Improving business investment ROI requires focusing on both sides of the equation—increasing returns and decreasing costs. To boost returns: 1) Target high-potential opportunities through thorough market research and customer analysis; 2) Test and iterate on small scales before full implementation; 3) Implement strong performance measurement systems with clear KPIs; 4) Develop multiple revenue streams from the same investment; 5) Focus on customer retention and loyalty, as increasing customer lifetime value typically costs less than acquiring new customers; 6) Invest in employee training and development to improve productivity and innovation. To reduce costs without sacrificing quality: 1) Negotiate with suppliers or seek alternative vendors; 2) Leverage technology and automation to improve operational efficiency; 3) Implement lean principles to eliminate waste; 4) Consider outsourcing non-core functions; 5) Share resources across projects or departments; 6) Time investments strategically to take advantage of favorable market conditions. Additionally, improving ROI often requires patience and persistence—many investments show modest returns initially before reaching their full potential. Regularly reviewing and adjusting strategies based on performance data is crucial for optimizing ROI over time. Even small improvements in both returns and costs can have a multiplicative effect on overall ROI.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are the limitations of using ROI as a decision-making metric?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'While ROI is valuable for its simplicity and wide applicability, it has several important limitations as a decision-making metric: 1) Time ignorance - standard ROI calculations don\'t account for when cash flows occur, treating quick returns and delayed returns equally; 2) Risk blindness - ROI doesn\'t incorporate the probability of achieving projected returns or the potential variability in outcomes; 3) Discount rate omission - unlike NPV, ROI doesn\'t account for the opportunity cost of capital; 4) Short-term bias - ROI can favor short-term gains over long-term value creation, potentially discouraging strategic investments; 5) Intangible exclusion - traditional ROI struggles to capture non-financial benefits like improved brand reputation, employee satisfaction, or environmental impact; 6) Sunk cost distortion - improper ROI calculations sometimes include past expenditures that should be disregarded for forward-looking decisions; 7) Manipulation vulnerability - both the numerator and denominator can be defined differently to produce desired results; and 8) Comparability issues - different accounting methods across projects or organizations can make ROI comparisons misleading. To overcome these limitations, business leaders should use ROI alongside other metrics like NPV, IRR, payback period, and qualitative assessments. Additionally, sensitivity analysis that tests how ROI changes under different assumptions can provide a more complete picture of potential investment outcomes.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'ROI Calculator | Return on Investment Analysis Tool',
  description: 'Calculate return on investment for business projects, marketing campaigns, and investments with our comprehensive ROI calculator.',
  keywords: [
    'ROI calculator',
    'return on investment calculator',
    'investment return calculator',
    'marketing ROI calculator',
    'project ROI analysis',
    'business investment calculator',
    'profit calculator',
    'investment performance tool',
    'financial return analysis',
    'annualized ROI calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function RoiSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateRoiSchema('https://calculatorshub.store/calculators/roi')),
      }}
    />
  );
}