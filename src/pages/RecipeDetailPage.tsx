import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Play, ChevronDown, ChevronUp, Clock, ChefHat } from 'lucide-react';
import { getRecipeReference } from '@/data/recipe-reference-data';
import { AllergenBadge } from '@/components/kds/AllergenBadge';
import type { Allergen, AllergenType } from '@/types/kds';
import posaiLogo from '@/assets/posai-logo.png';

/**
 * Mobile/tablet-optimized public recipe page.
 * Opened by scanning the QR code inside the KDS recipe modal (or by tapping
 * the QR image directly for demos). Standalone from the KDS shell.
 */

const RESTAURANT = {
  name: 'The Olive & Vine',
  logoText: 'O&V',
};

const CHEF = {
  name: 'Chef Marco Rinaldi',
  updated: 'Updated Mar 12, 2026',
};

const META = {
  time: '30 min',
  difficulty: 'Easy',
};

const UTENSILS = [
  'Chef knife',
  'Cutting board',
  'Small mixing bowl',
  'Serrated bread knife',
  'Sheet tray',
  'Microplane or box grater',
  'Tongs',
];

const FACILITY_WARNING =
  'Produced in a facility that also processes tree nuts, dairy, peanuts, soy and sesame. Cross-contact possible.';

const STEP_IMAGES: string[][] = [
  [
    'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=560&fit=crop',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=560&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=560&fit=crop',
    'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=800&h=560&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=560&fit=crop',
    'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=800&h=560&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=560&fit=crop',
    'https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=800&h=560&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=560&fit=crop',
    'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=800&h=560&fit=crop',
  ],
];

const YIELD_OPTIONS = [2, 3, 4, 6];

const ALLERGEN_LABELS: Record<string, { type: AllergenType; label: string }> = {
  gluten: { type: 'gluten', label: 'Gluten' },
  dairy: { type: 'dairy', label: 'Dairy' },
  egg: { type: 'egg', label: 'Egg' },
  fish: { type: 'fish' as AllergenType, label: 'Fish' },
  shellfish: { type: 'shellfish', label: 'Shellfish' },
  soy: { type: 'soy', label: 'Soy' },
  peanut: { type: 'peanut', label: 'Peanut' },
  sesame: { type: 'sesame', label: 'Sesame' },
  'tree-nut': { type: 'tree-nut', label: 'Tree nut' },
};

function scaleQty(qty: string, factor: number): string {
  // Scale leading number in qty string (e.g. "180g", "2 tbsp", "1")
  const m = qty.match(/^([\d.]+)\s*(.*)$/);
  if (!m) return qty;
  const n = parseFloat(m[1]);
  if (!isFinite(n)) return qty;
  const scaled = n * factor;
  const rounded = scaled >= 10 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
  return `${rounded}${m[2] ? ' ' + m[2] : ''}`.trim();
}

function scaleInstruction(text: string, factor: number): string {
  // Scale numbers preceding common units in the instruction text.
  return text.replace(/(\d+(?:\.\d+)?)(\s?)(g|kg|ml|l|tbsp|tsp|oz|cup|cups|slice|slices|min|sec|seconds|minutes|leaves|sprigs|cloves|portion|portions|inch)\b/gi,
    (_, num, sp, unit) => {
      const n = parseFloat(num) * factor;
      const rounded = n >= 10 ? Math.round(n) : Math.round(n * 10) / 10;
      return `${rounded}${sp}${unit}`;
    });
}

