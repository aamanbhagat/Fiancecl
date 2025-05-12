import { Metadata } from 'next';

// Define the JSON-LD schema for the Social Security calculator
export function generateSocialSecuritySchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Social Security Calculator',
        'description': 'Calculate potential Social Security benefits, determine optimal claiming age, and analyze retirement income strategies with our comprehensive Social Security calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Retirement benefit estimation',
          'Spousal benefit calculation',
          'Survivor benefit analysis',
          'Break-even age determination',
          'Optimal claiming strategy',
          'Earnings history impact assessment',
          'Working in retirement modeling',
          'Taxation of benefits estimation',
          'PDF export functionality',
          'Multiple claiming scenario comparison'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/social-security`,
            'description': 'Calculate potential Social Security benefits and determine optimal claiming age'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Social Security Benefits Analysis'
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
            'name': 'Social Security Calculator',
            'item': `${baseUrl}/calculators/social-security`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'When is the best age to claim Social Security benefits?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The optimal age to claim Social Security benefits varies based on individual circumstances, as claiming age significantly impacts monthly benefit amounts. You can claim as early as age 62, at your full retirement age (FRA)—which ranges from 66 to 67 depending on birth year—or delay until age 70 for maximum benefits. Early claiming permanently reduces benefits by up to 30% compared to FRA, while delaying increases benefits by 8% annually after FRA until age 70, potentially resulting in 24-32% higher monthly payments than at FRA. Several factors should influence your decision: life expectancy (longer life expectancies generally favor delayed claiming), current health status, immediate financial needs, employment status, spousal considerations, and other retirement income sources. The "break-even age" concept suggests that someone who delays claiming until 70 instead of 62 would typically need to live into their early 80s before the higher monthly payments compensate for the 8 years of foregone benefits. Married couples should coordinate their claiming strategies, as the higher earner\'s decision impacts potential survivor benefits. While delaying offers higher monthly payments for life, claiming earlier means receiving benefits for more years, making this a deeply personal decision based on your unique financial situation, health outlook, and retirement plans.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How are Social Security retirement benefits calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Social Security retirement benefits are calculated through a multi-step process based on your lifetime earnings. First, the Social Security Administration (SSA) indexes your earnings from your highest 35 years of work to account for wage inflation over time. If you worked fewer than 35 years, zeros are included in the calculation for the missing years. Next, these indexed earnings are averaged to create your Average Indexed Monthly Earnings (AIME). Your Primary Insurance Amount (PIA)—the benefit you\'d receive at your full retirement age—is determined by applying a progressive formula to your AIME. For 2023, the formula applies 90% to the first $1,115 of AIME, 32% to amounts between $1,115 and $6,721, and 15% to amounts above $6,721. This creates a progressive system where lower-income workers receive a higher percentage of their pre-retirement earnings. Your actual benefit amount is then adjusted based on your claiming age—reduced if claiming before full retirement age or increased if delayed up to age 70. Benefits are also adjusted annually through cost-of-living adjustments (COLAs) to help maintain purchasing power against inflation. Your benefit estimate can be obtained through your personal my Social Security account on the SSA website, though these estimates assume consistent earnings until retirement.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do spousal benefits work with Social Security?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Spousal benefits allow married individuals to receive up to 50% of their spouse\'s full retirement age benefit amount, providing significant support for couples where one spouse had lower lifetime earnings or worked fewer years. To qualify for spousal benefits, you must be at least 62 years old (or any age if caring for a qualifying child), and your spouse must have already filed for their own benefits. If you claim spousal benefits before your full retirement age (FRA), the amount will be permanently reduced—at age 62, you\'d receive approximately 32.5-35% of your spouse\'s benefit instead of the full 50%. Importantly, spousal benefits do not increase beyond your FRA, so there\'s no advantage to delaying past that point. If you\'re eligible for both your own retirement benefit and a spousal benefit, you\'ll automatically receive the higher of the two amounts. The "restricted application" strategy (claiming only spousal benefits while allowing your own benefit to grow) is no longer available except for those born before January 2, 1954. Divorced individuals may still qualify for spousal benefits based on an ex-spouse\'s record if the marriage lasted at least 10 years, they remain unmarried, and both parties are at least 62 years old. For married couples, spousal benefits create important claiming considerations—the higher-earning spouse often benefits from delaying benefits, as this increases not only their own benefit but potentially survivor benefits as well.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does working affect Social Security benefits?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Working while receiving Social Security benefits can affect your payment amount through the "earnings test" if you\'re below your full retirement age (FRA). In 2023, if you\'re under FRA for the entire year, the SSA withholds $1 in benefits for every $2 earned above $21,240. In the year you reach FRA, the threshold increases to $56,520, and the withholding decreases to $1 for every $3 earned above the limit. Once you reach your FRA, the earnings test no longer applies, and you can earn any amount without affecting your current benefits. Importantly, benefits withheld aren\'t permanently lost—once you reach FRA, your monthly benefit amount is recalculated to account for months when benefits were withheld, resulting in a higher monthly payment going forward. Working can also increase your future benefits if your current earnings replace lower-earning years in your top 35 years of indexed earnings. This is particularly beneficial if you have fewer than 35 years of earnings or are now earning significantly more than in past years. Self-employment income counts toward the earnings test, and only gross wages and net self-employment income count—investment income, pensions, and government benefits don\'t. The earnings test creates complex considerations for those contemplating retirement; for many, it may be advantageous to either delay claiming benefits until reaching FRA or to fully retire when beginning benefits.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How are Social Security benefits taxed?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Social Security benefits may be partially taxable depending on your "combined income," which is your adjusted gross income plus nontaxable interest plus half of your Social Security benefits. For individual filers in 2023, if combined income is between $25,000 and $34,000, up to 50% of benefits may be taxable. Above $34,000, up to 85% of benefits may be taxable. For joint filers, the 50% threshold applies to combined income between $32,000 and $44,000, with the 85% threshold applying above $44,000. These income thresholds have remained unchanged since 1984 (for the 50% threshold) and 1994 (for the 85% threshold), meaning inflation has caused more beneficiaries to pay taxes on their benefits over time. Importantly, these percentages don\'t represent your tax rate but rather the portion of benefits subject to your ordinary income tax rate. To estimate benefit taxation, complete the IRS worksheet in Publication 915 or use the online calculators available on financial planning websites. Several strategies can help manage benefit taxation: Consider tax-efficient withdrawal sequencing from various retirement accounts, manage required minimum distributions (RMDs), explore Qualified Charitable Distributions if over 70½, and potentially convert traditional IRA funds to Roth IRAs in lower-income years before claiming Social Security. While 13 states also tax Social Security benefits (Colorado, Connecticut, Kansas, Minnesota, Missouri, Montana, Nebraska, New Mexico, Rhode Island, Utah, Vermont, West Virginia, and North Dakota), most states exempt these benefits from state income tax.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Social Security Calculator | Retirement Benefit Estimator',
  description: 'Calculate potential Social Security benefits, determine optimal claiming age, and analyze retirement income strategies with our comprehensive Social Security calculator.',
  keywords: [
    'social security calculator',
    'retirement benefit estimator',
    'social security claiming strategy',
    'spousal benefit calculator',
    'survivor benefit calculator',
    'social security break-even calculator',
    'retirement planning tool',
    'delayed retirement credits calculator',
    'maximum social security benefit',
    'early retirement reduction calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function SocialSecuritySchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateSocialSecuritySchema('https://calculatorhub.space/calculators/social-security')),
      }}
    />
  );
}