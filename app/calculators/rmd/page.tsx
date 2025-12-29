"use client"
  
import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  Calculator,
  Download,
  Share2,
  PieChart,
  BarChart3,
  RefreshCw,
  TrendingUp,
  LineChart,
  Info,
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  Users,
  Heart,
  ArrowRightLeft,
  CalendarDays,
  Percent,
  CheckCircle,
  XCircle,
  Briefcase,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar, Line, Pie } from "react-chartjs-2";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import type { ChartOptions } from "chart.js";
import RmdSchema from './schema';

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
);

// IRS Uniform Lifetime Table for 2022 and later
const irsLifeExpectancyTable: { [key: number]: number } = {
  72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0,
  79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0,
  86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8,
  93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8,
  100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2, 104: 4.9, 105: 4.6, 106: 4.3,
  107: 4.1, 108: 3.9, 109: 3.7, 110: 3.5, 111: 3.4, 112: 3.3, 113: 3.1,
  114: 3.0, 115: 2.9, 116: 2.8, 117: 2.7, 118: 2.5, 119: 2.3, 120: 2.0,
};

export default function RMDCalculator() {
  // Personal & Account Information
  const [currentAge, setCurrentAge] = useState<number>(72);
  const [accountBalance, setAccountBalance] = useState<number>(500000);
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [projectedReturn, setProjectedReturn] = useState<number>(5);
  const [taxRate, setTaxRate] = useState<number>(25);
  const [hasMultipleAccounts, setHasMultipleAccounts] = useState<boolean>(false);
  const [additionalAccounts, setAdditionalAccounts] = useState<{ balance: number }[]>([]);

  // Results State
  const [currentRMD, setCurrentRMD] = useState<number>(0);
  const [projectedRMDs, setProjectedRMDs] = useState<
    { age: number; balance: number; rmd: number; tax: number }[]
  >([]);
  const [lifeExpectancyFactor, setLifeExpectancyFactor] = useState<number>(0);

  // Calculate RMD and projections
  useEffect(() => {
    // Get life expectancy factor for current age
    const factor = irsLifeExpectancyTable[currentAge] || 0;
    setLifeExpectancyFactor(factor);

    // Calculate current year RMD
    const totalBalance =
      accountBalance +
      additionalAccounts.reduce((sum, account) => sum + account.balance, 0);
    const rmd = factor > 0 ? totalBalance / factor : 0;
    setCurrentRMD(rmd);

    // Calculate projections for next 10 years or until age 120
    const projections = [];
    let projectedBalance = totalBalance;
    let projectedAge = currentAge;

    while (projectedAge <= Math.min(120, currentAge + 10)) {
      const yearFactor = irsLifeExpectancyTable[projectedAge] || 0;
      const yearRMD = yearFactor > 0 ? projectedBalance / yearFactor : 0;
      const taxAmount = yearRMD * (taxRate / 100);

      projections.push({
        age: projectedAge,
        balance: projectedBalance,
        rmd: yearRMD,
        tax: taxAmount,
      });

      // Project next year's balance (after RMD and growth)
      projectedBalance = (projectedBalance - yearRMD) * (1 + projectedReturn / 100);
      projectedAge++;
    }

    setProjectedRMDs(projections);
  }, [
    currentAge,
    accountBalance,
    projectedReturn,
    taxRate,
    hasMultipleAccounts,
    additionalAccounts,
  ]);

  // Chart colors
  const chartColors = {
    primary: [
      "rgba(99, 102, 241, 0.9)",
      "rgba(59, 130, 246, 0.9)",
      "rgba(14, 165, 233, 0.9)",
      "rgba(6, 182, 212, 0.9)",
      "rgba(20, 184, 166, 0.9)",
    ],
    secondary: [
      "rgba(99, 102, 241, 0.2)",
      "rgba(59, 130, 246, 0.2)",
      "rgba(14, 165, 233, 0.2)",
      "rgba(6, 182, 212, 0.2)",
      "rgba(20, 184, 166, 0.2)",
    ],
  };

  // RMD Projection Chart
  const generateProjectionChart = () => {
    return {
      labels: projectedRMDs.map((p) => `Age ${p.age}`),
      datasets: [
        {
          label: "Account Balance",
          data: projectedRMDs.map((p) => p.balance),
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4,
          yAxisID: "y",
        },
        {
          label: "Required Distribution",
          data: projectedRMDs.map((p) => p.rmd),
          borderColor: chartColors.primary[1],
          backgroundColor: chartColors.secondary[1],
          tension: 0.4,
          yAxisID: "y1",
        },
      ],
    };
  };

  const projectionChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Account Balance",
        },
        grid: { color: "rgba(156, 163, 175, 0.1)" },
        ticks: {
          callback: (value) =>
            "$" + (typeof value === "number" ? value.toLocaleString() : value),
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Required Distribution",
        },
        grid: { display: false },
        ticks: {
          callback: (value) =>
            "$" + (typeof value === "number" ? value.toLocaleString() : value),
        },
      },
      x: { grid: { display: false } },
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: { padding: 20, usePointStyle: true, pointStyle: "circle" },
      },
    },
  };

  // Tax Impact Chart
  const generateTaxChart = () => {
    return {
      labels: projectedRMDs.map((p) => `Age ${p.age}`),
      datasets: [
        {
          label: "Pre-Tax Distribution",
          data: projectedRMDs.map((p) => p.rmd),
          backgroundColor: chartColors.primary[0],
          borderColor: chartColors.secondary[0].replace("0.2", "1"),
          borderWidth: 2,
          borderRadius: 6,
          stack: "stack0",
        },
        {
          label: "Estimated Tax",
          data: projectedRMDs.map((p) => p.tax),
          backgroundColor: chartColors.primary[1],
          borderColor: chartColors.secondary[1].replace("0.2", "1"),
          borderWidth: 2,
          borderRadius: 6,
          stack: "stack0",
        },
      ],
    };
  };

  const taxChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: "rgba(156, 163, 175, 0.1)" },
        ticks: {
          callback: (value) =>
            "$" + (typeof value === "number" ? value.toLocaleString() : value),
        },
      },
      x: {
        stacked: true,
        grid: { display: false },
      },
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: { padding: 20, usePointStyle: true, pointStyle: "circle" },
      },
      datalabels: {
        color: "#fff",
        font: { weight: "bold" },
        formatter: (value: number) => "$" + value.toLocaleString(),
      },
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const exportPDF = async () => {
    const element = document.getElementById("results-section");
    if (!element) return;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("rmd-analysis.pdf");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <RmdSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        RMD{" "}
        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">
          Calculator
        </span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate your Required Minimum Distribution (RMD) from retirement accounts and plan your withdrawals effectively.
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
                    <CardTitle>Enter Account Details</CardTitle>
                    <CardDescription>
                      Provide information about your retirement accounts to calculate your Required Minimum Distribution.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Personal Information</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="current-age">Current Age</Label>
                          <Input
                            id="current-age"
                            type="number"
                            min={72}
                            max={120}
                            value={currentAge}
                            onChange={(e) => setCurrentAge(Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date-of-birth">Date of Birth (Optional)</Label>
                          <Input
                            id="date-of-birth"
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Account Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Account Information</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="account-balance">Account Balance (as of Dec 31)</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="account-balance"
                              type="number"
                              className="pl-9"
                              value={accountBalance}
                              onChange={(e) => setAccountBalance(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="multiple-accounts">Multiple Retirement Accounts</Label>
                            <Switch
                              id="multiple-accounts"
                              checked={hasMultipleAccounts}
                              onCheckedChange={setHasMultipleAccounts}
                            />
                          </div>
                          {hasMultipleAccounts && (
                            <Button
                              variant="outline"
                              onClick={() => setAdditionalAccounts([...additionalAccounts, { balance: 0 }])}
                              className="w-full"
                            >
                              Add Account
                            </Button>
                          )}
                        </div>
                        {hasMultipleAccounts &&
                          additionalAccounts.map((account, index) => (
                            <div key={index} className="space-y-2">
                              <Label htmlFor={`additional-account-${index}`}>
                                Additional Account {index + 1}
                              </Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id={`additional-account-${index}`}
                                  type="number"
                                  className="pl-9"
                                  value={account.balance}
                                  onChange={(e) => {
                                    const newAccounts = [...additionalAccounts];
                                    newAccounts[index].balance = Number(e.target.value);
                                    setAdditionalAccounts(newAccounts);
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Projections & Tax */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Projections & Tax</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="projected-return">Projected Annual Return</Label>
                            <span className="text-sm text-muted-foreground">{projectedReturn}%</span>
                          </div>
                          <Slider
                            id="projected-return"
                            min={0}
                            max={12}
                            step={0.5}
                            value={[projectedReturn]}
                            onValueChange={(value) => setProjectedReturn(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="tax-rate">Estimated Tax Rate</Label>
                            <span className="text-sm text-muted-foreground">{taxRate}%</span>
                          </div>
                          <Slider
                            id="tax-rate"
                            min={0}
                            max={50}
                            step={1}
                            value={[taxRate]}
                            onValueChange={(value) => setTaxRate(value[0])}
                          />
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
                      <p className="text-sm text-muted-foreground">Required Minimum Distribution</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(currentRMD)}</p>
                      <p className="text-sm text-muted-foreground">
                        Life Expectancy Factor: {lifeExpectancyFactor}
                      </p>
                    </div>

                    <Separator />

                    <Tabs defaultValue="projections" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="projections">Projections</TabsTrigger>
                        <TabsTrigger value="tax">Tax Impact</TabsTrigger>
                      </TabsList>

                      <TabsContent value="projections" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateProjectionChart()} options={projectionChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">RMD Schedule</h4>
                          <div className="grid gap-2">
                            {projectedRMDs.map((projection, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-2 rounded-lg bg-muted/50"
                              >
                                <span className="text-sm">Age {projection.age}</span>
                                <span className="font-medium">{formatCurrency(projection.rmd)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="tax" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={generateTaxChart()} options={taxChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Tax Impact</h4>
                          <div className="grid gap-2">
                            {projectedRMDs.map((projection, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-2 rounded-lg bg-muted/50"
                              >
                                <span className="text-sm">Age {projection.age}</span>
                                <div className="text-right">
                                  <div className="font-medium">
                                    {formatCurrency(projection.rmd - projection.tax)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Tax: {formatCurrency(projection.tax)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* RMD Summary */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">RMD Summary</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• First RMD due by April 1st following the year you turn 72</li>
                              <li>• Subsequent RMDs due by December 31st each year</li>
                              <li>• Failure to take RMDs may result in a 50% penalty</li>
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
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">
                  Retirement Planning
                </span>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
                  RMD Calculator: Plan Your Required Withdrawals
                </h2>
                <p className="mt-3 text-muted-foreground text-lg">
                  Navigate retirement account distributions with confidence and precision
                </p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Introduction Section */}
              <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    Understanding Required Minimum Distributions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 id="what-are-rmds" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">
                    What are RMDs?
                  </h3>

                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex-1">
                      <p>
                        <strong>Required Minimum Distributions (RMDs)</strong> are mandatory withdrawals that retirement account owners must take from their tax-advantaged retirement accounts once they reach a certain age. These withdrawals ensure that retirement assets—which have grown tax-deferred for decades—eventually become taxable income.
                      </p>
                      <p className="mt-2">RMDs apply to several types of retirement accounts, including:</p>
                      <ul className="my-3 space-y-1">
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Traditional IRAs and SIMPLE IRAs</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>Traditional 401(k) and 403(b) plans</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span>SEP IRAs and SARSEP plans</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <span>457(b) plans and profit-sharing plans</span>
                        </li>
                      </ul>
                      <p>
                        The IRS requires these distributions to ensure that retirement funds—which benefited from tax-deferred growth—don’t remain untaxed indefinitely. Failing to take your RMD results in one of the steepest penalties in the tax code: <strong>25% of the amount not withdrawn</strong> (reduced to 10% if corrected promptly).
                      </p>
                    </div>
                    <div className="md:w-[300px] h-[260px] flex-shrink-0">
                      <Card className="h-full flex flex-col">
                        <CardHeader className="py-3 bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/60">
                          <CardTitle className="text-sm font-medium text-center">
                            RMD Age Requirements Timeline
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center p-4">
                          <div className="w-full h-full">
                            <Line
                              data={{
                                labels: ["2019", "2020-2022", "2023-2032", "2033+"],
                                datasets: [
                                  {
                                    label: "RMD Starting Age",
                                    data: [70.5, 72, 73, 75],
                                    borderColor: "rgba(59, 130, 246, 0.8)",
                                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                                    tension: 0.4,
                                    pointRadius: 6,
                                    pointBackgroundColor: "rgba(59, 130, 246, 0.9)",
                                  },
                                ],
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                  y: {
                                    min: 70,
                                    max: 76,
                                    title: {
                                      display: true,
                                      text: "Age",
                                    },
                                  },
                                },
                                plugins: {
                                  legend: {
                                    position: "bottom",
                                    labels: { boxWidth: 10, padding: 10 },
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: function (context) {
                                        return "Age: " + context.parsed.y;
                                      },
                                    },
                                  },
                                },
                              }}
                            />
                          </div>
                        </CardContent>
                        <div className="px-4 pb-3 text-xs text-center text-muted-foreground">
                          SECURE Act and SECURE 2.0 gradually raised the RMD starting age
                        </div>
                      </Card>
                    </div>
                  </div>

                  <h4 id="rmd-changes" className="font-semibold text-xl mt-6">
                    Recent Changes to RMD Rules
                  </h4>
                  <div className="mt-4 mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-900">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-blue-200 dark:border-blue-800">
                            <th className="text-left py-2 px-4">Legislation</th>
                            <th className="text-left py-2 px-4">Key Changes</th>
                            <th className="text-left py-2 px-4">Impact on Retirees</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          <tr className="border-b border-blue-100 dark:border-blue-800">
                            <td className="py-2 px-4 font-medium">SECURE Act (2019)</td>
                            <td className="py-2 px-4">Increased RMD age from 70½ to 72</td>
                            <td className="py-2 px-4">1-2 extra years of tax-deferred growth</td>
                          </tr>
                          <tr className="border-b border-blue-100 dark:border-blue-800">
                            <td className="py-2 px-4 font-medium">SECURE 2.0 (2022)</td>
                            <td className="py-2 px-4">Age increased to 73 in 2023, then to 75 in 2033</td>
                            <td className="py-2 px-4">Potentially several more years of tax-deferred growth</td>
                          </tr>
                          <tr className="border-b border-blue-100 dark:border-blue-800">
                            <td className="py-2 px-4 font-medium">SECURE 2.0 (2022)</td>
                            <td className="py-2 px-4">Reduced penalty from 50% to 25% (10% if corrected promptly)</td>
                            <td className="py-2 px-4">Less severe penalties for missed RMDs</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 font-medium">SECURE 2.0 (2022)</td>
                            <td className="py-2 px-4">Eliminated RMDs for Roth accounts in employer plans</td>
                            <td className="py-2 px-4">Roth 401(k)s now have same treatment as Roth IRAs</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <p>
                    An <strong>RMD Calculator</strong> helps you determine exactly how much you need to withdraw from your retirement accounts each year based on your account balances, age, and life expectancy. Using this tool ensures you take enough to satisfy IRS requirements while helping you plan for the tax implications of these mandatory withdrawals.
                  </p>
                </CardContent>
              </Card>

              {/* How to Use Section */}
              <div className="mb-12" id="how-to-use">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">Using the RMD Calculator</h2>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
                  <h3 id="calculator-guide" className="font-bold text-xl mb-4">
                    Step-by-Step Calculator Guide
                  </h3>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">
                        Input Parameters
                      </h4>
                      <div className="space-y-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <p className="font-medium">Your Current Age</p>
                          </div>
                          <p className="text-sm mt-1 text-muted-foreground">
                            Determines whether RMDs apply and which distribution period table to use
                          </p>
                        </div>

                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                            <p className="font-medium">Account Balances</p>
                          </div>
                          <p className="text-sm mt-1 text-muted-foreground">
                            Enter the total value of each retirement account subject to RMDs as of December 31 of the previous year
                          </p>
                        </div>

                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <p className="font-medium">Beneficiary Information</p>
                          </div>
                          <p className="text-sm mt-1 text-muted-foreground">
                            For accounts with designated beneficiaries, indicate spouse status and age if applicable
                          </p>
                        </div>

                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 text-blue-600" />
                            <p className="font-medium">Future Projections</p>
                          </div>
                          <p className="text-sm mt-1 text-muted-foreground">
                            Optional parameters for estimated investment returns to project RMDs for future years
                          </p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">
                          RMD Calculation Formula
                        </h4>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-sm">
                          <p>RMD = Account Balance / Distribution Period</p>
                          <p className="mt-2 text-muted-foreground">where:</p>
                          <ul className="mt-1 space-y-1 text-muted-foreground">
                            <li>• Account Balance = December 31 value from previous year</li>
                            <li>• Distribution Period = Factor from IRS Uniform Lifetime Table</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">
                        Understanding Your Results
                      </h4>

                      <div className="space-y-4">
                        <Card className="border-blue-200 dark:border-blue-900">
                          <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-blue-600" />
                              Current Year RMD
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-3 text-sm">
                            <p>
                              The minimum amount you must withdraw this calendar year to satisfy IRS requirements. This amount must be withdrawn by December 31 (April 1 for your first RMD year).
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-blue-200 dark:border-blue-900">
                          <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <LineChart className="h-4 w-4 text-blue-600" />
                              RMD Projections
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-3 text-sm">
                            <p>
                              Estimated future RMDs based on your input parameters and projected investment returns. These help you plan for future tax liabilities and cash flow needs.
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-blue-200 dark:border-blue-900">
                          <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Calculator className="h-4 w-4 text-blue-600" />
                              Tax Impact Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-3 text-sm">
                            <p>
                              Estimated tax liability from your RMD at various tax rates, helping you understand how these withdrawals might affect your overall tax situation.
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-yellow-800 dark:text-yellow-300">
                              Important Considerations
                            </p>
                            <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                              <li>• Each account type (IRA, 401(k), etc.) may require separate RMD calculations</li>
                              <li>• Multiple IRAs can be aggregated for RMD purposes, but 401(k)s cannot</li>
                              <li>• QCDs (Qualified Charitable Distributions) count toward your RMD</li>
                              <li>• Roth IRAs are not subject to RMDs during the owner's lifetime</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 id="example-calculation" className="font-bold text-xl mt-8 mb-4">
                  Sample RMD Calculation
                </h3>

                <div className="mb-6">
                  <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Parameter
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Current Age</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">75 years</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Traditional IRA Balance</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                          $500,000 (as of Dec. 31, 2024)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">401(k) Balance</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                          $350,000 (as of Dec. 31, 2024)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Distribution Period (Age 75)</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                          24.6 years (IRS Uniform Lifetime Table)
                        </td>
                      </tr>
                      <tr className="bg-blue-50 dark:bg-blue-900/20">
                        <td className="py-3 px-4 text-sm font-semibold text-blue-700 dark:text-blue-400">
                          IRA RMD for 2025
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-blue-700 dark:text-blue-400">
                          $20,325 ($500,000 ÷ 24.6)
                        </td>
                      </tr>
                      <tr className="bg-blue-50 dark:bg-blue-900/20">
                        <td className="py-3 px-4 text-sm font-semibold text-blue-700 dark:text-blue-400">
                          401(k) RMD for 2025
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-blue-700 dark:text-blue-400">
                          $14,228 ($350,000 ÷ 24.6)
                        </td>
                      </tr>
                      <tr className="bg-blue-50 dark:bg-blue-900/20">
                        <td className="py-3 px-4 text-sm font-semibold text-blue-700 dark:text-blue-400">
                          Total RMD for 2025
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-blue-700 dark:text-blue-400">$34,553</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Pro Tip:</strong> While you must calculate RMDs separately for different account types (IRAs vs. 401(k)s), you can aggregate your IRA RMDs and withdraw the total from one or more of your IRA accounts. This flexibility does not apply to employer plans like 401(k)s, where you must take the RMD from each individual account.
                  </p>
                </div>
              </div>

              {/* Key Factors Section */}
              <div className="mb-12" id="key-factors">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        <span className="text-2xl">Factors Affecting Your RMDs</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Understanding these elements will help you optimize your retirement withdrawal strategy
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="mb-8">
                      <h3
                        id="irs-tables"
                        className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2"
                      >
                        <Calculator className="h-5 w-5" />
                        IRS Distribution Period Tables
                      </h3>

                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <p>
                            <strong>The IRS uses life expectancy tables</strong> to determine your distribution period—the number by which you divide your account balance to calculate your RMD. For most retirement account owners, the Uniform Lifetime Table applies.
                          </p>
                          <ul className="mt-4 space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">
                                →
                              </span>
                              <span>
                                <strong>Uniform Lifetime Table</strong> - Used by most account owners
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">
                                →
                              </span>
                              <span>
                                <strong>Joint Life and Last Survivor Table</strong> - For account owners whose sole beneficiary is a spouse more than 10 years younger
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">
                                →
                              </span>
                              <span>
                                <strong>Single Life Expectancy Table</strong> - Used primarily by beneficiaries
                              </span>
                            </li>
                          </ul>
                          <div className="mt-4 p-3 border border-purple-200 dark:border-purple-900 rounded-md bg-purple-50 dark:bg-purple-900/20">
                            <p className="text-sm text-purple-800 dark:text-purple-300">
                              <strong>Note:</strong> The IRS updated these tables in 2022 to reflect longer life expectancies
                            </p>
                            <ul className="text-sm mt-1 text-purple-700 dark:text-purple-400">
                              <li>This update generally results in smaller required withdrawals</li>
                              <li>Distribution periods were increased by 1-2 years for most age ranges</li>
                            </ul>
                          </div>
                        </div>

                        <div className="h-[240px]">
                          <h4 className="text-center text-sm font-medium mb-2">
                            Uniform Lifetime Table - Selected Ages
                          </h4>
                          <Bar
                            data={{
                              labels: ["Age 73", "Age 75", "Age 80", "Age 85", "Age 90", "Age 95"],
                              datasets: [
                                {
                                  label: "Distribution Period (Years)",
                                  data: [26.5, 24.6, 20.2, 16.0, 12.2, 8.9],
                                  backgroundColor: "rgba(124, 58, 237, 0.8)",
                                  borderColor: "rgba(124, 58, 237, 1)",
                                  borderWidth: 1,
                                  borderRadius: 4,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { position: "bottom", labels: { boxWidth: 10, padding: 10 } },
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  title: {
                                    display: true,
                                    text: "Years",
                                  },
                                },
                              },
                            }}
                          />
                          <p className="text-xs text-center mt-2 text-muted-foreground">
                            As age increases, the distribution period decreases, resulting in larger required withdrawals
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-8" />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3
                          id="rmd-growth"
                          className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2"
                        >
                          <TrendingUp className="h-5 w-5" />
                          RMD Growth Over Time
                        </h3>
                        <p>
                          Even as you take required distributions, your retirement accounts may continue to grow if investment returns exceed withdrawal rates. However, RMDs typically increase as you age due to shorter distribution periods.
                        </p>

                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">
                                  Age
                                </th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">
                                  Dist. Period
                                </th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">
                                  RMD %
                                </th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">
                                  Example RMD*
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">73</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">26.5</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">3.77%</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$18,868</td>
                              </tr>
                              <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">75</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">24.6</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">4.07%</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$20,325</td>
                              </tr>
                              <tr>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">80</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">20.2</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">4.95%</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$24,752</td>
                              </tr>
                              <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">85</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">16.0</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">6.25%</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$31,250</td>
                              </tr>
                              <tr>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">90</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">12.2</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">8.20%</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$40,984</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">*Based on a $500,000 account balance</p>
                      </div>

                      <div>
                        <h3
                          id="account-types"
                          className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2"
                        >
                          <Briefcase className="h-5 w-5" />
                          Account Types and RMDs
                        </h3>
                        <p>
                          Not all retirement accounts are subject to the same RMD rules. Understanding which accounts require distributions and how they’re treated can help you optimize your withdrawal strategy.
                        </p>
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm">
                            RMD Requirements by Account Type
                          </h4>
                          <div className="mt-3">
                            <div className="space-y-3">
                              <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                <div>
                                  <p className="font-medium text-blue-700 dark:text-blue-400">
                                    Subject to RMDs:
                                  </p>
                                  <p className="text-sm text-blue-600 dark:text-blue-500">
                                    Traditional IRAs, SEP IRAs, SIMPLE IRAs, 401(k)s, 403(b)s, 457(b)s, profit-sharing plans
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                                <div>
                                  <p className="font-medium text-blue-700 dark:text-blue-400">
                                    Exempt from RMDs (during owner's lifetime):
                                  </p>
                                  <p className="text-sm text-blue-600 dark:text-blue-500">
                                    Roth IRAs, Roth 401(k)s (as of 2024)
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                                <div>
                                  <p className="font-medium text-blue-700 dark:text-blue-400">
                                    Special Considerations:
                                  </p>
                                                                   <p className="text-sm text-blue-600 dark:text-blue-500">
                                    Still working exception may apply to current employer plans if you don't own {'>'}5% of the company
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <h3
                          id="tax-strategies"
                          className="text-xl font-bold text-green-700 dark:text-green-400 mt-6 mb-4 flex items-center gap-2"
                        >
                          <DollarSign className="h-5 w-5" />
                          Tax Impact of RMDs
                        </h3>
                        <p className="mb-4">
                          RMDs are generally taxed as ordinary income, which can significantly impact your overall tax situation. Understanding these implications helps you plan for tax-efficient withdrawals.
                        </p>
                        <div className="h-[180px]">
                          <Pie
                            data={{
                              labels: [
                                "Federal Income Tax",
                                "Potential State Tax",
                                "Medicare Premium Impact",
                                "Social Security Taxation",
                                "Net RMD",
                              ],
                              datasets: [
                                {
                                  data: [22, 5, 3, 7, 63],
                                  backgroundColor: [
                                    "rgba(220, 38, 38, 0.8)",
                                    "rgba(234, 88, 12, 0.8)",
                                    "rgba(217, 119, 6, 0.8)",
                                    "rgba(245, 158, 11, 0.8)",
                                    "rgba(16, 185, 129, 0.8)",
                                  ],
                                  borderWidth: 1,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: "right",
                                  labels: { boxWidth: 15 },
                                },
                                tooltip: {
                                  callbacks: {
                                    label: function (context) {
                                      return context.label + ": " + context.parsed + "%";
                                    },
                                  },
                                },
                              },
                            }}
                          />
                        </div>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                          Approximate breakdown for a $50,000 RMD (varies by individual tax situation)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* RMD Strategy Section */}
              <div className="mb-12" id="rmd-strategies">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  RMD Strategies and Insights
                </h2>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/60">
                          <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-blue-800 dark:text-blue-300">
                          First RMD Deadline
                        </h3>
                        <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">April 1</p>
                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">
                          Following the year you turn RMD age
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/60">
                          <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-300">
                          Penalty for Missed RMDs
                        </h3>
                        <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">25%</p>
                        <p className="mt-1 text-sm text-green-600 dark:text-green-500">
                          Reduced to 10% if corrected promptly
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/60">
                          <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-purple-800 dark:text-purple-300">
                          QCD Limit (2025)
                        </h3>
                        <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">$105,000</p>
                        <p className="mt-1 text-sm text-purple-600 dark:text-purple-500">
                          Lifetime maximum per individual
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/60">
                          <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-300">
                          Retirees Taking RMDs
                        </h3>
                        <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">31M</p>
                        <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">Estimated for 2025</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <h3 id="optimization-strategies" className="text-xl font-bold mb-4">
                  RMD Optimization Strategies
                </h3>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40">
                          <Heart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </span>
                        <CardTitle className="text-base">Qualified Charitable Distributions</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Direct up to $105,000 annually from your IRA to qualified charities, satisfying your RMD without increasing your taxable income—one of the most tax-efficient giving strategies available to retirees.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40">
                          <ArrowRightLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </span>
                        <CardTitle className="text-base">Roth Conversions</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Consider strategically converting Traditional IRA funds to Roth accounts during lower-income years before RMDs begin. This reduces future RMDs and creates tax-free growth potential.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40">
                          <CalendarDays className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </span>
                        <CardTitle className="text-base">Timing Strategies</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Take RMDs early in the year when markets are up, and delay when markets are down. Also consider taking your first RMD in the year you reach RMD age to avoid doubling up distributions in the following year.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <h3 id="account-management" className="text-xl font-bold mb-4">
                  Strategic Account Management
                </h3>
                <Card className="bg-white dark:bg-gray-900 mb-4">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p>
                          <strong>Asset location strategies</strong> can help you manage RMDs more effectively by placing investments strategically across your retirement accounts based on their tax efficiency.
                        </p>
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            Strategic Asset Location
                          </h4>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700 dark:text-blue-400">
                                Tax-inefficient assets
                              </span>
                              <span className="font-medium text-blue-700 dark:text-blue-400">
                                Tax-advantaged accounts
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700 dark:text-blue-400">
                                Tax-efficient assets
                              </span>
                              <span className="font-medium text-blue-700 dark:text-blue-400">
                                Taxable accounts
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700 dark:text-blue-400">
                                High-growth assets
                              </span>
                              <span className="font-medium text-blue-700 dark:text-blue-400">
                                Roth accounts
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-900">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                            <div>
                              <p className="font-medium text-yellow-800 dark:text-yellow-300">
                                In-Kind Distributions
                              </p>
                              <p className="text-sm mt-1 text-yellow-700 dark:text-yellow-400">
                                Instead of selling investments to generate cash for RMDs, you can transfer securities directly from your retirement account to a taxable account. This satisfies the RMD while allowing you to maintain your investment positions.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-lg mb-3">Long-term RMD Planning Strategies</h4>
                        <div className="space-y-4">
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                                1
                              </span>
                              <p className="font-medium">Look beyond annual requirements</p>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Model how RMDs will grow over time to understand future tax implications and cash flow needs
                            </p>
                          </div>

                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                                2
                              </span>
                              <p className="font-medium">Coordinate with Social Security</p>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Time retirement account withdrawals and Social Security benefits to minimize the combined tax impact
                            </p>
                          </div>

                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                                3
                              </span>
                              <p className="font-medium">Consider Medicare premium implications</p>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Large RMDs can trigger Income-Related Monthly Adjustment Amounts (IRMAAs) that increase Medicare premiums
                            </p>
                          </div>

                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                                4
                              </span>
                              <p className="font-medium">Incorporate estate planning considerations</p>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Consider the tax impact on beneficiaries who will inherit your retirement accounts
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-300">
                        Common RMD Mistakes to Avoid
                      </p>
                      <div className="mt-2 grid md:grid-cols-2 gap-x-6 gap-y-2">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          • Forgetting to take RMDs from inherited accounts
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          • Miscalculating when you have multiple accounts
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          • Missing the December 31 deadline
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          • Overlooking the special first-year deadline
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          • Assuming all accounts can be aggregated
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          • Forgetting to update beneficiary information
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conclusion Section */}
              <div className="mb-6" id="conclusion">
                <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
                    <CardTitle id="summary" className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                      Mastering Your RMD Strategy
                    </CardTitle>
                    <CardDescription>
                      Taking control of your required distributions for optimal retirement outcomes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p>
                      <strong>RMD calculators</strong> are essential tools for retirees with tax-advantaged retirement accounts. By understanding exactly how much you need to withdraw, when to take distributions, and how these withdrawals impact your broader financial picture, you can develop a strategy that satisfies IRS requirements while supporting your retirement income goals.
                    </p>

                    <p className="mt-4" id="next-steps">
                      Take these steps to optimize your RMD strategy:
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                          Preparation Steps
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">
                              1
                            </span>
                            <span className="text-blue-800 dark:text-blue-300">
                              Organize all your retirement account information
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">
                              2
                            </span>
                            <span className="text-blue-800 dark:text-blue-300">
                              Determine which accounts are subject to RMDs
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">
                              3
                            </span>
                            <span className="text-blue-800 dark:text-blue-300">
                              Set up calendar reminders for key RMD deadlines
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
                          Ongoing Management
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">
                              1
                            </span>
                            <span className="text-green-800 dark:text-green-300">
                              Review your withdrawal strategy annually
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">
                              2
                            </span>
                            <span className="text-green-800 dark:text-green-300">
                              Coordinate RMDs with your overall tax planning
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">
                              3
                            </span>
                            <span className="text-green-800 dark:text-green-300">
                              Consider QCDs for tax-efficient charitable giving
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-lg text-blue-800 dark:text-blue-300">
                            Ready to calculate your required distributions?
                          </p>
                          <p className="mt-1 text-blue-700 dark:text-blue-400">
                            Use our <strong>RMD Calculator</strong> above to determine your required withdrawals and plan your retirement income strategy. For more retirement planning tools, explore our related calculators:
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="bg-white dark:bg-gray-800"
                            >
                              <Link href="/calculators/401k">
                                <Clock className="h-4 w-4 mr-1" />
                                Retirement Calculator
                              </Link>
                            </Button>
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="bg-white dark:bg-gray-800"
                            >
                              <Link href="/calculators/social-security">
                                <DollarSign className="h-4 w-4 mr-1" />
                                Social Security Calculator
                              </Link>
                            </Button>
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="bg-white dark:bg-gray-800"
                            >
                              <Link href="/calculators/tax-withdrawal">
                                <Percent className="h-4 w-4 mr-1" />
                                Retirement Tax Calculator
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
  );
}