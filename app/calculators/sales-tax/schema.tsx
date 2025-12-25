import { Metadata } from 'next';

// Define the JSON-LD schema for the sales tax calculator
export function generateSalesTaxSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Sales Tax Calculator',
        'description': 'Calculate sales tax for different states and localities, determine final prices, and analyze tax implications with our comprehensive sales tax calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'State and local sales tax calculation',
          'Reverse sales tax calculation',
          'Multi-item tax calculation',
          'Tax-exempt purchase analysis',
          'Out-of-state sales tax determination',
          'Tax jurisdiction lookup',
          'Combined tax rate identification',
          'Tax-inclusive price conversion',
          'PDF export functionality',
          'Multi-state comparison'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/sales-tax`,
            'description': 'Calculate sales tax for different states and localities'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Sales Tax Analysis'
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
            'name': 'Sales Tax Calculator',
            'item': `${baseUrl}/calculators/sales-tax`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How does sales tax work in the United States?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Sales tax in the United States operates as a consumption tax imposed at the point of purchase for certain goods and services. Unlike many countries that use a national value-added tax (VAT), the U.S. employs a decentralized system where sales taxes are primarily governed by states, counties, cities, and special districts, resulting in over 10,000 different tax jurisdictions nationwide. Currently, 45 states and the District of Columbia collect statewide sales taxes, while Alaska, Delaware, Montana, New Hampshire, and Oregon do not impose state sales taxes (though some localities in Alaska do charge local sales taxes). The complexity arises from layered taxation—many purchases are subject to a combination of state, county, city, and special district taxes. For example, a purchase in Chicago includes the Illinois state tax (6.25%), Cook County tax (1.75%), Chicago city tax (1.25%), and Regional Transportation Authority tax (1%), totaling 10.25%. Tax rates vary significantly across jurisdictions, from under 5% to over 10% in high-tax areas. Additionally, states differ in what items are taxable—most tax tangible goods, but policies vary widely for services, groceries, clothing, and digital products. This decentralized approach creates significant compliance challenges for businesses operating across multiple jurisdictions.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What items are typically exempt from sales tax?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Sales tax exemptions vary significantly by state, but several categories are commonly excluded from taxation. Essential groceries (unprepared food items) are fully exempt in 32 states and partially exempt in several others, though prepared foods and restaurant meals are typically taxed. Prescription medications are exempt in most states, while non-prescription drugs have varying treatment. Clothing exemptions differ widely—some states fully exempt clothing (New Jersey, Pennsylvania), others exempt clothing under a certain price threshold (New York exempts items under $110), while most tax all clothing purchases. Services receive inconsistent treatment, with some states taxing nearly all services (Hawaii, New Mexico, South Dakota) while others tax only specific categories. Digital products and software follow inconsistent rules across states. Other common exemptions include textbooks and educational materials, certain agricultural supplies, manufacturing equipment used in production, certain renewable energy equipment, occasional sales by individuals (like garage sales), and purchases by qualifying non-profit organizations and government entities. Many states also offer "sales tax holidays"—temporary exemptions for specific categories like back-to-school supplies or emergency preparedness items. Business-to-business transactions often qualify for "sale for resale" exemptions when items will be resold or incorporated into products for resale. Navigating these exemptions requires careful attention to the specific rules in each tax jurisdiction.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How has online sales tax collection changed after the South Dakota v. Wayfair decision?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The 2018 Supreme Court decision in South Dakota v. Wayfair fundamentally transformed online sales tax collection in the United States. Before Wayfair, states could only require businesses with a physical presence (stores, warehouses, employees) in their state to collect sales tax—a standard established by the 1992 Quill Corp. v. North Dakota decision. The Wayfair ruling overturned this physical presence requirement, allowing states to mandate sales tax collection based on economic nexus—typically defined as exceeding certain thresholds of sales or transactions in a state. In response, all 45 sales-tax-collecting states have enacted economic nexus laws, though with varying thresholds. Many follow South Dakota\'s standard ($100,000 in sales or 200 transactions), while others set different limits. This change has created significant compliance burdens for online sellers, who must now track sales by state, register in states where they exceed thresholds, collect appropriate state and local taxes based on shipping destination, and file returns in multiple jurisdictions. For consumers, the primary change is that online purchases now generally include sales tax regardless of whether the retailer has a physical presence in their state. To facilitate compliance, many marketplace facilitators (Amazon, Etsy, eBay) now collect and remit taxes on behalf of their sellers. While the Wayfair decision sought to level the playing field between online and brick-and-mortar retailers, it has increased complexity for businesses navigating the patchwork of state requirements.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are a business\'s responsibilities for collecting and remitting sales tax?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Businesses have several key responsibilities regarding sales tax collection and remittance. First, they must determine where they have sales tax nexus—legal obligations to collect tax based on physical presence (stores, employees, inventory) or economic activity (exceeding sales or transaction thresholds). Once nexus is established, businesses must register for sales tax permits in each applicable jurisdiction, typically through state departments of revenue. After registration, they must properly calculate taxes on each transaction based on: the taxability of products or services sold, applicable exemptions, the specific tax rates at the customer\'s location, and any special rules like tax holidays. Businesses must then collect this tax from customers at the point of sale and maintain detailed records of all transactions. Collected taxes must be remitted to tax authorities according to assigned filing frequencies (monthly, quarterly, or annually), which are typically determined by sales volume. Required reports include information on gross sales, exempt sales, and tax collected by jurisdiction. Businesses must also maintain exemption certificates for tax-exempt sales and make these records available for potential audits. Failing to properly collect and remit sales tax can result in significant penalties, including being held personally liable for uncollected taxes plus interest and penalties. Given this complexity, many businesses use specialized software or services to automate compliance, especially when operating across multiple jurisdictions.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do I calculate sales tax when the listed price includes tax?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Extracting the sales tax from a tax-inclusive price (reverse sales tax calculation) requires a different formula than adding tax to a pre-tax amount. When the total price already includes sales tax, you can calculate the original pre-tax amount and the tax portion using these steps: 1) Convert the tax rate to a decimal by dividing by 100, then add 1. For example, with a 7.5% tax rate, you get 1.075. 2) Divide the total price by this number to find the pre-tax amount. For instance, if an item costs $85.60 including 7.5% tax: $85.60 ÷ 1.075 = $79.63. 3) Subtract the pre-tax amount from the total to find the tax amount: $85.60 - $79.63 = $5.97. This approach is commonly needed in several scenarios: when prices are advertised as "tax included" (common in certain industries and many countries outside the US); when calculating reimbursements where only the total receipt amount is available; when determining the proper tax basis for accounting purposes; and when filing for tax refunds or exemptions on previous purchases. The formula can be expressed as: Pre-tax Amount = Total Price ÷ (1 + Tax Rate as decimal), and Tax Amount = Total Price - Pre-tax Amount. For businesses that advertise tax-inclusive prices, this calculation ensures accurate accounting and tax filing.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Sales Tax Calculator | State and Local Tax Estimator',
  description: 'Calculate sales tax for different states and localities, determine final prices, and analyze tax implications with our comprehensive sales tax calculator.',
  keywords: [
    'sales tax calculator',
    'state tax calculator',
    'local sales tax estimator',
    'tax rate finder',
    'sales tax by state',
    'tax inclusive price calculator',
    'reverse sales tax calculator',
    'multi-state tax calculator',
    'ecommerce tax calculator',
    'retail tax calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function SalesTaxSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateSalesTaxSchema('https://calculatorshub.store/calculators/sales-tax')),
      }}
    />
  );
}