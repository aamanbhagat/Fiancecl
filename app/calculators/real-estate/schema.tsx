import { Metadata } from 'next';

// Define the JSON-LD schema for the real estate calculator
export function generateRealEstateSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Real Estate Investment Calculator',
        'description': 'Analyze real estate investments with calculations for ROI, cap rate, cash flow, mortgage costs, and property appreciation with our comprehensive real estate calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Cash-on-cash return calculation',
          'Cap rate analysis',
          'Cash flow projection',
          'Mortgage payment calculation',
          'Property appreciation modeling',
          'Operating expense ratio analysis',
          'Tax benefit estimation',
          'Comparative investment analysis',
          'PDF export functionality',
          'Multiple property scenario modeling'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/real-estate`,
            'description': 'Analyze real estate investments with calculations for ROI, cap rate, and cash flow'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Real Estate Investment Analysis'
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
            'name': 'Real Estate Calculator',
            'item': `${baseUrl}/calculators/real-estate`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is cap rate and how is it calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Capitalization rate (cap rate) is a fundamental real estate metric that measures a property\'s potential return independent of financing arrangements. It\'s calculated by dividing the net operating income (NOI) by the property\'s current market value or purchase price: Cap Rate = NOI ÷ Property Value. For example, a property generating $50,000 in annual NOI with a market value of $800,000 has a cap rate of 6.25%. NOI represents all revenue from the property minus all reasonably necessary operating expenses, excluding mortgage payments and income taxes. Higher cap rates generally indicate higher potential returns but also suggest higher risk, while lower cap rates typically indicate lower risk but reduced income potential. Cap rates vary significantly across markets, property types, and conditions. They\'re most useful for comparing similar properties within the same market or tracking changes in property values over time when NOI remains constant. While cap rate is an essential metric, it shouldn\'t be used in isolation as it ignores financing costs, tax implications, and potential appreciation.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between cash-on-cash return and total ROI in real estate?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Cash-on-cash return and total ROI (Return on Investment) are distinct metrics that measure real estate investment performance from different perspectives. Cash-on-cash return focuses on annual cash flow relative to the actual cash invested, calculated as: Annual Pre-Tax Cash Flow ÷ Total Cash Invested. For example, if you invested $100,000 as a down payment and closing costs on a property that generates $10,000 in annual cash flow after all expenses and mortgage payments, your cash-on-cash return is 10%. This metric helps investors understand their immediate return on out-of-pocket expenses. Total ROI provides a more comprehensive view by including all returns from an investment (cash flow, appreciation, loan paydown, and tax benefits) over the entire holding period. It\'s calculated as: (Total Gain from Investment ÷ Total Cash Invested) × 100%. If you sell the above property after 5 years for a $75,000 profit, received $50,000 in cash flow, and paid down $30,000 in principal, your total ROI would be ($75,000 + $50,000 + $30,000) ÷ $100,000 = 155%. Cash-on-cash return is particularly valuable for comparing cash flow properties, while total ROI better represents long-term wealth building.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are the key metrics to evaluate when analyzing real estate investments?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'When analyzing real estate investments, investors should consider multiple metrics for a comprehensive evaluation: 1) Cash-on-cash return - measures annual pre-tax cash flow relative to cash invested, with 8-12% generally considered good for rental properties; 2) Cap rate - indicates property performance independent of financing, typically ranging from 4-10% depending on property type and location; 3) Net Operating Income (NOI) - total revenue minus operating expenses before mortgage and taxes; 4) Gross Rent Multiplier (GRM) - property price divided by annual gross rental income, useful for quick comparisons; 5) Operating Expense Ratio (OER) - percentage of gross income used for operating expenses, typically 35-80% depending on property type; 6) Debt Service Coverage Ratio (DSCR) - NOI divided by annual mortgage payments, with lenders typically requiring at least 1.25; 7) Internal Rate of Return (IRR) - annualized total return accounting for time value of money; 8) Equity Multiple - total cash distributions divided by total equity invested; 9) Price per Square Foot - for comparison with similar properties; and 10) 1% Rule - monthly rent should be at least 1% of purchase price (though this varies by market). The importance of each metric varies based on investment strategy, with cash flow investors focusing more on immediate returns and appreciation investors more concerned with long-term value growth.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do you calculate cash flow for a rental property?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Calculating cash flow for a rental property requires accounting for all income and expenses in a systematic way. Start with the Gross Rental Income - the total rent collected if fully occupied. Adjust for Vacancy and Credit Losses (typically 5-10% of gross rent) to get Effective Gross Income. Then subtract all Operating Expenses: property taxes, insurance, property management fees (typically 8-12% of collected rent), utilities, maintenance (budget 1-2% of property value annually), repairs, landscaping, HOA fees, and reserves for capital expenditures (typically 5-10% of rental income for future major replacements). This calculation yields Net Operating Income (NOI). Finally, subtract Debt Service (mortgage principal and interest) to arrive at Cash Flow. For example: $2,000 monthly rent ($24,000 annually) minus 8% vacancy ($1,920) equals $22,080 effective gross income. Subtracting $9,000 in total operating expenses yields $13,080 NOI. After subtracting the annual mortgage payment of $10,800, the property generates $2,280 annual cash flow or $190 monthly. Positive cash flow is essential for sustainable rental property investing, though some investors temporarily accept negative cash flow in appreciating markets.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does real estate investing compare to stocks and other investment vehicles?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Real estate and stocks offer distinct investment characteristics with different advantages. Real estate provides: 1) Leverage - using mortgage financing to control valuable assets with relatively little cash; 2) Cash flow - potential for regular income streams; 3) Tax advantages - including depreciation deductions, mortgage interest deductions, and 1031 exchanges to defer capital gains; 4) Inflation hedge - property values and rents tend to increase with inflation; and 5) Control - direct influence over property improvements and management. However, real estate also involves higher transaction costs (5-10%), requires significant capital, demands active management, lacks liquidity, and concentrates risk in specific locations. Stocks, by contrast, offer exceptional liquidity, require minimal initial investment, provide passive ownership, enable simple diversification, and historically deliver strong long-term returns (about 10% annually for S&P 500). Their disadvantages include higher volatility, limited tax advantages, no leverage (without margin), and zero control over company operations. A balanced investment portfolio often includes both asset classes, with real estate offering stability and income while stocks provide growth and liquidity. The optimal allocation depends on individual goals, risk tolerance, time horizon, and expertise.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Real Estate Calculator | Investment Property Analysis Tool',
  description: 'Analyze real estate investments with calculations for ROI, cap rate, cash flow, mortgage costs, and property appreciation with our comprehensive real estate calculator.',
  keywords: [
    'real estate calculator',
    'investment property calculator',
    'rental property ROI calculator',
    'cap rate calculator',
    'real estate cash flow calculator',
    'property investment analysis',
    'real estate ROI calculator',
    'rental property cash flow',
    'real estate investment tool',
    'property valuation calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function RealEstateSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateRealEstateSchema('https://calculatorshub.store/calculators/real-estate')),
      }}
    />
  );
}