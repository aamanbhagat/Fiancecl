import { Metadata } from 'next';

// Define the JSON-LD schema for the house affordability calculator
export function generateHouseAffordabilitySchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'House Affordability Calculator',
        'description': 'Calculate how much house you can afford based on income, expenses, debt, credit score, and local market conditions.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Maximum affordable purchase price',
          'Monthly payment breakdown',
          'Debt-to-income ratio analysis',
          'Down payment impact calculation',
          'Mortgage pre-qualification estimate',
          'Property tax and insurance inclusion',
          'Interest rate sensitivity analysis',
          'Different loan type comparison',
          'PDF export functionality',
          'Location-based affordability adjustment'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/house-affordability`,
            'description': 'Calculate how much house you can afford'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Home Affordability Analysis'
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
            'name': 'House Affordability Calculator',
            'item': `${baseUrl}/calculators/house-affordability`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How is house affordability calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'House affordability is typically calculated using the debt-to-income (DTI) ratio, which compares your monthly debt payments to your gross monthly income. Lenders generally use two calculations: Front-end DTI focuses solely on housing costs (principal, interest, taxes, insurance, and HOA fees) and should ideally not exceed 28% of gross monthly income. Back-end DTI includes all debt payments (housing plus car loans, student loans, credit cards, etc.) and should typically stay below 36-43%, though some loan programs allow up to 50%. For example, with a $6,000 monthly income and $1,000 in existing debt payments, you could afford approximately $1,160-$1,680 in monthly housing costs, depending on the lender\'s DTI threshold. This translates to roughly a $250,000-$350,000 home price, varying based on interest rates, down payment, property taxes, and insurance costs.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What factors influence how much house I can afford?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Multiple factors influence your house affordability: 1) Income - higher and more stable income increases borrowing capacity; 2) Existing debt - lower debt obligations allow more budget for housing; 3) Credit score - scores above 740 typically secure the best rates, while below 620 makes approval difficult; 4) Down payment - larger down payments decrease loan amounts and may eliminate PMI; 5) Interest rates - a 1% rate increase reduces buying power by approximately 10%; 6) Property taxes and insurance - vary significantly by location and affect monthly payments; 7) Loan term - longer terms (30-year vs. 15-year) reduce monthly payments but increase total interest; 8) Loan type - conventional, FHA, VA, and USDA loans have different requirements and limits; 9) Employment history - lenders typically prefer 2+ years of stable employment; and 10) Debt-to-income ratio - lower ratios qualify for better loan terms and higher affordability.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is the recommended debt-to-income ratio for a mortgage?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The recommended debt-to-income (DTI) ratios for mortgages follow the traditional 28/36 rule—housing costs should not exceed 28% of gross monthly income (front-end DTI), and total debt payments including housing should not exceed 36% (back-end DTI). However, modern lending standards have evolved: Conventional loans typically require a back-end DTI under 43%, FHA loans may allow up to 43-45% with compensating factors, VA loans might permit ratios up to 41%, and some qualified mortgages extend to 50% for strongly qualified borrowers. While lenders may approve higher ratios, financial advisors generally recommend staying below 30% for housing costs to maintain financial flexibility. Research shows that homeowners with DTI ratios exceeding 40% face significantly higher rates of financial stress and mortgage delinquency, suggesting conservative targets are prudent for long-term financial health.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does my down payment affect home affordability?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Your down payment affects home affordability in several ways: 1) Purchase power - a larger down payment directly increases the home price you can afford (e.g., with $60,000 saved, you could afford a $300,000 home with 20% down versus a $240,000 home with 25% down); 2) Monthly payments - more down means lower monthly payments (every additional 5% down on a $300,000 home saves approximately $70-100 monthly); 3) Mortgage insurance - putting 20%+ down typically eliminates PMI on conventional loans, saving 0.5-1.5% of the loan amount annually; 4) Interest rates - larger down payments may qualify you for better rates, particularly with higher loan amounts; 5) Loan options - different down payment amounts qualify for different loan programs; and 6) Loan-to-value ratio - impacts refinancing options and equity position. While a 20% down payment is traditionally recommended, the optimal amount depends on your financial situation, market conditions, and opportunity costs.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How can I increase my home affordability?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'To increase your home affordability: 1) Reduce existing debt - paying down credit cards, auto loans, and student loans improves your debt-to-income ratio; 2) Improve your credit score - raising your score by 20-40 points could reduce your interest rate by 0.25-0.5%, increasing buying power by 5-10%; 3) Save for a larger down payment - decreases your loan amount and potentially eliminates PMI; 4) Increase your income - through promotions, side gigs, or using a co-borrower; 5) Extend your loan term - consider a 30-year mortgage instead of a 15-year; 6) Explore different loan programs - FHA, VA, or USDA loans often have lower down payment requirements and more flexible qualifying criteria; 7) Consider less expensive locations - suburban or emerging neighborhoods often offer better value; 8) Look into first-time homebuyer programs - many offer down payment assistance or favorable terms; and 9) Negotiate seller concessions - ask for closing cost assistance to preserve your down payment funds.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'House Affordability Calculator | How Much Home Can You Afford?',
  description: 'Calculate how much house you can afford based on your income, expenses, debt, and down payment with our comprehensive affordability calculator.',
  keywords: [
    'house affordability calculator',
    'home affordability calculator',
    'mortgage affordability calculator',
    'how much house can I afford',
    'home buying calculator',
    'mortgage qualification calculator',
    'debt-to-income ratio calculator',
    'down payment calculator',
    'home budget calculator',
    'house payment calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function HouseAffordabilitySchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateHouseAffordabilitySchema('https://calculatorhub.space/calculators/house-affordability')),
      }}
    />
  );
}