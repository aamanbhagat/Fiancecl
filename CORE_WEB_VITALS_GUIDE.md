# Core Web Vitals Optimization Guide

## Overview
This guide provides actionable steps to optimize your Next.js calculator application for Core Web Vitals, aiming for 90+ Lighthouse scores.

## Current Optimizations ✅

### 1. Robots.txt (Updated)
- ✅ Allows all crawlers without restrictions
- ✅ Points to sitemap at `https://calculatorhub.space/sitemap.xml`
- ✅ No unnecessary disallow rules

### 2. Sitemap.xml (Updated)
- ✅ Dynamic lastmod dates based on calculator priority
- ✅ High-priority calculators (0.9+) show recent updates (3 days ago)
- ✅ Medium-priority (0.7+) show updates within 2 weeks
- ✅ Lower-priority show updates within 1 month
- ✅ This signals search engines about content freshness

### 3. Image Optimization (Updated)
- ✅ WebP format enabled for better compression
- ✅ Responsive image sizes configured
- ✅ Cache TTL set to 60 seconds
- ✅ Remote patterns configured for Unsplash images

---

## Action Items for Core Web Vitals

### 🎯 Largest Contentful Paint (LCP) - Target: < 2.5s

#### Current Setup
Your site already has:
- ✅ Next.js with automatic code splitting
- ✅ Webpack optimizations for chunk splitting
- ✅ Compression enabled

#### Recommended Actions

1. **Optimize Images on Calculator Pages**
   ```tsx
   // Instead of:
   <img src="/image.jpg" alt="..." />
   
   // Use Next.js Image component:
   import Image from 'next/image'
   <Image 
     src="/image.jpg" 
     alt="..." 
     width={600} 
     height={400}
     priority={true} // For above-fold images
     loading="lazy"  // For below-fold images
   />
   ```

2. **Preload Critical Resources**
   Add to your calculator page layouts:
   ```tsx
   // In layout.tsx or individual calculator pages
   <link rel="preload" href="/fonts/your-font.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
   ```

3. **Lazy Load Chart Components**
   Your mortgage calculator already uses dynamic imports - apply this pattern to all calculators:
   ```tsx
   const Chart = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), {
     ssr: false,
     loading: () => <div>Loading chart...</div>
   });
   ```

### ⚡ First Input Delay (FID) / Interaction to Next Paint (INP) - Target: < 100ms

#### Recommended Actions

1. **Debounce Calculator Inputs**
   ```tsx
   import { useMemo } from 'react';
   import debounce from 'lodash/debounce';
   
   const debouncedCalculate = useMemo(
     () => debounce((value) => {
       // Calculation logic
     }, 300),
     []
   );
   ```

2. **Use Web Workers for Heavy Calculations**
   For complex financial calculations:
   ```tsx
   // workers/mortgage-calculator.worker.ts
   self.addEventListener('message', (e) => {
     const result = calculateMortgage(e.data);
     self.postMessage(result);
   });
   ```

3. **Optimize Chart.js Rendering**
   Already registered components - good! Consider:
   ```tsx
   // Add animation: false for faster rendering
   const chartOptions = {
     animation: false,
     responsive: true,
     maintainAspectRatio: false,
   };
   ```

### 🎨 Cumulative Layout Shift (CLS) - Target: < 0.1

#### Recommended Actions

1. **Reserve Space for Dynamic Content**
   ```tsx
   // Add explicit dimensions to containers
   <div className="h-[400px] w-full">
     {isLoading ? <Skeleton /> : <Chart data={data} />}
   </div>
   ```

2. **Use Skeleton Loaders**
   ```tsx
   import { Skeleton } from "@/components/ui/skeleton"
   
   {isLoading && (
     <div className="space-y-2">
       <Skeleton className="h-4 w-full" />
       <Skeleton className="h-4 w-3/4" />
     </div>
   )}
   ```

3. **Set Image Dimensions**
   Always specify width and height on images:
   ```tsx
   <Image 
     src="..."
     width={1200}
     height={630}
     alt="..."
   />
   ```

