import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ShiftProfilePopupProps {
  open: boolean;
  onClose: () => void;
  displayName: string;
  roleLabel: string;
  initials: string;
  avatarBg: string;
  clockedIn?: string;
  totalHours?: string;
  shiftEnd?: string;
  breakTaken?: string;
  onViewSummary?: () => void;
}

/**
 * Employee profile / shift summary popup shown when tapping the identity
 * chip in the KDS header. Mirrors the POS mobile app design.
 */
export function ShiftProfilePopup({
  open,
  onClose,
  displayName,
  roleLabel,
  initials,
  avatarBg,
  clockedIn = '--:--',
  totalHours = '0.0',
  shiftEnd = '--:--',
  breakTaken = '0m',
  onViewSummary,
}: ShiftProfilePopupProps) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-[520px] max-w-[92vw] bg-[#1C1C1E] rounded-3xl shadow-2xl overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4 text-neutral-400" />
        </button>

        <div className="flex flex-col items-center pt-8 pb-6 px-6">
          <div
            className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center text-lg font-semibold text-white"
            style={{ background: avatarBg }}
          >
            {initials}
          </div>
          <h3 className="mt-3 text-lg font-semibold text-white">{displayName}</h3>
          <span className="mt-1 text-xs px-3 py-1 bg-white/10 text-neutral-300 rounded-full font-medium uppercase tracking-wide">
            {roleLabel}
          </span>

          <div className="mt-6 flex items-center justify-between w-full divide-x divide-white/10">
            {[
              { label: 'Clocked In', value: clockedIn },
              { label: 'Total Hours', value: `${totalHours}h` },
              { label: 'Shift End', value: shiftEnd },
              { label: 'Break Taken', value: breakTaken },
            ].map((item) => (
              <div key={item.label} className="flex-1 text-center px-3">
                <p className="text-[13px] font-light text-neutral-400 uppercase tracking-wide whitespace-nowrap">
                  {item.label}
                </p>
                <p className="text-xl font-bold text-white mt-1 whitespace-nowrap">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={onViewSummary ?? onClose}
            className="w-full py-3 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-full transition-colors"
          >
            View Shift Summary
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ShiftProfilePopup;
