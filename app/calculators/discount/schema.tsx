import { Metadata } from 'next';

// Define the JSON-LD schema for the discount calculator
export function generateDiscountSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Discount Calculator',
        'description': 'Calculate discounted prices, savings amounts, and percentage discounts for retail, sales, or personal budgeting purposes.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Percentage discount calculation',
          'Dollar amount discount calculation',
          'Savings amount calculation',
          'Original price calculation from sale price',
          'Multiple discount stacking',
          'Tax inclusion options',
          'Bulk discount calculation',
          'Comparative savings analysis',
          'PDF export functionality',
          'Results visualization'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/discount`,
            'description': 'Calculate discount amounts and final prices'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Price Discounts'
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
            'name': 'Discount Calculator',
            'item': `${baseUrl}/calculators/discount`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How do I calculate a percentage discount?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'To calculate a percentage discount, multiply the original price by the discount percentage (converted to a decimal) and subtract that amount from the original price. For example, for a 25% discount on a $100 item: $100 × 0.25 = $25 (discount amount), then $100 - $25 = $75 (final price). Alternatively, you can multiply the original price by (1 minus the discount percentage): $100 × (1 - 0.25) = $100 × 0.75 = $75. For quick mental math, remember that 10% is easy to calculate (just move the decimal point), and you can use that as a building block (e.g., 25% = 10% + 10% + 5%).'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between a discount and a markdown?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'While often used interchangeably in retail, discount and markdown have distinct technical meanings. A discount is a temporary reduction in price, typically as part of a promotion or sale event, with the expectation that the item will return to its original price later. Examples include seasonal sales, loyalty discounts, or coupons. A markdown is a permanent reduction in price, often applied to move aging inventory or reflect decreased value. From an accounting perspective, discounts are typically reported separately from regular sales, while markdowns are absorbed into the cost of goods sold. For consumers, the practical effect is identical—both result in paying less than the original price.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do I calculate the original price from a sale price?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'To find the original price when you know the sale price and discount percentage, divide the sale price by (1 minus the discount percentage as a decimal). For example, if an item costs $60 after a 25% discount, the original price would be: $60 ÷ (1 - 0.25) = $60 ÷ 0.75 = $80. This calculation works because the sale price is effectively the original price multiplied by (1 - discount percentage). The formula works for any discount percentage, allowing you to verify if advertised "original prices" in stores are accurate. This calculation is particularly useful during sales when only the discounted price and discount percentage are displayed.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do multiple discounts stack?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Multiple discounts don\'t add together but apply sequentially, resulting in a total discount less than their simple sum. For example, with a 20% discount followed by an additional 10% off, the total discount isn\'t 30%. Instead: Original price × (1 - 0.2) × (1 - 0.1) = Original price × 0.8 × 0.9 = Original price × 0.72, representing a 28% total discount. To calculate the equivalent single discount percentage from multiple discounts, subtract the product of (1 - each discount rate) from 1. For three discounts of 20%, 10%, and 5%: 1 - [(1 - 0.2) × (1 - 0.1) × (1 - 0.05)] = 1 - [0.8 × 0.9 × 0.95] = 1 - 0.684 = 31.6% total effective discount.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are common retail discount strategies and their typical percentages?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Retail discount strategies follow patterns by purpose and industry: Clearance discounts typically range from 50-70% for seasonal inventory; Flash sales offer 20-40% for limited periods (often 24-48 hours); Loyalty program discounts average 5-15% for members; Bundle discounts provide 10-25% on package deals; Volume discounts scale from 5-20% based on purchase quantity; Referral discounts average 10-20% for bringing new customers; Holiday/seasonal sales range from 15-40% depending on the occasion; and End-of-life product discounts reach 60-80% for discontinued items. The psychology behind pricing is also important—items priced at $19.99 rather than $20.00 appear more affordable (charm pricing), and discounts presented as "Get $20 off" often perform better than equivalent percentage discounts for higher-priced items.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Discount Calculator | Calculate Sales Price & Savings',
  description: 'Calculate discounted prices, savings amounts, and percentage discounts for shopping, sales events, or personal budgeting with our free calculator.',
  keywords: [
    'discount calculator',
    'sale price calculator',
    'percentage off calculator',
    'savings calculator',
    'price reduction calculator',
    'multiple discount calculator',
    'original price calculator',
    'retail discount tool',
    'markdown calculator',
    'shopping discount calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function DiscountSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateDiscountSchema('https://calculatorshub.store/calculators/discount')),
      }}
    />
  );
}