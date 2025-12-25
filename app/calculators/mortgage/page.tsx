"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  Home,
  Calculator,
  Download,
  RefreshCw,
  Copy,
  Check,
  Info,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  FileCode,
  BarChart3,
  Percent,
  Clock,
  AlertCircle,
  TrendingDown,
  LineChart,
  TrendingUp,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import dynamic from 'next/dynamic';
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Chart.js registration - This is critical to solve the "arc is not registered element" error
import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
  PieController,
  LineController,
  BarController,
  DoughnutController,
  RadarController,
  BubbleController,
  ScatterController
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import MortgageSchema from './schema';

// Register all Chart.js components immediately
Chart.register(
  // Elements
  ArcElement, // This fixes the "arc is not a registered element" error
  LineElement,
  BarElement,
  PointElement,
  
  // Scales
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  
  // Controllers
  PieController,
  LineController,
  BarController,
  DoughnutController,
  RadarController,
  BubbleController,
  ScatterController,
  
  // Plugins
  Title,
  ChartTooltip,
  Legend,
  Filler,
  ChartDataLabels
);

// Dynamically import chart components
const DynamicPie = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Pie),
  { ssr: false }
);

const DynamicLine = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Line),
  { ssr: false }
);

const DynamicBar = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Bar),
  { ssr: false }
);

const DynamicKatexDisplay = dynamic(
  () => import('./components/KatexDisplay'),
  { ssr: false }
);

// Constants
const CHART_COLORS = {
  primary: [
    "rgba(99, 102, 241, 0.9)",
    "rgba(59, 130, 246, 0.9)",
    "rgba(14, 165, 233, 0.9)",
    "rgba(6, 182, 212, 0.9)",
    "rgba(20, 184, 166, 0.9)",
    "rgba(16, 185, 129, 0.9)",
  ],
  secondary: [
    "rgba(99, 102, 241, 0.2)",
    "rgba(59, 130, 246, 0.2)",
    "rgba(14, 165, 233, 0.2)",
    "rgba(6, 182, 212, 0.2)",
    "rgba(20, 184, 166, 0.2)",
    "rgba(16, 185, 129, 0.2)",
  ],
};

const INITIAL_PAYMENT_BREAKDOWN = {
  principal: 0,
  interest: 0,
  propertyTax: 0,
  insurance: 0,
  pmi: 0,
  hoa: 0,
};

// Utility Functions
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

// Define AmortizationItem interface
interface AmortizationItem {
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  totalInterest: number;
  date: string;
}

// Custom hook for window-based operations
function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
}

