import { Metadata } from 'next';

// Define the JSON-LD schema for the rent vs. buy calculator
export function generateRentVsBuySchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Rent vs. Buy Calculator',
        'description': 'Compare the financial implications of renting versus buying a home with our comprehensive calculator that analyzes costs, tax benefits, and long-term financial outcomes.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Breakeven point calculation',
          'Total cost comparison',
          'Opportunity cost analysis',
          'Tax benefit calculation',
          'Home appreciation modeling',
          'Inflation impact estimation',
          'Interest rate sensitivity analysis',
          'Investment return comparison',
          'PDF export functionality',
          'Multiple scenario modeling'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/rent-vs-buy`,
            'description': 'Compare the financial implications of renting versus buying a home'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Rent vs. Buy Analysis'
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
            'name': 'Rent vs. Buy Calculator',
            'item': `${baseUrl}/calculators/rent-vs-buy`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What factors should I consider when deciding whether to rent or buy?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The rent vs. buy decision involves numerous financial and lifestyle factors. Financial considerations include: 1) Upfront costs - buying requires a down payment (typically 3-20% of purchase price), closing costs (2-5%), while renting usually needs only security deposit and first/last month\'s rent; 2) Monthly costs - compare mortgage (principal, interest, taxes, insurance) to rent, factoring in maintenance (1-4% of home value annually) and HOA fees for homeowners; 3) Tax implications - homeowners can deduct mortgage interest and property taxes (subject to limits), while renters typically have no housing tax benefits; 4) Opportunity cost - down payment funds could otherwise be invested, potentially generating returns; 5) Home appreciation - historical annual appreciation averages 3-5%, but varies significantly by location and timeframe; 6) Time horizon - generally, longer planned stays favor buying. Lifestyle factors include: 1) Flexibility - renting offers easier relocation; 2) Control over living space - homeowners have greater freedom for modifications; 3) Stability - homeowners are protected from landlord decisions and rent increases; 4) Maintenance responsibility - homeowners handle all repairs while renters typically have minimal maintenance obligations. The optimal choice depends on your personal financial situation, local housing market, and how you weigh these various factors.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do I determine the breakeven point between renting and buying?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The breakeven point between renting and buying represents how long you need to own a home before buying becomes financially advantageous compared to renting. Calculating this requires comparing the total costs of both options over time. For renting, costs include monthly rent (accounting for annual increases), renters insurance, and the opportunity cost of not building equity. These costs are offset by potential investment returns from money that would otherwise go toward a down payment and other homeownership costs. For buying, costs include the down payment, closing costs, monthly mortgage payments, property taxes, homeowners insurance, maintenance, and any HOA fees. These costs are offset by equity buildup (principal payments), tax benefits from interest and property tax deductions, and home appreciation. The breakeven calculation models both scenarios year by year, determining when the cumulative cost of renting exceeds that of buying. In typical markets, this breakeven point often occurs between 3-7 years, though it can be significantly longer in expensive coastal cities with high price-to-rent ratios. Several good rent vs. buy calculators are available online that allow you to input your specific variables, as the breakeven point is highly dependent on local market conditions, interest rates, tax brackets, investment return assumptions, and rent growth projections.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does home appreciation affect the rent vs. buy calculation?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Home appreciation significantly impacts the rent vs. buy calculation as it represents a major potential benefit of homeownership that has no rental equivalent. Historically, U.S. home prices have appreciated at an average annual rate of approximately 3-4% nationally, though with substantial regional variation. This appreciation builds wealth in two ways: First, it increases your home equity independent of mortgage payments. For example, a $300,000 home appreciating at 3% annually gains $9,000 in value the first year. Second, appreciation creates leverage benefits since the gain applies to the entire property value, not just your down payment. With a 20% down payment ($60,000), that $9,000 appreciation represents a 15% return on invested capital. However, appreciation projections should be conservative in rent vs. buy analyses, as historical rates aren\'t guaranteed and some markets have experienced extended periods of flat or declining values. Other considerations include: 1) Transaction costs (5-8% when selling) can offset appreciation gains for short-term ownership; 2) Emotional biases often lead homeowners to overestimate future appreciation; 3) Local factors like job growth, population trends, and new construction significantly impact appreciation; and 4) Nationwide appreciation trends may not reflect your specific neighborhood. For accurate financial planning, modeling multiple appreciation scenarios (conservative, moderate, and optimistic) provides a more complete picture of potential outcomes.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What tax benefits do homeowners receive that renters don\'t?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Homeowners receive several tax advantages unavailable to renters, though their impact was reduced by the Tax Cuts and Jobs Act of 2017. The primary tax benefits include: 1) Mortgage interest deduction - homeowners can deduct interest paid on up to $750,000 of mortgage debt (for mortgages originated after December 15, 2017; $1 million for older mortgages); 2) Property tax deduction - state and local property taxes are deductible up to $10,000 combined with state income taxes; 3) Capital gains exclusion - married couples can exclude up to $500,000 in capital gains ($250,000 for singles) on the sale of a primary residence owned and occupied for at least two of the previous five years; 4) Points deduction - loan origination fees or discount points paid to secure a mortgage are potentially deductible; and 5) Home office deduction - available to self-employed individuals using space exclusively for business. However, these deductions only benefit taxpayers who itemize rather than taking the standard deduction, which nearly doubled under the 2017 tax law ($25,900 for married filing jointly in 2022). This change means fewer homeowners itemize and therefore don\'t realize these tax benefits. For example, a couple with a $300,000 mortgage at 4% pays approximately $12,000 in interest the first year, but if that\'s their only major deduction, they\'re better off taking the $25,900 standard deduction, effectively receiving no tax benefit from homeownership.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does the opportunity cost of a down payment affect the rent vs. buy decision?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Opportunity cost—what you give up by using money for a down payment rather than investing it—significantly impacts the rent vs. buy equation but is often overlooked. When you allocate funds to a down payment, you forfeit potential investment returns those funds could have generated elsewhere. For example, a $60,000 down payment (20% on a $300,000 home) invested in a diversified portfolio with a 7% average annual return would grow to approximately $118,000 after 10 years. This opportunity cost partially offsets the equity and appreciation benefits of homeownership. Higher potential investment returns increase the relative attractiveness of renting, while lower expected returns favor buying. Several factors affect how opportunity cost should be calculated in your personal situation: 1) Investment risk tolerance and expected returns based on your allocation between stocks, bonds, and other assets; 2) Tax treatment of investment gains versus home appreciation; 3) The forced-savings effect of mortgage payments that many people wouldn\'t otherwise achieve through disciplined investing; 4) Your actual alternative—some renters spend rather than invest the equivalent of a down payment; 5) Psychological value of homeownership versus pure financial optimization. Most comprehensive rent vs. buy calculators include an opportunity cost variable, usually labeled as "investment rate of return" or "discount rate," that significantly influences the breakeven timeline—higher assumed rates typically extend the period needed for buying to outperform renting.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Rent vs. Buy Calculator | Compare Renting and Home Buying',
  description: 'Compare the financial implications of renting versus buying a home with our comprehensive calculator that analyzes costs, tax benefits, and long-term financial outcomes.',
  keywords: [
    'rent vs buy calculator',
    'home buying comparison tool',
    'renting or buying calculator',
    'home ownership calculator',
    'breakeven point calculator',
    'property purchase analysis',
    'housing cost comparison',
    'mortgage vs rent calculator',
    'real estate investment calculator',
    'home affordability comparison'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function RentVsBuySchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateRentVsBuySchema('https://calculatorshub.store/calculators/rent-vs-buy')),
      }}
    />
  );
}