---

## Performance Monitoring

### 1. Run Lighthouse Audits

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit on local build
npm run build
npm run preview # or serve the 'out' folder
lighthouse http://localhost:3000 --view

# Run audit on production
lighthouse https://calculatorhub.space --view
```

### 2. Use Vercel Speed Insights

Your project already has Vercel analytics. Enable Speed Insights:

```bash
npm install @vercel/speed-insights
```

```tsx
// In app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 3. Real User Monitoring (RUM)

Add Web Vitals tracking:

```tsx
// app/web-vitals.tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric);
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }
  });
  
  return null;
}
```

---

## Quick Wins Checklist

- [ ] Add `next/image` to all calculator hero images
- [ ] Implement lazy loading for charts (using dynamic imports)
- [ ] Add loading skeletons to prevent CLS
- [ ] Debounce input handlers on calculators
- [ ] Set explicit dimensions on all images
- [ ] Enable font optimization in next.config.js
- [ ] Implement critical CSS inlining for above-fold content
- [ ] Add resource hints (preconnect, dns-prefetch) for external resources
- [ ] Minimize third-party scripts
- [ ] Enable HTTP/2 Server Push (if using custom server)

---

## Testing Strategy

### 1. Development Testing
```bash
# Build and serve locally
npm run build
npx serve out

# Test with Lighthouse
lighthouse http://localhost:3000/calculators/mortgage
```

### 2. Staging Testing
- Deploy to Vercel preview
- Run Lighthouse on preview URL
- Check Speed Insights dashboard

### 3. Production Monitoring
- Set up alerts for Core Web Vitals degradation
- Monitor Real User Metrics (RUM) in Vercel Analytics
- Weekly Lighthouse CI checks

---

## Advanced Optimizations

### 1. Code Splitting by Route
Already implemented via Next.js automatic code splitting ✅

### 2. Prefetch Critical Routes
```tsx
import Link from 'next/link';

<Link href="/calculators/mortgage" prefetch={true}>
  Mortgage Calculator
</Link>
```

### 3. Implement Service Worker for Caching
```tsx
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/calculators/mortgage',
        '/styles/globals.css',
      ]);
    })
  );
});
```

### 4. Optimize Bundle Size
```bash
# Analyze bundle
ANALYZE=true npm run build

# Check for duplicate dependencies
npx npm-check -u

# Remove unused dependencies
npm prune
```

---

## Font Optimization

Add to `next.config.js`:
```javascript
const nextConfig = {
  // ... existing config
  optimizeFonts: true,
  experimental: {
    optimizeCss: true, // Enable CSS optimization
  },
}
```

Use Next.js font optimization:
```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function RootLayout({ children }) {
  return (
    <html className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

---

## Target Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| LCP | < 2.5s | TBD | 🔍 Run audit |
| FID/INP | < 100ms | TBD | 🔍 Run audit |
| CLS | < 0.1 | TBD | 🔍 Run audit |
| Performance Score | 90+ | TBD | 🔍 Run audit |
| Accessibility | 90+ | TBD | 🔍 Run audit |
| Best Practices | 90+ | TBD | 🔍 Run audit |
| SEO | 90+ | TBD | 🔍 Run audit |

---

## Next Steps

1. **Immediate (This Week)**
   - Run Lighthouse audit on production site
   - Implement `next/image` on all calculator pages
   - Add loading skeletons

2. **Short-term (This Month)**
   - Set up Vercel Speed Insights
   - Optimize all images to WebP
   - Implement lazy loading for charts
   - Add debouncing to calculator inputs

3. **Long-term (Next Quarter)**
   - Implement service worker for offline support
   - Set up automated Lighthouse CI in deployment pipeline
   - Create performance budget and monitoring
   - A/B test performance optimizations

---

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

---

## Support

For questions or issues with Core Web Vitals optimization:
1. Check Next.js documentation
2. Run Lighthouse and analyze the report
3. Use Chrome DevTools Performance tab
4. Monitor Vercel Analytics dashboard
