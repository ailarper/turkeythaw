# TECH_STACK.md: Architecture, SEO & Constraints for AI Agents

> **Role:** Strict technical specification for building zero-cost, high-RPM, single-page web micro-tools. Every architectural decision must prioritize 100% client-side execution, instant reactivity, and organic SEO discoverability.

## 1. Core Stack
* **Framework:** Next.js (App Router, TypeScript) or lightweight Vite + React.
* **Styling:** Tailwind CSS (strictly adhering to `DESIGN.md` tokens, typography scales, and shape families).
* **Icons:** `lucide-react` (clean, consistent stroke width `1.75px` or `2px`).
* **Deployment Target:** Vercel (Free Tier) / Static Export where applicable.

## 2. Zero-Cost & Serverless Constraints
* **No Paid Backends/DBs:** Zero database costs, zero user authentication/logins.
* **100% Reactive Client State:** Calculations must happen instantaneously on input change (`onChange` / reactive state) without requiring a "Submit" button or page reload.
* **Dependency Diet:** Do not install heavy UI libraries or moment.js. Use native `Intl.DateTimeFormat`, `Date`, or lightweight utilities.

## 3. SEO & High-RPM Monetization Scaffolding
Every single-page tool MUST automatically include the following on the page:
1. **Dynamic Metadata:** Exact-match target keyword in `<title>`, `<h1>`, and meta description.
2. **JSON-LD Structured Data:** Inject valid `WebApplication` and `FAQPage` schema.org JSON-LD scripts in the document head so Google displays rich snippets.
3. **Above-the-Fold Verdict First:** The interactive tool and the primary verdict card must appear immediately above the fold without bloated intro paragraphs.
4. **Native Affiliate Callout Slot:** A non-intrusive, high-converting contextual affiliate card positioned directly underneath the final verdict card.
5. **Ad-Slot Placeholders:** Clean, CLS-safe container placeholders (`min-h-[90px]` or `min-h-[250px]`) reserved for AdSense/Mediavine display units.
6. **Semantic FAQ Accordion (Bottom of Page):** 4–5 concise, high-intent Q&As targeting long-tail keywords to capture Google "People Also Ask" traffic.