import { Metadata } from 'next';

// Define the JSON-LD schema for the VAT calculator
export function generateVatSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'VAT Calculator',
        'description': 'Calculate Value Added Tax (VAT) for different countries, determine prices inclusive or exclusive of tax, and analyze business tax implications.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'VAT addition calculation',
          'VAT extraction from inclusive prices',
          'Multiple country VAT rate support',
          'B2B and B2C VAT calculation',
          'Import/export VAT handling',
          'Reverse charge mechanism calculation',
          'Multiple item VAT totaling',
          'Special rate category identification',
          'PDF export functionality',
          'Cross-border transaction analysis'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/vat`,
            'description': 'Calculate Value Added Tax for different countries and transactions'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'VAT Analysis'
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
            'name': 'VAT Calculator',
            'item': `${baseUrl}/calculators/vat`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is VAT and how does it differ from sales tax?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Value Added Tax (VAT) is a consumption tax placed on products and services whenever value is added at each stage of the supply chain, from production to point of sale. Unlike sales tax, which is collected only at the final point of purchase, VAT is collected incrementally throughout the production process. Each business in the supply chain charges VAT on their products/services but can reclaim the VAT they\'ve paid on business-related purchases, effectively making it a tax on the value added at each stage. For example, if a manufacturer buys raw materials for $100 + $20 VAT, then sells finished goods for $150 + $30 VAT, they remit only $10 to tax authorities ($30 collected minus $20 paid). This self-policing system creates a paper trail that makes VAT more difficult to evade than sales tax. VAT is prevalent in over 160 countries worldwide, including the entire European Union, while the United States relies on sales tax systems that vary by state and locality. For consumers, the practical difference is minimal—both taxes add a percentage to purchase prices—but for businesses, the administrative processes and cash flow implications differ significantly. VAT systems also typically have fewer exemptions than many sales tax systems, leading to a broader tax base.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are the standard VAT rates in major countries?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'VAT rates vary significantly between countries, with European nations generally having higher rates than those in Asia and the Americas. In the European Union, the standard VAT rates as of 2023 range from 17% in Luxembourg to 27% in Hungary, with most major economies falling between 19-25%: Germany (19%), France (20%), Italy (22%), Spain (21%), and the United Kingdom (20%, though technically called VAT but functionally equivalent). Outside Europe, standard rates include: Canada (5% federal GST plus provincial sales taxes typically totaling 13-15%), Australia (10% GST), New Zealand (15% GST), Japan (10%), China (13% standard rate), India (18% standard GST rate among multiple tiers), Russia (20%), Brazil (various taxes functioning similarly to VAT totaling approximately 17-25%), and Mexico (16%). Many countries employ multiple VAT rates: standard rates for most goods and services, reduced rates for essential items like food, books, or medicine (typically around 5-10%), and zero rates for exports and certain domestic transactions. Some countries also have higher luxury rates on specific items. The COVID-19 pandemic prompted temporary VAT reductions in several countries to stimulate economic recovery, though most have returned to standard rates. For businesses operating internationally, these varying rates and special categories create significant compliance challenges, particularly for e-commerce and digital services that may be subject to VAT in multiple jurisdictions.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do businesses calculate and report VAT?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Businesses calculate VAT through a straightforward input-output system that tracks tax paid and collected. For VAT collected (output tax), businesses apply the appropriate rate to taxable sales—for example, a £1,000 sale in the UK would include £200 VAT at the standard 20% rate. For VAT paid (input tax), businesses track tax paid on purchases used for business purposes. The business then submits periodic VAT returns (monthly, quarterly, or annually depending on jurisdiction and company size) showing output tax collected, input tax paid, and the difference owed to or refundable from tax authorities. Record-keeping requirements are substantial—businesses must maintain detailed VAT invoices showing the supplier\'s VAT registration number, invoice date, unique invoice number, description of goods/services, and VAT amount separated from the net amount. Many jurisdictions now require digital record-keeping and electronic filing through systems like Making Tax Digital in the UK or SAF-T in various EU countries. Special schemes exist for small businesses, including flat rate schemes that simplify calculations by applying a lower fixed percentage with no input tax recovery, and cash accounting schemes allowing businesses to account for VAT when payment is received rather than when invoices are issued. Registration thresholds vary by country—for example, £85,000 in the UK, €85,000 in France for goods, and lower thresholds for services. Businesses exceeding these thresholds must register for VAT, while those below may register voluntarily to reclaim input VAT.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How is VAT handled for international transactions and e-commerce?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'International VAT handling follows the destination principle—tax is generally paid where goods or services are consumed rather than where they originate. For physical goods, exports are typically zero-rated (exempt with credit), meaning the exporter charges 0% VAT but can still reclaim input VAT. Importers then pay import VAT based on the destination country\'s rates before goods clear customs. For digital services and e-commerce, most jurisdictions now apply the place of supply rules where VAT is charged based on the customer\'s location. The EU\'s One-Stop Shop (OSS) system allows businesses to register in a single EU country and file a consolidated return covering all EU sales rather than registering in each country where they have customers. Many non-EU countries have implemented similar simplified registration systems for foreign digital service providers. For B2B transactions across borders, many jurisdictions use the reverse charge mechanism, where the business customer accounts for both input and output VAT, effectively shifting the VAT liability from supplier to customer and eliminating the need for foreign VAT registration. Marketplace facilitators (like Amazon or eBay) are increasingly responsible for collecting and remitting VAT on sales made through their platforms. Compliance challenges include determining correct VAT rates based on customer location, maintaining sufficient evidence of customer location, understanding different distance selling thresholds, and navigating varying invoice requirements across jurisdictions. The OECD\'s ongoing efforts to standardize digital taxation aim to reduce this complexity over time.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are common VAT exemptions and reduced rates?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'VAT systems typically include several categories of special treatment beyond the standard rate. True exemptions (exempt without credit) apply to sectors like healthcare, education, financial services, insurance, and certain non-profit activities. These suppliers don\'t charge VAT on their outputs but also can\'t reclaim input VAT, making this less advantageous than zero-rating. Zero-rated supplies (exempt with credit) include exports, international transport, and in many countries, essential food items, children\'s clothing, and books. These suppliers charge 0% VAT but can reclaim input VAT. Reduced rates commonly apply to hospitality, restaurant services, residential renovations, public transportation, cultural events, and agricultural products, with typical rates ranging from 5-15% depending on the country. Special schemes include flat-rate schemes for farmers, margin schemes for second-hand goods, tour operators\' schemes, and domestic reverse charge for specific sectors prone to fraud. Threshold exemptions for small businesses exist in most systems, allowing businesses below certain annual turnover limits to operate outside the VAT system entirely. Many countries have special provisions for charities, allowing certain VAT relief on fundraising activities or purchases. Temporary rate reductions are occasionally implemented during economic hardships, as seen during the COVID-19 pandemic when many countries reduced VAT on hospitality, tourism, and personal protective equipment. The complexity of these varying treatments creates compliance challenges but allows governments to balance revenue generation with social policy objectives like making essential items more affordable or supporting certain economic sectors.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'VAT Calculator | Value Added Tax Calculation Tool',
  description: 'Calculate Value Added Tax (VAT) for different countries, determine prices inclusive or exclusive of tax, and analyze business tax implications.',
  keywords: [
    'VAT calculator',
    'value added tax calculator',
    'tax calculation tool',
    'VAT rate calculator',
    'VAT inclusive calculator',
    'VAT exclusive calculator',
    'business tax calculator',
    'international VAT calculator',
    'EU VAT calculator',
    'reverse charge calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function VatSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateVatSchema('https://calculatorshub.store/calculators/vat')),
      }}
    />
  );
}