# SEO onboarding baseline — 29 August 2026

## Google Search Console

- Domain property: `sc-domain:balixperience.com`
- Ownership: verified automatically through the existing DNS TXT record
- Sitemap submitted: `https://balixperience.com/sitemap.xml`
- Submission response: accepted successfully
- Live URL test: available to Google and eligible to be indexed
- Initial sitemap report: processing has not completed yet and temporarily shows `Couldn't fetch`; direct Googlebot and browser requests both return HTTP 200 with valid XML

## URL inspection

| URL | Initial status | Action |
| --- | --- | --- |
| `https://balixperience.com/` | On Google | No repeat request sent |
| `https://balixperience.com/tours` | Unknown to Google | Added to priority crawl queue |
| `https://balixperience.com/tours/private-car-charter-bali` | Unknown to Google | Added to priority crawl queue |
| `https://balixperience.com/tours/ubud-temples-rice-terraces` | Unknown to Google | Added to priority crawl queue |
| `https://balixperience.com/plan` | Unknown to Google | Added to priority crawl queue |

## Live technical checks

- Production deployment: `215f9d5db7187fb81f1863be4766a06d46a4b2f9`
- `robots.txt`: HTTP 200; allows public pages and excludes `/admin/`, `/api/`, and `/checkout/`
- Sitemap: HTTP 200, XML content type, 41 current public URLs, and no admin, API, checkout, or confirmation URLs
- Canonicals: present and absolute on the homepage, tour catalogue, plan page, static information pages, and representative tour pages
- Tour structured data: valid server-rendered `Product`/`Offer` and `BreadcrumbList` graphs
- Private routes: admin is `noindex, nofollow`; checkout is `noindex`
- Vercel production build: successful
- Production runtime errors after deployment: none observed

## Initial performance status

Search Console is still processing performance and Core Web Vitals data for the newly verified property, so there is no mobile field-data baseline yet. Record the first 28-day Core Web Vitals values after Google has collected enough real visits. A lab performance trace was not recorded in this pass because the Chrome DevTools performance service is not configured in the current workspace.

## Follow-up

1. Recheck the sitemap report after Google finishes processing it.
2. Recheck the four requested URLs after at least seven days before treating delayed indexing as a defect.
3. Record mobile Core Web Vitals when Search Console has sufficient field data.
4. Complete the deferred favicon, manifest icons, branded social image, and final metadata wording after the brand design is approved.

