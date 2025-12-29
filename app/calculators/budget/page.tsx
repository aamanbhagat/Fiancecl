"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Download, PieChart, BarChart3, LineChart, Info, Plus, Minus, Calculator, ArrowRight, Wallet, TrendingDown, AlertCircle, TrendingUp, Home, Car, Wifi, ShoppingCart, Ticket, Shirt, PiggyBank, GraduationCap, MinusCircle, Search, PlusCircle, Check, RefreshCw, Clock, AlertTriangle, Smartphone, CalendarDays, Users, ScrollText, Bell } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import BudgetSchema from './schema';

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

interface ExpenseCategory {
  id: string
  name: string
  amount: number
  type: 'fixed' | 'variable' | 'savings' | 'debt' | 'other'
}

export default function BudgetCalculator() {
  // Income State
  const [monthlyIncome, setMonthlyIncome] = useState(5000)
  const [additionalIncome, setAdditionalIncome] = useState(0)
  
  // Expenses State
  const [expenses, setExpenses] = useState<ExpenseCategory[]>([
    // Fixed Expenses
    { id: '1', name: 'Rent/Mortgage', amount: 1500, type: 'fixed' },
    { id: '2', name: 'Utilities', amount: 200, type: 'fixed' },
    { id: '3', name: 'Insurance', amount: 150, type: 'fixed' },
    
    // Variable Expenses
    { id: '4', name: 'Groceries', amount: 400, type: 'variable' },
    { id: '5', name: 'Dining Out', amount: 200, type: 'variable' },
    { id: '6', name: 'Entertainment', amount: 150, type: 'variable' },
    
    // Savings & Investments
    { id: '7', name: '401(k)', amount: 500, type: 'savings' },
    { id: '8', name: 'Emergency Fund', amount: 200, type: 'savings' },
    
    // Debt Payments
    { id: '9', name: 'Credit Card', amount: 300, type: 'debt' },
    { id: '10', name: 'Student Loans', amount: 250, type: 'debt' },
    
    // Other Expenses
    { id: '11', name: 'Subscriptions', amount: 50, type: 'other' },
    { id: '12', name: 'Hobbies', amount: 100, type: 'other' }
  ])
  
  // Custom Category State
  const [newCategory, setNewCategory] = useState({
    name: '',
    amount: 0,
    type: 'other' as ExpenseCategory['type']
  })
  
  // Budget Goals State
  const [budgetGoals, setBudgetGoals] = useState({
    savings: 20, // 20% target savings rate
    discretionary: 30, // 30% discretionary spending
    necessities: 50 // 50% necessities
  })
  
  // Results State
  const [budgetResults, setBudgetResults] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    disposableIncome: 0,
    savingsRate: 0,
    dtiRatio: 0,
    expensesByType: {
      fixed: 0,
      variable: 0,
      savings: 0,
      debt: 0,
      other: 0
    }
  })

  // Calculate budget results
  useEffect(() => {
    const totalIncome = monthlyIncome + additionalIncome
    
    const expensesByType = expenses.reduce((acc, expense) => {
      acc[expense.type] += expense.amount
      return acc
    }, {
      fixed: 0,
      variable: 0,
      savings: 0,
      debt: 0,
      other: 0
    })
    
    const totalExpenses = Object.values(expensesByType).reduce((a, b) => a + b, 0)
    const disposableIncome = totalIncome - totalExpenses
    const savingsRate = (expensesByType.savings / totalIncome) * 100
    const dtiRatio = ((expensesByType.debt + expensesByType.fixed) / totalIncome) * 100
    
    setBudgetResults({
      totalIncome,
      totalExpenses,
      disposableIncome,
      savingsRate,
      dtiRatio,
      expensesByType
    })
  }, [monthlyIncome, additionalIncome, expenses])

  // Chart colors
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

  // Expense breakdown chart
  const expenseChartData = {
    labels: ['Fixed', 'Variable', 'Savings', 'Debt', 'Other'],
    datasets: [{
      data: [
        budgetResults.expensesByType.fixed,
        budgetResults.expensesByType.variable,
        budgetResults.expensesByType.savings,
        budgetResults.expensesByType.debt,
        budgetResults.expensesByType.other
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
          return ((value / budgetResults.totalExpenses) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // Budget goals comparison chart
  const goalsChartData = {
    labels: ['Necessities', 'Discretionary', 'Savings'],
    datasets: [
      {
        label: 'Current',
        data: [
          ((budgetResults.expensesByType.fixed + budgetResults.expensesByType.debt) / budgetResults.totalIncome) * 100,
          ((budgetResults.expensesByType.variable + budgetResults.expensesByType.other) / budgetResults.totalIncome) * 100,
          budgetResults.savingsRate
        ],
        backgroundColor: chartColors.primary[0],
        borderColor: chartColors.secondary[0].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Target',
        data: [budgetGoals.necessities, budgetGoals.discretionary, budgetGoals.savings],
        backgroundColor: chartColors.primary[1],
        borderColor: chartColors.secondary[1].replace('0.2', '1'),
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
        max: 100,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => {
            return value + '%'
          }
        }
      },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' }
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value: number) => value.toFixed(1) + '%'
      }
    }
  }

  // Monthly trend chart data
  const generateTrendData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const income = months.map(() => budgetResults.totalIncome)
    const expenses = months.map(() => budgetResults.totalExpenses)
    const savings = months.map(() => budgetResults.expensesByType.savings)
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Income',
          data: income,
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4
        },
        {
          label: 'Expenses',
          data: expenses,
          borderColor: chartColors.primary[1],
          backgroundColor: chartColors.secondary[1],
          tension: 0.4
        },
        {
          label: 'Savings',
          data: savings,
          borderColor: chartColors.primary[2],
          backgroundColor: chartColors.secondary[2],
          tension: 0.4
        }
      ]
    }
  }

  const lineChartOptions: ChartOptions<'line'> = {
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
      legend: {
        position: 'bottom',
        labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' }
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

  const handleAddCategory = () => {
    if (newCategory.name && newCategory.amount > 0) {
      setExpenses(prev => [...prev, {
        id: String(Date.now()),
        name: newCategory.name,
        amount: newCategory.amount,
        type: newCategory.type
      }])
      setNewCategory({ name: '', amount: 0, type: 'other' })
    }
  }

  const handleRemoveCategory = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id))
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
    pdf.save('budget-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <BudgetSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Budget <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Track your income, expenses, and savings to create a balanced budget and achieve your financial goals.
      </p>
    </div>
  </div>
</section>

        {/* Calculator Section */}
        <section className="py-12">
          <div className="container max-w-[1200px] px-6 mx-auto">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Enter Budget Details</CardTitle>
                    <CardDescription>
                      Provide your income and expenses to calculate your budget breakdown.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Income Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Monthly Income</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="monthly-income">Primary Income</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="monthly-income"
                              type="number"
                              className="pl-9"
                              value={monthlyIncome}
                              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="additional-income">Additional Income</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="additional-income"
                              type="number"
                              className="pl-9"
                              value={additionalIncome}
                              onChange={(e) => setAdditionalIncome(Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expenses Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Expenses</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={handleAddCategory}
                        >
                          <Plus className="h-4 w-4" />
                          Add Category
                        </Button>
                      </div>
                      
                      {/* Add New Category */}
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                              <Label htmlFor="category-name">Category Name</Label>
                              <Input
                                id="category-name"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Gym Membership"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="category-amount">Amount</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="category-amount"
                                  type="number"
                                  className="pl-9"
                                  value={newCategory.amount}
                                  onChange={(e) => setNewCategory(prev => ({ ...prev, amount: Number(e.target.value) }))}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="category-type">Type</Label>
                              <select
                                id="category-type"
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                                value={newCategory.type}
                                onChange={(e) => setNewCategory(prev => ({ ...prev, type: e.target.value as ExpenseCategory['type'] }))}
                              >
                                <option value="fixed">Fixed</option>
                                <option value="variable">Variable</option>
                                <option value="savings">Savings</option>
                                <option value="debt">Debt</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Expense Categories */}
                      <div className="space-y-4">
                        {['fixed', 'variable', 'savings', 'debt', 'other'].map((type) => (
                          <div key={type} className="space-y-2">
                            <h4 className="capitalize font-medium">{type} Expenses</h4>
                            <div className="space-y-2">
                              {expenses
                                .filter(expense => expense.type === type)
                                .map(expense => (
                                  <div
                                    key={expense.id}
                                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                                  >
                                    <span>{expense.name}</span>
                                    <div className="flex items-center gap-4">
                                      <span className="font-medium">{formatCurrency(expense.amount)}</span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveCategory(expense.id)}
                                      >
                                        <Minus className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div id="results-section" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Budget Analysis</CardTitle>
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
                    {/* Summary Cards */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Monthly Income</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatCurrency(budgetResults.totalIncome)}</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Total Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatCurrency(budgetResults.totalExpenses)}</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Disposable Income</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatCurrency(budgetResults.disposableIncome)}</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Savings Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{budgetResults.savingsRate.toFixed(1)}%</div>
                        </CardContent>
                      </Card>
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Expenses</TabsTrigger>
                        <TabsTrigger value="goals">Goals</TabsTrigger>
                        <TabsTrigger value="trends">Trends</TabsTrigger>
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={expenseChartData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Expense Breakdown</h4>
                          <div className="grid gap-2">
                            {Object.entries(budgetResults.expensesByType).map(([type, amount]) => (
                              <div key={type} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="capitalize">{type}</span>
                                <span className="font-medium">{formatCurrency(amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="goals" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={goalsChartData} options={barChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">50/30/20 Budget Rule</h4>
                          <p className="text-sm text-muted-foreground">
                            Aim to spend 50% on needs, 30% on wants, and save 20% of your income.
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="trends" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateTrendData()} options={lineChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Monthly income, expenses, and savings trends
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Budget Health Indicator */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Budget Health</p>
                            <p className="text-sm text-muted-foreground">
                              {budgetResults.savingsRate >= 20
                                ? "Great job! You're meeting the recommended savings rate."
                                : "Consider increasing your savings to reach the 20% target."}
                            </p>
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Financial Planning</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Mastering Your Budget: The Ultimate Guide</h2>
        <p className="mt-3 text-muted-foreground text-lg">Take control of your finances with proper budgeting techniques</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Budget Calculators
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                A <strong>Budget Calculator</strong> is an essential financial tool that helps you track income, plan expenses, and achieve financial goals. Unlike basic spreadsheets, a sophisticated budget calculator provides dynamic insights into your spending patterns and helps identify opportunities for saving.
              </p>
              <p className="mt-3">
                Effective budgeting delivers numerous benefits:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Clarity on where your money goes each month</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Identification of unnecessary expenses</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Prevention of debt accumulation</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Progress toward savings and financial goals</span>
                </li>
              </ul>
              <p>
                Whether you're saving for a home, planning for retirement, or simply trying to gain control of your finances, a budget calculator transforms abstract financial concepts into actionable plans tailored to your unique situation.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Average Monthly Budget Breakdown</h3>
                <div className="h-[200px]">
                  <Pie 
                    data={{
                      labels: ['Housing', 'Transportation', 'Food', 'Utilities', 'Healthcare', 'Savings', 'Other'],
                      datasets: [{
                        data: [35, 15, 12, 10, 8, 10, 10],
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(14, 165, 233, 0.8)',
                          'rgba(6, 182, 212, 0.8)',
                          'rgba(20, 184, 166, 0.8)',
                          'rgba(16, 185, 129, 0.8)',
                          'rgba(124, 58, 237, 0.8)',
                          'rgba(236, 72, 153, 0.8)'
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } },
                        datalabels: {
                          color: '#fff',
                          font: { weight: 'bold' },
                          formatter: (value) => value + '%'
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">Recommended percentage allocation for a balanced budget</p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Did You Know?</strong> According to the Federal Reserve, nearly 40% of Americans would struggle to cover an unexpected $400 expense. Proper budgeting creates a financial buffer for these situations.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <Wallet className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="mt-3 text-lg font-semibold text-blue-800 dark:text-blue-300">Financial Clarity</h3>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    Understand exactly where your money is going to make informed decisions
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <LineChart className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-300">Goal Achievement</h3>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    Track progress toward your financial goals with precision
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <PieChart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <h3 className="mt-3 text-lg font-semibold text-purple-800 dark:text-purple-300">Balance Optimization</h3>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                    Optimize your spending to maximize happiness and financial health
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* How to Use Section */}
      <div className="mb-10" id="how-to-use">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Creating Your Perfect Budget
        </h2>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
          <h3 id="step-by-step" className="font-bold text-xl mb-4">Step-by-Step Budget Creation Guide</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">1</span>
                  Track Your Income
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Include all sources of income (salary, side hustles, investments)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Use after-tax (take-home) amounts for accuracy</span>
                  </li>
                </ul>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p>Remember to include irregular income sources like bonuses, but don't budget regular expenses against irregular income.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">2</span>
                  Identify Fixed Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Home className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Housing (rent/mortgage, property taxes, insurance)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Car className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Transportation (car payment, insurance, public transit)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Wifi className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Utilities and subscriptions</span>
                  </li>
                </ul>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p>These costs remain relatively constant month-to-month and should be accounted for first.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">3</span>
                  Estimate Variable Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <ShoppingCart className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Groceries and dining out</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Ticket className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Entertainment and recreation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shirt className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Personal care and shopping</span>
                  </li>
                </ul>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p>Review past bank and credit card statements to find your average monthly spending in these categories.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">4</span>
                  Set Savings Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <PiggyBank className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Emergency fund (3-6 months of expenses)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <GraduationCap className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Education or major purchases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Retirement and investments</span>
                  </li>
                </ul>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p>Treat savings as a non-negotiable expense by paying yourself first.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">5</span>
                  Balance and Adjust
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="mb-3">Total your income and expenses to ensure your budget balances:</p>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <span>Monthly Income</span>
                        <span>$5,000</span>
                      </div>
                      <div className="flex justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <span>Fixed Expenses</span>
                        <span>- $2,500</span>
                      </div>
                      <div className="flex justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <span>Variable Expenses</span>
                        <span>- $1,500</span>
                      </div>
                      <div className="flex justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <span>Savings</span>
                        <span>- $500</span>
                      </div>
                      <div className="flex justify-between p-2 font-bold bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded">
                        <span>Balance</span>
                        <span>$500</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="mb-3">If your budget doesn't balance or you need more savings:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <MinusCircle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                        <span>Reduce variable expenses (dining out, subscriptions)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Search className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                        <span>Look for ways to reduce fixed expenses (refinancing, negotiating bills)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <PlusCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <span>Find ways to increase income (side gig, overtime, promotion)</span>
                      </li>
                    </ul>
                    <div className="mt-3 text-sm text-muted-foreground">
                      <p>Remember to leave some flexibility in your budget for unexpected expenses.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <h3 id="budget-methods" className="text-xl font-bold mb-4">Popular Budgeting Methods</h3>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader className="py-3 bg-blue-50 dark:bg-blue-900/30">
              <CardTitle className="text-base">50/30/20 Method</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[150px] mb-3">
                <Pie 
                  data={{
                    labels: ['Needs (50%)', 'Wants (30%)', 'Savings (20%)'],
                    datasets: [{
                      data: [50, 30, 20],
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(124, 58, 237, 0.8)'
                      ],
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { boxWidth: 10, padding: 8 } }
                    }
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Allocate 50% of income to needs, 30% to wants, and 20% to savings. Simple, flexible, and effective for beginners.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 dark:border-green-900">
            <CardHeader className="py-3 bg-green-50 dark:bg-green-900/30">
              <CardTitle className="text-base">Zero-Based Budgeting</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2 mb-3">
                <div className="flex justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                  <span>Income</span>
                  <span>$5,000</span>
                </div>
                <div className="flex justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                  <span>All Expenses + Savings</span>
                  <span>- $5,000</span>
                </div>
                <div className="flex justify-between p-2 font-bold bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded text-sm">
                  <span>Remainder</span>
                  <span>$0</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Assign every dollar a purpose so income minus expenses equals zero. Detailed and thorough, ideal for those who want maximum control.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200 dark:border-purple-900">
            <CardHeader className="py-3 bg-purple-50 dark:bg-purple-900/30">
              <CardTitle className="text-base">Envelope System</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="p-2 text-center bg-purple-50 dark:bg-purple-900/20 rounded text-sm border border-purple-100 dark:border-purple-800">
                  <p className="text-xs text-purple-700 dark:text-purple-400">Groceries</p>
                  <p className="font-medium">$400</p>
                </div>
                <div className="p-2 text-center bg-purple-50 dark:bg-purple-900/20 rounded text-sm border border-purple-100 dark:border-purple-800">
                  <p className="text-xs text-purple-700 dark:text-purple-400">Dining</p>
                  <p className="font-medium">$200</p>
                </div>
                <div className="p-2 text-center bg-purple-50 dark:bg-purple-900/20 rounded text-sm border border-purple-100 dark:border-purple-800">
                  <p className="text-xs text-purple-700 dark:text-purple-400">Fun</p>
                  <p className="font-medium">$150</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Allocate cash to physical or digital "envelopes" for different spending categories. Excellent for visual thinkers and overspenders.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <strong>Pro Tip:</strong> The best budgeting method is the one you'll actually use. Start with something simple, and refine your approach as you develop better financial habits. Most people try several methods before finding their perfect fit.
            </p>
          </div>
        </div>
      </div>

      {/* Key Factors Section */}
      <div className="mb-10" id="budget-factors">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <LineChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-2xl">Key Budget Success Factors</span>
              </div>
            </CardTitle>
            <CardDescription>
              Essential elements that determine your budgeting success
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 id="expense-tracking" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                The Power of Expense Tracking
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p>
                    <strong>Expense tracking</strong> is the foundation of successful budgeting. When you record every transaction, you create a complete picture of your financial behavior, enabling more informed decisions.
                  </p>
                  
                  <div className="mt-4 p-3 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Benefits of Detailed Tracking</h4>
                    <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                        <span>Identifies spending patterns and habits</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                        <span>Highlights forgotten recurring expenses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                        <span>Reveals opportunities for easy spending cuts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                        <span>Creates accountability and mindfulness</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        <strong>Reality Check:</strong> Studies show that people who track expenses consistently save up to 20% more than those who don't, simply through increased awareness of their spending habits.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="h-[200px]">
                    <h4 className="text-center text-sm font-medium mb-2">Sample Expense Breakdown Before vs. After Tracking</h4>
                    <Bar 
                      data={{
                        labels: ['Dining Out', 'Groceries', 'Entertainment', 'Shopping', 'Subscriptions'],
                        datasets: [
                          {
                            label: 'Perceived Spending',
                            data: [200, 400, 100, 150, 30],
                            backgroundColor: 'rgba(59, 130, 246, 0.6)',
                          },
                          {
                            label: 'Actual Spending',
                            data: [350, 320, 180, 290, 85],
                            backgroundColor: 'rgba(239, 68, 68, 0.6)',
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Monthly Amount ($)' }
                          }
                        }
                      }}
                    />
                  </div>
                  
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium mb-2 text-sm">Tracking Methods Comparison</h4>
                    <div className="text-sm space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="font-medium">Method</div>
                        <div className="font-medium">Pros</div>
                        <div className="font-medium">Cons</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>Budgeting Apps</div>
                        <div>Automatic categorization, real-time</div>
                        <div>Privacy concerns, may cost money</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>Spreadsheets</div>
                        <div>Customizable, free</div>
                        <div>Manual entry, requires discipline</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>Pen & Paper</div>
                        <div>Simple, tangible</div>
                        <div>No automation, harder to analyze</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="consistency" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Consistency and Habit Formation
                </h3>
                <p>
                  Successful budgeting isn't about perfection—it's about consistency. Building financial habits takes time, but becomes automatic with practice.
                </p>
                
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-700 dark:text-green-400">Building Budget Consistency</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex items-center">
                        <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-800 dark:text-green-300 font-bold mr-2">1</div>
                        <span className="text-green-700 dark:text-green-400">Start with weekly reviews (15 minutes)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-800 dark:text-green-300 font-bold mr-2">2</div>
                        <span className="text-green-700 dark:text-green-400">Use automation for bills and savings</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-800 dark:text-green-300 font-bold mr-2">3</div>
                        <span className="text-green-700 dark:text-green-400">Schedule monthly budget adjustments</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-800 dark:text-green-300 font-bold mr-2">4</div>
                        <span className="text-green-700 dark:text-green-400">Use reminders and calendar alerts</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-[180px]">
                    <h4 className="text-center text-sm font-medium mb-2">Budget Habit Formation Timeline</h4>
                    <Line 
                      data={{
                        labels: ['Week 1', 'Week 3', 'Week 5', 'Week 7', 'Week 9', 'Week 11'],
                        datasets: [{
                          label: 'Effort Required',
                          data: [10, 8, 7, 5, 4, 3],
                          borderColor: 'rgba(22, 163, 74, 0.8)',
                          backgroundColor: 'rgba(22, 163, 74, 0.1)',
                          tension: 0.4,
                          fill: true
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 10,
                            title: { display: true, text: 'Effort Level' }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="adaptability" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Regular Review and Adaptation
                </h3>
                <p>
                  Your budget isn't static—it needs regular reviews and adjustments. Life changes, income fluctuates, and priorities shift. A good budget evolves with you.
                </p>
                
                <div className="mt-4 space-y-4">
                  <div className="p-4 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">Budget Review Schedule</h4>
                    <table className="w-full mt-2 text-sm">
                      <tbody>
                        <tr>
                          <td className="py-1 font-medium">Weekly</td>
                          <td>Track expenses, check progress</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium">Monthly</td>
                          <td>Compare actual vs. planned spending</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium">Quarterly</td>
                          <td>Adjust categories, review financial goals</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium">Annually</td>
                          <td>Major budget overhaul, long-term planning</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400 mb-2">Signs Your Budget Needs Adjustment</h4>
                    <div className="space-y-2 text-sm text-purple-600 dark:text-purple-500">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>Consistently overspending in certain categories</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>Major life changes (job, move, relationship)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>Feeling stressed despite following the budget</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>Significant changes in income or expenses</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        <strong>Remember:</strong> A budget that makes you miserable isn't sustainable. Include room for enjoyment while working toward your financial goals. Balance is key to long-term success.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Statistics Section */}
      <div className="mb-10" id="budget-statistics">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Budgeting Statistics and Trends
        </h2>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/60">
                  <PieChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-blue-800 dark:text-blue-300">Budgeting Households</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">33%</p>
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">follow a formal budget</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/60">
                  <PiggyBank className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-300">Increased Savings</h3>
                <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">18%</p>
                <p className="mt-1 text-sm text-green-600 dark:text-green-500">more saved by budgeters</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/60">
                  <Smartphone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-purple-800 dark:text-purple-300">App Usage</h3>
                <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">65%</p>
                <p className="mt-1 text-sm text-purple-600 dark:text-purple-500">prefer digital tools</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/60">
                  <TrendingDown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-300">Debt Reduction</h3>
                <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">23%</p>
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">faster with budget plans</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Spending Patterns by Income Level
            </CardTitle>
            <CardDescription>How spending priorities shift as income increases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar 
                data={{
                  labels: ['Housing', 'Food', 'Transportation', 'Healthcare', 'Entertainment', 'Savings'],
                  datasets: [
                    {
                      label: 'Lower Income',
                      data: [40, 18, 15, 10, 7, 5],
                      backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    },
                    {
                      label: 'Middle Income',
                      data: [33, 15, 16, 8, 11, 12],
                      backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    },
                    {
                      label: 'Higher Income',
                      data: [25, 10, 12, 7, 15, 24],
                      backgroundColor: 'rgba(124, 58, 237, 0.7)',
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: 'Percentage of Income (%)' }
                    }
                  }
                }}
              />
            </div>
            <p className="text-sm text-center text-muted-foreground mt-2">
              As income rises, the percentage allocated to necessities typically decreases while savings and discretionary spending increase.
            </p>
          </CardContent>
        </Card>

        <h3 id="budget-challenges" className="text-xl font-bold mb-4">Common Budgeting Challenges</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </span>
                <CardTitle className="text-base">Inconsistent Income</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">
                Freelancers, commission-based workers, and seasonal employees face unique budgeting challenges with variable income streams.
              </p>
              <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded text-sm">
                <strong>Solution:</strong> Budget based on your minimum monthly income and save excess in high-income months for leaner periods.
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40">
                  <CalendarDays className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </span>
                <CardTitle className="text-base">Irregular Expenses</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">
                Annual insurance premiums, holiday gifts, and car repairs can derail even well-planned budgets when they arise unexpectedly.
              </p>
              <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded text-sm">
                <strong>Solution:</strong> Create sinking funds by setting aside small monthly amounts for predictable irregular expenses.
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40">
                  <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </span>
                <CardTitle className="text-base">Social Pressure</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">
                Peer pressure to dine out, travel, or participate in costly activities can create difficult spending decisions.
              </p>
              <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded text-sm">
                <strong>Solution:</strong> Create a dedicated "social" budget and suggest affordable alternatives when needed.
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40">
                  <ScrollText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </span>
                <CardTitle className="text-base">Budgeting Fatigue</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">
                Maintaining detailed tracking over time can lead to burnout, causing many people to abandon their budget entirely.
              </p>
              <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded text-sm">
                <strong>Solution:</strong> Simplify your process with automation and focus mainly on problem spending areas.
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">Inflation's Impact on Budgeting</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                With inflation affecting core spending categories like food, housing, and transportation, regular budget reviews are more important than ever. The most effective approach is to audit spending monthly and adjust category allocations quarterly as prices change.
              </p>
            </div>
          </div>
        </div>

        <h3 id="technology-trends" className="text-xl font-bold mb-4">Budgeting Technology Trends</h3>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                  AI-Powered Analysis
                </h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Modern apps now use artificial intelligence to identify spending patterns, predict future expenses, and suggest personalized budget optimizations.
                </p>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-blue-600" />
                  Automated Micro-Saving
                </h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Apps that round up purchases and automatically save the difference are making saving effortless and integrating it with everyday spending.
                </p>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-600" />
                  Real-Time Notifications
                </h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Instant alerts when approaching category limits or unusual spending occurs help prevent budget overruns before they happen.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conclusion Section */}
      <div id="conclusion">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Your Path to Financial Control
            </CardTitle>
            <CardDescription>
              Taking the next steps with your budget
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Budget calculators</strong> transform the complex process of financial planning into a manageable system that puts you in control. A well-designed budget isn't restrictive—it's liberating. By understanding where your money goes and making intentional choices about spending, you create the foundation for achieving your most important financial goals.
            </p>
            
            <p className="mt-4" id="next-steps">
              Start your budgeting journey today:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Getting Started</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Track your spending for 30 days to establish a baseline</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Choose a budgeting method that matches your personality</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Set up automated systems for recurring bills and savings</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Budget Maintenance</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Schedule regular budget check-ins on your calendar</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Adjust your categories quarterly as needs change</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Celebrate progress and learn from setbacks</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to take control of your finances?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Budget Calculator</strong> above to create your personalized spending plan! For more financial planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/savings">
                        <PiggyBank className="h-4 w-4 mr-1" />
                        Savings Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/debt-payoff">
                        <TrendingDown className="h-4 w-4 mr-1" />
                        Debt Payoff Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/401k">
                        <Clock className="h-4 w-4 mr-1" />
                        Retirement Calculator
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

        {/* Related Calculators */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Related Calculators</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Debt-to-Income Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate your debt-to-income ratio to understand your financial health.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/debt-to-income">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Savings Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Plan your savings strategy and track progress toward your financial goals.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/savings">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Debt Payoff Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Create a strategy to pay off your debts faster and save on interest.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/debt-payoff">Try Calculator</Link>
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