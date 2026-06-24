import { Phone } from 'lucide-react';

interface CustomerContactStripProps {
  customerName?: string;
  customerPhone?: string;
}

/**
 * Dark navy contact strip rendered between the OrderTypeBadge and the red
 * status header. Only shown on the Online Ordering scenario route, and only
 * when a phone number exists on the order.
 */
export function CustomerContactStrip({ customerName, customerPhone }: CustomerContactStripProps) {
  if (!customerPhone) return null;

  const pillStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: '3px 10px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: '#fff',
    fontSize: 10,
    fontWeight: 500,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  };

  const iconColor = 'rgba(255,255,255,0.6)';

  return (
    <div
      style={{
        backgroundColor: '#1A1A2E',
        padding: '6px 10px',
        display: 'flex',
        gap: 6,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <span style={pillStyle}>
        <Phone size={11} color={iconColor} strokeWidth={2} />
        {customerPhone}
      </span>
    </div>
  );
}
