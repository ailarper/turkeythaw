'use client';

import React from 'react';
import { downloadPdfCheatSheet } from '@/lib/pdf';

interface CheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWeight?: number;
  selectedMethod?: 'refrigerator' | 'cold-water';
  dinnerTime?: string;
}

export function CheatSheetModal({
  isOpen,
  onClose,
  selectedWeight = 16,
  selectedMethod = 'refrigerator',
  dinnerTime = '16:00',
}: CheatSheetModalProps) {
  if (!isOpen) return null;

  const handleDownload = () => {
    downloadPdfCheatSheet({
      weight: selectedWeight,
      method: selectedMethod,
      dinnerTime: dinnerTime,
    });
  };

  const weights = [
    { w: 12, fridge: '~3 days (72 hrs)', water: '~6 hours' },
    { w: 14, fridge: '~3.5 days (84 hrs)', water: '~7 hours' },
    { w: 16, fridge: '~4 days (96 hrs)', water: '~8 hours' },
    { w: 18, fridge: '~4.5 days (108 hrs)', water: '~9 hours' },
    { w: 20, fridge: '~5 days (120 hrs)', water: '~10 hours' },
    { w: 24, fridge: '~6 days (144 hrs)', water: '~12 hours' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 font-sans antialiased">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FFF0E5] flex items-center justify-center shadow-xs">
              <svg viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                <circle cx="18" cy="4.5" r="2.5" fill="#EA580C" stroke="#1B1A18" strokeWidth="2" />
                <path d="M5 20C5 12.268 10.8203 6 18 6C25.1797 6 31 12.268 31 20H5Z" fill="#EA580C" stroke="#1B1A18" strokeWidth="2" strokeLinejoin="round" />
                <path d="M9.5 17C10.5 12.5 13.8 9.5 17.5 9" stroke="#FDBA74" strokeWidth="2" strokeLinecap="round" />
                <rect x="3" y="20" width="30" height="4" rx="2" fill="#1B1A18" />
              </svg>
            </div>
            <div>
              <h3 className="text-[18px] font-extrabold text-[#1B1A18] tracking-[-0.03em]">
                Kitchen Cheat-Sheet &amp; Safety Card
              </h3>
              <p className="text-[12px] font-medium text-[#57534E]">
                USDA FSIS Holiday Standards · Active: <strong className="text-[#EA580C] font-bold">{selectedWeight} lbs</strong> ({selectedMethod === 'refrigerator' ? 'Fridge Thaw' : 'Cold Water'})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 text-[13px]">
          {/* Section 1: Thawing Table */}
          <div className="bg-[#FAF7F3] p-4 sm:p-5 rounded-2xl border border-[#EFE6DD]">
            <h4 className="text-[14px] font-bold text-[#1B1A18] tracking-[-0.02em] mb-2.5 flex items-center gap-2">
              <span>⏱️</span>
              <span>USDA Thawing Times</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] font-medium text-[#57534E]">
                <thead>
                  <tr className="border-b border-[#E8DFD5] font-bold text-[#1B1A18]">
                    <th className="py-2">Weight</th>
                    <th className="py-2">Refrigerator (≤40°F)</th>
                    <th className="py-2">Cold Water Bath (Submerged)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE6DD] text-[12px]">
                  {weights.map((row) => {
                    const isSelected = row.w === selectedWeight;
                    return (
                      <tr
                        key={row.w}
                        className={isSelected ? 'bg-[#FFF0E5]/80 font-bold text-[#1B1A18]' : ''}
                      >
                        <td className="py-2 font-bold text-[#1B1A18] flex items-center gap-1.5">
                          <span>{row.w} lbs</span>
                          {isSelected && (
                            <span className="text-[9px] uppercase tracking-wider bg-[#EA580C] text-white px-1.5 py-0.5 rounded font-extrabold">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-2">{row.fridge}</td>
                        <td className="py-2">{row.water}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Temperature Safe Zones */}
          <div className="bg-[#FFF9F5] p-4 sm:p-5 rounded-2xl border border-[#FDBA74]/70">
            <h4 className="text-[14px] font-bold text-[#EA580C] tracking-[-0.02em] mb-2 flex items-center gap-2">
              <span>🌡️</span>
              <span>Critical Temperature Thresholds</span>
            </h4>
            <ul className="space-y-1.5 text-[12px] font-medium text-[#57534E] leading-relaxed">
              <li>• <strong className="text-[#1B1A18] font-bold tabular-nums">165°F (74°C):</strong> Mandatory minimum internal temperature in the thickest part of the thigh, wing, and innermost breast.</li>
              <li>• <strong className="text-[#1B1A18] font-bold tabular-nums">40°F–140°F:</strong> Danger zone. Never leave turkey in this zone for longer than <strong className="text-[#1B1A18] font-bold tabular-nums">2 hours</strong>.</li>
              <li>• <strong className="text-[#1B1A18] font-bold tabular-nums">40°F (4°C) or below:</strong> Safe refrigerator holding zone (good for <strong className="text-[#1B1A18] font-bold tabular-nums">1–2 days</strong> after full thaw).</li>
            </ul>
          </div>

          {/* Section 3: Cook Day Roasting Formula */}
          <div className="bg-[#FAF7F3] p-4 sm:p-5 rounded-2xl border border-[#EFE6DD]">
            <h4 className="text-[14px] font-bold text-[#1B1A18] tracking-[-0.02em] mb-1.5 flex items-center gap-2">
              <span>🔥</span>
              <span>Oven Roasting at <strong className="font-bold tabular-nums">325°F</strong></span>
            </h4>
            <p className="text-[12px] font-medium text-[#57534E] leading-relaxed">
              Unstuffed turkey roasts at approximately <strong className="text-[#1B1A18] font-bold tabular-nums">13–15 minutes per pound</strong> on a V-rack. Always rest for <strong className="text-[#1B1A18] font-bold tabular-nums">40 minutes</strong> before carving to preserve up to 15% more internal juices.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full border border-neutral-300 text-[12px] font-semibold text-[#57534E] hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-5 py-2.5 rounded-full bg-[#111111] hover:bg-neutral-800 text-white text-[12px] font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
            aria-label="Download Kitchen Cheat-Sheet PDF"
          >
            <span>Download PDF Cheat-Sheet</span>
            <span>⬇️</span>
          </button>
        </div>
      </div>
    </div>
  );
}