function renderInline(s: string, factor: number) {
  const scaled = scaleInstruction(s, factor);
  return scaled.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

export default function RecipeDetailPage() {
  const params = useParams();
  const [search] = useSearchParams();
  const nameParam = params.name || search.get('name') || 'Bruschetta';
  const courseTag = search.get('course') || 'Appetizers';
  const stationTag = search.get('station') || 'Grill station';

  const recipe = useMemo(() => getRecipeReference(nameParam), [nameParam]);

  const [servings, setServings] = useState<number>(2);
  const [utensilsOpen, setUtensilsOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const factor = servings / 2; // base recipe assumed to serve 2

  const allergens: Allergen[] = useMemo(() => {
    const set = new Set<string>();
    recipe.ingredients.forEach((i) => { if (i.allergen) set.add(i.allergen.toLowerCase()); });
    return Array.from(set)
      .map((a) => ALLERGEN_LABELS[a])
      .filter(Boolean)
      .map((a) => ({ type: a.type, label: a.label, icon: '' }));
  }, [recipe]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" style={{ fontFamily: 'Montserrat, system-ui, sans-serif' }}>
      {/* HEADER STRIP - restaurant branding */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {RESTAURANT.logoText}
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold text-slate-900 truncate">{RESTAURANT.name}</div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">Recipe library</div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 pt-5 space-y-6">
        {/* Dish name + tags */}
        <section>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">{nameParam}</h1>
          <div className="mt-2 text-sm text-slate-600">
            <span className="capitalize">{courseTag}</span>
            <span className="mx-1.5 text-slate-400">·</span>
            <span className="capitalize">{stationTag}</span>
          </div>
          <div className="mt-1 text-[13px] text-slate-500 flex flex-wrap items-center gap-x-1.5">
            <ChefHat size={13} className="inline" />
            <span>{CHEF.name}</span>
            <span className="text-slate-400">·</span>
            <span>{CHEF.updated}</span>
          </div>
          <div className="mt-2 text-[13px] text-slate-600 flex items-center gap-1.5">
            <Clock size={13} />
            <span>{META.time}</span>
            <span className="text-slate-400 mx-1">·</span>
            <span>{META.difficulty}</span>
          </div>
        </section>

        {/* Yield selector + video */}
        <section className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Yield</div>
            <div className="flex gap-2">
              {YIELD_OPTIONS.map((y) => {
                const active = y === servings;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setServings(y)}
                    className={`flex-1 sm:flex-none sm:min-w-[64px] h-11 rounded-lg text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    aria-pressed={active}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-[12px] text-slate-500">Serves {servings}. Ingredients and step quantities scale live.</div>
          </div>

          <button
            type="button"
            onClick={() => setVideoOpen((v) => !v)}
            className="w-full h-11 rounded-lg bg-slate-900 text-white text-sm font-semibold inline-flex items-center justify-center gap-2"
          >
            <Play size={16} fill="currentColor" />
            {videoOpen ? 'Hide video' : 'Watch video'}
          </button>

          {videoOpen && recipe.video && (
            <div className="rounded-lg overflow-hidden bg-black aspect-video">
              <video
                src={recipe.video.url}
                controls
                playsInline
                className="w-full h-full"
              />
            </div>
          )}
        </section>

        {/* Allergens */}
        <section>
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Allergens</div>
          {allergens.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {allergens.map((a) => (
                <span key={a.type} style={{ opacity: 1 }}>
                  <AllergenBadge allergen={a} variant="order" />
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">No declared allergens.</div>
          )}
          <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
            {FACILITY_WARNING}
          </p>
        </section>

        {/* Ingredients */}
        <section>
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Ingredients</div>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                {ing.image ? (
                  <img
                    src={ing.image}
                    alt=""
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-slate-100 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-medium text-slate-900 truncate">{ing.name}</div>
                  {ing.allergen && (
                    <div className="text-[11px] text-red-600 font-medium">Contains {ing.allergen}</div>
                  )}
                </div>
                <div className="text-[14px] font-semibold text-slate-900 tabular-nums shrink-0">
                  {scaleQty(ing.qty, factor)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Utensils - collapsible on mobile, open on md+ */}
        <section className="bg-white rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setUtensilsOpen((o) => !o)}
            className="w-full flex items-center justify-between p-4 md:cursor-default"
            aria-expanded={utensilsOpen}
          >
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Utensils</span>
            <span className="md:hidden text-slate-500">
              {utensilsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>
          <div className={`${utensilsOpen ? 'block' : 'hidden'} md:block px-4 pb-4`}>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[14px] text-slate-700">
              {UTENSILS.map((u) => (
                <li key={u} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  {u}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Prep steps */}
        <section>
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Prep steps</div>
          <div className="space-y-4">
            {recipe.steps.map((step, i) => {
              const images = STEP_IMAGES[i % STEP_IMAGES.length];
              return (
                <article key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="grid grid-cols-2 gap-1">
                    {images.map((src, j) => (
                      <img
                        key={j}
                        src={src}
                        alt=""
                        className="w-full h-32 sm:h-40 object-cover"
                      />
                    ))}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white text-[13px] font-bold">
                        {i + 1}
                      </span>
                      <h3 className="text-[16px] font-semibold text-slate-900">{step.title}</h3>
                    </div>
                    <p className="text-[14px] leading-relaxed text-slate-700">
                      {renderInline(step.instruction, factor)}
                    </p>
                    {factor !== 1 && (
                      <div className="mt-2 text-[11px] text-slate-500 italic">
                        Quantities shown scaled for {servings} servings.
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-center gap-2 opacity-70">
          <span className="text-[11px] text-slate-500">Powered by</span>
          <img src={posaiLogo} alt="pointofsaleai" className="h-5 object-contain" />
        </div>
      </footer>
    </div>
  );
}
