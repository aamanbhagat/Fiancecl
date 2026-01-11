# Complete adding SaveCalculationButton to all remaining calculators

$calculators = @(
    @{name='auto-lease'; inputs='vehiclePrice,downPayment,leaseTerm,interestRate'; results='monthlyPayment,totalCost'},
    @{name='bond'; inputs='faceValue,couponRate,maturity'; results='bondPrice,yield'},
    @{name='cd'; inputs='principal,rate,term'; results='maturityValue,totalInterest'},
    @{name='college-cost'; inputs='currentCost,years,inflation'; results='futureCost,savingsNeeded'},
    @{name='debt-consolidation'; inputs='totalDebt,rate,term'; results='monthlyPayment,totalInterest'},
    @{name='down-payment'; inputs='homePrice,downPaymentPercent'; results='downPayment,totalUpfront'},
    @{name='fha-loan'; inputs='homePrice,downPayment,rate'; results='monthlyPayment,totalCost'},
    @{name='income-tax'; inputs='income,status,deductions'; results='tax,effectiveRate'},
    @{name='rent'; inputs='monthlyRent,utilities'; results='totalCost,annualCost'},
    @{name='social-security'; inputs='birthYear,retirementAge'; results='monthlyBenefit,annualBenefit'},
    @{name='va-mortgage'; inputs='homePrice,rate,term'; results='monthlyPayment,totalCost'},
    @{name='annuity-payout'; inputs='principal,rate,years'; results='monthlyPayout,totalPayout'},
    @{name='apr'; inputs='loanAmount,fees,term'; results='apr,totalCost'},
    @{name='average-return'; inputs='initialValue,finalValue,years'; results='averageReturn,cagr'},
    @{name='bmi'; inputs='height,weight'; results='bmi,category'},
    @{name='business-loan'; inputs='loanAmount,rate,term'; results='monthlyPayment,totalCost'},
    @{name='cash-back-interest'; inputs='purchaseAmount,cashBack,apr'; results='netSavings,effectiveRate'},
    @{name='credit-cards-payoff'; inputs='balance,apr,payment'; results='payoffMonths,totalInterest'},
    @{name='currency-converter'; inputs='amount,fromCurrency,toCurrency'; results='convertedAmount,rate'},
    @{name='depreciation'; inputs='cost,salvageValue,years'; results='annualDepreciation,totalDepreciation'},
    @{name='discount'; inputs='originalPrice,discountPercent'; results='finalPrice,savings'},
    @{name='estate-tax'; inputs='estateValue,exemption'; results='taxableAmount,estateTax'},
    @{name='finance'; inputs='amount,rate,term'; results='payment,totalCost'},
    @{name='future-value'; inputs='presentValue,rate,years'; results='futureValue,totalGain'},
    @{name='house-affordability'; inputs='income,debt,downPayment'; results='maxHomePrice,monthlyPayment'},
    @{name='inflation'; inputs='amount,inflationRate,years'; results='futureValue,purchasing Power'},
    @{name='interest'; inputs='principal,rate,time'; results='interest,totalAmount'},
    @{name='interest-rate'; inputs='loanAmount,payment,term'; results='interestRate,totalInterest'},
    @{name='irr'; inputs='cashFlows'; results='irr,npv'},
    @{name='lease'; inputs='assetValue,leaseTerm,rate'; results='monthlyPayment,totalCost'},
    @{name='margin'; inputs='cost,markup'; results='sellingPrice,marginPercent'},
    @{name='marriage-tax'; inputs='income1,income2,status'; results='tax,savings'},
    @{name='mortgage-payoff'; inputs='balance,rate,extraPayment'; results='payoffDate,interestSaved'},
    @{name='payback-period'; inputs='initialInvestment,cashFlows'; results='paybackPeriod,roi'},
    @{name='payment'; inputs='loanAmount,rate,term'; results='monthlyPayment,totalCost'},
    @{name='present-value'; inputs='futureValue,rate,years'; results='presentValue,discount'},
    @{name='real-estate'; inputs='purchasePrice,rentalIncome,expenses'; results='cashFlow,roi'},
    @{name='repayment'; inputs='loanAmount,rate,term'; results='monthlyPayment,totalInterest'},
    @{name='rmd'; inputs='accountBalance,age'; results='rmd,percentageWithdrawn'},
    @{name='take-home-paycheck'; inputs='grossPay,deductions'; results='netPay,takeHome'},
    @{name='temperature'; inputs='value,fromUnit,toUnit'; results='convertedValue'},
    @{name='vat'; inputs='price,vatRate'; results='vatAmount,totalPrice'}
)

$workspaceRoot = "C:\Users\h1893\Downloads\Fiancecl-main\Fiancecl-main"
$successCount = 0
$failCount = 0

foreach ($calc in $calculators) {
    $filePath = Join-Path $workspaceRoot "app\calculators\$($calc.name)\page.tsx"
    
    if (-not (Test-Path $filePath)) {
        Write-Host "⚠ File not found: $($calc.name)" -ForegroundColor Yellow
        $failCount++
        continue
    }
    
    $content = Get-Content $filePath -Raw
    
    # Check if already has SaveCalculationButton component (not just import)
    if ($content -match '<SaveCalculationButton') {
        Write-Host "✓ $($calc.name) already has SaveCalculationButton" -ForegroundColor Green
        $successCount++
        continue
    }
    
    # Add import if not present
    if ($content -notmatch 'SaveCalculationButton') {
        $content = $content -replace '(import \{ Card, CardContent[^}]+\} from "@/components/ui/card")', 
            "`$1`nimport { SaveCalculationButton } from '@/components/save-calculation-button'"
    }
    
    # Add button component before </section>
    # Find the pattern: CardContent> then Card> then closing divs then section
    $pattern = '(\s+)(</CardContent>\s+</Card>\s+</div>\s+</div>\s+</div>\s+</section>)'
    
    if ($content -match $pattern) {
        $buttonCode = @"
`$1  
`$1  <SaveCalculationButton
`$1    calculatorType="$($calc.name)"
`$1    inputs={{}}
`$1    results={{}}
`$1  />
`$1</Card>
`$1</div>
`$1</div>
`$1</div>
`$1</section>
"@
        
        $content = $content -replace $pattern, $buttonCode
        Set-Content -Path $filePath -Value $content -NoNewline
        Write-Host "✓ Added SaveCalculationButton to $($calc.name)" -ForegroundColor Cyan
        $successCount++
    } else {
        Write-Host "⚠ Could not find insertion point in $($calc.name)" -ForegroundColor Yellow
        $failCount++
    }
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "Success: $successCount calculators" -ForegroundColor Green
Write-Host "Failed: $failCount calculators" -ForegroundColor Red
Write-Host "Total: $($successCount + $failCount) / $($calculators.Count)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Magenta
