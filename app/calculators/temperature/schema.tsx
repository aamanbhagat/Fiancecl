import { Metadata } from 'next';

// Define the JSON-LD schema for the temperature calculator
export function generateTemperatureSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Temperature Converter Calculator',
        'description': 'Convert between Celsius, Fahrenheit, Kelvin, and other temperature scales with our comprehensive temperature calculator that includes reference points and scientific conversions.',
        'applicationCategory': 'UtilityApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Celsius to Fahrenheit conversion',
          'Fahrenheit to Celsius conversion',
          'Kelvin conversions',
          'Rankine scale support',
          'Multiple temperature units',
          'Scientific precision settings',
          'Temperature reference points',
          'Batch conversion capability',
          'PDF export functionality',
          'Historical temperature scale support'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/temperature`,
            'description': 'Convert between different temperature scales and units'
          },
          'object': {
            '@type': 'Thing',
            'name': 'Temperature Conversion'
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
            'name': 'Temperature Calculator',
            'item': `${baseUrl}/calculators/temperature`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How do you convert between Celsius and Fahrenheit?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Converting between Celsius and Fahrenheit involves specific formulas to account for their different zero points and scale intervals. To convert from Celsius to Fahrenheit, use the formula: °F = (°C × 9/5) + 32. For example, to convert 20°C to Fahrenheit: (20 × 9/5) + 32 = 36 + 32 = 68°F. To convert from Fahrenheit to Celsius, use the formula: °C = (°F - 32) × 5/9. For example, to convert 68°F to Celsius: (68 - 32) × 5/9 = 36 × 5/9 = 20°C. Some helpful reference points to remember: 0°C equals 32°F (freezing point of water), 100°C equals 212°F (boiling point of water at sea level), and -40°C equals -40°F (the point where both scales meet). For quick mental approximations when converting Fahrenheit to Celsius, you can subtract 30 from the Fahrenheit temperature and then divide by 2. This gives a rough estimate that\'s typically within a few degrees of the exact conversion. For Celsius to Fahrenheit, you can double the Celsius temperature and add 30. While not precise, these mental shortcuts can be useful for everyday situations when you need a general idea of the temperature in the other scale.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is the Kelvin temperature scale and how is it used?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The Kelvin temperature scale is the SI (International System of Units) base unit for temperature, used primarily in scientific contexts. Unlike Celsius and Fahrenheit, Kelvin is an absolute temperature scale with 0 Kelvin (0K) representing absolute zero—the theoretical lowest possible temperature where particles have minimal thermal motion. The Kelvin scale uses the same increment size as Celsius, meaning a one-degree change in Celsius equals a one-Kelvin change. Converting between Celsius and Kelvin is straightforward: K = °C + 273.15, and °C = K - 273.15. For reference, room temperature is approximately 293-298K (20-25°C), water freezes at 273.15K, and water boils at 373.15K at standard pressure. Scientists prefer the Kelvin scale because it eliminates negative temperature values and simplifies many physical laws and equations. For example, the ideal gas law (PV = nRT) uses Kelvin for temperature, and many thermodynamic calculations become more straightforward. In astronomy and physics, the Kelvin scale is essential for calculating black body radiation, star temperatures, and cosmic microwave background radiation. While rarely used in everyday contexts, understanding the Kelvin scale is crucial for scientific literacy and advanced temperature-related calculations.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are some other temperature scales beyond Celsius, Fahrenheit, and Kelvin?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Several lesser-known temperature scales exist beyond the commonly used Celsius, Fahrenheit, and Kelvin scales. The Rankine scale (°R), developed by Scottish engineer William Rankine in 1859, is an absolute temperature scale like Kelvin but uses Fahrenheit-sized degrees. Absolute zero is 0°R, and the freezing point of water is 491.67°R. To convert from Rankine to Fahrenheit: °F = °R - 459.67. The Réaumur scale (°Ré), created in 1730 by French scientist René Antoine Ferchault de Réaumur, sets water\'s freezing point at 0°Ré and boiling point at 80°Ré. Though rarely used today, it historically appeared in French and German cooking recipes. The Delisle scale (°D), invented by French astronomer Joseph-Nicolas Delisle in 1732, uniquely decreases as temperature increases, with water\'s boiling point at 0°D and freezing point at 150°D. The Rømer scale, created by Danish astronomer Ole Rømer in 1701, places water\'s freezing point at 7.5°Rø and boiling at 60°Rø. The Newton scale (°N), developed by Isaac Newton around 1700, sets water\'s freezing at 0°N and body temperature at 12°N. These historical scales, while scientifically valid, have been largely supplanted by Celsius, Fahrenheit, and Kelvin in modern applications, though they occasionally appear in historical scientific literature or specialized contexts.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do negative temperatures work, and can anything be colder than absolute zero?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Negative temperatures function differently depending on the temperature scale. In Celsius and Fahrenheit, negative values simply indicate temperatures below the zero point of that particular scale—these are common in winter weather and refrigeration. For example, -10°C represents a temperature 10 degrees below the freezing point of water. However, in absolute temperature scales like Kelvin, the zero point represents absolute zero—the theoretical lowest possible temperature where particles have minimal thermal motion. According to the Third Law of Thermodynamics, it\'s impossible to reach exactly absolute zero, though scientists have achieved temperatures within billionths of a degree above it. Absolute zero cannot be surpassed in the conventional sense—nothing can be "colder than absolute zero." However, in certain quantum systems, physicists have created what are called "negative absolute temperatures," which aren\'t actually colder than absolute zero but represent a special state where higher energy levels have greater population than lower ones—essentially an "inverted" energy distribution. These systems are actually hotter than any positive temperature system, not colder. Temperature is fundamentally a measure of the average kinetic energy of particles in a system, so the concept of "temperature" breaks down when approaching the quantum realm near absolute zero, where quantum effects dominate over classical thermodynamics.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does altitude affect water\'s boiling point and temperature measurements?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Altitude significantly affects water\'s boiling point due to changes in atmospheric pressure. At sea level, water boils at 100°C (212°F) under standard pressure (1 atmosphere or 101.325 kPa). As elevation increases, atmospheric pressure decreases, causing water to boil at progressively lower temperatures. For every 500 feet (152.4 meters) increase in elevation, water\'s boiling point decreases by approximately 0.5°C (0.9°F). At 5,000 feet (1,524 meters), water boils around 95°C (203°F), and at 10,000 feet (3,048 meters), it boils near 90°C (194°F). This phenomenon explains why cooking times must be extended at high altitudes—the lower boiling temperature means food cooks less efficiently in boiling water. For precise scientific work, this effect necessitates adjustments to temperature measurements and experimental protocols. Traditional mercury thermometers remain accurate at different elevations since they measure the thermal expansion of mercury, which isn\'t pressure-dependent. However, thermometers calibrated using water\'s phase transitions (like traditional century thermometers) require correction factors at different altitudes. Modern electronic thermometers are typically unaffected by altitude for normal temperature ranges. Pressure cookers counteract this effect by increasing pressure above atmospheric levels, raising water\'s boiling point and enabling more efficient cooking at high elevations.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Temperature Calculator | Temperature Conversion Tool',
  description: 'Convert between Celsius, Fahrenheit, Kelvin, and other temperature scales with our comprehensive temperature calculator that includes reference points and scientific conversions.',
  keywords: [
    'temperature calculator',
    'temperature converter',
    'celsius to fahrenheit calculator',
    'fahrenheit to celsius converter',
    'kelvin conversion tool',
    'temperature scale converter',
    'temperature unit calculator',
    'scientific temperature calculator',
    'rankine temperature conversion',
    'temperature reference points'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function TemperatureSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateTemperatureSchema('https://calculatorhub.space/calculators/temperature')),
      }}
    />
  );
}