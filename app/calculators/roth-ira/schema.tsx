import { Metadata } from 'next';

// Define the JSON-LD schema for the Roth IRA calculator
export function generateRothIraSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Roth IRA Calculator',
        'description': 'Calculate potential tax-free growth in a Roth IRA, compare with traditional retirement accounts, and analyze conversion strategies with our comprehensive calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Roth IRA growth projection',
          'Tax-free withdrawal calculation',
          'Roth vs. traditional IRA comparison',
          'Contribution limit checker',
          'Roth conversion analysis',
          'Income phase-out calculator',
          'Backdoor Roth IRA modeling',
          'Retirement income projection',
          'PDF export functionality',
          'Multiple scenario modeling'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/roth-ira`,
            'description': 'Calculate potential tax-free growth in a Roth IRA'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Roth IRA Analysis'
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
            'name': 'Roth IRA Calculator',
            'item': `${baseUrl}/calculators/roth-ira`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What\'s the difference between a Roth IRA and a traditional IRA?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Roth and traditional IRAs differ primarily in their tax treatment and withdrawal rules. With a traditional IRA, contributions are typically tax-deductible in the year they\'re made, reducing your current taxable income. However, all withdrawals in retirement are taxed as ordinary income. Conversely, Roth IRA contributions are made with after-tax dollars, providing no immediate tax benefit, but qualified withdrawals in retirement—including all growth—are completely tax-free. Other key differences include: 1) Required Minimum Distributions (RMDs) - traditional IRAs mandate withdrawals beginning at age 73 (increasing to 75 by 2033), while Roth IRAs have no RMDs during the original owner\'s lifetime; 2) Early withdrawal rules - both allow early withdrawals of contributions for any reason, but traditional IRA earnings withdrawn before age 59½ typically incur taxes plus a 10% penalty, while Roth earnings withdrawn early may avoid penalties under certain conditions like first-time home purchase; 3) Income limits - Roth IRAs have income eligibility limits for contributions, while traditional IRAs allow anyone with earned income to contribute (though deductibility may be limited); and 4) Age limits - traditional IRAs previously prohibited contributions after age 70½, but this restriction was removed by the SECURE Act, making both IRA types available for contributions at any age if you have earned income.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Who can contribute to a Roth IRA and how much?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Roth IRA eligibility and contribution limits depend on income and tax filing status. For 2023, the maximum annual contribution is $6,500 ($7,500 if you\'re 50 or older). However, this limit begins to phase out at specific modified adjusted gross income (MAGI) thresholds. For single or head of household filers in 2023, the phase-out range is $138,000-$153,000 (full contributions below $138,000, partial contributions within the range, no direct contributions above $153,000). For married filing jointly, the phase-out range is $218,000-$228,000. For married filing separately, the phase-out occurs between $0-$10,000. Several other rules apply: 1) You must have earned income (wages, self-employment income) to contribute, and your contribution cannot exceed your earned income for the year; 2) There\'s no age restriction—you can contribute at any age as long as you have earned income; 3) You can contribute to both a Roth IRA and a traditional IRA in the same year, but the combined total cannot exceed the annual limit; 4) Even if ineligible for direct contributions due to high income, you may still use the "backdoor Roth IRA" strategy—making non-deductible traditional IRA contributions and then converting them to a Roth IRA, though the pro-rata rule may affect the tax consequences of this strategy.'
            }
          },
          {
            '@type': 'Question',
            'name': 'When can I withdraw from my Roth IRA without penalties or taxes?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Roth IRA withdrawal rules distinguish between contributions and earnings, with different tax treatments for each. Your contributions (the money you\'ve directly deposited) can be withdrawn at any time, regardless of age or how long you\'ve had the account, without taxes or penalties. This provides exceptional flexibility compared to other retirement accounts. For earnings (investment gains), a withdrawal is considered qualified and therefore tax-free and penalty-free if two conditions are met: 1) The withdrawal occurs at least five years after your first contribution to any Roth IRA (the five-year rule), and 2) One of the following applies: you\'re at least 59½ years old, you\'re disabled, you\'re using up to $10,000 for a first-time home purchase, or the withdrawal is made by your beneficiary after your death. For non-qualified withdrawals of earnings, you\'ll typically owe both income tax and a 10% early withdrawal penalty. However, the penalty (but not the tax) may be waived in certain circumstances: substantial medical expenses, health insurance premiums during unemployment, qualified higher education expenses, birth or adoption expenses (up to $5,000), or distributions as part of substantially equal periodic payments. Given these rules, Roth IRAs can serve dual roles as retirement accounts and emergency funds.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Should I convert my traditional IRA to a Roth IRA?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Whether to convert a traditional IRA to a Roth IRA depends on several factors, with current and future tax rates being the most critical consideration. Since a conversion requires paying income tax on the converted amount, it generally makes sense if you expect to be in a higher tax bracket during retirement than you are currently. Other factors favoring conversion include: 1) Having funds outside the IRA to pay the conversion tax, which essentially maximizes the amount converted; 2) A long time horizon before retirement, allowing tax-free growth to potentially overcome the upfront tax cost; 3) Desire to avoid Required Minimum Distributions, as Roth IRAs don\'t require them during the owner\'s lifetime; 4) Estate planning goals, as heirs will receive tax-free distributions; 5) Tax diversification strategy to have both taxable and tax-free income sources in retirement; and 6) Unusually low income years when you\'re temporarily in a lower tax bracket. Partial conversions spread over several years can help manage the tax impact and avoid pushing yourself into higher tax brackets. Before converting, consider the impact on your current tax situation, including potential effects on credits, deductions, Medicare premiums, and Social Security taxation. Professional tax advice is highly recommended for large conversions, as the decision cannot be reversed since the Tax Cuts and Jobs Act eliminated recharacterizations of Roth conversions.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is a backdoor Roth IRA and how does it work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'A backdoor Roth IRA is a strategy that allows high-income earners who exceed the income limits for direct Roth IRA contributions to still fund a Roth IRA through a two-step process. First, you make a non-deductible contribution to a traditional IRA, which has no income limits for contributions (though deductibility may be limited). Then, shortly after, you convert this traditional IRA to a Roth IRA. Since you\'ve already paid tax on the contribution (it was non-deductible), theoretically only any earnings between contribution and conversion would be taxable. However, the strategy becomes more complicated if you have existing pre-tax IRA funds due to the "pro-rata rule." This IRS rule requires that conversions be treated as coming proportionally from all your IRA money, not just the non-deductible portion. For example, if you have $95,000 in pre-tax IRA funds and make a $5,000 non-deductible contribution, only 5% of any conversion would be tax-free. To avoid this issue, some individuals with employer retirement plans can roll existing pre-tax IRA funds into their employer\'s plan before executing the backdoor strategy. While the backdoor Roth has been scrutinized by lawmakers, it remains legal as of 2023. For clarity and proper execution, consulting with a tax professional is advisable, particularly regarding proper IRS reporting on Form 8606.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Roth IRA Calculator | Tax-Free Retirement Growth Estimator',
  description: 'Calculate potential tax-free growth in a Roth IRA, compare with traditional retirement accounts, and analyze conversion strategies with our comprehensive calculator.',
  keywords: [
    'roth ira calculator',
    'tax-free retirement calculator',
    'roth vs traditional ira comparison',
    'roth conversion calculator',
    'backdoor roth ira calculator',
    'retirement tax planning',
    'roth contribution limit calculator',
    'roth ira growth calculator',
    'tax-free withdrawal estimator',
    'retirement savings calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function RothIraSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateRothIraSchema('https://calculatorshub.store/calculators/roth-ira')),
      }}
    />
  );
}