# Google Search Console Setup Guide

> **Site Domain**: `https://calculatorhub.space`
> **Sitemap URL**: `https://calculatorhub.space/sitemap.xml`

---

## Step 1: Create/Access Google Search Console Account

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Sign in with your Google account
3. Click **"Add property"** button

---

## Step 2: Add Your Property

### Option A: Domain Property (Recommended)
1. Select **"Domain"** option
2. Enter `calculatorhub.space` (without https://)
3. Click **Continue**
4. You'll need to verify via DNS record with your domain registrar

### Option B: URL Prefix Property
1. Select **"URL Prefix"** option
2. Enter `https://calculatorhub.space`
3. Click **Continue**
4. Choose **HTML tag** verification method

---

## Step 3: Verify Site Ownership

### For HTML Tag Verification (Recommended for this project):

1. Copy the verification code from Google (it looks like: `abc123xyz...`)
2. Open `lib/seo-config.ts` in your project
3. Find this section and add your code:

```typescript
verification: {
  google: 'YOUR_CODE_HERE',  // <-- Paste your code here
  bing: '',
  yandex: '',
},
```

4. Deploy your site to Vercel
5. Go back to Search Console and click **Verify**

### For DNS Verification (if using Domain property):
1. Copy the TXT record from Google
2. Go to your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare)
3. Add a TXT record with the provided value
4. Wait for DNS propagation (up to 48 hours, usually faster)
5. Click **Verify** in Search Console

---

## Step 4: Submit Your Sitemap

1. In Search Console, go to **Sitemaps** (left sidebar)
2. Enter `sitemap.xml` in the "Add a new sitemap" field
3. Click **Submit**
4. Status should show "Success" after processing

**Your sitemap includes:**
- 75 URLs total
- 7 static pages (home, about, blog, contact, privacy, terms, cookies)
- 3 blog posts
- 65 calculator pages

---

## Step 5: Set Up Email Alerts

1. Go to **Settings** (gear icon, bottom left)
2. Click on **Email preferences**
3. Enable:
   - ✅ Critical issues (mandatory)
   - ✅ Security issues
   - ✅ Coverage issues
   - ✅ Enhancement issues
4. Click **Save**

---

## Step 6: Monitor Core Web Vitals

1. In Search Console, go to **Core Web Vitals** (left sidebar)
2. View both Mobile and Desktop reports
3. Look for any URLs marked as "Poor" or "Needs Improvement"

### Key Metrics to Monitor:
| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤2.5s | 2.5s - 4s | >4s |
| **INP** (Interaction to Next Paint) | ≤200ms | 200ms - 500ms | >500ms |
| **CLS** (Cumulative Layout Shift) | ≤0.1 | 0.1 - 0.25 | >0.25 |

---

## Step 7: Check for Crawl Errors

1. Go to **Pages** (left sidebar, under Indexing)
2. Review the "Why pages aren't indexed" section
3. Common issues to fix:
   - 404 errors - Fix broken links
   - Redirect errors - Fix redirect chains
   - Blocked by robots.txt - Update robots.ts if needed
   - Crawled but not indexed - Improve content quality

---

## Step 8: Request Indexing for Important Pages

1. Go to **URL Inspection** (top search bar)
2. Enter your homepage: `https://calculatorhub.space`
3. Click **Request Indexing**
4. Repeat for key pages:
   - `/calculators/mortgage`
   - `/calculators/compound-interest`
   - `/calculators/investment`
   - `/blog/2025-mortgage-rate-outlook`

---

## Step 9: Link Google Analytics (Optional but Recommended)

1. Go to **Settings** → **Associations**
2. Click **Associate** next to Google Analytics
3. Select your GA4 property
4. This allows you to see Search Console data in Analytics

---

## Verification Checklist

After setup, verify these items in Search Console:

- [ ] Property is verified (green checkmark)
- [ ] Sitemap submitted and processed
- [ ] No critical coverage errors
- [ ] Core Web Vitals are "Good"
- [ ] Email alerts enabled
- [ ] Homepage is indexed

---

## Troubleshooting

### Verification Failed?
- Make sure the meta tag is in the `<head>` section
- Check that the site is deployed after adding the code
- Clear cache and try again

### Sitemap Not Found?
- Verify the URL: `https://calculatorhub.space/sitemap.xml`
- Make sure the site is deployed
- Check robots.txt allows access

### Pages Not Getting Indexed?
- Content may be too similar to existing pages
- Improve unique content and value
- Add more internal links to important pages
- Request indexing manually

---

## Quick Reference

| Item | Value |
|------|-------|
| Search Console URL | https://search.google.com/search-console |
| Your Site | https://calculatorhub.space |
| Sitemap URL | https://calculatorhub.space/sitemap.xml |
| Verification File | `lib/seo-config.ts` |
| Total Pages | 75 |

---

**Need help?** Google's official guide: [Search Console Help](https://support.google.com/webmasters/)
