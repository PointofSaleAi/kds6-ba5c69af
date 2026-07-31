import { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';

export interface StickerPayload {
  orderNumber: string;
  tableNumber: string;
  orderType: string;
  itemSequence: string;
  productName: string;
  productSize: string;
  modifiers: string[];
  qrPayload: string;
  fallbackCode: string;
  timestamp: string;
}

export type StickerSizeKey = '2x1' | '2x2' | '2.25x1.25' | '2.25x4' | '62mm-auto';

interface SizeSpec {
  key: StickerSizeKey;
  label: string;
  note: string;
  /** CSS width/height for screen + print box */
  width: string;
  height: string; // 'auto' for continuous roll
  /** @page size value */
  pageSize: string;
  maxModifiers: number;
  qrSize: number; // px at 96dpi, min ~57px = 15mm
  nameSize: string;
  metaSize: string;
  modSize: string;
  layout: 'row' | 'column';
  /** Show "SCAN AT PACKING STAGE TO COMPLETE" micro-copy (large labels only) */
  cta?: boolean;
}

// 15mm ≈ 0.59in ≈ 57px @96dpi. Never go below 60px.
const SIZES: SizeSpec[] = [
  {
    key: '2x1',
    label: '2" × 1"',
    note: '50 × 25 mm · Compact / lid label',
    width: '2in',
    height: '1in',
    pageSize: '2in 1in',
    maxModifiers: 0,
    qrSize: 60,
    nameSize: '11px',
    metaSize: '7px',
    modSize: '7px',
    layout: 'row',
  },
  {
    key: '2x2',
    label: '2" × 2"',
    note: '50 × 50 mm · QSR / coffee cup',
    width: '2in',
    height: '2in',
    pageSize: '2in 2in',
    maxModifiers: 2,
    qrSize: 62,
    nameSize: '15px',
    metaSize: '8px',
    modSize: '9px',
    layout: 'column',
  },
  {
    key: '2.25x1.25',
    label: '2.25" × 1.25"',
    note: '57 × 32 mm · Mobile / desktop standard',
    width: '2.25in',
    height: '1.25in',
    pageSize: '2.25in 1.25in',
    maxModifiers: 1,
    qrSize: 62,
    nameSize: '12px',
    metaSize: '7px',
    modSize: '8px',
    layout: 'row',
  },
  {
    key: '2.25x4',
    label: '2.25" × 4"',
    note: '57 × 101 mm · Large box / pizza',
    width: '2.25in',
    height: '4in',
    pageSize: '2.25in 4in',
    maxModifiers: 4,
    qrSize: 104,
    nameSize: '20px',
    metaSize: '10px',
    modSize: '12px',
    layout: 'column',
  },
  {
    key: '62mm-auto',
    label: '62 mm continuous',
    note: 'Brother QL roll · height grows with content',
    width: '62mm',
    height: 'auto',
    pageSize: '62mm auto',
    maxModifiers: 99,
    qrSize: 104,
    nameSize: '18px',
    metaSize: '9px',
    modSize: '11px',
    layout: 'column',
  },
];

const SAMPLE: StickerPayload = {
  orderNumber: '#104',
  tableNumber: 'Table 04',
  orderType: 'Takeaway',
  itemSequence: '1 of 3',
  productName: 'Matcha Latte',
  productSize: 'Large',
  modifiers: ['70% Sweetness', 'Oat Milk', 'Extra Ice', 'Add Espresso Shot', 'Less Foam'],
  qrPayload: 'ITEM_UUID_9F82A',
  fallbackCode: 'A9F',
  timestamp: '15:42 PM',
};

function truncateModifiers(modifiers: string[], max: number) {
  if (max <= 0) return { shown: [] as string[], overflow: modifiers.length };
  if (modifiers.length <= max) return { shown: modifiers, overflow: 0 };
  return { shown: modifiers.slice(0, max), overflow: modifiers.length - max };
}

export function StickerLabel({ spec, data }: { spec: SizeSpec; data: StickerPayload }) {
  const { shown, overflow } = truncateModifiers(data.modifiers, spec.maxModifiers);
  const row = spec.layout === 'row';

  const meta = (
    <div
      className="sticker-meta"
      style={{ fontSize: spec.metaSize, fontWeight: 700, letterSpacing: '0.02em', lineHeight: 1.25 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
        <span>{data.orderNumber} · {data.orderType.toUpperCase()}</span>
        <span>{data.timestamp}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
        <span>{data.tableNumber}</span>
        <span>{data.itemSequence}</span>
      </div>
    </div>
  );

  const body = (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: spec.nameSize,
          fontWeight: 900,
          lineHeight: 1.05,
          textTransform: 'uppercase',
          wordBreak: 'break-word',
        }}
      >
        {data.productName}
      </div>
      {data.productSize && (
        <div style={{ fontSize: spec.modSize, fontWeight: 800, lineHeight: 1.2 }}>
          {data.productSize.toUpperCase()}
        </div>
      )}
      {shown.length > 0 && (
        <ul style={{ margin: '2px 0 0', padding: 0, listStyle: 'none' }}>
          {shown.map((m) => (
            <li key={m} style={{ fontSize: spec.modSize, fontWeight: 500, lineHeight: 1.25 }}>
              • {m}
            </li>
          ))}
        </ul>
      )}
      {overflow > 0 && (
        <div style={{ fontSize: spec.modSize, fontWeight: 700, lineHeight: 1.25 }}>
          ... +{overflow} more on KDS
        </div>
      )}
    </div>
  );

  const qr = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <QRCodeSVG value={data.qrPayload} size={spec.qrSize} level="M" fgColor="#000000" bgColor="#FFFFFF" />
      <div style={{ fontFamily: 'Courier, monospace', fontSize: spec.metaSize, fontWeight: 900 }}>
        *{data.fallbackCode}*
      </div>
    </div>
  );

  return (
    <div
      className="sticker-label"
      data-size={spec.key}
      style={{
        width: spec.width,
        height: spec.height === 'auto' ? 'auto' : spec.height,
        minHeight: spec.height === 'auto' ? '1in' : undefined,
        background: '#FFFFFF',
        color: '#000000',
        border: '1px solid #000',
        boxSizing: 'border-box',
        padding: '5px 6px',
        display: 'flex',
        flexDirection: row ? 'row' : 'column',
        alignItems: row ? 'center' : 'stretch',
        justifyContent: row ? 'space-between' : 'flex-start',
        gap: row ? 6 : 3,
        fontFamily: 'Arial, Helvetica, sans-serif',
        overflow: 'hidden',
      }}
    >
      {row ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
            {meta}
            {body}
          </div>
          {qr}
        </>
      ) : (
        <>
          {meta}
          <div style={{ borderTop: '1px solid #000', margin: '2px 0' }} />
          {body}
          <div style={{ marginTop: 'auto', paddingTop: 4, display: 'flex', justifyContent: 'center' }}>{qr}</div>
        </>
      )}
    </div>
  );
}

