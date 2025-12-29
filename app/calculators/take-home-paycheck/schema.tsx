import { Metadata } from 'next';

// Define the JSON-LD schema for the take-home paycheck calculator
export function generateTakeHomePaycheckSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Take-Home Paycheck Calculator',
        'description': 'Calculate your net pay after taxes and deductions with our comprehensive take-home paycheck calculator that accounts for federal, state, and local taxes.',
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
          'FICA tax estimation',
          'State and local tax computation',
          'Pre-tax deduction analysis',
          'Multiple pay period options',
          'Tax withholding optimization',
          'Retirement contribution impact',
          'Overtime and bonus tax calculation',
          'PDF export functionality',
          'Multiple scenario comparison'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/take-home-paycheck`,
            'description': 'Calculate your net pay after taxes and deductions'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Paycheck Analysis'
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
            'name': 'Take-Home Paycheck Calculator',
            'item': `${baseUrl}/calculators/take-home-paycheck`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What deductions are typically taken from a paycheck?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Several types of deductions are commonly taken from gross paychecks before you receive your net pay. Mandatory deductions include federal income tax (based on your W-4 withholding instructions and income level), Social Security tax (6.2% of wages up to the annual wage base limit, which is $160,200 in 2023), Medicare tax (1.45% of all wages, plus an additional 0.9% for high earners), and state and local income taxes (varying by location). Most employees also have voluntary deductions, including health insurance premiums (typically $100-500+ monthly depending on coverage and employer subsidy), retirement plan contributions (often 3-15% of salary for 401(k)/403(b) plans), dental and vision insurance premiums, flexible spending account (FSA) or health savings account (HSA) contributions, disability and life insurance premiums, and sometimes union dues or charitable contributions. Pre-tax deductions (like traditional 401(k) contributions and many health insurance premiums) reduce your taxable income, while after-tax deductions (like Roth 401(k) contributions) do not. Understanding your deductions is important for budgeting and ensuring proper withholding. The cumulative impact of these deductions means your take-home pay is typically 65-80% of your gross salary, depending on your tax situation and benefit elections.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How can I adjust my tax withholding to optimize my paycheck?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Optimizing tax withholding requires balancing current cash flow needs with avoiding a large tax bill or penalty at tax time. To adjust withholding, complete a new W-4 form with your employer—the redesigned form no longer uses "allowances" but instead asks for specific dollar amounts for more accurate withholding. Several strategies can help optimize withholding: First, review your withholding if you\'ve experienced major life events like marriage, divorce, childbirth, or buying a home, as these affect tax liability. Second, if you consistently receive large tax refunds (over $1,000), consider reducing withholding to increase your paycheck throughout the year—while refunds feel good, they essentially represent an interest-free loan to the government. Conversely, if you typically owe taxes, increasing withholding can help avoid underpayment penalties. Third, if you have multiple jobs or your household has two earners, use the IRS Tax Withholding Estimator online or complete Step 2 of the W-4 carefully, as this situation often leads to underwithholding. Fourth, claiming dependents or using the deductions worksheet on the W-4 accounts for tax credits and deductions that reduce your tax liability. Finally, you can specify an additional dollar amount to withhold if you have other income not subject to withholding, like self-employment or investment income. The goal is withholding that closely matches your actual tax liability—ideally resulting in a small refund or small additional payment at tax time.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does my filing status affect my take-home pay?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Your tax filing status significantly impacts take-home pay by determining tax brackets, standard deduction amounts, and eligibility for certain credits and deductions. The five filing statuses—Single, Married Filing Jointly, Married Filing Separately, Head of Household, and Qualifying Widow(er)—each have different tax implications. Married Filing Jointly typically provides the most favorable tax treatment for most couples through wider tax brackets and a larger standard deduction ($27,700 for 2023 vs. $13,850 for Single filers), resulting in higher take-home pay. However, when both spouses have similar high incomes, they might experience a "marriage penalty" where their combined income pushes them into higher tax brackets. Head of Household status (available to unmarried individuals who pay more than half the cost of maintaining a home for a qualifying person) offers more favorable tax brackets and higher standard deduction ($20,800 for 2023) than Single status, potentially increasing take-home pay significantly. Married Filing Separately usually results in higher tax liability than joint filing for most couples, though it may benefit couples where one spouse has significant medical expenses or other specific deductions. Your W-4 should reflect your intended filing status for accurate withholding. If your filing status will change during the year due to marriage, divorce, or other life events, updating your W-4 promptly helps prevent significant under- or over-withholding.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How are bonuses and overtime pay taxed on paychecks?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Bonuses and overtime pay are often subject to different withholding methods, creating the common misconception that they\'re "taxed at a higher rate." For bonuses, employers typically use one of two withholding methods: The percentage method applies a flat 22% federal withholding rate to supplemental wages under $1 million (increasing to 37% for amounts over $1 million), separate from your regular paycheck withholding. Alternatively, the aggregate method combines the bonus with your regular wages for the pay period, calculates withholding on the total, then subtracts what was already withheld from your regular wages. The aggregate method often results in higher withholding because the combined amount may temporarily push you into a higher tax bracket. For overtime pay, withholding is typically calculated using the aggregate method, where the additional income is added to your regular earnings, potentially resulting in a higher percentage being withheld due to progressive tax brackets. Importantly, while the withholding may be higher, bonuses and overtime are ultimately taxed as regular income when you file your tax return—not at special, higher rates. If too much tax was withheld, you\'ll receive the excess back as a refund after filing. Despite higher initial withholding, earning bonuses and overtime always increases your total take-home pay. Some states also have specific supplemental wage withholding rates that differ from regular paycheck withholding.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What pre-tax deductions can increase my take-home pay?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Pre-tax deductions reduce your taxable income before taxes are calculated, effectively lowering your tax burden and increasing take-home pay. The most common and impactful pre-tax deductions include: 1) Traditional 401(k), 403(b), or 457 retirement contributions—employees can contribute up to $22,500 in 2023 ($30,000 for those 50 and older), reducing taxable income dollar-for-dollar; 2) Health insurance premiums paid through employer plans typically qualify as pre-tax; 3) Health Savings Account (HSA) contributions for those with high-deductible health plans—up to $3,850 for individual coverage or $7,750 for family coverage in 2023, with an additional $1,000 for those 55 and older; 4) Flexible Spending Accounts (FSAs) for healthcare expenses (up to $3,050 in 2023) and dependent care expenses (up to $5,000); 5) Commuter benefits for transit passes and parking expenses—up to $300 monthly for each; and 6) Group term life insurance premiums for coverage up to $50,000. The tax savings from these deductions depend on your marginal tax rate—for someone in the 22% federal tax bracket, each $100 in pre-tax deductions saves approximately $22 in federal income tax, plus additional savings on Social Security and Medicare taxes (7.65%) and state taxes. When strategically maximized, pre-tax deductions can increase take-home pay by reducing tax liability, even while building retirement savings and paying for necessary expenses like healthcare.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Take-Home Paycheck Calculator | Net Pay Estimator',
  description: 'Calculate your net pay after taxes and deductions with our comprehensive take-home paycheck calculator that accounts for federal, state, and local taxes.',
  keywords: [
    'take home pay calculator',
    'net pay calculator',
    'paycheck calculator',
    'after tax income calculator',
    'salary calculator after taxes',
    'payroll tax calculator',
    'income tax estimator',
    'withholding calculator',
    'paycheck deduction calculator',
    'salary to hourly calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function TakeHomePaycheckSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateTakeHomePaycheckSchema('https://calculatorhub.space/calculators/take-home-paycheck')),
      }}
    />
  );
}