import { Metadata } from 'next';

// Define the JSON-LD schema for the APR calculator
export function generateAPRSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'APR Calculator',
        'description': 'Calculate the true cost of borrowing with our Annual Percentage Rate (APR) calculator, accounting for interest rates and all associated fees.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'APR calculation',
          'Total cost breakdown',
          'Fee impact analysis',
          'Monthly payment calculation',
          'Cost comparison visualizations',
          'Interest vs. fees comparison',
          'PDF export functionality',
          'Interactive charts'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/apr`,
            'description': 'Calculate the Annual Percentage Rate (APR) for your loan'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Loan APR'
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
            'name': 'APR Calculator',
            'item': `${baseUrl}/calculators/apr`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is APR?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Annual Percentage Rate (APR) represents the true cost of borrowing money, expressed as a yearly percentage. Unlike the nominal interest rate, APR includes both the interest rate and all mandatory fees and costs associated with the loan. This makes APR a more comprehensive and accurate measure for comparing loan offers from different lenders.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How is APR different from the interest rate?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The interest rate is simply the percentage of the loan amount that a lender charges you to borrow money. APR, however, includes both the interest rate and additional costs such as origination fees, closing costs, mortgage insurance, and other charges. For example, a loan might have a 4% interest rate but a 4.5% APR once all fees are factored in. This makes APR a more complete representation of what you\'ll actually pay for the loan.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What fees are typically included in APR calculations?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The fees commonly included in APR calculations are: 1) Origination fees - charged for processing a new loan; 2) Application fees - for submitting a loan application; 3) Underwriting fees - for evaluating loan applications; 4) Private mortgage insurance (PMI); 5) Discount points - fees paid to reduce the interest rate; 6) Closing costs; and 7) Various service charges. However, some costs like property appraisal fees, title insurance, and credit report fees may or may not be included depending on the lender and loan type.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Why is APR important when comparing loans?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'APR is crucial when comparing loans because it standardizes the total cost of borrowing across different offers. Two loans might have the same interest rate, but vastly different APRs due to varying fee structures. For example, if Lender A offers a 5% interest rate with $3,000 in fees while Lender B offers 5.25% with $500 in fees, the APR would help determine which loan is truly less expensive over time. The Federal Truth in Lending Act requires lenders to disclose APR precisely to help consumers make informed comparisons.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Can the APR change over the life of a loan?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes, APR can change during the life of a loan, particularly with adjustable-rate mortgages (ARMs) or credit cards. With ARMs, the interest rate can adjust periodically based on market indices, directly affecting the APR. For credit cards, the APR can change due to fluctuations in the prime rate, promotional period expirations, or if you miss payments. Fixed-rate mortgages and loans typically maintain the same APR throughout their term unless you refinance or experience a major change in loan terms.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'APR Calculator | Calculate the True Cost of Borrowing',
  description: 'Use our free APR calculator to determine the true cost of your loan by including all fees and charges beyond the basic interest rate.',
  keywords: [
    'APR calculator',
    'annual percentage rate',
    'loan fee calculator',
    'effective interest rate',
    'true cost of borrowing',
    'loan comparison tool',
    'mortgage APR',
    'credit card APR',
    'loan cost calculator',
    'interest rate vs APR'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function APRSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateAPRSchema('https://calculatorhub.space/calculators/apr')),
      }}
    />
  );
}