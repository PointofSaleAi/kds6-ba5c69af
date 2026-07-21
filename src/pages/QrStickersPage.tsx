import { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check } from 'lucide-react';
import { useOrderStore } from '@/hooks/use-order-store';
import { encodeScanValue, decodeScanValue, publishScan } from '@/lib/qr-scan-bus';
import { toast } from '@/hooks/use-toast';
import { AllergenBadge } from '@/components/kds/AllergenBadge';
import type { Allergen } from '@/types/kds';

interface Sticker {
  key: string;
  orderId: string;
  itemId: string;
  orderNumber: string;
  table: string;
  guest?: string;
  courseName: string;
  itemName: string;
  modifiers: string[];
  allergens: Allergen[];
  notes?: string;
  qrValue: string;
  done: boolean;
}

export default function QrStickersPage() {
  const { orders } = useOrderStore();
  const [localDone, setLocalDone] = useState<Set<string>>(new Set());

  const stickers = useMemo<Sticker[]>(() => {
    const list: Sticker[] = [];
    for (const o of orders) {
      for (const c of o.courses) {
        for (const it of c.items) {
          const key = `${o.id}-${it.id}`;
          list.push({
            key,
            orderId: o.id,
            itemId: it.id,
            orderNumber: String(o.orderNumber),
            table: o.tableName || o.orderType || '',
            guest: o.guestName,
            courseName: String(c.course),
            itemName: it.name,
            modifiers: (it.modifiers ?? []).map(m => m.text).filter(Boolean),
            allergens: it.allergens ?? [],
            notes: it.notes,
            qrValue: encodeScanValue(o.id, it.id),
            done: !!it.isCompleted || localDone.has(key),
          });
        }
      }
    }
    return list;
  }, [orders, localDone]);

  const fireScan = (raw: string) => {
    const decoded = decodeScanValue(raw);
    if (!decoded) {
      toast({ title: 'Unrecognized QR', description: raw });
      return;
    }
    publishScan(decoded.orderId, decoded.itemId);
    setLocalDone(prev => {
      const next = new Set(prev);
      next.add(`${decoded.orderId}-${decoded.itemId}`);
      return next;
    });
    toast({ title: 'Scan Sent', description: 'Product marked as Served on the tickets screen.' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Title-only header */}
      <div className="print:hidden sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <h1 className="text-lg font-semibold">Product QR Stickers</h1>
        </div>
      </div>

      {/* Sticker grid — one QR per product per order */}
      <div className="max-w-5xl mx-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 print:gap-0 print:grid-cols-1">
        {stickers.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-12">
            No active orders to print.
          </div>
        )}
        {stickers.map(s => {
          const disabled = s.done;
          return (
            <article
              key={s.key}
              onClick={disabled ? undefined : () => fireScan(s.qrValue)}
              role={disabled ? undefined : 'button'}
              tabIndex={disabled ? -1 : 0}
              aria-disabled={disabled}
              onKeyDown={disabled ? undefined : (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fireScan(s.qrValue); } }}
              title={disabled ? 'This product is already served' : 'Tap to mark this product as Ready on the tickets screen'}
              className={[
                'sticker select-none rounded-xl border border-border bg-card p-3 flex gap-3 items-start transition',
                disabled
                  ? 'opacity-60 grayscale cursor-not-allowed'
                  : 'cursor-pointer hover:border-primary/60 hover:shadow-md active:scale-[0.99]',
                'print:cursor-auto print:rounded-none print:border-black print:break-after-page',
              ].join(' ')}
            >
              <div className="shrink-0 bg-white p-1.5 rounded-md border border-border">
                <QRCodeSVG value={s.qrValue} size={96} level="M" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    #{s.orderNumber} · {s.table}
                  </div>
                  {s.done && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-600">
                      <Check className="w-3 h-3" /> Served
                    </span>
                  )}
                </div>
                {s.guest && <div className="text-[11px] text-muted-foreground truncate">{s.guest}</div>}
                <div className="mt-0.5 text-[10px] font-semibold uppercase text-muted-foreground">{s.courseName}</div>
                <div className="text-sm font-bold leading-snug break-words">{s.itemName}</div>
                {s.modifiers.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {s.modifiers.slice(0, 4).map((m, i) => (
                      <li key={i} className="text-[11px] text-muted-foreground leading-tight">· {m}</li>
                    ))}
                  </ul>
                )}
                {s.allergens.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    {s.allergens.map(a => (
                      <AllergenBadge key={a.type} allergen={a} variant="item" suffix="allergy" />
                    ))}
                  </div>
                )}
                {s.notes && (
                  <div className="mt-1.5 text-[11px] text-foreground leading-tight break-words">
                    <span className="font-semibold text-muted-foreground">Note:</span> {s.notes}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <style>{`
        @media print {
          @page { size: 2.5in 1.75in; margin: 4mm; }
          html, body { background: #fff !important; }
          .sticker { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
