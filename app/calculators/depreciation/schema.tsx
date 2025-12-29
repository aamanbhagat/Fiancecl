import { Metadata } from 'next';

// Define the JSON-LD schema for the depreciation calculator
export function generateDepreciationSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Depreciation Calculator',
        'description': 'Calculate asset depreciation using various methods including straight-line, declining balance, and more to understand financial impact over time.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Multiple depreciation methods',
          'Asset value tracking',
          'Tax savings calculation',
          'Bonus depreciation modeling',
          'Section 179 deduction options',
          'Depreciable base analysis',
          'Comparative method visualization',
          'Detailed depreciation schedules',
          'PDF export functionality',
          'Interactive comparison charts'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/depreciation`,
            'description': 'Calculate asset depreciation using various methods'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Asset Depreciation'
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
            'name': 'Depreciation Calculator',
            'item': `${baseUrl}/calculators/depreciation`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is depreciation and why is it important?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Depreciation is the systematic allocation of an asset\'s cost over its useful life, representing how the value decreases due to wear and tear, obsolescence, or passage of time. It\'s important for three key reasons: 1) Financial reporting - it matches the expense of an asset to the revenue it generates over time; 2) Tax benefits - it allows businesses to deduct the cost of assets gradually, reducing taxable income; and 3) Asset replacement planning - it helps businesses plan for eventual asset replacement by recognizing their declining value. Without proper depreciation tracking, businesses may overstate profits, overpay taxes, and fail to budget appropriately for capital replacements.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are the different methods of calculating depreciation?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The main depreciation methods include: 1) Straight-Line - allocates equal expense amounts over the asset\'s useful life, calculated as (Cost - Salvage Value) ÷ Useful Life; 2) Declining Balance - applies a fixed percentage to the remaining book value each year, resulting in higher early depreciation; 3) Double Declining Balance - an accelerated method using twice the straight-line rate; 4) Sum-of-Years\'-Digits - another accelerated method using changing fractions based on remaining useful life; 5) Units of Production - ties depreciation to actual usage rather than time, ideal for equipment whose wear correlates with production volume. Each method affects financial statements differently, with accelerated methods providing higher early tax deductions while straight-line offers simpler, consistent expense recognition.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is Section 179 and bonus depreciation?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Section 179 and bonus depreciation are tax incentives that allow businesses to deduct the cost of qualified assets more quickly than standard depreciation. Section 179 permits businesses to deduct the full purchase price of qualifying equipment in the year it\'s placed in service, up to annual limits ($1,160,000 for 2023, subject to phase-out thresholds). Bonus depreciation allows for immediate expensing of a percentage of qualified asset costs after Section 179 has been applied. For 2023, this percentage is 80%, decreasing by 20% annually through 2027. These provisions provide significant tax advantages for businesses making capital investments, as they essentially accelerate depreciation deductions that would otherwise be spread across multiple years.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do book depreciation and tax depreciation differ?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Book depreciation and tax depreciation serve different purposes and often use different methods. Book depreciation appears on financial statements following GAAP or IFRS standards, aiming to accurately match expenses with revenue over an asset\'s useful life. Companies often choose straight-line depreciation for financial reporting to show consistent profits. Tax depreciation follows rules set by tax authorities (like the IRS\'s MACRS system in the US) and is designed to provide standardized depreciation periods and methods. Businesses typically prefer accelerated methods for tax purposes to maximize early deductions. This difference is perfectly legitimate—companies commonly maintain separate depreciation schedules for financial reporting and tax purposes, with the differences appearing as "temporary differences" on their deferred tax calculations.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does depreciation affect financial statements and tax returns?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Depreciation impacts three key financial statements: 1) On the income statement, it appears as an expense that reduces reported profit; 2) On the balance sheet, accumulated depreciation reduces the net book value of assets; 3) On the cash flow statement, it\'s added back to net income when calculating operating cash flow because it\'s a non-cash expense. For tax returns, depreciation reduces taxable income, lowering tax liability. This creates the unusual situation where higher depreciation expense can actually improve a company\'s cash position (through tax savings) while reducing reported profits. Financial ratios are also affected: ROA decreases as accumulated depreciation grows, asset turnover increases as the denominator (total assets) decreases, and cash flow ratios typically improve since depreciation is added back when calculating operational cash flow.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Depreciation Calculator | Calculate Asset Value Decline',
  description: 'Calculate asset depreciation using various methods like straight-line, declining balance, and more with our comprehensive calculator for financial planning and tax analysis.',
  keywords: [
    'depreciation calculator',
    'straight-line depreciation',
    'declining balance calculator',
    'MACRS calculator',
    'section 179 calculator',
    'bonus depreciation',
    'asset depreciation',
    'business tax calculator',
    'depreciation schedule generator',
    'sum of years digits calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function DepreciationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateDepreciationSchema('https://calculatorhub.space/calculators/depreciation')),
      }}
    />
  );
}