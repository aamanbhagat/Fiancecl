"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, Clock, Calendar, Globe, ShoppingCart, PiggyBank, CalendarClock, BookOpen, AlertTriangle, Scale, Shield, LightbulbIcon, AreaChart, ArrowUpCircle, CalendarDays, ArrowUpDown, CheckCircle, ArrowRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import InflationSchema from './schema';

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

// Extended historical inflation data for all currencies (placeholder data for 1924-2024)
const historicalInflation: Record<string, Record<number, number>> = {
  "USD": { 1924: 2.5, 1925: 2.3, /* ... */ 2015: 0.12, 2016: 1.26, 2017: 2.13, 2018: 2.44, 2019: 1.81, 2020: 1.23, 2021: 4.70, 2022: 8.00, 2023: 3.4, 2024: 2.5 },
  "EUR": { 1924: 3.0, 1925: 2.8, /* ... */ 2015: 0.00, 2016: 0.20, 2017: 1.50, 2018: 1.80, 2019: 1.20, 2020: 0.30, 2021: 2.60, 2022: 8.40, 2023: 5.3, 2024: 2.9 },
  "GBP": { 1924: 1.8, 1925: 1.5, /* ... */ 2015: 0.00, 2016: 0.70, 2017: 2.70, 2018: 2.50, 2019: 1.80, 2020: 0.90, 2021: 2.60, 2022: 9.10, 2023: 6.7, 2024: 3.2 },
  "JPY": { 1924: 1.2, 1925: 1.0, /* ... */ 2023: 0.5, 2024: 0.3 },
  "CAD": { 1924: 2.0, 1925: 1.8, /* ... */ 2023: 3.0, 2024: 2.8 },
  "AUD": { 1924: 2.2, 1925: 2.0, /* ... */ 2023: 3.5, 2024: 3.0 },
  "CHF": { 1924: 1.5, 1925: 1.3, /* ... */ 2023: 0.8, 2024: 0.6 },
  "CNY": { 1924: 3.5, 1925: 3.2, /* ... */ 2023: 2.0, 2024: 1.8 },
  "AED": { 1924: 2.0, 1925: 2.1, /* ... */ 2023: 1.5, 2024: 1.4 },
  "AFN": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 6.0, 2024: 5.8 },
  "ALL": { 1924: 3.2, 1925: 3.0, /* ... */ 2023: 4.5, 2024: 4.3 },
  "AMD": { 1924: 3.8, 1925: 3.7, /* ... */ 2023: 5.0, 2024: 4.9 },
  "ANG": { 1924: 2.1, 1925: 2.0, /* ... */ 2023: 2.2, 2024: 2.1 },
  "AOA": { 1924: 5.0, 1925: 5.2, /* ... */ 2023: 8.0, 2024: 7.8 },
  "ARS": { 1924: 4.5, 1925: 4.7, /* ... */ 2023: 50.0, 2024: 45.0 },
  "AWG": { 1924: 2.0, 1925: 1.9, /* ... */ 2023: 2.3, 2024: 2.2 },
  "AZN": { 1924: 3.5, 1925: 3.4, /* ... */ 2023: 4.0, 2024: 3.9 },
  "BAM": { 1924: 2.8, 1925: 2.7, /* ... */ 2023: 3.2, 2024: 3.1 },
  "BBD": { 1924: 2.2, 1925: 2.1, /* ... */ 2023: 2.5, 2024: 2.4 },
  "BDT": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 5.5, 2024: 5.4 },
  "BGN": { 1924: 2.7, 1925: 2.6, /* ... */ 2023: 3.0, 2024: 2.9 },
  "BHD": { 1924: 1.8, 1925: 1.7, /* ... */ 2023: 1.9, 2024: 1.8 },
  "BIF": { 1924: 4.0, 1925: 4.1, /* ... */ 2023: 7.0, 2024: 6.8 },
  "BMD": { 1924: 2.5, 1925: 2.3, /* ... */ 2023: 3.4, 2024: 2.5 },
  "BND": { 1924: 1.9, 1925: 1.8, /* ... */ 2023: 2.0, 2024: 1.9 },
  "BOB": { 1924: 3.5, 1925: 3.6, /* ... */ 2023: 4.5, 2024: 4.4 },
  "BRL": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 5.0, 2024: 4.8 },
  "BSD": { 1924: 2.3, 1925: 2.2, /* ... */ 2023: 2.6, 2024: 2.5 },
  "BTN": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 5.5, 2024: 5.3 },
  "BWP": { 1924: 2.8, 1925: 2.7, /* ... */ 2023: 3.5, 2024: 3.4 },
  "BYN": { 1924: 5.0, 1925: 5.2, /* ... */ 2023: 10.0, 2024: 9.5 },
  "BZD": { 1924: 2.2, 1925: 2.1, /* ... */ 2023: 2.4, 2024: 2.3 },
  "CDF": { 1924: 6.0, 1925: 6.2, /* ... */ 2023: 15.0, 2024: 14.5 },
  "CLP": { 1924: 3.8, 1925: 3.9, /* ... */ 2023: 4.5, 2024: 4.3 },
  "COP": { 1924: 4.0, 1925: 4.1, /* ... */ 2023: 5.0, 2024: 4.8 },
  "CRC": { 1924: 3.2, 1925: 3.3, /* ... */ 2023: 3.8, 2024: 3.7 },
  "CUC": { 1924: 2.5, 1925: 2.3, /* ... */ 2023: 3.4, 2024: 2.5 },
  "CUP": { 1924: 4.5, 1925: 4.7, /* ... */ 2023: 6.0, 2024: 5.8 },
  "CVE": { 1924: 2.8, 1925: 2.7, /* ... */ 2023: 3.2, 2024: 3.1 },
  "CZK": { 1924: 2.6, 1925: 2.5, /* ... */ 2023: 3.0, 2024: 2.9 },
  "DJF": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 3.5, 2024: 3.4 },
  "DKK": { 1924: 2.4, 1925: 2.3, /* ... */ 2023: 2.8, 2024: 2.7 },
  "DOP": { 1924: 3.5, 1925: 3.6, /* ... */ 2023: 4.0, 2024: 3.9 },
  "DZD": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 5.0, 2024: 4.8 },
  "EGP": { 1924: 3.8, 1925: 3.9, /* ... */ 2023: 15.0, 2024: 14.0 },
  "ERN": { 1924: 4.5, 1925: 4.7, /* ... */ 2023: 6.0, 2024: 5.8 },
  "ETB": { 1924: 4.0, 1925: 4.1, /* ... */ 2023: 10.0, 2024: 9.5 },
  "FJD": { 1924: 2.2, 1925: 2.1, /* ... */ 2023: 2.5, 2024: 2.4 },
  "FKP": { 1924: 1.8, 1925: 1.7, /* ... */ 2023: 6.7, 2024: 3.2 },
  "FOK": { 1924: 2.4, 1925: 2.3, /* ... */ 2023: 2.8, 2024: 2.7 },
  "GEL": { 1924: 3.5, 1925: 3.4, /* ... */ 2023: 4.0, 2024: 3.9 },
  "GGP": { 1924: 1.8, 1925: 1.7, /* ... */ 2023: 6.7, 2024: 3.2 },
  "GHS": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 10.0, 2024: 9.5 },
  "GIP": { 1924: 1.8, 1925: 1.7, /* ... */ 2023: 6.7, 2024: 3.2 },
  "GMD": { 1924: 4.5, 1925: 4.7, /* ... */ 2023: 7.0, 2024: 6.8 },
  "GNF": { 1924: 5.0, 1925: 5.2, /* ... */ 2023: 8.0, 2024: 7.8 },
  "GTQ": { 1924: 3.2, 1925: 3.3, /* ... */ 2023: 3.8, 2024: 3.7 },
  "GYD": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 3.5, 2024: 3.4 },
  "HKD": { 1924: 1.5, 1925: 1.4, /* ... */ 2023: 2.0, 2024: 1.9 },
  "HNL": { 1924: 3.5, 1925: 3.6, /* ... */ 2023: 4.0, 2024: 3.9 },
  "HRK": { 1924: 2.8, 1925: 2.7, /* ... */ 2023: 3.2, 2024: 3.1 },
  "HTG": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 20.0, 2024: 18.0 },
  "HUF": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 5.0, 2024: 4.8 },
  "IDR": { 1924: 3.5, 1925: 3.6, /* ... */ 2023: 4.0, 2024: 3.9 },
  "ILS": { 1924: 2.5, 1925: 2.4, /* ... */ 2023: 3.0, 2024: 2.9 },
  "IMP": { 1924: 1.8, 1925: 1.7, /* ... */ 2023: 6.7, 2024: 3.2 },
  "INR": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 5.5, 2024: 5.3 },
  "IQD": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 6.0, 2024: 5.8 },
  "IRR": { 1924: 5.0, 1925: 5.2, /* ... */ 2023: 40.0, 2024: 38.0 },
  "ISK": { 1924: 2.8, 1925: 2.7, /* ... */ 2023: 3.5, 2024: 3.4 },
  "JEP": { 1924: 1.8, 1925: 1.7, /* ... */ 2023: 6.7, 2024: 3.2 },
  "JMD": { 1924: 3.5, 1925: 3.6, /* ... */ 2023: 4.5, 2024: 4.4 },
  "JOD": { 1924: 2.0, 1925: 1.9, /* ... */ 2023: 2.2, 2024: 2.1 },
  "KES": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 6.0, 2024: 5.8 },
  "KGS": { 1924: 3.5, 1925: 3.4, /* ... */ 2023: 4.0, 2024: 3.9 },
  "KHR": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 3.5, 2024: 3.4 },
  "KID": { 1924: 2.2, 1925: 2.1, /* ... */ 2023: 3.5, 2024: 3.0 },
  "KMF": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 3.5, 2024: 3.4 },
  "KPW": { 1924: 5.0, 1925: 5.2, /* ... */ 2023: 8.0, 2024: 7.8 },
  "KRW": { 1924: 2.0, 1925: 1.9, /* ... */ 2023: 2.5, 2024: 2.4 },
  "KWD": { 1924: 1.5, 1925: 1.4, /* ... */ 2023: 1.8, 2024: 1.7 },
  "KYD": { 1924: 2.3, 1925: 2.2, /* ... */ 2023: 2.6, 2024: 2.5 },
  "KZT": { 1924: 3.5, 1925: 3.4, /* ... */ 2023: 4.0, 2024: 3.9 },
  "LAK": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 20.0, 2024: 18.0 },
  "LBP": { 1924: 5.0, 1925: 5.2, /* ... */ 2023: 100.0, 2024: 95.0 },
  "LKR": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 6.0, 2024: 5.8 },
  "LRD": { 1924: 4.5, 1925: 4.7, /* ... */ 2023: 7.0, 2024: 6.8 },
  "LSL": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 4.0, 2024: 3.9 },
  "LYD": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 5.0, 2024: 4.8 },
  "MAD": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 3.5, 2024: 3.4 },
  "MDL": { 1924: 3.5, 1925: 3.4, /* ... */ 2023: 4.0, 2024: 3.9 },
  "MGA": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 6.0, 2024: 5.8 },
  "MKD": { 1924: 2.8, 1925: 2.7, /* ... */ 2023: 3.2, 2024: 3.1 },
  "MMK": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 10.0, 2024: 9.5 },
  "MNT": { 1924: 3.5, 1925: 3.4, /* ... */ 2023: 4.5, 2024: 4.4 },
  "MOP": { 1924: 1.5, 1925: 1.4, /* ... */ 2023: 2.0, 2024: 1.9 },
  "MRU": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 6.0, 2024: 5.8 },
  "MUR": { 1924: 2.5, 1925: 2.4, /* ... */ 2023: 3.0, 2024: 2.9 },
  "MVR": { 1924: 2.0, 1925: 1.9, /* ... */ 2023: 2.2, 2024: 2.1 },
  "MWK": { 1924: 4.5, 1925: 4.7, /* ... */ 2023: 10.0, 2024: 9.5 },
  "MXN": { 1924: 3.5, 1925: 3.6, /* ... */ 2023: 4.5, 2024: 4.4 },
  "MYR": { 1924: 2.0, 1925: 1.9, /* ... */ 2023: 2.5, 2024: 2.4 },
  "MZN": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 6.0, 2024: 5.8 },
  "NAD": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 4.0, 2024: 3.9 },
  "NGN": { 1924: 4.5, 1925: 4.7, /* ... */ 2023: 20.0, 2024: 18.0 },
  "NIO": { 1924: 3.5, 1925: 3.6, /* ... */ 2023: 4.5, 2024: 4.4 },
  "NOK": { 1924: 2.5, 1925: 2.4, /* ... */ 2023: 3.0, 2024: 2.9 },
  "NPR": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 5.5, 2024: 5.3 },
  "NZD": { 1924: 2.2, 1925: 2.1, /* ... */ 2023: 3.5, 2024: 3.0 },
  "OMR": { 1924: 1.5, 1925: 1.4, /* ... */ 2023: 1.8, 2024: 1.7 },
  "PAB": { 1924: 2.3, 1925: 2.2, /* ... */ 2023: 2.6, 2024: 2.5 },
  "PEN": { 1924: 3.5, 1925: 3.6, /* ... */ 2023: 4.0, 2024: 3.9 },
  "PGK": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 3.5, 2024: 3.4 },
  "PHP": { 1924: 2.5, 1925: 2.4, /* ... */ 2023: 3.0, 2024: 2.9 },
  "PKR": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 10.0, 2024: 9.5 },
  "PLN": { 1924: 2.8, 1925: 2.7, /* ... */ 2023: 3.5, 2024: 3.4 },
  "PYG": { 1924: 3.5, 1925: 3.6, /* ... */ 2023: 4.0, 2024: 3.9 },
  "QAR": { 1924: 1.8, 1925: 1.7, /* ... */ 2023: 2.0, 2024: 1.9 },
  "RON": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 4.0, 2024: 3.9 },
  "RSD": { 1924: 2.8, 1925: 2.7, /* ... */ 2023: 3.5, 2024: 3.4 },
  "RUB": { 1924: 5.0, 1925: 5.2, /* ... */ 2023: 6.0, 2024: 5.8 },
  "RWF": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 6.0, 2024: 5.8 },
  "SAR": { 1924: 1.8, 1925: 1.7, /* ... */ 2023: 2.0, 2024: 1.9 },
  "SBD": { 1924: 2.5, 1925: 2.4, /* ... */ 2023: 3.0, 2024: 2.9 },
  "SCR": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 4.0, 2024: 3.9 },
  "SDG": { 1924: 5.0, 1925: 5.2, /* ... */ 2023: 50.0, 2024: 45.0 },
  "SEK": { 1924: 2.5, 1925: 2.4, /* ... */ 2023: 3.0, 2024: 2.9 },
  "SGD": { 1924: 1.5, 1925: 1.4, /* ... */ 2023: 2.0, 2024: 1.9 },
  "SHP": { 1924: 1.8, 1925: 1.7, /* ... */ 2023: 6.7, 2024: 3.2 },
  "SLE": { 1924: 4.5, 1925: 4.7, /* ... */ 2023: 20.0, 2024: 18.0 },
  "SOS": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 6.0, 2024: 5.8 },
  "SRD": { 1924: 5.0, 1925: 5.2, /* ... */ 2023: 30.0, 2024: 28.0 },
  "SSP": { 1924: 5.0, 1925: 5.2, /* ... */ 2023: 50.0, 2024: 45.0 },
  "STN": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 4.0, 2024: 3.9 },
  "SYP": { 1924: 5.0, 1925: 5.2, /* ... */ 2023: 100.0, 2024: 95.0 },
  "SZL": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 4.0, 2024: 3.9 },
  "THB": { 1924: 2.0, 1925: 1.9, /* ... */ 2023: 2.5, 2024: 2.4 },
  "TJS": { 1924: 3.5, 1925: 3.4, /* ... */ 2023: 4.5, 2024: 4.4 },
  "TMT": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 3.5, 2024: 3.4 },
  "TND": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 4.0, 2024: 3.9 },
  "TOP": { 1924: 2.5, 1925: 2.4, /* ... */ 2023: 3.0, 2024: 2.9 },
  "TRY": { 1924: 5.0, 1925: 5.2, /* ... */ 2023: 50.0, 2024: 45.0 },
  "TTD": { 1924: 2.5, 1925: 2.4, /* ... */ 2023: 3.0, 2024: 2.9 },
  "TVD": { 1924: 2.2, 1925: 2.1, /* ... */ 2023: 3.5, 2024: 3.0 },
  "TWD": { 1924: 1.5, 1925: 1.4, /* ... */ 2023: 2.0, 2024: 1.9 },
  "TZS": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 6.0, 2024: 5.8 },
  "UAH": { 1924: 5.0, 1925: 5.2, /* ... */ 2023: 10.0, 2024: 9.5 },
  "UGX": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 6.0, 2024: 5.8 },
  "UYU": { 1924: 3.5, 1925: 3.6, /* ... */ 2023: 4.5, 2024: 4.4 },
  "UZS": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 10.0, 2024: 9.5 },
  "VES": { 1924: 5.0, 1925: 5.2, /* ... */ 2023: 100.0, 2024: 95.0 },
  "VND": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 3.5, 2024: 3.4 },
  "VUV": { 1924: 2.5, 1925: 2.4, /* ... */ 2023: 3.0, 2024: 2.9 },
  "WST": { 1924: 2.5, 1925: 2.4, /* ... */ 2023: 3.0, 2024: 2.9 },
  "XAF": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 3.5, 2024: 3.4 },
  "XCD": { 1924: 2.5, 1925: 2.4, /* ... */ 2023: 3.0, 2024: 2.9 },
  "XDR": { 1924: 2.0, 1925: 1.9, /* ... */ 2023: 2.5, 2024: 2.4 },
  "XOF": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 3.5, 2024: 3.4 },
  "XPF": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 3.5, 2024: 3.4 },
  "YER": { 1924: 4.0, 1925: 4.2, /* ... */ 2023: 20.0, 2024: 18.0 },
  "ZAR": { 1924: 3.0, 1925: 3.1, /* ... */ 2023: 4.0, 2024: 3.9 },
  "ZMW": { 1924: 4.5, 1925: 4.7, /* ... */ 2023: 10.0, 2024: 9.5 },
  "ZWL": { 1924: 5.0, 1925: 5.2, /* ... */ 2023: 100.0, 2024: 95.0 }
  // Note: Full data for 1924-2024 should be sourced from a reliable database or API.
};

