import { Metadata } from 'next';

// Define the JSON-LD schema for the currency converter calculator
export function generateCurrencyConverterSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Currency Converter Calculator',
        'description': 'Convert between different currencies with real-time exchange rates, historical data, and customizable amount options.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Real-time currency conversion',
          'Support for 170+ global currencies',
          'Historical exchange rate data',
          'Currency pair comparison',
          'Rate trend visualization',
          'Fee and margin calculation',
          'Offline conversion capability',
          'Favorite currency pairs',
          'PDF export functionality',
          'Currency exchange notifications'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/currency-converter`,
            'description': 'Convert between different currencies with live rates'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Currency Exchange'
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
            'name': 'Currency Converter',
            'item': `${baseUrl}/calculators/currency-converter`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How do exchange rates work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Exchange rates represent the value of one currency relative to another. They\'re determined by supply and demand in the foreign exchange market, influenced by factors including inflation rates, interest rates, government debt, political stability, and economic performance. Rates fluctuate constantly during trading hours (24/5) based on global market activity. There are two rates for each currency pair: the "bid" (selling) price and the "ask" (buying) price, with the difference being the spread. Banks and exchange services typically add margins to these rates, resulting in retail customers receiving less favorable rates than the interbank or mid-market rates shown in financial news.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between spot, forward, and real exchange rates?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Spot exchange rates are the current market rates for immediate currency transactions, typically settling within two business days. Forward exchange rates are predetermined rates for future currency exchanges, used to hedge against potential rate fluctuations for transactions happening weeks, months, or years later. The real exchange rate is an economic metric that compares the purchasing power of two currencies by accounting for inflation differences between countries. While spot rates are what you\'ll use for immediate transfers or travel expenses, forward rates are common in international business, and real exchange rates help economists compare living standards and competitiveness between countries.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Why are exchange rates different at banks versus online?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Exchange rates differ between providers primarily due to varying markup practices. Banks typically offer less competitive rates with markups of 3-7% above the interbank rate, plus additional fixed fees, as currency exchange isn\'t their primary business. Online specialists like Wise or Revolut often provide rates closer to the mid-market rate (0.5-2% markup) because they operate with lower overhead costs and focus specifically on currency services. Additionally, the timing of rate updates varies—banks might update rates once daily while online platforms update continuously. For large transactions, this difference can be substantial, potentially saving hundreds or thousands of dollars when using online services instead of traditional banks.'
            }
          },
          {
            '@type': 'Question',
            'name': 'When is the best time to exchange currency?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The optimal timing for currency exchange depends on market fluctuations and specific currency pairs. Generally, exchanging during mid-week (Tuesday-Thursday) often yields better rates as market volatility tends to be lower compared to Mondays when markets react to weekend developments. Timing within the day matters too—trading during overlap hours between major financial markets (8-12 AM EST when both European and American markets are active) provides better liquidity and potentially better rates. For major events like elections, central bank announcements, or economic data releases, rates can fluctuate dramatically. If you have flexibility, tracking a currency\'s performance for a few weeks and setting rate alerts can help identify favorable conversion opportunities.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How can I get the best exchange rates when traveling internationally?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'To secure optimal exchange rates while traveling, use multiple strategies: 1) Avoid airport currency exchanges and hotel conversion services, which typically charge 10-15% premiums; 2) Use credit cards with no foreign transaction fees for major purchases, as they often apply near-interbank rates; 3) Withdraw local currency from ATMs affiliated with major banking networks, but choose the local currency option when prompted (declining "dynamic currency conversion"); 4) Consider multi-currency cards from fintech providers like Wise or Revolut, which offer near-market exchange rates; 5) If exchanging cash is necessary, use banks or official exchange offices in city centers rather than tourist areas; and 6) Exchange larger amounts at once to minimize fixed transaction fees.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Currency Converter | Live Exchange Rate Calculator',
  description: 'Convert between 170+ global currencies with our free calculator featuring real-time exchange rates, historical data, and personalized amount options.',
  keywords: [
    'currency converter',
    'exchange rate calculator',
    'currency conversion',
    'foreign exchange calculator',
    'money converter',
    'FX calculator',
    'international currency converter',
    'live exchange rates',
    'forex calculator',
    'travel money calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function CurrencyConverterSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateCurrencyConverterSchema('https://calculatorshub.store/calculators/currency-converter')),
      }}
    />
  );
}