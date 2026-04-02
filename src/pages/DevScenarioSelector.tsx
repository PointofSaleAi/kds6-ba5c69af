import { motion } from 'framer-motion';
import { AlertTriangle, Info, Monitor, Smartphone, UserPlus, LogIn } from 'lucide-react';
import posaiLogo from '@/assets/posai-logo-white.png';

interface DevScenarioSelectorProps {
  onHardwareNew: () => void;
  onHardwareExisting: () => void;
  onBYODNew: () => void;
  onBYODExisting: () => void;
}

export default function DevScenarioSelector({
  onHardwareNew,
  onHardwareExisting,
  onBYODNew,
  onBYODExisting,
}: DevScenarioSelectorProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ backgroundColor: '#0D0D1A' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center w-full max-w-[860px] px-6"
      >
        {/* Dev Mode Badge */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4"
          style={{ backgroundColor: '#3D2A00', border: '1px solid #BA7517', color: '#F5A623' }}
        >
          <AlertTriangle className="w-4 h-4" />
          INTERNAL FLOW SELECTOR (DEV ONLY)
        </div>

        {/* Info Box */}
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-lg text-xs mb-8 w-full max-w-[600px]"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#95A5A6' }}
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#6C7A89' }} />
          <span>For internal testing only. In production, flow is selected automatically based on device.</span>
        </div>

        {/* Logo + Title */}
        <img src={posaiLogo} alt="POS ai" className="h-14 object-contain mb-3" />
        <h1 className="text-white text-xl font-bold mb-1 font-montserrat">Welcome to POS AI KDS</h1>
        <p className="text-sm mb-10 font-montserrat" style={{ color: '#6C7A89' }}>
          Select a device type and user scenario
        </p>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* LEFT: Hardware */}
          <div
            className="rounded-xl p-6"
            style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <Monitor className="w-5 h-5" style={{ color: '#6C7A89' }} />
              </div>
              <h2 className="text-white text-lg font-bold font-montserrat">POSAI KDS Hardware</h2>
            </div>
            <p className="text-xs mb-6 font-montserrat" style={{ color: '#6C7A89' }}>
              For fixed KDS / POS / kiosk devices detected by system
            </p>

            <div className="flex flex-col gap-3">
              <FlowButton icon={<UserPlus className="w-4 h-4" />} label="New User" onClick={onHardwareNew} />
              <FlowButton icon={<LogIn className="w-4 h-4" />} label="Existing User" onClick={onHardwareExisting} />
            </div>
          </div>

          {/* RIGHT: BYOD */}
          <div
            className="rounded-xl p-6"
            style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <Smartphone className="w-5 h-5" style={{ color: '#6C7A89' }} />
              </div>
              <h2 className="text-white text-lg font-bold font-montserrat">Own iPad / Tablet</h2>
            </div>
            <p className="text-xs mb-6 font-montserrat" style={{ color: '#6C7A89' }}>
              For personal devices using KDS app
            </p>

            <div className="flex flex-col gap-3">
              <FlowButton icon={<UserPlus className="w-4 h-4" />} label="New User" onClick={onBYODNew} />
              <FlowButton icon={<LogIn className="w-4 h-4" />} label="Existing User" onClick={onBYODExisting} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FlowButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all font-montserrat font-semibold text-sm min-h-[48px]"
      style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
    >
      {icon}
      {label}
    </button>
  );
}
