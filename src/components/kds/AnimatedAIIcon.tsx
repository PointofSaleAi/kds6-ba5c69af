import aiEIcon from "@/assets/ai-e-icon.png";

interface AnimatedAIIconProps {
  onClick?: () => void;
  size?: number;
  className?: string;
}

/**
 * Animated "e" AI logo from the POS project: pulsing radial glow rings,
 * subtle icon scale pulse, and three orbiting gradient stars.
 */
const AnimatedAIIcon = ({ onClick, size = 18, className = "" }: AnimatedAIIconProps) => {
  const box = size + 12;
  return (
    <div
      onClick={onClick}
      className={`ai-icon-btn relative flex-shrink-0 overflow-visible ${className}`}
      style={{ width: box, height: box, minWidth: box, minHeight: box }}
    >
      <div
        className="absolute inset-0 rounded-full ai-pulse-outer"
        style={{ background: "radial-gradient(circle, hsla(280, 80%, 60%, 0.4) 0%, hsla(220, 90%, 56%, 0.2) 50%, transparent 70%)" }}
      />
      <div
        className="absolute inset-1 rounded-full ai-pulse-inner"
        style={{ background: "radial-gradient(circle, hsla(25, 95%, 53%, 0.3) 0%, hsla(280, 80%, 60%, 0.15) 60%, transparent 80%)" }}
      />
      <div className="absolute inset-0 flex items-center justify-center ai-icon-pulse">
        <img
          src={aiEIcon}
          alt="AI Assistant"
          style={{ width: size, height: size, filter: "drop-shadow(0 0 4px hsla(280, 80%, 60%, 0.35))" }}
          className="relative z-10"
        />
      </div>

      {[
        { cls: "ai-orbit-1", s: 6, id: "g1", c1: "hsl(280, 80%, 70%)", c2: "hsl(220, 90%, 65%)" },
        { cls: "ai-orbit-2", s: 5, id: "g2", c1: "hsl(25, 95%, 60%)", c2: "hsl(280, 80%, 65%)" },
        { cls: "ai-orbit-3", s: 4, id: "g3", c1: "hsl(220, 90%, 70%)", c2: "hsl(25, 95%, 65%)" },
      ].map(o => (
        <div
          key={o.id}
          className={`absolute ${o.cls}`}
          style={{ width: o.s, height: o.s, top: "50%", left: "50%", marginTop: -o.s / 2, marginLeft: -o.s / 2 }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill={`url(#${o.id})`} />
            <defs>
              <linearGradient id={o.id} x1="4" y1="2" x2="20" y2="18">
                <stop stopColor={o.c1} />
                <stop offset="1" stopColor={o.c2} />
              </linearGradient>
            </defs>
          </svg>
        </div>
      ))}

      <style>{`
        .ai-pulse-outer { animation: aiPulseOuter 2.5s ease-in-out infinite; }
        .ai-pulse-inner { animation: aiPulseInner 2s ease-in-out infinite 0.3s; }
        .ai-icon-pulse { animation: aiIconPulse 1.8s ease-in-out infinite; }
        .ai-orbit-1 { animation: aiOrbit1 4s linear infinite; pointer-events: none; }
        .ai-orbit-2 { animation: aiOrbit2 3.5s linear infinite 0.5s; pointer-events: none; }
        .ai-orbit-3 { animation: aiOrbit3 5s linear infinite 1s; pointer-events: none; }
        @keyframes aiPulseOuter { 0%,100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.3); opacity: 0.3; } }
        @keyframes aiPulseInner { 0%,100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.15); opacity: 0.4; } }
        @keyframes aiIconPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        @keyframes aiOrbit1 { 0% { transform: translate(0,-14px); opacity:1; } 25% { transform: translate(14px,0); opacity:.8; } 50% { transform: translate(0,14px); opacity:1; } 75% { transform: translate(-14px,0); opacity:.8; } 100% { transform: translate(0,-14px); opacity:1; } }
        @keyframes aiOrbit2 { 0% { transform: translate(11px,0); opacity:.9; } 25% { transform: translate(0,11px); opacity:1; } 50% { transform: translate(-11px,0); opacity:.9; } 75% { transform: translate(0,-11px); opacity:1; } 100% { transform: translate(11px,0); opacity:.9; } }
        @keyframes aiOrbit3 { 0% { transform: translate(-9px,-9px); opacity:.8; } 25% { transform: translate(-9px,9px); opacity:1; } 50% { transform: translate(9px,9px); opacity:.8; } 75% { transform: translate(9px,-9px); opacity:1; } 100% { transform: translate(-9px,-9px); opacity:.8; } }
      `}</style>
    </div>
  );
};

export default AnimatedAIIcon;
