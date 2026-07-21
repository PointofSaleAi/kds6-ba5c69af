import { motion } from 'framer-motion';
import { AlertTriangle, Info, UserPlus, LogIn } from 'lucide-react';
import PosaiLogo from '@/components/PosaiLogo';

interface DevScenarioSelectorProps {
  onNewUser: () => void;
  onExistingUser: () => void;
}

export default function DevScenarioSelector({
  onNewUser,
  onExistingUser,
}: DevScenarioSelectorProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ backgroundColor: '#0D0D1A' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center w-full max-w-[860px] px-6"
      >
        {/* Dev mode Badge */}
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
          <span>For internal testing only. In production, flow is detected automatically based on user.</span>
        </div>

        {/* Logo + Title */}
        <PosaiLogo variant="light" className="h-24 object-contain mb-3" />
        <h1 className="text-white text-xl font-bold mb-1 font-montserrat">Welcome to Point of Sale Ai Kitchen Display</h1>
        <p className="text-sm mb-10 font-montserrat" style={{ color: '#6C7A89' }}>
          Select a scenario to preview the login flow
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[600px]">
          <ScenarioCard
            icon={<UserPlus className="w-5 h-5" style={{ color: '#6C7A89' }} />}
            title="New User"
            subtitle="First Time Activating This Device"
            onClick={onNewUser}
          />
          <ScenarioCard
            icon={<LogIn className="w-5 h-5" style={{ color: '#6C7A89' }} />}
            title="Existing User"
            subtitle="Device Already Activated - Sign in with PIN"
            onClick={onExistingUser}
          />
        </div>
      </motion.div>
    </div>
  );
}

function ScenarioCard({ icon, title, subtitle, onClick }: { icon: React.ReactNode; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-4 w-full px-5 py-5 rounded-xl text-left transition-all min-h-[48px]"
      style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1A1A2E'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-white text-sm font-bold font-montserrat">{title}</span>
        <span className="text-xs font-montserrat" style={{ color: '#6C7A89' }}>{subtitle}</span>
      </div>
    </button>
  );
}
