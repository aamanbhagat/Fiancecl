"use client";

import React, { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SaveCalculationButton } from '@/components/save-calculation-button'
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
  Clipboard,
  Copy,
  Check,
  Info,
  ThermometerSnowflake,
  ThermometerSun,
  ArrowRightLeft,
  RefreshCw,
  Zap,
  Thermometer,
  AlertTriangle,
  ArrowRight,
  Brain,
  Calculator,
  CloudSun,
  FlaskConical,
  Globe,
  Lightbulb,
  Link,
  Ruler,
  Utensils,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import dynamic from 'next/dynamic';
import { Alert, AlertDescription } from "@/components/ui/alert";

// Chart.js imports
import {
  Chart,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Pie, Line } from "react-chartjs-2";

// Register Chart.js components
Chart.register(
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  ChartTooltip,
  Legend
);

// Dynamic imports
const DynamicLine = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Line),
  { ssr: false }
);

// Custom hook for client-side rendering check
function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
}

export default function TemperatureCalculator() {
  const isClient = useIsClient();
  
  // State variables
  const [fahrenheit, setFahrenheit] = useState<number>(68);
  const [celsius, setCelsius] = useState<number>(20);
  const [activeInput, setActiveInput] = useState<'fahrenheit' | 'celsius'>('fahrenheit');
  const [copied, setCopied] = useState<boolean>(false);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Theme detection
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

  // Scroll handler
  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClient]);

  // Conversion functions
  const convertToCelsius = (f: number): number => {
    return (f - 32) * 5/9;
  };

  const convertToFahrenheit = (c: number): number => {
    return (c * 9/5) + 32;
  };

  // Handle value changes
  const handleFahrenheitChange = (value: number) => {
    setFahrenheit(value);
    setCelsius(Number(convertToCelsius(value).toFixed(2)));
    setActiveInput('fahrenheit');
  };

  const handleCelsiusChange = (value: number) => {
    setCelsius(value);
    setFahrenheit(Number(convertToFahrenheit(value).toFixed(2)));
    setActiveInput('celsius');
  };

  // Temperature category
  const getTemperatureCategory = (temp: number, scale: 'fahrenheit' | 'celsius'): string => {
    const tempF = scale === 'fahrenheit' ? temp : convertToFahrenheit(temp);
    
    if (tempF < 32) return "Freezing";
    if (tempF < 50) return "Cold";
    if (tempF < 68) return "Cool";
    if (tempF < 77) return "Mild";
    if (tempF < 86) return "Warm";
    if (tempF < 95) return "Hot";
    return "Very Hot";
  };

  // Temperature color based on value
  const getTemperatureColor = (temp: number, scale: 'fahrenheit' | 'celsius'): string => {
    const tempF = scale === 'fahrenheit' ? temp : convertToFahrenheit(temp);
    
    if (tempF < 32) return "bg-blue-600";
    if (tempF < 50) return "bg-blue-400";
    if (tempF < 68) return "bg-green-400";
    if (tempF < 77) return "bg-yellow-300";
    if (tempF < 86) return "bg-orange-400";
    if (tempF < 95) return "bg-orange-600";
    return "bg-red-600";
  };

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (!isClient) return;
    
    const result = `${fahrenheit}°F = ${celsius}°C`;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Scroll to top
  const scrollToTop = () => {
    if (!isClient) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Chart data for temperature comparison
  const tempComparisonData = {
    labels: ['Freezing Water', 'Room Temperature', 'Body Temperature', 'Hot Day', 'Boiling Water'],
    datasets: [
      {
        label: 'Fahrenheit (°F)',
        data: [32, 68, 98.6, 95, 212],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
      {
        label: 'Celsius (°C)',
        data: [0, 20, 37, 35, 100],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDarkMode ? 'white' : 'black',
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" },
        ticks: {
          color: isDarkMode ? "white" : "black",
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: isDarkMode ? "white" : "black" },
      }
    }
  };

  // Common temperature reference points
  const referencePoints = [
    { name: "Absolute Zero", fahrenheit: -459.67, celsius: -273.15 },
    { name: "Freezing Point of Water", fahrenheit: 32, celsius: 0 },
    { name: "Room Temperature", fahrenheit: 68, celsius: 20 },
    { name: "Normal Body Temperature", fahrenheit: 98.6, celsius: 37 },
    { name: "Boiling Point of Water", fahrenheit: 212, celsius: 100 },
  ];

  // NoteBox component for reuse
  const NoteBox = ({ type, children }: { type: "info" | "warning" | "tip"; children: React.ReactNode }) => {
    const styles = {
      info: { bg: "bg-blue-500/10 dark:bg-blue-500/20", border: "border-blue-500/50", icon: <Info className="h-5 w-5 text-blue-500" />, title: "Information" },
      warning: { bg: "bg-yellow-500/10 dark:bg-yellow-500/20", border: "border-yellow-500/50", icon: <Info className="h-5 w-5 text-yellow-500" />, title: "Warning" },
      tip: { bg: "bg-green-500/10 dark:bg-green-500/20", border: "border-green-500/50", icon: <Zap className="h-5 w-5 text-green-500" />, title: "Pro Tip" },
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

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
          <div className="container relative z-10 max-w-screen-xl">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
                <span className="bg-gradient-to-r from-blue-600 to-red-500 bg-clip-text text-transparent inline-block">
                  Temperature Converter
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
                Convert between Fahrenheit (°F) and Celsius (°C) with this interactive temperature calculator.
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
                    <CardTitle>Temperature Converter</CardTitle>
                    <CardDescription>
                      Enter a value in either Fahrenheit or Celsius to see the converted result instantly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        {/* Fahrenheit Input */}
                        <div className="space-y-2">
                          <Label htmlFor="fahrenheit" className="flex items-center justify-between">
                            <span>Fahrenheit (°F)</span>
                            <ThermometerSun className="h-4 w-4 text-red-500" />
                          </Label>
                          <Input
                            id="fahrenheit"
                            type="number"
                            value={fahrenheit}
                            onChange={(e) => handleFahrenheitChange(Number(e.target.value))}
                            className={activeInput === 'fahrenheit' ? "ring-2 ring-primary/50" : ""}
                          />
                          <div className="pt-2">
                            <p className="text-sm text-muted-foreground mb-1">Adjust with slider:</p>
                            <Slider
                              min={-76}
                              max={212}
                              step={1}
                              value={[fahrenheit]}
                              onValueChange={(value) => handleFahrenheitChange(value[0])}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>-76°F</span>
                              <span>32°F</span>
                              <span>68°F</span>
                              <span>212°F</span>
                            </div>
                          </div>
                        </div>

                        {/* Celsius Input */}
                        <div className="space-y-2">
                          <Label htmlFor="celsius" className="flex items-center justify-between">
                            <span>Celsius (°C)</span>
                            <ThermometerSnowflake className="h-4 w-4 text-blue-500" />
                          </Label>
                          <Input
                            id="celsius"
                            type="number"
                            value={celsius}
                            onChange={(e) => handleCelsiusChange(Number(e.target.value))}
                            className={activeInput === 'celsius' ? "ring-2 ring-primary/50" : ""}
                          />
                          <div className="pt-2">
                            <p className="text-sm text-muted-foreground mb-1">Adjust with slider:</p>
                            <Slider
                              min={-60}
                              max={100}
                              step={1}
                              value={[celsius]}
                              onValueChange={(value) => handleCelsiusChange(value[0])}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>-60°C</span>
                              <span>0°C</span>
                              <span>20°C</span>
                              <span>100°C</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center my-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-2"
                          onClick={() => {
                            const temp = fahrenheit;
                            setFahrenheit(Number(convertToFahrenheit(celsius).toFixed(2)));
                            setCelsius(Number(convertToCelsius(temp).toFixed(2)));
                          }}
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                          <span>Swap Values</span>
                        </Button>
                      </div>
                    </div>

                    {/* Formula Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Conversion Formulas</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Card className="bg-muted/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Fahrenheit to Celsius</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="p-3 bg-primary/10 rounded-md text-center">
                              <code className="text-sm sm:text-base font-mono">
                                °C = (°F - 32) × 5/9
                              </code>
                            </div>
                            <p className="text-sm mt-2">
                              Subtract 32 from the Fahrenheit temperature, then multiply by 5/9
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-muted/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Celsius to Fahrenheit</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="p-3 bg-primary/10 rounded-md text-center">
                              <code className="text-sm sm:text-base font-mono">
                                °F = (°C × 9/5) + 32
                              </code>
                            </div>
                            <p className="text-sm mt-2">
                              Multiply the Celsius temperature by 9/5, then add 32
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results Section */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Conversion Result</CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={copyToClipboard}>
                              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy result</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="text-4xl font-bold text-blue-500">
                          {fahrenheit}°F
                        </div>
                        <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
                        <div className="text-4xl font-bold text-red-500">
                          {celsius}°C
                        </div>
                      </div>
                      <p className="text-lg font-medium">
                        Temperature Category: 
                        <span className="ml-2 px-2 py-1 rounded text-white font-medium text-sm inline-block"
                          style={{
                            backgroundColor: activeInput === 'fahrenheit' 
                              ? getTemperatureColor(fahrenheit, 'fahrenheit')
                              : getTemperatureColor(celsius, 'celsius')
                          }}
                        >
                          {activeInput === 'fahrenheit' 
                            ? getTemperatureCategory(fahrenheit, 'fahrenheit')
                            : getTemperatureCategory(celsius, 'celsius')
                          }
                        </span>
                      </p>
                    </div>

                    <Separator />

                    <Tabs defaultValue="visual" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="visual">Visual</TabsTrigger>
                        <TabsTrigger value="reference">Reference Points</TabsTrigger>
                      </TabsList>
                      <TabsContent value="visual" className="space-y-4 pt-4">
                        <div className="flex justify-center">
                          <div className="relative w-20 h-64 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            {/* Thermometer liquid */}
                            <div 
                              className={`absolute bottom-0 w-full transition-all duration-500 ${
                                activeInput === 'fahrenheit' 
                                  ? getTemperatureColor(fahrenheit, 'fahrenheit')
                                  : getTemperatureColor(celsius, 'celsius')
                              }`}
                              style={{
                                height: `${
                                  activeInput === 'fahrenheit' 
                                    ? Math.min(100, Math.max(0, ((fahrenheit + 76) / (212 + 76)) * 100))
                                    : Math.min(100, Math.max(0, ((celsius + 60) / (100 + 60)) * 100))
                                }%`
                              }}
                            ></div>
                            {/* Thermometer bulb */}
                            <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full ${
                              activeInput === 'fahrenheit' 
                                ? getTemperatureColor(fahrenheit, 'fahrenheit')
                                : getTemperatureColor(celsius, 'celsius')
                            }`}></div>
                            {/* Temperature marks */}
                            <div className="absolute inset-0 flex flex-col justify-between py-4">
                              <div className="w-6 h-1 bg-gray-400 ml-4"></div>
                              <div className="w-4 h-1 bg-gray-400 ml-4"></div>
                              <div className="w-6 h-1 bg-gray-400 ml-4"></div>
                              <div className="w-4 h-1 bg-gray-400 ml-4"></div>
                              <div className="w-6 h-1 bg-gray-400 ml-4"></div>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Visual representation of current temperature
                          </p>
                        </div>
                      </TabsContent>
                      <TabsContent value="reference" className="space-y-4 pt-4">
                        <div className="space-y-2">
                          {referencePoints.map((point, index) => (
                            <div 
                              key={index} 
                              className={`flex justify-between items-center p-2 rounded-lg ${
                                (activeInput === 'fahrenheit' && Math.abs(fahrenheit - point.fahrenheit) < 5) ||
                                (activeInput === 'celsius' && Math.abs(celsius - point.celsius) < 3)
                                  ? 'bg-primary/20 font-medium'
                                  : 'bg-muted/50'
                              }`}
                            >
                              <span className="text-sm">{point.name}</span>
                              <div className="text-right">
                                <span className="text-sm text-blue-500 font-mono">{point.fahrenheit}°F</span>
                                <span className="text-sm text-muted-foreground mx-1">/</span>
                                <span className="text-sm text-red-500 font-mono">{point.celsius}°C</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Temperature facts card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Did You Know?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      The Celsius scale was originally defined by Swedish astronomer Anders Celsius in 1742, 
                      placing 0° at the boiling point and 100° at the freezing point of water. After his death, 
                      the scale was reversed to its current form.
                    </p>
                    <Separator className="my-3" />
                    <p className="text-sm">
                      At -40°, both Fahrenheit and Celsius scales show the same value. This is the only point 
                      where the two scales intersect!
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Temperature Comparison Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto max-w-[1200px] px-4 sm:px-6 md:px-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold">Temperature Scale Comparison</h2>
              <p className="mt-2 text-muted-foreground">
                See how Fahrenheit and Celsius scales compare at common temperature points
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Common Temperature Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full">
                    {isClient && (
                      <DynamicLine 
                        data={tempComparisonData} 
                        options={chartOptions} 
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Temperature Facts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <NoteBox type="info">
                    <p>
                      The Fahrenheit scale was developed by Daniel Gabriel Fahrenheit in 1724. He 
                      initially set 0°F as the freezing point of a specific salt and water mixture, and 96°F
                      as the human body temperature (though modern measurements place average body 
                      temperature at 98.6°F).
                    </p>
                  </NoteBox>

                  <NoteBox type="warning">
                    <p>
                      While most countries use Celsius for everyday temperature measurement, the United States 
                      still primarily uses Fahrenheit. Scientists worldwide use the Celsius scale or Kelvin 
                      (which starts at absolute zero: -273.15°C or -459.67°F).
                    </p>
                  </NoteBox>

                  <NoteBox type="tip">
                    <p>
                      Need a quick approximation? To roughly convert Celsius to Fahrenheit in your head, 
                      double the Celsius value and add 30 (for precise results, multiply by 9/5 and add 32).
                    </p>
                  </NoteBox>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="blog-section" className="py-12 bg-white dark:bg-black">
  <div className="container mx-auto max-w-5xl px-4">
    <div className="flex items-center justify-between mb-8">
      <div className="flex-1 text-center">
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Temperature Simplified</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">The Complete Guide to Temperature Conversions</h2>
        <p className="mt-3 text-muted-foreground text-lg">Learn how to convert temperatures accurately and apply this knowledge in everyday life</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Thermometer className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Temperature Scales
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                <strong>Temperature</strong> is a fundamental part of our daily lives, from checking the weather to cooking a meal. However, different regions and fields use different scales to measure it. The three most common scales are <strong>Celsius (°C)</strong>, <strong>Fahrenheit (°F)</strong>, and <strong>Kelvin (K)</strong>. Each scale has unique characteristics and applications:
              </p>
              <ul className="mt-3 space-y-2">
                <li><strong>Celsius (°C)</strong>: Used globally, especially in science. Based on water's freezing (0°C) and boiling (100°C) points.</li>
                <li><strong>Fahrenheit (°F)</strong>: Common in the U.S. Water freezes at 32°F and boils at 212°F.</li>
                <li><strong>Kelvin (K)</strong>: The scientific standard, starting at absolute zero (-273.15°C), with no negative values.</li>
              </ul>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Did You Know?</h4>
                <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                  The Fahrenheit scale was originally based on the freezing point of brine, while Celsius was designed to be more straightforward with water's properties.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Temperature Scale Usage Worldwide</h3>
                <div className="h-[200px]">
                  <Pie 
                    data={{
                      labels: ['Celsius', 'Fahrenheit', 'Kelvin'],
                      datasets: [{
                        data: [80, 15, 5],
                        backgroundColor: ['rgba(99, 102, 241, 0.8)', 'rgba(14, 165, 233, 0.8)', 'rgba(16, 185, 129, 0.8)'],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' },
                        datalabels: { color: '#fff', formatter: (value) => value + '%' }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">Approximate global usage of temperature scales</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Formulas Section */}
      <div className="mb-10" id="conversion-formulas">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Essential Conversion Formulas
        </h2>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-blue-600" />
              Converting Between Scales
            </CardTitle>
            <CardDescription>Master the key formulas for accurate conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-4">
                  Temperature conversions are straightforward once you know the formulas. Here are the most common conversions:
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Key Formulas</h4>
                  <ul className="mt-2 space-y-2 text-sm text-blue-700 dark:text-blue-400">
                    <li><strong>Celsius to Fahrenheit</strong>: \( F = (C \times 1.8) + 32 \)</li>
                    <li><strong>Fahrenheit to Celsius</strong>: \( C = (F - 32) / 1.8 \)</li>
                    <li><strong>Celsius to Kelvin</strong>: \( K = C + 273.15 \)</li>
                    <li><strong>Kelvin to Celsius</strong>: \( C = K - 273.15 \)</li>
                    <li><strong>Fahrenheit to Kelvin</strong>: \( K = (F - 32) / 1.8 + 273.15 \)</li>
                    <li><strong>Kelvin to Fahrenheit</strong>: \( F = (K - 273.15) \times 1.8 + 32 \)</li>
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      <strong>Pro Tip:</strong> For quick Celsius to Fahrenheit conversions, double the Celsius temperature and add 30. It's not exact but useful for estimates (e.g., 20°C ≈ 70°F).
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-3">Conversion Examples</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p><strong>25°C to Fahrenheit</strong>: \( F = (25 \times 1.8) + 32 = 45 + 32 = 77°F \)</p>
                    </div>
                    <div>
                      <p><strong>98.6°F to Celsius</strong>: \( C = (98.6 - 32) / 1.8 = 66.6 / 1.8 ≈ 37°C \)</p>
                    </div>
                    <div>
                      <p><strong>300 K to Celsius</strong>: \( C = 300 - 273.15 = 26.85°C \)</p>
                    </div>
                  </div>
                </div>
                
                <div className="h-[180px]">
                  <p className="text-center text-sm font-medium mb-2">Celsius to Fahrenheit Comparison</p>
                  <Line 
                    data={{
                      labels: ['-40', '0', '20', '37', '100'],
                      datasets: [
                        {
                          label: 'Celsius',
                          data: [-40, 0, 20, 37, 100],
                          borderColor: 'rgba(99, 102, 241, 1)',
                          backgroundColor: 'rgba(99, 102, 241, 0.2)',
                          fill: true,
                        },
                        {
                          label: 'Fahrenheit',
                          data: [-40, 32, 68, 98.6, 212],
                          borderColor: 'rgba(14, 165, 233, 1)',
                          backgroundColor: 'rgba(14, 165, 233, 0.2)',
                          fill: true,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: { title: { display: true, text: 'Temperature (°C)' } },
                        y: { title: { display: true, text: 'Temperature (°F)' } }
                      },
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Practical Applications Section */}
      <div className="mb-10" id="practical-applications">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">Real-World Applications</span>
              </div>
            </CardTitle>
            <CardDescription>Where temperature conversions matter</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Cooking
                </h4>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Convert oven temperatures between Celsius and Fahrenheit for recipes from different countries. For example, 180°C (UK) = 356°F (US).
                </p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                  <CloudSun className="h-5 w-5" />
                  Weather
                </h4>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Understand international weather reports. A forecast of 25°C in Europe is 77°F in the U.S.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  Science
                </h4>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Convert temperatures for experiments. For instance, room temperature (25°C) is 298.15 K in scientific contexts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips and Tricks Section */}
      <div className="mb-10" id="tips-tricks">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-yellow-600" />
          Tips and Tricks for Temperature Conversion
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-yellow-600" />
                Mental Math Shortcuts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  <strong>Celsius to Fahrenheit</strong>: Double the Celsius temperature and add 30. Example: 20°C ≈ 70°F (actual 68°F).
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  <strong>Fahrenheit to Celsius</strong>: Subtract 30 and halve the result. Example: 70°F ≈ 20°C (actual 21.1°C).
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Common Mistakes to Avoid
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400">
                  <strong>Mixing up formulas</strong>: Remember to add/subtract 32 for Fahrenheit conversions.
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400">
                  <strong>Forgetting Kelvin's offset</strong>: Always add/subtract 273.15 when converting to/from Kelvin.
                </p>
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
              <Check className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Mastering Temperature Conversions
            </CardTitle>
            <CardDescription>Apply your knowledge with confidence</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Temperature conversion</strong> is a practical skill that bridges gaps between different measurement systems. Whether you're cooking, traveling, or studying, knowing how to switch between Celsius, Fahrenheit, and Kelvin can make your life easier. Use our <strong>Temperature Converter</strong> tool to practice and perfect your conversions. With these skills, you'll be ready to tackle any temperature-related challenge!
            </p>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to convert temperatures?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Try our <strong>Temperature Converter</strong> above! For more tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/unit-converter">
                        <Ruler className="h-4 w-4 mr-1" />
                        Unit Converter
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/weather">
                        <CloudSun className="h-4 w-4 mr-1" />
                        Weather Tools
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
        
        <SaveCalculationButton calculatorType="temperature" inputs={{}} results={{}} />
      </main>

      <SiteFooter />
      
      {/* Back to top button */}
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