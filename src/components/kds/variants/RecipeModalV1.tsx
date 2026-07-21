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
      className="mt-2 inline-flex items-center rounded-full px-3 py-1 text-[14px] font-semibold transition-colors"
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
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[960px] max-h-[90vh] rounded-xl overflow-hidden shadow-2xl flex flex-col"
        style={{ background: '#FFFFFF' }}
        role="dialog"
        aria-modal="true"
        aria-label={`Recipe for ${product.name}`}
      >
        {/* HEADER */}
        <div
          className="flex items-center justify-between px-6"
          style={{ background: '#1A1A2E', height: 64 }}
        >
          <span className="truncate text-white" style={{ fontSize: 22, fontWeight: 700 }}>
            {product.name}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Recipe"
            className="shrink-0 flex items-center justify-center rounded-full"
            style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto p-6 space-y-5" style={{ background: '#FFFFFF' }}>
          {allergen && (
            <div
              className="flex items-start gap-3 rounded-lg p-4"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
            >
              <AlertTriangle size={22} color="#E84C3D" className="shrink-0 mt-0.5" />
              <div className="text-[16px] leading-snug" style={{ color: '#991B1B' }}>
                <span style={{ fontWeight: 700 }}>Customer allergy, {allergen.label}.</span>{' '}
                Use separate utensils and clean surface before preparing.
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-5">
            {/* INGREDIENTS */}
            <div>
              <div
                className="mb-2 text-[12px] font-bold uppercase tracking-wider"
                style={{ color: '#6B7280' }}
              >
                Ingredients
              </div>
              <div
                className="rounded-lg p-4 space-y-2"
                style={{ background: '#F8FAFC', border: '0.5px solid #E5E7EB' }}
              >
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-3 text-[16px] leading-snug">
                    <span style={{ color: '#E84C3D', fontWeight: 700, minWidth: 80 }}>{ing.qty}</span>
                    <span style={{ color: '#374151' }}>{ing.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* STEPS */}
            <div>
              <div
                className="mb-2 text-[12px] font-bold uppercase tracking-wider"
                style={{ color: '#6B7280' }}
              >
                Preparation
              </div>
              <div className="space-y-3">
                {recipe.steps.map((step: RecipeStep, i) => (
                  <div key={i} className="flex gap-3">
                    <span
                      className="shrink-0 inline-flex items-center justify-center rounded-full text-[13px] font-bold"
                      style={{ width: 26, height: 26, background: '#F3F4F6', color: '#374151' }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px]" style={{ color: '#374151', lineHeight: 1.5 }}>
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
            className="rounded-lg p-4"
            style={{ background: '#F8FAFC', border: '0.5px solid #E5E7EB' }}
          >
            <div
              className="mb-1.5 text-[12px] font-bold uppercase tracking-wider"
              style={{ color: '#6B7280' }}
            >
              Plating note
            </div>
            <div className="text-[15px]" style={{ color: '#374151', lineHeight: 1.5 }}>
              {recipe.plating}
            </div>
          </div>
        </div>
      </div>

    </div>,
    document.body
  );
}
