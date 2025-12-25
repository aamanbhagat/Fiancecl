"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, Calendar, TrendingDown, ArrowDown, InfoIcon, CheckCircle, XCircle, AlertTriangle, Activity, Percent, FileText, Receipt, BookOpen, Globe, Settings, ArrowRight, Building } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import DepreciationSchema from './schema';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  ChartTooltip, 
  Legend,
  PointElement,
  LineElement,
  ChartDataLabels
)

interface DepreciationResult {
  year: number
  beginningValue: number
  depreciation: number
  accumulatedDepreciation: number
  endingValue: number
  taxSavings?: number
}

export default function DepreciationCalculator() {
  // Asset Details
  const [assetCost, setAssetCost] = useState<number>(100000)
  const [salvageValue, setSalvageValue] = useState<number>(10000)
  const [usefulLife, setUsefulLife] = useState<number>(5)
  const [depreciationMethod, setDepreciationMethod] = useState<string>("straight-line")
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [includeEndDate, setIncludeEndDate] = useState<boolean>(false)
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [includeTaxRate, setIncludeTaxRate] = useState<boolean>(false)
  const [taxRate, setTaxRate] = useState<number>(21)
  const [unitsProduced, setUnitsProduced] = useState<number>(10000)
  const [estimatedTotalUnits, setEstimatedTotalUnits] = useState<number>(50000)
  const [includeBonus, setIncludeBonus] = useState<boolean>(false)
  const [bonusPercentage, setBonusPercentage] = useState<number>(100)
  const [includeSection179, setIncludeSection179] = useState<boolean>(false)
  const [section179Amount, setSection179Amount] = useState<number>(0)

  // Results State
  const [depreciationSchedule, setDepreciationSchedule] = useState<DepreciationResult[]>([])
  const [totalDepreciation, setTotalDepreciation] = useState<number>(0)
  const [annualDepreciation, setAnnualDepreciation] = useState<number>(0)
  const [totalTaxSavings, setTotalTaxSavings] = useState<number>(0)

  // Calculate depreciation based on selected method
  const calculateDepreciation = () => {
    let schedule: DepreciationResult[] = []
    let depreciableBase = assetCost - salvageValue
    
    if (includeSection179) {
      depreciableBase -= section179Amount
    }
    
    if (includeBonus) {
      const bonusAmount = (depreciableBase * bonusPercentage) / 100
      depreciableBase -= bonusAmount
    }

    switch (depreciationMethod) {
      case "straight-line":
        const annualSLDepreciation = depreciableBase / usefulLife
        for (let year = 1; year <= usefulLife; year++) {
          const beginningValue = year === 1 ? assetCost : schedule[year - 2].endingValue
          const depreciation = annualSLDepreciation
          const accumulatedDepreciation = year === 1 ? depreciation : schedule[year - 2].accumulatedDepreciation + depreciation
          const endingValue = beginningValue - depreciation
          
          schedule.push({
            year,
            beginningValue,
            depreciation,
            accumulatedDepreciation,
            endingValue,
            taxSavings: includeTaxRate ? depreciation * (taxRate / 100) : undefined
          })
        }
        break

      case "declining-balance":
        const rate = 1.5 / usefulLife
        for (let year = 1; year <= usefulLife; year++) {
          const beginningValue = year === 1 ? assetCost : schedule[year - 2].endingValue
          const depreciation = Math.min(
            beginningValue * rate,
            Math.max(0, beginningValue - salvageValue)
          )
          const accumulatedDepreciation = year === 1 ? depreciation : schedule[year - 2].accumulatedDepreciation + depreciation
          const endingValue = beginningValue - depreciation
          
          schedule.push({
            year,
            beginningValue,
            depreciation,
            accumulatedDepreciation,
            endingValue,
            taxSavings: includeTaxRate ? depreciation * (taxRate / 100) : undefined
          })
        }
        break

      case "double-declining":
        const ddbRate = 2 / usefulLife
        for (let year = 1; year <= usefulLife; year++) {
          const beginningValue = year === 1 ? assetCost : schedule[year - 2].endingValue
          const depreciation = Math.min(
            beginningValue * ddbRate,
            Math.max(0, beginningValue - salvageValue)
          )
          const accumulatedDepreciation = year === 1 ? depreciation : schedule[year - 2].accumulatedDepreciation + depreciation
          const endingValue = beginningValue - depreciation
          
          schedule.push({
            year,
            beginningValue,
            depreciation,
            accumulatedDepreciation,
            endingValue,
            taxSavings: includeTaxRate ? depreciation * (taxRate / 100) : undefined
          })
        }
        break

      case "sum-of-years":
        const sumOfYears = (usefulLife * (usefulLife + 1)) / 2
        for (let year = 1; year <= usefulLife; year++) {
          const beginningValue = year === 1 ? assetCost : schedule[year - 2].endingValue
          const depreciation = (depreciableBase * (usefulLife - year + 1)) / sumOfYears
          const accumulatedDepreciation = year === 1 ? depreciation : schedule[year - 2].accumulatedDepreciation + depreciation
          const endingValue = beginningValue - depreciation
          
          schedule.push({
            year,
            beginningValue,
            depreciation,
            accumulatedDepreciation,
            endingValue,
            taxSavings: includeTaxRate ? depreciation * (taxRate / 100) : undefined
          })
        }
        break

      case "units-of-production":
        const depreciationPerUnit = depreciableBase / estimatedTotalUnits
        const yearlyDepreciation = depreciationPerUnit * unitsProduced
        for (let year = 1; year <= usefulLife; year++) {
          const beginningValue = year === 1 ? assetCost : schedule[year - 2].endingValue
          const depreciation = yearlyDepreciation
          const accumulatedDepreciation = year === 1 ? depreciation : schedule[year - 2].accumulatedDepreciation + depreciation
          const endingValue = beginningValue - depreciation
          
          schedule.push({
            year,
            beginningValue,
            depreciation,
            accumulatedDepreciation,
            endingValue,
            taxSavings: includeTaxRate ? depreciation * (taxRate / 100) : undefined
          })
        }
        break
    }

    setDepreciationSchedule(schedule)
    setTotalDepreciation(schedule.reduce((sum, year) => sum + year.depreciation, 0))
    setAnnualDepreciation(schedule[0]?.depreciation || 0)
    setTotalTaxSavings(
      includeTaxRate 
        ? schedule.reduce((sum, year) => sum + (year.taxSavings || 0), 0)
        : 0
    )
  }

  useEffect(() => {
    calculateDepreciation()
  }, [
    assetCost,
    salvageValue,
    usefulLife,
    depreciationMethod,
    startDate,
    endDate,
    taxRate,
    includeTaxRate,
    unitsProduced,
    estimatedTotalUnits,
    includeBonus,
    bonusPercentage,
    includeSection179,
    section179Amount
  ])

  const chartColors = {
    primary: [
      'rgba(99, 102, 241, 0.9)',
      'rgba(59, 130, 246, 0.9)',
      'rgba(14, 165, 233, 0.9)',
      'rgba(6, 182, 212, 0.9)',
      'rgba(20, 184, 166, 0.9)',
    ],
    secondary: [
      'rgba(99, 102, 241, 0.2)',
      'rgba(59, 130, 246, 0.2)',
      'rgba(14, 165, 233, 0.2)',
      'rgba(6, 182, 212, 0.2)',
      'rgba(20, 184, 166, 0.2)',
    ]
  }

  const depreciationChartData = {
    labels: depreciationSchedule.map(item => `Year ${item.year}`),
    datasets: [
      {
        label: 'Asset Value',
        data: depreciationSchedule.map(item => item.endingValue),
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4
      },
      {
        label: 'Accumulated Depreciation',
        data: depreciationSchedule.map(item => item.accumulatedDepreciation),
        borderColor: chartColors.primary[1],
        backgroundColor: chartColors.secondary[1],
        tension: 0.4
      }
    ]
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: function(tickValue: string | number) {
            if (typeof tickValue === 'number') {
              return '$' + tickValue.toLocaleString();
            }
            return tickValue;
          }
        }
      },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' as const }
      }
    }
  }

  const comparisonChartData = {
    labels: ['Straight-Line', 'Declining Balance', 'Double Declining', 'Sum-of-Years', 'Units of Production'],
    datasets: [
      {
        label: 'First Year Depreciation',
        data: [
          (assetCost - salvageValue) / usefulLife,
          (assetCost - salvageValue) * (1.5 / usefulLife),
          (assetCost - salvageValue) * (2 / usefulLife),
          (assetCost - salvageValue) * (usefulLife / ((usefulLife * (usefulLife + 1)) / 2)),
          ((assetCost - salvageValue) / estimatedTotalUnits) * unitsProduced
        ],
        backgroundColor: chartColors.primary,
        borderColor: chartColors.secondary.map(color => color.replace('0.2', '1')),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: function(tickValue: string | number) {
            if (typeof tickValue === 'number') {
              return '$' + tickValue.toLocaleString();
            }
            return tickValue;
          }
        }
      },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' as const }
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' as const },
        formatter: (value: number) => '$' + value.toLocaleString()
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const exportPDF = async () => {
    const element = document.getElementById('results-section')
    if (!element) return

    const pdf = new jsPDF()
    
    pdf.setFontSize(20)
    pdf.text('Depreciation Schedule Report', 20, 20)
    
    pdf.setFontSize(12)
    pdf.text(`Asset Cost: ${formatCurrency(assetCost)}`, 20, 35)
    pdf.text(`Salvage Value: ${formatCurrency(salvageValue)}`, 20, 42)
    pdf.text(`Useful Life: ${usefulLife} years`, 20, 49)
    pdf.text(`Depreciation Method: ${depreciationMethod}`, 20, 56)
    
    const tableData = depreciationSchedule.map(item => [
      item.year,
      formatCurrency(item.beginningValue),
      formatCurrency(item.depreciation),
      formatCurrency(item.accumulatedDepreciation),
      formatCurrency(item.endingValue),
      item.taxSavings ? formatCurrency(item.taxSavings) : 'N/A'
    ])
    
    const headers = [
      ['Year', 'Beginning Value', 'Depreciation', 'Accumulated', 'Ending Value', 'Tax Savings']
    ]
    
    autoTable(pdf, {
      head: headers,
      body: tableData,
      startY: 70,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [99, 102, 241] }
    })
    
    pdf.save('depreciation-schedule.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <DepreciationSchema />
      <main className="flex-1">
      <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Depreciation <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate asset depreciation using various methods and understand the financial impact over time.
      </p>
    </div>
  </div>
</section>

        <section className="py-12">
          <div className="container max-w-[1200px] px-6 mx-auto">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Enter Asset Details</CardTitle>
                    <CardDescription>
                      Provide information about the asset and preferred depreciation method.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Asset Information</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="asset-cost">Asset Cost</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="asset-cost"
                              type="number"
                              className="pl-9"
                              value={assetCost}
                              onChange={(e) => setAssetCost(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="salvage-value">Salvage Value</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="salvage-value"
                              type="number"
                              className="pl-9"
                              value={salvageValue}
                              onChange={(e) => setSalvageValue(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="useful-life">Useful Life (Years)</Label>
                          <Input
                            id="useful-life"
                            type="number"
                            value={usefulLife}
                            onChange={(e) => setUsefulLife(Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="depreciation-method">Depreciation Method</Label>
                          <Select 
                            value={depreciationMethod} 
                            onValueChange={setDepreciationMethod}
                          >
                            <SelectTrigger id="depreciation-method">
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="straight-line">Straight-Line</SelectItem>
                              <SelectItem value="declining-balance">Declining Balance</SelectItem>
                              <SelectItem value="double-declining">Double Declining Balance</SelectItem>
                              <SelectItem value="sum-of-years">Sum-of-Years' Digits</SelectItem>
                              <SelectItem value="units-of-production">Units of Production</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Additional Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="start-date">Start Date</Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="include-end-date">Include End Date</Label>
                            <Switch
                              id="include-end-date"
                              checked={includeEndDate}
                              onCheckedChange={setIncludeEndDate}
                            />
                          </div>
                          {includeEndDate && (
                            <Input
                              id="end-date"
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                            />
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="include-tax">Include Tax Rate</Label>
                            <Switch
                              id="include-tax"
                              checked={includeTaxRate}
                              onCheckedChange={setIncludeTaxRate}
                            />
                          </div>
                          {includeTaxRate && (
                            <div className="relative">
                              <Input
                                id="tax-rate"
                                type="number"
                                value={taxRate}
                                onChange={(e) => setTaxRate(Number(e.target.value))}
                                className="pr-8"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                %
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {depreciationMethod === "units-of-production" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Units of Production Details</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="units-produced">Units Produced (Annual)</Label>
                            <Input
                              id="units-produced"
                              type="number"
                              value={unitsProduced}
                              onChange={(e) => setUnitsProduced(Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="estimated-total-units">Estimated Total Units</Label>
                            <Input
                              id="estimated-total-units"
                              type="number"
                              value={estimatedTotalUnits}
                              onChange={(e) => setEstimatedTotalUnits(Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Tax Benefits</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="include-bonus">Include Bonus Depreciation</Label>
                            <Switch
                              id="include-bonus"
                              checked={includeBonus}
                              onCheckedChange={setIncludeBonus}
                            />
                          </div>
                          {includeBonus && (
                            <div className="relative">
                              <Input
                                id="bonus-percentage"
                                type="number"
                                value={bonusPercentage}
                                onChange={(e) => setBonusPercentage(Number(e.target.value))}
                                className="pr-8"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                %
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="include-section-179">Include Section 179</Label>
                            <Switch
                              id="include-section-179"
                              checked={includeSection179}
                              onCheckedChange={setIncludeSection179}
                            />
                          </div>
                          {includeSection179 && (
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="section-179-amount"
                                type="number"
                                className="pl-9"
                                value={section179Amount}
                                onChange={(e) => setSection179Amount(Number(e.target.value))}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div id="results-section" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Results</CardTitle>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" onClick={exportPDF}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Export as PDF</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Annual Depreciation</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(annualDepreciation)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Total Depreciation</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalDepreciation)}</p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="schedule" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="chart">Chart</TabsTrigger>
                        <TabsTrigger value="comparison">Comparison</TabsTrigger>
                      </TabsList>

                      <TabsContent value="schedule" className="space-y-4">
                        <div className="rounded-lg border">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b bg-muted/50">
                                  <th className="p-2 text-left font-medium">Year</th>
                                  <th className="p-2 text-left font-medium">Beginning Value</th>
                                  <th className="p-2 text-left font-medium">Depreciation</th>
                                  <th className="p-2 text-left font-medium">Ending Value</th>
                                  {includeTaxRate && (
                                    <th className="p-2 text-left font-medium">Tax Savings</th>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {depreciationSchedule.map((item) => (
                                  <tr key={item.year} className="border-b">
                                    <td className="p-2">{item.year}</td>
                                    <td className="p-2">{formatCurrency(item.beginningValue)}</td>
                                    <td className="p-2">{formatCurrency(item.depreciation)}</td>
                                    <td className="p-2">{formatCurrency(item.endingValue)}</td>
                                    {includeTaxRate && item.taxSavings && (
                                      <td className="p-2">{formatCurrency(item.taxSavings)}</td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="chart" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={depreciationChartData} options={lineChartOptions} />
                        </div>
                      </TabsContent>

                      <TabsContent value="comparison" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={comparisonChartData} options={barChartOptions} />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                          First year depreciation comparison across different methods
                        </p>
                      </TabsContent>
                    </Tabs>

                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Depreciation Summary</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Depreciable Amount: {formatCurrency(assetCost - salvageValue)}</li>
                              <li>• Annual Depreciation: {formatCurrency(annualDepreciation)}</li>
                              {includeTaxRate && (
                                <li>• Total Tax Savings: {formatCurrency(totalTaxSavings)}</li>
                              )}
                              {includeBonus && (
                                <li>• Bonus Depreciation: {formatCurrency((assetCost - salvageValue) * (bonusPercentage / 100))}</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>


        {/* Blog Section */}
<section id="blog-section" className="py-12 bg-white dark:bg-black">
  <div className="container mx-auto max-w-5xl px-4">
    <div className="flex items-center justify-between mb-8">
      <div className="flex-1 text-center">
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Business Essentials</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Understanding Depreciation: A Complete Guide</h2>
        <p className="mt-3 text-muted-foreground text-lg">Master the concepts of asset value decline and its financial implications</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            The Fundamentals of Depreciation
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                <strong>Depreciation</strong> is the systematic allocation of an asset's cost over its useful life. It represents how the value of an asset decreases over time due to factors such as wear and tear, obsolescence, or the passage of time.
              </p>
              <p className="mt-3">
                For businesses, depreciation is not just an accounting concept—it's a crucial financial planning tool that impacts tax obligations, financial statements, and capital expenditure decisions. A depreciation calculator helps businesses and individuals accurately track and plan for this inevitable decline in asset value.
              </p>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Key Assets Subject to Depreciation</h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                  <li>• Buildings and real estate improvements</li>
                  <li>• Machinery and equipment</li>
                  <li>• Vehicles and transportation equipment</li>
                  <li>• Office furniture and fixtures</li>
                  <li>• Technology and computer systems</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Asset Value Over Time</h3>
                <div className="h-[200px]">
                  <Line 
                    data={{
                      labels: ['Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
                      datasets: [
                        {
                          label: 'Book Value',
                          data: [100000, 80000, 60000, 40000, 20000, 0],
                          borderColor: 'rgba(59, 130, 246, 0.8)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.1
                        },
                        {
                          label: 'Accumulated Depreciation',
                          data: [0, 20000, 40000, 60000, 80000, 100000],
                          borderColor: 'rgba(239, 68, 68, 0.8)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          tension: 0.1
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { callback: (value) => '$' + value.toLocaleString() }
                        }
                      },
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">Example of straight-line depreciation for a $100,000 asset over 5 years</p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Important Note:</strong> Depreciation is a non-cash expense. While it reduces reported profits on paper, it doesn't represent an actual cash outflow from the business. This is why it's added back when calculating cash flow.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <Calculator className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="mt-3 text-lg font-semibold text-blue-800 dark:text-blue-300">Tax Planning</h3>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    Optimize tax deductions by properly calculating depreciation expenses
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-300">Financial Reporting</h3>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    Accurately represent asset values on financial statements
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <h3 className="mt-3 text-lg font-semibold text-purple-800 dark:text-purple-300">Investment Analysis</h3>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                    Evaluate the true cost and return on capital expenditures
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Depreciation Methods */}
      <div className="mb-10" id="depreciation-methods">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Common Depreciation Methods
        </h2>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDown className="h-5 w-5 text-blue-600" />
              Straight-Line Depreciation
            </CardTitle>
            <CardDescription>The simplest and most widely used method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-4">
                  Straight-line depreciation allocates an equal expense amount to each year of the asset's useful life. It's straightforward to calculate and understand, making it the most commonly used method.
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="mb-2 font-medium text-blue-700 dark:text-blue-400">Formula:</p>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded font-mono text-sm">
                    <div>Annual Depreciation = (Cost - Salvage Value) ÷ Useful Life</div>
                  </div>
                  
                  <p className="mt-4 mb-2 font-medium text-blue-700 dark:text-blue-400">Example:</p>
                  <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-500">
                    <li><strong>Asset Cost:</strong> $50,000</li>
                    <li><strong>Salvage Value:</strong> $5,000</li>
                    <li><strong>Useful Life:</strong> 5 years</li>
                    <li><strong>Annual Depreciation:</strong> ($50,000 - $5,000) ÷ 5 = $9,000 per year</li>
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <InfoIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Best used for assets that lose value evenly over time or when simplicity is preferred for accounting purposes.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="h-[240px]">
                  <p className="text-center text-sm font-medium mb-2">Straight-Line Depreciation Chart</p>
                  <Bar 
                    data={{
                      labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
                      datasets: [
                        {
                          label: 'Annual Depreciation',
                          data: [9000, 9000, 9000, 9000, 9000],
                          backgroundColor: 'rgba(59, 130, 246, 0.7)',
                          borderWidth: 1
                        },
                        {
                          label: 'Remaining Book Value',
                          data: [41000, 32000, 23000, 14000, 5000],
                          backgroundColor: 'rgba(14, 165, 233, 0.7)',
                          borderWidth: 1
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { callback: (value) => '$' + value.toLocaleString() }
                        }
                      },
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }}
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <p className="font-medium">Advantages:</p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Simple to calculate and understand</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Provides consistent expense recognition</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Easy to forecast and budget</span>
                    </li>
                  </ul>
                  
                  <p className="font-medium mt-2">Limitations:</p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Doesn't reflect higher usage in early years</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>May not match actual pattern of value decline</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-600" />
              Declining Balance Methods
            </CardTitle>
            <CardDescription>Accelerated depreciation for faster write-offs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-4">
                  Declining balance methods apply a fixed percentage to the remaining book value each year, resulting in higher depreciation expenses in the early years and lower expenses in later years.
                </p>
                
                <div className="space-y-4">
                  <div className="p-3 border border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Double Declining Balance (DDB)</h4>
                    <p className="text-sm text-green-700 dark:text-green-400 mb-2">
                      Applies a rate twice the straight-line rate to the remaining book value.
                    </p>
                    <div className="p-3 bg-white dark:bg-gray-900 rounded font-mono text-sm">
                      <div>Rate = 2 × (1 ÷ Useful Life)</div>
                      <div>Annual Depreciation = Book Value × Rate</div>
                    </div>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      Example: For a 5-year asset, the rate would be 2 × (1 ÷ 5) = 40% of remaining value each year.
                    </p>
                  </div>
                  
                  <div className="p-3 border border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">150% Declining Balance</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      A less aggressive version that uses 1.5 times the straight-line rate. This offers a middle ground between straight-line and double declining balance methods.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Often, businesses using declining balance methods switch to straight-line depreciation in later years when straight-line would yield a higher depreciation amount.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="h-[240px]">
                  <p className="text-center text-sm font-medium mb-2">Double Declining Balance vs. Straight-Line</p>
                  <Line 
                    data={{
                      labels: ['Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
                      datasets: [
                        {
                          label: 'Straight-Line Book Value',
                          data: [50000, 41000, 32000, 23000, 14000, 5000],
                          borderColor: 'rgba(59, 130, 246, 0.8)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        },
                        {
                          label: 'Double Declining Book Value',
                          data: [50000, 30000, 18000, 10800, 6480, 5000],
                          borderColor: 'rgba(16, 185, 129, 0.8)',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { callback: (value) => '$' + value.toLocaleString() }
                        }
                      },
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }}
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <p className="font-medium">Best For:</p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Assets that lose value quickly in early years</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Technology equipment prone to obsolescence</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Businesses seeking to maximize early tax deductions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Units of Production
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Units of Production method ties depreciation to actual usage rather than time. This makes it ideal for assets whose wear and tear correlates directly with how much they're used.
              </p>

              <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">How It Works</h4>
                <p className="text-sm text-purple-700 dark:text-purple-400 mb-2">
                  Depreciation is calculated based on the units produced relative to the total expected lifetime production.
                </p>
                <div className="p-3 bg-white dark:bg-gray-900 rounded font-mono text-sm">
                  <div>Depreciation per Unit = (Cost - Salvage) ÷ Total Lifetime Units</div>
                  <div>Annual Depreciation = Units Produced × Depreciation per Unit</div>
                </div>
              </div>
              
              <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">Example Application</h4>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  A machine costs $100,000, with an estimated lifetime output of 500,000 units and $10,000 salvage value.
                </p>
                <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-400 mt-2">
                  <li>Depreciation per unit: ($100,000 - $10,000) ÷ 500,000 = $0.18 per unit</li>
                  <li>If 80,000 units are produced in Year 1: $0.18 × 80,000 = $14,400 depreciation</li>
                </ul>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Best for:</strong> Manufacturing equipment, vehicles based on mileage, or any asset where usage directly correlates with value reduction.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-blue-600" />
                Sum-of-the-Years'-Digits (SYD)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                SYD is another accelerated depreciation method that uses a fraction based on the remaining useful life to calculate each year's depreciation.
              </p>

              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">How to Calculate SYD</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-blue-700 dark:text-blue-400">1. Calculate the sum of years: For a 5-year asset, SYD = 5+4+3+2+1 = 15</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">2. For each year, use the fraction: (Remaining Life ÷ SYD)</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">3. Apply this fraction to the depreciable cost</p>
                  </div>
                </div>
                
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs bg-blue-50 dark:bg-blue-900/30">
                      <tr>
                        <th className="px-3 py-2">Year</th>
                        <th className="px-3 py-2">Fraction</th>
                        <th className="px-3 py-2">Calculation</th>
                        <th className="px-3 py-2">Depreciation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700">
                        <td className="px-3 py-2">1</td>
                        <td className="px-3 py-2">5/15</td>
                        <td className="px-3 py-2">$45,000 × (5/15)</td>
                        <td className="px-3 py-2">$15,000</td>
                      </tr>
                      <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <td className="px-3 py-2">2</td>
                        <td className="px-3 py-2">4/15</td>
                        <td className="px-3 py-2">$45,000 × (4/15)</td>
                        <td className="px-3 py-2">$12,000</td>
                      </tr>
                      <tr className="border-b dark:border-gray-700">
                        <td className="px-3 py-2">3</td>
                        <td className="px-3 py-2">3/15</td>
                        <td className="px-3 py-2">$45,000 × (3/15)</td>
                        <td className="px-3 py-2">$9,000</td>
                      </tr>
                      <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <td className="px-3 py-2">4</td>
                        <td className="px-3 py-2">2/15</td>
                        <td className="px-3 py-2">$45,000 × (2/15)</td>
                        <td className="px-3 py-2">$6,000</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">5</td>
                        <td className="px-3 py-2">1/15</td>
                        <td className="px-3 py-2">$45,000 × (1/15)</td>
                        <td className="px-3 py-2">$3,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Advantage:</strong> Provides accelerated depreciation but in a more gradual pattern than double-declining balance, making it useful for assets that lose value quickly but not as dramatically as those best suited for DDB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tax and Accounting Implications */}
      <div className="mb-10" id="tax-accounting-implications">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">Tax and Accounting Implications</span>
              </div>
            </CardTitle>
            <CardDescription>
              Understanding the financial impact of depreciation methods
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 id="tax-implications" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Tax Depreciation vs. Book Depreciation
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p>
                    Many businesses maintain two separate depreciation schedules: one for financial reporting (book) and another for tax purposes. This allows them to optimize both their financial statements and tax benefits.
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Key Differences:</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Book Depreciation:</strong> Focuses on matching expense recognition with the actual pattern of asset usage and value reduction</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Receipt className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Tax Depreciation:</strong> Follows IRS rules like MACRS (Modified Accelerated Cost Recovery System) designed to provide standardized depreciation periods and methods</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      <strong>Strategic Planning:</strong> Businesses often prefer accelerated depreciation methods for tax purposes to maximize early tax deductions, while using straight-line for financial reporting to show more stable profits.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Tax Depreciation Systems</h4>
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <h5 className="font-medium">MACRS (U.S. Tax System)</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        The Modified Accelerated Cost Recovery System is the current tax depreciation system in the United States. It assigns assets to specific classes with predetermined recovery periods.
                      </p>
                      
                      <div className="mt-3 space-y-1 text-sm">
                        <p><strong>Common MACRS Recovery Periods:</strong></p>
                        <ul className="list-disc list-inside">
                          <li>3-year property: Certain manufacturing tools</li>
                          <li>5-year property: Computers, office equipment, cars</li>
                          <li>7-year property: Office furniture, most manufacturing equipment</li>
                          <li>27.5-year property: Residential rental properties</li>
                          <li>39-year property: Commercial buildings</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        <strong>Section 179 Deduction:</strong> This allows businesses to deduct the full purchase price of qualifying equipment in the year it's placed in service, rather than depreciating it over time. Limits apply ($1,160,000 for 2023).
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <InfoIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        <strong>Bonus Depreciation:</strong> Through 2022, 100% bonus depreciation allowed businesses to deduct the full cost of eligible assets. This percentage decreases by 20% each year until 2027 (80% in 2023, 60% in 2024, etc.).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="financial-statements" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Impact on Financial Statements
                </h3>
                <p>
                  Depreciation significantly affects three key financial statements, influencing how investors, lenders, and other stakeholders perceive a company's financial health.
                </p>
                
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Income Statement</h4>
                    <p className="text-sm mt-1 text-blue-600 dark:text-blue-500">
                      Depreciation is recorded as an expense, reducing reported net income. Higher depreciation in early years (using accelerated methods) means lower taxable income but also lower reported profits.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Balance Sheet</h4>
                    <p className="text-sm mt-1 text-blue-600 dark:text-blue-500">
                      Assets are recorded at their original cost less accumulated depreciation, showing as a net book value. As depreciation accumulates over time, the book value of assets on the balance sheet decreases.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Cash Flow Statement</h4>
                    <p className="text-sm mt-1 text-blue-600 dark:text-blue-500">
                      Depreciation is a non-cash expense, so it's added back to net income when calculating operating cash flow. This is why companies with significant depreciation often show higher cash flow than profit.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Financial Ratios Affected</h4>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Return on Assets (ROA)</span>
                        <span className="font-medium text-red-500">Decreases</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Asset Turnover Ratio</span>
                        <span className="font-medium text-green-500">Increases</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Debt-to-Equity Ratio</span>
                        <span className="font-medium">Changes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Operating Cash Flow Ratio</span>
                        <span className="font-medium text-green-500">Increases</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="international-standards" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  International Accounting Standards
                </h3>
                <p>
                  International Financial Reporting Standards (IFRS) and Generally Accepted Accounting Principles (GAAP) have some key differences in their depreciation approaches.
                </p>
                
                <div className="mt-4 space-y-4">
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">GAAP (US Standard)</h4>
                    <ul className="text-sm mt-2 space-y-1">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>Asset cost is depreciated over estimated useful life</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>Component accounting is permitted but not required</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>Revaluation of assets is not allowed</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">IFRS (International Standard)</h4>
                    <ul className="text-sm mt-2 space-y-1">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>Component accounting is required (depreciate significant parts separately)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>Periodic review of residual value, useful life, and method is required</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>Allows revaluation of assets to fair market value</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        <strong>Cross-Border Business Consideration:</strong> Companies operating internationally may need to maintain parallel depreciation records to comply with different accounting standards.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Using Depreciation Calculators */}
      <div className="mb-10" id="using-calculators">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Using Depreciation Calculators Effectively
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Essential Calculator Functions</CardTitle>
              <CardDescription>
                Key features to look for in a depreciation calculator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4 text-blue-600" />
                  Multiple Depreciation Methods
                </h4>
                <p className="text-sm text-muted-foreground">
                  Choose calculators that support various methods including straight-line, declining balance, sum-of-the-years'-digits, and units of production.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Partial Year Calculations
                </h4>
                <p className="text-sm text-muted-foreground">
                  For assets placed in service mid-year, look for calculators that can handle partial periods accurately.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Schedule Generation
                </h4>
                <p className="text-sm text-muted-foreground">
                  The ability to generate complete depreciation schedules showing book value, accumulated depreciation, and expense for each period.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-blue-600" />
                  Tax System Support
                </h4>
                <p className="text-sm text-muted-foreground">
                  Support for tax-specific systems like MACRS (US), Capital Cost Allowance (Canada), or other country-specific depreciation rules.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Common Calculation Scenarios</CardTitle>
              <CardDescription>
                Practical situations where depreciation calculators prove valuable
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Capital Expenditure Analysis
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the impact of new equipment purchases on financial statements and tax obligations to make informed investment decisions.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  Budget Preparation
                </h4>
                <p className="text-sm text-muted-foreground">
                  Project future depreciation expenses for more accurate financial planning and forecasting.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-green-600" />
                  Tax Planning
                </h4>
                <p className="text-sm text-muted-foreground">
                  Compare different depreciation methods to find the optimal approach for minimizing tax liability while maintaining appropriate financial reporting.
                </p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 mt-4">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Pro Tip:</strong> When comparing equipment lease vs. purchase decisions, use the depreciation calculator to understand the long-term accounting and tax implications of ownership compared to lease expenses.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
              <CardTitle className="text-blue-800 dark:text-blue-300">Step-by-Step Depreciation Calculation Guide</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <ol className="space-y-4 list-decimal list-inside">
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Gather asset information</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Collect details including purchase cost, expected useful life, estimated salvage value, and date placed in service.
                      </p>
                    </li>
                    
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Select the appropriate depreciation method</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Consider the asset type, accounting needs, and tax objectives when choosing between straight-line, declining balance, or other methods.
                      </p>
                    </li>
                    
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Input values into the calculator</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Enter the asset cost, salvage value, useful life, and other relevant parameters specific to your chosen method.
                      </p>
                    </li>
                  </ol>
                </div>
                
                <div>
                  <ol className="space-y-4 list-decimal list-inside" start={4}>
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Generate and review the depreciation schedule</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Examine the year-by-year breakdown of depreciation expense, accumulated depreciation, and remaining book value.
                      </p>
                    </li>
                    
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Compare different scenarios</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Run multiple calculations with different methods to compare their impact on financial statements and tax obligations.
                      </p>
                    </li>
                    
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Update for changes</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Revisit calculations if there are changes in asset use, expected life, or improvements that affect the asset's value.
                      </p>
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conclusion Section */}
      <div id="conclusion">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Mastering Depreciation Management
            </CardTitle>
            <CardDescription>
              Key takeaways for effective asset value tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Depreciation</strong> is more than an accounting concept—it's a strategic tool that impacts financial reporting, tax planning, and business decision-making. By understanding the various depreciation methods and using calculators effectively, businesses can optimize their financial position while complying with reporting requirements.
            </p>
            
            <p className="mt-4" id="key-lessons">
              As you implement depreciation strategies, keep these key principles in mind:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">For Financial Reporting</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Choose methods that best reflect the actual pattern of asset value decline</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Regularly review asset useful life and salvage value assumptions</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Consider component accounting for complex assets with different lifespans</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">For Tax Planning</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Explore accelerated methods to maximize early tax deductions</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Stay informed about tax incentives like Section 179 and bonus depreciation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Maintain robust documentation to support your chosen recovery periods</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to optimize your asset management?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Depreciation Calculator</strong> above to create accurate depreciation schedules for your assets! For more financial tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/asset-roi">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Asset ROI Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/business-valuation">
                        <Building className="h-4 w-4 mr-1" />
                        Business Valuation
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/lease-vs-buy">
                        <Calculator className="h-4 w-4 mr-1" />
                        Lease vs. Buy Analysis
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</section>

        <section className="py-12 bg-muted/30">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Related Calculators</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Asset ROI Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate the return on investment for your business assets.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/roi">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Business Loan Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate payments and total cost for business financing options.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/business-loan">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Tax Savings Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Estimate your tax savings from business deductions and credits.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/tax-savings">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}