import { Metadata } from 'next';

// Define the JSON-LD schema for the FHA loan calculator
export function generateFHALoanSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'FHA Loan Calculator',
        'description': 'Calculate FHA loan amounts, monthly payments, mortgage insurance premiums, and eligibility based on your financial situation and local loan limits.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'FHA loan payment calculation',
          'Upfront and annual MIP estimation',
          'FHA loan limit checking',
          'Down payment minimums',
          'Debt-to-income ratio analysis',
          'Affordability assessment',
          'Amortization schedule generation',
          'FHA vs conventional loan comparison',
          'PDF export functionality',
          'Loan qualification estimation'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/fha-loan`,
            'description': 'Calculate FHA loan amounts and monthly payments'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'FHA Loan'
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
            'name': 'FHA Loan Calculator',
            'item': `${baseUrl}/calculators/fha-loan`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is an FHA loan and how does it work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'An FHA loan is a mortgage insured by the Federal Housing Administration, designed to help borrowers with lower credit scores and smaller down payments become homeowners. The FHA doesn\'t directly lend money; instead, it insures loans made by FHA-approved lenders, reducing their risk if borrowers default. This insurance allows lenders to offer more favorable terms, including lower down payments (as little as 3.5% with a 580+ credit score), lower closing costs, and easier credit qualifying. In exchange for this flexibility, borrowers pay mortgage insurance premiums (MIP)—both an upfront premium (1.75% of the loan amount) and annual premiums (0.55-1.05% depending on loan characteristics). FHA loans are particularly popular among first-time homebuyers, typically accounting for about 25% of all single-family home purchase loans.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are the FHA loan requirements and eligibility criteria?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'FHA loan eligibility includes several key requirements: 1) Credit score minimums—580+ for a 3.5% down payment or 500-579 for a 10% down payment; 2) Debt-to-income ratio typically not exceeding 43%, though exceptions to 50% exist for compensating factors; 3) Steady employment history, generally two years or more; 4) The home must be your primary residence, not an investment property; 5) The property must meet FHA minimum property standards for safety and livability; 6) Your loan amount must fall within FHA lending limits for your area (ranging from $472,030 to $1,089,300 for single-family homes in 2023); 7) You must have a valid Social Security number and lawful residency in the US; and 8) You cannot be delinquent on federal debt or have had an FHA foreclosure in the last three years. Additionally, you must pay both upfront and annual mortgage insurance premiums.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do FHA mortgage insurance premiums work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'FHA mortgage insurance includes two components: 1) Upfront Mortgage Insurance Premium (UFMIP) - 1.75% of the loan amount, typically financed into the loan. On a $250,000 loan, this equals $4,375; 2) Annual Mortgage Insurance Premium (MIP) - ranges from 0.55% to 1.05% of the loan amount depending on the loan term, loan amount, and loan-to-value ratio. For most borrowers with less than 10% down on a 30-year loan, the rate is 0.55% annually ($1,375/year or about $115/month on a $250,000 loan), paid monthly. Unlike conventional PMI, FHA MIP cannot be canceled on most loans originated after June 2013 if the initial LTV was above 90%—it remains for the life of the loan. The only way to remove it is typically through refinancing into a conventional loan once you have 20% equity. This long-term cost is an important consideration when comparing FHA to conventional loans.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between FHA loans and conventional loans?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Key differences between FHA and conventional loans include: 1) Credit requirements - FHA accepts scores as low as 580 (or even 500 with 10% down), while conventional typically requires 620+; 2) Down payment - FHA requires as little as 3.5%, similar to some conventional options (3-5%); 3) Mortgage insurance - FHA requires both upfront (1.75%) and annual MIP (0.55-1.05%) for all borrowers, usually for the life of the loan, while conventional loans only require PMI until 20% equity is reached; 4) Debt-to-income ratios - FHA may allow higher DTI ratios (up to 50% with compensating factors) than conventional loans; 5) Property standards - FHA has stricter property condition requirements; 6) Loan limits - FHA limits are typically lower than conventional loan limits; and 7) Assumability - FHA loans can be assumed by qualified buyers, unlike most conventional loans. Generally, borrowers with good credit and larger down payments often find conventional loans more cost-effective long-term, while FHA better serves those with credit challenges or limited savings.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Can I get an FHA loan after bankruptcy or foreclosure?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes, FHA loans offer relatively accommodating terms for borrowers with past bankruptcy or foreclosure. For bankruptcy, the waiting periods are: 1) Chapter 7 bankruptcy - minimum 2-year waiting period from discharge date (not filing date), compared to 4 years for conventional loans; 2) Chapter 13 bankruptcy - possible approval after 12 months of on-time payments in the payment plan with court approval. For foreclosures, short sales, or deed-in-lieu of foreclosure, FHA typically requires a 3-year waiting period from completion date, versus 7 years for conventional loans with standard terms. However, with FHA\'s "Back to Work" program, borrowers who experienced an economic event resulting in income loss of 20%+ for at least 6 months may qualify after just 12 months if they\'ve reestablished credit and completed housing counseling. These reduced waiting periods make FHA loans an important pathway back to homeownership after financial hardship.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'FHA Loan Calculator | Estimate FHA Mortgage Payments & Insurance',
  description: 'Calculate FHA loan payments, mortgage insurance premiums, and eligibility with our free calculator designed for first-time homebuyers and those with limited down payments.',
  keywords: [
    'FHA loan calculator',
    'FHA mortgage calculator',
    'FHA MIP calculator',
    'FHA payment calculator',
    'FHA loan eligibility',
    'FHA loan limits',
    'FHA vs conventional calculator',
    'FHA down payment calculator',
    'first time homebuyer calculator',
    'FHA loan qualification tool'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function FHALoanSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateFHALoanSchema('https://calculatorshub.store/calculators/fha-loan')),
      }}
    />
  );
}