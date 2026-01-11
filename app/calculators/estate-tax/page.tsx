"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { SaveCalculationButton } from '@/components/save-calculation-button'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  Building, DollarSign, Car, Briefcase, PiggyBank, CreditCard, 
  Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, 
  TrendingUp, LineChart, Home, Landmark, Gem, Scale, Info, Wallet, Minus, Percent, FileText, AlertCircle, Gift, Heart, Users, GraduationCap, LandPlot, Lightbulb, FileEdit, FilePlus, CheckCircle, Clock, Banknote, History, MapPin
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Pie, Bar, Line } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import EstateTaxSchema from './schema';

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

interface AssetCategory {
  name: string
  value: number
  icon: React.ElementType
}

interface Liability {
  name: string
  value: number
  icon: React.ElementType
}

export default function EstateCalculator() {
  // Asset Categories
  const [realEstate, setRealEstate] = useState<AssetCategory[]>([
    { name: "Primary Residence", value: 500000, icon: Home },
    { name: "Vacation Home", value: 250000, icon: Building },
    { name: "Investment Properties", value: 300000, icon: Landmark }
  ])

  const [financialAssets, setFinancialAssets] = useState<AssetCategory[]>([
    { name: "Bank Accounts", value: 100000, icon: DollarSign },
    { name: "Investment Portfolio", value: 250000, icon: TrendingUp },
    { name: "Retirement Accounts", value: 400000, icon: PiggyBank }
  ])

  const [personalProperty, setPersonalProperty] = useState<AssetCategory[]>([
    { name: "Vehicles", value: 50000, icon: Car },
    { name: "Jewelry & Art", value: 75000, icon: Gem },
    { name: "Other Valuables", value: 25000, icon: Briefcase }
  ])

  // Liabilities
  const [liabilities, setLiabilities] = useState<Liability[]>([
    { name: "Mortgages", value: 400000, icon: Home },
    { name: "Car Loans", value: 30000, icon: Car },
    { name: "Credit Card Debt", value: 15000, icon: CreditCard },
    { name: "Other Debts", value: 25000, icon: DollarSign }
  ])

  // Estate Planning Parameters
  const [estateTaxRate, setEstateTaxRate] = useState(40)
  const [exemptionAmount, setExemptionAmount] = useState(12920000) // 2023 federal estate tax exemption
  const [charitableGiving, setCharitableGiving] = useState(100000)
  const [includeLifeInsurance, setIncludeLifeInsurance] = useState(true)
  const [lifeInsuranceValue, setLifeInsuranceValue] = useState(500000)

  // Calculated Values
  const [totalAssets, setTotalAssets] = useState(0)
  const [totalLiabilities, setTotalLiabilities] = useState(0)
  const [netEstateValue, setNetEstateValue] = useState(0)
  const [taxableEstate, setTaxableEstate] = useState(0)
  const [estateTaxLiability, setEstateTaxLiability] = useState(0)
  const [netDistribution, setNetDistribution] = useState(0)

  // Calculate totals whenever inputs change
  useEffect(() => {
    // Calculate total assets
    const realEstateTotal = realEstate.reduce((sum, asset) => sum + asset.value, 0)
    const financialTotal = financialAssets.reduce((sum, asset) => sum + asset.value, 0)
    const personalTotal = personalProperty.reduce((sum, asset) => sum + asset.value, 0)
    const assetsTotal = realEstateTotal + financialTotal + personalTotal + 
      (includeLifeInsurance ? lifeInsuranceValue : 0)
    
    // Calculate total liabilities
    const liabilitiesTotal = liabilities.reduce((sum, liability) => sum + liability.value, 0)
    
    // Calculate net estate value
    const netEstate = assetsTotal - liabilitiesTotal
    
    // Calculate taxable estate value (after charitable giving and exemption)
    const taxable = Math.max(0, netEstate - charitableGiving - exemptionAmount)
    
    // Calculate estate tax liability
    const taxLiability = taxable * (estateTaxRate / 100)
    
    // Calculate net distribution
    const distribution = netEstate - taxLiability
    
    setTotalAssets(assetsTotal)
    setTotalLiabilities(liabilitiesTotal)
    setNetEstateValue(netEstate)
    setTaxableEstate(taxable)
    setEstateTaxLiability(taxLiability)
    setNetDistribution(distribution)
  }, [
    realEstate,
    financialAssets,
    personalProperty,
    liabilities,
    estateTaxRate,
    exemptionAmount,
    charitableGiving,
    includeLifeInsurance,
    lifeInsuranceValue
  ])

  // Chart data for asset breakdown
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

  const assetBreakdownData = {
    labels: ['Real Estate', 'Financial Assets', 'Personal Property', 'Life Insurance'],
    datasets: [{
      data: [
        realEstate.reduce((sum, asset) => sum + asset.value, 0),
        financialAssets.reduce((sum, asset) => sum + asset.value, 0),
        personalProperty.reduce((sum, asset) => sum + asset.value, 0),
        includeLifeInsurance ? lifeInsuranceValue : 0
      ],
      backgroundColor: chartColors.primary,
      borderColor: chartColors.secondary.map(color => color.replace('0.2', '1')),
      borderWidth: 2
    }]
  }

  const pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' } 
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value: number) => {
          return ((value / totalAssets) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  const distributionData = {
    labels: ['Net Estate', 'Estate Tax', 'Charitable Giving', 'Net Distribution'],
    datasets: [
      {
        label: 'Amount',
        data: [netEstateValue, estateTaxLiability, charitableGiving, netDistribution],
        backgroundColor: chartColors.primary,
        borderColor: chartColors.secondary.map(color => color.replace('0.2', '1')),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => {
            return '$' + (typeof value === 'number' ? value.toLocaleString() : value)
          }
        }
      },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false },
      datalabels: { 
        color: '#fff',
        font: { weight: 'bold' },
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
    const canvas = await html2canvas(element)
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ 
      orientation: 'portrait', 
      unit: 'px', 
      format: [canvas.width, canvas.height] 
    })
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
    pdf.save('estate-calculator-results.pdf')
  }

  const updateAssetValue = (
    category: AssetCategory[],
    setCategory: React.Dispatch<React.SetStateAction<AssetCategory[]>>,
    index: number,
    value: number
  ) => {
    const newCategory = [...category]
    newCategory[index] = { ...newCategory[index], value }
    setCategory(newCategory)
  }

  const updateLiabilityValue = (index: number, value: number) => {
    const newLiabilities = [...liabilities]
    newLiabilities[index] = { ...newLiabilities[index], value }
    setLiabilities(newLiabilities)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <EstateTaxSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Estate <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Plan your estate and understand potential tax implications with our comprehensive estate calculator.
      </p>
    </div>
  </div>
</section>

        {/* Calculator Section */}
        <section className="py-12">
          <div className="container max-w-[1200px]">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Estate Details</CardTitle>
                    <CardDescription>
                      Enter your assets, liabilities, and estate planning preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Real Estate Assets */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Real Estate Assets</h3>
                      <div className="grid gap-4">
                        {realEstate.map((asset, index) => (
                          <div key={asset.name} className="space-y-2">
                            <Label htmlFor={`real-estate-${index}`} className="flex items-center gap-2">
                              <asset.icon className="h-4 w-4 text-primary" />
                              {asset.name}
                            </Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id={`real-estate-${index}`}
                                type="number"
                                className="pl-9"
                                value={asset.value}
                                onChange={(e) => updateAssetValue(realEstate, setRealEstate, index, Number(e.target.value))}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial Assets */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Financial Assets</h3>
                      <div className="grid gap-4">
                        {financialAssets.map((asset, index) => (
                          <div key={asset.name} className="space-y-2">
                            <Label htmlFor={`financial-${index}`} className="flex items-center gap-2">
                              <asset.icon className="h-4 w-4 text-primary" />
                              {asset.name}
                            </Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id={`financial-${index}`}
                                type="number"
                                className="pl-9"
                                value={asset.value}
                                onChange={(e) => updateAssetValue(financialAssets, setFinancialAssets, index, Number(e.target.value))}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Personal Property */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Personal Property</h3>
                      <div className="grid gap-4">
                        {personalProperty.map((asset, index) => (
                          <div key={asset.name} className="space-y-2">
                            <Label htmlFor={`personal-${index}`} className="flex items-center gap-2">
                              <asset.icon className="h-4 w-4 text-primary" />
                              {asset.name}
                            </Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id={`personal-${index}`}
                                type="number"
                                className="pl-9"
                                value={asset.value}
                                onChange={(e) => updateAssetValue(personalProperty, setPersonalProperty, index, Number(e.target.value))}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Life Insurance */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Life Insurance</h3>
                        <Switch
                          checked={includeLifeInsurance}
                          onCheckedChange={setIncludeLifeInsurance}
                        />
                      </div>
                      {includeLifeInsurance && (
                        <div className="space-y-2">
                          <Label htmlFor="life-insurance">Life Insurance Value</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="life-insurance"
                              type="number"
                              className="pl-9"
                              value={lifeInsuranceValue || ''} onChange={(e) => setLifeInsuranceValue(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Liabilities */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Liabilities</h3>
                      <div className="grid gap-4">
                        {liabilities.map((liability, index) => (
                          <div key={liability.name} className="space-y-2">
                            <Label htmlFor={`liability-${index}`} className="flex items-center gap-2">
                              <liability.icon className="h-4 w-4 text-primary" />
                              {liability.name}
                            </Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id={`liability-${index}`}
                                type="number"
                                className="pl-9"
                                value={liability.value}
                                onChange={(e) => updateLiabilityValue(index, Number(e.target.value))}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Estate Planning Parameters */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Estate Planning Parameters</h3>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="estate-tax-rate">Estate Tax Rate</Label>
                            <span className="text-sm text-muted-foreground">{estateTaxRate}%</span>
                          </div>
                          <Slider
                            id="estate-tax-rate"
                            min={0}
                            max={100}
                            step={1}
                            value={[estateTaxRate]}
                            onValueChange={(value) => setEstateTaxRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="exemption-amount">Estate Tax Exemption</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="exemption-amount"
                              type="number"
                              className="pl-9"
                              value={exemptionAmount || ''} onChange={(e) => setExemptionAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="charitable-giving">Charitable Giving</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="charitable-giving"
                              type="number"
                              className="pl-9"
                              value={charitableGiving || ''} onChange={(e) => setCharitableGiving(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results Section */}
              <div id="results-section" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Estate Summary</CardTitle>
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
                    <div className="space-y-2 text-center">
                      <p className="text-sm text-muted-foreground">Net Estate Value</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(netEstateValue)}</p>
                    </div>
                    <Separator />
                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Assets</TabsTrigger>
                        <TabsTrigger value="distribution">Distribution</TabsTrigger>
                        <TabsTrigger value="tax">Tax Impact</TabsTrigger>
                      </TabsList>
                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={assetBreakdownData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Asset Breakdown</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Assets</span>
                              <span className="font-medium">{formatCurrency(totalAssets)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Liabilities</span>
                              <span className="font-medium">{formatCurrency(totalLiabilities)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Net Estate Value</span>
                              <span>{formatCurrency(netEstateValue)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="distribution" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={distributionData} options={barChartOptions} />
                        </div>
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <span className="text-sm">Estate Tax</span>
                            <span className="font-medium">{formatCurrency(estateTaxLiability)}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <span className="text-sm">Charitable Giving</span>
                            <span className="font-medium">{formatCurrency(charitableGiving)}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                            <span>Net Distribution</span>
                            <span>{formatCurrency(netDistribution)}</span>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="tax" className="space-y-4">
                        <div className="grid gap-4">
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground">Taxable Estate</p>
                            <p className="text-2xl font-semibold">{formatCurrency(taxableEstate)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              After exemption ({formatCurrency(exemptionAmount)})
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground">Estate Tax Rate</p>
                            <p className="text-2xl font-semibold">{estateTaxRate}%</p>
                          </div>
                          <div className="p-4 rounded-lg bg-primary/10">
                            <p className="text-sm text-muted-foreground">Estate Tax Liability</p>
                            <p className="text-2xl font-semibold">{formatCurrency(estateTaxLiability)}</p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 mb-2">Tax Planning Resource</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">Estate Tax: Understanding Your Legacy's Tax Impact</h2>
        <p className="mt-3 text-muted-foreground text-lg">Essential knowledge about estate taxes and planning strategies to protect your wealth</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-12 overflow-hidden border-purple-200 dark:border-purple-900">
        <CardHeader className="bg-purple-50 dark:bg-purple-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Info className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Understanding Estate Taxes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 id="what-is-estate-tax" className="text-2xl font-bold mb-4 text-purple-700 dark:text-purple-400">What is the Estate Tax?</h3>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <p>
                <strong>Estate tax</strong> is a tax on the transfer of property after death. It's levied on the total value of a deceased person's money and property before assets are distributed to heirs. Sometimes referred to as the "death tax," it affects only estates that exceed certain exemption thresholds.
              </p>
              <p className="mt-2">
                Estate taxes typically include these key components:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Gross estate valuation of all owned assets</span>
                </li>
                <li className="flex items-center gap-2">
                  <Minus className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Allowable deductions and exemptions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Progressive tax rates on the taxable portion</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Filing requirements within specified deadlines</span>
                </li>
              </ul>
              <p>
                Understanding how these factors work together helps you develop effective strategies to minimize estate taxes and maximize your legacy.
              </p>
            </div>
            <div className="md:w-[300px] h-[260px] flex-shrink-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="py-3 bg-gradient-to-r from-purple-100 to-indigo-50 dark:from-purple-900/60 dark:to-indigo-900/60">
                  <CardTitle className="text-sm font-medium text-center">Estate Tax Rates (2025)</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-4">
                  <div className="w-full h-full">
                    <Pie 
                      data={{
                        labels: ['Federal Estate Tax', 'State Estate Tax', 'Non-Taxable Portion'],
                        datasets: [
                          {
                            data: [40, 15, 45],
                            backgroundColor: [
                              'rgba(124, 58, 237, 0.8)',
                              'rgba(79, 70, 229, 0.8)',
                              'rgba(209, 213, 219, 0.5)'
                            ]
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { boxWidth: 10, padding: 10 }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <h4 id="estate-tax-importance" className="font-semibold text-xl mt-6">Why Estate Tax Planning Is Critical</h4>
          <div className="mt-4 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Wealth Preservation</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Without proper planning, up to 40% of your taxable estate can go to federal taxes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Family Business Continuity</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Estate taxes can force liquidation of family businesses when cash isn't available to pay the tax bill</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Changing Legislation</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Exemption amounts and tax rates are subject to change as tax laws are updated</p>
                </div>
              </div>
            </div>
          </div>
          
          <p>
            Proactive estate tax planning is essential for high-net-worth individuals and families to ensure their wealth transfer goals are met without unnecessary tax burdens, providing financial security for future generations.
          </p>
        </CardContent>
      </Card>

      {/* How Estate Taxes Work Section */}
      <div className="mb-12" id="how-estate-taxes-work">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold">Understanding How Estate Taxes Work</h2>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-xl mb-6 border border-purple-100 dark:border-purple-800">
          <h3 id="tax-calculation" className="font-bold text-xl mb-4">The Estate Tax Calculation Process</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="bg-purple-50 dark:bg-purple-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-purple-600 text-white text-sm">1</span>
                  Determining Gross Estate
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Home className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span><strong>Real Estate</strong>: Primary residence, vacation homes, investment properties</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Wallet className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span><strong>Financial Assets</strong>: Cash, bank accounts, investments, retirement accounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Building className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span><strong>Business Interests</strong>: Ownership stakes in private companies, partnerships</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Gift className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span><strong>Personal Property</strong>: Vehicles, art, jewelry, collectibles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span><strong>Life Insurance</strong>: Death benefits from policies owned by the deceased</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="bg-purple-50 dark:bg-purple-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-purple-600 text-white text-sm">2</span>
                  Allowable Deductions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CreditCard className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span><strong>Debts & Liabilities</strong>: Mortgages, loans, credit card debt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span><strong>Administrative Expenses</strong>: Funeral costs, estate settlement fees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span><strong>Marital Deduction</strong>: Unlimited transfers to surviving spouse</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <GraduationCap className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span><strong>Charitable Contributions</strong>: Donations to qualified organizations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <LandPlot className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span><strong>State Estate Taxes</strong>: Deductible from federal estate tax</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="bg-purple-50 dark:bg-purple-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-purple-600 text-white text-sm">3</span>
                  Applied Exemptions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <p className="font-medium">Federal Exemption (2025):</p>
                  <div className="p-3 bg-purple-100/50 dark:bg-purple-900/50 rounded-md">
                    <p className="font-medium text-purple-800 dark:text-purple-300">$13.61 million per individual</p>
                    <p className="text-purple-700 dark:text-purple-400">$27.22 million for married couples</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The exemption applies to both lifetime gifts and assets transferred at death. Any unused exemption by the first spouse to die can be "ported" to the surviving spouse.
                  </p>
                  <div className="mt-3 text-sm text-muted-foreground">
                    <p><strong>Note:</strong> State estate tax exemptions vary significantly by state, from $1 million to matching the federal exemption.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="bg-purple-50 dark:bg-purple-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-purple-600 text-white text-sm">4</span>
                  Tax Rate Application
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <p className="font-medium">Federal Estate Tax Rates (2025):</p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-purple-100/50 dark:bg-purple-900/50">
                          <th className="px-2 py-1 text-left">Taxable Estate</th>
                          <th className="px-2 py-1 text-left">Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-100 dark:divide-purple-800">
                        <tr>
                          <td className="px-2 py-1">$0 - $10,000</td>
                          <td className="px-2 py-1">18%</td>
                        </tr>
                        <tr>
                          <td className="px-2 py-1">$10,001 - $20,000</td>
                          <td className="px-2 py-1">20%</td>
                        </tr>
                        <tr>
                          <td className="px-2 py-1">$20,001 - $40,000</td>
                          <td className="px-2 py-1">22%</td>
                        </tr>
                        <tr>
                          <td className="px-2 py-1">$1,000,001+</td>
                          <td className="px-2 py-1">40%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    The highest 40% rate applies to the taxable estate value over the exemption amount.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <h3 id="filing-requirements" className="font-bold text-xl mt-8 mb-4">Estate Tax Filing Requirements</h3>
        
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <p className="mb-3">
                    Not all estates need to file an estate tax return, but when required, it's critical to submit all documentation properly and on time.
                  </p>
                  
                  <div className="space-y-4 mb-4">
                    <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-md bg-purple-50/50 dark:bg-purple-900/20">
                      <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Who Must File</h4>
                      <p className="text-sm text-purple-700 dark:text-purple-400">
                        Estates with gross assets exceeding the filing threshold ($13.61 million in 2025), even if deductions would reduce the taxable amount below the exemption.
                      </p>
                    </div>
                    
                    <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-md bg-purple-50/50 dark:bg-purple-900/20">
                      <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Filing Deadline</h4>
                      <p className="text-sm text-purple-700 dark:text-purple-400">
                        Form 706 (United States Estate Tax Return) must be filed within 9 months after the decedent's death, with a possible 6-month extension.
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-900">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 mt-0.5 text-amber-600 dark:text-amber-400" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-300">Important Note</p>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          Even if no tax is due, filing Form 706 may be beneficial for married couples to preserve the deceased spouse's unused exemption amount (portability election).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-[300px] flex-shrink-0">
                  <h4 className="text-center text-sm font-medium mb-3">Estate Tax Payment Methods</h4>
                  <div className="h-[240px]">
                    <Pie
                      data={{
                        labels: ['Cash/Liquidation', 'Life Insurance', 'Installment Payments', 'Asset Transfer'],
                        datasets: [{
                          label: 'Payment Methods',
                          data: [45, 30, 15, 10],
                          backgroundColor: [
                            'rgba(124, 58, 237, 0.7)',
                            'rgba(79, 70, 229, 0.7)',
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(16, 185, 129, 0.7)'
                          ],
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Estate Planning Strategies Section */}
      <div className="mb-12" id="key-strategies">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-2xl">Estate Tax Planning Strategies</span>
              </div>
            </CardTitle>
            <CardDescription>
              Effective approaches to minimize estate tax liability and maximize wealth transfer
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 id="lifetime-gifting" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Lifetime Gifting Strategies
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p>
                    <strong>Lifetime gifting</strong> removes assets from your taxable estate while potentially allowing you to witness the benefits of your generosity.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">→</span>
                      <span><strong>Annual Gift Tax Exclusion</strong>: $18,000 per recipient in 2025</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">→</span>
                      <span><strong>Medical & Education Payments</strong>: Unlimited if paid directly to providers</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 border border-blue-200 dark:border-blue-900 rounded-md bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Example:</strong> A couple with three children and six grandchildren
                    </p>
                    <ul className="text-sm mt-1 text-blue-700 dark:text-blue-400">
                      <li>Can gift $18,000 × 2 givers × 9 recipients = $324,000 annually</li>
                      <li>Over 10 years = $3,240,000 removed from estate tax-free</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Advanced Gifting Techniques</h4>
                  
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-md">
                    <div className="flex items-start gap-2">
                      <FileEdit className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">Grantor Retained Annuity Trusts (GRATs)</p>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          Transfer appreciating assets while retaining income for a term of years, with remainder passing to beneficiaries with minimal gift tax impact.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-md">
                    <div className="flex items-start gap-2">
                      <FileEdit className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">Family Limited Partnerships (FLPs)</p>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          Transfer business or investment assets while maintaining control and potentially applying valuation discounts.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-md">
                    <div className="flex items-start gap-2">
                      <FileEdit className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">Qualified Personal Residence Trusts (QPRTs)</p>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          Transfer your home to beneficiaries while retaining the right to live there for a set period, reducing the taxable value of the gift.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="trust-strategies" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                  <FilePlus className="h-5 w-5" />
                  Trust-Based Strategies
                </h3>
                <p>Trusts are powerful tools that can provide control, protection, and tax benefits for your estate plan.</p>
                
                <div className="mt-4 space-y-4">
                  <div className="p-3 border border-indigo-200 dark:border-indigo-800 rounded-md">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-indigo-600 mt-1" />
                      <div>
                        <p className="font-medium text-indigo-800 dark:text-indigo-300">Irrevocable Life Insurance Trust (ILIT)</p>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400">
                          Keeps life insurance proceeds outside your taxable estate while providing liquidity for estate tax payment.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border border-indigo-200 dark:border-indigo-800 rounded-md">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-indigo-600 mt-1" />
                      <div>
                        <p className="font-medium text-indigo-800 dark:text-indigo-300">Charitable Remainder Trust (CRT)</p>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400">
                          Provides income during your lifetime with remaining assets going to charity, generating income tax deductions and removing assets from your estate.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border border-indigo-200 dark:border-indigo-800 rounded-md">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-indigo-600 mt-1" />
                      <div>
                        <p className="font-medium text-indigo-800 dark:text-indigo-300">Dynasty Trust</p>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400">
                          Long-term trust that can benefit multiple generations while minimizing estate, gift, and generation-skipping transfer taxes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="business-planning" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Business Succession Planning
                </h3>
                <p>
                  Family businesses require special consideration to ensure continuity and minimize estate taxes.
                </p>
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-300 text-sm">Section 6166: Business Installment Payments</h4>
                  <div className="mt-3">
                    <ul className="space-y-2 text-sm text-green-700 dark:text-green-400">
                      <li className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Allows qualifying business owners to pay estate taxes over 14 years</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Percent className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Interest-only payments for first 4 years, then 10 annual installments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Banknote className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Business must represent at least 35% of the gross estate</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <h3 id="asset-valuation" className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-6 mb-4 flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Asset Valuation Strategies
                </h3>
                <p className="mb-4">
                  How assets are valued can significantly impact your estate tax liability.
                </p>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Scale className="h-4 w-4 text-amber-600 mt-1" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-300">Minority Discounts</p>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          Lack of control in a business can reduce the valuation by 15-35%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Scale className="h-4 w-4 text-amber-600 mt-1" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-300">Marketability Discounts</p>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          Ownership interests without a ready market may be discounted 10-30%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estate Tax Trends Section with Statistics */}
      <div className="mb-12" id="estate-tax-statistics">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Estate Tax Trends and Statistics
        </h2>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/60">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-purple-800 dark:text-purple-300">Estate Tax Returns</h3>
                <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">0.2%</p>
                <p className="mt-1 text-sm text-purple-600 dark:text-purple-500">of US deaths result in taxable estates</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/60">
                  <Banknote className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-blue-800 dark:text-blue-300">Revenue Impact</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">$28B</p>
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">Annual federal revenue</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/60">
                  <History className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-300">Historical Rates</h3>
                <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">77%</p>
                <p className="mt-1 text-sm text-green-600 dark:text-green-500">Highest-ever top rate (1941-1976)</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/60">
                  <MapPin className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-300">State Estate Taxes</h3>
                <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">12</p>
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">States with separate estate taxes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <h3 id="exemption-history" className="text-xl font-bold mb-4">Estate Tax Exemption History</h3>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="h-[280px]">
              <Line 
                data={{
                  labels: ['2000', '2005', '2010', '2015', '2020', '2025'],
                  datasets: [
                    {
                      label: 'Federal Estate Tax Exemption (USD Millions)',
                      data: [0.675, 1.5, 5, 5.43, 11.7, 13.61],
                      borderColor: 'rgba(124, 58, 237, 0.8)',
                      backgroundColor: 'rgba(124, 58, 237, 0.1)',
                      tension: 0.4
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { 
                        callback: value => '$' + Number(value).toLocaleString() + 'M'
                      }
                    }
                  }
                }}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              The federal estate tax exemption has increased significantly over the past decades, reducing the number of taxable estates.
            </p>
          </CardContent>
        </Card>

        <h3 id="planning-considerations" className="text-xl font-bold mb-4">Key Planning Considerations</h3>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-300">Legislative Uncertainty</p>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                Current high exemption amounts are scheduled to sunset after 2025, potentially reverting to significantly lower levels unless Congress acts to extend them. This creates a critical planning window for high-net-worth individuals and families.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conclusion Section */}
      <div className="mb-6" id="conclusion">
        <Card className="overflow-hidden border-purple-200 dark:border-purple-900">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-50 dark:from-purple-900/40 dark:to-indigo-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-purple-700 dark:text-purple-400" />
              Estate Tax Planning: Next Steps
            </CardTitle>
            <CardDescription>
              Taking action to protect your legacy
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Estate tax planning</strong> is an essential component of comprehensive financial planning for high-net-worth individuals and families. By understanding the mechanics of estate taxation and implementing strategic planning techniques, you can significantly reduce the tax burden on your estate and maximize the legacy you leave for future generations.
            </p>
            
            <p className="mt-4" id="next-steps">
              Consider these critical steps in your estate tax planning journey:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-100 dark:border-purple-800">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Assessment & Planning</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">1</span>
                    <span className="text-purple-800 dark:text-purple-300">Calculate your current estate tax exposure using our calculator</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">2</span>
                    <span className="text-purple-800 dark:text-purple-300">Assemble your professional team (estate attorney, CPA, financial advisor)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">3</span>
                    <span className="text-purple-800 dark:text-purple-300">Develop a comprehensive estate plan tailored to your goals</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800">
                <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2">Implementation & Maintenance</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold dark:bg-indigo-900 dark:text-indigo-300">1</span>
                    <span className="text-indigo-800 dark:text-indigo-300">Execute necessary legal documents and trust arrangements</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold dark:bg-indigo-900 dark:text-indigo-300">2</span>
                    <span className="text-indigo-800 dark:text-indigo-300">Implement gifting strategies that align with your goals</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold dark:bg-indigo-900 dark:text-indigo-300">3</span>
                    <span className="text-indigo-800 dark:text-indigo-300">Review and update your plan regularly (at least every 2-3 years)</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg border border-purple-100 dark:border-purple-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="font-medium text-lg text-purple-800 dark:text-purple-300">Ready to estimate your estate tax liability?</p>
                  <p className="mt-1 text-purple-700 dark:text-purple-400">
                    Use our <strong>Estate Tax Calculator</strong> above to create a personalized projection! For more financial planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/401k">
                        <Clock className="h-4 w-4 mr-1" />
                        Retirement Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/gift-tax">
                        <Gift className="h-4 w-4 mr-1" />
                        Gift Tax Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/trust">
                        <FileText className="h-4 w-4 mr-1" />
                        Trust Planning Tools
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
      </main>
      <SiteFooter />
    </div>
  )
}