export default function MortgageCalculator() {
  const isClient = useIsClient();
  
  // State Declarations
  const [loanAmount, setLoanAmount] = useState(300000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [downPayment, setDownPayment] = useState(20);
  const [propertyTax, setPropertyTax] = useState(1.2);
  const [insurance, setInsurance] = useState(0.5);
  const [includeHOA, setIncludeHOA] = useState(false);
  const [hoaFees, setHoaFees] = useState(250);
  const [includePMI, setIncludePMI] = useState(false);
  const [pmiRate, setPmiRate] = useState(0.5);
  const [extraPayment, setExtraPayment] = useState(0);
  const [paymentFrequency, setPaymentFrequency] = useState("monthly");
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [paymentBreakdown, setPaymentBreakdown] = useState(INITIAL_PAYMENT_BREAKDOWN);
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationItem[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const mathRef1 = useRef<HTMLDivElement | null>(null);
  const mathRef2 = useRef<HTMLDivElement | null>(null);

  // Theme Detection - only runs on client
  useEffect(() => {
    if (!isClient) return;
    
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    
    return () => observer.disconnect();
  }, [isClient]);

  // Mortgage Calculation Logic
  useEffect(() => {
    const calculateMortgage = () => {
      const principal = loanAmount * (1 - downPayment / 100);
      const monthlyRate = interestRate / 100 / 12;
      const numberOfPayments = loanTerm * 12;

      const monthlyPrincipalAndInterest =
        principal *
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1) || 0;

      const monthlyPropertyTax = (loanAmount * (propertyTax / 100)) / 12;
      const monthlyInsurance = (loanAmount * (insurance / 100)) / 12;
      const monthlyPMI = includePMI && downPayment < 20 ? (principal * (pmiRate / 100)) / 12 : 0;
      const monthlyHOA = includeHOA ? hoaFees : 0;

      const totalMonthlyPayment =
        monthlyPrincipalAndInterest + monthlyPropertyTax + monthlyInsurance + monthlyPMI + monthlyHOA;

      setMonthlyPayment(monthlyPrincipalAndInterest);
      setTotalPayment(totalMonthlyPayment);

      setPaymentBreakdown({
        principal: monthlyPrincipalAndInterest - principal * monthlyRate,
        interest: principal * monthlyRate,
        propertyTax: monthlyPropertyTax,
        insurance: monthlyInsurance,
        pmi: monthlyPMI,
        hoa: monthlyHOA,
      });

      let balance = principal;
      let totalInterest = 0;
      const schedule = [];
      const startDate = new Date();

      for (let i = 1; i <= numberOfPayments && i <= 360; i++) {
        const interest = balance * monthlyRate;
        const principalPayment = monthlyPrincipalAndInterest - interest;
        totalInterest += interest;
        balance = Math.max(0, balance - principalPayment);

        const paymentDate = new Date(startDate);
        paymentDate.setMonth(startDate.getMonth() + i);

        schedule.push({
          payment: i,
          principal: principalPayment,
          interest,
          balance,
          totalInterest,
          date: paymentDate.toLocaleDateString("en-US", { year: "numeric", month: "short" }),
        });
      }

      setAmortizationSchedule(schedule);
    };

    calculateMortgage();
  }, [
    loanAmount,
    interestRate,
    loanTerm,
    downPayment,
    propertyTax,
    insurance,
    includeHOA,
    hoaFees,
    includePMI,
    pmiRate,
    extraPayment,
    paymentFrequency,
  ]);

  // Scroll Handler - only runs on client
  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClient]);

  // Chart Data and Options
  const pieChartData = useMemo(
    () => ({
      labels: ["Principal", "Interest", "Property Tax", "Insurance", "PMI", "HOA"],
      datasets: [
        {
          data: [
            paymentBreakdown.principal,
            paymentBreakdown.interest,
            paymentBreakdown.propertyTax,
            paymentBreakdown.insurance,
            paymentBreakdown.pmi,
            paymentBreakdown.hoa,
          ],
          backgroundColor: CHART_COLORS.primary,
          borderColor: CHART_COLORS.secondary.map((color) => color.replace("0.2", "1")),
          borderWidth: 2,
        },
      ],
    }),
    [paymentBreakdown]
  );

  const pieChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: "circle",
            font: { size: 14 },
            color: isDarkMode ? "white" : "black",
          },
        },
        datalabels: {
          color: "#fff",
          font: { weight: "bold" as const, size: 14 },
          formatter: (value: number) => {
            const total = Object.values(paymentBreakdown).reduce((a, b) => a + b, 0);
            return total ? ((value / total) * 100).toFixed(1) + "%" : "0%";
          },
        },
      },
    }),
    [isDarkMode, paymentBreakdown]
  );

  const lineChartData = useMemo(
    () => ({
      labels: amortizationSchedule.filter((_, i) => i % 12 === 0).map((item) => item.date),
      datasets: [
        {
          label: "Principal Balance",
          data: amortizationSchedule.filter((_, i) => i % 12 === 0).map((item) => item.balance),
          borderColor: CHART_COLORS.primary[0],
          backgroundColor: CHART_COLORS.secondary[0],
          tension: 0.4,
        },
        {
          label: "Cumulative Interest",
          data: amortizationSchedule.filter((_, i) => i % 12 === 0).map((item) => item.totalInterest),
          borderColor: CHART_COLORS.primary[1],
          backgroundColor: CHART_COLORS.secondary[1],
          tension: 0.4,
        },
      ],
    }),
    [amortizationSchedule]
  );

  const lineChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" },
          ticks: {
            color: isDarkMode ? "white" : "black",
            callback: (value: number | string) => "$" + (typeof value === "number" ? value.toLocaleString() : value),
          },
        },
        x: {
          grid: { display: false },
          ticks: { color: isDarkMode ? "white" : "black" },
        },
      },
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: "circle",
            font: { size: 14 },
            color: isDarkMode ? "white" : "black",
          },
        },
      },
    }),
    [isDarkMode]
  );

  // PDF Export - client-side only
  const exportPDF = async () => {
    if (!isClient) return;

    const element = document.getElementById("results-section");
    if (!element) return;

    try {
      // Dynamically import browser-only libraries
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      // Using require for jspdf-autotable
      const jspdfAutoTable = await import('jspdf-autotable');

      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] });

      pdf.setFontSize(20);
      pdf.text("Mortgage Calculator Results", 20, 30);
      pdf.setFontSize(12);
      pdf.text(`Loan Amount: ${formatCurrency(loanAmount)}`, 20, 50);
      pdf.text(`Interest Rate: ${interestRate}%`, 20, 65);
      pdf.text(`Loan Term: ${loanTerm} years`, 20, 80);
      pdf.text(`Monthly Payment: ${formatCurrency(totalPayment)}`, 20, 95);

      pdf.addPage();
      pdf.text("Amortization Schedule", 20, 30);

      const tableData = amortizationSchedule.map((row) => [
        row.payment,
        formatCurrency(row.principal),
        formatCurrency(row.interest),
        formatCurrency(row.balance),
        row.date,
      ]);

      // Cast pdf to access autoTable
      (pdf as any).autoTable({
        head: [["Payment", "Principal", "Interest", "Balance", "Date"]],
        body: tableData,
        startY: 40,
      });

      pdf.save("mortgage-calculator-results.pdf");
    } catch (error) {
      console.error("Failed to export PDF:", error);
    }
  };

  // Helper Components
  const NoteBox = ({ type, children }: { type: "info" | "warning" | "tip" | "important" | "example"; children: React.ReactNode }) => {
    const styles = {
      info: { bg: "bg-blue-500/10 dark:bg-blue-500/20", border: "border-blue-500/50", icon: <Info className="h-5 w-5 text-blue-500" />, title: "Information" },
      warning: { bg: "bg-yellow-500/10 dark:bg-yellow-500/20", border: "border-yellow-500/50", icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />, title: "Warning" },
      tip: { bg: "bg-green-500/10 dark:bg-green-500/20", border: "border-green-500/50", icon: <Lightbulb className="h-5 w-5 text-green-500" />, title: "Pro Tip" },
      important: { bg: "bg-red-500/10 dark:bg-red-500/20", border: "border-red-500/50", icon: <BookOpen className="h-5 w-5 text-red-500" />, title: "Important" },
      example: { bg: "bg-purple-500/10 dark:bg-purple-500/20", border: "border-purple-500/50", icon: <FileCode className="h-5 w-5 text-purple-500" />, title: "Example" },
    };

    return (
      <div className={`rounded-lg border p-4 my-6 ${styles[type].bg} ${styles[type].border}`}>
        <div className="flex items-center gap-2 mb-2">
          {styles[type].icon}
          <span className="font-semibold">{styles[type].title}</span>
        </div>
        <div className="ml-7">{children}</div>
      </div>
    );
  };

  const codeExamples = [
    {
      title: "Basic Mortgage Calculation",
      code: `function calculateMonthlyPayment(principal, rate, term) {
  const monthlyRate = rate / 100 / 12;
  const numberOfPayments = term * 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
         (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
}`,
      description: "JavaScript function to calculate monthly mortgage payment",
    },
    {
      title: "Interest Calculation",
      code: `function calculateInterest(principal, rate, time) {
  return principal * (rate / 100) * time;
}`,
      description: "Simple interest calculation for a given period",
    },
  ];

  // Client-side only function
  const handleCopyCode = (index: number) => {
    if (!isClient) return;
    
    navigator.clipboard.writeText(codeExamples[index].code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Client-side only function
  const scrollToTop = () => {
    if (!isClient) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <SiteHeader />
      <MortgageSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
          <div className="container relative z-10 max-w-screen-xl">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
                Mortgage <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
                Calculate your monthly mortgage payments and see a detailed breakdown of costs over time.
              </p>
            </div>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-12">
          <div className="container mx-auto max-w-[1200px] px-4 sm:px-6 md:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Enter Your Mortgage Details</CardTitle>
                    <CardDescription>
                      Provide your loan information to calculate monthly payments and view the amortization schedule.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Loan Information</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="loan-amount">Loan Amount</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="loan-amount"
                              type="number"
                              className="pl-9"
                              value={loanAmount}
                              onChange={(e) => setLoanAmount(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="interest-rate">Interest Rate</Label>
                            <span className="text-sm text-muted-foreground">{interestRate}%</span>
                          </div>
                          <Slider
                            id="interest-rate"
                            min={1}
                            max={15}
                            step={0.1}
                            value={[interestRate]}
                            onValueChange={(value) => setInterestRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="loan-term">Loan Term</Label>
                          <Select value={String(loanTerm)} onValueChange={(value) => setLoanTerm(Number(value))}>
                            <SelectTrigger id="loan-term">
                              <SelectValue placeholder="Select loan term" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 Years</SelectItem>
                              <SelectItem value="20">20 Years</SelectItem>
                              <SelectItem value="15">15 Years</SelectItem>
                              <SelectItem value="10">10 Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="down-payment">Down Payment</Label>
                            <span className="text-sm text-muted-foreground">{downPayment}%</span>
                          </div>
                          <Slider
                            id="down-payment"
                            min={3}
                            max={50}
                            step={1}
                            value={[downPayment]}
                            onValueChange={(value) => setDownPayment(value[0])}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Additional Costs</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="property-tax">Property Tax Rate</Label>
                            <span className="text-sm text-muted-foreground">{propertyTax}%</span>
                          </div>
                          <Slider
                            id="property-tax"
                            min={0}
                            max={5}
                            step={0.1}
                            value={[propertyTax]}
                            onValueChange={(value) => setPropertyTax(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="insurance">Insurance Rate</Label>
                            <span className="text-sm text-muted-foreground">{insurance}%</span>
                          </div>
                          <Slider
                            id="insurance"
                            min={0}
                            max={2}
                            step={0.1}
                            value={[insurance]}
                            onValueChange={(value) => setInsurance(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="hoa-toggle">Include HOA Fees</Label>
                            <Switch id="hoa-toggle" checked={includeHOA} onCheckedChange={setIncludeHOA} />
                          </div>
                          {includeHOA && (
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="hoa-fees"
                                type="number"
                                className="pl-9"
                                value={hoaFees}
                                onChange={(e) => setHoaFees(Number(e.target.value))}
                                placeholder="Monthly HOA fees"
                              />
                            </div>
                          )}
                        </div>
                        {downPayment < 20 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="pmi-toggle">Include PMI</Label>
                              <Switch id="pmi-toggle" checked={includePMI} onCheckedChange={setIncludePMI} />
                            </div>
                            {includePMI && (
                              <>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="pmi-rate">PMI Rate</Label>
                                  <span className="text-sm text-muted-foreground">{pmiRate}%</span>
                                </div>
                                <Slider
                                  id="pmi-rate"
                                  min={0.3}
                                  max={1.5}
                                  step={0.1}
                                  value={[pmiRate]}
                                  onValueChange={(value) => setPmiRate(value[0])}
                                />
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Extra Payment Options</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="extra-payment">Extra Monthly Payment</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="extra-payment"
                              type="number"
                              className="pl-9"
                              value={extraPayment}
                              onChange={(e) => setExtraPayment(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payment-frequency">Payment Frequency</Label>
                          <Select value={paymentFrequency} onValueChange={setPaymentFrequency}>
                            <SelectTrigger id="payment-frequency">
                              <SelectValue placeholder="Select payment frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                              <SelectItem value="accelerated">Accelerated Bi-Weekly</SelectItem>
                            </SelectContent>
                          </Select>
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
                    <div className="space-y-2 text-center">
                      <p className="text-sm text-muted-foreground">Monthly Payment</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(totalPayment)}</p>
                    </div>
                    <Separator />
                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="amortization">Amortization</TabsTrigger>
                        <TabsTrigger value="comparison">Comparison</TabsTrigger>
                      </TabsList>
                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="w-full max-w-[400px] mx-auto aspect-square">
                          {isClient && (
                            <DynamicPie data={pieChartData} options={pieChartOptions} />
                          )}
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Monthly Payment Details</h4>
                          <div className="grid gap-2">
                            {Object.entries(paymentBreakdown).map(
                              ([key, value]) =>
                                value > 0 && (
                                  <div key={key} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                    <span className="text-base">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                                    <span className="font-medium">{formatCurrency(value)}</span>
                                  </div>
                                )
                            )}
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span className="text-base">Total Monthly Payment</span>
                              <span>{formatCurrency(totalPayment)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="amortization" className="space-y-4">
                        <div className="w-full min-h-[300px]">
                          {isClient && (
                            <DynamicLine data={lineChartData} options={lineChartOptions} />
                          )}
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Loan Summary</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-base">Total Principal</span>
                              <span className="font-medium">{formatCurrency(loanAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-base">Total Interest</span>
                              <span className="font-medium">
                                {formatCurrency(
                                  amortizationSchedule[amortizationSchedule.length - 1]?.totalInterest || 0
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span className="text-base">Total Cost</span>
                              <span>
                                {formatCurrency(
                                  loanAmount +
                                    (amortizationSchedule[amortizationSchedule.length - 1]?.totalInterest || 0)
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="comparison" className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Payment Comparison</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-base">Monthly Payment</span>
                              <span className="font-medium">{formatCurrency(totalPayment)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-base">Bi-Weekly Payment</span>
                              <span className="font-medium">{formatCurrency(totalPayment / 2)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-base">Annual Payment</span>
                              <span className="font-medium">{formatCurrency(totalPayment * 12)}</span>
                            </div>
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
      <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">
        Home Financing Resource
      </span>
      <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
        Mortgage Calculator: Plan Your Home Purchase
      </h2>
      <p className="mt-3 text-base sm:text-lg text-muted-foreground">
        Make informed decisions about your home loan with our comprehensive mortgage tools
      </p>
    </div>
  </div>

  <div className="prose prose-lg dark:prose-invert max-w-none">
    <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
      <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
        <CardTitle id="introduction" className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          Understanding Mortgage Calculators
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p>
              A <strong>Mortgage Calculator</strong> is an essential financial tool that helps prospective and
              current homeowners understand the true cost of their home loans. By analyzing variables like loan
              amount, interest rate, term length, and additional costs, these calculators provide a clear picture
              of your financial commitment.
            </p>
            <p className="mt-3">With a mortgage calculator, you can:</p>
            <ul className="my-3 space-y-1">
              <li className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span>Calculate monthly payment amounts with precision</span>
              </li>
              <li className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Compare different loan scenarios and options</span>
              </li>
              <li className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-purple-600 flex-shrink-0" />
                <span>Understand the impact of interest rates on total cost</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span>Plan for the long-term financial commitment</span>
              </li>
            </ul>
            <p>
              Whether you're a first-time homebuyer exploring your options, considering refinancing, or planning
              to make extra payments, a mortgage calculator provides clarity and helps you make decisions with
              confidence.
            </p>
          </div>
          <div className="space-y-6">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
                Monthly Payment Breakdown
              </h3>
              <div className="h-[200px] w-full">
              {isClient && (
  <DynamicPie
    data={{
      labels: ["Principal", "Interest", "Property Tax", "Insurance"],
      datasets: [
        {
          data: [628, 832, 375, 165],
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(14, 165, 233, 0.8)",
            "rgba(6, 182, 212, 0.8)",
            "rgba(20, 184, 166, 0.8)",
          ],
        },
      ],
    }}
    options={{
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 12,
            padding: 10,
            font: {
              size: 11, // Default size without window reference
            },
          },
        },
      },
    }}
  />
)}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">
                Sample $300,000 mortgage at 6.5% with property taxes and insurance
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                <strong>Did You Know?</strong> In the early years of a 30-year mortgage, as much as 80-85% of your
                monthly payment goes toward interest rather than building equity in your home.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
            <CardContent className="pt-5">
              <div className="flex flex-col items-center text-center">
                <Calculator className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h3 className="mt-3 text-lg font-semibold text-blue-800 dark:text-blue-300">
                  Payment Planning
                </h3>
                <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                  Determine exactly what your monthly payments will be before committing
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
            <CardContent className="pt-5">
              <div className="flex flex-col items-center text-center">
                <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-300">
                  Cost Comparison
                </h3>
                <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                  Compare different loan options to find the best financial fit
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
            <CardContent className="pt-5">
              <div className="flex flex-col items-center text-center">
                <LineChart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <h3 className="mt-3 text-lg font-semibold text-purple-800 dark:text-purple-300">
                  Long-term Analysis
                </h3>
                <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                  Visualize equity building and interest payments over the loan term
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    <div className="mb-10" id="mortgage-basics">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Home className="h-6 w-6 text-blue-600" />
        Mortgage Calculator Fundamentals
      </h2>
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
        <h3 id="key-components" className="font-bold text-xl mb-4">
          Key Components of a Mortgage
        </h3>
        <div className="grid gap-4 md:grid-cols-2 gap-y-6">
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Principal Amount
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="mb-3">
                The principal is the initial amount borrowed to purchase your home, typically the home price
                minus your down payment.
              </p>
              <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">Example:</p>
                <ul className="space-y-1">
                  <li>Home price: $350,000</li>
                  <li>Down payment: $70,000 (20%)</li>
                  <li>Loan principal: $280,000</li>
                </ul>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                <p>
                  A larger down payment reduces your principal amount, which lowers your monthly payments and
                  potentially eliminates the need for private mortgage insurance.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Percent className="h-5 w-5 text-blue-600" />
                Interest Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="mb-3">
                The interest rate is the percentage charged by the lender for borrowing the principal amount,
                determined by factors like credit score, loan term, and market conditions.
              </p>
              <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Rate Types:</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>Fixed Rate:</strong> Interest rate remains constant throughout the loan term
                  </li>
                  <li>
                    <strong>Adjustable Rate (ARM):</strong> Rate changes periodically based on market indices
                  </li>
                </ul>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                <p>
                  Even a 0.5% difference in interest rate can significantly impact your monthly payment and
                  total interest paid over the loan term.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 gap-y-6">
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Loan Term
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="mb-3">
                The loan term is the length of time you have to repay the mortgage, typically ranging from 15 to
                30 years.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-1">30-Year Term</h4>
                  <ul className="space-y-1 text-xs">
                    <li> Lower monthly payments</li>
                    <li> More total interest paid</li>
                    <li> Slower equity building</li>
                    <li> Better short-term affordability</li>
                  </ul>
                </div>
                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-1">15-Year Term</h4>
                  <ul className="space-y-1 text-xs">
                    <li> Higher monthly payments</li>
                    <li> Less total interest paid</li>
                    <li> Faster equity building</li>
                    <li> Lower interest rates typically</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Additional Costs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="mb-3">
                Beyond principal and interest, a complete mortgage calculator includes these additional
                homeownership costs:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-blue-600 mt-1" />
                  <span>
                    <strong>Property Taxes:</strong> Annual taxes assessed by local governments based on
                    property value
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-blue-600 mt-1" />
                  <span>
                    <strong>Homeowners Insurance:</strong> Protection against damage to your home and liability
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-blue-600 mt-1" />
                  <span>
                    <strong>Private Mortgage Insurance (PMI):</strong> Required for down payments less than 20%
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-blue-600 mt-1" />
                  <span>
                    <strong>HOA Fees:</strong> Monthly or annual fees for community amenities and services
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 mb-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>Important Note:</strong> While PITI (Principal, Interest, Taxes, and Insurance) represents
            the core monthly payment, many homeowners face additional costs like maintenance, repairs,
            utilities, and potential HOA fees. Experts recommend budgeting 1-3% of your home's value annually
            for maintenance and repairs.
          </p>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-4" id="amortization">
        Understanding Amortization
      </h3>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Amortization?</h4>
              <p className="mb-3">
                Amortization is the process of spreading out a loan into a series of fixed payments over time.
                Each payment is divided between interest and principal in a way that gradually reduces the loan
                balance to zero.
              </p>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h5 className="font-medium text-blue-800 dark:text-blue-300">Key Amortization Insights:</h5>
                <ul className="mt-2 space-y-1 text-sm">
                  <li> Early payments are mostly interest</li>
                  <li> Later payments are mostly principal</li>
                  <li> Total payment amount remains constant (for fixed-rate loans)</li>
                  <li> Equity builds slowly at first, then accelerates</li>
                </ul>
              </div>
              <p className="mt-4 text-sm">
                Understanding your amortization schedule helps you see how much of each payment goes toward
                building equity versus paying interest, and how this ratio changes over time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Payment Allocation Over Time</h4>
              // Find this section around line 1170
<div className="h-[250px] sm:h-[300px] w-full">
  {isClient && (
    <DynamicBar
      data={{
        labels: ["Year 1", "Year 5", "Year 10", "Year 15", "Year 20", "Year 25", "Year 30"],
        datasets: [
          {
            label: "Principal",
            data: [5112, 6792, 9321, 12796, 17571, 24126, 33120],
            backgroundColor: "rgba(59, 130, 246, 0.7)",
          },
          {
            label: "Interest",
            data: [18231, 16551, 14022, 10547, 5772, 2217, 0],
            backgroundColor: "rgba(14, 165, 233, 0.7)",
          },
        ],
      }}
      options={{
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
        },
        scales: {
          x: {
            stacked: true,
            title: { 
              display: true, 
              text: "Annual Payment Amount ($)",
              font: {
                size: 12 // Fixed size without window reference
              }
            },
            ticks: {
              font: {
                size: 12 // Fixed size without window reference
              }
            }
          },
          y: { 
            stacked: true,
            ticks: {
              font: {
                size: 12 // Fixed size without window reference
              }
            }
          },
        },
      }}
    />
  )}
</div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Payment composition for a $300,000 mortgage at 6.5% interest (30-year fixed)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div className="mb-10" id="using-calculator">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calculator className="h-6 w-6 text-blue-600" />
        Using the Mortgage Calculator Effectively
      </h2>
      <Card className="overflow-hidden border-green-200 dark:border-green-900 mb-6">
        <CardHeader className="bg-green-50 dark:bg-green-900/40">
          <CardTitle>Step-by-Step Guide</CardTitle>
          <CardDescription>How to get the most from your mortgage calculations</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-4">
                Basic Mortgage Calculation
              </h3>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 font-medium text-sm">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Enter home price and down payment</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This determines your loan amount (principal)
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 font-medium text-sm">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Input interest rate</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Use current market rates or rate quotes you've received
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 font-medium text-sm">
                    3
                  </span>
                  <div>
                    <p className="font-medium">Select loan term</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Typically 15 or 30 years, but other options may be available
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 font-medium text-sm">
                    4
                  </span>
                  <div>
                    <p className="font-medium">Add property taxes and insurance</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Include annual property tax and insurance premium estimates
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 font-medium text-sm">
                    5
                  </span>
                  <div>
                    <p className="font-medium">Review monthly payment and total costs</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Analyze both short-term affordability and long-term expense
                    </p>
                  </div>
                </li>
              </ol>
            </div>
            <div className="space-y-6">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium mb-3">Sample Mortgage Calculation</h4>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <p className="text-xs text-muted-foreground">Home Price</p>
                      <p className="font-medium">$350,000</p>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <p className="text-xs text-muted-foreground">Down Payment</p>
                      <p className="font-medium">$70,000 (20%)</p>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <p className="text-xs text-muted-foreground">Loan Amount</p>
                      <p className="font-medium">$280,000</p>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <p className="text-xs text-muted-foreground">Interest Rate</p>
                      <p className="font-medium">6.5%</p>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <p className="text-xs text-muted-foreground">Loan Term</p>
                      <p className="font-medium">30 years</p>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <p className="text-xs text-muted-foreground">Property Tax</p>
                      <p className="font-medium">$3,500/year</p>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded font-medium">
                    <div className="flex justify-between">
                      <span>Monthly Principal & Interest:</span>
                      <span>$1,768</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Monthly Tax & Insurance:</span>
                      <span>$458</span>
                    </div>
                    <div className="flex justify-between mt-1 text-lg">
                      <span>Total Monthly Payment:</span>
                      <span>$2,226</span>
                    </div>
                  </div>
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-amber-800 dark:text-amber-300">
                    <div className="flex justify-between text-sm">
                      <span>Total Paid Over 30 Years:</span>
                      <span>$801,360</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Interest Paid:</span>
                      <span>$356,480</span>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-green-700 dark:text-green-400">Advanced Features</h3>
              <div className="grid gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Extra Payment Analysis
                  </h4>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    See how making additional principal payments can reduce your loan term and save on interest
                    costs.
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Refinance Comparison
                  </h4>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    Compare your current mortgage with refinancing options to determine if it makes financial
                    sense.
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                    <LineChart className="h-4 w-4" />
                    Amortization Schedule
                  </h4>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    View a detailed breakdown of each payment over the life of your loan, showing interest and
                    principal allocation.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Separator className="my-6" />
          <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4">
            Interpreting Your Results
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base">Affordability Assessment</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm">
                <p>Monthly payment should ideally not exceed 28-33% of your gross monthly income.</p>
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p>
                    <strong>Example:</strong>
                  </p>
                  <ul className="space-y-1">
                    <li>Gross annual income: $100,000</li>
                    <li>Monthly income: $8,333</li>
                    <li>Housing budget (28%): $2,333</li>
                    <li>Maximum recommended payment: $2,333</li>
                  </ul>
                </div>
                <p className="mt-3">
                  Remember to consider all housing costs, including utilities, maintenance, and HOA fees.
                </p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base">Interest Costs</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm">
                <p>Total interest paid over the life of your loan can often exceed the original principal amount.</p>
                <div className="h-[160px] w-full mt-3">
                  <DynamicPie
                    data={{
                      labels: ["Principal", "Interest"],
                      datasets: [
                        {
                          data: [280000, 356480],
                          backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(220, 38, 38, 0.8)"],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { 
                          position: "bottom", 
                          labels: { 
                            padding: 10,
                            font: {
                              size: 12,
                            }
                          } 
                        },
                      },
                    }}
                  />
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Sample $280,000 mortgage at 6.5% for 30 years
                </p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base">Equity Building</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm">
                <p>Track how your ownership stake in the home grows over time as you pay down the mortgage.</p>
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <h4 className="font-medium">Equity Milestones (30-year, 6.5%):</h4>
                  <ul className="space-y-1 mt-1">
                    <li>After 5 years: ~8% of principal paid</li>
                    <li>After 10 years: ~18% of principal paid</li>
                    <li>After 15 years: ~30% of principal paid</li>
                    <li>After 20 years: ~46% of principal paid</li>
                  </ul>
                </div>
                <p className="mt-3">
                  Home value appreciation also contributes to equity building alongside principal payments.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-300">Don't Forget Closing Costs</p>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                  When budgeting for a home purchase, remember that closing costs typically range from 2-5% of
                  the loan amount. These include loan origination fees, appraisal fees, title insurance, and
                  various prepaid items like property taxes and insurance premiums. Be sure to factor these into
                  your upfront cost calculations.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div className="mb-10" id="mortgage-strategies">
      <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
          <CardTitle>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-2xl">Strategies to Save on Your Mortgage</span>
            </div>
          </CardTitle>
          <CardDescription>Smart approaches to reduce your total mortgage cost</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3
                id="down-payment"
                className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2"
              >
                <TrendingUp className="h-5 w-5" />
                Down Payment Strategies
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">20% Down Payment Target</h4>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    Aiming for a 20% down payment eliminates the need for Private Mortgage Insurance (PMI),
                    which typically costs 0.5-1% of the loan amount annually.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">
                    Down Payment Assistance Programs
                  </h4>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    Many states and localities offer down payment assistance for first-time homebuyers. These
                    programs can provide grants or low-interest loans to help with your down payment.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">Down Payment Impact Calculator</h4>
                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg text-xs">
                    <table className="w-full text-sm">
                      <thead className="text-left">
                        <tr>
                          <th className="px-2 sm:px-3 py-2">Down Payment</th>
                          <th className="px-2 sm:px-3 py-2">Loan Amount</th>
                          <th className="px-2 sm:px-3 py-2">Monthly P&I</th>
                          <th className="px-2 sm:px-3 py-2">PMI</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-2 sm:px-3 py-2">5% ($17,500)</td>
                          <td className="px-2 sm:px-3 py-2">$332,500</td>
                          <td className="px-2 sm:px-3 py-2">$2,101</td>
                          <td className="px-2 sm:px-3 py-2">~$166/mo</td>
                        </tr>
                        <tr>
                          <td className="px-2 sm:px-3 py-2">10% ($35,000)</td>
                          <td className="px-2 sm:px-3 py-2">$315,000</td>
                          <td className="px-2 sm:px-3 py-2">$1,990</td>
                          <td className="px-2 sm:px-3 py-2">~$131/mo</td>
                        </tr>
                        <tr>
                          <td className="px-2 sm:px-3 py-2">20% ($70,000)</td>
                          <td className="px-2 sm:px-3 py-2">$280,000</td>
                          <td className="px-2 sm:px-3 py-2">$1,768</td>
                          <td className="px-2 sm:px-3 py-2">$0</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="mt-2 text-muted-foreground">
                      Based on $350,000 home price, 6.5% interest, 30-year term
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3
                id="term-comparison"
                className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2"
              >
                <Clock className="h-5 w-5" />
                Loan Term Comparison
              </h3>
              <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50/50 dark:bg-green-900/20 mb-4">
                <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  15-Year vs. 30-Year Terms
                </h4>
                <div className="mt-3">
                  <div className="h-[200px] w-full">
                    <DynamicBar
                      data={{
                        labels: ["Monthly Payment", "Total Interest", "Years to Pay Off"],
                        datasets: [
                          {
                            label: "15-Year Mortgage",
                            data: [2391, 150380, 15],
                            backgroundColor: "rgba(16, 185, 129, 0.7)",
                          },
                          {
                            label: "30-Year Mortgage",
                            data: [1768, 356480, 30],
                            backgroundColor: "rgba(59, 130, 246, 0.7)",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                        min: 1,
                            type: "logarithmic", 
                            ticks: {
                              font: {
                                size: 12 
                              }
                            }
                          },
                          x: {
                            ticks: {
                              font: {
                                size: 12 
                              }
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            labels: {
                              font: {
                                size: 12 
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="mt-4 p-2 bg-white dark:bg-gray-800 rounded-md text-xs">
                  <p className="font-medium mb-1">Key Takeaways:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>15-year term saves $206,100 in interest</li>
                    <li>30-year term has $623 lower monthly payment</li>
                    <li>15-year builds equity 2x faster</li>
                    <li>15-year typically has 0.5% lower interest rate</li>
                  </ul>
                </div>
              </div>
              <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Extra Payment Strategy
                </h4>
                <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                  Making extra payments toward principal can significantly reduce your loan term and interest
                  costs without committing to higher required monthly payments.
                </p>
                <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-md text-xs">
                  <p className="font-medium mb-1">Impact of Extra $100 Monthly Payment:</p>
                  <ul className="space-y-1">
                    <li> Loan payoff: 4 years sooner</li>
                    <li> Interest savings: ~$60,000</li>
                    <li> Total cost reduction: 7.5%</li>
                  </ul>
                  <p className="mt-2 text-muted-foreground">
                    Based on $280,000 mortgage at 6.5% for 30 years
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Separator className="my-8" />
          <div>
            <h3 className="text-xl font-bold mb-4">Mortgage Type Comparison</h3>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="min-w-[600px] sm:min-w-full">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 text-left">
                        Mortgage Type
                      </th>
                      <th className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 text-left">Best For</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 text-left">Pros</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 text-left">Cons</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 font-medium">
                        Fixed-Rate
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                        Long-term homeowners, stable income
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                        Predictable payments, protection from rate increases
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                        Higher initial rates than ARMs, doesn't benefit from rate decreases
                      </td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 font-medium">
                        Adjustable-Rate (ARM)
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                        Short-term owners, rising income
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                        Lower initial rates, potential savings if rates drop
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                        Payment uncertainty, risk of significant increases
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 font-medium">
                        FHA Loan
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                        First-time buyers, lower credit scores
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                        Lower down payment (3.5%), more lenient approval
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                        Mortgage insurance for loan's lifetime, more restrictions
                      </td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 font-medium">
                        VA Loan
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                        Military service members, veterans
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                        No down payment required, no PMI, competitive rates
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                        VA funding fee, must meet service requirements
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 font-medium">
                        Jumbo Loan
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                        High-value property buyers
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                        Financing for expensive homes above conforming limits
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                        Stricter requirements, higher rates and down payments
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div className="mb-10" id="mortgage-statistics">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        Mortgage Trends and Statistics
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-blue-100 p-2 sm:p-3 dark:bg-blue-900/60">
                <Percent className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mt-2 sm:mt-4 text-base sm:text-lg font-semibold text-blue-800 dark:text-blue-300">
                Average 30-Year Rate
              </h3>
              <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">6.85%</p>
              <p className="mt-1 text-xs sm:text-sm text-blue-600 dark:text-blue-500">As of April 2025</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-green-100 p-2 sm:p-3 dark:bg-green-900/60">
                <Home className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mt-2 sm:mt-4 text-base sm:text-lg font-semibold text-green-800 dark:text-green-300">
                Median Home Price
              </h3>
              <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold text-green-600 dark:text-green-400">$428,700</p>
              <p className="mt-1 text-xs sm:text-sm text-green-600 dark:text-green-500">National average</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-purple-100 p-2 sm:p-3 dark:bg-purple-900/60">
                <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mt-2 sm:mt-4 text-base sm:text-lg font-semibold text-purple-800 dark:text-purple-300">
                Average Down Payment
              </h3>
              <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">13%</p>
              <p className="mt-1 text-xs sm:text-sm text-purple-600 dark:text-purple-500">Of purchase price</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-amber-100 p-2 sm:p-3 dark:bg-amber-900/60">
                <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="mt-2 sm:mt-4 text-base sm:text-lg font-semibold text-amber-800 dark:text-amber-300">
                Average Loan Term
              </h3>
              <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">29.5</p>
              <p className="mt-1 text-xs sm:text-sm text-amber-600 dark:text-amber-500">Years for new mortgages</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-blue-600" />
            Historical Mortgage Rate Trends
          </CardTitle>
          <CardDescription>U.S. 30-year fixed mortgage rates over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] sm:h-[300px] w-full">
            <DynamicLine
              data={{
                labels: ["1975", "1980", "1985", "1990", "1995", "2000", "2005", "2010", "2015", "2020", "2025"],
                datasets: [
                  {
                    label: "30-Year Fixed Rate",
                    data: [9.0, 13.7, 11.2, 9.9, 7.9, 8.1, 5.9, 4.7, 3.9, 3.1, 6.8],
                    borderColor: "rgba(59, 130, 246, 0.8)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    title: { 
                      display: true, 
                      text: "Interest Rate (%)",
                      font: {
                        size: 12 
                      }
                    },
                    ticks: {
                      font: {
                        size: 12 
                      }
                    }
                  },
                  x: {
                    ticks: {
                      font: {
                        size: 12 
                      },
                      maxRotation: 45,
                      minRotation: 0 
                    }
                  }
                },
                plugins: {
                  legend: {
                    labels: {
                      font: {
                        size: 12 
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800 mb-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-300">Market Outlook: 2025-2026</p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
              After the significant rate increases in 2022-2023, mortgage rates have stabilized in the
              mid-to-high 6% range. Most housing economists project gradual decreases through 2025-2026,
              potentially reaching the 5.5-6% range as inflation pressures ease. While these rates are
              significantly higher than the historic lows of 2020-2021, they remain below long-term historical
              averages from the 1970s-2000s.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div id="conclusion">
      <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
          <CardTitle id="summary" className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-700 dark:text-blue-400" />
            Making Smart Mortgage Decisions
          </CardTitle>
          <CardDescription>The path to informed homeownership</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p>
            A <strong>mortgage calculator</strong> is more than just a tool for determining monthly paymentsit's
            your guide to understanding the long-term financial implications of what is likely the largest
            purchase of your life. By exploring different scenarios, comparing options, and visualizing
            amortization schedules, you can make decisions that align with both your current budget and your
            future financial goals.
          </p>
          <p className="mt-4" id="key-takeaways">
            Remember these key principles when planning your mortgage:
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Financial Planning</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                  <span className="text-blue-800 dark:text-blue-300">
                    Look beyond the monthly payment to total loan cost
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                  <span className="text-blue-800 dark:text-blue-300">
                    Factor in all housing costs, not just the mortgage
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                  <span className="text-blue-800 dark:text-blue-300">
                    Build contingency funds for repairs and maintenance
                  </span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
              <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Optimization Strategies</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-green-800 dark:text-green-300">
                    Make extra principal payments when possible
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-green-800 dark:text-green-300">
                    Consider a 15-year term if you can afford higher payments
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-green-800 dark:text-green-300">
                    Shop around for the best rates and lowest fees
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Calculator className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-base sm:text-lg text-blue-800 dark:text-blue-300 text-center sm:text-left">
                  Ready to explore your mortgage options?
                </p>
                <p className="mt-1 text-blue-700 dark:text-blue-400 text-center sm:text-left">
                  Use our <strong>Mortgage Calculator</strong> above to plan your home purchase! For more
                  financial planning tools, explore our related calculators:
                </p>
                <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                  <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                    <Link href="/calculators/affordability">
                      <Home className="h-4 w-4 mr-1" />
                      <span className="whitespace-nowrap">Home Affordability</span>
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                    <Link href="/calculators/refinance">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      <span className="whitespace-nowrap">Refinance Calculator</span>
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                    <Link href="/calculators/amortization">
                      <LineChart className="h-4 w-4 mr-1" />
                      <span className="whitespace-nowrap">Amortization Schedule</span>
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
      
      {/* Back to top button - only rendered on client */}
      {isClient && showBackToTop && (
        <Button
          className="fixed bottom-4 right-4 rounded-full h-10 w-10 p-0"
          onClick={scrollToTop}
        >
          <span className="sr-only">Back to top</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </Button>
      )}
    </div>
  );
}