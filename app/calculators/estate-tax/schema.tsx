import { Metadata } from 'next';

// Define the JSON-LD schema for the estate tax calculator
export function generateEstateTaxSchema(url: string) {
  // Use calculatorhub.space as the base URL
  const baseUrl = 'https://calculatorhub.space';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Changed to SoftwareApplication with appropriate subcategory
      {
        '@type': 'SoftwareApplication',
        'name': 'Estate Tax Calculator',
        'description': 'Calculate potential estate tax liability and plan your estate with our comprehensive calculator that analyzes assets, liabilities, and exemptions.',
        'applicationCategory': 'FinanceApplication',
        'applicationSubCategory': 'Calculator',
        'operatingSystem': 'Web browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Complete asset inventory management',
          'Liability calculation',
          'Exemption and charitable giving analysis',
          'Life insurance integration',
          'Federal estate tax estimation',
          'Net distribution calculation',
          'Asset allocation visualization',
          'Estate tax planning strategies',
          'PDF export functionality',
          'Interactive tax impact visualization'
        ],
        'potentialAction': {
          '@type': 'CalculateAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${baseUrl}/calculators/estate-tax`,
            'description': 'Calculate potential estate tax liability and plan your estate'
          },
          'object': {
            '@type': 'FinancialProduct',
            'name': 'Estate Tax Analysis'
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
            'name': 'Estate Tax Calculator',
            'item': `${baseUrl}/calculators/estate-tax`
          }
        ]
      },
      
      // FAQPage schema for the informational content
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is the estate tax and how is it calculated?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The estate tax is a tax on the transfer of property after death. It\'s calculated by determining your gross estate (all assets owned at death), subtracting allowable deductions (debts, funeral expenses, charitable donations, and marital deductions), and then applying the exemption amount ($13.61 million per individual in 2025). Any value exceeding the exemption is taxed at graduated rates, with the top federal rate at 40%. The process involves: 1) Valuing all assets including real estate, financial accounts, businesses, and personal property; 2) Subtracting liabilities and deductions; 3) Applying the lifetime exemption; and 4) Calculating tax on the remaining taxable estate. The resulting tax must typically be paid within nine months of death.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Who needs to pay estate taxes?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'With the 2025 federal exemption of $13.61 million per individual ($27.22 million for married couples using portability), only about 0.2% of U.S. estates pay federal estate tax. You may need to pay estate taxes if: 1) Your net estate exceeds the federal exemption amount; 2) You live in one of the 12 states with separate estate taxes, which often have lower exemptions (ranging from $1 million to matching the federal exemption); 3) You own property in a state with estate taxes, even if you don\'t reside there; or 4) You\'re a non-U.S. citizen with U.S. assets exceeding $60,000. Estate tax filing may be required even if no tax is due, particularly to claim portability of a deceased spouse\'s unused exemption amount.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What estate planning strategies can reduce estate taxes?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Effective strategies to reduce estate taxes include: 1) Annual gifting ($18,000 per recipient in 2025) to remove assets from your estate; 2) Direct payments for medical and educational expenses, which are exempt from gift taxes; 3) Utilizing lifetime exemptions for larger gifts; 4) Creating irrevocable life insurance trusts (ILITs) to keep proceeds outside your estate; 5) Establishing charitable remainder trusts (CRTs) that provide income while benefiting charities; 6) Using grantor retained annuity trusts (GRATs) for appreciating assets; 7) Implementing family limited partnerships (FLPs) with valuation discounts; 8) Creating dynasty trusts to benefit multiple generations; 9) Transferring residence value through qualified personal residence trusts (QPRTs); and 10) For business owners, structuring succession plans with installment payment provisions under Section 6166.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does the marital deduction work for estate taxes?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The unlimited marital deduction allows a spouse to leave any amount of assets to a surviving U.S. citizen spouse with no estate tax due, effectively deferring estate taxes until the second spouse\'s death. To optimize this benefit: 1) Assets must pass outright to the surviving spouse or to a qualifying trust; 2) The deduction doesn\'t apply to non-citizen spouses unless assets transfer to a Qualified Domestic Trust (QDOT); 3) Portability allows the surviving spouse to claim the deceased spouse\'s unused exemption amount by filing Form 706 within 9 months of death (with possible 6-month extension); 4) Combined with proper trust planning, a married couple can effectively double their exemption amount. This deduction represents one of the most powerful estate tax planning tools available to married couples.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What\'s the difference between estate tax and inheritance tax?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Estate and inheritance taxes differ in who pays them and how they\'re calculated. The estate tax is levied on the deceased person\'s estate before assets are distributed to beneficiaries, with the estate itself responsible for paying the tax. In contrast, inheritance tax is paid by the individual beneficiaries who receive assets, with tax rates typically varying based on the beneficiary\'s relationship to the deceased. The federal government only imposes an estate tax, not an inheritance tax. However, six states (Iowa, Kentucky, Maryland, Nebraska, New Jersey, and Pennsylvania) collect inheritance taxes, with exemptions generally higher for close relatives. Maryland is the only state that collects both taxes. These distinctions are important for comprehensive estate planning across state lines.'
            }
          }
        ]
      }
    ]
  };
}

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Estate Tax Calculator | Plan Your Legacy & Tax Liability',
  description: 'Calculate potential estate tax liability and plan your legacy with our comprehensive estate tax calculator that analyzes assets, liabilities, and exemptions.',
  keywords: [
    'estate tax calculator',
    'death tax calculator',
    'estate planning calculator',
    'inheritance tax estimator',
    'estate tax exemption',
    'net estate value',
    'estate tax liability',
    'asset valuation',
    'estate tax planning',
    'charitable giving estate tax'
  ]
};

// Main component to include the JSON-LD schema in the page
export default function EstateTaxSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateEstateTaxSchema('https://calculatorhub.space/calculators/estate-tax')),
      }}
    />
  );
}