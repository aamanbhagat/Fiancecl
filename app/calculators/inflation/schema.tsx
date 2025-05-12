import { Metadata } from 'next';

// Define the JSON-LD schema for the inflation calculator
export function generateInflationSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Inflation Calculator',
        'description': 'Calculate the effects of inflation on purchasing power, investment returns, and future expenses with our comprehensive inflation calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Purchasing power calculation',
          'Historical inflation data',
          'Future value projection',
          'Real return calculation',
          'Inflation-adjusted income estimation',
          'Retirement planning with inflation',
          'Cost of living adjustment analysis',
          'Interactive inflation visualization',
          'PDF export functionality',
          'Custom inflation rate modeling'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/inflation`,
            'description': 'Calculate the effects of inflation on purchasing power'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Inflation Analysis'
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
            'name': 'Inflation Calculator',
            'item': `${baseUrl}/calculators/inflation`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is inflation and how is it measured?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Inflation is the rate at which the general price level of goods and services rises, eroding purchasing power over time. It\'s primarily measured using Consumer Price Index (CPI), which tracks price changes across a basket of commonly purchased goods and services. The U.S. Bureau of Labor Statistics calculates CPI monthly by collecting prices for about 80,000 items across categories including housing, food, transportation, and healthcare, weighted according to spending patterns. Other inflation measures include the Personal Consumption Expenditures (PCE) Price Index (preferred by the Federal Reserve), Producer Price Index (PPI) tracking wholesale prices, and GDP Price Index measuring price changes across the entire economy. Central banks typically target annual inflation rates around 2%, viewing this rate as promoting price stability while allowing for economic growth.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does inflation affect my savings and investments?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Inflation erodes the purchasing power of savings and investments over time. For example, with 3% annual inflation, $100,000 today will have the purchasing power of only about $74,400 in 10 years. This means investments must exceed the inflation rate to provide real returns. Cash and low-yield savings are particularly vulnerable—a savings account paying 1% during 3% inflation loses 2% in real value annually. Different assets have varying inflation protection: TIPS (Treasury Inflation-Protected Securities) automatically adjust principal with inflation; stocks historically provide long-term inflation protection through growth; real estate often appreciates with inflation; commodities like gold traditionally serve as inflation hedges; while fixed-rate bonds suffer during high inflation. To maintain purchasing power, financial advisors recommend calculating your "real" return (nominal return minus inflation rate) when evaluating investment performance.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What causes inflation and what are the different types?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Inflation stems from three main causes: Demand-pull inflation occurs when aggregate demand exceeds supply, causing competitive price increases (e.g., strong economic growth or excess money supply); Cost-push inflation happens when production costs increase, forcing businesses to raise prices (e.g., rising raw material or labor costs); and Built-in inflation results from expectations of future price increases, creating wage-price spirals. There are also several types of inflation based on severity: Creeping inflation (1-3% annually) is generally considered normal and healthy; Walking inflation (3-10%) indicates economic overheating; Galloping inflation (10-50%) creates serious economic distortions; and Hyperinflation (50%+ monthly) represents severe economic crisis, historically occurring during wars or political instability. Additionally, sector-specific inflation can affect particular goods or services (like healthcare or education) at rates significantly different from the overall economy.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How should I plan for inflation in retirement?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Planning for inflation in retirement requires several strategies: 1) Use realistic inflation projections—while overall inflation has averaged about 3% historically, healthcare inflation has typically been higher at 5-7% annually; 2) Implement the "4% rule with inflation adjustments"—initially withdraw 4% of retirement savings, then increase withdrawal amounts annually with inflation; 3) Maintain growth investments—allocate a portion of your portfolio to stocks even during retirement; 4) Consider inflation-protected investments like TIPS, I-bonds, or inflation-adjusted annuities; 5) Factor Social Security\'s cost-of-living adjustments into your plan; 6) Calculate your "longevity-adjusted" inflation needs—longer retirements face greater cumulative inflation impact; 7) Create multiple income streams including rental property or dividend income that may increase with inflation; and 8) Periodically review and adjust your retirement plan based on actual inflation experiences and projections.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between nominal and real returns?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Nominal returns represent investment performance before accounting for inflation, while real returns represent purchasing power gains after inflation. The relationship is expressed as: Real Return ≈ Nominal Return - Inflation Rate. For example, if your investment grows 7% during a year with 3% inflation, your real return is approximately 4%. This distinction is crucial for long-term planning. For instance, a seemingly modest 3% annual inflation rate reduces purchasing power by about 50% over 20 years, meaning an investment must double just to maintain buying power. When evaluating historical performance, comparing nominal returns can be misleading—an 8% return during 2% inflation (6% real return) creates more wealth than a 12% return during 10% inflation (2% real return). Tax considerations further complicate matters since taxes are typically applied to nominal gains regardless of inflation, potentially resulting in taxation on what are effectively losses in purchasing power during high-inflation periods.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Inflation Calculator | Calculate the Impact on Purchasing Power',
  description: 'Calculate the effects of inflation on purchasing power, investment returns, and future expenses with our comprehensive inflation calculator.',
  keywords: [
    'inflation calculator',
    'purchasing power calculator',
    'cost of living calculator',
    'inflation adjustment calculator',
    'real value calculator',
    'future value with inflation',
    'inflation impact calculator',
    'retirement inflation calculator',
    'historical inflation calculator',
    'price increase calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function InflationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateInflationSchema('https://calculatorhub.space/calculators/inflation')),
      }}
    />
  );
}