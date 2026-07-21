import { useState } from 'react';
import { Cpu, Printer, Tag, Volume2, Server, RefreshCw } from 'lucide-react';
import { SectionHeaderCard } from '@/components/settings/SectionHeaderCard';
import { SettingsPill } from '@/components/settings/SettingsPill';
import { SwitchToggle, ValueText, useHashHighlight } from '@/components/settings/SettingsControls';
import { usePrinterAssignments } from '@/hooks/use-printer-assignments';
import PrinterRoutingModal, { type PrinterModalType } from '@/pages/PrinterRoutingModal';
import SoundSettings from '@/pages/SoundSettings';
import WebSocketSettings from '@/pages/WebSocketSettings';
import { GROUP_COLOR } from '@/components/settings/SettingsSidebar';

export default function HardwareSettings() {
  const { kot, label, labelEnabled, setLabelEnabled, setKotPrinter, setLabelPrinter } = usePrinterAssignments();
  const [printerOpen, setPrinterOpen] = useState(false);
  const [printerType, setPrinterType] = useState<PrinterModalType>('kot');
  const [soundOpen, setSoundOpen] = useState(false);
  const [connectionOpen, setConnectionOpen] = useState(false);
  const hash = useHashHighlight();

  const openPrinter = (type: PrinterModalType) => {
    setPrinterType(type);
    setPrinterOpen(true);
  };

  return (
    <>
      <SectionHeaderCard
        icon={Cpu}
        iconColor={GROUP_COLOR.hardware}
        title="Hardware"
        shortDescription="Pair printers, configure sound alerts, and manage your network connection."
        longDescription="Pair printers, configure sound alerts, and manage your network connection. The KDS supports a dedicated KOT printer for kitchen tickets and an optional Label printer for per-product stickers."
      />

      <SettingsPill
        icon={Printer}
        iconColor="#5E4DD8"
        label="KOT Printer"
        helper={kot.printerId ? `Connected to ${kot.printerName}` : 'No printer assigned. Tap to pair one.'}
        right={<ValueText>{kot.printerId ? kot.printerName : 'Not set'}</ValueText>}
        onClick={() => openPrinter('kot')}
        highlighted={hash === 'kot-printer'}
      />

      <SettingsPill
        icon={Tag}
        iconColor="#0A84FF"
        label="Label Printer"
        helper={label.printerId ? `Connected to ${label.printerName}` : 'No printer assigned. Tap to pair one.'}
        right={<ValueText>{label.printerId ? label.printerName : 'Not set'}</ValueText>}
        onClick={() => openPrinter('label')}
        highlighted={hash === 'label-printer'}
      />

      <SettingsPill
        icon={Volume2}
        iconColor="#F9900E"
        label="Sound Settings"
        helper="Volume, custom alert sounds, and per-event toggles."
        onClick={() => setSoundOpen(true)}
        highlighted={hash === 'sound-settings'}
      />

      <SettingsPill
        icon={RefreshCw}
        iconColor="#16A085"
        label="Sync"
        helper="Force sync of orders and settings with the cloud."
        onClick={() => {
          // Simulated sync action
          window.dispatchEvent(new CustomEvent('posai:sync-now'));
        }}
        highlighted={hash === 'sync'}
      />

      <SettingsPill
        icon={Server}
        iconColor="#34A885"
        label="Connection"
        helper="EdgeOS local backup, cloud sync status, and device name."
        onClick={() => setConnectionOpen(true)}
        highlighted={hash === 'connection'}
      />

      <PrinterRoutingModal
        open={printerOpen}
        onClose={() => setPrinterOpen(false)}
        type={printerType}
        initialSelectedId={printerType === 'kot' ? kot.printerId : label.printerId}
        onConfirm={(printer) => {
          if (printerType === 'kot') {
            setKotPrinter({ printerId: printer.id, printerName: printer.name, status: printer.status });
          } else {
            setLabelPrinter({ printerId: printer.id, printerName: printer.name, status: printer.status });
          }
        }}
      />
      <SoundSettings open={soundOpen} onClose={() => setSoundOpen(false)} />
      <WebSocketSettings open={connectionOpen} onClose={() => setConnectionOpen(false)} />
    </>
  );
}
