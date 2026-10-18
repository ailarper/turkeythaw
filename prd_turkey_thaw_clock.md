# PRD.md: TurkeyThawClock (Single-Page Micro-Tool)

## 1. Product Overview
* **One-Sentence Job:** Enter your turkey weight and Thanksgiving/Christmas dinner time to get the exact day and hour you must move the turkey from the freezer to the fridge.
* **Target Keywords:** "how long to thaw a turkey", "turkey thawing calculator", "when to put turkey in fridge" (~700k searches/mo in November).
* **Design Niche (`DESIGN.md`):** Category 2 — *E-commerce & Food Delivery* (Warm off-white/stone background `bg-stone-50`, appetite warm orange `#f97316` accents, high-contrast black primary titles, unified `rounded-2xl` cards).

## 2. What Is Broken About Incumbents (Our Edge)
Butterball buries the answer inside brand fluff, and the USDA gives a raw table that forces users to do mental calendar math. Neither says plainly: **"Move it to the fridge on Sunday, Nov 22 at 6:00 PM."** Our tool gives that exact timestamp immediately.

## 3. Core Inputs (Co-located & Instant)
1. **Turkey Weight (lb or kg toggle):**
   * Quick-select pill chips for common weights: `10 lb`, `12 lb`, `15 lb`, `18 lb`, `20 lb`, `24 lb` + custom slider/number input.
2. **Target Meal Date & Cooking Start Time:**
   * Defaults automatically to **Thursday, November 26, 2026 at 12:00 PM** (with quick pills for `Thanksgiving Day`, `Christmas Day`, or custom date/time picker).
3. **Prep Buffer Toggle:**
   * Optional checkbox: *"Add 12–24 hours for dry-brining / seasoning in fridge"*.

## 4. Calculation Logic (Public USDA Rule)
* **Fridge Thawing (Recommended):** 24 hours for every 4.5 lbs (approx. 5.33 hours per lb) at 40°F (4°C).
  * Formula: `ThawHours = (WeightInLbs / 4.5) * 24 + BrineBufferHours`.
  * Subtract `ThawHours` from `CookingStartTime` to get the exact `StartThawingTimestamp`.
* **Cold Water Thawing (Emergency Backup):** 30 minutes per pound (submerged in cold tap water, changing water every 30 mins).
  * Show this automatically as a secondary rescue card if `StartThawingTimestamp` is already in the past!

## 5. Primary Output (3-Tier Visual Hierarchy from `DESIGN.md`)
* **Tier 1 (Primary Verdict):** Huge bold callout: e.g., `"Put in the fridge: Monday, Nov 23 at 8:00 AM"`.
* **Tier 2 (Weighted Secondary Metrics):** Total thaw duration (e.g., `"3 days, 4 hours in fridge"`) + countdown timer if the date is approaching.
* **Tier 3 (Dimmed Metadata):** Safe fridge storage note (*"Once thawed, a turkey is safe in the fridge for up to 2 days before cooking — USDA"*).

## 6. Monetization & Affiliate Integration
* **Contextual Affiliate Card:** Placed right below the verdict: *"Don't guess when it's done cooking. The USDA safe internal temp is 165°F."* -> Link to **ThermoWorks Thermapen ONE** or **Amazon Leave-In Meat Probe**.