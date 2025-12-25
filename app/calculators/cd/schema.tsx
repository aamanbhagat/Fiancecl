import { Metadata } from 'next';

// Define the JSON-LD schema for the CD calculator
export function generateCDSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'CD Calculator',
        'description': 'Calculate the future value and interest earned on your Certificate of Deposit investment with different compounding options and terms.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Future value calculation',
          'Interest earnings projection',
          'APY calculation',
          'Multiple compounding frequency options',
          'Early withdrawal penalty analysis',
          'Monthly balance breakdown',
          'Interactive growth charts',
          'Principal vs interest visualization',
          'PDF export functionality',
          'Term length comparison'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/cd`,
            'description': 'Calculate CD returns and interest earnings'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Certificate of Deposit'
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
            'name': 'CD Calculator',
            'item': `${baseUrl}/calculators/cd`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is a Certificate of Deposit (CD)?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'A Certificate of Deposit (CD) is a financial product offered by banks and credit unions where you deposit a fixed amount of money for a predetermined period, known as the term, in exchange for a fixed interest rate. Unlike a regular savings account, CDs require you to lock in your funds until the term ends, at which point you receive your initial deposit plus the accrued interest. CDs are among the safest investment options available, primarily because they are insured by the Federal Deposit Insurance Corporation (FDIC) up to $250,000 per depositor, per insured bank.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between interest rate and APY?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The interest rate is the annual percentage your CD earns, but the Annual Percentage Yield (APY) is the real metric to watch. APY accounts for compounding frequency, showing your true yearly return. For example, a 5% rate compounded monthly yields a higher APY (around 5.12%) than one compounded annually (5%). Always compare APYs across different CDs to find the best deal, as a higher nominal rate with less frequent compounding might underperform another option with a lower rate but more frequent compounding.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does compounding frequency affect my CD returns?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Compounding determines how often interest is added to your principal—daily, monthly, quarterly, semi-annually, or annually. More frequent compounding boosts your returns because interest earns interest sooner. For instance, daily compounding on a 5% rate yields more than annual compounding over the same term. The difference becomes more significant with higher interest rates and longer terms. When comparing CDs, look at both the interest rate and compounding frequency, as they together determine your actual returns through the APY.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are early withdrawal penalties and how do they affect my CD?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Early withdrawal penalties are fees charged by banks when you withdraw funds from a CD before its maturity date. These penalties typically range from 3-6 months\' worth of interest on shorter-term CDs to up to 12 months\' interest on longer terms. For example, withdrawing early from a 5-year CD with a 3% APY and a 6-month interest penalty could cost hundreds of dollars. These penalties significantly reduce your earnings and sometimes even eat into your principal if you haven\'t earned enough interest yet. The exact penalty structure varies by bank, so check the terms before opening a CD.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is CD laddering and how can it maximize my returns?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'CD laddering involves splitting your investment across multiple CDs with staggered maturity dates. This strategy balances liquidity and higher returns. For example, instead of investing $10,000 in a single 5-year CD, you could allocate $2,000 each into CDs maturing in 1, 2, 3, 4, and 5 years. As each CD matures, you can either access the funds or reinvest in a new 5-year CD. This approach gives you regular access to funds, the ability to capitalize on rising interest rates, and higher average returns than keeping everything in short-term CDs. It\'s particularly effective in fluctuating interest rate environments.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'CD Calculator | Calculate Certificate of Deposit Returns',
  description: 'Calculate the future value and interest earned on your Certificate of Deposit with our free CD calculator. Compare different terms and compounding frequencies.',
  keywords: [
    'CD calculator',
    'certificate of deposit calculator',
    'CD interest calculator',
    'CD compounding calculator',
    'APY calculator',
    'early withdrawal calculator',
    'CD maturity calculator',
    'CD investment calculator',
    'CD comparison tool',
    'CD ladder calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function CDSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateCDSchema('https://calculatorshub.store/calculators/cd')),
      }}
    />
  );
}