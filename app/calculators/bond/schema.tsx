import { Metadata } from 'next';

// Define the JSON-LD schema for the bond calculator
export function generateBondSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Bond Calculator',
        'description': 'Calculate bond prices, yields, duration, and other key metrics to evaluate fixed-income investments and manage interest rate risk.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Bond price calculation',
          'Yield to maturity calculation',
          'Current yield calculation',
          'Duration and modified duration',
          'Convexity measurement',
          'Interest rate sensitivity analysis',
          'Bond valuation under different scenarios',
          'Coupon payment schedule',
          'Premium/discount visualization',
          'PDF export functionality'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/bond`,
            'description': 'Calculate bond prices, yields, and duration metrics'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Fixed Income Bonds'
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
            'name': 'Bond Calculator',
            'item': `${baseUrl}/calculators/bond`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is the relationship between bond prices and interest rates?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Bond prices and interest rates have an inverse relationship—when market interest rates rise, existing bond prices fall, and vice versa. This occurs because new bonds will be issued with higher coupon rates when market rates increase, making existing bonds with lower coupons less attractive unless their prices decrease. For example, if you hold a 3% coupon bond and market rates rise to 4%, your bond\'s value will decrease to compensate buyers for the lower coupon. This relationship is quantified by metrics like duration, which indicates price sensitivity to rate changes.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between current yield and yield to maturity?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Current yield is a simple calculation that divides the annual coupon payment by the bond\'s current market price (Annual Coupon/Bond Price), providing a snapshot of income relative to investment. Yield to maturity (YTM) is more comprehensive, calculating the total return expected if the bond is held until maturity, including coupon payments, capital gains/losses from price changes, and the time value of money. For example, a $950 bond with a $1,000 face value and $50 annual coupon has a current yield of 5.26% ($50/$950) but a higher YTM that accounts for the $50 gain at maturity.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is bond duration and why is it important?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Duration is a key risk measure that estimates a bond\'s price sensitivity to interest rate changes, expressed in years. Specifically, modified duration indicates the approximate percentage change in a bond\'s price for a 1% change in interest rates. For example, a bond with a modified duration of 5 would be expected to decrease in value by approximately 5% if interest rates rise by 1%, or increase by 5% if rates fall by 1%. Longer-term bonds typically have higher durations, making them more volatile when rates change. Investors use duration to assess risk and immunize portfolios against interest rate movements.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What does it mean when a bond trades at a premium or discount?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'A bond trades at a premium when its price is higher than its face value, typically because its coupon rate exceeds current market interest rates. Conversely, a bond trades at a discount when its price is below face value, usually because its coupon rate is lower than market rates. For example, a $1,000 face value bond with a 5% coupon might trade for $1,050 (premium) when market rates drop to 4%, or $950 (discount) if rates rise to 6%. Premium bonds offer higher current income but lower yields to maturity, while discount bonds provide capital appreciation opportunity but less current income.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do credit ratings affect bond pricing and yields?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Credit ratings significantly impact bond pricing through risk premiums. Bonds with high ratings (AAA, AA) from agencies like Moody\'s or S&P are considered safer investments and therefore command lower yields. Lower-rated bonds (BB, B, CCC) must offer higher yields to compensate investors for increased default risk. This yield difference is called the credit spread. For instance, if a 10-year Treasury bond yields 3%, an AAA-rated corporate bond might yield 3.5% (0.5% spread), while a BB-rated "junk" bond could yield 6% (3% spread). As a bond\'s credit rating changes, its price adjusts to align with the appropriate yield for its new risk level.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Bond Calculator | Calculate Bond Prices, Yields & Duration',
  description: 'Calculate bond prices, yields, durations, and analyze interest rate sensitivity with our comprehensive bond calculator for fixed-income investment analysis.',
  keywords: [
    'bond calculator',
    'bond yield calculator',
    'bond price calculator',
    'yield to maturity calculator',
    'bond duration calculator',
    'fixed income calculator',
    'convexity calculator',
    'interest rate sensitivity',
    'bond valuation tool',
    'current yield calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function BondSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateBondSchema('https://calculatorhub.space/calculators/bond')),
      }}
    />
  );
}