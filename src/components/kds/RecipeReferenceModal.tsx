import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, ChevronDown, ArrowLeft, Rewind, Volume2, Maximize2 } from 'lucide-react';
import type { OrderItem, Order } from '@/types/kds';
import { AllergenBadge } from '@/components/kds/AllergenBadge';
import { getRecipeReference } from '@/data/recipe-reference-data';

interface Props {
  product: OrderItem | null;
  order?: Order | null;
  courseLabel?: string;
  onClose: () => void;
  /** 'default' = full spacing; 'v3' = tighter, matches v3 card density */
  variant?: 'default' | 'v3';
}

/**
 * Recipe / prep reference modal. Front-end only, mock data.
 * Structure: header, allergen strip, ingredients scroller, prep step grid, optional video state.
 */
export function RecipeReferenceModal({ product, order, courseLabel, onClose, variant = 'default' }: Props) {
  const [videoMode, setVideoMode] = useState(false);
  const [yieldIdx, setYieldIdx] = useState(0);
  const [yieldOpen, setYieldOpen] = useState(false);

  useEffect(() => {
    if (!product) return;
    setVideoMode(false);
    setYieldIdx(0);
    setYieldOpen(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  if (!product) return null;

  const recipe = getRecipeReference(product.name);
  const isV3 = variant === 'v3';

  // Spacing scale
  const S = {
    pad: isV3 ? 16 : 20,
    gap: isV3 ? 12 : 16,
    itemName: isV3 ? 20 : 24,
    context: isV3 ? 11 : 12,
    sectionLabel: isV3 ? 11 : 12,
    ingCard: isV3 ? 40 : 44,
    stepImgH: isV3 ? 92 : 110,
    radius: 12,
  };

  const context = `${courseLabel ?? product.category ?? 'item'} · ${product.quantity}x on ticket #${order?.orderNumber ?? '—'}`;
  const modifierNote = product.modifiers.find((m) => m.type === 'extra');
  const hasVideo = !!recipe.video;

  const renderBold = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <span key={i} style={{ fontWeight: 700, color: '#FFFFFF' }}>{part.slice(2, -2)}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', fontFamily: 'Inter, system-ui, sans-serif' }}
      onClick={onClose}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[900px] max-h-[92vh] overflow-hidden flex flex-col"
        style={{ background: '#1A1A2E', borderRadius: S.radius, color: '#E5E7EB' }}
        role="dialog"
        aria-modal="true"
        aria-label={`Recipe reference for ${product.name}`}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between" style={{ padding: `${S.pad}px ${S.pad}px ${S.pad - 4}px` }}>
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {videoMode && (
              <button
                type="button"
                aria-label="Back to recipe"
                onClick={() => setVideoMode(false)}
                className="shrink-0 inline-flex items-center justify-center rounded-full"
                style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.08)', color: '#FFFFFF' }}
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <div style={{ fontSize: S.context, color: '#9CA3AF', letterSpacing: 0.2, marginBottom: 4 }}>
                {videoMode ? `Recipe video · ${product.name}` : context}
              </div>
              <div className="truncate" style={{ fontSize: S.itemName, fontWeight: 500, color: '#FFFFFF', lineHeight: 1.15 }}>
                {product.name}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {!videoMode && hasVideo && (
              <button
                type="button"
                onClick={() => setVideoMode(true)}
                className="inline-flex items-center gap-2 rounded-full"
                style={{
                  padding: '6px 12px',
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'transparent',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <Play size={14} color="#E84C3D" fill="#E84C3D" />
                Watch video · {recipe.video!.duration}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex items-center justify-center rounded-full"
              style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.08)', color: '#FFFFFF' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ALLERGEN STRIP (always visible, full opacity) */}
        {(product.allergens.length > 0 || modifierNote) && (
          <div className="flex flex-wrap items-center" style={{ gap: 6, padding: `0 ${S.pad}px ${S.pad - 8}px` }}>
            {product.allergens.map((a) => (
              <AllergenBadge key={a.type} allergen={a} variant="order" />
            ))}
            {modifierNote && (
              <span
                className="inline-flex items-center rounded-full"
                style={{ padding: '3px 10px', background: '#E84C3D', color: '#FFFFFF', fontSize: 12, fontWeight: 600 }}
              >
                + {modifierNote.text}
              </span>
            )}
          </div>
        )}

        {/* BODY */}
        <div className="overflow-y-auto" style={{ padding: `${S.gap}px ${S.pad}px ${S.pad}px` }}>
          {videoMode ? (
            <VideoView
              stepTitles={recipe.steps.map((s) => s.title)}
              duration={recipe.video?.duration ?? '0:00'}
              tight={isV3}
            />
          ) : (
            <>
              {/* INGREDIENTS */}
              {recipe.ingredients.length > 0 && (
                <section style={{ marginBottom: S.gap + 4 }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                    <div
                      style={{ fontSize: S.sectionLabel, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 600 }}
                    >
                      Ingredients
                    </div>
                    {recipe.yields.length > 0 && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setYieldOpen((o) => !o)}
                          className="inline-flex items-center gap-1.5 rounded-md"
                          style={{
                            padding: '4px 10px',
                            background: 'rgba(255,255,255,0.06)',
                            color: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                        >
                          Yield: {recipe.yields[yieldIdx]}
                          <ChevronDown size={12} />
                        </button>
                        {yieldOpen && (
                          <div
                            className="absolute right-0 mt-1 rounded-md overflow-hidden z-10"
                            style={{ background: '#22223a', border: '1px solid rgba(255,255,255,0.1)', minWidth: 140 }}
                          >
                            {recipe.yields.map((y, i) => (
                              <button
                                key={y}
                                type="button"
                                onClick={() => { setYieldIdx(i); setYieldOpen(false); }}
                                className="block w-full text-left"
                                style={{ padding: '6px 10px', fontSize: 12, color: i === yieldIdx ? '#FFFFFF' : '#D1D5DB', background: i === yieldIdx ? 'rgba(232,76,61,0.15)' : 'transparent' }}
                              >
                                {y}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    className="flex overflow-x-auto"
                    style={{ gap: 8, paddingBottom: 4, scrollbarWidth: 'thin' }}
                  >
                    {recipe.ingredients.map((ing, i) => (
                      <div
                        key={i}
                        className="flex items-center shrink-0 rounded-lg"
                        style={{ padding: 8, gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', minWidth: 200 }}
                      >
                        {ing.image ? (
                          <img
                            src={ing.image}
                            alt=""
                            style={{ width: S.ingCard, height: S.ingCard, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{ width: S.ingCard, height: S.ingCard, borderRadius: 6, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
                        )}
                        <div className="min-w-0">
                          <div className="truncate" style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 500 }}>{ing.name}</div>
                          <div style={{ fontSize: 12, color: '#9CA3AF' }}>{ing.qty}</div>
                          {ing.allergen && (
                            <div style={{ fontSize: 11, color: '#E84C3D', marginTop: 2, fontWeight: 500 }}>
                              Contains: {ing.allergen}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* PREP STEPS */}
              {recipe.steps.length > 0 && (
                <section>
                  <div style={{ fontSize: S.sectionLabel, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 600, marginBottom: 8 }}>
                    Prep steps
                  </div>
                  <div className="grid grid-cols-2" style={{ gap: S.gap }}>
                    {recipe.steps.map((step, i) => (
                      <div
                        key={i}
                        className="rounded-lg overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        {step.image && (
                          <img
                            src={step.image}
                            alt=""
                            style={{ width: '100%', height: S.stepImgH, objectFit: 'cover', display: 'block' }}
                          />
                        )}
                        <div style={{ padding: 10 }}>
                          <div className="flex items-center" style={{ gap: 8, marginBottom: 4 }}>
                            <span
                              className="inline-flex items-center justify-center rounded-full"
                              style={{ width: 22, height: 22, background: '#E84C3D', color: '#FFFFFF', fontSize: 12, fontWeight: 700 }}
                            >
                              {i + 1}
                            </span>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>{step.title}</div>
                          </div>
                          <div style={{ fontSize: 13, color: '#D1D5DB', lineHeight: 1.4 }}>
                            {renderBold(step.instruction)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function VideoView({ stepTitles, duration, tight }: { stepTitles: string[]; duration: string; tight: boolean }) {
  return (
    <div>
      <div
        className="w-full flex items-center justify-center rounded-lg"
        style={{ aspectRatio: '16 / 9', background: '#0B0B18', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <button
          type="button"
          aria-label="Play video"
          className="inline-flex items-center justify-center rounded-full"
          style={{ width: 64, height: 64, background: '#E84C3D', color: '#FFFFFF' }}
        >
          <Play size={26} fill="#FFFFFF" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center" style={{ gap: 10, marginTop: 12 }}>
        <button type="button" aria-label="Rewind 10s" className="inline-flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.08)', color: '#FFFFFF' }}>
          <Rewind size={14} />
        </button>
        <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.12)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '18%', background: '#E84C3D', borderRadius: 999 }} />
        </div>
        <div style={{ fontSize: 12, color: '#9CA3AF', fontVariantNumeric: 'tabular-nums' }}>0:00 / {duration}</div>
        <button type="button" aria-label="Volume" className="inline-flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.08)', color: '#FFFFFF' }}>
          <Volume2 size={14} />
        </button>
        <button type="button" aria-label="Fullscreen" className="inline-flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.08)', color: '#FFFFFF' }}>
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Jump to step chips (visual only) */}
      {stepTitles.length > 0 && (
        <div style={{ marginTop: tight ? 12 : 16 }}>
          <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 600, marginBottom: 6 }}>
            Jump to step
          </div>
          <div className="flex flex-wrap" style={{ gap: 6 }}>
            {stepTitles.map((t, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full"
                style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#D1D5DB', fontSize: 12 }}
              >
                {i + 1}. {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
