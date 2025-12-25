import { Metadata } from 'next';

// Define the JSON-LD schema for the simple interest calculator
export function generateSimpleInterestSchema(url: string) {
  // Use calculatorshub.store as the base URL
  const baseUrl = 'https://calculatorshub.store';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Simple Interest Calculator',
        'description': 'Calculate simple interest on loans, investments, and savings with our easy-to-use calculator that shows principal, rate, time, and total interest.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Simple interest calculation',
          'Principal amount estimation',
          'Interest rate determination',
          'Time period calculation',
          'Total payment projection',
          'Daily interest breakdown',
          'Multiple currency support',
          'Loan comparison tools',
          'PDF export functionality',
          'Simple vs compound interest comparison'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/simple-interest`,
            'description': 'Calculate simple interest on loans, investments, and savings'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Simple Interest Analysis'
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
            'name': 'Simple Interest Calculator',
            'item': `${baseUrl}/calculators/simple-interest`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is simple interest and how is it calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Simple interest is a straightforward method of calculating interest where the interest amount is based solely on the principal amount and doesn\'t compound (interest is not charged on previously accrued interest). The formula for calculating simple interest is: I = P × r × t, where I represents the interest amount, P is the principal (the initial amount borrowed or invested), r is the interest rate as a decimal, and t is the time period in years. For example, if you borrow $10,000 at a simple interest rate of 5% for 3 years, the interest would be $10,000 × 0.05 × 3 = $1,500. The total amount to be repaid would be $11,500. Simple interest can be calculated for periods shorter than a year by expressing the time in fractions—for example, 6 months would be 0.5 years. When calculating simple interest daily, the formula becomes: I = P × r × (d/365), where d is the number of days. Simple interest is linear, meaning the interest amount grows at a constant rate over time, unlike compound interest which grows exponentially.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between simple interest and compound interest?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The fundamental difference between simple and compound interest lies in whether interest is calculated on previously earned interest. With simple interest, interest is calculated only on the original principal amount throughout the entire loan or investment period, using the formula I = P × r × t. In contrast, compound interest calculates interest on both the principal and the accumulated interest from previous periods, using the formula A = P(1 + r)^t, where A is the final amount. This difference creates significantly divergent outcomes over time. For example, $10,000 invested at 5% for 20 years would grow to $20,000 with simple interest (an additional $10,000), but to approximately $26,533 with annual compounding (an additional $16,533)—over 65% more interest. The impact of compounding becomes more pronounced with higher interest rates and longer time periods, illustrating why compound interest is often called "interest on interest." While simple interest grows linearly, compound interest grows exponentially, creating the "hockey stick" curve seen in long-term investment growth charts. Simple interest is typically used for short-term loans and certain types of consumer financing, while compound interest is more common in savings accounts, investments, and most long-term debt like mortgages and credit cards.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What types of loans and financial products use simple interest?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Several common financial products use simple interest calculations rather than compound interest. Auto loans typically use simple interest, with each payment first covering the interest due for the period, then reducing the principal balance. Personal loans from banks and credit unions often use simple interest, especially those with fixed terms and regular payment schedules. Many student loans, particularly federal student loans, calculate interest using the simple interest method, though interest may capitalize (be added to the principal) at specific events like the end of deferment periods. Short-term loans like payday loans and some installment loans frequently use simple interest, though their high interest rates can make them expensive despite the simpler calculation method. Bond investments often pay simple interest through regular coupon payments based on the face value. Some mortgages, particularly in countries outside the US, use simple interest calculations. Certificate of Deposit (CD) accounts sometimes use simple interest, particularly shorter-term CDs. Promissory notes between individuals or businesses frequently specify simple interest. Understanding whether a financial product uses simple or compound interest is crucial for accurately comparing costs and returns, as the difference can be substantial over long periods.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How can I minimize interest payments on simple interest loans?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Several strategies can help reduce the total interest paid on simple interest loans. Making larger than required payments is the most direct approach—since simple interest is calculated on the outstanding principal, reducing the principal faster directly reduces future interest. Unlike some compound interest loans, simple interest loans typically don\'t have prepayment penalties, making this strategy particularly effective. Making payments more frequently than required (bi-weekly instead of monthly, for instance) reduces the average principal balance over time, thereby reducing total interest. When possible, shortening the loan term significantly cuts total interest—a 3-year auto loan will cost substantially less in interest than a 5-year loan for the same amount, though monthly payments will be higher. Before taking out a loan, improving your credit score can help secure lower interest rates, directly reducing the total interest paid. Shopping around for the best rates is essential, as different lenders may offer significantly different terms for the same loan type and amount. For existing loans, refinancing when interest rates drop or your credit improves can lead to substantial savings. When making extra payments, ensure they\'re applied to principal reduction rather than future payments—contact your lender to confirm how additional payments are processed, as policies vary.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does simple interest work in different currencies and international finance?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Simple interest calculations remain mathematically identical across different currencies (I = P × r × t), but several important factors come into play in international finance. Interest rates vary significantly between currencies, reflecting economic factors like inflation rates, central bank policies, and country risk premiums. For example, while USD or EUR loans might have rates of 3-6%, loans in developing market currencies might carry rates of 10-20% or higher. When calculating simple interest for international transactions, it\'s crucial to match the currency of the principal with the appropriate interest rate for that currency—using U.S. interest rates for a loan denominated in Brazilian reais would be inaccurate. Foreign exchange fluctuations add another layer of complexity—if you borrow in one currency but your income is in another, exchange rate movements can substantially affect the effective cost of borrowing beyond the stated interest rate. This creates currency risk. Some international loans use variable rates tied to international benchmarks like LIBOR (though being phased out) or its replacements like SOFR, which can change the interest calculations over time. Different countries also have varying practices and legal frameworks regarding interest calculation, compounding periods, and disclosure requirements. These differences make it essential to clearly specify in international loan agreements not just the interest rate but also the calculation method, compounding frequency (if any), day count convention (e.g., actual/365, 30/360), and the currency of both principal and interest payments.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Simple Interest Calculator | Basic Interest Calculation Tool',
  description: 'Calculate simple interest on loans, investments, and savings with our easy-to-use calculator that shows principal, rate, time, and total interest.',
  keywords: [
    'simple interest calculator',
    'interest calculation tool',
    'loan interest calculator',
    'basic interest formula',
    'principal interest calculator',
    'investment interest calculator',
    'interest rate tool',
    'finance calculator',
    'simple interest vs compound interest',
    'interest payment calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function SimpleInterestSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateSimpleInterestSchema('https://calculatorshub.store/calculators/simple-interest')),
      }}
    />
  );
}