// Sample goods prices over time (USD)
const goodsPrices = {
  "Gallon of Milk": {
    1970: 1.15,
    1980: 2.16,
    1990: 2.78,
    2000: 2.79,
    2010: 3.39,
    2020: 3.54,
    2024: 4.21,
  },
  "Loaf of Bread": {
    1970: 0.25,
    1980: 0.50,
    1990: 0.70,
    2000: 1.99,
    2010: 2.49,
    2020: 2.99,
    2024: 3.69,
  },
  "Movie Ticket": {
    1970: 1.55,
    1980: 2.69,
    1990: 4.23,
    2000: 5.39,
    2010: 7.89,
    2020: 9.16,
    2024: 11.75,
  },
  "New Car (Average)": {
    1970: 3542,
    1980: 7210,
    1990: 16950,
    2000: 24750,
    2010: 29217,
    2020: 40472,
    2024: 48094,
  },
  "House (Median)": {
    1970: 23450,
    1980: 47200,
    1990: 79100,
    2000: 119600,
    2010: 221800,
    2020: 389400,
    2024: 431000,
  }
}

export default function InflationCalculator() {
  // Basic inputs
  const [amount, setAmount] = useState<number>(1000)
  const [startYear, setStartYear] = useState<number>(2015) // Default to 10 years ago
  const [endYear, setEndYear] = useState<number>(2024)     // Default to current year
  const [currency, setCurrency] = useState<string>("USD")
  const [customInflationRate, setCustomInflationRate] = useState<number>(2.5)
  const [useCustomRate, setUseCustomRate] = useState<boolean>(false)
  const [compoundingFrequency, setCompoundingFrequency] = useState<"annual" | "monthly">("annual")
  
  // Results state
  const [adjustedAmount, setAdjustedAmount] = useState<number>(0)
  const [totalInflation, setTotalInflation] = useState<number>(0)
  const [purchasingPowerLoss, setPurchasingPowerLoss] = useState<number>(0)
  const [yearlyBreakdown, setYearlyBreakdown] = useState<{
    year: number;
    value: number;
    inflationRate: number;
  }[]>([])
  
  // Selected good for comparison
  const [selectedGood, setSelectedGood] = useState<string>("Gallon of Milk")

  // Ensure endYear >= startYear
  useEffect(() => {
    if (endYear < startYear) {
      setEndYear(startYear)
    }
  }, [startYear, endYear])

  // Calculate inflation effects
  useEffect(() => {
    let result = amount
    let breakdown = []
    let totalInflationRate = 0
    
    // Generate year range
    const years = Array.from(
      { length: endYear - startYear + 1 },
      (_, i) => startYear + i
    )
    
    // Calculate for each year
    for (let year of years) {
      let inflationRate = useCustomRate 
        ? customInflationRate 
        : (historicalInflation[currency as keyof typeof historicalInflation][year as keyof typeof historicalInflation[typeof currency]] || customInflationRate)
      
      if (compoundingFrequency === "monthly") {
        // Monthly compounding
        const monthlyRate = inflationRate / 100 / 12
        result *= Math.pow(1 + monthlyRate, 12)
      } else {
        // Annual compounding
        result *= (1 + inflationRate / 100)
      }
      
      totalInflationRate += inflationRate
      
      breakdown.push({
        year,
        value: result,
        inflationRate
      })
    }
    
    setAdjustedAmount(result)
    setYearlyBreakdown(breakdown)
    setTotalInflation(totalInflationRate)
    setPurchasingPowerLoss(((result - amount) / amount) * 100)
    
  }, [
    amount,
    startYear,
    endYear,
    currency,
    customInflationRate,
    useCustomRate,
    compoundingFrequency
  ])

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

  // Value over time chart
  const valueChartData = {
    labels: yearlyBreakdown.map(item => item.year),
    datasets: [
      {
        label: 'Adjusted Value',
        data: yearlyBreakdown.map(item => item.value),
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4
      }
    ]
  }

  const valueChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => {
            return currency + ' ' + (typeof value === 'number' ? value.toLocaleString() : value)
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

  // Inflation rates chart
  const inflationChartData = {
    labels: yearlyBreakdown.map(item => item.year),
    datasets: [
      {
        label: 'Annual Inflation Rate',
        data: yearlyBreakdown.map(item => item.inflationRate),
        backgroundColor: chartColors.primary[1],
        borderColor: chartColors.secondary[1].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const inflationChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
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

  // Goods comparison chart
  const generateGoodsComparisonChart = () => {
    const years = Object.keys(goodsPrices[selectedGood as keyof typeof goodsPrices])
    const prices = Object.values(goodsPrices[selectedGood as keyof typeof goodsPrices])
    
    return {
      labels: years,
      datasets: [
        {
          label: selectedGood + ' Price',
          data: prices,
          backgroundColor: chartColors.primary[2],
          borderColor: chartColors.secondary[2].replace('0.2', '1'),
          borderWidth: 2,
          borderRadius: 6
        }
      ]
    }
  }

  const goodsChartOptions: ChartOptions<'bar'> = {
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
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value: number) => '$' + value.toLocaleString()
      }
    }
  }

  const formatCurrency = (value: number, currencyCode: string = currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2
    }).format(value)
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
    pdf.save('inflation-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <InflationSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Inflation <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate how inflation affects the value of money over time and understand its impact on purchasing power.
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
                    <CardTitle>Enter Values</CardTitle>
                    <CardDescription>
                      Provide the amount and time period to calculate inflation's impact.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Basic Inputs */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Basic Information</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="amount"
                              type="number"
                              className="pl-9"
                              value={amount || ''} onChange={(e) => setAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currency">Currency</Label>
                          <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger id="currency">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">United States Dollar (USD)</SelectItem>
                              <SelectItem value="EUR">Euro (EUR)</SelectItem>
                              <SelectItem value="GBP">British Pound Sterling (GBP)</SelectItem>
                              <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                              <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                              <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                              <SelectItem value="CHF">Swiss Franc (CHF)</SelectItem>
                              <SelectItem value="CNY">Chinese Yuan (CNY)</SelectItem>
                              <SelectItem value="AED">UAE Dirham (AED)</SelectItem>
                              <SelectItem value="AFN">Afghan Afghani (AFN)</SelectItem>
                              <SelectItem value="ALL">Albanian Lek (ALL)</SelectItem>
                              <SelectItem value="AMD">Armenian Dram (AMD)</SelectItem>
                              <SelectItem value="ANG">Netherlands Antillean Guilder (ANG)</SelectItem>
                              <SelectItem value="AOA">Angolan Kwanza (AOA)</SelectItem>
                              <SelectItem value="ARS">Argentine Peso (ARS)</SelectItem>
                              <SelectItem value="AWG">Aruban Florin (AWG)</SelectItem>
                              <SelectItem value="AZN">Azerbaijani Manat (AZN)</SelectItem>
                              <SelectItem value="BAM">Bosnia-Herzegovina Convertible Mark (BAM)</SelectItem>
                              <SelectItem value="BBD">Barbadian Dollar (BBD)</SelectItem>
                              <SelectItem value="BDT">Bangladeshi Taka (BDT)</SelectItem>
                              <SelectItem value="BGN">Bulgarian Lev (BGN)</SelectItem>
                              <SelectItem value="BHD">Bahraini Dinar (BHD)</SelectItem>
                              <SelectItem value="BIF">Burundian Franc (BIF)</SelectItem>
                              <SelectItem value="BMD">Bermudian Dollar (BMD)</SelectItem>
                              <SelectItem value="BND">Brunei Dollar (BND)</SelectItem>
                              <SelectItem value="BOB">Bolivian Boliviano (BOB)</SelectItem>
                              <SelectItem value="BRL">Brazilian Real (BRL)</SelectItem>
                              <SelectItem value="BSD">Bahamian Dollar (BSD)</SelectItem>
                              <SelectItem value="BTN">Bhutanese Ngultrum (BTN)</SelectItem>
                              <SelectItem value="BWP">Botswanan Pula (BWP)</SelectItem>
                              <SelectItem value="BYN">Belarusian Ruble (BYN)</SelectItem>
                              <SelectItem value="BZD">Belize Dollar (BZD)</SelectItem>
                              <SelectItem value="CDF">Congolese Franc (CDF)</SelectItem>
                              <SelectItem value="CLP">Chilean Peso (CLP)</SelectItem>
                              <SelectItem value="COP">Colombian Peso (COP)</SelectItem>
                              <SelectItem value="CRC">Costa Rican Colón (CRC)</SelectItem>
                              <SelectItem value="CUC">Cuban Convertible Peso (CUC)</SelectItem>
                              <SelectItem value="CUP">Cuban Peso (CUP)</SelectItem>
                              <SelectItem value="CVE">Cape Verdean Escudo (CVE)</SelectItem>
                              <SelectItem value="CZK">Czech Koruna (CZK)</SelectItem>
                              <SelectItem value="DJF">Djiboutian Franc (DJF)</SelectItem>
                              <SelectItem value="DKK">Danish Krone (DKK)</SelectItem>
                              <SelectItem value="DOP">Dominican Peso (DOP)</SelectItem>
                              <SelectItem value="DZD">Algerian Dinar (DZD)</SelectItem>
                              <SelectItem value="EGP">Egyptian Pound (EGP)</SelectItem>
                              <SelectItem value="ERN">Eritrean Nakfa (ERN)</SelectItem>
                              <SelectItem value="ETB">Ethiopian Birr (ETB)</SelectItem>
                              <SelectItem value="FJD">Fijian Dollar (FJD)</SelectItem>
                              <SelectItem value="FKP">Falkland Islands Pound (FKP)</SelectItem>
                              <SelectItem value="FOK">Faroese Króna (FOK)</SelectItem>
                              <SelectItem value="GEL">Georgian Lari (GEL)</SelectItem>
                              <SelectItem value="GGP">Guernsey Pound (GGP)</SelectItem>
                              <SelectItem value="GHS">Ghanaian Cedi (GHS)</SelectItem>
                              <SelectItem value="GIP">Gibraltar Pound (GIP)</SelectItem>
                              <SelectItem value="GMD">Gambian Dalasi (GMD)</SelectItem>
                              <SelectItem value="GNF">Guinean Franc (GNF)</SelectItem>
                              <SelectItem value="GTQ">Guatemalan Quetzal (GTQ)</SelectItem>
                              <SelectItem value="GYD">Guyanese Dollar (GYD)</SelectItem>
                              <SelectItem value="HKD">Hong Kong Dollar (HKD)</SelectItem>
                              <SelectItem value="HNL">Honduran Lempira (HNL)</SelectItem>
                              <SelectItem value="HRK">Croatian Kuna (HRK)</SelectItem>
                              <SelectItem value="HTG">Haitian Gourde (HTG)</SelectItem>
                              <SelectItem value="HUF">Hungarian Forint (HUF)</SelectItem>
                              <SelectItem value="IDR">Indonesian Rupiah (IDR)</SelectItem>
                              <SelectItem value="ILS">Israeli New Shekel (ILS)</SelectItem>
                              <SelectItem value="IMP">Isle of Man Pound (IMP)</SelectItem>
                              <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                              <SelectItem value="IQD">Iraqi Dinar (IQD)</SelectItem>
                              <SelectItem value="IRR">Iranian Rial (IRR)</SelectItem>
                              <SelectItem value="ISK">Icelandic Króna (ISK)</SelectItem>
                              <SelectItem value="JEP">Jersey Pound (JEP)</SelectItem>
                              <SelectItem value="JMD">Jamaican Dollar (JMD)</SelectItem>
                              <SelectItem value="JOD">Jordanian Dinar (JOD)</SelectItem>
                              <SelectItem value="KES">Kenyan Shilling (KES)</SelectItem>
                              <SelectItem value="KGS">Kyrgystani Som (KGS)</SelectItem>
                              <SelectItem value="KHR">Cambodian Riel (KHR)</SelectItem>
                              <SelectItem value="KID">Kiribati Dollar (KID)</SelectItem>
                              <SelectItem value="KMF">Comorian Franc (KMF)</SelectItem>
                              <SelectItem value="KPW">North Korean Won (KPW)</SelectItem>
                              <SelectItem value="KRW">South Korean Won (KRW)</SelectItem>
                              <SelectItem value="KWD">Kuwaiti Dinar (KWD)</SelectItem>
                              <SelectItem value="KYD">Cayman Islands Dollar (KYD)</SelectItem>
                              <SelectItem value="KZT">Kazakhstani Tenge (KZT)</SelectItem>
                              <SelectItem value="LAK">Laotian Kip (LAK)</SelectItem>
                              <SelectItem value="LBP">Lebanese Pound (LBP)</SelectItem>
                              <SelectItem value="LKR">Sri Lankan Rupee (LKR)</SelectItem>
                              <SelectItem value="LRD">Liberian Dollar (LRD)</SelectItem>
                              <SelectItem value="LSL">Lesotho Loti (LSL)</SelectItem>
                              <SelectItem value="LYD">Libyan Dinar (LYD)</SelectItem>
                              <SelectItem value="MAD">Moroccan Dirham (MAD)</SelectItem>
                              <SelectItem value="MDL">Moldovan Leu (MDL)</SelectItem>
                              <SelectItem value="MGA">Malagasy Ariary (MGA)</SelectItem>
                              <SelectItem value="MKD">Macedonian Denar (MKD)</SelectItem>
                              <SelectItem value="MMK">Myanmar Kyat (MMK)</SelectItem>
                              <SelectItem value="MNT">Mongolian Tugrik (MNT)</SelectItem>
                              <SelectItem value="MOP">Macanese Pataca (MOP)</SelectItem>
                              <SelectItem value="MRU">Mauritanian Ouguiya (MRU)</SelectItem>
                              <SelectItem value="MUR">Mauritian Rupee (MUR)</SelectItem>
                              <SelectItem value="MVR">Maldivian Rufiyaa (MVR)</SelectItem>
                              <SelectItem value="MWK">Malawian Kwacha (MWK)</SelectItem>
                              <SelectItem value="MXN">Mexican Peso (MXN)</SelectItem>
                              <SelectItem value="MYR">Malaysian Ringgit (MYR)</SelectItem>
                              <SelectItem value="MZN">Mozambican Metical (MZN)</SelectItem>
                              <SelectItem value="NAD">Namibian Dollar (NAD)</SelectItem>
                              <SelectItem value="NGN">Nigerian Naira (NGN)</SelectItem>
                              <SelectItem value="NIO">Nicaraguan Córdoba (NIO)</SelectItem>
                              <SelectItem value="NOK">Norwegian Krone (NOK)</SelectItem>
                              <SelectItem value="NPR">Nepalese Rupee (NPR)</SelectItem>
                              <SelectItem value="NZD">New Zealand Dollar (NZD)</SelectItem>
                              <SelectItem value="OMR">Omani Rial (OMR)</SelectItem>
                              <SelectItem value="PAB">Panamanian Balboa (PAB)</SelectItem>
                              <SelectItem value="PEN">Peruvian Sol (PEN)</SelectItem>
                              <SelectItem value="PGK">Papua New Guinean Kina (PGK)</SelectItem>
                              <SelectItem value="PHP">Philippine Peso (PHP)</SelectItem>
                              <SelectItem value="PKR">Pakistani Rupee (PKR)</SelectItem>
                              <SelectItem value="PLN">Polish Zloty (PLN)</SelectItem>
                              <SelectItem value="PYG">Paraguayan Guarani (PYG)</SelectItem>
                              <SelectItem value="QAR">Qatari Rial (QAR)</SelectItem>
                              <SelectItem value="RON">Romanian Leu (RON)</SelectItem>
                              <SelectItem value="RSD">Serbian Dinar (RSD)</SelectItem>
                              <SelectItem value="RUB">Russian Ruble (RUB)</SelectItem>
                              <SelectItem value="RWF">Rwandan Franc (RWF)</SelectItem>
                              <SelectItem value="SAR">Saudi Riyal (SAR)</SelectItem>
                              <SelectItem value="SBD">Solomon Islands Dollar (SBD)</SelectItem>
                              <SelectItem value="SCR">Seychellois Rupee (SCR)</SelectItem>
                              <SelectItem value="SDG">Sudanese Pound (SDG)</SelectItem>
                              <SelectItem value="SEK">Swedish Krona (SEK)</SelectItem>
                              <SelectItem value="SGD">Singapore Dollar (SGD)</SelectItem>
                              <SelectItem value="SHP">Saint Helena Pound (SHP)</SelectItem>
                              <SelectItem value="SLE">Sierra Leonean Leone (SLE)</SelectItem>
                              <SelectItem value="SOS">Somali Shilling (SOS)</SelectItem>
                              <SelectItem value="SRD">Surinamese Dollar (SRD)</SelectItem>
                              <SelectItem value="SSP">South Sudanese Pound (SSP)</SelectItem>
                              <SelectItem value="STN">São Tomé and Príncipe Dobra (STN)</SelectItem>
                              <SelectItem value="SYP">Syrian Pound (SYP)</SelectItem>
                              <SelectItem value="SZL">Swazi Lilangeni (SZL)</SelectItem>
                              <SelectItem value="THB">Thai Baht (THB)</SelectItem>
                              <SelectItem value="TJS">Tajikistani Somoni (TJS)</SelectItem>
                              <SelectItem value="TMT">Turkmenistani Manat (TMT)</SelectItem>
                              <SelectItem value="TND">Tunisian Dinar (TND)</SelectItem>
                              <SelectItem value="TOP">Tongan Paʻanga (TOP)</SelectItem>
                              <SelectItem value="TRY">Turkish Lira (TRY)</SelectItem>
                              <SelectItem value="TTD">Trinidad and Tobago Dollar (TTD)</SelectItem>
                              <SelectItem value="TVD">Tuvaluan Dollar (TVD)</SelectItem>
                              <SelectItem value="TWD">New Taiwan Dollar (TWD)</SelectItem>
                              <SelectItem value="TZS">Tanzanian Shilling (TZS)</SelectItem>
                              <SelectItem value="UAH">Ukrainian Hryvnia (UAH)</SelectItem>
                              <SelectItem value="UGX">Ugandan Shilling (UGX)</SelectItem>
                              <SelectItem value="UYU">Uruguayan Peso (UYU)</SelectItem>
                              <SelectItem value="UZS">Uzbekistani Som (UZS)</SelectItem>
                              <SelectItem value="VES">Venezuelan Bolívar Soberano (VES)</SelectItem>
                              <SelectItem value="VND">Vietnamese Dong (VND)</SelectItem>
                              <SelectItem value="VUV">Vanuatu Vatu (VUV)</SelectItem>
                              <SelectItem value="WST">Samoan Tala (WST)</SelectItem>
                              <SelectItem value="XAF">CFA Franc BEAC (XAF)</SelectItem>
                              <SelectItem value="XCD">Eastern Caribbean Dollar (XCD)</SelectItem>
                              <SelectItem value="XDR">Special Drawing Rights (XDR)</SelectItem>
                              <SelectItem value="XOF">CFA Franc BCEAO (XOF)</SelectItem>
                              <SelectItem value="XPF">CFP Franc (XPF)</SelectItem>
                              <SelectItem value="YER">Yemeni Rial (YER)</SelectItem>
                              <SelectItem value="ZAR">South African Rand (ZAR)</SelectItem>
                              <SelectItem value="ZMW">Zambian Kwacha (ZMW)</SelectItem>
                              <SelectItem value="ZWL">Zimbabwean Dollar (ZWL)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="start-year">Start Year</Label>
                          <Select value={String(startYear)} onValueChange={(value) => setStartYear(Number(value))}>
                            <SelectTrigger id="start-year">
                              <SelectValue placeholder="Select start year" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 101 }, (_, i) => 1924 + i).map((year) => (
                                <SelectItem key={year} value={String(year)}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-year">End Year</Label>
                          <Select value={String(endYear)} onValueChange={(value) => setEndYear(Number(value))}>
                            <SelectTrigger id="end-year">
                              <SelectValue placeholder="Select end year" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 101 }, (_, i) => 1924 + i).map((year) => (
                                <SelectItem key={year} value={String(year)}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Advanced Options */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Advanced Options</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="custom-rate">Use Custom Inflation Rate</Label>
                            <Switch
                              id="custom-rate"
                              checked={useCustomRate}
                              onCheckedChange={setUseCustomRate}
                            />
                          </div>
                          {useCustomRate && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="inflation-rate">Custom Inflation Rate</Label>
                                <span className="text-sm text-muted-foreground">{customInflationRate}%</span>
                              </div>
                              <Slider
                                id="inflation-rate"
                                min={0}
                                max={15}
                                step={0.1}
                                value={[customInflationRate]}
                                onValueChange={(value) => setCustomInflationRate(value[0])}
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="compounding">Compounding Frequency</Label>
                          <Select 
                            value={compoundingFrequency} 
                            onValueChange={(value) => setCompoundingFrequency(value as "annual" | "monthly")}
                          >
                            <SelectTrigger id="compounding">
                              <SelectValue placeholder="Select compounding frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="annual">Annual</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Goods Comparison */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Compare with Common Goods</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="good">Select Item</Label>
                          <Select value={selectedGood} onValueChange={setSelectedGood}>
                            <SelectTrigger id="good">
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(goodsPrices).map((good) => (
                                <SelectItem key={good} value={good}>
                                  {good}
                                </SelectItem>
                              ))}
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Original Amount</p>
                        <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Adjusted Amount</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(adjustedAmount)}</p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="value" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="value">Value</TabsTrigger>
                        <TabsTrigger value="rates">Rates</TabsTrigger>
                        <TabsTrigger value="goods">Goods</TabsTrigger>
                      </TabsList>

                      <TabsContent value="value" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={valueChartData} options={valueChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Value Analysis</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Inflation</span>
                              <span className="font-medium">{totalInflation.toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Purchasing Power Loss</span>
                              <span className="font-medium">{purchasingPowerLoss.toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Value Change</span>
                              <span>{formatCurrency(adjustedAmount - amount)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="rates" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={inflationChartData} options={inflationChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Inflation Rate Analysis</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Average Annual Rate</span>
                              <span className="font-medium">
                                {(totalInflation / (endYear - startYear + 1)).toFixed(2)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Cumulative Rate</span>
                              <span className="font-medium">{totalInflation.toFixed(2)}%</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="goods" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={generateGoodsComparisonChart()} options={goodsChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Historical Price Comparison</h4>
                          <p className="text-sm text-muted-foreground">
                            Shows how the price of {selectedGood.toLowerCase()} has changed over time due to inflation.
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Summary Card */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Inflation Impact Summary</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(amount)} in {startYear} has the same buying power as {formatCurrency(adjustedAmount)} in {endYear}. 
                              This represents a {purchasingPowerLoss > 0 ? "decrease" : "increase"} in purchasing power of {Math.abs(purchasingPowerLoss).toFixed(2)}%.
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
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Understanding the Impact of Inflation on Your Money</h2>
        <p className="mt-3 text-muted-foreground text-lg">How rising prices erode purchasing power and what you can do about it</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            The Hidden Tax: Understanding Inflation
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                <strong>Inflation</strong> is often called the silent wealth eroder—a persistent increase in prices that reduces your purchasing power over time. What costs $100 today might require $150 to buy the same items in just a decade.
              </p>
              <p className="mt-3">
                While modest inflation is considered normal in growing economies, understanding its impact is crucial for effective financial planning. An inflation calculator allows you to see how price increases affect your money's value across time.
              </p>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Why Monitor Inflation?</h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                  <li>• Understand the real return on your investments and savings</li>
                  <li>• Accurately project future expenses and retirement needs</li>
                  <li>• Make informed decisions about salary negotiations</li>
                  <li>• Evaluate the true cost of long-term loans and mortgages</li>
                  <li>• Protect your purchasing power with appropriate strategies</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-400">Historical U.S. Inflation Rates</h3>
              <div className="h-[240px]">
                <Line 
                  data={{
                    labels: ['1975', '1980', '1985', '1990', '1995', '2000', '2005', '2010', '2015', '2020', '2025'],
                    datasets: [{
                      label: 'Annual Inflation Rate (%)',
                      data: [9.1, 13.5, 3.6, 5.4, 2.8, 3.4, 3.4, 1.6, 0.1, 1.4, 3.2],
                      borderColor: 'rgba(239, 68, 68, 0.8)',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      tension: 0.4
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { callback: (value) => value + '%' }
                      }
                    }
                  }}
                />
              </div>
              
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Did you know?</strong> The U.S. experienced historic inflation highs of 14.8% in 1980, while in 2009, during the financial crisis aftermath, inflation briefly went negative (-0.4%)—a phenomenon known as deflation.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <ShoppingCart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="mt-3 text-lg font-semibold text-blue-800 dark:text-blue-300">Consumer Impact</h3>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    Track how rising prices affect your household budget and purchasing habits
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <PiggyBank className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-300">Savings Protection</h3>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    Ensure your savings and investments outpace inflation to preserve wealth
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <CalendarClock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <h3 className="mt-3 text-lg font-semibold text-purple-800 dark:text-purple-300">Future Planning</h3>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                    Project future expenses and retirement needs with inflation adjustments
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Inflation Fundamentals */}
      <div className="mb-10" id="inflation-fundamentals">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          Inflation Fundamentals
        </h2>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Measuring Inflation
            </CardTitle>
            <CardDescription>How economists track rising prices across the economy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Key Inflation Indicators</h3>
                <p className="mb-4">
                  Governments and economists use various indices to track inflation, each measuring price changes across different baskets of goods and services.
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="mb-2 font-medium text-blue-700 dark:text-blue-400">Major Inflation Metrics</p>
                  <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-500">
                    <li><strong>Consumer Price Index (CPI):</strong> Tracks retail prices for a basket of goods/services commonly purchased by households</li>
                    <li><strong>Personal Consumption Expenditures (PCE):</strong> Preferred by the Federal Reserve, accounts for consumer substitution behavior</li>
                    <li><strong>Producer Price Index (PPI):</strong> Measures wholesale prices paid by producers, often signals future CPI changes</li>
                    <li><strong>GDP Deflator:</strong> Broadest inflation measure covering all domestically produced goods and services</li>
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      CPI and PCE often diverge slightly in their measurements. When using an inflation calculator, note which index it's based on for more accurate projections.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                  <h4 className="font-medium text-lg mb-3">CPI Components Weighting</h4>
                  <div className="h-[220px]">
                    <Pie 
                      data={{
                        labels: [
                          'Housing (33%)',
                          'Food & Beverages (15%)',
                          'Transportation (14%)',
                          'Medical Care (9%)',
                          'Education (7%)',
                          'Recreation (6%)',
                          'Other (16%)'
                        ],
                        datasets: [{
                          data: [33, 15, 14, 9, 7, 6, 16],
                          backgroundColor: [
                            'rgba(99, 102, 241, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(249, 115, 22, 0.8)',
                            'rgba(236, 72, 153, 0.8)',
                            'rgba(139, 92, 246, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(107, 114, 128, 0.8)'
                          ],
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { 
                            position: 'right',
                            labels: { boxWidth: 12, padding: 15 }
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-center mt-2 text-muted-foreground">
                    Source: U.S. Bureau of Labor Statistics, 2025
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Core vs. Headline Inflation</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Headline inflation</strong> includes all components of the consumer price index, while <strong>core inflation</strong> excludes volatile food and energy prices. Central banks often focus on core inflation for policy decisions since it better reflects persistent trends.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Purchasing Power Erosion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-4">
                  <strong>Purchasing power</strong> is what your money can actually buy. As prices rise due to inflation, each dollar buys less, effectively making you poorer unless your income increases at the same rate or your investments outpace inflation.
                </p>
                
                <div className="space-y-4">
                  <h4 className="font-medium">The Compounding Effect of Inflation</h4>
                  <p className="text-sm text-muted-foreground">
                    Like compound interest, inflation compounds over time, with its effects becoming more dramatic the longer the timeframe. Even modest inflation can significantly erode purchasing power over decades.
                  </p>
                  
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="py-2 px-3 text-left">Average Annual Inflation</th>
                          <th className="py-2 px-3 text-left">Years for Money to Lose Half Its Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        <tr>
                          <td className="py-2 px-3">2%</td>
                          <td className="py-2 px-3 font-medium">35 years</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3">3%</td>
                          <td className="py-2 px-3 font-medium">24 years</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3">4%</td>
                          <td className="py-2 px-3 font-medium">18 years</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3">5%</td>
                          <td className="py-2 px-3 font-medium">14 years</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3">7%</td>
                          <td className="py-2 px-3 font-medium">10 years</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="h-[240px]">
                  <h4 className="text-center text-sm font-medium mb-2">Purchasing Power of $50,000 Over Time</h4>
                  <Line 
                    data={{
                      labels: ['Today', '5 Years', '10 Years', '15 Years', '20 Years', '25 Years', '30 Years'],
                      datasets: [
                        {
                          label: '2% Inflation',
                          data: [50000, 45289, 41019, 37153, 33659, 30476, 27594],
                          borderColor: 'rgba(59, 130, 246, 0.8)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.4
                        },
                        {
                          label: '3% Inflation',
                          data: [50000, 43130, 37201, 32081, 27684, 23880, 20604],
                          borderColor: 'rgba(220, 38, 38, 0.8)',
                          backgroundColor: 'rgba(220, 38, 38, 0.1)',
                          tension: 0.4
                        },
                        {
                          label: '5% Inflation',
                          data: [50000, 39161, 30656, 24003, 18789, 14715, 11524],
                          borderColor: 'rgba(236, 72, 153, 0.8)',
                          backgroundColor: 'rgba(236, 72, 153, 0.1)',
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } }
                      },
                      scales: {
                        y: {
                          ticks: { callback: (value) => '$' + value.toLocaleString() }
                        }
                      }
                    }}
                  />
                </div>
                
                <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-900/20 dark:to-red-900/10">
                  <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Real-World Example</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-red-700 dark:text-red-400">Item (1985)</span>
                        <span className="text-sm font-medium text-red-700 dark:text-red-400">Price</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Movie Ticket</span>
                        <span className="text-sm">$3.55</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Gallon of Gas</span>
                        <span className="text-sm">$1.20</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">New Car (avg)</span>
                        <span className="text-sm">$9,005</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-red-700 dark:text-red-400">Item (2025)</span>
                        <span className="text-sm font-medium text-red-700 dark:text-red-400">Price</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Movie Ticket</span>
                        <span className="text-sm">$12.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Gallon of Gas</span>
                        <span className="text-sm">$3.85</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">New Car (avg)</span>
                        <span className="text-sm">$38,762</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-purple-600" />
                Types of Inflation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Not all inflation is created equal. Understanding the different types can help you better interpret economic signals and protect your finances.
              </p>

              <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">Demand-Pull Inflation</h4>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  Occurs when aggregate demand exceeds available supply. The economy is "pulling" prices higher through strong consumer spending, business investment, or government spending.
                </p>
                <div className="mt-2 text-xs p-1.5 bg-purple-100/50 dark:bg-purple-900/30 rounded text-purple-600 dark:text-purple-300">
                  <strong>Example:</strong> Economic boom periods, stimulus-driven growth
                </div>
              </div>
              
              <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">Cost-Push Inflation</h4>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  Happens when production costs increase and businesses pass those costs on to consumers. Often caused by supply disruptions, resource scarcity, or increased input costs.
                </p>
                <div className="mt-2 text-xs p-1.5 bg-purple-100/50 dark:bg-purple-900/30 rounded text-purple-600 dark:text-purple-300">
                  <strong>Example:</strong> Oil price shocks, supply chain disruptions
                </div>
              </div>
              
              <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">Built-In Inflation</h4>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  Results from the expectation that inflation will continue. Workers demand higher wages to keep up with anticipated cost of living increases, creating a cycle.
                </p>
                <div className="mt-2 text-xs p-1.5 bg-purple-100/50 dark:bg-purple-900/30 rounded text-purple-600 dark:text-purple-300">
                  <strong>Example:</strong> Wage-price spirals of the 1970s
                </div>
              </div>
              
              <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">Hyperinflation</h4>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  Extremely rapid inflation that can destroy currencies. Usually defined as price increases exceeding 50% per month, often caused by excessive money supply growth.
                </p>
                <div className="mt-2 text-xs p-1.5 bg-purple-100/50 dark:bg-purple-900/30 rounded text-purple-600 dark:text-purple-300">
                  <strong>Example:</strong> Zimbabwe (2008), Venezuela (2016-present), Weimar Germany (1923)
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Nominal vs. Real Values
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Understanding the difference between nominal (face value) and real (inflation-adjusted) numbers is essential for accurate financial planning and investment analysis.
              </p>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mb-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Key Distinctions</h4>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300">N</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Nominal Values</p>
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                        Current dollar amounts that haven't been adjusted for inflation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300">R</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Real Values</p>
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                        Amounts that have been adjusted to account for inflation's effects
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Converting Between Nominal and Real Values</h4>
                <div className="p-3 border border-blue-100 dark:border-blue-800 rounded-md bg-blue-50/50 dark:bg-blue-900/20">
                  <p className="font-mono text-sm text-blue-700 dark:text-blue-400">
                    Real Value = Nominal Value ÷ (1 + Inflation Rate)^Years
                  </p>
                  <p className="font-mono text-sm text-blue-700 dark:text-blue-400 mt-2">
                    Nominal Value = Real Value × (1 + Inflation Rate)^Years
                  </p>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Real-World Applications</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="py-2 px-3 text-left">Metric</th>
                          <th className="py-2 px-3 text-left">Nominal Measurement</th>
                          <th className="py-2 px-3 text-left">Real Measurement</th>
                          <th className="py-2 px-3 text-left">Why It Matters</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        <tr>
                          <td className="py-2 px-3 font-medium">Wage Growth</td>
                          <td className="py-2 px-3">5% annual raise</td>
                          <td className="py-2 px-3">2% real increase (with 3% inflation)</td>
                          <td className="py-2 px-3">Shows true change in purchasing power</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium">Investment Returns</td>
                          <td className="py-2 px-3">8% annual return</td>
                          <td className="py-2 px-3">5% real return (with 3% inflation)</td>
                          <td className="py-2 px-3">Reveals actual wealth growth</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium">GDP Growth</td>
                          <td className="py-2 px-3">4% nominal growth</td>
                          <td className="py-2 px-3">1.5% real growth (with 2.5% inflation)</td>
                          <td className="py-2 px-3">Measures true economic expansion</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Important:</strong> When comparing financial values across different time periods, always convert to real values in the same base year to make accurate comparisons.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Inflation Planning Strategies */}
      <div className="mb-10" id="inflation-strategies">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">Protecting Your Money From Inflation</span>
              </div>
            </CardTitle>
            <CardDescription>
              Strategies to maintain and grow purchasing power in inflationary environments
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 id="investment-strategies" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Inflation-Beating Investment Strategies
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p>
                    <strong>Traditional savings accounts</strong> rarely keep pace with inflation, making strategic investing essential for preserving your long-term purchasing power. The goal is to achieve returns that consistently outpace the inflation rate.
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Asset Classes: Historical Real Returns</h4>
                    <div className="h-[220px]">
                      <Bar 
                        data={{
                          labels: ['Cash/Savings', 'Bonds', 'Stocks', 'Real Estate', 'Gold'],
                          datasets: [{
                            label: 'Average Annual Real Return (1925-2025)',
                            data: [-0.5, 1.7, 6.8, 4.2, 0.9],
                            backgroundColor: [
                              'rgba(239, 68, 68, 0.7)',
                              'rgba(245, 158, 11, 0.7)',
                              'rgba(16, 185, 129, 0.7)',
                              'rgba(59, 130, 246, 0.7)',
                              'rgba(245, 158, 11, 0.7)'
                            ],
                            borderWidth: 1
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: false,
                              ticks: { callback: (value) => value + '%' }
                            }
                          },
                          plugins: {
                            legend: { display: false }
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      Historical average real returns after inflation. Past performance doesn't guarantee future results.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Inflation-Resistant Investment Options</h4>
                  
                  <div className="space-y-3">
                    <Card className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <h5 className="font-medium">Stocks & Equities</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Historically outperform inflation over long periods as companies can raise prices, adapt business models, and grow earnings during inflationary periods. Focus on companies with pricing power and strong market positions.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <h5 className="font-medium">Treasury Inflation-Protected Securities (TIPS)</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Government bonds specifically designed to protect against inflation. Their principal value adjusts based on changes in the Consumer Price Index, providing guaranteed inflation protection.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-amber-500">
                      <CardContent className="p-4">
                        <h5 className="font-medium">Real Estate</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Property values and rental income typically increase with inflation. REITs (Real Estate Investment Trusts) offer an accessible way to invest in income-producing real estate without direct ownership.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <h5 className="font-medium">I-Bonds & Floating Rate Securities</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Series I Savings Bonds feature an inflation-adjusted interest rate component. Similarly, floating-rate bonds adjust interest payments based on benchmark rates that often rise with inflation.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 mt-4">
                <div className="flex items-start gap-3">
                  <LightbulbIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Diversification Tip:</strong> Different assets perform better during different inflation environments. A diversified portfolio with a mix of stocks, bonds, real estate, and inflation-protected securities offers the best defense against varying inflation levels.
                  </p>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="income-strategies" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Protecting Income
                </h3>
                <p>
                  When your income doesn't keep pace with inflation, your standard of living gradually declines. Strategic action can help maintain your purchasing power.
                </p>
                
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Annual Salary Reviews</h4>
                    <p className="text-sm mt-1 text-blue-600 dark:text-blue-500">
                      Regularly benchmark your compensation against market rates and inflation. Aim for annual increases at least equal to inflation to maintain purchasing power.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Skill Development</h4>
                    <p className="text-sm mt-1 text-blue-600 dark:text-blue-500">
                      Continuously upgrade your skills to increase earning potential. High-demand skills often command premium salaries that outpace inflation.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Income Diversification</h4>
                    <p className="text-sm mt-1 text-blue-600 dark:text-blue-500">
                      Create multiple income streams through side businesses, consulting work, investments, or passive income sources to reduce reliance on a single inflation-vulnerable income.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">COLA Provisions</h4>
                    <p className="text-sm mt-1 text-blue-600 dark:text-blue-500">
                      When possible, negotiate Cost of Living Adjustments (COLA) in employment contracts or seek positions that include automatic inflation-based increases.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="retirement-planning" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                  <CalendarClock className="h-5 w-5" />
                  Inflation-Aware Retirement Planning
                </h3>
                <p>
                  Inflation poses one of the greatest risks to retirement security, potentially eroding purchasing power over a 20-30 year retirement timeframe.
                </p>
                
                <div className="mt-4 space-y-4">
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">Adjust Savings Targets</h4>
                    <p className="text-sm mt-1">
                      Use an inflation calculator to determine how much your target retirement income needs to grow to maintain purchasing power. Then adjust your savings rate accordingly.
                    </p>
                  </div>
                  
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">Safe Withdrawal Rate</h4>
                    <p className="text-sm mt-1">
                      The classic 4% rule for retirement withdrawals already factors in historical inflation. However, in higher inflation periods, consider a more conservative withdrawal rate (3-3.5%).
                    </p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-purple-50 dark:bg-purple-900/30">
                        <tr>
                          <th className="px-3 py-2 text-left">Required Annual Income</th>
                          <th className="px-3 py-2 text-left">Today</th>
                          <th className="px-3 py-2 text-left">In 30 Years (2% Inflation)</th>
                          <th className="px-3 py-2 text-left">In 30 Years (3% Inflation)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-100 dark:divide-purple-800">
                        <tr>
                          <td className="px-3 py-2">$40,000</td>
                          <td className="px-3 py-2">$40,000</td>
                          <td className="px-3 py-2">$72,375</td>
                          <td className="px-3 py-2">$97,336</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2">$60,000</td>
                          <td className="px-3 py-2">$60,000</td>
                          <td className="px-3 py-2">$108,563</td>
                          <td className="px-3 py-2">$146,005</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2">$100,000</td>
                          <td className="px-3 py-2">$100,000</td>
                          <td className="px-3 py-2">$180,939</td>
                          <td className="px-3 py-2">$243,341</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Using Inflation Calculators */}
      <div className="mb-10" id="using-calculators">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Making the Most of Inflation Calculators
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Common Applications</CardTitle>
              <CardDescription>
                Practical ways to use inflation calculators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <AreaChart className="h-4 w-4 text-blue-600" />
                  Compare Purchasing Power Across Time
                </h4>
                <p className="text-sm text-muted-foreground">
                  Convert dollar values from different years to see how much buying power has changed. This helps put historical prices, wages, and costs in proper context.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ArrowUpCircle className="h-4 w-4 text-blue-600" />
                  Forecast Future Expenses
                </h4>
                <p className="text-sm text-muted-foreground">
                  Estimate how much goods, services, or overall living expenses will cost in the future. Essential for budgeting for major life events like college education or retirement.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  Evaluate Investments
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate real (inflation-adjusted) returns on investments to determine if they're truly growing in value or merely keeping pace with inflation.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-blue-600" />
                  Assess Salary Growth
                </h4>
                <p className="text-sm text-muted-foreground">
                  Compare your salary increases against inflation rates to determine if your real income is growing, stagnating, or declining over time.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Input Considerations</CardTitle>
              <CardDescription>
                Factors to consider when using inflation calculators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-green-600" />
                  Choosing the Right Inflation Measure
                </h4>
                <p className="text-sm text-muted-foreground">
                  Most calculators use CPI, but PCE or specialized indices might be more appropriate depending on your specific expenses and circumstances.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-green-600" />
                  Time Period Selection
                </h4>
                <p className="text-sm text-muted-foreground">
                  Consider economic contexts when selecting comparison periods. Periods of unusually high inflation (like the 1970s) or deflation can skew results.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-green-600" />
                  Assumption Variability
                </h4>
                <p className="text-sm text-muted-foreground">
                  Run calculations with different inflation rate assumptions to see potential outcomes across best-case, most likely, and worst-case scenarios.
                </p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 mt-4">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Pro Tip:</strong> Historical inflation averages around 3% in the US, but projections vary widely. Consider using 2-4% for conservative planning, with sensitivity analysis for higher rates.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
              <CardTitle className="text-blue-800 dark:text-blue-300">Step-by-Step Calculator Guide</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-300 font-medium">1</div>
                    </div>
                    <div>
                      <p className="font-medium">Enter your starting amount</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Input the dollar amount you want to adjust for inflation. This could be a current expense, income amount, or savings target.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-300 font-medium">2</div>
                    </div>
                    <div>
                      <p className="font-medium">Select your time parameters</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Choose the start and end years for your calculation. For future projections, select the current year as the start and your target future year as the end.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-300 font-medium">3</div>
                    </div>
                    <div>
                      <p className="font-medium">Choose inflation rate assumptions</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        For historical calculations, most calculators use actual CPI data. For future projections, you'll need to enter your inflation rate assumption (typically 2-3% for conservative estimates).
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-300 font-medium">4</div>
                    </div>
                    <div>
                      <p className="font-medium">Analyze and apply the results</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Compare the original amount with the inflation-adjusted figure to understand the purchasing power difference, then incorporate this insight into your financial planning.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">Practical Example</p>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                      If you currently spend $50,000 annually and want to maintain that lifestyle in retirement 25 years from now, an inflation calculator with a 3% annual inflation rate would show you'll need approximately $104,688 per year in retirement to maintain the same standard of living.
                    </p>
                  </div>
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
              Inflation-Aware Financial Planning
            </CardTitle>
            <CardDescription>
              Key takeaways for protecting your financial future
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Inflation</strong> might work silently in the background, but its effects on your financial health can be dramatic over time. By using inflation calculators and implementing strategic planning, you can protect your purchasing power and ensure financial security regardless of changing economic conditions.
            </p>
            
            <p className="mt-4" id="key-lessons">
              As you integrate inflation awareness into your financial planning, remember these principles:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">For Savings & Investments</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Always think in terms of real (inflation-adjusted) returns</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Diversify across assets that respond differently to inflation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Consider dedicated inflation-hedging investments like TIPS and I-Bonds</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">For Long-Term Planning</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Build inflation projections into all major financial goals</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Regularly revisit and adjust your plans as inflation rates change</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Ensure income growth strategies keep pace with or exceed inflation</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to inflation-proof your finances?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Inflation Calculator</strong> above to see how rising prices affect your financial goals! For additional financial planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/401k">
                        <Clock className="h-4 w-4 mr-1" />
                        Retirement Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/purchasing-power">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Purchasing Power
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/investment-returns">
                        <LineChart className="h-4 w-4 mr-1" />
                        Real Returns
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
                  <CardTitle className="text-lg">Investment Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate potential returns on your investments and see how they can help combat inflation.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/investment">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Savings Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Plan your savings strategy while accounting for inflation's impact on your goals.
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
                  <CardTitle className="text-lg">Retirement Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Project your retirement needs considering inflation's effect on future costs.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/401k">Try Calculator</Link>
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