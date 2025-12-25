import { Metadata } from 'next';

// Define the JSON-LD schema for the salary calculator
export function generateSalarySchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Salary Calculator',
        'description': 'Calculate take-home pay, compare compensation offers, and analyze salary data with our comprehensive salary calculator.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Gross to net salary calculation',
          'Tax withholding estimation',
          'Hourly to annual wage conversion',
          'Cost of living adjustment analysis',
          'Total compensation valuation',
          'Salary negotiation calculation',
          'Bonus and equity comparison',
          'Retirement contribution optimization',
          'PDF export functionality',
          'Multiple job offer comparison'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/salary`,
            'description': 'Calculate take-home pay and analyze salary information'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Salary Analysis'
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
            'name': 'Salary Calculator',
            'item': `${baseUrl}/calculators/salary`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What\'s the difference between gross salary and net salary?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Gross salary represents your total earnings before any deductions are applied, while net salary (or take-home pay) is the amount you actually receive after all deductions and withholdings. Typical deductions include federal income tax (which varies based on your income level and filing status), state and local income taxes (varying by location), FICA taxes (7.65% covering Social Security at 6.2% and Medicare at 1.45%), retirement plan contributions like 401(k) or 403(b) plans (often 3-10% of salary), health insurance premiums (typically $70-800 monthly depending on coverage), and other benefits like disability insurance, life insurance, flexible spending accounts, or health savings accounts. For example, someone with a $75,000 gross annual salary might have roughly $1,250 (20%) withheld for federal taxes, $375 (6%) for state and local taxes, $478 for FICA, $375 (6%) for retirement contributions, and $250 for health insurance each month, resulting in a monthly net salary of approximately $3,772 or 60% of gross. Understanding this relationship helps with budgeting and financial planning, as your spending capacity is determined by your net rather than gross income.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do I convert an hourly wage to annual salary?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Converting hourly wages to annual salary involves multiplying by the number of hours worked per year. For a standard full-time position, the calculation is: Annual Salary = Hourly Rate × Hours Per Week × 52 Weeks. With a typical 40-hour workweek, the simplified formula becomes: Annual Salary = Hourly Rate × 2,080. For example, a $20 hourly wage translates to $41,600 annually ($20 × 2,080). However, several factors can affect this calculation: 1) Part-time work requires adjusting the weekly hours accordingly; 2) Paid time off policies might maintain the same annual income despite fewer actual working hours; 3) Overtime pay (typically 1.5× regular rate) can significantly increase annual earnings for hourly workers; 4) Seasonal work or irregular schedules require tracking actual hours throughout the year; 5) Unpaid time off will reduce the annual total for hourly workers. When comparing hourly positions to salaried ones, remember to also consider benefits like health insurance, retirement plans, and paid time off, which can represent an additional 25-40% in total compensation value. Conversely, when converting annual salary to hourly rate (useful for comparing offers), divide the annual amount by 2,080 for an equivalent full-time hourly rate.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What strategies work best for negotiating a higher salary?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Effective salary negotiation combines thorough research, strategic timing, and confident communication. Before negotiation, research the market value for your position using resources like Glassdoor, PayScale, or industry reports, accounting for your location, experience level, and specific skills. Timing is crucial—the strongest leverage usually comes either when receiving an initial offer, during annual reviews, or after taking on significant new responsibilities. When negotiating, focus on these proven strategies: 1) Emphasize your unique value and specific contributions rather than personal financial needs; 2) Present competitive offers or market data to support your requested range; 3) Consider the total compensation package including benefits, bonuses, equity, flexible work arrangements, or professional development opportunities; 4) Use silence strategically after stating your request; 5) Practice your talking points ahead of time to project confidence; 6) Frame requests collaboratively rather than adversarially; 7) Be prepared to compromise—identify your "walk away" point and prioritize which benefits matter most; and 8) Get the final agreement in writing. Avoid common mistakes like apologizing for negotiating, accepting the first offer immediately, focusing only on salary rather than the complete package, or making ultimatums. Remember that most employers expect negotiation and typically build room for adjustment into their initial offers.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How should I compare job offers with different compensation structures?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Comparing job offers with different compensation structures requires looking beyond the base salary to evaluate total compensation value and alignment with your personal priorities. Start by calculating the monetary value of each complete package: 1) Base salary - adjusted for location if positions are in different cost-of-living areas; 2) Bonuses and commissions - discounted based on their likelihood and variability; 3) Equity compensation - valued conservatively for private companies, considering vesting schedules; 4) Retirement benefits - particularly employer matching contributions; 5) Health insurance - compare employee premium costs and coverage quality; 6) Other insurance offerings - life, disability, etc.; 7) Paid time off - quantify the value of different vacation policies; 8) Education benefits - tuition reimbursement or professional development budgets; and 9) Other perks like remote work flexibility, child care subsidies, or wellness programs. Beyond monetary value, assess qualitative factors: career advancement opportunities, job security, company culture, work-life balance, commute time, and alignment with your interests. Create a weighted decision matrix that scores each offer on factors that matter most to you. For equity-heavy offers (common in startups), separate the guaranteed compensation from the speculative components, and carefully evaluate vesting schedules and liquidity timelines. Remember that compensation structure often reflects company stage and industry norms—early-stage startups typically offer lower salaries with higher equity, while established companies offer higher salaries with more predictable benefits.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How much does cost of living impact salary across different locations?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Cost of living variations can dramatically impact the real purchasing power of identical salaries across different locations. The difference is often substantial—a $100,000 salary in Austin, Texas would require approximately $160,000-180,000 in San Francisco or New York City to maintain the same standard of living. Housing typically drives the largest differences, with median home prices or rents varying by 300-400% between the most affordable and most expensive U.S. markets. Other significant cost factors include taxes (state income tax ranges from 0% to 13.3%), transportation, healthcare, groceries, utilities, and childcare. When evaluating job opportunities in different locations, use cost of living calculators from sources like NerdWallet, Bankrate, or the Economic Research Institute to make apples-to-apples salary comparisons. However, cost adjustments typically aren\'t perfectly linear—higher-cost areas often feature salary premiums that partially but rarely completely offset increased living expenses, particularly for mid-level positions. Beyond comparing raw numbers, consider location-specific factors like quality of public services, commute times, climate preferences, and proximity to family or social networks. Remote work opportunities have added another dimension, allowing some employees to earn salaries benchmarked to high-cost areas while living in lower-cost regions, though some companies are implementing location-based pay adjustments to account for these differences.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Salary Calculator | Income and Take-Home Pay Estimator',
  description: 'Calculate take-home pay, compare compensation offers, and analyze salary data with our comprehensive salary calculator.',
  keywords: [
    'salary calculator',
    'take-home pay calculator',
    'net salary calculator',
    'salary comparison tool',
    'hourly to salary calculator',
    'income tax estimator',
    'total compensation calculator',
    'salary negotiation calculator',
    'cost of living adjustment calculator',
    'job offer comparison tool'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function SalarySchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateSalarySchema('https://calculatorshub.store/calculators/salary')),
      }}
    />
  );
}