import { Metadata } from 'next';

// Define the JSON-LD schema for the marriage tax calculator
export function generateMarriageTaxSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Marriage Tax Calculator',
        'description': 'Calculate how marriage affects your tax situation and determine whether you face a marriage penalty or bonus based on your combined incomes and deductions.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Marriage penalty/bonus calculation',
          'Filing status comparison',
          'Combined income tax analysis',
          'Tax bracket visualization',
          'Credit and deduction adjustments',
          'State tax marriage impact',
          'Year-over-year tax comparison',
          'Tax-efficient income splitting guidance',
          'PDF export functionality',
          'Multiple scenario modeling'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/marriage-tax`,
            'description': 'Calculate how marriage affects your tax situation'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Marriage Tax Analysis'
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
            'name': 'Marriage Tax Calculator',
            'item': `${baseUrl}/calculators/marriage-tax`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is the marriage tax penalty or bonus?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The marriage tax penalty or bonus refers to the change in a couple\'s total tax liability that occurs when they marry and file taxes jointly, compared to filing as two single individuals. A marriage bonus occurs when a couple pays less total tax by filing jointly than they would as singles—typically when one spouse earns significantly more than the other. In this case, the lower-earning spouse\'s income effectively gets taxed at lower rates when combined. A marriage penalty occurs when a couple pays more tax filing jointly than they would as singles—typically when both spouses have similar high incomes that, when combined, push them into higher tax brackets. The Tax Cuts and Jobs Act of 2017 reduced many marriage penalties in federal income tax brackets, but penalties can still exist due to various deduction limits, credit phase-outs, and state tax codes that don\'t perfectly align with the federal system.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Should married couples always file taxes jointly?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'While filing jointly is beneficial for most married couples, it\'s not always the optimal choice. Married Filing Jointly (MFJ) typically provides better tax rates and higher credit and deduction thresholds than Married Filing Separately (MFS). However, filing separately might be advantageous when: 1) One spouse has significant medical expenses that would be easier to deduct when calculated against a lower individual income (medical expenses must exceed 7.5% of AGI); 2) One spouse has substantial miscellaneous itemized deductions or casualty losses; 3) You want to separate tax liability from a spouse with tax debt, payment issues, or potential audit concerns; 4) One spouse suspects tax fraud by the other and wants to avoid joint liability; 5) Income-based student loan repayments would be lower when based on individual rather than joint income. The decision requires careful analysis since MFS status loses certain tax benefits and credits, including student loan interest deductions, education credits, child and dependent care credits, and the earned income credit.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Which tax credits and deductions are affected by marriage?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Marriage can significantly affect eligibility and amounts for various credits and deductions: 1) Earned Income Tax Credit (EITC) - marriage can reduce or eliminate this credit when combined incomes exceed thresholds; 2) Student loan interest deduction - phases out at lower income thresholds for joint filers than the combined thresholds for two singles; 3) Capital losses - joint filers are limited to the same $3,000 annual deduction as singles, effectively halving the benefit for two investors; 4) IRA contribution deductibility - may be limited when one spouse has retirement plan coverage; 5) Child Tax Credit and other credits - phase-out thresholds don\'t double upon marriage, potentially reducing benefits; 6) Standard deduction - married couples receive less than double the single deduction; 7) State and local tax (SALT) deductions - the $10,000 cap applies equally to single and joint filers; 8) Premium Tax Credit (ACA subsidies) - marriage can significantly change subsidy eligibility; 9) Social Security taxation - combined incomes may cause previously untaxed benefits to become taxable.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does the timing of marriage affect your taxes?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'For tax purposes, your marital status on December 31 determines your filing status for the entire tax year, regardless of when you married. This timing consideration offers planning opportunities: 1) If marriage would result in a tax penalty, delaying the wedding until January of the following year could save significant taxes; 2) Conversely, if you\'ll receive a marriage bonus, getting married before year-end secures tax benefits for the entire year; 3) Year-end marriages require immediate withholding adjustments to avoid under-withholding penalties; 4) December marriages provide limited time for tax planning strategies like charitable bunching or income shifting; 5) Retirement account contributions should be reviewed, as marriage may change deduction eligibility; 6) End-of-year asset sales might be timed differently based on combined versus individual capital gain situations; 7) Marriage timing can affect Affordable Care Act premium subsidies for the entire year. Couples with substantial income disparities generally benefit from accelerating marriage, while dual high-earners might benefit from delaying.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What tax planning strategies work best for married couples?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Effective tax planning strategies for married couples include: 1) Income splitting - if one spouse has significantly higher income, consider shifting income-producing assets to the lower-earning spouse to equalize incomes and reduce overall tax burden; 2) Retirement planning - maximize contributions to tax-advantaged accounts like 401(k)s and IRAs, potentially using a spousal IRA for a non-working spouse; 3) Charitable giving - coordinate and potentially bunch charitable donations to maximize itemized deductions in alternating years; 4) Health insurance optimization - choose the most tax-efficient coverage between employer plans, considering FSA and HSA opportunities; 5) Business ownership allocation - structure family businesses to optimize the 20% qualified business income deduction and self-employment taxes; 6) Estate planning - utilize the unlimited marital deduction and portability of estate tax exemptions; 7) Home ownership - leverage capital gains exclusions ($500,000 for joint filers vs. $250,000 for singles) when selling a primary residence; and 8) Tax loss harvesting - coordinate investment strategies to offset gains with losses across both spouses\' accounts while avoiding wash sale rules.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Marriage Tax Calculator | Analyze Marriage Tax Penalty or Bonus',
  description: 'Calculate how marriage affects your taxes and determine whether you face a marriage tax penalty or bonus based on your combined incomes and deductions.',
  keywords: [
    'marriage tax calculator',
    'marriage penalty calculator',
    'marriage bonus calculator',
    'married filing jointly calculator',
    'married vs single tax comparison',
    'wedding tax implications',
    'tax benefits of marriage',
    'marriage tax penalty',
    'filing status comparison',
    'couples tax planning'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function MarriageTaxSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateMarriageTaxSchema('https://calculatorhub.space/calculators/marriage-tax')),
      }}
    />
  );
}