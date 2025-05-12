import { Metadata } from 'next';

// Define the JSON-LD schema for the college cost calculator
export function generateCollegeCostSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'College Cost Calculator',
        'description': 'Calculate and project total college expenses, financial aid options, and student loan repayment plans to make informed educational financing decisions.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'College expense breakdown',
          'Financial aid integration',
          'Multi-year cost projections',
          'Loan repayment analysis',
          'Inflation adjustment',
          'Customizable program details',
          'Interactive cost visualizations',
          'Return on investment analysis',
          'PDF export functionality',
          'Living arrangement comparison'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/college-cost`,
            'description': 'Calculate college expenses and financial aid options'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'College Education Financing'
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
            'name': 'College Cost Calculator',
            'item': `${baseUrl}/calculators/college-cost`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is included in the total cost of college attendance?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The complete cost of attendance includes direct expenses charged by the institution (tuition, mandatory fees, room and board) and indirect expenses (books and supplies, transportation, personal expenses, technology costs). These components vary by institution and student situation. For example, living on-campus versus with family significantly impacts housing costs. Additionally, hidden costs like academic fees, social participation, healthcare, and travel during breaks can add 30-50% to published tuition figures. Understanding all components is essential for accurate financial planning.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between sticker price and net price for college?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Sticker price refers to the published total cost of attendance, while net price represents what students actually pay after subtracting financial aid (grants, scholarships, and other gift aid that doesn\'t require repayment). The difference can be substantial—according to the College Board, the average student at a private university receives approximately $21,000 in grant aid and tax benefits annually. Net price varies significantly based on family income and student qualifications, with lower-income families often qualifying for substantial aid that dramatically reduces out-of-pocket costs. Always compare net prices rather than sticker prices when evaluating affordability.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does the financial aid process work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The financial aid process begins with submitting the Free Application for Federal Student Aid (FAFSA) as early as October 1st of senior year. Many selective institutions also require the CSS Profile for institutional aid consideration. Based on these forms, colleges calculate your Expected Family Contribution (EFC) and create a financial aid package that may include grants, scholarships, work-study opportunities, and loans. Aid packages vary significantly between institutions, with need-based aid addressing financial circumstances and merit-based aid rewarding academic, artistic, or athletic achievements. After receiving offers, students can appeal or negotiate aid packages, especially if financial circumstances have changed.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Is college worth the investment?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'College ROI varies substantially based on factors like major, institution, cost, and graduation timeline. On average, bachelor\'s degree holders earn approximately $1.2 million more over their lifetime compared to high school graduates. However, this varies dramatically by field of study—STEM and business degrees typically yield higher financial returns than humanities. When evaluating worth, consider: 1) Your specific degree\'s earning potential versus its cost; 2) Student loan debt relative to expected starting salary (ideally below 100%); 3) Non-financial benefits like career satisfaction, professional network development, and personal growth; and 4) Graduation rates and post-graduate outcomes at specific institutions you\'re considering.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What strategies can reduce college costs?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Effective cost-reduction strategies include: 1) AP and dual enrollment credits to potentially graduate early and save $15,000-$30,000; 2) Community college transfer pathways to complete general education requirements at lower cost; 3) Applying to "financial safety" schools where your academic profile exceeds average admitted students to maximize merit aid; 4) Negotiating financial aid using competing offers; 5) Regional exchange programs that reduce out-of-state tuition; 6) Graduating on time or early by following a detailed academic plan—each additional semester costs $15,000+ at private universities; 7) Exploring alternative housing and meal plan options; and 8) Using textbook alternatives like rentals, used books, or open educational resources to save $500-$1,000 annually.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'College Cost Calculator | Estimate Education Expenses',
  description: 'Plan your college finances with our comprehensive calculator that estimates total costs, financial aid, and student loan repayment projections.',
  keywords: [
    'college cost calculator',
    'education expense estimator',
    'financial aid calculator',
    'student loan repayment',
    'college ROI calculator',
    'university cost comparison',
    'net price calculator',
    'college budget planner',
    'education investment calculator',
    'college savings estimator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function CollegeCostSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateCollegeCostSchema('https://calculatorhub.space/calculators/college-cost')),
      }}
    />
  );
}