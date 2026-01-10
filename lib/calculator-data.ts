export type Calculator = {
    name: string
    slug: string
    description: string
    popular?: boolean
}

export type Category = {
    name: string
    slug: string
    description: string
    calculators: Calculator[]
}

export const calculatorCategories: Category[] = [
    {
        name: "Home & Real Estate",
        slug: "home",
        description: "Calculate mortgage payments, affordability, and refinancing savings.",
        calculators: [
            { name: "Mortgage Calculator", slug: "mortgage", description: "Calculate monthly mortgage payments", popular: true },
            { name: "House Affordability", slug: "house-affordability", description: "See how much house you can afford", popular: true },
            { name: "Amortization Calculator", slug: "amortization", description: "View loan amortization schedule" },
            { name: "Rent vs Buy", slug: "rent-vs-buy", description: "Compare renting vs buying", popular: true },
            { name: "Refinance Calculator", slug: "refinance", description: "Should you refinance your mortgage?" },
            { name: "Down Payment", slug: "down-payment", description: "Calculate down payment needed" },
            { name: "Mortgage Payoff", slug: "mortgage-payoff", description: "Calculate early payoff savings" },
            { name: "FHA Loan", slug: "fha-loan", description: "FHA loan calculator" },
            { name: "VA Mortgage", slug: "va-mortgage", description: "VA loan calculator" },
            { name: "Real Estate", slug: "real-estate", description: "Real estate investment analysis" },
            { name: "Rent Calculator", slug: "rent", description: "Estimate rental costs" },
        ]
    },
    {
        name: "Investment",
        slug: "investment",
        description: "Project returns, compound interest, and investment growth.",
        calculators: [
            { name: "Investment Calculator", slug: "investment", description: "Project investment returns over time", popular: true },
            { name: "Compound Interest", slug: "compound-interest", description: "See how compound interest grows money", popular: true },
            { name: "ROI Calculator", slug: "roi", description: "Return on investment calculator", popular: true },
            { name: "Bond Calculator", slug: "bond", description: "Calculate bond yields" },
            { name: "CD Calculator", slug: "cd", description: "Calculate Certificate of Deposit returns" },
            { name: "Simple Interest", slug: "simple-interest", description: "Calculate simple interest" },
            { name: "Future Value", slug: "future-value", description: "Calculate future value of money" },
            { name: "Present Value", slug: "present-value", description: "Calculate present value of money" },
            { name: "IRR Calculator", slug: "irr", description: "Internal Rate of Return" },
            { name: "Average Return", slug: "average-return", description: "Calculate average rate of return" },
            { name: "Inflation Calculator", slug: "inflation", description: "Calculate inflation impact" },
            { name: "Interest Calculator", slug: "interest", description: "General interest calculator" },
        ]
    },
    {
        name: "Retirement",
        slug: "retirement",
        description: "Plan for retirement with 401(k), IRA, and social security tools.",
        calculators: [
            { name: "401(k) Calculator", slug: "401k", description: "Plan your 401(k) retirement savings", popular: true },
            { name: "Retirement Planner", slug: "pension", description: "Plan retirement income", popular: true },
            { name: "Roth IRA", slug: "roth-ira", description: "Compare Roth IRA benefits", popular: true },
            { name: "Social Security", slug: "social-security", description: "Estimate SS benefits" },
            { name: "RMD Calculator", slug: "rmd", description: "Required Minimum Distributions" },
            { name: "Annuity Calculator", slug: "annuity", description: "Calculate annuity payments" },
            { name: "Annuity Payout", slug: "annuity-payout", description: "Estimate annuity income" },
        ]
    },
    {
        name: "Loans & Debt",
        slug: "debt",
        description: "Manage debt, calculate loan payments, and plan payoffs.",
        calculators: [
            { name: "Loan Calculator", slug: "loan", description: "General loan payment calculator", popular: true },
            { name: "Credit Card Payoff", slug: "credit-card", description: "Calculate credit card payoff time", popular: true },
            { name: "Debt Payoff", slug: "debt-payoff", description: "Snowball vs Avalanche payoff planner", popular: true },
            { name: "Debt Consolidation", slug: "debt-consolidation", description: "Should you consolidate debt?" },
            { name: "Debt to Income", slug: "debt-to-income", description: "Calculate DTI ratio" },
            { name: "Student Loan", slug: "student-loan", description: "Student loan repayment calculator" },
            { name: "Personal Loan", slug: "personal-loan", description: "Personal loan payment calculator" },
            { name: "APR Calculator", slug: "apr", description: "Calculate true Annual Percentage Rate" },
            { name: "Payback Period", slug: "payback-period", description: "Calculate investment payback period" },
            { name: "Credit Cards Payoff", slug: "credit-cards-payoff", description: "Pay off multiple credit cards" },
            { name: "Payment Calculator", slug: "payment", description: "Monthly payment calculator" },
            { name: "Repayment Calculator", slug: "repayment", description: "Loan repayment schedule" },
        ]
    },
    {
        name: "Taxes & Income",
        slug: "tax",
        description: "Estimate taxes, salary, and take-home pay.",
        calculators: [
            { name: "Income Tax", slug: "income-tax", description: "Estimate federal and state income tax", popular: true },
            { name: "Salary Calculator", slug: "salary", description: "Convert salary to hourly/weekly/monthly", popular: true },
            { name: "Take-Home Pay", slug: "take-home-paycheck", description: "Calculate net pay after deductions", popular: true },
            { name: "Sales Tax", slug: "sales-tax", description: "Calculate sales tax" },
            { name: "VAT Calculator", slug: "vat", description: "Value Added Tax calculator" },
            { name: "Estate Tax", slug: "estate-tax", description: "Estimate estate taxes" },
            { name: "Marriage Tax", slug: "marriage-tax", description: "Marriage tax penalty calculator" },
        ]
    },
    {
        name: "Auto",
        slug: "auto",
        description: "Calculate car loans, leases, and depreciation.",
        calculators: [
            { name: "Auto Loan", slug: "auto-loan", description: "Calculate car loan payments", popular: true },
            { name: "Auto Lease", slug: "auto-lease", description: "Lease vs Buy analysis" },
            { name: "Depreciation", slug: "depreciation", description: "Calculate asset depreciation" },
            { name: "Lease Calculator", slug: "lease", description: "General lease calculator" },
        ]
    },
    {
        name: "Business",
        slug: "business",
        description: "Tools for business planning and financial analysis.",
        calculators: [
            { name: "Business Loan", slug: "business-loan", description: "Calculate business loan payments" },
            { name: "Margin Calculator", slug: "margin", description: "Calculate profit margins" },
            { name: "Commission Calculator", slug: "commission", description: "Calculate sales commission" },
        ]
    },
    {
        name: "Education",
        slug: "education",
        description: "Plan for college costs and education expenses.",
        calculators: [
            { name: "College Cost", slug: "college-cost", description: "Plan for education expenses" },
        ]
    },
    {
        name: "Personal & Health",
        slug: "personal",
        description: "Everyday financial tools and health calculators.",
        calculators: [
            { name: "Budget Calculator", slug: "budget", description: "Personal budget planner", popular: true },
            { name: "Savings Calculator", slug: "savings", description: "Plan your savings goals", popular: true },
            { name: "BMI Calculator", slug: "bmi", description: "Body Mass Index calculator", popular: true },
            { name: "Currency Converter", slug: "currency-converter", description: "Real-time currency exchange" },
            { name: "Discount Calculator", slug: "discount", description: "Calculate sale discounts" },
            { name: "Cash Back Interest", slug: "cash-back-interest", description: "Calculate cash back returns" },
            { name: "General Finance", slug: "finance", description: "General financial calculator" },
            { name: "Temperature", slug: "temperature", description: "Convert temperature units" },
        ]
    }
]

export function getCategoryBySlug(slug: string): Category | undefined {
    return calculatorCategories.find(c => c.slug === slug)
}

export function getAllCalculators(): Calculator[] {
    return calculatorCategories.flatMap(c => c.calculators)
}

export function getPopularCalculators(): Calculator[] {
    return getAllCalculators().filter(c => c.popular)
}
