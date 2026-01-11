"use client";

import { useState, useMemo } from "react";
import { format, addMonths } from "date-fns";
import {
  Calendar as CalendarIcon,
  Download,
  Plus,
  X,
  Calculator,
  LineChart,
  DollarSign,
  TrendingDown,
  Percent,
  Clock,
  Info,
  BarChart3,
  AlertCircle,
  Check,
  Home,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Line, Bar, Pie } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { SaveCalculationButton } from "@/components/save-calculation-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

// Charts (Recharts)
import {
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  PieChart as RechartsPieChart,
  Pie as RechartsPie,
  Cell,
} from "recharts";

// Site Layout Components
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Chart.js (for react-chartjs-2)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartJSTooltip,
  Legend as ChartJSLegend,
} from "chart.js";
import AmortizationSchema from './schema';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartJSTooltip,
  ChartJSLegend
);

// Define interfaces for state variables
interface RateChange {
  paymentNumber: number;
  newRate: number;
}

interface OneTimeExtra {
  paymentNumber: number;
  amount: number;
}

interface BalloonPayment {
  paymentNumber: number;
  amount: number;
}

function AmortizationCalculator() {
  const [loanAmount, setLoanAmount] = useState(300000);
  const [annualInterestRate, setAnnualInterestRate] = useState(5.5);
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [paymentsPerYear, setPaymentsPerYear] = useState(12);
  const [startDate, setStartDate] = useState(new Date());
  const [currency, setCurrency] = useState("USD");
  const [extraMonthly, setExtraMonthly] = useState(0);
  const [extraYearly, setExtraYearly] = useState(0);
  const [oneTimeExtras, setOneTimeExtras] = useState<OneTimeExtra[]>([]);
  const [rateChanges, setRateChanges] = useState<RateChange[]>([]);
  const [interestOnlyPayments, setInterestOnlyPayments] = useState(0);
  const [balloonPayment, setBalloonPayment] = useState<BalloonPayment | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [calcTrigger, setCalcTrigger] = useState(0);

  const calculateLoanDetails = useMemo(() => {
    const totalPayments = loanTermYears * paymentsPerYear;
    let balance = loanAmount;
    let paymentNumber = 1;
    let date = startDate;
    const schedule = [];
    let currentRate = annualInterestRate / 100 / paymentsPerYear;
    let totalPrincipal = 0;
    let totalInterest = 0;
    let isInterestOnly = paymentNumber <= interestOnlyPayments;

    function calculateAmortizingPayment(bal: number, rate: number, remainingPayments: number): number {
      if (rate === 0) return bal / remainingPayments;
      return (rate * bal) / (1 - Math.pow(1 + rate, -remainingPayments));
    }

    let currentPayment = isInterestOnly
      ? balance * currentRate
      : calculateAmortizingPayment(balance, currentRate, totalPayments);

    while (balance > 0 && paymentNumber <= totalPayments) {
      const rateChange = rateChanges.find((rc) => rc.paymentNumber === paymentNumber);
      if (rateChange) {
        currentRate = rateChange.newRate / 100 / paymentsPerYear;
        if (!isInterestOnly) {
          currentPayment = calculateAmortizingPayment(
            balance,
            currentRate,
            totalPayments - paymentNumber + 1
          );
        }
      }

      const interest = balance * currentRate;
      const scheduledPrincipal = isInterestOnly ? 0 : currentPayment - interest;

      let extraPrincipal = extraMonthly;
      if (extraYearly && paymentNumber % paymentsPerYear === 0) {
        extraPrincipal += extraYearly;
      }
      const oneTimeExtra = oneTimeExtras.find((extra) => extra.paymentNumber === paymentNumber);
      if (oneTimeExtra) {
        extraPrincipal += oneTimeExtra.amount;
      }

      let balloonExtra = 0;
      if (balloonPayment && paymentNumber === balloonPayment.paymentNumber) {
        balloonExtra = balloonPayment.amount;
      }

      const totalPrincipalPayment = scheduledPrincipal + extraPrincipal + balloonExtra;
      const totalPayment = isInterestOnly ? interest : currentPayment;

      balance = balance - totalPrincipalPayment;
      if (balance < 0) balance = 0;

      totalInterest += interest;
      totalPrincipal += totalPrincipalPayment;

      schedule.push({
        date,
        payment: totalPayment + extraPrincipal + balloonExtra,
        principal: totalPrincipalPayment,
        interest,
        balance,
        totalPrincipal,
        totalInterest,
        annualRate: currentRate * paymentsPerYear * 100,
        scheduledPrincipal,
        extraPrincipal: extraPrincipal + balloonExtra,
      });

      const periodInMonths = 12 / paymentsPerYear;
      date = addMonths(date, periodInMonths);

      if (isInterestOnly && paymentNumber === interestOnlyPayments) {
        isInterestOnly = false;
        currentPayment = calculateAmortizingPayment(
          balance,
          currentRate,
          totalPayments - paymentNumber
        );
      }

      paymentNumber++;
    }

    return {
      schedule,
      totalInterest,
      totalPrincipal,
      payoffDate: schedule[schedule.length - 1]?.date,
      initialPayment: schedule[0]?.payment || 0,
    };
  }, [
    loanAmount,
    annualInterestRate,
    loanTermYears,
    paymentsPerYear,
    startDate,
    extraMonthly,
    extraYearly,
    oneTimeExtras,
    rateChanges,
    interestOnlyPayments,
    balloonPayment,
    calcTrigger,
  ]);

  const scheduleData = calculateLoanDetails.schedule;
  const mainBalanceData = scheduleData.map((payment) => ({
    name: format(payment.date, "MMM yyyy"),
    balance: Number(payment.balance.toFixed(2)),
  }));

  const principalInterestData = scheduleData.map((payment) => ({
    name: format(payment.date, "MMM yyyy"),
    principal: Number(payment.scheduledPrincipal.toFixed(2)),
    interest: Number(payment.interest.toFixed(2)),
  }));

  let cumulative = 0;
  const extraPaymentsData = scheduleData.map((payment) => {
    cumulative += payment.extraPrincipal;
    return {
      name: format(payment.date, "MMM yyyy"),
      cumulativeExtra: Number(cumulative.toFixed(2)),
    };
  });

  const rateTimelineData = scheduleData.map((payment) => ({
    name: format(payment.date, "MMM yyyy"),
    rate: Number(payment.annualRate.toFixed(2)),
  }));

  const balloonPaymentData = scheduleData.map((payment, index) => ({
    name: format(payment.date, "MMM yyyy"),
    balance: Number(payment.balance.toFixed(2)),
    isBalloon: balloonPayment ? index + 1 === balloonPayment.paymentNumber : false,
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleExportCSV = () => {
    const schedule = calculateLoanDetails.schedule;
    let csvContent = "Payment #,Date,Principal,Interest,Total Payment,Balance\n";
    schedule.forEach((payment, index) => {
      csvContent += `${index + 1},${format(payment.date, "MMM yyyy")},${payment.principal.toFixed(
        2
      )},${payment.interest.toFixed(2)},${payment.payment.toFixed(2)},${payment.balance.toFixed(
        2
      )}\n`;
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "amortization_schedule.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Amortization Schedule", 14, 20);

    const tableColumn = ["Payment #", "Date", "Principal", "Interest", "Total Payment", "Balance"];
    const tableRows: string[][] = [];

    calculateLoanDetails.schedule.forEach((payment, index) => {
      const rowData = [
        (index + 1).toString(),
        format(payment.date, "MMM yyyy"),
        payment.principal.toFixed(2),
        payment.interest.toFixed(2),
        payment.payment.toFixed(2),
        payment.balance.toFixed(2),
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: "grid",
    });

    doc.save("amortization_schedule.pdf");
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
                <CardDescription>Enter your loan information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="loanAmount"
                      type="number"
                      value={loanAmount || ''} onChange={(e) => setLoanAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                      min={0}
                      className="flex-1"
                    />
                    <Slider
                      value={[loanAmount]}
                      min={0}
                      max={1000000}
                      step={1000}
                      onValueChange={([value]) => setLoanAmount(value)}
                      className="w-1/2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualInterestRate">Annual Interest Rate (%)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="annualInterestRate"
                      type="number"
                      value={annualInterestRate || ''} onChange={(e) => setAnnualInterestRate(e.target.value === '' ? 0 : Number(e.target.value))}
                      step={0.1}
                      min={0}
                      max={100}
                      className="flex-1"
                    />
                    <Slider
                      value={[annualInterestRate]}
                      min={0}
                      max={15}
                      step={0.1}
                      onValueChange={([value]) => setAnnualInterestRate(value)}
                      className="w-1/2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loanTermYears">Loan Term (Years)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="loanTermYears"
                      type="number"
                      value={loanTermYears || ''} onChange={(e) => setLoanTermYears(e.target.value === '' ? 0 : Number(e.target.value))}
                      min={1}
                      className="flex-1"
                    />
                    <Slider
                      value={[loanTermYears]}
                      min={1}
                      max={50}
                      step={1}
                      onValueChange={([value]) => setLoanTermYears(value)}
                      className="w-1/2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Payments per Year</Label>
                  <Select
                    value={paymentsPerYear.toString()}
                    onValueChange={(value) => setPaymentsPerYear(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 (Monthly)</SelectItem>
                      <SelectItem value="26">26 (Bi-weekly)</SelectItem>
                      <SelectItem value="52">52 (Weekly)</SelectItem>
                      <SelectItem value="4">4 (Quarterly)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(startDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          if (date) {
                            setStartDate(date);
                            setIsDatePickerOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={(value) => setCurrency(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                      <SelectItem value="KRW">KRW - Korean Won</SelectItem>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                      <SelectItem value="HKD">HKD - Hong Kong Dollar</SelectItem>
                      <SelectItem value="NZD">NZD - New Zealand Dollar</SelectItem>
                      <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveTab("advanced")}
                >
                  Advanced Options
                </Button>

                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => setCalcTrigger((prev) => prev + 1)}
                >
                  Calculate
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="graphs">Graphs</TabsTrigger>
                <TabsTrigger value="advanced" className="lg:hidden">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <Card>
                  <CardHeader>
                    <CardTitle>Loan Summary</CardTitle>
                    <CardDescription>Overview of your loan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Initial Payment</Label>
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(calculateLoanDetails.initialPayment)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Total Interest</Label>
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(calculateLoanDetails.totalInterest)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Total Cost</Label>
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(
                            calculateLoanDetails.totalPrincipal +
                              calculateLoanDetails.totalInterest
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Payoff Date</Label>
                        <div className="text-2xl font-bold text-primary">
                          {calculateLoanDetails.payoffDate
                            ? format(calculateLoanDetails.payoffDate, "PP")
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Important Graph</CardTitle>
                    <CardDescription>Key visualization of your loan data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={mainBalanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <RechartsLegend />
                        <RechartsLine type="monotone" dataKey="balance" stroke="#8884d8" dot={{ r: 2 }} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Amortization Schedule</CardTitle>
                      <CardDescription>Detailed payment breakdown</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleExportCSV}>
                        <Download className="mr-2 h-4 w-4" /> CSV
                      </Button>
                      <Button variant="outline" onClick={handleExportPDF}>
                        <Download className="mr-2 h-4 w-4" /> PDF
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Payment #</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Principal</TableHead>
                            <TableHead>Interest</TableHead>
                            <TableHead>Total Payment</TableHead>
                            <TableHead>Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {calculateLoanDetails.schedule.slice(0, 12).map((payment, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{format(payment.date, "MMM yyyy")}</TableCell>
                              <TableCell>
                                {formatCurrency(payment.scheduledPrincipal)}
                              </TableCell>
                              <TableCell>{formatCurrency(payment.interest)}</TableCell>
                              <TableCell>{formatCurrency(payment.payment)}</TableCell>
                              <TableCell>{formatCurrency(payment.balance)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {calculateLoanDetails.schedule.length > 12 && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Showing first 12 payments of {calculateLoanDetails.schedule.length}. Export for
                        full schedule.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="graphs">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Main Balance Graph</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsLineChart data={mainBalanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <RechartsLegend />
                          <RechartsLine type="monotone" dataKey="balance" stroke="#8884d8" dot={{ r: 2 }} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Principal vs. Interest</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsLineChart data={principalInterestData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <RechartsLegend />
                          <RechartsLine type="monotone" dataKey="principal" stroke="#82ca9d" dot={{ r: 2 }} />
                          <RechartsLine type="monotone" dataKey="interest" stroke="#8884d8" dot={{ r: 2 }} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Extra Payments Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsLineChart data={extraPaymentsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <RechartsLegend />
                          <RechartsLine type="monotone" dataKey="cumulativeExtra" stroke="#ff7300" dot={{ r: 2 }} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Adjustable Rate Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsLineChart data={rateTimelineData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <RechartsLegend />
                          <RechartsLine type="monotone" dataKey="rate" stroke="#8884d8" dot={{ r: 2 }} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Balloon Payment Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsLineChart data={balloonPaymentData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <RechartsLegend />
                          <RechartsLine type="monotone" dataKey="balance" stroke="#8884d8" dot={({ payload }) =>
                            payload.isBalloon ? (
                              <circle cx={0} cy={0} r={4} fill="#ff0000" />
                            ) : (
                              <circle cx={0} cy={0} r={2} fill="#8884d8" />
                            )
                          } />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="advanced">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Options</CardTitle>
                    <CardDescription>Customize your loan parameters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <Label>Extra Payments</Label>
                      <div className="space-y-2">
                        <Label>Monthly Extra Payment</Label>
                        <Input
                          type="number"
                          value={extraMonthly || ''} onChange={(e) => setExtraMonthly(e.target.value === '' ? 0 : Number(e.target.value))}
                          min={0}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Yearly Extra Payment</Label>
                        <Input
                          type="number"
                          value={extraYearly || ''} onChange={(e) => setExtraYearly(e.target.value === '' ? 0 : Number(e.target.value))}
                          min={0}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>One-Time Extra Payments</Label>
                        {oneTimeExtras.map((extra, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={extra.paymentNumber}
                              onChange={(e) => {
                                const newExtras = [...oneTimeExtras];
                                newExtras[index].paymentNumber = Number(e.target.value);
                                setOneTimeExtras(newExtras);
                              }}
                              placeholder="Payment #"
                              min={1}
                            />
                            <Input
                              type="number"
                              value={extra.amount}
                              onChange={(e) => {
                                const newExtras = [...oneTimeExtras];
                                newExtras[index].amount = Number(e.target.value);
                                setOneTimeExtras(newExtras);
                              }}
                              placeholder="Amount"
                              min={0}
                            />
                            <Button
                              variant="ghost"
                              onClick={() =>
                                setOneTimeExtras(oneTimeExtras.filter((_, i) => i !== index))
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() =>
                            setOneTimeExtras([...oneTimeExtras, { paymentNumber: 1, amount: 0 }])
                          }
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add One-Time Extra
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Adjustable Rates</Label>
                      {rateChanges.map((change, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={change.paymentNumber}
                            onChange={(e) => {
                              const newChanges = [...rateChanges];
                              newChanges[index].paymentNumber = Number(e.target.value);
                              setRateChanges(newChanges);
                            }}
                            placeholder="Payment #"
                            min={1}
                          />
                          <Input
                            type="number"
                            value={change.newRate}
                            onChange={(e) => {
                              const newChanges = [...rateChanges];
                              newChanges[index].newRate = Number(e.target.value);
                              setRateChanges(newChanges);
                            }}
                            placeholder="New Rate (%)"
                            step={0.1}
                            min={0}
                          />
                          <Button
                            variant="ghost"
                            onClick={() => setRateChanges(rateChanges.filter((_, i) => i !== index))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() =>
                          setRateChanges([...rateChanges, { paymentNumber: 1, newRate: annualInterestRate }])
                        }
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Rate Change
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Interest-Only Payments</Label>
                      <Input
                        type="number"
                        value={interestOnlyPayments || ''} onChange={(e) => setInterestOnlyPayments(e.target.value === '' ? 0 : Number(e.target.value))}
                        min={0}
                        placeholder="Number of payments (0 for none)"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Balloon Payment</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!balloonPayment}
                          onChange={(e) =>
                            setBalloonPayment(
                              e.target.checked ? { paymentNumber: 1, amount: 0 } : null
                            )
                          }
                        />
                        <span>Enable</span>
                      </div>
                      {balloonPayment && (
                        <div className="space-y-2">
                          <Input
                            type="number"
                            value={balloonPayment.paymentNumber}
                            onChange={(e) =>
                              setBalloonPayment({
                                ...balloonPayment,
                                paymentNumber: Number(e.target.value),
                              })
                            }
                            placeholder="Payment #"
                            min={1}
                          />
                          <Input
                            type="number"
                            value={balloonPayment.amount}
                            onChange={(e) =>
                              setBalloonPayment({
                                ...balloonPayment,
                                amount: Number(e.target.value),
                              })
                            }
                            placeholder="Amount"
                            min={0}
                          />
                        </div>
                      )}
                    </div>

                    <Button variant="default" onClick={() => setCalcTrigger((prev) => prev + 1)}>
                      Calculate
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-12 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Amortization{" "}
        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">
          Calculator
        </span>
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Calculate your loan payments, view amortization schedules, and analyze different loan
        scenarios with our advanced calculator.
      </p>
    </div>
  </div>
</section>
  );
}

export default function AmortizationCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <AmortizationSchema />
      <main className="flex-1">
        <HeroSection />
        <AmortizationCalculator />
        <section id="blog-section" className="py-12 bg-white dark:bg-black">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex-1 text-center">
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Financial Resource</span>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Understanding Amortization Schedules</h2>
                <p className="mt-3 text-muted-foreground text-lg">Visualize your loan payoff journey from first payment to final freedom</p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    Understanding Amortization Calculators
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <p>
                        An <strong>Amortization Calculator</strong> is a powerful financial tool that breaks down your loan payments over time, showing exactly how each payment is divided between principal and interest. This visualization helps you understand the true cost of loans and develop strategies to save money over the life of your debt.
                      </p>
                      <p className="mt-3">
                        With an amortization calculator, you can:
                      </p>
                      <ul className="my-3 space-y-1">
                        <li className="flex items-center gap-2">
                          <LineChart className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>View a complete payment schedule over your loan term</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Track how your principal balance decreases over time</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span>Analyze how extra payments can accelerate your loan payoff</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <span>Calculate the total interest paid over the loan's lifetime</span>
                        </li>
                      </ul>
                      <p>
                        Whether you're evaluating a mortgage, auto loan, student loan, or personal loan, understanding your amortization schedule provides critical insights for making informed financial decisions.
                      </p>
                    </div>
                    <div className="space-y-6">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Principal vs. Interest Over Time</h3>
                        <div className="h-[200px]">
                          <Line 
                            data={{
                              labels: ['Year 1', 'Year 5', 'Year 10', 'Year 15', 'Year 20', 'Year 25', 'Year 30'],
                              datasets: [
                                {
                                  label: 'Principal',
                                  data: [3868, 23731, 56797, 102418, 164435, 248159, 300000],
                                  borderColor: 'rgba(59, 130, 246, 0.8)',
                                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                  tension: 0.4
                                },
                                {
                                  label: 'Interest',
                                  data: [18000, 86269, 153203, 207582, 245565, 261841, 264000],
                                  borderColor: 'rgba(14, 165, 233, 0.8)',
                                  backgroundColor: 'rgba(14, 165, 233, 0.1)',
                                  tension: 0.4
                                }
                              ]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } } }
                            }}
                          />
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">$300,000 mortgage at 6% for 30 years: Cumulative payments</p>
                      </div>
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          <strong>Did You Know?</strong> In a typical 30-year mortgage, you'll pay more in interest than principal during the first 15-18 years of your loan. Seeing this in your amortization schedule can be a powerful motivator to make extra payments.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 grid md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
                      <CardContent className="pt-5">
                        <div className="flex flex-col items-center text-center">
                          <LineChart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          <h3 className="mt-3 text-lg font-semibold text-blue-800 dark:text-blue-300">Payment Visibility</h3>
                          <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                            See exactly where your money goes with each payment
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
                      <CardContent className="pt-5">
                        <div className="flex flex-col items-center text-center">
                          <TrendingDown className="h-8 w-8 text-green-600 dark:text-green-400" />
                          <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-300">Debt Strategy</h3>
                          <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                            Develop strategic payoff plans to minimize interest costs
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
                      <CardContent className="pt-5">
                        <div className="flex flex-col items-center text-center">
                          <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                          <h3 className="mt-3 text-lg font-semibold text-purple-800 dark:text-purple-300">Loan Progress</h3>
                          <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                            Track your loan payoff progress from start to finish
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
              <div className="mb-10" id="amortization-basics">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <LineChart className="h-6 w-6 text-blue-600" />
                  Amortization Fundamentals
                </h2>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
                  <h3 id="what-is-amortization" className="font-bold text-xl mb-4">What is Amortization?</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Info className="h-5 w-5 text-blue-600" />
                          Definition & Process
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="mb-3">
                          Amortization is the process of paying off a debt (like a mortgage or car loan) through regular scheduled payments that include both principal and interest.
                        </p>
                        <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                          <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">Key characteristics:</p>
                          <ul className="space-y-1">
                            <li>? Equal payment amounts throughout the loan term</li>
                            <li>? Changing allocation between principal and interest</li>
                            <li>? Gradual reduction of the loan balance</li>
                            <li>? Front-loaded interest payments</li>
                          </ul>
                        </div>
                        <div className="mt-3 text-sm text-muted-foreground">
                          <p>While your payment remains constant, the components within that payment shift over time, with more going toward principal and less toward interest.</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Calculator className="h-5 w-5 text-blue-600" />
                          The Amortization Formula
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="mb-3">
                          The payment amount in an amortizing loan is calculated using this formula:
                        </p>
                        <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                          <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">Monthly Payment Formula:</p>
                          <div className="bg-white dark:bg-gray-800 p-2 rounded font-mono text-xs">
                            P = L[c(1 + c)^n]/[(1 + c)^n - 1]
                          </div>
                          <p className="mt-2">Where:</p>
                          <ul className="space-y-1">
                            <li>? P = Payment amount</li>
                            <li>? L = Loan principal</li>
                            <li>? c = Monthly interest rate (annual rate w 12)</li>
                            <li>? n = Total number of payments (years W 12)</li>
                          </ul>
                        </div>
                        <div className="mt-3 text-sm text-muted-foreground">
                          <p>This formula ensures the loan will be fully paid off at the end of the term, with gradually decreasing interest payments.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="mt-6">
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                          Principal vs. Interest Dynamics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="font-medium text-blue-700 dark:text-blue-400">The Shifting Balance</h4>
                            <p className="text-sm">
                              In an amortizing loan, each payment consists of two parts:
                            </p>
                            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600 text-white">
                                <DollarSign className="h-6 w-6" />
                              </div>
                              <div>
                                <p className="font-medium text-blue-800 dark:text-blue-300">Principal Portion</p>
                                <p className="text-sm text-blue-600 dark:text-blue-400">Reduces your loan balance</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-600 text-white">
                                <Percent className="h-6 w-6" />
                              </div>
                              <div>
                                <p className="font-medium text-blue-800 dark:text-blue-300">Interest Portion</p>
                                <p className="text-sm text-blue-600 dark:text-blue-400">Cost of borrowing the remaining balance</p>
                              </div>
                            </div>
                            <p className="text-sm">
                              Early in your loan, most of your payment goes toward interest. As your principal decreases, more of each payment applies to the principal balance.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-3">Payment Allocation Over Time</h4>
                            <div className="h-[200px]">
                              <Bar 
                                data={{
                                  labels: ['Year 1', 'Year 5', 'Year 10', 'Year 15', 'Year 20', 'Year 25', 'Year 30'],
                                  datasets: [
                                    {
                                      label: 'Principal',
                                      data: [391, 496, 665, 891, 1195, 1601, 2146],
                                      backgroundColor: 'rgba(59, 130, 246, 0.7)'
                                    },
                                    {
                                      label: 'Interest',
                                      data: [1509, 1404, 1235, 1009, 705, 299, 0],
                                      backgroundColor: 'rgba(251, 191, 36, 0.7)'
                                    }
                                  ]
                                }}
                                options={{
                                  indexAxis: 'y',
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: { legend: { position: 'top' } },
                                  scales: {
                                    x: { stacked: true, title: { display: true, text: 'Monthly Payment ($)' } },
                                    y: { stacked: true }
                                  }
                                }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground text-center mt-2">
                              Monthly payment composition for a $300,000 mortgage at 6% (30-year fixed)
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      <strong>Important Note:</strong> While consistent monthly payments make budgeting easier, they also obscure how much interest you're really paying,
                      especially early in the loan. An amortization calculator reveals this hidden cost, empowering you to make more informed decisions about loan terms and repayment strategies.
                    </p>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4" id="amortization-schedule">The Amortization Schedule</h3>
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-lg mb-3">What is an Amortization Schedule?</h4>
                        <p className="mb-3">
                          An amortization schedule is a complete table of periodic loan payments showing the amount of principal and interest that comprise each payment until the loan is paid off.
                        </p>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <h5 className="font-medium text-blue-800 dark:text-blue-300">A typical schedule includes:</h5>
                          <ul className="mt-2 space-y-1 text-sm">
                            <li>? Payment number/date</li>
                            <li>? Payment amount</li>
                            <li>? Principal portion</li>
                            <li>? Interest portion</li>
                            <li>? Remaining balance after payment</li>
                            <li>? Cumulative interest paid to date</li>
                          </ul>
                        </div>
                        <p className="mt-4 text-sm">
                          This detailed breakdown allows you to see exactly how your loan evolves over time and understand the true cost of borrowing.
                        </p>
                      </div>
                      <div className="overflow-x-auto">
                        <h4 className="font-semibold text-lg mb-3">Sample Amortization Schedule</h4>
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                              <th className="px-2 py-2 text-left">Payment</th>
                              <th className="px-2 py-2 text-left">Payment Amt</th>
                              <th className="px-2 py-2 text-left">Principal</th>
                              <th className="px-2 py-2 text-left">Interest</th>
                              <th className="px-2 py-2 text-left">Balance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <tr>
                              <td className="px-2 py-2">Start</td>
                              <td className="px-2 py-2">-</td>
                              <td className="px-2 py-2">-</td>
                              <td className="px-2 py-2">-</td>
                              <td className="px-2 py-2">$300,000.00</td>
                            </tr>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                              <td className="px-2 py-2">1</td>
                              <td className="px-2 py-2">$1,798.65</td>
                              <td className="px-2 py-2">$298.65</td>
                              <td className="px-2 py-2">$1,500.00</td>
                              <td className="px-2 py-2">$299,701.35</td>
                            </tr>
                            <tr>
                              <td className="px-2 py-2">2</td>
                              <td className="px-2 py-2">$1,798.65</td>
                              <td className="px-2 py-2">$300.14</td>
                              <td className="px-2 py-2">$1,498.51</td>
                              <td className="px-2 py-2">$299,401.21</td>
                            </tr>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                              <td className="px-2 py-2">3</td>
                              <td className="px-2 py-2">$1,798.65</td>
                              <td className="px-2 py-2">$301.64</td>
                              <td className="px-2 py-2">$1,497.01</td>
                              <td className="px-2 py-2">$299,099.57</td>
                            </tr>
                            <tr>
                              <td className="px-2 py-2">...</td>
                              <td className="px-2 py-2">...</td>
                              <td className="px-2 py-2">...</td>
                              <td className="px-2 py-2">...</td>
                              <td className="px-2 py-2">...</td>
                            </tr>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                              <td className="px-2 py-2">358</td>
                              <td className="px-2 py-2">$1,798.65</td>
                              <td className="px-2 py-2">$1,780.74</td>
                              <td className="px-2 py-2">$17.91</td>
                              <td className="px-2 py-2">$1,798.56</td>
                            </tr>
                            <tr>
                              <td className="px-2 py-2">359</td>
                              <td className="px-2 py-2">$1,798.65</td>
                              <td className="px-2 py-2">$1,789.65</td>
                              <td className="px-2 py-2">$9.00</td>
                              <td className="px-2 py-2">$8.91</td>
                            </tr>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                              <td className="px-2 py-2">360</td>
                              <td className="px-2 py-2">$1,798.69</td>
                              <td className="px-2 py-2">$1,798.69</td>
                              <td className="px-2 py-2">$0.00</td>
                              <td className="px-2 py-2">$0.00</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="mb-10" id="using-calculator">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  Using the Amortization Calculator Effectively
                </h2>
                <Card className="overflow-hidden border-green-200 dark:border-green-900 mb-6">
                  <CardHeader className="bg-green-50 dark:bg-green-900/40">
                    <CardTitle>Step-by-Step Guide</CardTitle>
                    <CardDescription>How to get the most from your amortization calculations</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-4">Basic Calculation Steps</h3>
                        <ol className="space-y-4">
                          <li className="flex items-start gap-3">
                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 font-medium text-sm">1</span>
                            <div>
                              <p className="font-medium">Enter your loan details</p>
                              <p className="text-sm text-muted-foreground mt-1">Include principal amount, interest rate, and loan term</p>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 font-medium text-sm">2</span>
                            <div>
                              <p className="font-medium">Select payment frequency</p>
                              <p className="text-sm text-muted-foreground mt-1">Choose monthly, bi-weekly, or weekly payments</p>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 font-medium text-sm">3</span>
                            <div>
                              <p className="font-medium">Add extra payment details (optional)</p>
                              <p className="text-sm text-muted-foreground mt-1">Include additional periodic or one-time payments</p>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 font-medium text-sm">4</span>
                            <div>
                              <p className="font-medium">Review your amortization schedule</p>
                              <p className="text-sm text-muted-foreground mt-1">Analyze the payment breakdown and balance reduction over time</p>
                            </div>
                          </li>
                        </ol>
                      </div>
                      <div className="space-y-6">
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium mb-3">Sample Loan Parameters</h4>
                          <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                <p className="text-xs text-muted-foreground">Loan Amount</p>
                                <p className="font-medium">$250,000</p>
                              </div>
                              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                <p className="text-xs text-muted-foreground">Interest Rate</p>
                                <p className="font-medium">5.75% APR</p>
                              </div>
                              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                <p className="text-xs text-muted-foreground">Loan Term</p>
                                <p className="font-medium">30 years</p>
                              </div>
                              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                <p className="text-xs text-muted-foreground">Payment Frequency</p>
                                <p className="font-medium">Monthly</p>
                              </div>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded font-medium">
                              <div className="flex justify-between">
                                <span>Monthly Payment:</span>
                                <span>$1,459.35</span>
                              </div>
                              <div className="flex justify-between mt-1">
                                <span>Total Interest:</span>
                                <span>$275,366.04</span>
                              </div>
                              <div className="flex justify-between mt-1">
                                <span>Total Cost:</span>
                                <span>$525,366.04</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-green-700 dark:text-green-400">Advanced Features</h3>
                        <div className="grid gap-4">
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                            <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                              <TrendingDown className="h-4 w-4" />
                              Extra Payment Analysis
                            </h4>
                            <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                              See how making additional payments affects your payoff date and total interest paid.
                            </p>
                          </div>
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                            <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              Payment Comparison
                            </h4>
                            <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                              Compare different payment schedules side-by-side to find the most cost-effective approach.
                            </p>
                          </div>
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                            <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                              <Download className="h-4 w-4" />
                              Schedule Export
                            </h4>
                            <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                              Download your complete amortization schedule as PDF or CSV for record keeping and tax purposes.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-6" />
                    <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4">Interpreting Your Results</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card className="border-blue-200 dark:border-blue-800">
                        <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                          <CardTitle className="text-base">Total Interest Cost</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 text-sm">
                          <p>The cumulative interest paid over the life of your loan reveals the true cost of borrowing.</p>
                          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <p>On a 30-year $300,000 mortgage at 6%:</p>
                            <ul className="space-y-1 mt-1">
                              <li>? Monthly payment: $1,798.65</li>
                              <li>? Total payments: $647,515</li>
                              <li>? Total interest: $347,515</li>
                              <li>? Interest as % of principal: 116%</li>
                            </ul>
                          </div>
                          <p className="mt-3">Knowing this number helps you understand the importance of finding the best interest rate possible.</p>
                        </CardContent>
                      </Card>
                      <Card className="border-blue-200 dark:border-blue-800">
                        <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                          <CardTitle className="text-base">Equity Building</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 text-sm">
                          <p>Your amortization schedule shows how quickly you build equity in your home or asset.</p>
                          <div className="h-[160px] mt-3">
                            <Pie
                              data={{
                                labels: ['Equity', 'Loan Balance'],
                                datasets: [{
                                  data: [58000, 242000],
                                  backgroundColor: [
                                    'rgba(59, 130, 246, 0.8)',
                                    'rgba(203, 213, 225, 0.8)'
                                  ]
                                }]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { position: 'bottom', labels: { padding: 10 } } }
                              }}
                            />
                          </div>
                          <p className="mt-3 text-center text-xs text-muted-foreground">Sample equity after 5 years on a $300,000 mortgage</p>
                        </CardContent>
                      </Card>
                      <Card className="border-blue-200 dark:border-blue-800">
                        <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                          <CardTitle className="text-base">Payoff Acceleration</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 text-sm">
                          <p>
                            Additional payments can dramatically reduce your loan term and interest costs.
                          </p>
                          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <h4 className="font-medium">Example: $100 extra monthly payment</h4>
                            <ul className="space-y-1 mt-1">
                              <li>? Original term: 30 years</li>
                              <li>? New payoff time: 25.3 years</li>
                              <li>? Time saved: 4.7 years</li>
                              <li>? Interest saved: $64,789</li>
                            </ul>
                          </div>
                          <p className="mt-3">Additional payments made early in your loan term have the greatest impact on total interest savings.</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800 dark:text-amber-300">Consider Loan Prepayment Penalties</p>
                          <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                            Before making extra payments, check if your loan has prepayment penalties that could offset your interest savings. Some loans restrict or charge fees for early payments, especially in the first few years of the loan term.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="mb-10" id="amortization-strategies">
                <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        <span className="text-2xl">Strategies to Optimize Your Loan Repayment</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Smart approaches to save money and build equity faster
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 id="extra-payments" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                          <TrendingDown className="h-5 w-5" />
                          Extra Payment Strategies
                        </h3>
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <h4 className="font-medium text-blue-800 dark:text-blue-300">Monthly Extra Payments</h4>
                            <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                              Adding even a small amount to your regular monthly payment can significantly reduce your loan term and total interest.
                            </p>
                            <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded text-xs">
                              <p className="font-medium">On a $250,000, 30-year loan at 5.75%:</p>
                              <table className="w-full mt-1">
                                <thead className="text-left">
                                  <tr>
                                    <th>Extra Payment</th>
                                    <th>Years Saved</th>
                                    <th>Interest Saved</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>$100/month</td>
                                    <td>4.3 years</td>
                                    <td>$51,742</td>
                                  </tr>
                                  <tr>
                                    <td>$200/month</td>
                                    <td>7.5 years</td>
                                    <td>$85,781</td>
                                  </tr>
                                  <tr>
                                    <td>$500/month</td>
                                    <td>13.7 years</td>
                                    <td>$145,775</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <h4 className="font-medium text-blue-800 dark:text-blue-300">Bi-Weekly Payment Plan</h4>
                            <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                              Instead of making 12 monthly payments per year, make a half-payment every two weeks, resulting in 26 half-payments (13 full payments) annually.
                            </p>
                            <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded text-xs">
                              <p className="font-medium">Benefits:</p>
                              <ul className="list-disc list-inside space-y-1 mt-1">
                                <li>Shaves 4-6 years off a 30-year mortgage</li>
                                <li>Aligns with bi-weekly paychecks for many workers</li>
                                <li>Feels less painful than a large extra payment</li>
                                <li>Reduces total interest by tens of thousands</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 id="refinancing" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                          <RefreshCw className="h-5 w-5" />
                          Refinancing Analysis
                        </h3>
                        <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50/50 dark:bg-green-900/20 mb-4">
                          <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            When to Consider Refinancing
                          </h4>
                          <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                            Amortization calculators help determine if refinancing makes financial sense by comparing the remaining amortization schedule against a new loan option.
                          </p>
                          <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-md text-xs">
                            <p className="font-medium mb-1">Consider refinancing when:</p>
                            <ul className="space-y-1">
                              <li>? Interest rates drop by at least 0.75-1% from your current rate</li>
                              <li>? You plan to stay in your home long enough to recoup closing costs</li>
                              <li>? You can maintain or improve your loan term</li>
                              <li>? Your credit score has significantly improved</li>
                              <li>? You want to change from an adjustable to fixed rate loan</li>
                            </ul>
                          </div>
                        </div>
                        <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                          <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Loan Term Considerations
                          </h4>
                          <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                            When refinancing, carefully compare different loan terms to find the optimal balance between monthly payment and total interest cost.
                          </p>
                          <div className="mt-3 h-[200px]">
                            <Bar 
                              data={{
                                labels: ['30-Year Term', '20-Year Term', '15-Year Term'],
                                datasets: [
                                  {
                                    label: 'Monthly Payment',
                                    data: [1459, 1747, 2075],
                                    backgroundColor: 'rgba(59, 130, 246, 0.7)'
                                  },
                                  {
                                    label: 'Total Interest',
                                    data: [275366, 169334, 123559],
                                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                                    hidden: true
                                  }
                                ]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: { position: 'top' },
                                  tooltip: {
                                    callbacks: {
                                      label: function(context) {
                                        let label = context.dataset.label || '';
                                        if (label) { label += ': '; }
                                        if (context.parsed.y !== null) {
                                          label += new Intl.NumberFormat('en-US', { 
                                            style: 'currency', 
                                            currency: 'USD',
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 0
                                          }).format(context.parsed.y);
                                        }
                                        return label;
                                      }
                                    }
                                  }
                                },
                                scales: {
                                  y: { beginAtZero: true, ticks: { callback: value => '$' + Number(value).toLocaleString() } }
                                }
                              }}
                            />
                          </div>
                          <p className="text-xs text-center mt-2 text-muted-foreground">
                            Comparison for $250,000 loan at 5.75% interest
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <SaveCalculationButton
                    calculatorType="amortization"
                    inputs={{}}
                    results={{}}
                  />
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