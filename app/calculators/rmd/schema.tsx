import { Metadata } from 'next';

// Define the JSON-LD schema for the RMD calculator
export function generateRmdSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'RMD Calculator',
        'description': 'Calculate required minimum distributions from retirement accounts, estimate tax impacts, and plan withdrawals with our comprehensive RMD calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Required minimum distribution calculation',
          'Multi-year RMD projection',
          'Account balance visualization',
          'Tax impact estimation',
          'Inherited IRA RMD analysis',
          'Different distribution strategies comparison',
          'SECURE Act compliance checks',
          'Qualified charitable distribution modeling',
          'PDF export functionality',
          'Multiple account scenario planning'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/rmd`,
            'description': 'Calculate required minimum distributions from retirement accounts'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Required Minimum Distribution Analysis'
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
            'name': 'RMD Calculator',
            'item': `${baseUrl}/calculators/rmd`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What are Required Minimum Distributions (RMDs) and when do they start?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Required Minimum Distributions (RMDs) are mandatory withdrawals that must be taken from tax-advantaged retirement accounts once you reach a certain age. The SECURE Act of 2019 changed the RMD age from 70½ to 72 for individuals who turned 70½ after December 31, 2019. More recently, the SECURE 2.0 Act further adjusted the RMD age to 73 beginning in 2023, and it will increase to 75 in 2033. These distributions apply to traditional IRAs, 401(k)s, 403(b)s, 457(b)s, SEP IRAs, SIMPLE IRAs, and other defined contribution plans. Roth IRAs don\'t require RMDs during the original account owner\'s lifetime, but inherited Roth IRAs are generally subject to RMD rules. The first RMD must be taken by April 1 of the year following the year you reach the applicable RMD age (the "required beginning date"). Subsequent RMDs must be taken by December 31 each year. Taking both your first and second RMDs in the same calendar year may result in a higher tax bracket, so careful planning is advisable.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How are Required Minimum Distributions calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Required Minimum Distributions are calculated by dividing the retirement account balance as of December 31 of the previous year by a life expectancy factor provided by the IRS. The specific life expectancy table used depends on your situation: 1) Uniform Lifetime Table - most commonly used by account owners who are taking distributions from their own retirement accounts; 2) Joint and Last Survivor Table - used when the sole beneficiary is a spouse who is more than 10 years younger than the account owner; 3) Single Life Expectancy Table - typically used by beneficiaries who inherited retirement accounts. For example, if you\'re 75 years old with a retirement account balance of $500,000 at the end of the previous year, you would use the Uniform Lifetime Table to find the distribution period for age 75 (which is 24.6 under the 2022 updated tables). Your RMD would be $500,000 ÷ 24.6 = $20,325. The IRS updated its life expectancy tables effective January 1, 2022, generally resulting in slightly smaller required distributions compared to the previous tables due to increased life expectancies.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are the tax implications of RMDs?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Required Minimum Distributions have several important tax implications to consider: 1) Income tax liability - RMDs from pre-tax retirement accounts (traditional IRAs, 401(k)s, etc.) are taxed as ordinary income in the year they\'re taken, potentially pushing you into a higher tax bracket; 2) No penalty for larger withdrawals - RMD amounts are minimums; you can always withdraw more, though all distributions will be taxable; 3) No capital gains treatment - even if the growth in your retirement account came from investments that would normally qualify for lower long-term capital gains rates, RMDs are always taxed as ordinary income; 4) State taxation - most states that impose income tax will tax RMDs, though some states exempt retirement income up to certain limits; 5) Social Security impact - higher income from RMDs may cause more of your Social Security benefits to become taxable; 6) Medicare premium effects - increased income from RMDs may trigger Income Related Monthly Adjustment Amounts (IRMAA), resulting in higher Medicare Part B and Part D premiums two years later; and 7) Potential for Qualified Charitable Distributions (QCDs) - individuals 70½ or older can direct up to $100,000 annually from their IRA directly to qualified charities, which can satisfy RMD requirements without increasing taxable income.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What happens if I don\'t take my Required Minimum Distribution?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Failing to take a Required Minimum Distribution (RMD) or withdrawing less than the required amount has serious consequences. Historically, the penalty was extremely severe—50% of the amount not withdrawn. However, the SECURE 2.0 Act reduced this penalty to 25% starting in 2023, with a further reduction to 10% if the error is corrected in a timely manner (generally within two years). For example, if your RMD was $20,000 and you only withdrew $5,000, you would be $15,000 short. Under the new rules, the penalty would be $3,750 (25% of $15,000) or potentially as low as $1,500 (10%) if corrected promptly. To correct an RMD shortfall, take the missed distribution as soon as possible and file IRS Form 5329 with an attachment explaining the reasonable cause for the failure. The IRS may waive the penalty if the shortfall was due to reasonable error and you\'re taking steps to remedy it. Common acceptable reasons include serious illness, death of a family member, or receiving incorrect advice from a financial professional. It\'s important to note that each retirement account type (IRA, 401(k), etc.) has its own RMD requirement, though multiple IRAs can be aggregated for RMD calculation purposes, as can multiple 403(b) plans.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How have the RMD rules changed under the SECURE 2.0 Act?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The SECURE 2.0 Act of 2022 made several significant changes to Required Minimum Distribution (RMD) rules: 1) Increased age requirement - the age for starting RMDs increased to 73 beginning in 2023 for individuals born between 1951 and 1959, and will increase further to age 75 beginning in 2033 for those born in 1960 or later; 2) Reduced penalty - the penalty for failing to take an RMD decreased from 50% to 25% of the shortfall, with a further reduction to 10% if corrected in a timely manner; 3) Roth 401(k) exemption - starting in 2024, Roth accounts in employer plans (Roth 401(k)s, 403(b)s, etc.) will be exempt from RMDs during the owner\'s lifetime, matching the treatment of Roth IRAs; 4) Qualified charitable distribution (QCD) expansion - the $100,000 annual QCD limit will now be indexed for inflation, and a one-time QCD of up to $50,000 can be made to a charitable remainder trust or charitable gift annuity; 5) Qualified longevity annuity contract (QLAC) enhancement - the dollar limitation for QLACs increased to $200,000 (from $145,000), indexed for inflation; and 6) No penalty waiver for certain annuity payments - payments that failed to satisfy RMD rules solely because of specific annuity features are now exempt from penalties. These changes generally provide more flexibility and reduced penalties for retirement account owners, allowing more time for tax-deferred growth and additional planning opportunities.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'RMD Calculator | Required Minimum Distribution Planning Tool',
  description: 'Calculate required minimum distributions from retirement accounts, estimate tax impacts, and plan withdrawals with our comprehensive RMD calculator.',
  keywords: [
    'RMD calculator',
    'required minimum distribution calculator',
    'retirement distribution calculator',
    'IRA withdrawal calculator',
    'SECURE Act RMD calculator',
    'inherited IRA RMD',
    'minimum withdrawal calculator',
    '401k required distributions',
    'retirement tax planning',
    'qualified charitable distribution calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function RmdSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateRmdSchema('https://calculatorhub.space/calculators/rmd')),
      }}
    />
  );
}