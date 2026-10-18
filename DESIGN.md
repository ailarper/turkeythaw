# DESIGN.md: Design System Guidelines for AI Coding Agents

> **Role & Purpose:** Senior UX/UI Architect guide derived from the analysis of *4 Levels of UI/UX Design (The Gap Is HUGE)* by uxpeak. This document defines rule-based UI/UX patterns, mistake preventions, color systems, and pre-delivery checks for AI agents generating frontend code.

---

## 1. $50K vs. $300K Core Pillars

| Pillar | $50K Junior Pattern | $300K Staff/Senior Pattern | Architectural Impact |
| :--- | :--- | :--- | :--- |
| **Visual Hierarchy** | Flat typographic scales (e.g., 13px titles with 11.5px secondary details on a single gray row) [2]; competing visual elements (e.g., food category photos directly competing with food item photos) [4]. | Decoupled UI structures (photo on top, details underneath) [5]; strong weight/color contrast (bold title, weighted ratings, dimmed secondary metadata) [3]; quiet background tokens [5]. | Reduces cognitive load by establishing an immediate scanning anchor rather than forcing line-by-line reading [3]. |
| **Typography Scale** | Compressed, uniform font sizes across different semantic levels with no visual hierarchy [2]. | Strict 3-tier typographic progression: bold primary headers, weighted secondary badges/ratings, and muted tertiary text [3]. | Enables instant screen scanning and clear reading precedence [3]. |
| **Whitespace & Padding** | Above-the-fold cramming (e.g., 56px tiny photos squeezed to show 6 items without scrolling) [1, 2]. | Generous padding, full-width card layouts, and spacious content containers [3, 4]. | Capitalizes on natural user scrolling behavior while giving appetite/hero assets full visual impact [1, 2, 4]. |
| **Borders & Shadows** | Conflicting shape languages on the same screen (e.g., 4px card corners mixed with 50% circular icons) [2]. | Singular, uniform border-radius hierarchy (e.g., consistent rounded corners across cards, buttons, and inputs) [3]; quiet background panels [5]. | Eliminates visual friction and creates a cohesive design system across all interface components [3, 5]. |

---

## 2. Mistakes & AI Remediation

### Mistake 1: Above-the-Fold Content Cramming & Asset Shrinkage
* **Observed Failure:** Shrinking card images to 56px to force 6 items above the fold, destroying visual appeal and scannability [1, 2].
* **AI Prevention Rule:** Never compromise media aspect ratios or card padding just to maximize item count above the fold; assume users naturally scroll [2].
* **Actionable CSS/Tailwind Fix:**
  ```tsx
  /* BAD ($50K): Crammed 56px fixed square */
  <div class="flex h-14 w-14 rounded-sm border p-1">...</div>

  /* GOOD ($300K): Full-width or wide aspect ratio hero card */
  <div class="w-full overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md">
    <img class="h-48 w-full object-cover" src="..." alt="Hero content" />
    <div class="p-4 space-y-2">...</div>
  </div>
  ```

### Mistake 2: Fragmented Multi-Page Navigation for Simple Filters
* **Observed Failure:** Hiding filter options behind multi-page navigation drills (7 separate taps to select 2 filters), causing loss of context and zero feedback [9, 10].
* **AI Prevention Rule:** Keep interactive filters co-located with result sets using modal sheets, drawers, or horizontal filter chips; never navigate away from the primary view for basic inputs [3, 11].
* **Actionable CSS/Tailwind Fix:**
  ```tsx
  /* BAD ($50K): Separate page navigation link */
  <a href="/filters/price" class="block py-3">Price Range ></a>

  /* GOOD ($300K): Bottom Sheet / Drawer overlay with scrollable filter chips */
  <div class="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-3xl bg-white p-6 shadow-2xl transition-transform">
    <div class="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
      <button class="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
        <span>3+ Beds</span>
        <span class="rounded-full bg-slate-700 px-1.5 py-0.5 text-xs">459</span>
      </button>
    </div>
  </div>
  ```

### Mistake 3: Flat Visual Hierarchy & Uniform Metadata Gray-outs
* **Observed Failure:** Title (13px) and secondary details (11.5px) sharing the same line and gray color tint, making text impossible to scan [2].
* **AI Prevention Rule:** Enforce strict typographic contrast: Title must be visually prominent (`font-bold`, dark neutral), secondary metadata weighted, and tertiary details dimmed [3].
* **Actionable CSS/Tailwind Fix:**
  ```tsx
  /* BAD ($50K): Monotone single-line text */
  <div class="text-xs text-gray-500">Restaurant Name • 4.5 • $$ • 20 mins</div>

  /* GOOD ($300K): Distinct 3-tier visual hierarchy */
  <div class="space-y-1">
    <h3 class="text-lg font-bold text-slate-900 tracking-tight">Restaurant Name</h3>
    <div class="flex items-center gap-2 text-sm">
      <span class="flex items-center gap-1 font-semibold text-amber-600">★ 4.8</span>
      <span class="text-slate-300">•</span>
      <span class="text-slate-600">20-30 min</span>
      <span class="text-slate-300">•</span>
      <span class="text-slate-500">$5 delivery</span>
    </div>
  </div>
  ```

