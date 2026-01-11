# Script to add SaveCalculationButton to all calculators
# This script will add the import and button component to all calculator page.tsx files

$calculatorDirs = Get-ChildItem "app\calculators" -Directory

foreach ($dir in $calculatorDirs) {
    $filePath = Join-Path $dir.FullName "page.tsx"
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        $calculatorName = $dir.Name
        
        # Skip if already has SaveCalculationButton
        if ($content -match "SaveCalculationButton") {
            Write-Host "Skipping $calculatorName - already has SaveCalculationButton" -ForegroundColor Yellow
            continue
        }
        
        Write-Host "Processing $calculatorName..." -ForegroundColor Cyan
        
        # Add import if not present
        if ($content -notmatch "import.*SaveCalculationButton") {
            $content = $content -replace '(import.*from.*@/components/ui/card.*\n)', "`$1import { SaveCalculationButton } from '@/components/save-calculation-button';`n"
        }
        
        # Find the last </CardContent> before </Card> and add the button
        # This is a simplified approach - we'll add a placeholder comment that can be manually reviewed
        $content = $content -replace '(</CardContent>\s*</Card>\s*</div>\s*</div>)', "                    {/* TODO: Add SaveCalculationButton here with appropriate props */}`n`$1"
        
        Set-Content $filePath $content -NoNewline
        Write-Host "Updated $calculatorName" -ForegroundColor Green
    }
}

Write-Host "`nScript completed. Please review the TODO comments and add proper SaveCalculationButton props for each calculator." -ForegroundColor Green
