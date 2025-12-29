export interface RelatedCalculator {
  name: string
  slug: string
  description: string
  icon: string
}

export const relatedCalculatorsMap: Record<string, RelatedCalculator[]> = {
  'mortgage': [
    { name: 'House Affordability', slug: 'house-affordability', description: 'See how much house you can afford', icon: '🏠' },
    { name: 'Mortgage Payoff', slug: 'mortgage-payoff', description: 'Calculate early payoff savings', icon: '💰' },
    { name: 'Refinance', slug: 'refinance', description: 'Should you refinance?', icon: '🔄' },
    { name: 'Down Payment', slug: 'down-payment', description: 'Calculate down payment needed', icon: '💵' }
  ],
  'house-affordability': [
    { name: 'Mortgage', slug: 'mortgage', description: 'Calculate monthly payments', icon: '🏡' },
    { name: 'Rent vs Buy', slug: 'rent-vs-buy', description: 'Compare renting and buying', icon: '⚖️' },
    { name: 'Down Payment', slug: 'down-payment', description: 'Plan your down payment', icon: '💵' },
    { name: 'Property Tax', slug: 'real-estate', description: 'Estimate property costs', icon: '📊' }
  ],
  '401k': [
    { name: 'Retirement', slug: 'pension', description: 'Plan your retirement income', icon: '🏖️' },
    { name: 'Roth IRA', slug: 'roth-ira', description: 'Compare Roth IRA benefits', icon: '💎' },
    { name: 'Social Security', slug: 'social-security', description: 'Estimate SS benefits', icon: '👴' },
    { name: 'Compound Interest', slug: 'compound-interest', description: 'See growth over time', icon: '📈' }
  ],
  'compound-interest': [
    { name: 'Savings', slug: 'savings', description: 'Plan your savings goals', icon: '🏦' },
    { name: 'Investment', slug: 'investment', description: 'Investment growth calculator', icon: '📊' },
    { name: '401(k)', slug: '401k', description: 'Retirement savings planner', icon: '💼' },
    { name: 'CD Calculator', slug: 'cd', description: 'Certificate of Deposit returns', icon: '💿' }
  ],
  'auto-loan': [
    { name: 'Auto Lease', slug: 'auto-lease', description: 'Compare leasing costs', icon: '🚗' },
    { name: 'Payment', slug: 'payment', description: 'Calculate loan payments', icon: '💳' },
    { name: 'Credit Card', slug: 'credit-card', description: 'Credit card payoff plan', icon: '💳' },
    { name: 'Personal Loan', slug: 'personal-loan', description: 'Personal loan calculator', icon: '💵' }
  ],
  'credit-card': [
    { name: 'Credit Cards Payoff', slug: 'credit-cards-payoff', description: 'Pay off multiple cards', icon: '💳' },
    { name: 'Debt Payoff', slug: 'debt-payoff', description: 'Debt elimination plan', icon: '🎯' },
    { name: 'Debt Consolidation', slug: 'debt-consolidation', description: 'Consolidate your debts', icon: '🔄' },
    { name: 'APR', slug: 'apr', description: 'Calculate true APR', icon: '📊' }
  ],
  'student-loan': [
    { name: 'Personal Loan', slug: 'personal-loan', description: 'Personal loan options', icon: '💰' },
    { name: 'Debt Payoff', slug: 'debt-payoff', description: 'Plan debt elimination', icon: '🎯' },
    { name: 'Repayment', slug: 'repayment', description: 'Loan repayment schedule', icon: '📅' },
    { name: 'College Cost', slug: 'college-cost', description: 'Plan education expenses', icon: '🎓' }
  ],
  'income-tax': [
    { name: 'Salary', slug: 'salary', description: 'Salary breakdown', icon: '💵' },
    { name: 'Take-Home Pay', slug: 'take-home-paycheck', description: 'Calculate net income', icon: '💰' },
    { name: 'Sales Tax', slug: 'sales-tax', description: 'Sales tax calculator', icon: '🛒' },
    { name: 'Estate Tax', slug: 'estate-tax', description: 'Estate tax planning', icon: '🏛️' }
  ],
  'investment': [
    { name: 'ROI', slug: 'roi', description: 'Return on investment', icon: '📈' },
    { name: 'Compound Interest', slug: 'compound-interest', description: 'Growth over time', icon: '💹' },
    { name: 'Savings', slug: 'savings', description: 'Savings planner', icon: '🏦' },
    { name: 'Bond', slug: 'bond', description: 'Bond calculator', icon: '📜' }
  ],
  'refinance': [
    { name: 'Mortgage', slug: 'mortgage', description: 'Mortgage calculator', icon: '🏠' },
    { name: 'Mortgage Payoff', slug: 'mortgage-payoff', description: 'Early payoff calculator', icon: '💰' },
    { name: 'Amortization', slug: 'amortization', description: 'Payment breakdown', icon: '📊' },
    { name: 'Home Equity', slug: 'real-estate', description: 'Home equity calculator', icon: '🏡' }
  ],
  'savings': [
    { name: 'Compound Interest', slug: 'compound-interest', description: 'See compound growth', icon: '📈' },
    { name: 'CD Calculator', slug: 'cd', description: 'CD returns', icon: '💿' },
    { name: 'Investment', slug: 'investment', description: 'Investment calculator', icon: '📊' },
    { name: 'Budget', slug: 'budget', description: 'Budget planner', icon: '💰' }
  ],
  'budget': [
    { name: 'Savings', slug: 'savings', description: 'Savings calculator', icon: '🏦' },
    { name: 'Debt to Income', slug: 'debt-to-income', description: 'DTI ratio calculator', icon: '📊' },
    { name: 'Salary', slug: 'salary', description: 'Salary calculator', icon: '💵' },
    { name: 'Expense Tracking', slug: 'discount', description: 'Track expenses', icon: '📝' }
  ],
  'personal-loan': [
    { name: 'Auto Loan', slug: 'auto-loan', description: 'Auto financing', icon: '🚗' },
    { name: 'Student Loan', slug: 'student-loan', description: 'Student loan calculator', icon: '🎓' },
    { name: 'Debt Consolidation', slug: 'debt-consolidation', description: 'Consolidate debts', icon: '🔄' },
    { name: 'APR', slug: 'apr', description: 'Calculate APR', icon: '📊' }
  ],
  'roth-ira': [
    { name: '401(k)', slug: '401k', description: '401(k) calculator', icon: '💼' },
    { name: 'Retirement', slug: 'pension', description: 'Retirement planner', icon: '🏖️' },
    { name: 'RMD', slug: 'rmd', description: 'Required distributions', icon: '📅' },
    { name: 'Social Security', slug: 'social-security', description: 'SS benefits', icon: '👴' }
  ]
}

export function getRelatedCalculators(currentSlug: string): RelatedCalculator[] {
  return relatedCalculatorsMap[currentSlug] || []
}
