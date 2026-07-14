import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Printer, ScanLine, Camera, CameraOff, ArrowLeft, Check } from 'lucide-react';
import { useOrderStore } from '@/hooks/use-order-store';
import { encodeScanValue, decodeScanValue, publishScan } from '@/lib/qr-scan-bus';
import { toast } from '@/hooks/use-toast';

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
  qrValue: string;
  done: boolean;
}

export default function QrStickersPage() {
  const { orders } = useOrderStore();
  const [scannerOn, setScannerOn] = useState(false);
  const [manual, setManual] = useState('');
  const [lastScan, setLastScan] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElId = 'qr-camera-region';

  const stickers = useMemo<Sticker[]>(() => {
    const list: Sticker[] = [];
    for (const o of orders) {
      for (const c of o.courses) {
        for (const it of c.items) {
          list.push({
            key: `${o.id}-${it.id}`,
            orderId: o.id,
            itemId: it.id,
            orderNumber: String(o.orderNumber),
            table: o.tableName || o.orderType || '',
            guest: o.guestName,
            courseName: String(c.course),
            itemName: it.name,
            modifiers: (it.modifiers ?? []).map(m => m.text).filter(Boolean),
            qrValue: encodeScanValue(o.id, it.id),
            done: !!it.isCompleted,
          });
        }
      }
    }
    return list;
  }, [orders]);

  const fireScan = (raw: string) => {
    const decoded = decodeScanValue(raw);
    if (!decoded) {
      toast({ title: 'Unrecognized QR', description: raw });
      return;
    }
    publishScan(decoded.orderId, decoded.itemId);
    setLastScan(raw);
    toast({ title: 'Scan sent', description: 'Product marked as Served on the tickets screen.' });
  };

  // Camera scanner lifecycle
  useEffect(() => {
    if (!scannerOn) return;
    let cancelled = false;
    const instance = new Html5Qrcode(scannerElId, { verbose: false });
    scannerRef.current = instance;

    instance
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          if (cancelled) return;
          fireScan(decodedText);
        },
        () => {
          /* per-frame errors ignored */
        },
      )
      .catch((err) => {
        toast({
          title: 'Camera unavailable',
          description: err?.message ?? 'Could not start the camera.',
        });
        setScannerOn(false);
      });

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      scannerRef.current = null;
      if (s && s.getState() === Html5QrcodeScannerState.SCANNING) {
        s.stop().then(() => s.clear()).catch(() => {});
      } else {
        try { s?.clear(); } catch { /* noop */ }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannerOn]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* On-screen (non-print) header + scanner controls */}
      <div className="print:hidden sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <Link to="/kds/v7" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Tickets
          </Link>
          <h1 className="text-lg font-semibold flex-1">Product QR stickers</h1>
          <button
            type="button"
            onClick={() => setScannerOn(s => !s)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
          >
            {scannerOn ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            {scannerOn ? 'Stop camera' : 'Scan with camera'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            <Printer className="w-4 h-4" /> Print all
          </button>
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-3 flex flex-wrap items-start gap-3">
          {scannerOn && (
            <div className="rounded-xl border border-border bg-card p-2">
              <div id={scannerElId} className="w-[280px] h-[280px] rounded-lg overflow-hidden bg-black" />
            </div>
          )}
          <form
            onSubmit={e => { e.preventDefault(); if (manual.trim()) { fireScan(manual.trim()); setManual(''); } }}
            className="flex-1 min-w-[240px] flex items-center gap-2"
          >
            <ScanLine className="w-4 h-4 text-muted-foreground" />
            <input
              autoFocus
              value={manual}
              onChange={e => setManual(e.target.value)}
              placeholder="Or scan with a USB/BT reader (types here)"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button type="submit" className="rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-semibold">
              Send scan
            </button>
          </form>
          {lastScan && (
            <div className="w-full text-[11px] text-muted-foreground inline-flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" /> Last scan: <code className="font-mono">{lastScan}</code>
            </div>
          )}
        </div>
      </div>

      {/* Sticker grid — one QR per product per order */}
      <div className="max-w-5xl mx-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 print:gap-0 print:grid-cols-1">
        {stickers.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-12">
            No active orders to print.
          </div>
        )}
        {stickers.map(s => (
          <article
            key={s.key}
            onClick={() => fireScan(s.qrValue)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fireScan(s.qrValue); } }}
            title="Tap to mark this product as Ready on the tickets screen"
            className="sticker cursor-pointer select-none rounded-xl border border-border bg-card p-3 flex gap-3 items-start hover:border-primary/60 hover:shadow-md active:scale-[0.99] transition print:cursor-auto print:rounded-none print:border-black print:break-after-page"
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
                  <span className="text-[10px] font-bold uppercase text-emerald-600">Served</span>
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
            </div>
          </article>
        ))}
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
