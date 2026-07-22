import { useState } from 'react';
import { Monitor, Tv2 } from 'lucide-react';
import { useScreenMode } from '@/hooks/use-screen-mode';
import ManagerPinOverlay from './ManagerPinOverlay';

const POS_URL = 'https://mobileposapp.lovable.app';

/**
 * Full-viewport shell that embeds the Point of Sale web app while KDS
 * Screen Mode is set to 'pos'. A floating pill lets the user return to
 * KDS after re-entering a 4-digit manager PIN.
 */
export default function PosModeShell() {
  const { setMode } = useScreenMode();
  const [pinOpen, setPinOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-[9990] bg-black" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <iframe
        src={POS_URL}
        title="Point of Sale"
        className="w-full h-full border-0"
        allow="clipboard-read; clipboard-write; camera; microphone"
      />

      <div className="fixed top-3 right-3 z-[9995] flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg" style={{ background: '#0D0D1A', color: '#FFFFFF' }}>
        <Monitor size={14} className="text-emerald-400" />
        <span className="text-xs font-semibold">Point of Sale</span>
        <span className="w-px h-4 bg-white/20 mx-1" />
        <button
          type="button"
          onClick={() => setPinOpen(true)}
          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Tv2 size={13} />
          Return to KDS
        </button>
      </div>

      <ManagerPinOverlay
        open={pinOpen}
        title="Manager PIN Required"
        subtitle="Enter PIN to return to Kitchen Display"
        onClose={() => setPinOpen(false)}
        onSuccess={() => {
          setPinOpen(false);
          setMode('kds');
        }}
      />
    </div>
  );
}
