import { Metadata } from 'next';

// Define the JSON-LD schema for the BMI calculator
export function generateBmiSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'BMI Calculator',
        'description': 'Calculate your Body Mass Index (BMI) to assess if your weight is healthy for your height, and understand what your BMI results mean.',
        'applicationCategory': 'HealthApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'BMI calculation in metric and imperial units',
          'Weight classification assessment',
          'Health risk evaluation',
          'Personalized recommendations',
          'BMI history tracking',
          'Healthy weight range calculator',
          'Visual BMI category chart',
          'Age and gender considerations',
          'Mobile-friendly interface',
          'PDF report generation'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/bmi`,
            'description': 'Calculate your Body Mass Index (BMI)'
          },
          'object': {
            '@type': 'HealthTopic',
            'name': 'Body Mass Index'
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
            'name': 'BMI Calculator',
            'item': `${baseUrl}/calculators/bmi`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How is BMI calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'BMI (Body Mass Index) is calculated by dividing your weight in kilograms by the square of your height in meters: BMI = weight(kg) / [height(m)]². In imperial units, the formula is: BMI = [weight(lbs) / height(inches)²] × 703. For example, a person weighing 70kg with a height of 1.75m would have a BMI of 22.9. BMI is a screening tool that categorizes individuals as underweight (< 18.5), normal weight (18.5-24.9), overweight (25-29.9), or obese (≥ 30).'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are the limitations of BMI?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'BMI has several limitations: it doesn\'t distinguish between fat, muscle, or bone mass, potentially misclassifying muscular athletes as overweight; it doesn\'t account for fat distribution (abdominal fat carries higher health risks); it may not be appropriate for children, pregnant women, the elderly, or certain ethnic groups with different body compositions; and it doesn\'t directly measure body fat percentage. For a comprehensive health assessment, BMI should be considered alongside other metrics like waist circumference, body fat percentage, and lifestyle factors.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are healthy BMI ranges for different populations?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'While the standard BMI categories apply to most adults regardless of gender, age, or ethnicity, some populations have different healthy ranges. For Asian adults, overweight may be defined as BMI ≥ 23 rather than 25, reflecting increased health risks at lower BMIs. For older adults (>65 years), a slightly higher BMI (23-28) may be beneficial. Children and teens use age and sex-specific percentiles rather than fixed numbers. Pregnant women should not use BMI for weight assessment. Athletic individuals with high muscle mass may have elevated BMIs despite healthy body fat levels.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How can I lower my BMI safely?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'To lower your BMI safely, focus on gradual, sustainable changes: aim for 1-2 pounds of weight loss per week through a moderate calorie deficit (500-1000 calories/day less than maintenance); adopt a balanced diet rich in fruits, vegetables, lean proteins, and whole grains while limiting processed foods and added sugars; engage in at least 150 minutes of moderate aerobic activity weekly plus strength training 2-3 times per week; monitor portions and practice mindful eating; stay hydrated and get adequate sleep; and consider working with healthcare professionals for personalized guidance, especially for BMIs over 30 or under 18.5.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What health risks are associated with different BMI categories?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Different BMI categories correlate with varying health risks: Underweight (BMI < 18.5) increases risk of malnutrition, weakened immune system, bone loss, anemia, and fertility issues. Normal weight (BMI 18.5-24.9) generally has the lowest health risks. Overweight (BMI 25-29.9) moderately increases risk of heart disease, type 2 diabetes, high blood pressure, and certain cancers. Obesity (BMI 30-39.9) significantly increases these risks plus sleep apnea, fatty liver disease, osteoarthritis, and stroke. Severe obesity (BMI ≥ 40) presents very high risks of all these conditions plus respiratory problems, mobility issues, and reduced life expectancy.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'BMI Calculator | Body Mass Index Health Assessment Tool',
  description: 'Calculate your Body Mass Index (BMI) with our free calculator to determine if your weight is healthy for your height and get personalized health insights.',
  keywords: [
    'BMI calculator',
    'body mass index calculator',
    'weight calculator',
    'healthy weight calculator',
    'BMI chart',
    'weight classification tool',
    'obesity calculator',
    'BMI health assessment',
    'weight-to-height ratio',
    'ideal weight calculator'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function BmiSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateBmiSchema('https://calculatorhub.space/calculators/bmi')),
      }}
    />
  );
}