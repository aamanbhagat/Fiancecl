import { Metadata } from 'next';

// Define the JSON-LD schema for the rent calculator
export function generateRentSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Rent Calculator',
        'description': 'Calculate how much rent you can afford, compare renting vs. buying, and analyze different rental scenarios with our comprehensive rent calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Rent affordability calculation',
          'Rent vs. buy comparison',
          'Rental property income analysis',
          'Security deposit calculation',
          'Rent increase projection',
          'Roommate cost splitting',
          'Rental yield calculation',
          'Moving cost estimation',
          'PDF export functionality',
          'Budget allocation visualization'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/rent`,
            'description': 'Calculate how much rent you can afford and analyze rental scenarios'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Rental Analysis'
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
            'name': 'Rent Calculator',
            'item': `${baseUrl}/calculators/rent`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How much rent can I afford?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The most common guideline for rent affordability is the 30% rule, which suggests spending no more than 30% of your gross monthly income on rent. For someone earning $60,000 annually ($5,000 monthly), this means keeping rent below $1,500. However, this rule isn\'t one-size-fits-all and should be adapted based on your financial situation. In high-cost cities, many spend 40-50% on housing, while financial advisors might recommend 25% for those prioritizing savings. A more comprehensive approach involves creating a detailed budget that accounts for all expenses: Start with your after-tax income, subtract essential expenses (utilities, groceries, transportation, insurance, minimum debt payments, and savings goals), and the remainder represents what you can realistically afford for rent. Consider also your debt-to-income ratio—most financial experts recommend keeping total debt obligations (including rent) below 40-43% of gross income. Additionally, don\'t forget to budget for rental-related expenses beyond base rent, such as utilities, renters insurance, parking fees, and security deposits.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Is it cheaper to rent or buy a home?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Whether renting or buying is cheaper depends on numerous factors that vary by individual circumstances and location. Renting typically involves lower upfront costs, no maintenance expenses, greater flexibility, and freedom from market risk. Monthly rent payments may initially be lower than mortgage payments for comparable properties in many markets. Buying builds equity over time, offers tax advantages through mortgage interest deductions, provides stability and control over your living space, and can serve as an inflation hedge. The New York Times and other financial sites offer rent vs. buy calculators that analyze the breakeven point—typically the duration you need to stay in a home for buying to become financially advantageous, often 5-7 years in average markets. Key variables affecting this calculation include: purchase price, interest rates, down payment amount, expected home appreciation, rental growth rates, property taxes, maintenance costs (typically 1-4% of home value annually), opportunity cost of down payment funds, and how long you plan to stay. In expensive coastal cities with high price-to-rent ratios, renting often makes more financial sense, while in many midwestern and southern markets with lower ratios, buying may be more economical even over shorter timeframes.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What should I look for when reviewing a rental lease agreement?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'When reviewing a rental lease agreement, pay particular attention to these key elements: 1) Rent amount, due date, acceptable payment methods, late fees, and rent increase policies; 2) Lease term and renewal conditions—whether it\'s month-to-month or a fixed period; 3) Security deposit amount, conditions for full refund, and the timeline for return after move-out; 4) Early termination conditions and associated penalties or fees; 5) Maintenance responsibilities—what\'s handled by the landlord versus tenant; 6) Rules regarding modifications, decorating, and alterations to the property; 7) Pet policies, including any deposits, monthly pet rent, or restrictions on species/breeds/weights; 8) Guest policies and restrictions on overnight stays; 9) Utilities—which are included and which you\'re responsible for; 10) Parking arrangements and associated costs; 11) Entry notice requirements—how much advance notice the landlord must provide before entering; 12) Subletting and assignment rights; 13) Roommate policies and processes for adding/removing tenants; 14) Required insurance (renters insurance is highly recommended regardless); and 15) Noise restrictions and quiet hours. Don\'t hesitate to negotiate terms before signing, request clarification on ambiguous clauses, and keep a signed copy of the lease for your records.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do I calculate the rental yield on an investment property?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Rental yield measures the ongoing return on a rental property investment, expressed as a percentage. There are two main calculations: Gross rental yield = (Annual rental income ÷ Property value) × 100%. For example, a property worth $300,000 generating $24,000 in annual rent has an 8% gross yield. This quick calculation helps with initial property comparisons but doesn\'t account for expenses. Net rental yield provides a more accurate return picture by incorporating expenses: Net rental yield = [(Annual rental income - Annual expenses) ÷ Property value] × 100%. Using the same property, if expenses total $9,000 annually (including property management, insurance, taxes, maintenance, and vacancies), the net yield would be ($24,000 - $9,000) ÷ $300,000 = 5%. For greater accuracy, investors should consider the cash-on-cash return, which uses actual cash invested rather than total property value: Cash-on-cash return = (Annual cash flow ÷ Total cash invested) × 100%. If the above property was purchased with a $60,000 down payment and generates $6,000 in annual cash flow after all expenses including mortgage payments, the cash-on-cash return would be 10%. Generally, residential properties with 5-8% net yields are considered good investments in most markets.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are common hidden costs of renting that tenants should budget for?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Beyond the advertised rent, tenants should budget for several hidden costs: 1) Security deposit (typically one month\'s rent) plus potential additional deposits for pets, keys, or remote controls; 2) Application and credit check fees ranging from $25-100 per applicant; 3) Move-in fees or "admin fees" that some properties charge in addition to security deposits; 4) Utilities not included in rent—water, electricity, gas, trash, sewer, internet, and cable; 5) Renters insurance, which typically costs $15-30 monthly but is essential protection; 6) Parking fees for assigned spaces, garage access, or permits; 7) Pet rent ($25-100 monthly) and/or non-refundable pet fees; 8) Amenity fees for gym, pool, or other facility access; 9) Storage fees for additional storage space; 10) Laundry costs if in-unit washer/dryers aren\'t provided; 11) Maintenance costs for tenant responsibilities like light bulbs, air filters, or battery replacements; 12) Moving costs, including truck rental, movers, and potential overlap between leases; 13) Furniture and household essentials when establishing a new home; and 14) Cleaning or repair fees upon move-out. To avoid surprises, prospective tenants should explicitly ask landlords about all potential fees and carefully review the lease for additional charges beyond base rent before signing.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Rent Calculator | Rental Affordability & Comparison Tool',
  description: 'Calculate how much rent you can afford, compare renting vs. buying, and analyze different rental scenarios with our comprehensive rent calculator.',
  keywords: [
    'rent calculator',
    'rent affordability calculator',
    'rent vs buy calculator',
    'rental property calculator',
    'rental yield calculator',
    'roommate rent calculator',
    'apartment budget calculator',
    'rent increase calculator',
    'rental expense calculator',
    'rental income calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function RentSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateRentSchema('https://calculatorhub.space/calculators/rent')),
      }}
    />
  );
}