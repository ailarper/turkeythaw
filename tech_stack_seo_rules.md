### ROLE & OBJECTIVE
Act as an elite Frontend Architect. Build the complete `TurkeyThaw` landing page in `app/page.tsx` using Next.js (App Router), Tailwind CSS, `framer-motion`, and `lucide-react`, combining the smooth scroll-driven transitions of `duna.com` with the 4 cleaned visual assets located in `public/assets/`.

### 1. ASSET ORDER & DIRECTORY (`public/assets/`)
Use the 4 existing cleaned screens in this exact vertical sequence:
1. `/assets/planner.png` — Section 1: Hero Planner
2. `/assets/dashboard.png` — Section 2: Backwards Thaw Calculator & Holiday Gear
3. `/assets/guide.png` — Section 3: 165°F USDA Temperature & Safety Guide
4. `/assets/timeline.png` — Section 4: Cook-Day Battle Board Timeline & Footer

### 2. SCROLL ARCHITECTURE & DUNA.COM MOTION DYNAMICS
- **Page Canvas:** Match the exact warm cream surface (`bg-[#FAF9F5]`) so there are zero harsh seams between the 4 sections[cite: 8].
- **Single Floating Glass Navbar (Fixed Top):** Since the internal navbars have been removed from the images, render ONE unified sticky glassmorphic navbar at the top (`fixed top-5 inset-x-0 mx-auto max-w-5xl z-50 backdrop-blur-md bg-[#FAF9F5]/80 border border-[#E6E4DD] rounded-full px-6 py-3 flex items-center justify-between shadow-sm`).
  - Left: `TurkeyThaw` brand logo[cite: 2, 4, 6].
  - Center: Smooth-scroll links (`Calculator` -> `#dashboard`, `Prep Kit` -> `#dashboard`, `USDA Guide` -> `#guide`, `Timeline` -> `#timeline`)[cite: 2, 4, 6].
  - Right: Dark pill CTA button (`Plan dinner →` scrolling smoothly to `#dashboard`)[cite: 2, 4, 6].
- **Scroll-Driven Section Transitions (`framer-motion`):**
  - Wrap each of the 4 sections in a scroll-tracked motion container (`useScroll`, `useTransform`, `useSpring` with `stiffness: 100, damping: 20`).
  - **Section 1 (`planner.png`):** Full-width hero reveal with subtle parallax fade-out at the bottom edge into `#FAF9F5`[cite: 8] and an interactive floating CTA trigger that smoothly scrolls to `#dashboard`.
  - **Sections 2, 3, and 4 (`dashboard.png`, `guide.png`, `timeline.png`):** Apply Duna-style cinematic scroll entrance (`scale: [0.96, 1]`, `opacity: [0.35, 1]`, `y: [40, 0]`) as each section enters the viewport, with soft top/bottom gradient feathering so consecutive sections blend seamlessly into the `#FAF9F5` canvas[cite: 8].

### 3. TECHNICAL RULES
- Add `"use client"` at the top of `app/page.tsx`.
- Enable `scroll-smooth` behavior for all anchor links.
- Render images crisp and uncropped (`w-full max-w-[1440px] mx-auto h-auto block select-none`) with zero duplicate text overlays on top of the artwork.
- Output the complete, ready-to-run `app/page.tsx` file with zero placeholders.