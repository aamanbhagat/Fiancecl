import { Metadata } from 'next';

// Define the JSON-LD schema for the pension calculator
export function generatePensionSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Pension Calculator',
        'description': 'Calculate your projected pension benefits, retirement income, and analyze different payout options with our comprehensive pension calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Pension benefit projection',
          'Lump sum vs. annuity comparison',
          'Early retirement impact analysis',
          'Survivor benefit optimization',
          'Cost of living adjustment modeling',
          'Pension maximization strategies',
          'Tax impact calculation',
          'Multiple retirement income scenario modeling',
          'PDF export functionality',
          'Integration with other retirement accounts'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/pension`,
            'description': 'Calculate your projected pension benefits and analyze payout options'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Pension Analysis'
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
            'name': 'Pension Calculator',
            'item': `${baseUrl}/calculators/pension`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How are pension benefits typically calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Pension benefits are typically calculated using one of several common formulas. The most prevalent is the Final Average Salary method, which multiplies three factors: years of service × a benefit multiplier (often 1-2.5%) × final average salary (usually based on the highest 3-5 consecutive years of earnings). For example, someone with 30 years of service, a 1.5% multiplier, and a final average salary of $80,000 would receive an annual pension of $36,000 (30 × 1.5% × $80,000). Alternative calculation methods include: Career Average formulas that consider earnings throughout employment; Flat Dollar formulas that multiply years of service by a fixed dollar amount; Points Systems that award benefits based on accumulated points from age and service combinations; and Cash Balance plans that provide benefits based on hypothetical account balances. Government pensions often use more generous multipliers but may also have caps on pensionable earnings or total benefits. Understanding your specific plan formula is crucial for accurate retirement planning.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between defined benefit and defined contribution pension plans?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Defined benefit (DB) and defined contribution (DC) plans represent fundamentally different retirement plan structures. In a defined benefit plan (traditional pension), the employer guarantees a specific monthly benefit at retirement based on a formula using salary history and years of service. The employer bears the investment risk and responsibility for funding the promised benefits. In contrast, a defined contribution plan (like a 401(k)) specifies the inputs—how much goes into the account from employee and employer contributions—but doesn\'t guarantee any specific benefit amount at retirement. The employee bears the investment risk, and retirement income depends on contribution amounts, investment performance, and withdrawal strategies. Key differences include: risk allocation (employer vs. employee), benefit predictability (guaranteed vs. variable), portability (typically lower vs. higher), vesting schedules (often longer vs. shorter), and cost-of-living adjustments (sometimes provided vs. rarely included). While DB plans have become less common in the private sector due to cost and funding challenges, they remain prevalent in public sector employment.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Should I take my pension as a lump sum or annuity payments?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The lump sum versus annuity pension decision involves weighing several factors: 1) Longevity risk - annuity payments provide guaranteed income for life, protecting against outliving your assets; if your family history suggests longevity, this becomes more valuable; 2) Interest rates - lump sum offers are typically higher when interest rates are lower, affecting the relative value proposition; 3) Investment expertise - taking a lump sum requires competent investment management to generate comparable lifetime income; 4) Health status - poor health may favor a lump sum if you don\'t expect to reach average life expectancy; 5) Inflation concerns - some pensions include cost-of-living adjustments while others don\'t, affecting long-term purchasing power; 6) Spousal considerations - annuity options typically include survivor benefits, while lump sums require careful estate planning; 7) Pension plan financial health - underfunded plans may pose risk to future benefits; 8) Tax implications - lump sums can create significant one-time tax liabilities unless properly rolled over; and 9) Control preferences - some retirees value the flexibility and legacy potential of managing a lump sum, while others prefer the simplicity and predictability of regular pension payments.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does early retirement affect pension benefits?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Early retirement typically reduces pension benefits through several mechanisms: 1) Reduced accrual years - retiring early means fewer years of service in the benefit calculation formula, directly lowering the benefit amount; 2) Early retirement reduction factors - many pensions apply percentage reductions for each year you retire before the plan\'s normal retirement age, often 3-7% per year; 3) Lower final average salary - earlier career exit often means missing peak earning years that would have increased the final average salary used in benefit calculations; 4) Longer benefit distribution period - benefits must last for more retirement years, stretching the pension fund\'s resources; 5) Potential loss of subsidized early retirement - some plans offer special early retirement options at specific age/service combinations that might be missed; and 6) Reduced cost-of-living adjustments - fewer years receiving COLA increases means less inflation protection. For example, someone eligible for a $3,000 monthly pension at age 65 might receive only $2,100 monthly (a 30% reduction) if retiring at 60. The impact varies significantly by plan, so it\'s crucial to obtain personalized benefit estimates for different retirement ages from your pension administrator.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is pension maximization and how does it work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Pension maximization ("pension max") is a retirement strategy that involves selecting the highest single-life pension payout option rather than a reduced joint-and-survivor option, then using the higher monthly income to purchase life insurance that would provide for the surviving spouse if the pensioner dies first. For example, instead of choosing a 50% survivor benefit that pays $2,000 monthly while both spouses are alive and $1,000 after the pensioner\'s death, the retiree could select a $2,400 single-life option and use part of the $400 monthly difference to buy a life insurance policy. The strategy aims to provide higher lifetime income while both spouses are alive while still protecting the surviving spouse. However, pension max involves several risks: 1) The life insurance premium may increase or become unaffordable over time if term insurance is used; 2) Poor health may make insurance prohibitively expensive or unavailable; 3) Policy lapse would leave the surviving spouse unprotected; 4) The insurance proceeds may not provide equivalent lifetime income to the survivor benefit; and 5) Additional complexity in retirement planning. This approach requires careful analysis of insurance costs, pension reduction factors, and both spouses\' life expectancies before implementation.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Pension Calculator | Analyze Retirement Benefits & Options',
  description: 'Calculate your projected pension benefits, retirement income, and analyze different payout options with our comprehensive pension calculator.',
  keywords: [
    'pension calculator',
    'retirement benefit calculator',
    'pension projection tool',
    'lump sum vs annuity calculator',
    'early retirement calculator',
    'pension maximization calculator',
    'survivor benefit analysis',
    'COLA pension calculator',
    'defined benefit calculator',
    'pension income planner'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function PensionSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generatePensionSchema('https://calculatorhub.space/calculators/pension')),
      }}
    />
  );
}