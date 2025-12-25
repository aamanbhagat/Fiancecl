"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import dynamic from "next/dynamic"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
    Scale,
    Share2,
    Printer,
    History,
    RotateCcw,
    Info,
    Apple,
    Dumbbell,
    Heart,
    Brain,
    ActivitySquare,
    BarChart3,
    HeartPulse,
    Ruler,
    Weight,
    Goal,
    CalendarRange,
    AlertCircle,
    Utensils,
    Footprints,
    Percent,
    Baby,
    LineChart,
    Check,
    AlertTriangle,
    Users,
    Link,
    Calculator
  } from "lucide-react";  
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,  // Add this import
  BarElement,  // Add this import 
  Title,
  Tooltip as ChartTooltip,
  Legend,
  type ChartOptions
} from 'chart.js';
import BmiSchema from "./schema"
import { Separator } from "@radix-ui/react-dropdown-menu"

// Dynamically import Chart components for client-side only
const DynamicLine = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false })
const DynamicPie = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), { ssr: false })
const DynamicBar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false })

// Register Chart.js components
// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,  // Add this registration
  BarElement,  // Add this registration
  Title,
  ChartTooltip,
  Legend
)

interface BMIResult {
  bmi: number
  category: string
  color: string
  recommendation: string
  lifestyle: {
    diet: string[]
    exercise: string[]
    health: string[]
    mental: string[]
  }
}

interface BMIHistory {
  date: string
  bmi: number
  weight: number
  height: number
  isMetric: boolean
}

export default function BMICalculator() {
  const [weight, setWeight] = useState<string>("")
  const [height, setHeight] = useState<string>("")
  const [isMetric, setIsMetric] = useState(true)
  const [bmiResult, setBMIResult] = useState<BMIResult | null>(null)
  const [history, setHistory] = useState<BMIHistory[]>([])
  const [errors, setErrors] = useState({ weight: "", height: "" })
  const [showInitialInfo, setShowInitialInfo] = useState(true)

  const [isClient, setIsClient] = useState(false)
  
  // Check if code is running on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load history from localStorage
  useEffect(() => {
    if (isClient) {
      const savedHistory = localStorage.getItem("bmiHistory")
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory))
      }
    }
  }, [isClient])

  // Save history to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("bmiHistory", JSON.stringify(history))
    }
  }, [history, isClient])

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem("bmiHistory", JSON.stringify(history))
  }, [history])

  // Real-time BMI calculation
  useEffect(() => {
    if (weight && height && !isNaN(Number(weight)) && !isNaN(Number(height))) {
      calculateBMI()
      setShowInitialInfo(false)
    } else {
      setBMIResult(null)
      setShowInitialInfo(true)
    }
  }, [weight, height, isMetric])

  const calculateBMI = () => {
    setErrors({ weight: "", height: "" })

    let weightNum = Number(weight)
    let heightNum = Number(height)

    if (weightNum <= 0 || heightNum <= 0) return

    let bmi: number
    let weightInKg = weightNum
    let heightInM = heightNum

    if (!isMetric) {
      weightInKg = weightNum * 0.453592
      heightInM = heightNum * 0.0254
    } else {
      heightInM = heightNum / 100
    }

    bmi = weightInKg / (heightInM * heightInM)

    let category: string
    let color: string
    let recommendation: string
    let lifestyle = {
      diet: [] as string[],
      exercise: [] as string[],
      health: [] as string[],
      mental: [] as string[]
    }

    if (bmi < 18.5) {
      category = "Underweight"
      color = "text-blue-500"
      recommendation = "Your BMI indicates you're underweight. Focus on healthy weight gain through balanced nutrition."
      lifestyle = {
        diet: [
          "Increase caloric intake with nutrient-dense foods",
          "Add healthy fats like avocados and nuts",
          "Include protein-rich foods in every meal"
        ],
        exercise: [
          "Focus on strength training",
          "Limit cardio exercises",
          "Include rest days for recovery"
        ],
        health: [
          "Regular health check-ups",
          "Monitor nutrient levels",
          "Track weight gain progress"
        ],
        mental: [
          "Maintain a positive body image",
          "Set realistic weight goals",
          "Focus on overall wellness"
        ]
      }
    } else if (bmi >= 18.5 && bmi < 25) {
      category = "Normal"
      color = "text-green-500"
      recommendation = "Your BMI is within the healthy range. Maintain your current lifestyle with balanced nutrition and regular exercise."
      lifestyle = {
        diet: [
          "Maintain balanced meal portions",
          "Include variety of fruits and vegetables",
          "Stay hydrated with water"
        ],
        exercise: [
          "Mix cardio and strength training",
          "Stay active daily",
          "Try different activities"
        ],
        health: [
          "Regular health check-ups",
          "Adequate sleep",
          "Stress management"
        ],
        mental: [
          "Celebrate your healthy habits",
          "Stay motivated",
          "Share your success"
        ]
      }
    } else if (bmi >= 25 && bmi < 30) {
      category = "Overweight"
      color = "text-yellow-500"
      recommendation = "Your BMI indicates you're overweight. Consider making lifestyle changes to reach a healthier weight."
      lifestyle = {
        diet: [
          "Control portion sizes",
          "Reduce processed foods",
          "Increase fiber intake"
        ],
        exercise: [
          "Regular cardio exercises",
          "Include strength training",
          "Start with walking"
        ],
        health: [
          "Monitor blood pressure",
          "Regular health check-ups",
          "Track progress weekly"
        ],
        mental: [
          "Set realistic goals",
          "Stay positive",
          "Build support system"
        ]
      }
    } else {
      category = "Obese"
      color = "text-red-500"
      recommendation = "Your BMI indicates obesity. Consider consulting a healthcare provider for personalized advice."
      lifestyle = {
        diet: [
          "Consult a nutritionist",
          "Plan meals ahead",
          "Track food intake"
        ],
        exercise: [
          "Start with low-impact activities",
          "Gradually increase activity",
          "Consider professional guidance"
        ],
        health: [
          "Regular medical check-ups",
          "Monitor health markers",
          "Consider professional support"
        ],
        mental: [
          "Seek professional support",
          "Join support groups",
          "Focus on progress not perfection"
        ]
      }
    }

    const result = {
      bmi: Number(bmi.toFixed(1)),
      category,
      color,
      recommendation,
      lifestyle
    }

    setBMIResult(result)

    // Add to history
    const newEntry: BMIHistory = {
      date: new Date().toLocaleString(),
      bmi: result.bmi,
      weight: Number(weight),
      height: Number(height),
      isMetric
    }
    setHistory(prev => [newEntry, ...prev].slice(0, 10))
  }

  const resetForm = () => {
    setWeight("")
    setHeight("")
    setBMIResult(null)
    setErrors({ weight: "", height: "" })
    setShowInitialInfo(true)
  }

  const shareResults = async () => {
    if (bmiResult) {
      const text = `My BMI is ${bmiResult.bmi} (${bmiResult.category})`
      try {
        await navigator.share({ title: "My BMI Results", text })
      } catch (err) {
        navigator.clipboard.writeText(text)
      }
    }
  }

  const chartData = {
    labels: history.map(entry => new Date(entry.date).toLocaleDateString()),
    datasets: [{
      label: "BMI",
      data: history.map(entry => entry.bmi),
      borderColor: "rgb(99, 102, 241)",
      backgroundColor: "rgba(99, 102, 241, 0.1)",
      tension: 0.4,
      fill: true
    }]
  }

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(156, 163, 175, 0.1)" }
      },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false }
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <BmiSchema />
      <SiteHeader />
      <main className="flex-1">
      <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        BMI <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate your Body Mass Index (BMI) and get personalized health insights.
      </p>
    </div>
  </div>
