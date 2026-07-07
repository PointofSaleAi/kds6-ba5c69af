import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, ChevronDown, ArrowLeft, Rewind, Volume2, Maximize2 } from 'lucide-react';
import type { OrderItem, Order } from '@/types/kds';
import { AllergenBadge } from '@/components/kds/AllergenBadge';
import { getRecipeReference } from '@/data/recipe-reference-data';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  product: OrderItem | null;
  order?: Order | null;
  courseLabel?: string;
  onClose: () => void;
  /** 'default' = full spacing; 'v3' = tighter, matches v3 card density */
  variant?: 'default' | 'v3';
}

interface Palette {
  surface: string;
  surfaceSubtle: string;
  surfaceRaised: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  iconBtnBg: string;
  outlineBtnBorder: string;
  videoBg: string;
  progressTrack: string;
  yieldMenuBg: string;
  yieldMenuBorder: string;
  brandRed: string;
}

const DARK: Palette = {
  surface: '#1A1A2E',
  surfaceSubtle: 'rgba(255,255,255,0.04)',
  surfaceRaised: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.08)',
  textPrimary: '#FFFFFF',
  textSecondary: '#D1D5DB',
  textMuted: '#9CA3AF',
  iconBtnBg: 'rgba(255,255,255,0.08)',
  outlineBtnBorder: 'rgba(255,255,255,0.18)',
  videoBg: '#0B0B18',
  progressTrack: 'rgba(255,255,255,0.12)',
  yieldMenuBg: '#22223a',
  yieldMenuBorder: 'rgba(255,255,255,0.1)',
  brandRed: '#E84C3D',
};

const LIGHT: Palette = {
  surface: '#FFFFFF',
  surfaceSubtle: '#F8FAFC',
  surfaceRaised: '#F1F5F9',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#374151',
  textMuted: '#6B7280',
  iconBtnBg: '#F1F5F9',
  outlineBtnBorder: '#D1D5DB',
  videoBg: '#0F172A',
  progressTrack: '#E5E7EB',
  yieldMenuBg: '#FFFFFF',
  yieldMenuBorder: '#E5E7EB',
  brandRed: '#E84C3D',
};

/**
 * Recipe / prep reference modal. Front-end only, mock data.
 * Adapts to light and dark themes via useTheme.
 */
