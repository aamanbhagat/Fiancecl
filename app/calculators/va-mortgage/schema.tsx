import { Metadata } from 'next';

// Define the JSON-LD schema for the VA mortgage calculator
export function generateVaMortgageSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'VA Mortgage Calculator',
        'description': 'Calculate VA loan payments, estimate funding fees, and analyze VA mortgage benefits with our comprehensive VA home loan calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'VA loan payment calculation',
          'VA funding fee estimation',
          'VA vs conventional loan comparison',
          'VA loan eligibility assessment',
          'VA IRRRL refinance analysis',
          'VA maximum loan amount calculation',
          'Debt-to-income ratio calculation',
          'Entitlement usage estimation',
          'PDF export functionality',
          'Multiple scenario comparison'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/va-mortgage`,
            'description': 'Calculate VA loan payments and estimate funding fees'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'VA Mortgage Analysis'
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
            'name': 'VA Mortgage Calculator',
            'item': `${baseUrl}/calculators/va-mortgage`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'Who qualifies for a VA home loan and what benefits does it offer?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'VA home loans are available to service members, veterans, and certain military spouses who meet service requirements, which generally include 90 consecutive days of active service during wartime, 181 consecutive days during peacetime, or 6 years in the National Guard or Reserves. Eligible borrowers must obtain a Certificate of Eligibility (COE) and intend to occupy the property as their primary residence. The benefits of VA loans are substantial compared to conventional loans: no down payment requirement (100% financing), no private mortgage insurance (PMI) even with 0% down, competitive interest rates typically 0.25%-0.5% lower than conventional loans, limited closing costs with restrictions on what veterans can pay, more lenient credit requirements (typically minimum scores of 580-620 compared to 640-660 for conventional loans), higher debt-to-income ratio allowances, and no prepayment penalties. Additionally, VA loans offer lifetime benefits that can be used multiple times, assistance for borrowers facing financial difficulty, and the possibility of assumption by qualified buyers. While VA loans do require a funding fee (typically 1.4%-3.6% of the loan amount, which can be financed), this fee is waived for veterans receiving VA disability compensation and certain surviving spouses.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does the VA funding fee work and how much is it?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The VA funding fee is a one-time payment required for most VA loans, designed to offset the cost of the VA loan program to taxpayers. The fee varies based on several factors: type of service (Regular Military, National Guard/Reserves), loan purpose (purchase, refinance), down payment amount, and whether it\'s the borrower\'s first or subsequent use of their VA loan benefit. For first-time use on a purchase with no down payment, the funding fee is 2.15% for regular military and 2.4% for National Guard/Reserves (2023 rates). This percentage decreases with larger down payments: with 5-9.99% down, the fee drops to 1.5%, and with 10% or more down, it\'s 1.25% for all service categories. For subsequent use VA loans with no down payment, the fee increases to 3.3% for both regular military and National Guard/Reserves. VA Interest Rate Reduction Refinance Loans (IRRRLs) have a reduced funding fee of 0.5%, while VA cash-out refinances follow the purchase loan fee schedule. Importantly, the funding fee is waived entirely for veterans receiving VA disability compensation, active duty service members with Purple Hearts, surviving spouses receiving Dependency and Indemnity Compensation, and certain other qualifying individuals. The funding fee can be paid upfront at closing or rolled into the loan amount, though financing it slightly increases the monthly payment and total interest paid.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Are there loan limits on VA mortgages and how does entitlement work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'As of January 1, 2020, veterans with full entitlement no longer have VA loan limits, meaning they can borrow as much as lenders are willing to lend without making a down payment, provided they qualify based on income and credit requirements. However, veterans with partial entitlement (typically those with active VA loans or who had a prior VA loan foreclosure) still face county-based loan limits. VA entitlement has two components: basic entitlement of $36,000 and bonus (or second-tier) entitlement, which is calculated based on the conforming loan limit. The VA typically guarantees 25% of the loan amount to lenders, making full entitlement worth about 25% of the loan amount. For veterans with partial entitlement, the maximum loan amount with no down payment equals their remaining entitlement multiplied by four. If a veteran wants to purchase a home exceeding this amount, they need to make a down payment of 25% of the excess. Entitlement can be restored when a VA loan is paid in full and the property sold, or through a one-time restoration when the loan is paid off but the property retained. After a foreclosure or short sale, entitlement can only be restored by repaying the VA in full for any claim it paid to the lender. Veterans can check their available entitlement by requesting their Certificate of Eligibility (COE) through the VA eBenefits portal, VA-approved lenders, or by mail using VA Form 26-1880.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do VA loan interest rates compare to conventional loans?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'VA loan interest rates typically run about 0.25% to 0.5% lower than rates for comparable conventional loans, creating significant savings over the life of a mortgage. Several factors contribute to these favorable rates: The VA guaranty reduces lender risk by protecting them against some losses in case of borrower default, making these loans less risky than zero-down conventional options; the loans are partially backed by the federal government; and VA loans have historically maintained lower default rates than FHA and conventional loans despite more lenient qualification standards. However, interest rates still vary among VA-approved lenders, sometimes by 0.5% or more, making comparison shopping crucial for borrowers. Rates are also influenced by individual factors including credit score (though VA loans are more forgiving of lower scores than conventional loans), debt-to-income ratio, loan term, loan type (purchase vs. refinance), and current market conditions. The rate advantage of VA loans becomes even more pronounced when considering the absence of mortgage insurance, which can add 0.5-1.0% to the effective rate of conventional loans with less than 20% down. When evaluating loan options, veterans should consider the Annual Percentage Rate (APR) rather than just the stated rate, as it incorporates the VA funding fee and other loan costs to provide a more accurate comparison of total borrowing costs.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Can I use my VA loan benefit multiple times or for more than one property?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Veterans can use their VA loan benefit multiple times throughout their lives, but with important limitations regarding concurrent usage. After using a VA loan, the benefit can be restored when the loan is fully repaid and the property is sold, allowing for full entitlement to be used again for a future home purchase. Veterans can also conduct a one-time entitlement restoration if they pay off a VA loan but keep the property, though this option can only be used once. For veterans with sufficient remaining entitlement, it\'s possible to have multiple VA loans simultaneously. This typically occurs when a service member relocates due to Permanent Change of Station (PCS) orders but keeps their first home as a rental property. In such cases, the veteran uses their remaining entitlement for the second home, though loan amounts may be limited based on available entitlement. The VA also offers an option to obtain a VA loan after a previous VA loan foreclosure or short sale, but the entitlement used for the foreclosed loan remains unavailable until any loss to the VA is repaid in full. Veterans considering multiple VA loans should obtain their Certificate of Eligibility (COE) to verify their remaining entitlement and work with lenders experienced in handling these more complex situations. The subsequent use of VA loan benefits does come with a higher funding fee (3.3% vs. 2.15% for first-time use), though this is waived for disabled veterans.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'VA Mortgage Calculator | VA Home Loan Payment Estimator',
  description: 'Calculate VA loan payments, estimate funding fees, and analyze VA mortgage benefits with our comprehensive VA home loan calculator.',
  keywords: [
    'VA mortgage calculator',
    'VA loan calculator',
    'VA funding fee calculator',
    'VA home loan estimator',
    'VA IRRRL calculator',
    'VA mortgage payment calculator',
    'veteran home loan calculator',
    'VA loan comparison tool',
    'VA loan eligibility calculator',
    'military mortgage calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function VaMortgageSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateVaMortgageSchema('https://calculatorhub.space/calculators/va-mortgage')),
      }}
    />
  );
}