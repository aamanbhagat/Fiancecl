import { Metadata } from 'next';

// Define the JSON-LD schema for the margin calculator
export function generateMarginSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Margin Calculator',
        'description': 'Calculate profit margins, markups, selling prices, and break-even points for your business with our comprehensive margin calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Gross margin calculation',
          'Markup percentage calculation',
          'Selling price determination',
          'Cost price calculation',
          'Margin vs. markup comparison',
          'Break-even analysis',
          'Profit optimization',
          'Multiple pricing scenario modeling',
          'PDF export functionality',
          'Industry margin benchmarking'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/margin`,
            'description': 'Calculate profit margins and markups'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Profit Margin Analysis'
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
            'name': 'Margin Calculator',
            'item': `${baseUrl}/calculators/margin`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What\'s the difference between margin and markup?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Margin and markup are related pricing concepts that use different reference points. Margin (profit margin) is calculated as (Selling Price - Cost) ÷ Selling Price, expressed as a percentage of the selling price. Markup, however, is calculated as (Selling Price - Cost) ÷ Cost, expressed as a percentage of the cost. For example, if an item costs $80 and sells for $100, the margin is ($100 - $80) ÷ $100 = 20%, while the markup is ($100 - $80) ÷ $80 = 25%. This distinction is crucial because using them interchangeably leads to pricing errors. A 50% margin yields a selling price double the markup percentage (100% markup), while a 50% markup yields a smaller margin (33.3%). Retailers and manufacturers typically work with markup during purchasing and pricing decisions, then convert to margin when analyzing financial performance.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do I calculate selling price from cost and desired margin?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'To calculate selling price from cost and desired margin, use the formula: Selling Price = Cost ÷ (1 - Desired Margin as decimal). For example, if a product costs $75 and you want a 40% profit margin, the calculation would be $75 ÷ (1 - 0.40) = $75 ÷ 0.60 = $125. This formula works because margin is defined as (Selling Price - Cost) ÷ Selling Price. By rearranging this equation, we get Selling Price = Cost ÷ (1 - Margin). It\'s important to note that this formula uses margin (profit as percentage of selling price), not markup (profit as percentage of cost). If you\'re working with markup instead, the formula would be Selling Price = Cost × (1 + Markup as decimal). For a 40% markup on a $75 item, the selling price would be $75 × 1.40 = $105, resulting in a lower selling price than using a 40% margin.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are typical profit margins across different industries?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Profit margins vary significantly across industries based on factors like competition, capital requirements, and turnover rates. Average gross profit margins by sector include: Retail (particularly grocery stores): 25-35% with net margins often below 5%; Restaurants: 60-70% gross margins but just 3-5% net margins due to high operational costs; Technology: Software companies often enjoy 70-90% gross margins with 15-25% net margins; Professional services (consulting, legal): 50-70% gross margins; Manufacturing: 25-40% gross margins depending on product complexity; Healthcare: Hospitals typically see 7-10% net margins while pharmaceutical companies can reach 15-20%; Financial services: Banks average 30-35% net margins; Real estate: 15-30% net margins for property management. Within these industries, luxury segments typically command higher margins than budget segments. Companies should benchmark their margins against industry standards while understanding that higher volume businesses can thrive with lower margins, and newer businesses often operate with tighter margins while establishing market presence.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How can I improve my profit margins?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'To improve profit margins, focus on these key strategies: 1) Strategic pricing - implement value-based pricing rather than cost-plus, consider price segmentation for different customer groups, and regularly review and adjust prices; 2) Cost management - negotiate better supplier terms, implement bulk purchasing, optimize inventory to reduce carrying costs, automate processes where possible, and regularly audit expenditures; 3) Product mix optimization - analyze profitability by product line, promote high-margin products, consider discontinuing consistently unprofitable items, and develop complementary offerings; 4) Customer acquisition and retention - focus marketing on attracting higher-value customers, implement loyalty programs to increase customer lifetime value, and cross-sell and upsell to existing customers; 5) Operational efficiency - streamline workflows, reduce waste, improve employee productivity through training, and leverage technology for efficiency gains; and 6) Expand revenue streams - develop recurring revenue models, create value-added services, and explore new market segments.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between gross margin, operating margin, and net margin?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The three main profit margin metrics measure different aspects of business profitability: Gross margin represents the percentage of revenue remaining after deducting direct costs of goods sold (COGS), calculated as (Revenue - COGS) ÷ Revenue. It measures production and service delivery efficiency. Operating margin goes further by also subtracting operating expenses like rent, payroll, and marketing, calculated as (Revenue - COGS - Operating Expenses) ÷ Revenue. It measures operational efficiency and pricing effectiveness. Net margin (bottom line) deducts all expenses including taxes and interest, calculated as Net Income ÷ Revenue. It shows the percentage of each revenue dollar that becomes profit. For example, a business with $1M revenue, $600K COGS, $200K operating expenses, and $50K in interest and taxes would have: 40% gross margin ($400K/$1M), 20% operating margin ($200K/$1M), and 15% net margin ($150K/$1M). Each metric offers different insights—gross margin reflects production efficiency, operating margin shows operational management, and net margin demonstrates overall profitability including financing decisions and tax strategies.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Margin Calculator | Calculate Profit Margins and Markups',
  description: 'Calculate profit margins, markups, selling prices, and break-even points for your business with our comprehensive margin calculator.',
  keywords: [
    'margin calculator',
    'profit margin calculator',
    'markup calculator',
    'gross margin calculator',
    'selling price calculator',
    'retail margin calculator',
    'pricing calculator',
    'break-even calculator',
    'cost-plus calculator',
    'business profitability tool'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function MarginSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateMarginSchema('https://calculatorhub.space/calculators/margin')),
      }}
    />
  );
}