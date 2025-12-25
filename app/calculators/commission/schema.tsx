import { Metadata } from 'next';

// Define the JSON-LD schema for the commission calculator
export function generateCommissionSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Commission Calculator',
        'description': 'Calculate commission earnings, rates, and total compensation based on various commission structures and sales performance metrics.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Fixed rate commission calculation',
          'Tiered commission structure support',
          'Mixed base + commission calculation',
          'Sales target performance analysis',
          'Multi-period commission projections',
          'Tax withholding estimation',
          'Draw against commission modeling',
          'Performance visualization charts',
          'PDF export functionality',
          'Income comparison scenarios'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/commission`,
            'description': 'Calculate commission earnings and compensation structures'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Sales Commission'
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
            'name': 'Commission Calculator',
            'item': `${baseUrl}/calculators/commission`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What are the different types of commission structures?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Commission structures vary widely across industries and companies: 1) Straight Commission - payment is 100% based on sales performance with no base salary; 2) Base plus Commission - combines a fixed salary with performance-based earnings; 3) Tiered Commission - provides progressively higher rates as sales targets are achieved; 4) Draw Against Commission - offers an advance that\'s later deducted from earned commissions; 5) Residual Commission - continues paying for ongoing business from past customers; and 6) Team-based Commission - shares sales credit across a group. Each structure creates different incentives and risk profiles. Our calculator handles all these variations to help you understand your potential earnings.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do tiered commission structures work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Tiered commissions increase your commission rate as you reach higher sales thresholds. For example, a tiered structure might pay 5% on the first $25,000 in sales, 7% on sales between $25,001 and $50,000, and 10% on everything above $50,000. These can be calculated in two ways: total volume tiers (higher rate applies to all sales once a threshold is reached) or marginal tiers (higher rates only apply to amounts above each threshold). Tiered structures incentivize high performance by significantly increasing earnings potential for top performers. On average, moving up one tier can increase commission earnings by 20-40%.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How are commissions taxed?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Commissions are taxed as ordinary income, but withholding works differently than for regular salary. The IRS considers commissions \"supplemental wages\" and provides two withholding methods: 1) The percentage method - withholding a flat 22% federal tax rate; or 2) The aggregate method - combining commission with regular wages to determine withholding. While 22% is withheld initially, your actual tax rate may be higher or lower depending on total annual income. Self-employed commission workers must pay both employee and employer portions of FICA taxes (15.3% total) and make quarterly estimated tax payments. Proper tax planning is essential for commission-based workers to avoid underpayment penalties or surprises at tax time.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the average commission rate in different industries?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Commission rates vary significantly by industry, product margin, and sales cycle length. Average rates include: Real Estate (5-6% split between agents), Insurance (15-20% first-year commissions for life insurance, 7-15% for property and casualty), Automotive Sales (2-3% of sale price or 25-30% of dealer profit), Financial Services (0.25-1% for financial advisors managing assets, 3-5% for mortgage brokers), Software Sales (7-15% for SaaS products), Retail (2-15% depending on product category), and Manufacturing Reps (5-15% for industrial equipment). Rates also vary based on company size, with startups often offering higher commission percentages to attract talent while established companies may offer lower rates but higher overall compensation through base salary and benefits.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is a draw against commission?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'A draw against commission is an advance that provides stable income during slow periods or when building a client base. There are two main types: 1) Recoverable draw - functions as a loan that must be repaid from future commissions, creating potential debt if sales targets aren\'t met; and 2) Non-recoverable draw - serves as a guaranteed minimum compensation that doesn\'t need repayment if commissions fall short. Draws typically reset monthly or quarterly. For example, with a $3,000 monthly recoverable draw, if you earn $4,000 in commissions, you\'d receive an additional $1,000; if you earn only $2,000, you\'d carry a $1,000 deficit into the next period. This arrangement helps balance income stability with performance incentives.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Commission Calculator | Calculate Sales Commission Earnings',
  description: 'Calculate commission earnings, rates, and total compensation with our free calculator supporting various commission structures like tiered, base+commission, and more.',
  keywords: [
    'commission calculator',
    'sales commission calculator',
    'tiered commission calculator',
    'commission rate calculator',
    'commission structure comparison',
    'sales performance calculator',
    'base plus commission calculator',
    'draw against commission',
    'sales earnings estimator',
    'real estate commission calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function CommissionSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateCommissionSchema('https://calculatorshub.store/calculators/commission')),
      }}
    />
  );
}