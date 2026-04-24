import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const STORAGE_KEY = 'posai-printer-assignments';

export interface PrinterAssignment {
  printerId: string | null;
  printerName: string;
  status: 'online' | 'offline' | 'low-paper';
}

export interface PrinterAssignments {
  kot: PrinterAssignment;
  label: PrinterAssignment;
  labelEnabled: boolean;
}

const defaults: PrinterAssignments = {
  kot: { printerId: null, printerName: '', status: 'offline' },
  label: { printerId: null, printerName: '', status: 'offline' },
  labelEnabled: false,
};

function load(): PrinterAssignments {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

interface PrinterAssignmentsContextValue extends PrinterAssignments {
  setKotPrinter: (a: PrinterAssignment) => void;
  setLabelPrinter: (a: PrinterAssignment) => void;
  setLabelEnabled: (v: boolean) => void;
}

const Ctx = createContext<PrinterAssignmentsContextValue | null>(null);

export function PrinterAssignmentsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PrinterAssignments>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <Ctx.Provider
      value={{
        ...state,
        setKotPrinter: (a) => setState((p) => ({ ...p, kot: a })),
        setLabelPrinter: (a) =>
          setState((p) => ({
            ...p,
            label: a,
            // Auto-enable label printing when a printer is assigned; disable when cleared.
            labelEnabled: !!a.printerId,
          })),
        setLabelEnabled: (v) => setState((p) => ({ ...p, labelEnabled: v })),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function usePrinterAssignments() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePrinterAssignments must be used within PrinterAssignmentsProvider');
  return ctx;
}
