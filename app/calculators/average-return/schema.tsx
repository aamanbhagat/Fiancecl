import { Metadata } from 'next';

// Define the JSON-LD schema for the average return calculator
export function generateAverageReturnSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Average Return Calculator',
        'description': 'Measure and compare investment performance with arithmetic mean, geometric mean, and CAGR metrics to analyze your investments over time.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Investment return analysis',
          'Arithmetic mean calculation',
          'Geometric mean calculation',
          'CAGR calculation',
          'Inflation adjustment',
          'Tax impact modeling',
          'Volatility visualization',
          'Return comparison',
          'Interactive charts and graphs',
          'PDF export functionality'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/average-return`,
            'description': 'Calculate and compare investment performance metrics'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Investment Returns'
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
            'name': 'Average Return Calculator',
            'item': `${baseUrl}/calculators/average-return`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What\'s the difference between arithmetic mean and geometric mean return?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The arithmetic mean is a simple average of period returns, calculated by summing all returns and dividing by the number of periods. The geometric mean accounts for compounding effects by multiplying returns together and taking the nth root. For volatile investments, the geometric mean is typically lower than the arithmetic mean and provides a more accurate representation of actual investment performance. For example, returns of 50% and -50% yield an arithmetic mean of 0% but a geometric mean of -6.07%, reflecting the true loss.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is CAGR and when should I use it?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'CAGR (Compound Annual Growth Rate) represents the constant rate of return needed each year to grow an initial investment to a final value over a specified time period. It\'s calculated using the formula: CAGR = (Final Value/Initial Value)^(1/Number of Years) - 1. CAGR is ideal for comparing investments over different time periods or evaluating an investment\'s long-term performance. Unlike arithmetic mean, CAGR accounts for the compounding effect and provides a smoothed growth rate that eliminates the volatility of year-to-year returns.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does volatility affect investment returns?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Volatility significantly impacts investment returns through a mathematical principle called volatility drag. Due to the asymmetric nature of percentage gains and losses, higher volatility reduces compounded returns over time. For example, a 50% gain followed by a 50% loss results in a 25% overall loss, not 0% as simple averaging would suggest. This explains why the geometric mean is always less than or equal to the arithmetic mean, with the gap widening as volatility increases. Investors should therefore consider volatility when evaluating performance, as two investments with the same average return but different volatility levels will produce different end results.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Why should I adjust returns for inflation and taxes?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Adjusting returns for inflation reveals your real purchasing power gains, while tax adjustments show your actual wealth accumulation. For example, an 8% nominal return during 3% inflation actually represents only a 4.85% increase in purchasing power (calculated as (1 + 0.08)/(1 + 0.03) - 1). Further, if you\'re in a 25% tax bracket, your after-tax real return drops to just 3.64%. Without these adjustments, investors often overestimate their investment performance and may fail to meet financial goals. Our calculator handles these complex calculations automatically, providing a clear picture of your actual investment growth.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are typical benchmark returns for different asset classes?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Historical average returns (CAGR) for major asset classes from 1926-2023 are: S&P 500 (stocks): 9.8% with 15.2% standard deviation; Corporate bonds: 5.3% with 8.4% standard deviation; Treasury bills: 3.3% with 3.1% standard deviation; and Gold: 4.9% with 15.1% standard deviation. Meanwhile, inflation has averaged 3.1%. When comparing your returns to these benchmarks, focus on geometric mean or CAGR rather than arithmetic mean, and consider your investment\'s volatility and time horizon. Remember that past performance doesn\'t guarantee future results, and higher returns typically come with greater risk.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Average Return Calculator | Investment Performance Analysis',
  description: 'Analyze investment performance using arithmetic mean, geometric mean, and CAGR with our free calculator that accounts for volatility, inflation, and taxes.',
  keywords: [
    'average return calculator',
    'investment return calculator',
    'arithmetic mean calculator',
    'geometric mean calculator',
    'CAGR calculator',
    'investment performance',
    'volatility impact',
    'inflation adjusted returns',
    'after-tax returns',
    'performance metrics comparison'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function AverageReturnSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateAverageReturnSchema('https://calculatorhub.space/calculators/average-return')),
      }}
    />
  );
}