import React from 'react';
import { AlertTriangle, Droplets, Clock, Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ThawCalculationResult } from '@/lib/thaw';

interface RescueCardProps {
  calculation: ThawCalculationResult;
}

export const RescueCard: React.FC<RescueCardProps> = ({ calculation }) => {
  const {
    isTooLateForColdWater,
    coldWaterThawHours,
    formattedColdWaterStartTime,
    formattedColdWaterDuration,
    weightInLb,
  } = calculation;

  return (
    <div
      role="region"
      aria-label="Emergency Turkey Thawing Rescue Guide"
      className="w-full overflow-hidden rounded-2xl border-2 border-red-200 bg-red-50/60 p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
          <AlertTriangle className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-red-200/80 px-2.5 py-0.5 text-xs font-bold text-red-900">
              <ShieldAlert className="h-3.5 w-3.5" />
              EMERGENCY RESCUE
            </span>
            <span className="text-xs font-semibold text-red-800">
              Fridge thaw start time has already passed!
            </span>
          </div>

          <h2 className="mt-2 text-xl font-extrabold tracking-tight text-red-950 sm:text-2xl">
            {isTooLateForColdWater
              ? 'Too late for cold-water thawing! Roast directly from frozen.'
              : 'Switch to Cold-Water Rescue Thawing'}
          </h2>
        </div>
      </div>

      {!isTooLateForColdWater ? (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-red-200 bg-white p-3.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-800">
                <Clock className="h-4 w-4 text-red-600" />
                Latest Time to Start Cold Water
              </div>
              <p className="mt-1 text-base font-bold text-stone-900">
                {formattedColdWaterStartTime}
              </p>
            </div>

            <div className="rounded-xl border border-red-200 bg-white p-3.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-800">
                <Droplets className="h-4 w-4 text-red-600" />
                Total Cold-Water Duration
              </div>
              <p className="mt-1 text-base font-bold text-stone-900">
                {formattedColdWaterDuration} ({coldWaterThawHours} hrs total)
              </p>
            </div>
          </div>

          {/* Actionable checklist */}
          <div className="rounded-xl border border-red-200/80 bg-white/80 p-4">
            <h4 className="text-sm font-bold text-stone-900">
              Official USDA Cold-Water Thawing Protocol:
            </h4>
            <ul className="mt-2.5 space-y-2 text-xs sm:text-sm text-stone-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <span>
                  <strong>Keep sealed in leak-proof plastic:</strong> Leave in original packaging or place in a leak-proof zip-top bag to prevent water absorption and bacteria contamination.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <span>
                  <strong>Submerge in cold tap water:</strong> Place the turkey breast-side down in a clean sink or large cooler filled with cold tap water.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <span>
                  <strong>Change water every 30 minutes:</strong> This keeps the water cold (below 40°F) so bacteria cannot grow on outer layers.
                </span>
              </li>
              <li className="flex items-start gap-2 text-red-900 font-semibold bg-red-100/70 p-2 rounded-lg">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-700 mt-0.5" />
                <span>
                  CRITICAL: A cold-water-thawed turkey MUST be cooked immediately. Do not refreeze or store back in the refrigerator.
                </span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        /* Too Late Even for Cold Water */
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-red-300 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-red-900">
              <Flame className="h-5 w-5 text-red-600" />
              USDA Approved Method: Cooking a 100% Frozen Turkey
            </div>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-700">
              Don&apos;t panic — according to the USDA Food Safety and Inspection Service,{' '}
              <strong>it is completely safe to roast a solid frozen turkey directly in your oven</strong>.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2.5 text-xs sm:text-sm text-stone-800">
              <div className="flex items-start gap-2 rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                <span className="font-bold text-red-700">•</span>
                <span>
                  <strong>Expect 50% longer cooking time:</strong> At 325°F (163°C), a thawed {weightInLb} lb turkey takes ~{Math.round(weightInLb * 0.25 * 10) / 10} hours, but frozen it will take ~{Math.round(weightInLb * 0.25 * 1.5 * 10) / 10} hours.
                </span>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                <span className="font-bold text-red-700">•</span>
                <span>
                  <strong>Remove the giblets later:</strong> Do not force out the giblet bag while frozen. Roast for 90 to 120 minutes until the cavity loosens, then extract with tongs.
                </span>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                <span className="font-bold text-red-700">•</span>
                <span>
                  <strong>Verify internal temp:</strong> Use a meat thermometer to ensure both the thickest part of the breast and innermost thigh reach at least 165°F (74°C).
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
