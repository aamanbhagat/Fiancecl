import { Metadata } from 'next';

// Define the JSON-LD schema for the down payment calculator
export function generateDownPaymentSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Down Payment Calculator',
        'description': 'Calculate optimal down payment amounts for homes or vehicles, along with resulting loan terms, monthly payments, and long-term interest savings.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Down payment percentage calculation',
          'Monthly payment estimation',
          'Interest cost comparison',
          'PMI threshold analysis',
          'Different loan scenario comparison',
          'Minimum down payment requirements',
          'LTV ratio visualization',
          'Loan affordability assessment',
          'PDF export functionality',
          'Saving goal timeline planning'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/down-payment`,
            'description': 'Calculate optimal down payment amounts and monthly payments'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Down Payment Analysis'
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
            'name': 'Down Payment Calculator',
            'item': `${baseUrl}/calculators/down-payment`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is a down payment and why is it important?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'A down payment is an upfront payment made when purchasing a high-value asset like a home or vehicle, typically expressed as a percentage of the purchase price. It\'s important because it: 1) Reduces the loan amount, leading to lower monthly payments and less interest paid over the loan term; 2) Demonstrates financial commitment to lenders, potentially qualifying you for better interest rates; 3) Builds immediate equity in the asset; 4) Helps avoid private mortgage insurance (PMI) on home loans when 20% or more is put down; and 5) Provides a financial buffer against market value fluctuations, reducing the risk of becoming "underwater" on the loan if property values decline.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How much should I put down on a home purchase?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The ideal down payment amount for a home depends on your financial situation and goals. While 20% is traditionally recommended (to avoid PMI and secure better rates), many buyers put down less. Minimum requirements vary by loan type: conventional loans typically require 3-5%, FHA loans 3.5%, VA loans 0%, and USDA loans 0%. Consider these factors when deciding: 1) Monthly payment affordability—more down means lower payments; 2) Available cash reserves—maintain emergency funds after down payment; 3) Local market competition—stronger offers often have larger down payments; 4) How long you plan to stay—larger down payments make more sense for longer-term homeownership; and 5) Investment alternatives—whether your money might earn better returns elsewhere.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does the down payment affect my loan terms and total cost?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Your down payment significantly impacts loan terms and total cost. For instance, on a $300,000 home with a 30-year loan at 5.5% interest, increasing your down payment from 5% ($15,000) to 20% ($60,000) would: 1) Reduce your loan amount by $45,000; 2) Lower monthly payments from $1,622 to $1,363 (saving $259 monthly); 3) Save approximately $93,240 in interest over the loan term; 4) Eliminate PMI costs of about $1,800-$3,000 annually; and 5) Potentially qualify you for a better interest rate (0.25-0.5% lower), further reducing costs. Additionally, a larger down payment increases your initial equity stake, reducing risk for both you and the lender and potentially making your offer more attractive in competitive markets.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are effective strategies for saving for a down payment?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Effective strategies for building a down payment include: 1) Automate savings—set up automatic transfers to a dedicated high-yield savings account; 2) Reduce major expenses—consider downsizing current housing or transportation costs temporarily; 3) Increase income—pursue side work, overtime, or negotiate a raise; 4) Use windfalls wisely—allocate tax refunds, bonuses, and gifts toward your down payment fund; 5) Explore assistance programs—research first-time homebuyer programs, employer assistance, and government grants; 6) Cut discretionary spending—track expenses to identify potential savings areas; 7) Consider temporary retirement contribution adjustments—possibly reducing (not eliminating) 401(k) contributions above employer match; and 8) Set clear, time-bound goals—break the total amount into monthly targets with visual progress tracking to maintain motivation.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do down payments differ between home and vehicle purchases?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Down payments for homes and vehicles serve similar purposes but differ in several key aspects: 1) Amount expectations—home down payments traditionally range from 3-20% of purchase price, while vehicle down payments typically range from 0-20%; 2) Impact on approval—mortgage lenders place greater emphasis on down payment size than auto lenders; 3) Depreciation factors—vehicles depreciate rapidly (20-30% in the first year) making larger down payments important to avoid being "underwater," while homes typically appreciate long-term; 4) Insurance requirements—home loans under 20% down require PMI, while auto loans don\'t have equivalent insurance regardless of down payment; 5) Loan terms—home loans commonly span 15-30 years, while auto loans typically range from 3-7 years, affecting the total interest impact of your down payment decision; and 6) Tax implications—mortgage interest is potentially tax-deductible while auto loan interest typically is not.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Down Payment Calculator | Calculate Optimal Home & Car Down Payments',
  description: 'Calculate optimal down payment amounts for homes or vehicles, monthly payments, and the impact on your loan terms with our free calculator.',
  keywords: [
    'down payment calculator',
    'mortgage down payment',
    'car down payment',
    'home down payment calculator',
    'down payment savings calculator',
    'PMI calculator',
    'loan-to-value calculator',
    'house down payment',
    'minimum down payment',
    'down payment estimator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function DownPaymentSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateDownPaymentSchema('https://calculatorhub.space/calculators/down-payment')),
      }}
    />
  );
}