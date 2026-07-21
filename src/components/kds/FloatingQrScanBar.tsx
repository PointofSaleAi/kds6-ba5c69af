import { useMemo, useState } from 'react';
import { QrCode, ScanLine, X, Check } from 'lucide-react';
import { useOrderStore } from '@/hooks/use-order-store';
import { toast } from '@/hooks/use-toast';

/**
 * Floating QR scan bar (bottom-right).
 *
 * Real camera-based QR scanning is not available in this preview sandbox, so we
 * expose a compact simulated scanner: pick or type a product code / name and it
 * marks the matching item as Served across the active orders. Every product row
 * in this build has a stable id, so a physical scanner sending the id string
 * would work the same way.
 */
export function FloatingQrScanBar() {
  const { orders, markItemDone } = useOrderStore();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const items = useMemo(() => {
    const list: { id: string; name: string; orderId: string; orderNumber: string; done: boolean }[] = [];
    for (const o of orders) {
      for (const c of o.courses) {
        for (const it of c.items) {
          list.push({
            id: it.id,
            name: it.name,
            orderId: o.id,
            orderNumber: String(o.orderNumber),
            done: !!it.isCompleted,
          });
        }
      }
    }
    return list;
  }, [orders]);

  const handleScan = (raw: string) => {
    const q = raw.trim().toLowerCase();
    if (!q) return;
    const match =
      items.find(i => i.id.toLowerCase() === q) ??
      items.find(i => i.name.toLowerCase() === q) ??
      items.find(i => i.name.toLowerCase().includes(q));

    if (!match) {
      toast({ title: 'No Product Matched', description: `"${raw}" was not found on any active ticket.` });
      return;
    }
    if (match.done) {
      toast({ title: 'Already Served', description: `${match.name} on #${match.orderNumber}.` });
    } else {
      markItemDone(match.orderId, match.id);
      toast({ title: 'Marked as Served', description: `${match.name} on #${match.orderNumber}.` });
    }
    setValue('');
  };

  return (
    <div className="fixed bottom-16 right-4 z-[70] flex flex-col items-end gap-2">
      {open && (
        <div className="w-[320px] rounded-2xl border border-border bg-background/95 backdrop-blur shadow-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ScanLine className="w-4 h-4" />
              QR product scanner
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 hover:bg-muted"
              aria-label="Close Scanner"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground mb-2 leading-snug">
            Scan or select a product code. Matching items are marked <span className="font-semibold text-foreground">Served</span> instantly.
          </p>

          <form
            onSubmit={e => {
              e.preventDefault();
              handleScan(value);
            }}
            className="flex items-center gap-2"
          >
            <input
              autoFocus
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Scan or Type Product…"
              list="qr-scan-items"
              className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <datalist id="qr-scan-items">
              {items
                .filter(i => !i.done)
                .slice(0, 50)
                .map(i => (
                  <option key={`${i.orderId}-${i.id}`} value={i.name}>
                    #{i.orderNumber}
                  </option>
                ))}
            </datalist>
            <button
              type="submit"
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 inline-flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Scan
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle QR Scanner"
        className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition"
      >
        <QrCode className="w-6 h-6" />
      </button>
    </div>
  );
}
