import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';
import type { OrderItem } from '@/types/kds';
import { getRecipeForProduct, type RecipeStep } from '@/data/recipe-data';

interface Props {
  product: OrderItem | null;
  onClose: () => void;
}

interface TimerState {
  running: boolean;
  remaining: number; // seconds
}

function TimerChip({ minutes }: { minutes: number }) {
  const [state, setState] = useState<TimerState>({ running: false, remaining: minutes * 60 });
  const ref = useRef<number | null>(null);

  useEffect(() => () => { if (ref.current) window.clearInterval(ref.current); }, []);

  const start = () => {
    if (state.running) return;
    setState((s) => ({ running: true, remaining: s.remaining > 0 ? s.remaining : minutes * 60 }));
    ref.current = window.setInterval(() => {
      setState((s) => {
        if (s.remaining <= 1) {
          if (ref.current) { window.clearInterval(ref.current); ref.current = null; }
          return { running: false, remaining: 0 };
        }
        return { ...s, remaining: s.remaining - 1 };
      });
    }, 1000);
  };

  const mm = Math.floor(state.remaining / 60);
  const ss = state.remaining % 60;
  const label = state.running
    ? `${mm}:${ss.toString().padStart(2, '0')} running`
    : `Start ${minutes} min timer`;
  const bg = state.running ? '#ECFDF5' : '#EFF6FF';
  const color = state.running ? '#059669' : '#2563EB';

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); start(); }}
      className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors"
      style={{ background: bg, color }}
    >
      {label}
    </button>
  );
}

export function RecipeModalV1({ product, onClose }: Props) {
  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  if (!product) return null;

  const recipe = getRecipeForProduct(product.name);
  const allergen = product.allergens[0];

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[640px] max-h-[85vh] rounded-lg overflow-hidden shadow-2xl flex flex-col"
        style={{ background: '#FFFFFF' }}
        role="dialog"
        aria-modal="true"
        aria-label={`Recipe for ${product.name}`}
      >
        {/* HEADER */}
        <div
          className="flex items-center justify-between px-4"
          style={{ background: '#1A1A2E', height: 48 }}
        >
          <span className="truncate text-white" style={{ fontSize: 16, fontWeight: 700 }}>
            {product.name}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close recipe"
            className="shrink-0 flex items-center justify-center rounded-full"
            style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto p-4 space-y-4" style={{ background: '#FFFFFF' }}>
          {allergen && (
            <div
              className="flex items-start gap-2 rounded-lg p-3"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
            >
              <AlertTriangle size={16} color="#E84C3D" className="shrink-0 mt-0.5" />
              <div className="text-[12px] leading-snug" style={{ color: '#991B1B' }}>
                <span style={{ fontWeight: 700 }}>Customer allergy, {allergen.label}.</span>{' '}
                Use separate utensils and clean surface before preparing.
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* INGREDIENTS */}
            <div>
              <div
                className="mb-1.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ color: '#6B7280' }}
              >
                Ingredients
              </div>
              <div
                className="rounded-lg p-2.5 space-y-1"
                style={{ background: '#F8FAFC', border: '0.5px solid #E5E7EB' }}
              >
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-2 text-[12px] leading-snug">
                    <span style={{ color: '#E84C3D', fontWeight: 700, minWidth: 60 }}>{ing.qty}</span>
                    <span style={{ color: '#374151' }}>{ing.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* STEPS */}
            <div>
              <div
                className="mb-1.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ color: '#6B7280' }}
              >
                Preparation
              </div>
              <div className="space-y-2">
                {recipe.steps.map((step: RecipeStep, i) => (
                  <div key={i} className="flex gap-2">
                    <span
                      className="shrink-0 inline-flex items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ width: 18, height: 18, background: '#F3F4F6', color: '#374151' }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px]" style={{ color: '#374151', lineHeight: 1.5 }}>
                        {step.text}
                      </div>
                      {step.timerMinutes && <TimerChip minutes={step.timerMinutes} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PLATING */}
          <div
            className="rounded-lg p-2.5"
            style={{ background: '#F8FAFC', border: '0.5px solid #E5E7EB' }}
          >
            <div
              className="mb-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: '#6B7280' }}
            >
              Plating note
            </div>
            <div className="text-[12px]" style={{ color: '#374151', lineHeight: 1.5 }}>
              {recipe.plating}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