### Mistake 4: Conflicting Corner Radii & Mixed Shape Languages
* **Observed Failure:** Mixing 4px card corners with circular 50% category icons on the same screen, creating a mismatched shape language [2].
* **AI Prevention Rule:** Define and enforce a singular `border-radius` variable family across all UI components (containers, cards, buttons, badges) [3].
* **Actionable CSS/Tailwind Fix:**
  ```tsx
  /* BAD ($50K): Mixed radii */
  <div class="rounded-sm border p-2">
    <img class="rounded-full w-10 h-10" />
  </div>

  /* GOOD ($300K): Unified shape system (e.g., rounded-2xl family) */
  <div class="rounded-2xl border border-slate-100 bg-slate-50 p-3">
    <div class="flex items-center justify-center rounded-xl bg-white p-2.5 shadow-sm">
      <Icon class="h-6 w-6 text-slate-700" />
    </div>
  </div>
  ```

### Mistake 5: Dumb Action Buttons & Blind Selection Controls
* **Observed Failure:** Generic "Show Homes" or "Submit" buttons without result feedback [10]; steppers (+/- buttons) that force step-by-step clicks and conceal broader options [12, 13].
* **AI Prevention Rule:** CTAs must display predictive result counts (e.g., "Show 41 homes") [12]; selection controls must present all options as visible pills with live counts or `+` range support [13, 15].
* **Actionable CSS/Tailwind Fix:**
  ```tsx
  /* BAD ($50K): Blind submit button */
  <button class="w-full bg-blue-500 py-2 text-white">Show Homes</button>

  /* GOOD ($300K): Context-aware predictive CTA */
  <button class="flex w-full items-center justify-between rounded-xl bg-slate-900 px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800">
    <span>Apply Filters</span>
    <span class="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">Show 41 matches</span>
  </button>
  ```

---

## 3. Color Guide by Niche

```
+-----------------------------------------------------------------------------------+
| SaaS / Dev Tools        | Dark/Cool Neutrals (Slate-950/900) + Electric Indigo/Emerald |
| E-commerce / Food       | Off-White/Stone Backgrounds + Appetite Accents (Warm Orange) |
| Wellness / Lifestyle    | Organic Taupe/Sage Green + Soft Ambient Low-Strain Contrast |
| Finance / High-Trust    | Deep Trust Navy/Slate + High-Contrast Delta Badges (Emerald) |
+-----------------------------------------------------------------------------------+
```

### 1. SaaS & Developer Micro-tools
* **Palette:** Slate/Zinc dark neutrals (`#0f172a`, `#1e293b`), Electric Indigo accent (`#6366f1`), Emerald status indicator (`#10b981`), fine structural borders (`border-slate-800`).
* **Background Tones:** Deep cool dark (`bg-slate-950` / `bg-slate-900`) or ultra-clean developer gray (`bg-slate-50`).
* **Contrast Rules:** WCAG AAA text contrast, monospaced numeric/code callouts (`font-mono`), subtle background grid patterns.

### 2. E-commerce & Food Delivery
* **Palette:** Vibrant appetite accents (Warm Orange `#f97316`, Coral Red `#ef4444`), warm neutral backgrounds (`#fafaf9`), neutral photo containers (`#f5f5f4`).
* **Background Tones:** Soft warm off-white (`bg-stone-50` / `bg-white`) ensuring product photography serves as the hero color anchor without frame competition [4].
* **Contrast Rules:** Neutral frame structures, high-contrast black primary titles, soft tint secondary pill badges (`bg-orange-100 text-orange-800`).

### 3. Wellness & Lifestyle
* **Palette:** Organic botanical tones (Sage Green `#84cc16` / `#10b981`, Warm Beige `#f5f5f4`, Soft Amber `#fef3c7`).
* **Background Tones:** Warm cream, off-white, or gentle tinted green backgrounds (`bg-stone-100`, `bg-emerald-50/30`).
* **Contrast Rules:** Gentle low-strain contrast ratios, rounded pill surfaces, soft ambient drop shadows (`shadow-sm` / `shadow-emerald-900/5`).

### 4. Finance & High-Trust Apps
* **Palette:** Deep trust navy blue (`#1e3a8a`, `#0284c7`), solid gain emerald (`#059669`), alert crimson (`#dc2626`), structured slate (`#334155`).
* **Background Tones:** High-clarity light backgrounds (`bg-slate-50` / `bg-white`) or secure dark surfaces (`bg-slate-900`).
* **Contrast Rules:** Ultra-crisp data hierarchy, bold financial values, color-coded change badges (`bg-emerald-50 text-emerald-700 border border-emerald-200`), no distracting ambient gradients over numeric metrics.

---

## 4. AI UI Checklist

Before delivering frontend UI code, an AI agent must run through these 6 checks:

- [ ] **1. Scannable Typographic Hierarchy:** Does the primary title dominate with bold weight and dark color, while secondary metadata uses scaled-down font size and dimmed text tokens [2, 3]?
- [ ] **2. Unified Shape Language:** Are all container cards, buttons, input fields, and icon wrappers using a single consistent border-radius rule (e.g., `rounded-xl` / `rounded-2xl`) throughout [2, 3]?
- [ ] **3. Content-First Layout Space:** Is the card asset/photo given ample space (`aspect-video` or `w-full`) without cramming elements above the fold [1, 3, 4]?
- [ ] **4. Co-located Controls & Sheet Overlays:** Are multi-step actions or filters kept co-located with the results view using bottom sheets or horizontal pill scroll rows instead of separate page navigation drills [9, 11]?
- [ ] **5. Predictive CTAs & Live Counts:** Do action buttons and choice pills display dynamic, real-time result counts (e.g., "Show 41 homes", "3+ Beds (459)") before the user executes an action [12, 13, 15]?
- [ ] **6. Niche Color Alignment & Contrast:** Does the palette strictly match the industry domain (e.g., dark slate for dev tools, warm off-white for e-commerce, navy for finance) with WCAG AA/AAA compliant text contrast [4]?