export function RecipeReferenceModal({ product, order, courseLabel, onClose, variant = 'default' }: Props) {
  const { theme } = useTheme();
  const C = theme === 'dark' ? DARK : LIGHT;
  const [videoMode, setVideoMode] = useState(false);
  const [yieldIdx, setYieldIdx] = useState(0);
  const [yieldOpen, setYieldOpen] = useState(false);

  useEffect(() => {
    if (!product) return;
    setVideoMode(false);
    setYieldOpen(false);
    setYieldIdx(0);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  if (!product) return null;

  const baseRecipe = getRecipeReference(product.name);
  // Ensure the current ticket quantity is always represented as a yield option,
  // and default the selection to it. Unit is inferred from the first existing yield.
  const unit = (() => {
    const first = baseRecipe.yields[0] ?? '1 plate';
    const m = first.match(/^\d+\s+(.+)$/);
    return m ? m[1] : 'portion';
  })();
  const qtyYield = `${product.quantity} ${unit}`;
  const yields = baseRecipe.yields.some((y) => {
    const m = y.match(/^(\d+)/);
    return m ? parseInt(m[1], 10) === product.quantity : false;
  })
    ? baseRecipe.yields
    : [qtyYield, ...baseRecipe.yields];
  const activeYieldIdx = (() => {
    const i = yields.findIndex((y) => {
      const m = y.match(/^(\d+)/);
      return m ? parseInt(m[1], 10) === product.quantity : false;
    });
    return i >= 0 ? i : yieldIdx;
  })();
  const recipe = { ...baseRecipe, yields };
  const isV3 = variant === 'v3';

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

  const context = `${courseLabel ?? product.category ?? 'item'} · ${order?.orderNumber ?? '—'} · ${product.quantity}x`;
  const modifierNote = product.modifiers.find((m) => m.type === 'extra');
  const hasVideo = !!recipe.video;

  const renderBold = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <span key={i} style={{ fontWeight: 700, color: C.textPrimary }}>{part.slice(2, -2)}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', fontFamily: 'Inter, system-ui, sans-serif' }}
      onClick={onClose}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[900px] max-h-[92vh] overflow-hidden flex flex-col"
        style={{ background: C.surface, borderRadius: S.radius, color: C.textSecondary, border: `1px solid ${C.border}` }}
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
                style={{ width: 32, height: 32, background: C.iconBtnBg, color: C.textPrimary }}
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <div style={{ fontSize: S.context, color: C.textMuted, letterSpacing: 0.2, marginBottom: 4 }}>
                {videoMode ? `Recipe video · ${product.name}` : context}
              </div>
              <div className="truncate" style={{ fontSize: S.itemName, fontWeight: 500, color: C.textPrimary, lineHeight: 1.15 }}>
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
                  border: `1px solid ${C.outlineBtnBorder}`,
                  background: 'transparent',
                  color: C.textPrimary,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <Play size={14} color={C.brandRed} fill={C.brandRed} />
                Watch video · {recipe.video!.duration}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex items-center justify-center rounded-full"
              style={{ width: 32, height: 32, background: C.iconBtnBg, color: C.textPrimary }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ALLERGEN STRIP */}
        {(product.allergens.length > 0 || modifierNote) && (
          <div className="flex flex-wrap items-center" style={{ gap: 6, padding: `0 ${S.pad}px ${S.pad - 8}px` }}>
            {product.allergens.map((a) => (
              <AllergenBadge key={a.type} allergen={a} variant="order" />
            ))}
            {modifierNote && (
              <span
                className="inline-flex items-center rounded-full"
                style={{ padding: '3px 10px', background: C.brandRed, color: '#FFFFFF', fontSize: 12, fontWeight: 600 }}
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
              C={C}
            />
          ) : (
            <>
              {/* INGREDIENTS */}
              {recipe.ingredients.length > 0 && (
                <section style={{ marginBottom: S.gap + 4 }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: S.sectionLabel, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 600 }}>
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
                            background: C.surfaceRaised,
                            color: C.textPrimary,
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
                            style={{ background: C.yieldMenuBg, border: `1px solid ${C.yieldMenuBorder}`, minWidth: 140 }}
                          >
                            {recipe.yields.map((y, i) => (
                              <button
                                key={y}
                                type="button"
                                onClick={() => { setYieldIdx(i); setYieldOpen(false); }}
                                className="block w-full text-left"
                                style={{ padding: '6px 10px', fontSize: 12, color: i === yieldIdx ? C.textPrimary : C.textSecondary, background: i === yieldIdx ? 'rgba(232,76,61,0.15)' : 'transparent' }}
                              >
                                {y}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex overflow-x-auto" style={{ gap: 8, paddingBottom: 4, scrollbarWidth: 'thin' }}>
                    {recipe.ingredients.map((ing, i) => (
                      <div
                        key={i}
                        className="flex items-center shrink-0 rounded-lg"
                        style={{ padding: 8, gap: 10, background: C.surfaceSubtle, border: `1px solid ${C.border}`, minWidth: 200 }}
                      >
                        {ing.image ? (
                          <img
                            src={ing.image}
                            alt=""
                            style={{ width: S.ingCard, height: S.ingCard, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{ width: S.ingCard, height: S.ingCard, borderRadius: 6, background: C.surfaceRaised, flexShrink: 0 }} />
                        )}
                        <div className="min-w-0">
                          <div className="truncate" style={{ fontSize: 14, color: C.textPrimary, fontWeight: 500 }}>{ing.name}</div>
                          <div style={{ fontSize: 12, color: C.textMuted }}>{ing.qty}</div>
                          {ing.allergen && (
                            <div style={{ fontSize: 11, color: C.brandRed, marginTop: 2, fontWeight: 500 }}>
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
                  <div style={{ fontSize: S.sectionLabel, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 600, marginBottom: 8 }}>
                    Prep steps
                  </div>
                  <div className="grid grid-cols-2" style={{ gap: S.gap }}>
                    {recipe.steps.map((step, i) => (
                      <div
                        key={i}
                        className="rounded-lg overflow-hidden"
                        style={{ background: C.surfaceSubtle, border: `1px solid ${C.border}` }}
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
                              style={{ width: 22, height: 22, background: C.brandRed, color: '#FFFFFF', fontSize: 12, fontWeight: 700 }}
                            >
                              {i + 1}
                            </span>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>{step.title}</div>
                          </div>
                          <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.4 }}>
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

function VideoView({ stepTitles, duration, tight, C }: { stepTitles: string[]; duration: string; tight: boolean; C: Palette }) {
  return (
    <div>
      <div
        className="w-full flex items-center justify-center rounded-lg"
        style={{ aspectRatio: '16 / 9', background: C.videoBg, border: `1px solid ${C.border}` }}
      >
        <button
          type="button"
          aria-label="Play video"
          className="inline-flex items-center justify-center rounded-full"
          style={{ width: 64, height: 64, background: C.brandRed, color: '#FFFFFF' }}
        >
          <Play size={26} fill="#FFFFFF" />
        </button>
      </div>

      <div className="flex items-center" style={{ gap: 10, marginTop: 12 }}>
        <button type="button" aria-label="Rewind 10s" className="inline-flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: C.iconBtnBg, color: C.textPrimary }}>
          <Rewind size={14} />
        </button>
        <div className="flex-1 h-1 rounded-full" style={{ background: C.progressTrack, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '18%', background: C.brandRed, borderRadius: 999 }} />
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, fontVariantNumeric: 'tabular-nums' }}>0:00 / {duration}</div>
        <button type="button" aria-label="Volume" className="inline-flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: C.iconBtnBg, color: C.textPrimary }}>
          <Volume2 size={14} />
        </button>
        <button type="button" aria-label="Fullscreen" className="inline-flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: C.iconBtnBg, color: C.textPrimary }}>
          <Maximize2 size={14} />
        </button>
      </div>

      {stepTitles.length > 0 && (
        <div style={{ marginTop: tight ? 12 : 16 }}>
          <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 600, marginBottom: 6 }}>
            Jump to step
          </div>
          <div className="flex flex-wrap" style={{ gap: 6 }}>
            {stepTitles.map((t, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full"
                style={{ padding: '4px 10px', background: C.surfaceRaised, border: `1px solid ${C.border}`, color: C.textSecondary, fontSize: 12 }}
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