export default function QrStickerLabPage() {
  const [printSize, setPrintSize] = useState<StickerSizeKey>('2x2');
  const [raw, setRaw] = useState(() => JSON.stringify(SAMPLE, null, 2));

  const { data, error } = useMemo(() => {
    try {
      return { data: JSON.parse(raw) as StickerPayload, error: '' };
    } catch (e) {
      return { data: SAMPLE, error: 'Invalid JSON, showing last valid sample.' };
    }
  }, [raw]);

  const activeSpec = SIZES.find((s) => s.key === printSize) ?? SIZES[1];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="print:hidden border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold">QR Sticker Lab</h1>
            <p className="text-xs text-muted-foreground">
              Thermal label templates with size-aware modifier truncation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={printSize}
              onChange={(e) => setPrintSize(e.target.value as StickerSizeKey)}
              className="h-9 rounded-md border border-border bg-background px-2 text-sm"
              aria-label="Label size to print"
            >
              {SIZES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={() => window.print()}
              className="h-9 inline-flex items-center gap-2 rounded-md bg-primary px-3 text-sm font-bold text-primary-foreground"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5 print:hidden">
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <section>
            <h2 className="text-sm font-bold mb-2">Payload (JSON)</h2>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              spellCheck={false}
              className="w-full h-[420px] rounded-md border border-border bg-card p-3 font-mono text-xs"
            />
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          </section>

          <section>
            <h2 className="text-sm font-bold mb-2">All label sizes</h2>
            <div className="flex flex-wrap items-start gap-6">
              {SIZES.map((spec) => (
                <figure key={spec.key} className="m-0">
                  <StickerLabel spec={spec} data={data} />
                  <figcaption className="mt-1.5 text-[11px] text-muted-foreground max-w-[2.25in]">
                    <span className="font-bold text-foreground">{spec.label}</span> · {spec.note}
                    <br />
                    Max modifiers: {spec.maxModifiers > 90 ? 'all' : spec.maxModifiers}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Print surface: only the selected size */}
      <div className="hidden print:block print-surface">
        <StickerLabel spec={activeSpec} data={data} />
      </div>

      <style>{`
        @media print {
          @page { size: ${activeSpec.pageSize}; margin: 0; }
          html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
          .print-surface .sticker-label { border: none !important; }
        }
      `}</style>
    </div>
  );
}
