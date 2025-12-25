import { Metadata } from 'next';

// Define the JSON-LD schema for the auto loan calculator
export function generateAutoLoanSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Auto Loan Calculator',
        'description': 'Calculate your monthly car payments and understand the total cost of your auto loan with our comprehensive calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Monthly payment calculation',
          'Total interest and cost analysis',
          'Amortization schedule visualization',
          'Loan term comparison',
          'Down payment and trade-in modeling',
          'Tax and fee inclusion',
          'Early payoff calculator',
          'Interactive charts and graphs',
          'PDF export functionality',
          'Multiple term comparison'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/auto-loan`,
            'description': 'Calculate your monthly car payments and total auto loan cost'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Auto Loan'
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
            'name': 'Auto Loan Calculator',
            'item': `${baseUrl}/calculators/auto-loan`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How is a car loan payment calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'A car loan payment is calculated using the formula: Payment = Loan Amount × (Monthly Interest Rate × (1 + Monthly Interest Rate)^Number of Payments) ÷ ((1 + Monthly Interest Rate)^Number of Payments - 1). This formula accounts for the loan amount, interest rate, and term length to determine your fixed monthly payment. Additional factors like taxes, fees, trade-in value, and down payment affect the initial loan amount.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is a good interest rate for an auto loan?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'A good interest rate for an auto loan depends on your credit score, loan term, and whether you\'re buying new or used. For new vehicles, excellent credit scores (720+) might qualify for rates between 3-4%, good credit (660-719) around 4-6%, and average credit (600-659) around 6-9%. Used car rates are typically 1-2% higher. Rates increase for longer terms, with 60-month loans being standard. Shop around and get pre-approved to ensure you\'re getting competitive rates.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How much car can I afford based on my income?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Financial experts recommend following the 20/4/10 rule: make a 20% down payment, choose a loan term no longer than 4 years, and keep all auto-related expenses (payment, insurance, gas, maintenance) under 10% of your gross monthly income. For example, if you earn $5,000 monthly, keep total car expenses under $500, with your loan payment being only part of that amount. This guideline helps ensure your car doesn\'t become a financial burden and protects against depreciation.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does the loan term affect my auto loan?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Loan term significantly impacts both monthly payments and total cost. Shorter terms (36-48 months) mean higher monthly payments but substantially lower total interest costs and less risk of negative equity. Longer terms (72-84 months) reduce monthly payments but dramatically increase total interest paid and keep you in debt longer. For example, on a $30,000 loan at 5% APR, a 60-month term costs $3,060 in interest versus $4,356 for 84 months—a 42% increase—while only reducing the monthly payment from $551 to $409.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Should I make a larger down payment on my car?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'A larger down payment (20%+ of vehicle price) offers several advantages: it reduces your loan amount and monthly payments, may qualify you for better interest rates, provides immediate equity in the vehicle, and protects against depreciation. New vehicles typically lose 20-30% of value in the first year, so a significant down payment helps prevent owing more than the car is worth (negative equity). This is particularly important if you might need to sell or trade in the vehicle before paying off the loan.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Auto Loan Calculator | Calculate Car Payments & Total Cost',
  description: 'Calculate your monthly car payments, analyze total loan costs, and compare different financing options with our comprehensive auto loan calculator.',
  keywords: [
    'auto loan calculator',
    'car payment calculator',
    'car loan calculator',
    'vehicle financing calculator',
    'loan amortization calculator',
    'car loan interest calculator',
    'loan term comparison',
    'down payment calculator',
    'trade-in value calculator',
    'car finance calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function AutoLoanSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateAutoLoanSchema('https://calculatorshub.store/calculators/auto-loan')),
      }}
    />
  );
}