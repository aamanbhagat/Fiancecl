# Adding SaveCalculationButton to Calculators

This guide shows how to add the save calculation feature to any calculator.

## Quick Steps

### 1. Add Import
At the top of your calculator's `page.tsx`, add:

```tsx
import { SaveCalculationButton } from '@/components/save-calculation-button';
```

### 2. Add the Button Component
Place this before the closing `</CardContent></Card>` tags in your results section:

```tsx
<SaveCalculationButton
  calculatorType="calculator-name-here"
  inputs={{
    // Add all your input state variables here
    inputValue1,
    inputValue2,
    // etc...
  }}
  results={{
    // Add all your calculated result variables here
    result1,
    result2,
    // etc...
  }}
/>
```

## Example: Compound Interest Calculator

```tsx
// 1. Add import at top
import { SaveCalculationButton } from '@/components/save-calculation-button';

// 2. In your JSX, before </CardContent></Card>:
<SaveCalculationButton
  calculatorType="compound-interest"
  inputs={{
    principal,
    rate,
    time,
    frequency,
  }}
  results={{
    finalAmount,
    totalInterest,
    monthlyBreakdown,
  }}
/>
```

## Calculator Type Names

Use kebab-case for calculator types:
- `401k` → "401k"
- `compound-interest` → "compound-interest" 
- `debt-to-income` → "debt-to-income"
- `mortgage` → "mortgage"
- etc.

## What Happens

- **Non-logged users**: See "Sign In to Save Calculation" button → redirected to auth page
- **Logged users**: See "Save This Calculation" button → saves to database
- **After save**: Shows "Saved Successfully!" message

## Already Implemented

✅ Mortgage Calculator (`app/calculators/mortgage/page.tsx`)

## To Do

Add SaveCalculationButton to remaining 64 calculators.

## Need Help?

The component is fully reusable. Just pass your calculator's input values and calculated results as props.
