# Batch add SaveCalculationButton to all calculators

$calculators = @(
    "student-loan", "roi", "debt-to-income", "auto-loan", "credit-card",
    "amortization", "annuity", "annuity-payout", "apr", "auto-lease",
    "average-return", "bmi", "bond", "budget", "business-loan",
    "cash-back-interest", "cd", "college-cost", "commission",
    "credit-cards-payoff", "currency-converter", "debt-consolidation",
    "debt-payoff", "depreciation", "discount", "down-payment",
    "estate-tax", "fha-loan", "finance", "future-value",
    "house-affordability", "income-tax", "inflation", "interest",
    "interest-rate", "investment", "irr", "lease", "margin",
    "marriage-tax", "mortgage-payoff", "payback-period", "payment",
    "pension", "personal-loan", "present-value", "real-estate",
    "refinance", "rent", "rent-vs-buy", "repayment", "rmd",
    "roth-ira", "salary", "sales-tax", "simple-interest",
    "social-security", "take-home-paycheck", "temperature",
    "va-mortgage", "vat"
)

$workspaceRoot = "C:\Users\h1893\Downloads\Fiancecl-main\Fiancecl-main"

foreach ($calc in $calculators) {
    $filePath = Join-Path $workspaceRoot "app\calculators\$calc\page.tsx"
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Check if already has SaveCalculationButton
        if ($content -match 'SaveCalculationButton') {
            Write-Host "✓ $calc already has SaveCalculationButton" -ForegroundColor Green
            continue
        }
        
        # Add import after CardFooter import
        if ($content -match '(import \{ Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter \} from "@/components/ui/card")') {
            $content = $content -replace '(import \{ Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter \} from "@/components/ui/card")', 
                "`$1`nimport { SaveCalculationButton } from '@/components/save-calculation-button'"
            
            Write-Host "✓ Added import to $calc" -ForegroundColor Cyan
        } else {
            Write-Host "⚠ Could not find Card import in $calc" -ForegroundColor Yellow
            continue
        }
        
        # Find the closing tags pattern - look for </CardContent></Card> before </section>
        # Add SaveCalculationButton before the closing </Card> tag
        $pattern = '(\s+)(</CardContent>\s+</Card>\s+</div>\s+</div>\s+</div>\s+</section>)'
        if ($content -match $pattern) {
            $replacement = "`$1  `n`$1  {/* TODO: Add SaveCalculationButton here with proper inputs/results */}`n`$1  {/*`n`$1  <SaveCalculationButton`n`$1    calculatorType=`"$calc`"`n`$1    inputs={{}}`n`$1    results={{}}`n`$1  />`n`$1  */}`n`$1</CardContent>`n`$1</Card>`n`$1</div>`n`$1</div>`n`$1</div>`n`$1</section>"
            $content = $content -replace $pattern, $replacement
            
            # Save the file
            Set-Content -Path $filePath -Value $content -NoNewline
            Write-Host "✓ Added placeholder to $calc" -ForegroundColor Green
        } else {
            Write-Host "⚠ Could not find insertion point in $calc" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ File not found: $calc" -ForegroundColor Red
    }
}

Write-Host "`nDone! Review the TODO comments and fill in the actual state variables for each calculator." -ForegroundColor Magenta
