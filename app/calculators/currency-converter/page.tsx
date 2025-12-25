"use client";

import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  RefreshCw,
  ArrowRightLeft,
  Download,
  Info,
  TrendingUp,
  Clock,
  Share2,
  Globe,
  Plane,
  BarChart3,
  Building,
  LineChart,
  ArrowLeftRight,
  AlertTriangle,
  Scale,
  Library,
  Newspaper,
  Lightbulb,
  CircleDollarSign,
  CreditCard,
  Landmark,
  Calculator,
  ShoppingCart,
  History,
  Bell,
  XCircle,
  ArrowRight,
  Link,
  Receipt,
} from "lucide-react";
import { Bar, Line, Pie } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { currencies } from "./currencies";
import CurrencyConverterSchema from './schema';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const apiKey = "c48c7dc0cbff4948fe43b135";

export default function CurrencyConverterPage() {
  // State for currency conversion
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // State for historical data
  const [historicalData, setHistoricalData] = useState<{
    dates: string[];
    rates: number[];
  }>({
    dates: [],
    rates: []
  });

  // State for favorite currencies
  const [favorites, setFavorites] = useState<string[]>(["USD", "EUR", "GBP", "JPY", "AUD"]);
  const [showFavorites, setShowFavorites] = useState<boolean>(true);

  // Chart colors
  const chartColors = {
    primary: [
      'rgba(99, 102, 241, 0.9)',
      'rgba(59, 130, 246, 0.9)',
      'rgba(14, 165, 233, 0.9)',
    ],
    secondary: [
      'rgba(99, 102, 241, 0.2)',
      'rgba(59, 130, 246, 0.2)',
      'rgba(14, 165, 233, 0.2)',
    ]
  };

  // Historical data chart options
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => Number(value).toFixed(4)
        }
      },
      x: { 
        grid: { display: false },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' }
      }
    }
  };

  // Generate chart data
  const chartData = {
    labels: historicalData.dates,
    datasets: [
      {
        label: `${fromCurrency} to ${toCurrency} Exchange Rate`,
        data: historicalData.rates,
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4
      }
    ]
  };

  // Helper function to get past dates
  const getPastDates = (days: number) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates.reverse();
  };

  // Fetch latest exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`);
        const data = await response.json();
        if (data.result === "success") {
          const rate = data.conversion_rates[toCurrency];
          setExchangeRate(rate);
          setConvertedAmount(amount * rate);
          setLastUpdated(new Date().toLocaleString());
        } else {
          console.error('Error fetching exchange rate:', data);
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }
    };

    fetchExchangeRate();
  }, [amount, fromCurrency, toCurrency]);

  // Fetch historical data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const dates = getPastDates(30);
        const promises = dates.map(date => {
          const [year, month, day] = date.split('-');
          return fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/history/${fromCurrency}/${year}/${month}/${day}`)
            .then(res => res.json())
            .then(data => {
              if (data.result === "success") {
                return { date, rate: data.conversion_rates[toCurrency] };
              } else {
                throw new Error('Failed to fetch historical rate');
              }
            });
        });
        const results = await Promise.all(promises);
        const historicalRates = results.map(r => r.rate);
        setHistoricalData({
          dates,
          rates: historicalRates
        });
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

    fetchHistoricalData();
  }, [fromCurrency, toCurrency]);

  // Handle currency swap
  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // Format currency display
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Toggle favorite currency
  const toggleFavorite = (currency: string) => {
    setFavorites(prev => 
      prev.includes(currency)
        ? prev.filter(c => c !== currency)
        : [...prev, currency]
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <CurrencyConverterSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Currency <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Converter</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Convert between currencies using real-time exchange rates. Support for all major world currencies and cryptocurrencies.
      </p>
    </div>
  </div>
</section>

        {/* Converter Section */}
        <section className="py-12">
          <div className="container max-w-[1200px] px-6 mx-auto">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Convert Currency</CardTitle>
                    <CardDescription>
                      Enter amount and select currencies to convert between.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Amount Input */}
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="amount"
                              type="number"
                              className="pl-9"
                              value={amount}
                              onChange={(e) => setAmount(Number(e.target.value))}
                              min={0}
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Currency Selection */}
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="from-currency">From Currency</Label>
                          <Select value={fromCurrency} onValueChange={setFromCurrency}>
                            <SelectTrigger id="from-currency">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {showFavorites ? (
                                <div className="space-y-2">
                                  <div className="px-2 py-1.5 text-sm font-medium">Favorites</div>
                                  {favorites.map((code) => (
                                    <SelectItem key={code} value={code}>
                                      {code} - {currencies[code].name}
                                    </SelectItem>
                                  ))}
                                  <Separator />
                                  <div className="px-2 py-1.5 text-sm font-medium">All Currencies</div>
                                </div>
                              ) : null}
                              {Object.entries(currencies).map(([code, currency]) => (
                                <SelectItem key={code} value={code}>
                                  {code} - {currency.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="relative space-y-2">
                          <Label htmlFor="to-currency">To Currency</Label>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute -left-6 top-8 z-10"
                            onClick={handleSwapCurrencies}
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                          <Select value={toCurrency} onValueChange={setToCurrency}>
                            <SelectTrigger id="to-currency">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {showFavorites ? (
                                <div className="space-y-2">
                                  <div className="px-2 py-1.5 text-sm font-medium">Favorites</div>
                                  {favorites.map((code) => (
                                    <SelectItem key={code} value={code}>
                                      {code} - {currencies[code].name}
                                    </SelectItem>
                                  ))}
                                  <Separator />
                                  <div className="px-2 py-1.5 text-sm font-medium">All Currencies</div>
                                </div>
                              ) : null}
                              {Object.entries(currencies).map(([code, currency]) => (
                                <SelectItem key={code} value={code}>
                                  {code} - {currency.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Conversion Result */}
                    <div className="rounded-lg bg-muted p-6">
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">
                          {formatCurrency(amount, fromCurrency)} = {formatCurrency(convertedAmount, toCurrency)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Last updated: {lastUpdated}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Historical Data */}
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Historical Exchange Rates</CardTitle>
                    <CardDescription>
                      View exchange rate trends over the past 30 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <Line data={chartData} options={chartOptions} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Quick Convert */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Convert</CardTitle>
                    <CardDescription>
                      Common conversion amounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[100, 1000, 5000, 10000].map((quickAmount) => (
                      <div
                        key={quickAmount}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted/70 cursor-pointer"
                        onClick={() => setAmount(quickAmount)}
                      >
                        <span>{formatCurrency(quickAmount, fromCurrency)}</span>
                        <span>{formatCurrency(quickAmount * exchangeRate, toCurrency)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-favorites">Show Favorites First</Label>
                      <Switch
                        id="show-favorites"
                        checked={showFavorites}
                        onCheckedChange={setShowFavorites}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>About Exchange Rates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Exchange rates are updated in real-time from reliable financial data providers. 
                      Rates shown are mid-market rates and may differ from rates used by financial institutions 
                      for actual currency conversion transactions.
                    </p>
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
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Global Finance</span>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Understanding Currency Exchange in a Global Economy</h2>
                <p className="mt-3 text-muted-foreground text-lg">Navigate international currencies with confidence using our comprehensive guide</p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Introduction Section */}
              <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    The Essential Currency Converter
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <p>
                        In our increasingly interconnected world, understanding and navigating <strong>currency exchange</strong> is essential for everyone—from travelers and digital nomads to investors and businesses operating across borders.
                      </p>
                      <p className="mt-3">
                        A currency converter serves as your financial interpreter, translating monetary values between different national currencies based on current exchange rates. This seemingly simple tool has become indispensable in our global economy.
                      </p>
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Why Currency Converters Matter</h4>
                        <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                          <li>• Make informed decisions when traveling internationally</li>
                          <li>• Evaluate foreign investments and pricing opportunities</li>
                          <li>• Monitor exchange rate trends affecting your finances</li>
                          <li>• Calculate accurate costs for international transactions</li>
                          <li>• Avoid unnecessary currency conversion fees</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Global Currency Snapshot</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead className="bg-blue-100/50 dark:bg-blue-800/50">
                              <tr>
                                <th className="px-3 py-2 text-left">Currency</th>
                                <th className="px-3 py-2 text-left">Code</th>
                                <th className="px-3 py-2 text-right">USD Value</th>
                                <th className="px-3 py-2 text-right">30-Day Trend</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-100 dark:divide-blue-800">
                              <tr>
                                <td className="px-3 py-2">Euro</td>
                                <td className="px-3 py-2">EUR</td>
                                <td className="px-3 py-2 text-right">1.09</td>
                                <td className="px-3 py-2 text-right text-green-600">+0.8%</td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2">British Pound</td>
                                <td className="px-3 py-2">GBP</td>
                                <td className="px-3 py-2 text-right">1.28</td>
                                <td className="px-3 py-2 text-right text-green-600">+1.2%</td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2">Japanese Yen</td>
                                <td className="px-3 py-2">JPY</td>
                                <td className="px-3 py-2 text-right">0.0067</td>
                                <td className="px-3 py-2 text-right text-red-600">-1.5%</td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2">Canadian Dollar</td>
                                <td className="px-3 py-2">CAD</td>
                                <td className="px-3 py-2 text-right">0.74</td>
                                <td className="px-3 py-2 text-right text-red-600">-0.3%</td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2">Australian Dollar</td>
                                <td className="px-3 py-2">AUD</td>
                                <td className="px-3 py-2 text-right">0.67</td>
                                <td className="px-3 py-2 text-right text-green-600">+0.5%</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-right">*Exchange rates as of April 21, 2025</p>
                      </div>
                      
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          <strong>Did you know?</strong> Over $6.6 trillion in currencies are exchanged globally every day, making the foreign exchange (forex) market the largest financial market in the world by trading volume.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
                      <CardContent className="pt-5">
                        <div className="flex flex-col items-center text-center">
                          <Plane className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          <h3 className="mt-3 text-lg font-semibold text-blue-800 dark:text-blue-300">Travel Planning</h3>
                          <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                            Budget accurately for international trips by converting costs to your home currency
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
                      <CardContent className="pt-5">
                        <div className="flex flex-col items-center text-center">
                          <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                          <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-300">Investment Analysis</h3>
                          <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                            Evaluate international investments and understand currency risk impact
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
                      <CardContent className="pt-5">
                        <div className="flex flex-col items-center text-center">
                          <Building className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                          <h3 className="mt-3 text-lg font-semibold text-purple-800 dark:text-purple-300">Business Operations</h3>
                          <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                            Manage international pricing, payroll, and financial reporting across currencies
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Exchange Rate Fundamentals */}
              <div className="mb-10" id="exchange-fundamentals">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <LineChart className="h-6 w-6 text-blue-600" />
                  Exchange Rate Fundamentals
                </h2>
                
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowLeftRight className="h-5 w-5 text-blue-600" />
                      Understanding Exchange Rates
                    </CardTitle>
                    <CardDescription>How currency values are determined in global markets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">What Are Exchange Rates?</h3>
                        <p className="mb-4">
                          An exchange rate represents the value of one currency in terms of another. This relationship determines how much of one currency you'll receive when converting to another.
                        </p>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <p className="mb-2 font-medium text-blue-700 dark:text-blue-400">Key Exchange Rate Concepts</p>
                          <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-500">
                            <li><strong>Base Currency:</strong> The first currency in a currency pair (e.g., USD in USD/EUR)</li>
                            <li><strong>Quote Currency:</strong> The second currency, showing how much you'll receive for one unit of base currency</li>
                            <li><strong>Bid Rate:</strong> The rate at which a dealer will buy the base currency</li>
                            <li><strong>Ask Rate:</strong> The rate at which a dealer will sell the base currency</li>
                            <li><strong>Spread:</strong> The difference between bid and ask rates—essentially the dealer's profit margin</li>
                          </ul>
                        </div>
                        
                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                              Remember that exchange rates are always expressed as a ratio between two currencies. When one currency strengthens, the other weakens proportionally.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="h-[240px]">
                          <h4 className="text-center text-sm font-medium mb-2">EUR/USD Exchange Rate (12 Months)</h4>
                          <Line 
                            data={{
                              labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
                              datasets: [{
                                label: 'EUR/USD',
                                data: [1.077, 1.086, 1.091, 1.095, 1.102, 1.088, 1.071, 1.065, 1.083, 1.089, 1.095, 1.097, 1.090],
                                borderColor: 'rgba(59, 130, 246, 0.8)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                tension: 0.4
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: false,
                                 ticks: { callback: (value) => typeof value === 'number' ? value.toFixed(3) : value }
                                }
                              },
                              plugins: {
                                legend: { display: false }
                              }
                            }}
                          />
                        </div>
                        
                        <div className="p-4 border border-blue-200 dark:border-blue-900 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Reading Currency Pairs</h4>
                          
                          <div className="flex flex-col space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">EUR/USD = 1.09</span>
                              <span className="text-sm text-blue-600 dark:text-blue-500">1 Euro = 1.09 US Dollars</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">USD/JPY = 150.25</span>
                              <span className="text-sm text-blue-600 dark:text-blue-500">1 US Dollar = 150.25 Japanese Yen</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">GBP/USD = 1.28</span>
                              <span className="text-sm text-blue-600 dark:text-blue-500">1 British Pound = 1.28 US Dollars</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scale className="h-5 w-5 text-green-600" />
                      Factors Influencing Exchange Rates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="mb-4">
                          Exchange rates are in constant flux, influenced by numerous economic, political, and market factors. Understanding these drivers helps predict potential currency movements.
                        </p>
                        
                        <div className="space-y-4">
                          <div className="p-3 border border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                            <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Economic Factors</h4>
                            <ul className="text-sm space-y-1 text-green-700 dark:text-green-400">
                              <li className="flex items-start gap-2">
                                <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span><strong>Interest Rates:</strong> Higher rates typically strengthen a currency as they attract foreign capital</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <BarChart3 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span><strong>Inflation:</strong> Lower inflation generally strengthens currency value over time</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Building className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span><strong>Economic Growth:</strong> Strong GDP growth often leads to currency appreciation</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="p-3 border border-purple-200 dark:border-purple-900 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                            <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">Political Factors</h4>
                            <ul className="text-sm space-y-1 text-purple-700 dark:text-purple-400">
                              <li className="flex items-start gap-2">
                                <Globe className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span><strong>Political Stability:</strong> Stable politics generally support stronger currencies</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Library className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span><strong>Government Policy:</strong> Fiscal and trade policies impact currency valuations</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Newspaper className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span><strong>Geopolitical Events:</strong> Tensions or uncertainty can cause rapid currency fluctuations</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="p-3 border border-blue-200 dark:border-blue-900 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 mb-4">
                          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Market Factors</h4>
                          <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-400">
                            <li className="flex items-start gap-2">
                              <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span><strong>Market Sentiment:</strong> Investor perception and risk appetite</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <LineChart className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span><strong>Speculation:</strong> Trading activity based on expected future movements</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <BarChart3 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span><strong>Liquidity:</strong> The volume and ease of trading specific currencies</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="h-[200px]">
                          <h4 className="text-center text-sm font-medium mb-2">Impact of Interest Rate Differentials</h4>
                          <Bar 
                            data={{
                              labels: ['USD-EUR', 'USD-JPY', 'USD-GBP', 'USD-CAD', 'USD-AUD'],
                              datasets: [
                                {
                                  label: 'Interest Rate Difference (%)',
                                  data: [1.5, 4.2, 0.8, 1.0, 1.2],
                                  backgroundColor: 'rgba(59, 130, 246, 0.7)'
                                },
                                {
                                  label: 'Currency Strength (Relative to USD)',
                                  data: [-3.2, -5.8, -1.5, -2.1, -2.8],
                                  backgroundColor: 'rgba(16, 185, 129, 0.7)'
                                }
                              ]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: false,
                                  title: {
                                    display: true,
                                    text: 'Percentage (%)'
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          <strong>Key Insight:</strong> The relationship between interest rates and exchange rates is particularly strong. When a country raises interest rates, its currency typically appreciates as investors seek higher returns. This is why currency markets react sharply to central bank announcements.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LineChart className="h-5 w-5 text-purple-600" />
                        Types of Exchange Rates
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                          <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Spot Rate</h4>
                          <p className="text-sm text-purple-700 dark:text-purple-400">
                            The current market rate for immediate exchange of currencies. This is what most travelers and consumers use for everyday transactions.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                          <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Forward Rate</h4>
                          <p className="text-sm text-purple-700 dark:text-purple-400">
                            A rate agreed upon today for exchange at a specified future date. Businesses use these to hedge against currency fluctuation risks.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                          <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Fixed vs. Floating Rates</h4>
                          <p className="text-sm text-purple-700 dark:text-purple-400">
                            Some currencies maintain a fixed exchange rate pegged to another currency or basket, while most major currencies use floating rates determined by market forces.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                          <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Real Exchange Rate</h4>
                          <p className="text-sm text-purple-700 dark:text-purple-400">
                            Adjusts the nominal exchange rate to account for inflation differences between countries, providing a more accurate measure of purchasing power.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CircleDollarSign className="h-5 w-5 text-blue-600" />
                        Major Currency Pairs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">
                        While there are over 180 currencies in the world, a handful of "major" currency pairs dominate global forex trading volume.
                      </p>

                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="py-2 px-3 text-left">Pair</th>
                              <th className="py-2 px-3 text-left">Nickname</th>
                              <th className="py-2 px-3 text-left">% of Global Volume</th>
                              <th className="py-2 px-3 text-left">Characteristic</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <tr>
                              <td className="py-2 px-3 font-medium">EUR/USD</td>
                              <td className="py-2 px-3">The Fiber</td>
                              <td className="py-2 px-3">28%</td>
                              <td className="py-2 px-3">Highest liquidity and lowest spreads</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-medium">USD/JPY</td>
                              <td className="py-2 px-3">The Ninja</td>
                              <td className="py-2 px-3">13%</td>
                              <td className="py-2 px-3">Sensitive to risk sentiment</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-medium">GBP/USD</td>
                              <td className="py-2 px-3">Cable</td>
                              <td className="py-2 px-3">11%</td>
                              <td className="py-2 px-3">Known for volatility</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-medium">AUD/USD</td>
                              <td className="py-2 px-3">The Aussie</td>
                              <td className="py-2 px-3">7%</td>
                              <td className="py-2 px-3">Tied to commodity prices</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-medium">USD/CAD</td>
                              <td className="py-2 px-3">The Loonie</td>
                              <td className="py-2 px-3">5%</td>
                              <td className="py-2 px-3">Influenced by oil prices</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <p className="text-sm text-blue-700 dark:text-blue-400">
                            Together, these five major pairs account for over 60% of global forex trading volume. The U.S. dollar is involved in nearly 90% of all currency trades worldwide.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Practical Applications & Tips */}
              <div className="mb-10" id="practical-applications">
                <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-6 w-6 text-green-600 dark:text-green-400" />
                        <span className="text-2xl">Practical Currency Conversion Tips</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      How to get the most value when converting currencies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="mb-8">
                      <h3 id="travel-tips" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                        <Plane className="h-5 w-5" />
                        For International Travelers
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <p>
                            <strong>Smart currency decisions</strong> can save travelers significant money, sometimes up to 5-10% of your total trip budget. Being strategic about when, where, and how you exchange currency makes a real difference.
                          </p>
                          
                          <div className="mt-4 space-y-2">
                            <h4 className="font-medium">Best Practices for Travel Money:</h4>
                            <ul className="space-y-1 text-sm">
                              <li className="flex items-start gap-2">
                                <CreditCard className="h-4 w-4 text-green-600 mt-0.5" />
                                <span><strong>Use credit cards with no foreign transaction fees</strong> for large purchases (typically saves 2-3% per transaction)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Landmark className="h-4 w-4 text-green-600 mt-0.5" />
                                <span><strong>Withdraw local currency from ATMs</strong> rather than exchanging at airport kiosks (often 8-10% better rates)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Calculator className="h-4 w-4 text-green-600 mt-0.5" />
                                <span><strong>Always choose to be charged in local currency</strong> when making card purchases to avoid dynamic currency conversion fees</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <DollarSign className="h-4 w-4 text-green-600 mt-0.5" />
                                <span><strong>Exchange some money before traveling</strong> for immediate expenses like transportation from the airport</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="mt-4 p-3 border border-green-200 dark:border-green-900 rounded-md bg-green-50 dark:bg-green-900/20">
                            <p className="text-sm text-green-800 dark:text-green-300">
                              <strong>Tip:</strong> When comparing exchange options, focus on the total amount you'll receive after all fees—not just the advertised exchange rate.
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <div className="p-4 rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20">
                            <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">Currency Exchange Comparison</h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead className="bg-green-100/70 dark:bg-green-800/50">
                                  <tr>
                                    <th className="px-2 py-2 text-left">Method</th>
                                    <th className="px-2 py-2 text-left">Rate for $1000</th>
                                    <th className="px-2 py-2 text-left">Fees</th>
                                    <th className="px-2 py-2 text-left">Amount Received</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-green-100 dark:divide-green-800">
                                  <tr>
                                    <td className="px-2 py-2">Airport Kiosk</td>
                                    <td className="px-2 py-2">€850</td>
                                    <td className="px-2 py-2">€25</td>
                                    <td className="px-2 py-2 font-medium">€825</td>
                                  </tr>
                                  <tr>
                                    <td className="px-2 py-2">Bank Exchange</td>
                                    <td className="px-2 py-2">€880</td>
                                    <td className="px-2 py-2">€15</td>
                                    <td className="px-2 py-2 font-medium">€865</td>
                                  </tr>
                                  <tr>
                                    <td className="px-2 py-2">ATM Withdrawal</td>
                                    <td className="px-2 py-2">€905</td>
                                    <td className="px-2 py-2">€5</td>
                                    <td className="px-2 py-2 font-medium">€900</td>
                                  </tr>
                                  <tr>
                                    <td className="px-2 py-2">No-Fee Credit Card</td>
                                    <td className="px-2 py-2">€910</td>
                                    <td className="px-2 py-2">€0</td>
                                    <td className="px-2 py-2 font-medium text-green-700 dark:text-green-400">€910</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <p className="text-xs mt-2 text-green-600 dark:text-green-500">*Example based on USD to EUR exchange with typical market rates and fees</p>
                          </div>
                          
                          <div className="p-3 mt-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                              <p className="text-sm text-amber-700 dark:text-amber-400">
                                <strong>Watch out:</strong> Always decline offers to "pay in your home currency" when abroad. This service (called Dynamic Currency Conversion) typically adds a 3-7% markup to the exchange rate.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-8" />
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 id="business-applications" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          For Businesses & Investors
                        </h3>
                        <p>
                          For businesses operating internationally, currency fluctuations can significantly impact profitability. Smart currency management is essential for protecting margins and maximizing returns.
                        </p>
                        
                        <div className="mt-4 space-y-3">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <h4 className="font-medium text-blue-700 dark:text-blue-400">Currency Risk Management</h4>
                            <p className="text-sm mt-1 text-blue-600 dark:text-blue-500">
                              Use forward contracts and options to lock in exchange rates for future transactions, protecting against adverse currency movements.
                            </p>
                          </div>
                          
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <h4 className="font-medium text-blue-700 dark:text-blue-400">Strategic Pricing</h4>
                            <p className="text-sm mt-1 text-blue-600 dark:text-blue-500">
                              Build currency fluctuation buffers into international pricing strategies or consider dynamic pricing that adjusts based on exchange rates.
                            </p>
                          </div>
                          
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <h4 className="font-medium text-blue-700 dark:text-blue-400">Natural Hedging</h4>
                            <p className="text-sm mt-1 text-blue-600 dark:text-blue-500">
                              Match revenues and expenses in the same currency where possible to reduce exposure to exchange rate fluctuations.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 id="online-shopping" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />
                          For Online Shoppers
                        </h3>
                        <p>
                          International e-commerce has made cross-border shopping increasingly common. Understanding currency conversion can help you find better deals and avoid hidden costs.
                        </p>
                        
                        <div className="mt-4 space-y-4">
                          <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                            <h4 className="font-medium text-purple-700 dark:text-purple-400">Compare Total Costs</h4>
                            <p className="text-sm mt-1">
                              Use currency converters to compare prices across international retailers, but remember to factor in shipping, import duties, and credit card fees.
                            </p>
                          </div>
                          
                          <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                            <h4 className="font-medium text-purple-700 dark:text-purple-400">Choose the Right Payment Method</h4>
                            <p className="text-sm mt-1">
                              Some credit cards offer better exchange rates than others. Services like PayPal may have different conversion rates than your card issuer.
                            </p>
                          </div>
                          
                          <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                            <h4 className="font-medium text-purple-700 dark:text-purple-400">Monitor Exchange Rate Trends</h4>
                            <p className="text-sm mt-1">
                              For large purchases, consider timing your buy when exchange rates are favorable. Some currency converter apps offer rate alerts.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Using Currency Converters Effectively */}
              <div className="mb-10" id="converter-usage">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  Using Currency Converters Effectively
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Features to Look For</CardTitle>
                      <CardDescription>
                        What makes a good currency converter
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          Real-Time Exchange Rates
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Look for tools that update rates frequently throughout the day to ensure you're getting the most current information.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <History className="h-4 w-4 text-blue-600" />
                          Historical Rate Data
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Access to historical trends helps identify patterns and make more informed decisions about timing currency conversions.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Bell className="h-4 w-4 text-blue-600" />
                          Rate Alerts
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Set notifications for when rates reach your desired threshold, helping you convert at the most advantageous times.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Calculator className="h-4 w-4 text-blue-600" />
                          Fee Calculators
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Advanced converters include options to factor in bank or service fees to provide a more accurate picture of how much you'll actually receive.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Common Pitfalls to Avoid</CardTitle>
                      <CardDescription>
                        Mistakes that can cost you money
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          Ignoring the Spread
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Currency converters often show mid-market rates, but actual exchange services charge a spread. Calculate the real cost by comparing the buy and sell rates.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          Forgetting About Fees
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Many currency exchange services advertise attractive rates but charge hefty fixed fees that can significantly impact the total value, especially for smaller amounts.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          Overlooking Delivery Options
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          For physical currency, different delivery methods (mail, in-store pickup) may have different rates and fees. Calculate the all-in cost before deciding.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 mt-4">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          <strong>Pro Tip:</strong> Always check multiple sources before making large currency conversions. Different providers can offer significantly different rates, especially for less commonly traded currencies.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <Card className="border-green-200 dark:border-green-900">
                    <CardHeader className="bg-green-50 dark:bg-green-900/30">
                      <CardTitle className="text-green-800 dark:text-green-300">Step-by-Step Currency Conversion Guide</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <ol className="space-y-4 list-decimal list-inside">
                            <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                              <span className="font-medium">Understand your needs</span>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Determine whether you need a spot conversion, want to analyze trends, or are planning for future exchanges.
                              </p>
                            </li>
                            
                            <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                              <span className="font-medium">Enter the correct currency codes</span>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Use the standard three-letter codes (USD, EUR, GBP, etc.) to avoid confusion between similar currency names.
                              </p>
                            </li>
                            
                            <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                              <span className="font-medium">Double-check your decimal places</span>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Ensure you've entered the correct amount, especially when dealing with currencies that have very different values.
                              </p>
                            </li>
                          </ol>
                        </div>
                        
                        <div>
                         <ol className="space-y-4 list-decimal list-inside" start={4}>
                            <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                              <span className="font-medium">Note the date and time of rates</span>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Exchange rates fluctuate constantly. Check when the rate was last updated for time-sensitive conversions.
                              </p>
                            </li>
                            
                            <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                              <span className="font-medium">Consider fee inclusion</span>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Use advanced features to include bank or service fees in your calculation for a more accurate picture.
                              </p>
                            </li>
                            
                            <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                              <span className="font-medium">Save or export your results</span>
                              <p className="mt-1 text-sm text-muted-foreground">
                                For business or tax purposes, save your calculations with timestamps for future reference.
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
                      <Globe className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                      Navigating the Global Currency Landscape
                    </CardTitle>
                    <CardDescription>
                      Empowering your international financial decisions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p>
                      <strong>Currency converters</strong> are much more than simple calculators—they're essential tools for navigating our increasingly interconnected global economy. Whether you're planning an international vacation, expanding your business overseas, or diversifying your investment portfolio, understanding exchange rates and having reliable conversion tools at your fingertips helps you make informed financial decisions.
                    </p>
                    
                    <p className="mt-4" id="next-steps">
                      As you engage with international currencies, remember these key principles:
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">For Personal Use</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span className="text-blue-800 dark:text-blue-300">Compare total costs including fees, not just exchange rates</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span className="text-blue-800 dark:text-blue-300">Use specialized travel cards or no-foreign-fee credit cards when possible</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span className="text-blue-800 dark:text-blue-300">Monitor exchange rates before trips to time large currency conversions advantageously</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">For Business & Investment</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-green-800 dark:text-green-300">Develop a currency management strategy to mitigate exchange rate risks</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-green-800 dark:text-green-300">Consider currency diversification as part of your overall investment approach</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-green-800 dark:text-green-300">Stay informed about economic factors that influence the currencies relevant to your interests</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to convert currencies with confidence?</p>
                          <p className="mt-1 text-blue-700 dark:text-blue-400">
                            Use our <strong>Currency Converter</strong> above for accurate, real-time exchange rate information! For more financial tools, explore our related calculators:
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/travel-budget">
                                <Plane className="h-4 w-4 mr-1" />
                                Travel Budget
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/investment">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                Investment Calculator
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/international-tax">
                                <Receipt className="h-4 w-4 mr-1" />
                                International Tax
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