</section>

        <section className="py-8 px-4 md:py-12 md:px-8">
          <div className="container max-w-7xl mx-auto">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="w-full space-y-6">
                <Card className="overflow-hidden">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-xl">Enter Your Measurements</CardTitle>
                    <CardDescription className="text-sm">
                      Choose your preferred unit system and enter your measurements.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Label htmlFor="unit-toggle" className="text-sm">Unit System</Label>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${isMetric ? "text-primary" : "text-muted-foreground"}`}>Metric</span>
                        <Switch
                          id="unit-toggle"
                          checked={!isMetric}
                          onCheckedChange={(checked) => setIsMetric(!checked)}
                        />
                        <span className={`text-sm ${!isMetric ? "text-primary" : "text-muted-foreground"}`}>Imperial</span>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="weight" className="text-sm">Weight ({isMetric ? "kg" : "lbs"})</Label>
                        <Input
                          id="weight"
                          type="number"
                          placeholder={`Enter weight in ${isMetric ? "kilograms" : "pounds"}`}
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className={`text-sm ${errors.weight ? "border-red-500" : ""}`}
                        />
                        {errors.weight && (
                          <p className="text-xs text-red-500">{errors.weight}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="height" className="text-sm">Height ({isMetric ? "cm" : "inches"})</Label>
                        <Input
                          id="height"
                          type="number"
                          placeholder={`Enter height in ${isMetric ? "centimeters" : "inches"}`}
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          className={`text-sm ${errors.height ? "border-red-500" : ""}`}
                        />
                        {errors.height && (
                          <p className="text-xs text-red-500">{errors.height}</p>
                        )}
                      </div>
                    </div>

                    <Button variant="outline" onClick={resetForm} className="w-full text-sm">
                      <RotateCcw className="h-4 w-4 mr-2" /> Reset
                    </Button>
                  </CardContent>
                </Card>

                {showInitialInfo && (
                  <Card className="overflow-hidden">
                    <CardHeader className="p-4 md:p-6">
                      <CardTitle className="text-xl">Why Calculate BMI?</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Scale className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Quick Health Assessment</h4>
                          <p className="text-sm text-muted-foreground">BMI provides a simple measure to assess if you're at a healthy weight for your height.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Heart className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Health Risk Indicator</h4>
                          <p className="text-sm text-muted-foreground">Your BMI can indicate potential health risks and help guide lifestyle decisions.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Brain className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Personalized Insights</h4>
                          <p className="text-sm text-muted-foreground">Get tailored recommendations based on your BMI calculation.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="w-full space-y-6">
                <Card className="overflow-hidden">
                  <CardHeader className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Your Results</CardTitle>
                      {bmiResult && (
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={shareResults}>
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Share results</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={() => window.print()}>
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Print results</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    {bmiResult ? (
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4 md:p-6">
                            <Scale className="h-8 w-8 md:h-12 md:w-12 text-primary" />
                          </div>
                          <h3 className="mt-4 text-3xl md:text-4xl font-bold">{bmiResult.bmi}</h3>
                          <p className={`text-base md:text-lg font-medium ${bmiResult.color}`}>
                            {bmiResult.category}
                          </p>
                        </div>

                        <div className="rounded-lg bg-muted p-3 md:p-4">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-xs md:text-sm text-muted-foreground">
                              {bmiResult.recommendation}
                            </p>
                          </div>
                        </div>

                        <Tabs defaultValue="diet" className="w-full">
                          <TabsList className="w-full grid grid-cols-4 h-auto">
                            <TabsTrigger value="diet" className="text-xs md:text-sm py-2">Diet</TabsTrigger>
                            <TabsTrigger value="exercise" className="text-xs md:text-sm py-2">Exercise</TabsTrigger>
                            <TabsTrigger value="health" className="text-xs md:text-sm py-2">Health</TabsTrigger>
                            <TabsTrigger value="mental" className="text-xs md:text-sm py-2">Mental</TabsTrigger>
                          </TabsList>
                          
                          {["diet", "exercise", "health", "mental"].map((tab) => (
                            <TabsContent key={tab} value={tab} className="mt-4">
                              <Card className="border-0">
                                <CardHeader className="p-4">
                                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                    {tab === "diet" && <Apple className="h-4 w-4 md:h-5 md:w-5" />}
                                    {tab === "exercise" && <Dumbbell className="h-4 w-4 md:h-5 md:w-5" />}
                                    {tab === "health" && <Heart className="h-4 w-4 md:h-5 md:w-5" />}
                                    {tab === "mental" && <Brain className="h-4 w-4 md:h-5 md:w-5" />}
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)} Recommendations
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                  <ul className="space-y-2">
                                    {bmiResult.lifestyle[tab as keyof typeof bmiResult.lifestyle].map((item, index) => (
                                      <li key={index} className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                            </TabsContent>
                          ))}
                        </Tabs>

                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: "Underweight", value: "< 18.5", color: "text-blue-500" },
                            { label: "Normal", value: "18.5 - 24.9", color: "text-green-500" },
                            { label: "Overweight", value: "25 - 29.9", color: "text-yellow-500" },
                            { label: "Obese", value: "> 30", color: "text-red-500" }
                          ].map((category, index) => (
                            <div key={index} className="flex items-center justify-between rounded-lg bg-muted p-2">
                              <span className="text-xs md:text-sm">{category.label}</span>
                              <span className={`text-xs md:text-sm ${category.color}`}>{category.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center text-muted-foreground">
                        <Scale className="h-8 w-8 md:h-12 md:w-12 mb-4" />
                        <p className="text-sm">Enter your measurements to calculate your BMI</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {history.length > 0 && (
                  <Card className="overflow-hidden">
                    <CardHeader className="p-4 md:p-6">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <History className="h-5 w-5" />
                        BMI History
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      <div className="h-[200px] w-full">
                        <Line data={chartData} options={chartOptions} />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
        {/* Blog Section */}
<section id="blog-section" className="py-12 bg-white dark:bg-black">
  <div className="container mx-auto max-w-5xl px-4">
    <div className="flex items-center justify-between mb-8">
      <div className="flex-1 text-center">
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mb-2">
          Health & Wellness Resource
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-transparent">
          BMI Calculator: Understand Your Body Metrics
        </h2>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground">
          Track your body mass index and learn what it means for your overall health
        </p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      <Card className="mb-10 overflow-hidden border-green-200 dark:border-green-900">
        <CardHeader className="bg-green-50 dark:bg-green-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-green-600 dark:text-green-400" />
            Understanding BMI
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                <strong>Body Mass Index (BMI)</strong> is a screening tool that uses your height and weight to estimate 
                your body fat percentage. It's a widely used measurement that helps healthcare professionals assess 
                potential health risks associated with weight.
              </p>
              <p className="mt-3">With a BMI calculator, you can:</p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <ActivitySquare className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Track your body composition over time</span>
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-teal-600 flex-shrink-0" />
                  <span>Identify if your weight falls within a healthy range</span>
                </li>
                <li className="flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Assess potential health risks related to your weight</span>
                </li>
                <li className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Set realistic weight management goals</span>
                </li>
              </ul>
              <p>
                Whether you're beginning a wellness journey, monitoring your health, or working with healthcare providers, 
                understanding your BMI provides valuable insights about your body composition and potential health risks.
              </p>
            </div>
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold text-green-800 dark:text-green-300 mb-3">
                  BMI Categories
                </h3>
                <div className="h-[200px] w-full">
                {isClient && (
                  <DynamicPie
                    data={{
                      labels: ["Underweight (<18.5)", "Normal (18.5-24.9)", "Overweight (25-29.9)", "Obese (>30)"],
                      datasets: [
                        {
                          data: [12, 45, 28, 15],
                          backgroundColor: [
                            "rgba(96, 165, 250, 0.8)",
                            "rgba(34, 197, 94, 0.8)",
                            "rgba(251, 146, 60, 0.8)",
                            "rgba(239, 68, 68, 0.8)",
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
                              size: 11,
                            },
                          },
                        },
                      },
                    }}
                  />
                )}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2 text-center">
                  BMI distribution in adult population (sample data)
                </p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Did You Know?</strong> BMI was developed by Belgian mathematician Adolphe Quetelet in the 1830s, 
                  but was not used as a measure of obesity until the 1970s.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <Weight className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-300">
                    Weight Tracking
                  </h3>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    Monitor changes in your body composition over time
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <HeartPulse className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                  <h3 className="mt-3 text-lg font-semibold text-teal-800 dark:text-teal-300">
                    Health Assessment
                  </h3>
                  <p className="mt-2 text-sm text-teal-700 dark:text-teal-400">
                    Identify potential health risks associated with your weight
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <Goal className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="mt-3 text-lg font-semibold text-blue-800 dark:text-blue-300">
                    Goal Setting
                  </h3>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    Establish realistic targets for your health journey
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="mb-10" id="bmi-basics">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Scale className="h-6 w-6 text-green-600" />
          BMI Calculator Fundamentals
        </h2>
        <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-6 rounded-xl mb-6 border border-green-100 dark:border-green-800">
          <h3 id="key-components" className="font-bold text-xl mb-4">
            Key Components of BMI
          </h3>
          <div className="grid gap-4 md:grid-cols-2 gap-y-6">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-green-600" />
                  Height Measurement
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="mb-3">
                  Height is a crucial component of the BMI calculation. It's typically measured in meters or inches and 
                  needs to be accurate for a reliable BMI result.
                </p>
                <div className="p-3 bg-green-50/50 dark:bg-green-900/20 rounded-lg text-sm">
                  <p className="font-medium text-green-700 dark:text-green-400 mb-2">Measurement Tips:</p>
                  <ul className="space-y-1">
                    <li>Measure without shoes</li>
                    <li>Stand straight against a wall</li>
                    <li>Keep heels together</li>
                    <li>Look straight ahead (not up or down)</li>
                  </ul>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p>
                    For the most accurate BMI calculation, measure your height in the morning as people tend to be slightly 
                    taller after lying down all night.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Weight className="h-5 w-5 text-green-600" />
                  Weight Measurement
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="mb-3">
                  Weight is measured in kilograms or pounds and should be taken under consistent conditions for reliable 
                  tracking over time.
                </p>
                <div className="p-3 bg-green-50/50 dark:bg-green-900/20 rounded-lg text-sm">
                  <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Best Practices:</h4>
                  <ul className="space-y-1">
                    <li>Weigh yourself in the morning</li>
                    <li>Use the same scale consistently</li>
                    <li>Weigh before eating or drinking</li>
                    <li>Wear minimal clothing</li>
                  </ul>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p>
                    Weight can fluctuate by 1-2 pounds daily due to hydration levels, food intake, and other factors. 
                    Focus on long-term trends rather than daily variations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 gap-y-6">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarRange className="h-5 w-5 text-green-600" />
                  Age Considerations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="mb-3">
                  BMI interpretation varies with age, especially for children and teenagers who are still growing and developing.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                  <div className="p-3 bg-green-50/50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium text-green-700 dark:text-green-400 mb-1">Adults</h4>
                    <ul className="space-y-1 text-xs">
                      <li>Standard BMI categories apply</li>
                      <li>Same ranges for all adult ages</li>
                      <li>Considerations for seniors</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-green-50/50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium text-green-700 dark:text-green-400 mb-1">Children & Teens</h4>
                    <ul className="space-y-1 text-xs">
                      <li>Uses percentile charts</li>
                      <li>Compared to others of same age/sex</li>
                      <li>Changes throughout development</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-green-600" />
                  BMI Limitations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="mb-3">
                  While useful, BMI has several limitations as it doesn't distinguish between muscle and fat mass or account for 
                  body composition differences.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-1" />
                    <span>
                      Doesn't factor in muscle mass (athletes may have "overweight" BMI despite healthy body composition)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-1" />
                    <span>
                      Doesn't account for fat distribution (abdominal fat carries more health risks)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-1" />
                    <span>
                      May not be appropriate for elderly, pregnant women, or very muscular individuals
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-1" />
                    <span>
                      Doesn't reflect ethnicities' different body compositions and health risks
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
              <strong>Important Note:</strong> While BMI is a useful screening tool, it should be one of several metrics used 
              to evaluate your health. Waist circumference, body fat percentage, blood pressure, cholesterol levels, and blood 
              sugar are also important indicators. Always consult healthcare professionals for a comprehensive health assessment.
            </p>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-4" id="bmi-formula">
          Understanding the BMI Formula
        </h3>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-lg mb-3">The Mathematics of BMI</h4>
                <p className="mb-3">
                  BMI is calculated by dividing a person's weight by the square of their height. The formula varies slightly 
                  depending on the units of measurement used.
                </p>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <h5 className="font-medium text-green-800 dark:text-green-300">BMI Formula:</h5>
                  <div className="mt-2 space-y-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded">
                      <p className="text-center font-medium">Metric System</p>
                      <p className="text-center italic">
                        BMI = weight (kg) / [height (m)]²
                      </p>
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-800 rounded">
                      <p className="text-center font-medium">Imperial System</p>
                      <p className="text-center italic">
                        BMI = [weight (lbs) / height² (in)] × 703
                      </p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm">
                  Understanding the formula helps you see why both height and weight influence your BMI, with height having 
                  an exponential impact due to being squared in the calculation.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-3">BMI Categories</h4>
                <div className="h-[250px] sm:h-[300px] w-full">
                  {isClient && (
                    <DynamicBar
                      data={{
                        labels: ["Underweight", "Normal", "Overweight", "Obese Class I", "Obese Class II", "Obese Class III"],
                        datasets: [
                          {
                            label: "BMI Range",
                            data: [18.5, 6.4, 5, 5, 5, 10],
                            backgroundColor: [
                              "rgba(96, 165, 250, 0.7)",
                              "rgba(34, 197, 94, 0.7)",
                              "rgba(251, 146, 60, 0.7)",
                              "rgba(239, 68, 68, 0.7)",
                              "rgba(220, 38, 38, 0.7)",
                              "rgba(185, 28, 28, 0.7)",
                            ],
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        indexAxis: "y",
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const ranges = ["< 18.5", "18.5-24.9", "25-29.9", "30-34.9", "35-39.9", "≥ 40"];
                                return `BMI: ${ranges[context.dataIndex]}`;
                              },
                            },
                          },
                        },
                        scales: {
                          x: {
                            stacked: true,
                            title: { 
                              display: true, 
                              text: "BMI Value",
                              font: { size: 12 }
                            },
                            ticks: {
                              font: { size: 12 }
                            }
                          },
                          y: { 
                            stacked: true,
                            ticks: {
                              font: { size: 12 }
                            }
                          },
                        },
                      }}
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Standard BMI classification ranges for adults
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-10" id="using-calculator">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-green-600" />
          Using the BMI Calculator Effectively
        </h2>
        <Card className="overflow-hidden border-teal-200 dark:border-teal-900 mb-6">
          <CardHeader className="bg-teal-50 dark:bg-teal-900/40">
            <CardTitle>Step-by-Step Guide</CardTitle>
            <CardDescription>How to get accurate results and interpret your BMI</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-bold text-teal-700 dark:text-teal-400 mb-4">
                  Basic BMI Calculation
                </h3>
                <ol className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-400 font-medium text-sm">
                      1
                    </span>
                    <div>
                      <p className="font-medium">Measure your height accurately</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Stand against a wall without shoes
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-400 font-medium text-sm">
                      2
                    </span>
                    <div>
                      <p className="font-medium">Weigh yourself consistently</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Use the same scale at the same time of day
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-400 font-medium text-sm">
                      3
                    </span>
                    <div>
                      <p className="font-medium">Enter your age and gender</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        For more accurate interpretation of results
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-400 font-medium text-sm">
                      4
                    </span>
                    <div>
                      <p className="font-medium">Calculate and review your BMI</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        See which category your result falls into
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-400 font-medium text-sm">
                      5
                    </span>
                    <div>
                      <p className="font-medium">Track changes over time</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Monitor trends rather than daily fluctuations
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-teal-700 dark:text-teal-400">Advanced Features</h3>
                <div className="grid gap-4">
                  <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-100 dark:border-teal-800">
                    <h4 className="font-medium text-teal-800 dark:text-teal-300 flex items-center gap-2">
                      <History className="h-4 w-4" />
                      BMI History Tracking
                    </h4>
                    <p className="mt-2 text-sm text-teal-700 dark:text-teal-400">
                      Log your BMI over time to visualize progress and identify patterns in your health journey.
                    </p>
                  </div>
                  <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-100 dark:border-teal-800">
                    <h4 className="font-medium text-teal-800 dark:text-teal-300 flex items-center gap-2">
                      <Goal className="h-4 w-4" />
                      Goal Setting
                    </h4>
                    <p className="mt-2 text-sm text-teal-700 dark:text-teal-400">
                      Set target BMI values and track your progress toward achieving your health objectives.
                    </p>
                  </div>
                  <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-100 dark:border-teal-800">
                    <h4 className="font-medium text-teal-800 dark:text-teal-300 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Family Profiles
                    </h4>
                    <p className="mt-2 text-sm text-teal-700 dark:text-teal-400">
                      Create separate profiles for family members to track everyone's health metrics in one place.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Separator className="my-6" />
            <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4">
              Interpreting Your Results
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                  <CardTitle className="text-base">Underweight</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm">
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">BMI &lt; 18.5</p>
                  </div>
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="font-medium mb-1">Potential concerns:</p>
                    <ul className="space-y-1 text-xs">
                      <li>Nutritional deficiencies</li>
                      <li>Weakened immune system</li>
                      <li>Bone loss</li>
                      <li>Anemia</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                  <CardTitle className="text-base">Normal Weight</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm">
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">BMI 18.5 - 24.9</p>
                  </div>
                  <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <p className="font-medium mb-1">Health benefits:</p>
                    <ul className="space-y-1 text-xs">
                      <li>Lower risk of heart disease</li>
                      <li>Better blood pressure levels</li>
                      <li>Reduced cancer risk</li>
                      <li>Better energy levels</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-amber-200 dark:border-amber-800">
                <CardHeader className="bg-amber-50 dark:bg-amber-900/30 py-3">
                  <CardTitle className="text-base">Overweight</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm">
                  <div className="text-center">
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">BMI 25 - 29.9</p>
                  </div>
                  <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                    <p className="font-medium mb-1">Increased risk of:</p>
                    <ul className="space-y-1 text-xs">
                      <li>High blood pressure</li>
                      <li>Type 2 diabetes</li>
                      <li>Heart disease</li>
                      <li>Sleep apnea</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader className="bg-red-50 dark:bg-red-900/30 py-3">
                  <CardTitle className="text-base">Obese</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm">
                  <div className="text-center">
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">BMI ≥ 30</p>
                  </div>
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    <p className="font-medium mb-1">High risk of:</p>
                    <ul className="space-y-1 text-xs">
                      <li>Cardiovascular disease</li>
                      <li>Stroke</li>
                      <li>Certain cancers</li>
                      <li>Osteoarthritis</li>
                      <li>Mental health issues</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-10" id="health-strategies">
        <Card className="overflow-hidden border-green-200 dark:border-green-900">
          <CardHeader className="bg-gradient-to-r from-green-100 to-teal-50 dark:from-green-900/40 dark:to-teal-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <HeartPulse className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">Healthy Weight Strategies</span>
              </div>
            </CardTitle>
            <CardDescription>Evidence-based approaches to achieve and maintain a healthy BMI</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Nutrition Guidelines
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Balanced Diet</h4>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      Focus on whole foods including fruits, vegetables, lean proteins, whole grains, and healthy fats. 
                      Limit processed foods, added sugars, and excessive salt.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Portion Control</h4>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      Be mindful of portion sizes, even with healthy foods. Use smaller plates, measure servings, and 
                      learn to recognize hunger and fullness cues.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Hydration</h4>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      Drink plenty of water throughout the day. Sometimes thirst is mistaken for hunger, and staying 
                      well-hydrated can help maintain proper metabolic function.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <ActivitySquare className="h-5 w-5" />
                  Physical Activity
                </h3>
                <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 mb-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Exercise Recommendations
                  </h4>
                  <div className="mt-3">
                    <div className="h-[200px] w-full">
                      {isClient && (
                        <DynamicBar
                          data={{
                            labels: ["Cardio", "Strength", "Flexibility", "Balance"],
                            datasets: [
                              {
                                label: "Minutes per Week (Minimum)",
                                data: [150, 60, 30, 15],
                                backgroundColor: "rgba(37, 99, 235, 0.7)",
                              },
                              {
                                label: "Minutes per Week (Optimal)",
                                data: [300, 120, 60, 30],
                                backgroundColor: "rgba(16, 185, 129, 0.7)",
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
                                  text: "Minutes per Week",
                                  font: { size: 12 }
                                },
                                ticks: { font: { size: 12 } }
                              },
                              x: { ticks: { font: { size: 12 } } }
                            },
                            plugins: {
                              legend: { labels: { font: { size: 12 } } }
                            }
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="mt-4 p-2 bg-white dark:bg-gray-800 rounded-md text-xs">
                    <p className="font-medium mb-1">Activity Types:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Cardio: walking, running, cycling, swimming</li>
                      <li>Strength: weight training, resistance exercises</li>
                      <li>Flexibility: yoga, stretching, Pilates</li>
                      <li>Balance: tai chi, stability exercises, yoga</li>
                    </ul>
                  </div>
                </div>
                <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <Footprints className="h-4 w-4" />
                    Daily Movement
                  </h4>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    Beyond structured exercise, increase everyday movement by taking the stairs, parking farther away, 
                    walking during phone calls, or using a standing desk.
                  </p>
                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-md text-xs">
                    <p className="font-medium mb-1">Daily Step Targets:</p>
                    <ul className="space-y-1">
                      <li>Sedentary: Less than 5,000 steps</li>
                      <li>Low active: 5,000 to 7,499 steps</li>
                      <li>Somewhat active: 7,500 to 9,999 steps</li>
                      <li>Active: 10,000 to 12,499 steps</li>
                      <li>Highly active: 12,500+ steps</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <Separator className="my-8" />
            <div>
              <h3 className="text-xl font-bold mb-4">BMI Management Approach by Category</h3>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="min-w-[600px] sm:min-w-full">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 text-left">
                          BMI Category
                        </th>
                        <th className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 text-left">
                          Primary Goal
                        </th>
                        <th className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 text-left">
                          Nutrition Strategy
                        </th>
                        <th className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 text-left">
                          Exercise Focus
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 font-medium">
                          Underweight
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                          Safe weight gain
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                          Nutrient-dense foods, healthy caloric surplus
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                          Strength training for muscle building
                        </td>
                      </tr>
                      <tr className="bg-gray-50 dark:bg-gray-800/50">
                        <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 font-medium">
                          Normal Weight
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                          Maintain weight
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                          Balanced diet, portion control
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                          Mix of cardio, strength, and flexibility
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 font-medium">
                          Overweight
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                          Gradual weight loss
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                          Moderate caloric deficit, focus on whole foods
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                          Regular cardio with strength training
                        </td>
                      </tr>
                      <tr className="bg-gray-50 dark:bg-gray-800/50">
                        <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2 font-medium">
                          Obese
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                          Medical supervision, sustained weight loss
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                          Structured meal plan, possibly medical nutrition therapy
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-2">
                          Low-impact activities, gradually increasing intensity
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

      <div className="mb-10" id="bmi-statistics">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          BMI Trends and Statistics
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-green-100 p-2 sm:p-3 dark:bg-green-900/60">
                  <Scale className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mt-2 sm:mt-4 text-base sm:text-lg font-semibold text-green-800 dark:text-green-300">
                  Average Adult BMI
                </h3>
                <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold text-green-600 dark:text-green-400">29.6</p>
                <p className="mt-1 text-xs sm:text-sm text-green-600 dark:text-green-500">U.S. average (2023)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-blue-100 p-2 sm:p-3 dark:bg-blue-900/60">
                  <Percent className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-2 sm:mt-4 text-base sm:text-lg font-semibold text-blue-800 dark:text-blue-300">
                  Obesity Rate
                </h3>
                <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">41.9%</p>
                <p className="mt-1 text-xs sm:text-sm text-blue-600 dark:text-blue-500">Of adults in U.S.</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-purple-100 p-2 sm:p-3 dark:bg-purple-900/60">
                  <Heart className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="mt-2 sm:mt-4 text-base sm:text-lg font-semibold text-purple-800 dark:text-purple-300">
                  Healthy BMI Range
                </h3>
                <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">18.5-24.9</p>
                <p className="mt-1 text-xs sm:text-sm text-purple-600 dark:text-purple-500">WHO recommendation</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-amber-100 p-2 sm:p-3 dark:bg-amber-900/60">
                  <Baby className="h-4 w-4 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="mt-2 sm:mt-4 text-base sm:text-lg font-semibold text-amber-800 dark:text-amber-300">
                  Child Obesity Rate
                </h3>
                <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">19.7%</p>
                <p className="mt-1 text-xs sm:text-sm text-amber-600 dark:text-amber-500">Ages 2-19 in U.S.</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-green-600" />
              BMI Trends Over Time
            </CardTitle>
            <CardDescription>U.S. average BMI from 1975-2025</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px] w-full">
              {isClient && (
                <DynamicLine
                  data={{
                    labels: ["1975", "1985", "1995", "2005", "2015", "2025"],
                    datasets: [
                      {
                        label: "Average Adult BMI",
                        data: [25.2, 26.5, 27.9, 28.7, 29.3, 29.6],
                        borderColor: "rgba(34, 197, 94, 0.8)",
                        backgroundColor: "rgba(34, 197, 94, 0.1)",
                        tension: 0.4,
                      },
                      {
                        label: "Healthy BMI Range Upper Limit",
                        data: [24.9, 24.9, 24.9, 24.9, 24.9, 24.9],
                        borderColor: "rgba(234, 88, 12, 0.8)",
                        borderDash: [5, 5],
                        backgroundColor: "transparent",
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
                          text: "BMI",
                          font: { size: 12 }
                        },
                        ticks: { font: { size: 12 } }
                      },
                      x: {
                        ticks: {
                          font: { size: 12 },
                          maxRotation: 45,
                          minRotation: 0 
                        }
                      }
                    },
                    plugins: {
                      legend: { labels: { font: { size: 12 } } }
                    }
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">Global Health Concern</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                The World Health Organization has declared obesity a global epidemic. Since 1975, worldwide obesity has 
                nearly tripled. Most of the world's population lives in countries where being overweight or obese causes 
                more deaths than being underweight. This trend highlights the importance of understanding and monitoring 
                BMI as part of overall health management.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div id="conclusion">
        <Card className="overflow-hidden border-green-200 dark:border-green-900">
          <CardHeader className="bg-gradient-to-r from-green-100 to-teal-50 dark:from-green-900/40 dark:to-teal-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-green-700 dark:text-green-400" />
              Making Informed Health Decisions
            </CardTitle>
            <CardDescription>Using BMI as part of your wellness journey</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              A <strong>BMI calculator</strong> is a valuable starting point for understanding your body composition and 
              potential health risks. While it has limitations, when used alongside other health metrics and in consultation 
              with healthcare professionals, BMI can help you track progress and make informed health decisions.
            </p>
            <p className="mt-4" id="key-takeaways">
              Remember these key principles when using BMI:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">BMI Best Practices</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">
                      Use BMI as one of several health indicators
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">
                      Consider your individual context and body composition
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">
                      Consult healthcare professionals for comprehensive assessment
                    </span>
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Beyond BMI</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">
                      Measure waist circumference for abdominal fat assessment
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">
                      Track fitness improvements and overall well-being
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">
                      Focus on sustainable lifestyle changes rather than numbers
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 sm:p-5 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg border border-green-100 dark:border-green-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Scale className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-base sm:text-lg text-green-800 dark:text-green-300 text-center sm:text-left">
                    Ready to monitor your health metrics?
                  </p>
                  <p className="mt-1 text-green-700 dark:text-green-400 text-center sm:text-left">
                    Use our <strong>BMI Calculator</strong> above to track your body mass index! For more
                    health and wellness tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/body-fat">
                        <Ruler className="h-4 w-4 mr-1" />
                        <span className="whitespace-nowrap">Body Fat Calculator</span>
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/calories">
                        <Utensils className="h-4 w-4 mr-1" />
                        <span className="whitespace-nowrap">Calorie Calculator</span>
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/ideal-weight">
                        <Weight className="h-4 w-4 mr-1" />
                        <span className="whitespace-nowrap">Ideal Weight Calculator</span>
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

function setIsClient(arg0: boolean) {
    throw new Error("Function not implemented.")
}
