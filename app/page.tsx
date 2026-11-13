"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Lenis from "lenis";
import { buildGoogleCalendarUrl, downloadIcsFile, buildFullTurkeyScheduleEvents, CalendarEvent } from "@/lib/calendar";
import { downloadPdfCheatSheet } from "@/lib/pdf";
import { CheatSheetModal } from "@/components/CheatSheetModal";
import {
  WEIGHT_PRESETS,
  ThawMethod,
  DEFAULT_TARGET_DATE,
  DEFAULT_DINNER_TIME,
  DINNER_TIME_OPTIONS,
  buildThawSchedule,
  formatScheduleDate,
  formatClockTime,
  formatTimelineTime,
  parseLocalDateTime,
} from "@/lib/schedule";

const TARGET_TIME_OPTIONS = [
  { value: "11:00", label: "Thanksgiving Day, 11:00 AM" },
  { value: "12:00", label: "Thanksgiving Day, 12:00 PM" },
  { value: "13:00", label: "Thanksgiving Day, 1:00 PM" },
  { value: "14:00", label: "Thanksgiving Day, 2:00 PM" },
  { value: "15:00", label: "Thanksgiving Day, 3:00 PM" },
  { value: "16:00", label: "Thanksgiving Day, 4:00 PM" },
  { value: "17:00", label: "Thanksgiving Day, 5:00 PM" },
  { value: "18:00", label: "Thanksgiving Day, 6:00 PM" },
];

const REMINDER_CALENDAR_EVENT: CalendarEvent = {
  title: "🦃 Turkey Prep & Food Safety Reminder",
  description:
    "Critical USDA reminders: 1) Verify internal temperature reaches 165°F in thigh, wing, and innermost breast using instant-read thermometer. 2) Never leave turkey at room temp (40-140°F) for >2 hrs. 3) Rest cooked turkey 40 min before carving.",
  start: new Date(2026, 10, 26, 8, 0), // Thanksgiving Morning Nov 26, 2026
  end: new Date(2026, 10, 26, 9, 0),
  location: "Kitchen",
};

interface EmergencyProtocol {
  id: number;
  title: string;
  badge: string;
  top: string;
  height: string;
  answer: string;
  renderAnswer?: () => React.ReactNode;
  actionText?: string;
  actionTarget?: string;
}

const EMERGENCY_PROTOCOLS: EmergencyProtocol[] = [
  {
    id: 1,
    title: "Morning Panic: Still Frozen?",
    badge: "Cold Water Rescue",
    top: "45.5%",
    height: "11.5%",
    answer:
      "Do NOT leave turkey on the counter! Keep it sealed in its leakproof wrapper and submerge fully in a cold tap water bath (≤40°F). Change the water every 30 minutes to maintain safety. Thawing takes approx. 30 minutes per pound (~8 hours for 16 lbs). If time runs out, roasting from partially frozen is 100% safe (+25-50% cooking time).",
    renderAnswer: () => (
      <span>
        Do NOT leave turkey on the counter! Keep it sealed in its leakproof wrapper and submerge fully in a cold tap water bath (<strong className="font-bold text-[#1B1A18] tabular-nums">≤40°F</strong>). Change the water every <strong className="font-bold text-[#1B1A18] tabular-nums">30 minutes</strong> to maintain safety. Thawing takes approx. <strong className="font-bold text-[#1B1A18] tabular-nums">30 min/lb</strong> (~<strong className="font-bold text-[#1B1A18] tabular-nums">8 hours</strong> for <strong className="font-bold text-[#1B1A18] tabular-nums">16 lbs</strong>). If time runs out, roasting from partially frozen is <strong className="font-bold text-[#1B1A18] tabular-nums">100% safe</strong> (+<strong className="font-bold text-[#1B1A18] tabular-nums">25–50%</strong> cooking time).
      </span>
    ),
    actionText: "Configure Cold Water Bath ↑",
    actionTarget: "dashboard",
  },
  {
    id: 2,
    title: "Can You Roast Fully Frozen?",
    badge: "USDA Verified",
    top: "59.5%",
    height: "11.5%",
    answer:
      "Yes! The USDA confirms it is completely safe to roast a turkey directly from the frozen state. It takes roughly 50% longer than a thawed bird. Roast at 325°F. At hour 2–2.5, use tongs to remove the softened giblet bag from the cavity, season the skin, and verify 165°F in the thickest part of the thigh before serving.",
    renderAnswer: () => (
      <span>
        Yes! The USDA confirms it is completely safe to roast a turkey directly from the frozen state. It takes roughly <strong className="font-bold text-[#1B1A18] tabular-nums">50%</strong> longer than a thawed bird. Roast at <strong className="font-bold text-[#1B1A18] tabular-nums">325°F</strong>. At hour <strong className="font-bold text-[#1B1A18] tabular-nums">2–2.5</strong>, use tongs to remove the softened giblet bag from the cavity, season the skin, and verify <strong className="font-bold text-[#1B1A18] tabular-nums">165°F</strong> in the thickest part of the thigh before serving.
      </span>
    ),
    actionText: "View Roasting Timeline ↓",
    actionTarget: "timeline",
  },
  {
    id: 3,
    title: "Safe Fridge Holding Window",
    badge: "1–2 Days Max",
    top: "73.5%",
    height: "11.5%",
    answer:
      "Once completely thawed in a refrigerator maintaining ≤40°F, your raw turkey can remain safely refrigerated for an additional 1 to 2 days before cooking. Always keep the bird on the lowest shelf in a rimmed roasting pan or sheet tray to prevent any raw juices from dripping onto other food.",
    renderAnswer: () => (
      <span>
        Once completely thawed in a refrigerator maintaining <strong className="font-bold text-[#1B1A18] tabular-nums">≤40°F</strong>, your raw turkey can remain safely refrigerated for an additional <strong className="font-bold text-[#1B1A18] tabular-nums">1 to 2 days</strong> before cooking. Always keep the bird on the lowest shelf in a rimmed roasting pan or sheet tray to prevent any raw juices from dripping onto other food.
      </span>
    ),
  },
];

