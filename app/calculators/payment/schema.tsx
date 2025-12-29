import { Metadata } from 'next';

// Define the JSON-LD schema for the payment calculator
export function generatePaymentSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Payment Calculator',
        'description': 'Calculate loan, mortgage, or installment payments with different payment frequencies, interest rates, and terms using our comprehensive payment calculator.',
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
          'Total interest cost calculation',
          'Amortization schedule generation',
          'Principal vs interest breakdown',
          'Different payment frequency options',
          'Early payoff analysis',
          'Extra payment modeling',
          'Payment comparison visualization',
          'PDF export functionality',
          'Multiple loan scenario comparison'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/payment`,
            'description': 'Calculate loan, mortgage, or installment payments'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Payment Analysis'
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
            'name': 'Payment Calculator',
            'item': `${baseUrl}/calculators/payment`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How are loan payments calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Loan payments for amortizing loans (like typical mortgages or car loans) are calculated using the formula: Payment = P × (r × (1 + r)^n) ÷ ((1 + r)^n - 1), where P is the principal (loan amount), r is the periodic interest rate (annual rate divided by payment periods per year), and n is the total number of payment periods. For example, on a $20,000 car loan with a 4.5% annual interest rate and 60-month term, the monthly payment would be $372.86. The formula ensures equal payments throughout the loan term while gradually shifting the payment composition from mostly interest initially to mostly principal later. For interest-only loans, the payment is simply the principal multiplied by the periodic interest rate, and for balloon loans, payments are calculated based on a longer amortization schedule than the actual term, resulting in a large final payment. Different payment frequencies (weekly, bi-weekly, monthly) affect both the periodic interest rate and number of payments.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do different payment frequencies affect the total cost of a loan?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Different payment frequencies can significantly affect a loan\'s total cost through two primary mechanisms: First, more frequent payments reduce the average loan balance over time, decreasing the total interest accrued. For example, a $300,000, 30-year mortgage at 4% would cost approximately $215,600 in interest with monthly payments, but only about $199,900 with bi-weekly payments (half the monthly amount paid every two weeks), saving nearly $15,700. Second, some payment schedules result in additional annual payments—bi-weekly payment plans typically result in 26 half-payments (equivalent to 13 monthly payments) per year rather than 12 monthly payments. Weekly payments similarly result in 52 weekly payments rather than 12 monthly ones. These "extra" payments accelerate principal reduction, shortening the loan term and further reducing interest costs. The greatest savings come from payment frequencies that both reduce average daily balances and result in additional annual principal payments, with weekly generally being most cost-effective, followed by bi-weekly, then semi-monthly, and monthly being the most expensive.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between principal and interest in a payment?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'In loan payments, the principal portion reduces your outstanding balance (the amount you borrowed), while the interest portion is the cost charged by the lender for borrowing the money. For example, on a $1,000 monthly mortgage payment, $300 might go toward principal and $700 toward interest initially. Each payment in an amortizing loan contains both components, but their proportions change over the loan term. In early payments, a larger percentage goes toward interest because it\'s calculated on a higher remaining balance. As the loan progresses and the principal decreases, more of each payment goes toward principal reduction. This is why making extra principal payments early in a loan term is particularly effective at reducing the overall interest paid. In the final years of a long-term loan like a 30-year mortgage, the situation reverses, with most of each payment reducing principal. Interest-only loans, by contrast, include no principal reduction in regular payments, so the loan balance remains unchanged until the loan term ends or additional principal payments are made.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do extra payments affect my loan?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Extra payments applied to principal have a powerful impact on loans through several mechanisms: 1) Shortened loan term - even small additional payments can significantly reduce your payoff timeline without changing the required monthly payment; for example, paying an extra $100 monthly on a $200,000, 30-year mortgage at 4% would shorten the loan by about 5 years; 2) Reduced total interest - because interest accrues on the remaining balance, every dollar of principal reduction saves interest for all remaining periods; the same $100 monthly extra payment would save approximately $38,000 in total interest; 3) Accelerated equity building - increasing your ownership stake faster, which is particularly valuable for assets that may appreciate; 4) Front-loaded benefits - extra payments early in the loan term have the greatest impact because they affect a larger principal balance over more time. For maximum benefit, ensure extra payments are applied directly to principal rather than prepaying future installments, and check that your loan doesn\'t have prepayment penalties. Even occasional lump-sum extra payments, such as from tax refunds or bonuses, can significantly improve your loan economics.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Should I choose a shorter loan term with higher payments or a longer term with extra payments?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The choice between a shorter loan term with higher required payments and a longer term with voluntary extra payments involves tradeoffs between flexibility and cost. A shorter term loan (like a 15-year vs. 30-year mortgage) typically offers lower interest rates—often 0.5% to 0.75% lower—which, combined with the accelerated payoff schedule, significantly reduces total interest costs. For example, a $300,000 loan at 4% for 30 years costs about $215,600 in interest, while a 15-year loan at 3.25% costs only about $79,400—a $136,200 difference. However, shorter terms require higher monthly payments ($2,108 vs. $1,432 in this example) and offer less flexibility—once you commit to the higher payment, it\'s mandatory. The longer-term-with-extra-payments approach provides flexibility to make higher payments when finances allow but revert to lower required payments during financial challenges. The ideal approach depends on your financial stability, emergency reserves, risk tolerance, and whether you value flexibility or guaranteed savings more. A balanced solution for many borrowers is choosing a longer term but immediately setting up automatic extra payments, which can be adjusted if circumstances change.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Payment Calculator | Calculate Loan & Installment Payments',
  description: 'Calculate loan, mortgage, or installment payments with different payment frequencies, interest rates, and terms using our comprehensive payment calculator.',
  keywords: [
    'payment calculator',
    'loan payment calculator',
    'installment calculator',
    'mortgage payment tool',
    'payment frequency calculator',
    'amortization calculator',
    'principal and interest calculator',
    'extra payment calculator',
    'loan comparison tool',
    'monthly payment estimator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function PaymentSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generatePaymentSchema('https://calculatorhub.space/calculators/payment')),
      }}
    />
  );
}