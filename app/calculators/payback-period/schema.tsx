import { Metadata } from 'next';

// Define the JSON-LD schema for the payback period calculator
export function generatePaybackPeriodSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Payback Period Calculator',
        'description': 'Calculate how long it takes to recover an initial investment using simple or discounted payback period methods for better capital budgeting decisions.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Simple payback period calculation',
          'Discounted payback period calculation',
          'Irregular cash flow analysis',
          'Cumulative cash flow visualization',
          'Project comparison capabilities',
          'Break-even point identification',
          'Risk assessment integration',
          'Time value of money adjustments',
          'PDF export functionality',
          'Multiple investment scenario modeling'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/payback-period`,
            'description': 'Calculate investment recovery time using payback period analysis'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Investment Recovery Analysis'
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
            'name': 'Payback Period Calculator',
            'item': `${baseUrl}/calculators/payback-period`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is payback period and how is it calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The payback period measures how long it takes to recover the initial cost of an investment through its cash flows. There are two main calculation methods: Simple payback period ignores the time value of money and is calculated by dividing the initial investment by the average annual cash inflows (for uniform cash flows) or by tracking cumulative cash flows until they equal the initial investment (for non-uniform flows). For example, a $100,000 investment generating $25,000 annually has a 4-year simple payback period. Discounted payback period accounts for the time value of money by applying a discount rate to future cash flows before calculating the recovery time. With a 10% discount rate, the same $100,000 investment with $25,000 annual cash flows would have a longer discounted payback period of approximately 5.1 years. Businesses typically use payback period as a screening tool, favoring investments with shorter payback periods as they represent lower risk and faster capital recovery.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between simple and discounted payback period?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Simple payback period and discounted payback period differ fundamentally in how they treat the time value of money. Simple payback period treats all cash flows equally regardless of when they occur, simply tallying nominal cash flows until they equal the initial investment. This method is straightforward but ignores the fact that money received in the future is less valuable than money received today. Discounted payback period addresses this limitation by applying a discount rate to future cash flows before calculating when the investment breaks even. For instance, a $50,000 investment with projected annual returns of $15,000 has a simple payback period of 3.33 years. With a 12% discount rate, the same investment has a discounted payback of about 4.16 years because the present value of those future cash flows is less than their nominal value. Discounted payback provides a more economically accurate measure of recovery time, especially for long-term projects or in high inflation environments, though it requires determining an appropriate discount rate and involves more complex calculations.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are the advantages and disadvantages of using payback period?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Payback period analysis offers several advantages: 1) Simplicity - it\'s easy to calculate and understand; 2) Liquidity focus - emphasizes how quickly investments return capital; 3) Risk assessment - shorter payback periods generally indicate lower risk; 4) Capital constraints - helps businesses with limited capital prioritize faster-returning investments. However, significant disadvantages include: 1) Ignores time value of money (in simple payback); 2) Disregards cash flows after the payback point, potentially favoring short-term projects with limited total returns over more profitable long-term investments; 3) Lacks standardized acceptance criteria - companies must subjectively determine acceptable payback thresholds; 4) No profitability measure - a project could have a quick payback but minimal total profit; 5) Binary results - fails to indicate the magnitude of returns beyond breaking even. Due to these limitations, payback period should typically be used as an initial screening tool alongside more comprehensive metrics like NPV, IRR, and ROI that consider total project lifetime and profitability.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does payback period compare to other investment metrics like NPV and IRR?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Payback period differs fundamentally from NPV and IRR in its focus and limitations. Payback period measures recovery time but ignores profitability and time value of money (unless using discounted payback). Net Present Value (NPV) calculates the present value of all cash flows over a project\'s lifetime, providing the absolute value created after accounting for the time value of money and initial investment. Internal Rate of Return (IRR) determines the annualized percentage return that makes NPV equal zero. The key differences: 1) Time horizon - payback period considers only cash flows until break-even, while NPV and IRR evaluate the entire project lifetime; 2) Decision criteria - shorter payback periods are preferred, positive NPV indicates value creation, and higher IRR suggests better returns; 3) Sophistication - payback period is simpler but less comprehensive than NPV or IRR; 4) Risk emphasis - payback period focuses on capital recovery speed (liquidity risk), while NPV and IRR address overall economic value. For example, a project requiring $100,000 with faster initial returns but lower total cash flows might have a shorter payback period but lower NPV than an alternative with slower initial returns but higher total value.'
            }
          },
          {
            '@type': 'Question',
            'name': 'When should payback period be used in investment decision making?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Payback period is most appropriately used in these scenarios: 1) Initial project screening - quickly eliminating investments with unacceptably long recovery times before conducting more detailed analysis; 2) Liquidity concerns - when a company faces cash flow constraints and needs to recover invested capital quickly; 3) High-risk industries or volatile markets - where faster recovery reduces exposure to future uncertainties; 4) Technology investments - particularly in sectors with rapid obsolescence where quicker returns are critical before technology becomes outdated; 5) Small businesses or startups - with limited capital reserves that need to maintain cash flow; 6) Supplementary analysis - alongside NPV, IRR, and other metrics to provide a more complete evaluation; 7) Politically unstable regions - where shorter payback reduces exposure to political risk; and 8) Comparative analysis - when comparing similar projects with approximately equal lifetime returns. Payback should rarely be used as the sole decision criterion for major investments but provides valuable perspective on risk, capital recovery, and liquidity aspects that complement profitability-focused metrics.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Payback Period Calculator | Investment Recovery Time Analysis',
  description: 'Calculate how long it takes to recover an initial investment using simple or discounted payback period methods for better capital budgeting decisions.',
  keywords: [
    'payback period calculator',
    'investment recovery calculator',
    'discounted payback period',
    'simple payback calculator',
    'break-even analysis',
    'capital budgeting tool',
    'investment decision calculator',
    'project evaluation calculator',
    'ROI timeframe calculator',
    'cash flow recovery analysis'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function PaybackPeriodSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generatePaybackPeriodSchema('https://calculatorhub.space/calculators/payback-period')),
      }}
    />
  );
}