interface FaqItem {
  id: number;
  question: string;
  left: string;
  top: string;
  width: string;
  height: string;
  answer: string;
  renderAnswer?: () => React.ReactNode;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 1,
    question: "How long can a thawed bird stay in the fridge?",
    left: "23.6%",
    top: "69.8%",
    width: "36.0%",
    height: "6.8%",
    answer:
      "1–2 days in the refrigerator at or below 40°F (4°C) before cooking.",
    renderAnswer: () => (
      <span>
        <strong className="font-bold text-[#1B1A18] tabular-nums">1–2 days</strong> in the refrigerator at or below <strong className="font-bold text-[#1B1A18] tabular-nums">40°F (4°C)</strong> before cooking.
      </span>
    ),
  },
  {
    id: 2,
    question: "Can I brine while still thawing?",
    left: "60.4%",
    top: "69.8%",
    width: "36.0%",
    height: "6.8%",
    answer:
      "Wet brining should only be done during the final 12 hours once the outer meat has softened enough to absorb seasonings. For dry brining, rub kosher salt and herbs onto skin 24–48 hours before roasting while refrigerated.",
    renderAnswer: () => (
      <span>
        Wet brining should only be done during the final <strong className="font-bold text-[#1B1A18] tabular-nums">12 hours</strong> once the outer meat has softened enough to absorb seasonings. For dry brining, rub kosher salt and herbs onto skin <strong className="font-bold text-[#1B1A18] tabular-nums">24–48 hours</strong> before roasting while refrigerated.
      </span>
    ),
  },
  {
    id: 3,
    question: "Why rest for 40 minutes before carving?",
    left: "23.6%",
    top: "77.2%",
    width: "36.0%",
    height: "6.8%",
    answer:
      "Allows internal juices to redistribute evenly throughout the meat before carving.",
    renderAnswer: () => (
      <span>
        Allows internal juices to redistribute evenly throughout the meat before carving.
      </span>
    ),
  },
  {
    id: 4,
    question: "What if my oven runs hot or cold?",
    left: "60.4%",
    top: "77.2%",
    width: "36.0%",
    height: "6.8%",
    answer:
      "Use an internal probe thermometer to track meat temperature, not just the oven dial.",
    renderAnswer: () => (
      <span>
        Use an internal probe thermometer to track meat temperature, not just the oven dial.
      </span>
    ),
  },
];

interface HotspotProps {
  label: string;
  left: string;
  top: string;
  width: string;
  height: string;
  onClick?: () => void;
  href?: string;
  isExternal?: boolean;
  rel?: string;
}

/**
 * Pure 100% transparent hit area with accessible sr-only labeling.
 * Renders ZERO visible duplicate text, colored fills, borders, or rings over the artwork.
 */
