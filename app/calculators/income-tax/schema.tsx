import { Metadata } from 'next';

// Define the JSON-LD schema for the income tax calculator
export function generateIncomeTaxSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Income Tax Calculator',
        'description': 'Calculate federal and state income taxes based on your income, filing status, deductions, and credits with our comprehensive tax estimator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Federal income tax calculation',
          'State income tax estimation',
          'Multiple filing status support',
          'Standard and itemized deduction comparison',
          'Tax credit application',
          'Marginal and effective tax rate display',
          'Tax bracket visualization',
          'Paycheck withholding estimation',
          'PDF export functionality',
          'Year-over-year tax comparison'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/income-tax`,
            'description': 'Calculate federal and state income taxes'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Income Tax Analysis'
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
            'name': 'Income Tax Calculator',
            'item': `${baseUrl}/calculators/income-tax`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What\'s the difference between marginal and effective tax rates?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Marginal and effective tax rates represent different aspects of income taxation. Your marginal tax rate is the highest tax bracket percentage applied to your income—the tax rate on the last dollar you earned. For example, if you\'re in the 24% bracket, additional income is taxed at that rate. The effective tax rate (also called average tax rate) is your total tax paid divided by your total taxable income, expressing the overall percentage of your income that goes to taxes. For instance, someone earning $100,000 might pay $15,000 in taxes, resulting in a 15% effective rate, despite being in the 24% marginal bracket. The difference occurs because the U.S. uses a progressive tax system where only income above each threshold is taxed at the higher rate. Understanding both rates helps you make more informed financial decisions regarding additional income or tax-reduction strategies.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do tax deductions differ from tax credits?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Tax deductions and tax credits reduce your tax liability in fundamentally different ways. Deductions lower your taxable income before tax rates are applied. Their value depends on your marginal tax bracket—a $1,000 deduction saves $320 for someone in the 32% bracket but only $120 for someone in the 12% bracket. Common deductions include mortgage interest, state and local taxes, and charitable contributions. Tax credits, however, directly reduce your tax bill dollar-for-dollar after all calculations, making them more valuable regardless of income level. A $1,000 tax credit saves exactly $1,000 for everyone. Credits come in two forms: nonrefundable credits (can reduce tax to zero) and refundable credits (can generate a refund even if you don\'t owe tax). Popular credits include the Child Tax Credit, Earned Income Tax Credit, and education credits.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are the current federal income tax brackets?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'For the 2024 tax year (filed in 2025), federal income tax brackets are: 10% for incomes up to $11,600 (single) or $23,200 (married filing jointly); 12% for incomes over those amounts up to $47,150 (single) or $94,300 (married); 22% up to $100,525 (single) or $201,050 (married); 24% up to $191,950 (single) or $383,900 (married); 32% up to $243,725 (single) or $487,450 (married); 35% up to $609,350 (single) or $731,200 (married); and 37% for incomes above those thresholds. These brackets apply progressively—only income within each range is taxed at that rate. For example, a single filer earning $75,000 pays 10% on the first $11,600, 12% on income from $11,601-$47,150, and 22% only on income from $47,151-$75,000, resulting in a lower effective tax rate than their 22% marginal rate.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How can I legally reduce my income tax liability?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'To legally reduce income tax liability: 1) Maximize pre-tax retirement contributions through 401(k)s (up to $23,000 in 2024, plus $7,500 catch-up for those 50+) and IRAs; 2) Use tax-advantaged accounts like HSAs (up to $4,150 individual/$8,300 family in 2024) for healthcare expenses and FSAs for dependent care; 3) Harvest investment losses to offset capital gains; 4) Bundle deductions in alternating years to exceed the standard deduction threshold; 5) Make charitable donations directly from IRAs if over 70½ through Qualified Charitable Distributions; 6) Claim all eligible education tax benefits including the American Opportunity Credit (up to $2,500) and Lifetime Learning Credit (up to $2,000); 7) Track business expenses if self-employed; 8) Consider timing income and deductible expenses strategically between tax years; and 9) Review potential credits like Child Tax Credit, Earned Income Credit, or Saver\'s Credit based on your situation.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between filing statuses and which should I choose?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The five filing statuses—Single, Married Filing Jointly, Married Filing Separately, Head of Household, and Qualifying Widow(er)—affect tax brackets, deductions, and credit eligibility. Single status applies to unmarried individuals. Married Filing Jointly combines income and deductions, typically providing the most favorable tax treatment for most couples with similar incomes. Married Filing Separately may benefit couples with significant medical expenses (exceeding 7.5% of AGI threshold becomes easier), those concerned about liability for spouse\'s tax debt, or when one spouse has income-based student loan payments. Head of Household status is available to unmarried individuals who pay over half the cost of maintaining a home for a qualifying person, offering more favorable tax brackets and a higher standard deduction than Single status ($20,800 vs $13,850 in 2024). Qualifying Widow(er) status provides joint return benefits for those with dependent children for two years after a spouse\'s death.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Income Tax Calculator | Estimate Federal & State Taxes',
  description: 'Calculate your federal and state income taxes based on your income, filing status, deductions, and credits with our comprehensive tax calculator.',
  keywords: [
    'income tax calculator',
    'tax bracket calculator',
    'federal tax calculator',
    'state tax calculator',
    'tax refund estimator',
    'tax withholding calculator',
    'marginal tax rate calculator',
    'effective tax rate calculator',
    'paycheck tax calculator',
    'tax deduction calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function IncomeTaxSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateIncomeTaxSchema('https://calculatorshub.store/calculators/income-tax')),
      }}
    />
  );
}