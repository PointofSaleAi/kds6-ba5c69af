import { motion } from 'framer-motion';
import { AlertTriangle, Info, Monitor, Smartphone } from 'lucide-react';
import posaiLogo from '@/assets/posai-logo.png';

interface DevScenarioSelectorProps {
  onSelectHardware: () => void;
  onSelectBYOD: () => void;
  onExitDevMode: () => void;
}

export default function DevScenarioSelector({
  onSelectHardware,
  onSelectBYOD,
  onExitDevMode,
}: DevScenarioSelectorProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ backgroundColor: '#0D0D1A' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center w-full max-w-[420px] px-4"
      >
        {/* Dev Mode Badge */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4"
          style={{
            backgroundColor: '#3D2A00',
            border: '1px solid #BA7517',
            color: '#F5A623',
          }}
        >
          <AlertTriangle className="w-4 h-4" />
          DEVELOPMENT MODE
        </div>

        {/* Info Box */}
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-lg text-xs mb-8 w-full"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#95A5A6',
          }}
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#6C7A89' }} />
          <span>
            QA/Dev Testing Only: This screen won't appear in production. Device type is auto-detected automatically.
          </span>
        </div>

        {/* Logo + Title */}
        <img src={posaiLogo} alt="POS ai" className="h-14 object-contain mb-3" />
        <h1 className="text-white text-xl font-bold mb-1">Welcome to POS AI KDS</h1>
        <p className="text-sm mb-8" style={{ color: '#6C7A89' }}>
          Select a scenario to preview the login flow
        </p>

        {/* Cards */}
        <div className="flex flex-col gap-4 w-full">
          <ScenarioCard
            icon={<Monitor className="w-6 h-6" style={{ color: '#6C7A89' }} />}
            title="POS AI Hardware"
            subtitle="Device sold and shipped by POS AI - MAC auto-detected"
            onClick={onSelectHardware}
          />
          <ScenarioCard
            icon={<Smartphone className="w-6 h-6" style={{ color: '#6C7A89' }} />}
            title="Customer's Own Device (BYOD)"
            subtitle="Customer's own iPad or tablet - Needs manual activation"
            onClick={onSelectBYOD}
          />
        </div>

        {/* Exit dev mode */}
        <button
          onClick={onExitDevMode}
          className="mt-8 text-xs underline transition-colors hover:text-white"
          style={{ color: '#6C7A89' }}
        >
          Exit dev mode
        </button>
      </motion.div>
    </div>
  );
}

function ScenarioCard({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 w-full p-4 rounded-xl text-left transition-all hover:border-white/20"
      style={{
        backgroundColor: '#1A1A2E',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#22223A';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#1A1A2E';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      }}
    >
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
      >
        {icon}
      </div>
      <div>
        <p className="text-white text-lg font-bold">{title}</p>
        <p className="text-sm" style={{ color: '#6C7A89' }}>{subtitle}</p>
      </div>
    </button>
  );
}
