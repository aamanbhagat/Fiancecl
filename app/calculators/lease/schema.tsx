import { Metadata } from 'next';

// Define the JSON-LD schema for the lease calculator
export function generateLeaseSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Lease Calculator',
        'description': 'Calculate lease payments, compare lease vs. buy options, and analyze the total cost of leasing vehicles or equipment with our comprehensive lease calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Monthly lease payment calculation',
          'Lease vs. buy comparison',
          'Money factor to interest conversion',
          'Residual value estimation',
          'Total lease cost analysis',
          'Buyout option evaluation',
          'Early termination calculation',
          'Mileage impact analysis',
          'PDF export functionality',
          'Multiple lease scenario comparison'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/lease`,
            'description': 'Calculate lease payments and analyze leasing options'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Lease Analysis'
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
            'name': 'Lease Calculator',
            'item': `${baseUrl}/calculators/lease`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How are car lease payments calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Car lease payments consist of two primary components: depreciation and financing. The depreciation portion covers the vehicle\'s value loss during the lease term, calculated as (Capitalized Cost - Residual Value) ÷ Lease Term in Months. The financing portion represents interest on the money the leasing company has tied up in the vehicle, calculated as (Capitalized Cost + Residual Value) × Money Factor. Capitalized cost is the negotiated vehicle price plus any fees, minus down payments or trade-in value. Residual value is the projected worth at lease end, typically expressed as a percentage of MSRP. The money factor is equivalent to the interest rate divided by 2400 (a 3.6% interest rate equals a 0.0015 money factor). Additional costs include sales tax, which may apply to the entire payment or just the depreciation portion depending on the state, and fees for excess mileage or wear at lease end.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between leasing and buying a vehicle?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Leasing versus buying a vehicle involves different financial structures and ownership implications. Leasing typically offers lower monthly payments (often 20-30% less) because you\'re only paying for the vehicle\'s depreciation during the lease term, not its entire value. However, there\'s no equity buildup—you return the vehicle at lease end unless you exercise a purchase option. Buying involves higher monthly payments but builds ownership equity, with no restrictions on mileage or modifications. From a financial perspective, buying generally costs less in the long run if you keep the vehicle beyond the loan term, while leasing can be more economical for those who prefer driving a newer vehicle every 2-4 years. Tax implications also differ: business owners can often deduct lease payments directly, while purchased vehicles must be depreciated over time. The optimal choice depends on your driving habits, financial situation, and whether you prioritize lower payments or long-term ownership.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is residual value and how does it affect lease payments?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Residual value represents the projected worth of a leased vehicle at the end of the lease term, typically expressed as a percentage of the original MSRP. It significantly impacts monthly payments—a higher residual value means less depreciation to finance, resulting in lower monthly payments. For example, a $30,000 vehicle with a 60% residual after 36 months has a depreciation cost of $12,000 ($30,000 - $18,000) spread over the lease term. Residual values vary by vehicle make, model, and lease length, with luxury vehicles and those with strong reliability records typically maintaining higher residuals. Residuals are set by leasing companies based on projected market values, not negotiated by consumers. However, consumers can indirectly influence this component by selecting vehicles with traditionally strong resale values. The residual also determines the purchase price if you choose to buy the vehicle at lease end, with higher residuals sometimes making this option less attractive compared to market value.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What options do I have at the end of a lease?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'At lease end, you typically have three main options: 1) Return the vehicle - after a lease-end inspection, you return the vehicle and walk away, potentially paying for any excess wear or mileage charges; 2) Purchase the leased vehicle - exercise the buyout option at the predetermined residual value, which may be higher or lower than the vehicle\'s current market value; 3) Lease a new vehicle - many lessees roll into a new lease, sometimes with loyalty incentives from the same manufacturer. Some leasing companies offer additional options: lease extensions for a few months if you need more time to decide; early lease terminations where another party assumes your lease through services like Swapalease or LeaseTrader; or early upgrade programs allowing you to exit the current lease before term end if you lease another vehicle from the same company. When deciding, compare the lease-end purchase price to current market value, consider any excess mileage or wear charges you might incur by returning, and evaluate your satisfaction with the vehicle.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How can I negotiate a better car lease deal?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'To negotiate a better car lease deal, focus on these key elements: 1) Negotiate the vehicle\'s capitalized cost (purchase price) just as you would when buying—this forms the basis for calculating depreciation; 2) Minimize upfront payments since they\'re generally not refundable if the vehicle is stolen or totaled; 3) Understand and negotiate the money factor (interest rate)—dealers often mark this up from the base rate offered by the financing company; 4) Request multiple security deposit programs if available, which can significantly reduce your money factor; 5) Ensure the residual value is based on MSRP, not on the negotiated selling price; 6) Consider factory-subsidized leases (often called lease specials) that feature artificially high residuals or low money factors; 7) Negotiate the disposition fee or request that it be waived; 8) Request a higher mileage allowance if needed, as it\'s cheaper to negotiate this upfront rather than pay overage fees later; and 9) Time your lease to coincide with manufacturer incentives, typically at model year changeovers or quarter/year-end sales goals.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Lease Calculator | Compare Auto & Equipment Lease Options',
  description: 'Calculate lease payments, compare lease vs. buy options, and analyze the total cost of leasing vehicles or equipment with our comprehensive lease calculator.',
  keywords: [
    'lease calculator',
    'car lease calculator',
    'auto lease calculator',
    'equipment lease calculator',
    'lease vs buy calculator',
    'residual value calculator',
    'money factor calculator',
    'monthly lease payment',
    'lease termination calculator',
    'lease buyout calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function LeaseSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateLeaseSchema('https://calculatorshub.store/calculators/lease')),
      }}
    />
  );
}