function Hotspot({
  label,
  left,
  top,
  width,
  height,
  onClick,
  href,
  isExternal = false,
  rel,
}: HotspotProps) {
  const commonStyle: React.CSSProperties = {
    position: "absolute",
    left,
    top,
    width,
    height,
    zIndex: 20,
    cursor: "pointer",
    display: "block",
    backgroundColor: "transparent",
  };

  const invisibleClass =
    "bg-transparent hover:bg-transparent active:bg-transparent focus:outline-none ring-0 border-0 outline-none select-none";

  const content = <span className="sr-only">{label}</span>;

  if (href) {
    const isAffiliate = href.includes("thermoworks.com") || href.includes("walmart.com");
    const computedRel = rel || (isAffiliate ? "nofollow sponsored noopener noreferrer" : "noopener noreferrer");

    return (
      <a
        href={href}
        style={commonStyle}
        className={invisibleClass}
        aria-label={label}
        {...(isExternal ? { target: "_blank", rel: computedRel } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      style={commonStyle}
      className={invisibleClass}
      aria-label={label}
    >
      {content}
    </button>
  );
}

function ClocheLogoIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="18" cy="4.5" r="2.5" fill="#EA580C" stroke="#1B1A18" strokeWidth="2" />
      <path d="M5 20C5 12.268 10.8203 6 18 6C25.1797 6 31 12.268 31 20H5Z" fill="#EA580C" stroke="#1B1A18" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9.5 17C10.5 12.5 13.8 9.5 17.5 9" stroke="#FDBA74" strokeWidth="2" strokeLinecap="round" />
      <rect x="3" y="20" width="30" height="3.5" rx="1.75" fill="#FB923C" stroke="#1B1A18" strokeWidth="2" />
    </svg>
  );
}

/**
 * Full-Bleed Section Container
 * - Zero blur, zero GPU downsampling transforms (opacity: 1, scale: 1 static)
 * - Zero top/bottom gradient overlay masks (no washing out text)
 * - Full viewport bleed (w-full max-w-none) eliminating left/right vertical cut lines
 */
function FullBleedSection({
  id,
  src,
  alt,
  children,
}: {
  id: string;
  src: string;
  alt: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="relative w-full max-w-none overflow-hidden leading-none select-none my-0"
    >
      <div className="relative w-full max-w-none">
        <img
          src={src}
          alt={alt}
          className="w-full max-w-none h-auto block select-none pointer-events-none"
        />
        {children}
      </div>
    </section>
  );
}

export default function TurkeyThawPage() {
  const [activeSection, setActiveSection] = useState<string>("planner");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Dynamic Interactive Calculator State
  const [selectedWeight, setSelectedWeight] = useState<number>(16);
  const [selectedMethod, setSelectedMethod] = useState<ThawMethod>("refrigerator");
  const [targetTime, setTargetTime] = useState<string>("13:00");
  const [dinnerTime, setDinnerTime] = useState<string>(DEFAULT_DINNER_TIME);

  // Interactive Accordion State (Section 3 & Section 4)
  const [expandedEmergency, setExpandedEmergency] = useState<number | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Lenis smooth momentum scrolling (duration: 1.1)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Smooth scroll handler
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // IntersectionObserver to track currently visible section
  useEffect(() => {
    const sectionIds = ["planner", "dashboard", "guide", "timeline"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -40% 0px",
        threshold: 0.15,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Proportional 1440px canvas scaling on mobile / resize
  useEffect(() => {
    const updateZoom = () => {
      const w = window.innerWidth;
      const stage = document.getElementById("canvas-stage");
      if (stage) {
        stage.style.zoom = w < 1440 ? String(w / 1440) : "1";
      }
    };
    updateZoom();
    window.addEventListener("resize", updateZoom);
    window.addEventListener("orientationchange", updateZoom);
    return () => {
      window.removeEventListener("resize", updateZoom);
      window.removeEventListener("orientationchange", updateZoom);
    };
  }, []);

  // Compute dynamic thaw schedule based on current weight, method & target time
  const [targetH, targetM] = targetTime.split(":").map(Number);
  const targetDate =
    parseLocalDateTime(DEFAULT_TARGET_DATE, targetTime) ||
    new Date(2026, 10, 26, targetH || 13, targetM || 0);

  const currentSchedule = buildThawSchedule({
    weightLb: selectedWeight,
    method: selectedMethod,
    target: targetDate,
  });

  // Dynamic calendar payload
  const dynamicCalendarEvent: CalendarEvent = {
    title: `🦃 Start Turkey Thaw (${selectedWeight} lbs ${
      selectedMethod === "refrigerator" ? "Refrigerator Thaw" : "Cold Water Bath"
    })`,
    description: `Place ${selectedWeight} lbs frozen turkey into ${
      selectedMethod === "refrigerator"
        ? "bottom refrigerator shelf (≤40°F) in a rimmed roasting pan. Thawing takes approx. " +
          currentSchedule.durationText +
          " (" +
          Math.round(currentSchedule.durationHours) +
          " hours)"
        : "cold tap water bath fully submerged, rotating water every 30 minutes. Thawing takes approx. " +
          currentSchedule.durationText
    }. Target internal temperature: 165°F verified by instant-read thermometer. TurkeyThaw (turkeythaw.pages.dev)`,
    start: currentSchedule.startTime,
    end: new Date(currentSchedule.startTime.getTime() + 60 * 60 * 1000),
    location:
      selectedMethod === "refrigerator"
        ? "Kitchen Refrigerator (Bottom Shelf, ≤40°F)"
        : "Kitchen Sink (Cold Water Bath)",
  };

  const handleAddToCalendar = () => {
    const url = buildGoogleCalendarUrl(dynamicCalendarEvent);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadIcs = () => {
    const fullSchedule = buildFullTurkeyScheduleEvents({
      thawEvent: dynamicCalendarEvent,
      weight: selectedWeight,
      dinnerTime: dinnerTime,
    });
    downloadIcsFile(fullSchedule, "TurkeyThaw-Schedule.ics");
  };

  const handleSyncReminders = () => {
    const fullSchedule = buildFullTurkeyScheduleEvents({
      thawEvent: dynamicCalendarEvent,
      weight: selectedWeight,
      dinnerTime: dinnerTime,
    });
    downloadIcsFile(fullSchedule, "TurkeyThaw-Schedule.ics");
  };

  const handleDownloadPdf = () => {
    downloadPdfCheatSheet({
      weight: selectedWeight,
      method: selectedMethod,
      dinnerTime: dinnerTime,
    });
  };

  // Cook-Day Step Dynamic Calculations from Dinner Time
  const [dinnerH, dinnerM] = dinnerTime.split(":").map(Number);
  const dinnerMinutes = (dinnerH || 16) * 60 + (dinnerM || 0);
  const step1Time = formatTimelineTime(dinnerMinutes - 540); // 9h before dinner (07:00 AM at 16:00)
  const step2Time = formatTimelineTime(dinnerMinutes - 255); // 4h15m before dinner (11:45 AM at 16:00)
  const step3Time = formatTimelineTime(dinnerMinutes - 150); // 2h30m before dinner (01:30 PM at 16:00)
  const step4Time = formatTimelineTime(dinnerMinutes - 45); // 45m before dinner (03:15 PM at 16:00)
  const step5Time = formatTimelineTime(dinnerMinutes - 40); // 40m before dinner (03:20 PM at 16:00)

  const TIMELINE_STEPS = [
    { id: 1, time: step1Time, left: "7.5%", width: "7.2%" },
    { id: 2, time: step2Time, left: "26.4%", width: "7.0%" },
    { id: 3, time: step3Time, left: "46.3%", width: "7.0%" },
    { id: 4, time: step4Time, left: "66.4%", width: "6.2%" },
    { id: 5, time: step5Time, left: "85.5%", width: "5.8%" },
  ];

  const selectedDinnerLabel =
    DINNER_TIME_OPTIONS.find((o) => o.value === dinnerTime)?.label || dinnerTime;

  const selectedTargetLabel =
    TARGET_TIME_OPTIONS.find((o) => o.value === targetTime)?.label || targetTime;

  return (
    <main className="min-h-screen w-full bg-[#FAF9F5] text-[#111111] flex flex-col select-none antialiased relative overflow-x-hidden font-sans">
      <div
        id="canvas-stage"
        className="canvas-stage w-[1440px] min-w-[1440px] origin-top-left overflow-x-hidden"
        style={{ zoom: "min(1, calc(100vw / 1440px))" }}
      >
        {/* ============================================================== */}
        {/* ALWAYS-ON UNIFIED FLOATING GLASS NAVBAR (Fixed Top - 100% Vis) */}
      {/* ============================================================== */}
      <header className="fixed top-5 inset-x-0 mx-auto max-w-5xl z-50 px-4 sm:px-6 pointer-events-auto">
        <div className="backdrop-blur-md bg-[#FAF9F5]/90 border border-[#E6E4DD] rounded-full px-5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-sm">
          {/* Left: Brand Logo with Illustrated Orange Cloche Platter Icon */}
          <motion.button
            type="button"
            onClick={() => scrollTo("planner")}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2.5 focus:outline-none group cursor-pointer"
            aria-label="TurkeyThaw Home"
          >
            <div className="w-8 h-8 rounded-full bg-[#FFF0E5] flex items-center justify-center p-1 shadow-xs group-hover:scale-105 transition-transform">
              <ClocheLogoIcon className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-[17px] tracking-tight text-[#111111]">
              Turkey<span className="text-[#EA580C]">Thaw</span>
            </span>
          </motion.button>

          {/* Center: Smooth-scroll links with animated layoutId indicator */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 text-[13px] font-medium">
            {[
              { id: "dashboard", label: "Calculator" },
              { id: "dashboard", label: "Prep Kit" },
              { id: "guide", label: "USDA Guide" },
              { id: "timeline", label: "Timeline" },
            ].map((link, idx) => {
              const isActive =
                activeSection === link.id && (link.label !== "Prep Kit" || activeSection === "dashboard");
              return (
                <motion.button
                  key={`${link.label}-${idx}`}
                  type="button"
                  onClick={() => scrollTo(link.id)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative px-3.5 py-1.5 rounded-full transition-colors duration-150 cursor-pointer ${
                    isActive ? "text-[#111111] font-semibold" : "text-neutral-600 hover:text-[#111111]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-neutral-200/70 rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {link.label}
                </motion.button>
              );
            })}
          </nav>

          {/* Right: Dark pill CTA button with tactile feedback */}
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              onClick={() => scrollTo("dashboard")}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 bg-[#111111] hover:bg-[#262626] text-white text-[13px] font-semibold px-4 sm:px-5 py-2 rounded-full transition-all duration-150 shadow-sm hover:shadow-md cursor-pointer"
            >
              <span>Plan dinner</span>
              <span className="text-[#EA580C] font-bold">→</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 1. SECTION 1: HERO PLANNER (section1_planner_clean.png)        */}
      {/* ============================================================== */}
      <FullBleedSection
        id="planner"
        src="/assets/section1_planner_clean.png"
        alt="TurkeyThaw - The centerpiece of your table starts days before the oven"
      >
        {/* Center Pill: "USDA Safety Guidance • 165°F Safe Temperature >" */}
        <Hotspot
          label="Planner: USDA Safety Guidance 165°F Pill"
          left="35.5%"
          top="52.2%"
          width="29.0%"
          height="4.5%"
          onClick={() => scrollTo("guide")}
        />

        {/* Bottom Left: "✦ Thanksgiving 2026 Ready" */}
        <Hotspot
          label="Planner: Thanksgiving 2026 Badge"
          left="2.5%"
          top="91.5%"
          width="16.5%"
          height="5.0%"
          onClick={() => scrollTo("planner")}
        />

        {/* Bottom Right: "Scroll down to configure weight & time ↓" */}
        <Hotspot
          label="Planner: Scroll to Configure Weight & Time ↓"
          left="77.5%"
          top="91.5%"
          width="19.5%"
          height="5.0%"
          onClick={() => scrollTo("dashboard")}
        />
      </FullBleedSection>

      {/* ============================================================== */}
      {/* 2. SECTION 2: CALCULATOR & PREP KIT (section2_calculator_clean)  */}
      {/* ============================================================== */}
      <FullBleedSection
        id="dashboard"
        src="/assets/section2_calculator_clean.png"
        alt="TurkeyThaw - Calculate your backwards holiday schedule"
      >
        {/* Interactive Turkey Weight Selector Track (Flush 51.60% width ending at 57.50%) */}
        <div
          style={{ left: "5.90%", top: "39.32%", width: "51.60%", height: "4.75%" }}
          className="absolute z-20 bg-[#FAF5EE] border-0 rounded-2xl p-1 flex items-center justify-between select-none"
        >
          {WEIGHT_PRESETS.map((w) => {
            const isSelected = selectedWeight === w;
            return (
              <motion.button
                key={w}
                type="button"
                onClick={() => setSelectedWeight(w)}
                whileTap={{ scale: 0.96 }}
                className="relative flex-1 h-full flex items-center justify-center rounded-xl cursor-pointer select-none transition-colors duration-150 z-10"
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeWeightPill"
                    className="absolute inset-0 bg-[#EA580C] rounded-xl shadow-sm -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
                <span
                  className={`text-[13px] sm:text-[14px] md:text-[15px] font-bold leading-none ${
                    isSelected ? "text-white" : "text-[#2B2824]"
                  }`}
                >
                  {w} lbs
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Interactive Thawing Method Toggle (Flush 51.60% width ending at 57.50%) */}
        <div
          style={{ left: "5.90%", top: "50.78%", width: "51.60%", height: "8.53%" }}
          className="absolute z-20 flex items-center gap-3 select-none"
        >
          <motion.button
            type="button"
            onClick={() => setSelectedMethod("refrigerator")}
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`relative flex-1 h-full px-4 py-2.5 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
              selectedMethod === "refrigerator"
                ? "bg-[#FFF9F5] border-[#EA580C] shadow-sm ring-1 ring-[#EA580C]/30"
                : "bg-[#FAF7F3] border-[#EFE6DD] hover:bg-white"
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] sm:text-[14px] md:text-[15px] font-bold text-[#111111]">
                  Refrigerator Thaw
                </span>
                {selectedMethod === "refrigerator" && (
                  <span className="text-[10px] font-extrabold text-[#EA580C] bg-[#EA580C]/10 px-1.5 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] text-neutral-500 block mt-0.5">
                24 hrs per 4–5 lbs (≤40°F) • Recommended
              </span>
            </div>
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                selectedMethod === "refrigerator"
                  ? "bg-[#EA580C] text-white"
                  : "border border-neutral-300 text-transparent"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setSelectedMethod("cold-water")}
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`relative flex-1 h-full px-4 py-2.5 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
              selectedMethod === "cold-water"
                ? "bg-[#FFF9F5] border-[#EA580C] shadow-sm ring-1 ring-[#EA580C]/30"
                : "bg-[#FAF7F3] border-[#EFE6DD] hover:bg-white"
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] sm:text-[14px] md:text-[15px] font-bold text-[#111111]">
                  Cold Water Bath
                </span>
                {selectedMethod === "cold-water" && (
                  <span className="text-[10px] font-extrabold text-[#EA580C] bg-[#EA580C]/10 px-1.5 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] text-neutral-500 block mt-0.5">
                30 min per pound (Submerged, change water q30m)
              </span>
            </div>
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                selectedMethod === "cold-water"
                  ? "bg-[#EA580C] text-white"
                  : "border border-neutral-300 text-transparent"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </motion.button>
        </div>

        {/* Target Ready Date & Time Dedicated Dropdown (Zero Patch Box - bg-transparent) */}
        <div
          style={{ left: "5.90%", top: "62.50%", width: "51.60%", height: "6.25%" }}
          className="absolute z-30 select-none flex items-center"
        >
          <select
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
            aria-label="Target Ready Date and Time"
            className="w-full h-full opacity-0 cursor-pointer absolute inset-0 z-10"
          >
            {TARGET_TIME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white text-neutral-900">
                {opt.label}
              </option>
            ))}
          </select>
          <div
            style={{ left: "10.5%", width: "75%" }}
            className="absolute pointer-events-none flex items-center bg-transparent text-[12px] sm:text-[14px] font-bold text-[#111111]"
          >
            {selectedTargetLabel}
          </div>
        </div>

        {/* START THAWING Result Card Middle Row (Zero Patch Box - bg-transparent over cleaned banner) */}
        <div
          style={{ left: "18.8%", top: "74.0%", width: "28.5%", height: "4.2%" }}
          className="absolute z-15 bg-transparent flex items-center px-1 select-none pointer-events-none"
        >
          <span className="text-[14px] sm:text-[16px] md:text-[18px] font-black text-[#111111] tracking-tight leading-none whitespace-nowrap bg-transparent">
            {formatScheduleDate(currentSchedule.startTime)} • {formatClockTime(currentSchedule.startTime)}
          </span>
        </div>

        {/* Transparent Interactive Buttons over Card (Bug 1 Fix: Zero shadow, zero background box) */}
        <button
          type="button"
          onClick={handleAddToCalendar}
          style={{ left: "29.6%", top: "74.8%", width: "12.8%", height: "6.6%" }}
          className="absolute z-20 bg-transparent hover:bg-transparent active:bg-transparent rounded-full border-0 ring-0 shadow-none cursor-pointer outline-none select-none"
          aria-label="Add Turkey Thaw to Google Calendar"
        >
          <span className="sr-only">Add to Calendar</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadIcs}
          style={{ left: "43.3%", top: "74.8%", width: "13.4%", height: "6.6%" }}
          className="absolute z-20 bg-transparent hover:bg-transparent active:bg-transparent rounded-full border-0 ring-0 shadow-none cursor-pointer outline-none select-none"
          aria-label="Download Turkey Thaw .ICS Calendar File"
        >
          <span className="sr-only">Download .ICS</span>
        </button>

        {/* Essential Holiday Gear (Right Column 5 Affiliate Buttons) */}
        <Hotspot
          label="Dashboard Gear 1: ThermoPop 2 Instant-Read → ThermoWorks"
          left="84.8%"
          top="44.2%"
          width="9.8%"
          height="4.8%"
          href="https://www.thermoworks.com/thermopop-2/"
          isExternal
        />
        <Hotspot
          label="Dashboard Gear 2: DOT Oven Probe Thermometer → ThermoWorks"
          left="84.8%"
          top="53.8%"
          width="9.8%"
          height="4.8%"
          href="https://www.thermoworks.com/dot/"
          isExternal
        />
        <Hotspot
          label="Dashboard Gear 3: Heavy Roasting Pan with V-Rack → Walmart"
          left="88.0%"
          top="62.8%"
          width="6.8%"
          height="4.8%"
          href="https://www.walmart.com/search?q=turkey+roasting+pan+v+rack"
          isExternal
        />
        <Hotspot
          label="Dashboard Gear 4: Food-Safe Leakproof Thaw Bags → Walmart"
          left="88.0%"
          top="70.8%"
          width="6.8%"
          height="4.8%"
          href="https://www.walmart.com/search?q=food+safe+brining+thawing+bags"
          isExternal
        />
        <Hotspot
          label="Dashboard Gear 5: Stainless Steel Turkey Lifters → Walmart"
          left="88.0%"
          top="79.0%"
          width="6.8%"
          height="4.8%"
          href="https://www.walmart.com/search?q=turkey+lifters+stainless+steel"
          isExternal
        />

        {/* Bottom Banner Left: USDA Danger Zone (Bug 2 Fix: Zero HTML gradient bar overlay) */}
        <Hotspot
          label="Dashboard: USDA Danger Zone 40°F-140°F → View Guide"
          left="3.8%"
          top="88.5%"
          width="55.8%"
          height="7.8%"
          onClick={() => scrollTo("guide")}
        />

        {/* Bottom Banner Right: Emergency Quick-FAQ */}
        <Hotspot
          label="Dashboard: Emergency Quick-FAQ → View Guide"
          left="60.2%"
          top="88.5%"
          width="36.0%"
          height="7.8%"
          onClick={() => scrollTo("guide")}
        />
      </FullBleedSection>

      {/* ============================================================== */}
      {/* 3. SECTION 3: USDA SAFETY GUIDE (section3_guide.png, Cropped)   */}
      {/* ============================================================== */}
      <FullBleedSection
        id="guide"
        src="/assets/section3_guide.png"
        alt="TurkeyThaw - The line between perfection and danger is exactly 165°F"
      >
        {/* Turkey Temperature Guide Scale Graphic */}
        <Hotspot
          label="Guide: Turkey Temperature Scale & 165°F Probe Target"
          left="3.8%"
          top="36.5%"
          width="55.8%"
          height="47.5%"
          onClick={() => scrollTo("guide")}
        />

        {/* Emergency Protocols Interactive Accordions (Bug 6 Fix: Site Typography font-bold tracking-[-0.02em]) */}
        {EMERGENCY_PROTOCOLS.map((ep) => {
          const isExpanded = expandedEmergency === ep.id;
          return (
            <React.Fragment key={ep.id}>
              {/* Transparent Click Trigger over Card - 100% Invisible Closed */}
              <button
                type="button"
                onClick={() => setExpandedEmergency(isExpanded ? null : ep.id)}
                style={{ left: "60.5%", top: ep.top, width: "35.7%", height: ep.height }}
                className="absolute z-20 bg-transparent hover:bg-transparent active:bg-transparent focus:outline-none border-0 ring-0 shadow-none cursor-pointer outline-none select-none"
                aria-label={`Toggle Emergency Protocol: ${ep.title}`}
              >
                <span className="sr-only">Toggle {ep.title}</span>
              </button>

              {/* Floating Expandable Answer Drawer (Alpha Editorial Typography) */}
              {isExpanded && (
                <div
                  style={{ left: "60.5%", top: ep.top, width: "35.7%" }}
                  className="absolute z-30 bg-[#FFFCF8] border border-[#E8DEC8] rounded-2xl p-5 shadow-[0_16px_40px_rgba(27,26,24,0.08)] select-text text-left animate-in fade-in zoom-in-95 duration-150 font-sans antialiased"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-[#FFF0E5] text-[#EA580C] text-[10px] font-extrabold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full">
                      {ep.badge}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedEmergency(null)}
                      className="text-neutral-400 hover:text-[#1B1A18] font-bold p-1 rounded-full hover:bg-neutral-100 cursor-pointer"
                      aria-label="Close drawer"
                    >
                      ✕
                    </button>
                  </div>
                  <h4 className="text-[17px] font-extrabold text-[#1B1A18] tracking-[-0.03em] leading-snug mb-1.5">
                    {ep.title}
                  </h4>
                  <p className="text-[13.5px] font-medium text-[#44403C] tracking-[-0.01em] leading-[1.6]">
                    {ep.renderAnswer ? ep.renderAnswer() : ep.answer}
                  </p>
                  {ep.actionText && ep.actionTarget && (
                    <div className="mt-3 pt-2.5 border-t border-[#E8DEC8]">
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedEmergency(null);
                          scrollTo(ep.actionTarget!);
                        }}
                        className="text-[12px] font-bold text-[#EA580C] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{ep.actionText}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Keep the guide close at hand (Banner card) */}
        <Hotspot
          label="Guide: Keep Guide Close Banner → Open Cheat Sheet"
          left="3.8%"
          top="87.5%"
          width="54.5%"
          height="9.0%"
          onClick={() => setIsModalOpen(true)}
        />

        {/* "Download Kitchen Cheat-Sheet PDF" Zero-Ghosting Transparent Button */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          style={{ left: "59.2%", top: "89.0%", width: "22.0%", height: "7.0%" }}
          className="absolute z-20 bg-transparent hover:bg-transparent active:bg-transparent rounded-full border-0 ring-0 shadow-none cursor-pointer outline-none select-none"
          aria-label="Download Kitchen Cheat-Sheet PDF"
        >
          <span className="sr-only">Download Kitchen Cheat-Sheet PDF</span>
        </button>

        {/* "Sync Reminders" Zero-Ghosting Transparent Button */}
        <button
          type="button"
          onClick={handleSyncReminders}
          style={{ left: "81.8%", top: "89.0%", width: "13.5%", height: "7.0%" }}
          className="absolute z-20 bg-transparent hover:bg-transparent active:bg-transparent rounded-full border-0 ring-0 shadow-none cursor-pointer outline-none select-none"
          aria-label="Sync Reminders to Calendar"
        >
          <span className="sr-only">Sync Reminders</span>
        </button>
      </FullBleedSection>

      {/* ============================================================== */}
      {/* 4. SECTION 4: COOK-DAY BATTLE BOARD (section4_timeline_clean)   */}
      {/* ============================================================== */}
      <FullBleedSection
        id="timeline"
        src="/assets/section4_timeline_clean.png"
        alt="TurkeyThaw - The Thanksgiving Cook-Day Battle Board"
      >
        {/* Interactive Dinner Time Selector (Zero White Box - bg-transparent) */}
        <div style={{ left: "36.2%", top: "24.5%", width: "16.0%", height: "3.5%" }} className="absolute z-20 flex items-center">
          <select
            value={dinnerTime}
            onChange={(e) => setDinnerTime(e.target.value)}
            aria-label="Dinner Time Selector"
            className="w-full h-full opacity-0 cursor-pointer absolute inset-0 z-10"
          >
            {DINNER_TIME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white text-neutral-900">
                Dinner: {opt.label}
              </option>
            ))}
          </select>
          <div
            style={{ left: "34.0%", width: "60%" }}
            className="absolute pointer-events-none flex items-center bg-transparent text-[11px] sm:text-[13px] font-bold text-[#111111]"
          >
            {selectedDinnerLabel} ▾
          </div>
        </div>

        {/* Bird Weight Indicator Pill (Zero White Box - bg-transparent) */}
        <button
          type="button"
          onClick={() => scrollTo("dashboard")}
          style={{ left: "53.2%", top: "24.5%", width: "8.5%", height: "3.5%" }}
          className="absolute z-20 bg-transparent flex items-center justify-center cursor-pointer select-none"
          aria-label="Bird Weight - Scroll to Calculator"
        >
          <span className="text-[11px] sm:text-[13px] font-bold text-[#EA580C] bg-transparent">
            {selectedWeight} lbs
          </span>
        </button>

        {/* 5 Milestone Step Dynamic Time Patches (Strict Rule 2: ONLY when dinnerTime !== '16:00') */}
        {dinnerTime !== "16:00" &&
          TIMELINE_STEPS.map((step) => (
            <div
              key={step.id}
              style={{
                left: step.left,
                top: "33.0%",
                width: step.width,
                height: "2.4%",
              }}
              className="absolute z-20 flex items-center justify-center bg-white pointer-events-none select-none"
            >
              <span className="text-[12px] sm:text-[14px] md:text-[15px] font-extrabold text-[#1B1A18] tracking-tight">
                {step.time}
              </span>
            </div>
          ))}

        {/* 5 Cook-Day Battle Board Milestone Cards & Gear Links */}
        <Hotspot
          label="Timeline Step 1: Wake & Air-Chill Card"
          left="3.6%"
          top="28.8%"
          width="17.2%"
          height="38.8%"
          onClick={() => scrollTo("timeline")}
        />
        <Hotspot
          label="Timeline Step 1 Gear: Leakproof Brine Bags → Walmart"
          left="4.6%"
          top="62.6%"
          width="15.2%"
          height="4.0%"
          href="https://www.walmart.com/search?q=food+safe+brining+thawing+bags"
          isExternal
        />

        <Hotspot
          label="Timeline Step 2: Oven Entry (325°F) Card"
          left="22.2%"
          top="28.8%"
          width="17.2%"
          height="38.8%"
          onClick={() => scrollTo("timeline")}
        />
        <Hotspot
          label="Timeline Step 2 Gear: V-Rack Roasting Pan → Walmart"
          left="23.2%"
          top="62.6%"
          width="15.2%"
          height="4.0%"
          href="https://www.walmart.com/search?q=turkey+roasting+pan+v+rack"
          isExternal
        />

        <Hotspot
          label="Timeline Step 3: Leave-in Cable Insertion Card"
          left="40.8%"
          top="28.8%"
          width="17.2%"
          height="38.8%"
          onClick={() => scrollTo("timeline")}
        />
        <Hotspot
          label="Timeline Step 3 Gear: DOT Probe Thermometer → ThermoWorks"
          left="41.8%"
          top="62.6%"
          width="15.2%"
          height="4.0%"
          href="https://www.thermoworks.com/dot/"
          isExternal
        />

        <Hotspot
          label="Timeline Step 4: 165°F Verification Card"
          left="59.4%"
          top="28.8%"
          width="17.2%"
          height="38.8%"
          onClick={() => scrollTo("timeline")}
        />
        <Hotspot
          label="Timeline Step 4 Gear: ThermoPop 2 → ThermoWorks"
          left="60.4%"
          top="62.6%"
          width="15.2%"
          height="4.0%"
          href="https://www.thermoworks.com/thermopop-2/"
          isExternal
        />

        <Hotspot
          label="Timeline Step 5: Heavy Lift & Rest Card"
          left="78.0%"
          top="28.8%"
          width="17.2%"
          height="38.8%"
          onClick={() => scrollTo("timeline")}
        />
        <Hotspot
          label="Timeline Step 5 Gear: Turkey Lifters → Walmart"
          left="79.0%"
          top="62.6%"
          width="15.2%"
          height="4.0%"
          href="https://www.walmart.com/search?q=turkey+lifters+stainless+steel"
          isExternal
        />

        {/* Frequently Asked Questions Interactive Accordions (Bug 6 Fix: Site Typography font-bold tracking-[-0.02em]) */}
        {FAQ_ITEMS.map((faq) => {
          const isExpanded = expandedFaq === faq.id;
          return (
            <React.Fragment key={faq.id}>
              {/* Transparent Click Trigger over Card - 100% Invisible Closed */}
              <button
                type="button"
                onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                style={{ left: faq.left, top: faq.top, width: faq.width, height: faq.height }}
                className="absolute z-20 bg-transparent hover:bg-transparent active:bg-transparent focus:outline-none border-0 ring-0 shadow-none cursor-pointer outline-none select-none"
                aria-label={`Toggle FAQ: ${faq.question}`}
              >
                <span className="sr-only">Toggle {faq.question}</span>
              </button>

              {/* Floating Expandable Answer Drawer (Alpha Editorial Typography) */}
              {isExpanded && (
                <div
                  style={{ left: faq.left, top: faq.top, width: faq.width }}
                  className="absolute z-30 bg-[#FFFCF8] border border-[#E8DEC8] rounded-2xl p-5 shadow-[0_16px_40px_rgba(27,26,24,0.08)] select-text text-left animate-in fade-in zoom-in-95 duration-150 font-sans antialiased"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-[#FFF0E5] text-[#EA580C] text-[10px] font-extrabold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full">
                      USDA FAQ Answer
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(null)}
                      className="text-neutral-400 hover:text-[#1B1A18] font-bold p-1 rounded-full hover:bg-neutral-100 cursor-pointer"
                      aria-label="Close drawer"
                    >
                      ✕
                    </button>
                  </div>
                  <h4 className="text-[17px] font-extrabold text-[#1B1A18] tracking-[-0.03em] leading-snug mb-1.5">
                    {faq.question}
                  </h4>
                  <p className="text-[13.5px] font-medium text-[#44403C] tracking-[-0.01em] leading-[1.6]">
                    {faq.renderAnswer ? faq.renderAnswer() : faq.answer}
                  </p>
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Official Dark Footer Hotspots (At base of Timeline) */}
        <Hotspot
          label="Timeline Dark Footer: Logo → Top"
          left="3.2%"
          top="88.2%"
          width="14.0%"
          height="7.0%"
          onClick={() => scrollTo("planner")}
        />
        <Hotspot
          label="Timeline Dark Footer: Privacy Policy"
          left="71.6%"
          top="89.8%"
          width="4.2%"
          height="3.6%"
          href="/privacy"
        />
        <Hotspot
          label="Timeline Dark Footer: Terms of Use"
          left="75.8%"
          top="89.8%"
          width="3.6%"
          height="3.6%"
          href="/terms"
        />
        <Hotspot
          label="Timeline Dark Footer: USDA Guidelines"
          left="79.6%"
          top="89.8%"
          width="8.4%"
          height="3.6%"
          href="https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/turkey-basics-safe-thawing"
          isExternal
        />
        <Hotspot
          label="Timeline Dark Footer: Back to top ↑"
          left="88.6%"
          top="88.6%"
          width="8.6%"
          height="5.6%"
          onClick={() => scrollTo("planner")}
        />
      </FullBleedSection>

      {/* ============================================================== */}
      {/* 5. FULL-WIDTH DARK FOOTER EXTENSION                            */}
      {/* ============================================================== */}
      <footer className="w-full bg-[#191919] text-[#888888] pt-8 pb-14 px-6 border-0 select-none font-sans antialiased">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center p-1">
                <ClocheLogoIcon className="w-5 h-5" />
              </div>
              <span className="font-bold text-white tracking-tight">
                Turkey<span className="text-[#EA580C]">Thaw</span>
              </span>
              <span className="text-neutral-500">•</span>
              <span className="text-neutral-400">Culinary precision & USDA compliance for holiday hosts.</span>
            </div>
            <div className="flex items-center gap-6 text-neutral-400">
              <button
                type="button"
                onClick={() => scrollTo("planner")}
                className="hover:text-white transition-colors cursor-pointer"
                aria-label="Scroll back to top"
              >
                Back to top ↑
              </button>
              <a
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Terms of Use
              </a>
              <a
                href="https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/turkey-basics-safe-thawing"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                USDA Guidelines
              </a>
              <span className="text-neutral-500">© 2026 TurkeyThaw (turkeythaw.pages.dev). All rights reserved.</span>
            </div>
          </div>

          {/* FTC-Compliant Affiliate Disclosure */}
          <div className="pt-4 border-t border-neutral-800 text-[11px] leading-relaxed text-neutral-400 text-center sm:text-left">
            <p>
              <strong className="text-neutral-300 font-semibold">Affiliate Disclosure:</strong> TurkeyThaw participates in affiliate programs with ThermoWorks, Walmart, and other partners. We may earn a commission on qualifying purchases at zero added cost to you. Built strictly to USDA food safety standards.
            </p>
          </div>
        </div>
      </footer>
      </div>

      {/* ============================================================== */}
      {/* KITCHEN CHEAT-SHEET MODAL (PRINT / PDF)                         */}
      {/* ============================================================== */}
      <CheatSheetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedWeight={selectedWeight}
        selectedMethod={selectedMethod}
        dinnerTime={dinnerTime}
      />
    </main>
  );
}
