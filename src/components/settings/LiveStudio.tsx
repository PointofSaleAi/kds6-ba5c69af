import { useMemo, useState, useEffect } from 'react';
import { Star, Search, Zap, ShieldAlert, Columns2, Save, RotateCcw, Check, Trash2 } from 'lucide-react';
import { KDS_BOARDS, type KdsBoardDefinition, getBoardById } from '@/data/kds-boards';
import { getFixtureForState, type PreviewState } from '@/data/preview-fixtures';
import { SelectedVariantPreview } from '@/components/kds/SelectedVariantPreview';
import { SegmentedToggle } from '@/components/settings/SettingsControls';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { writeStoredTicketsRoute } from '@/lib/ticket-card-variant';
import {
  useDraft, useFavorites, usePresets, LS_DEFAULTS, identifierToHeaderLayout,
  type LiveStudioDraft,
} from '@/hooks/use-live-studio';
import { toast } from 'sonner';

function densityToSpacing(d: LiveStudioDraft['density']) {
  return d === 'Low' ? 'Spacious' : d === 'High' ? 'Compact' : 'Standard';
}
function spacingClassFor(d: LiveStudioDraft['density']) {
  return d === 'Low' ? 'ticket-spacing-spacious' : d === 'High' ? 'ticket-spacing-compact' : 'ticket-spacing-standard';
}
function textScaleFor(t: LiveStudioDraft['textSize']) {
  return t === 'Compact' ? 'text-scale-compact' : t === 'Large' ? 'text-scale-large' : '';
}
function safetyClass(s: LiveStudioDraft['safety']) {
  return s === 'Muted' ? 'kds-safety-muted' : s === 'Highlighted' ? 'kds-safety-highlighted' : 'kds-safety-bright';
}

interface BoardTileProps {
  board: KdsBoardDefinition;
  active: boolean;
  favorited: boolean;
  onSelect: () => void;
  onToggleFav: () => void;
}

function BoardTile({ board, active, favorited, onSelect, onToggleFav }: BoardTileProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative shrink-0 w-40 rounded-lg overflow-hidden border-2 transition-all ${
        active ? 'border-[hsl(var(--primary))] shadow-md' : 'border-transparent hover:border-border'
      }`}
      style={{ background: 'hsl(var(--muted))' }}
    >
      <div className="aspect-video w-full bg-black">
        <img src={board.imageUrl} alt={board.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="p-2 text-left">
        <div className="text-xs font-semibold truncate">{board.name}</div>
        <div className="text-[10px] text-muted-foreground truncate">{board.description}</div>
      </div>
      <span
        role="button"
        aria-label={favorited ? 'Unfavorite' : 'Favorite'}
        onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60"
      >
        <Star className={`w-3.5 h-3.5 ${favorited ? 'fill-yellow-400 text-yellow-400' : 'text-white'}`} />
      </span>
      {active && (
        <span className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] flex items-center justify-center">
          <Check className="w-3.5 h-3.5" />
        </span>
      )}
    </button>
  );
}

function InspectorSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: 'hsl(var(--text-muted))' }}>
        {label}
      </span>
      {children}
    </div>
  );
}

export function LiveStudio() {
  const { setRouteSetting, setDensity, setSafetyEmphasis } = useKDSSettings();
  const { draft, set, reset } = useDraft(LS_DEFAULTS);
  const { favorites, toggle: toggleFav } = useFavorites();
  const { presets, save: savePreset, remove: removePreset } = usePresets();

  const [search, setSearch] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState<string>(() =>
    localStorage.getItem('kds.live-studio.selected') ?? 'main-prep',
  );
  const [compareId, setCompareId] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState>('normal');
  const [savingName, setSavingName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  useEffect(() => { localStorage.setItem('kds.live-studio.selected', selectedBoardId); }, [selectedBoardId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return KDS_BOARDS;
    return KDS_BOARDS.filter((b) => b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q));
  }, [search]);

  const selected = getBoardById(selectedBoardId) ?? KDS_BOARDS[0];
  const compare = compareId ? getBoardById(compareId) : null;
  const fixture = getFixtureForState(previewState);

  const handleApply = () => {
    // Persist per-route settings that map from the draft.
    const route = selected.route;
    setRouteSetting(route, 'ticketSpacing', densityToSpacing(draft.density));
    setRouteSetting(route, 'textSize', draft.textSize);
    setRouteSetting(route, 'ticketHeaderLayout', identifierToHeaderLayout(draft.identifier));
    // Global personalization
    setDensity(draft.density);
    setSafetyEmphasis(draft.safety);
    // Commit route as the active KDS layout
    writeStoredTicketsRoute(route);
    toast.success(`Applied “${selected.name}” to station`);
  };

  const handleSavePreset = () => {
    if (!savingName.trim()) return;
    savePreset(savingName.trim(), selected.id, draft);
    setSavingName('');
    setShowSaveInput(false);
    toast.success('Preset saved');
  };

  const previewWrapCls = `${textScaleFor(draft.textSize)} ${spacingClassFor(draft.density)} ${safetyClass(draft.safety)}`;

  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0">
      {/* FILMSTRIP */}
      <div className="shrink-0 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 16 boards"
              className="w-full h-9 pl-8 pr-3 rounded-md bg-muted text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPreviewState((s) => (s === 'rush' ? 'normal' : 'rush'))}
              className={`h-9 px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 ${
                previewState === 'rush' ? 'bg-orange-500 text-white' : 'bg-muted text-foreground'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Rush
            </button>
            <button
              onClick={() => setPreviewState((s) => (s === 'allergy' ? 'normal' : 'allergy'))}
              className={`h-9 px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 ${
                previewState === 'allergy' ? 'bg-red-600 text-white' : 'bg-muted text-foreground'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Allergy
            </button>
            <button
              onClick={() => setCompareId((id) => (id ? null : KDS_BOARDS.find((b) => b.id !== selectedBoardId)!.id))}
              className={`h-9 px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 ${
                compareId ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" /> Compare
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {filtered.map((b) => (
            <BoardTile
              key={b.id}
              board={b}
              active={selectedBoardId === b.id}
              favorited={favorites.includes(b.id)}
              onSelect={() => (compareId ? setCompareId(b.id) : setSelectedBoardId(b.id))}
              onToggleFav={() => toggleFav(b.id)}
            />
          ))}
        </div>
      </div>

      {/* STAGE + INSPECTOR */}
      <div className="flex-1 min-h-0 flex gap-4">
        {/* STAGE */}
        <div className="flex-1 min-w-0 rounded-lg border border-border bg-muted/30 overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">{selected.name}</span>
              <span className="text-[10px] text-muted-foreground">{selected.description}</span>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {previewState === 'normal' ? 'Live preview' : `${previewState} fixture`}
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-4 flex justify-center gap-4">
            <div className={`w-[360px] max-w-full ${previewWrapCls}`}>
              <SelectedVariantPreview order={fixture} routeOverride={selected.route} />
            </div>
            {compare && (
              <div className={`w-[360px] max-w-full ${previewWrapCls} border-l border-dashed border-border pl-4`}>
                <div className="text-[10px] uppercase text-muted-foreground mb-2">{compare.name}</div>
                <SelectedVariantPreview order={fixture} routeOverride={compare.route} />
              </div>
            )}
          </div>
        </div>

        {/* INSPECTOR */}
        <div className="w-[280px] shrink-0 flex flex-col gap-3 overflow-y-auto">
          <InspectorSection label="Layout">
            <SegmentedToggle
              options={['Compact', 'Standard', 'Spacious']}
              value={draft.layout}
              onChange={(v) => set('layout', v as LiveStudioDraft['layout'])}
            />
          </InspectorSection>
          <InspectorSection label="Density">
            <SegmentedToggle
              options={['Low', 'Medium', 'High']}
              value={draft.density}
              onChange={(v) => set('density', v as LiveStudioDraft['density'])}
            />
          </InspectorSection>
          <InspectorSection label="Text size">
            <SegmentedToggle
              options={['Compact', 'Standard', 'Large']}
              value={draft.textSize}
              onChange={(v) => set('textSize', v as LiveStudioDraft['textSize'])}
            />
          </InspectorSection>
          <InspectorSection label="Identifier">
            <SegmentedToggle
              options={['Order #', 'Guest', 'Table']}
              value={draft.identifier}
              onChange={(v) => set('identifier', v as LiveStudioDraft['identifier'])}
            />
          </InspectorSection>
          <InspectorSection label="Safety emphasis">
            <SegmentedToggle
              options={['Muted', 'Bright', 'Highlighted']}
              value={draft.safety}
              onChange={(v) => set('safety', v as LiveStudioDraft['safety'])}
            />
          </InspectorSection>
          <InspectorSection label="Theme">
            <SegmentedToggle
              options={['Light', 'Dark', 'Auto']}
              value={draft.theme}
              onChange={(v) => set('theme', v as LiveStudioDraft['theme'])}
            />
          </InspectorSection>
          <InspectorSection label="Station">
            <SegmentedToggle
              options={['Expediter', 'Bar', 'Prep 1', 'Prep 2']}
              value={draft.station}
              onChange={(v) => set('station', v as LiveStudioDraft['station'])}
            />
          </InspectorSection>

          <div className="border-t border-border pt-3 flex flex-col gap-2">
            <button
              onClick={handleApply}
              className="w-full h-10 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-semibold inline-flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Apply to {draft.station}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowSaveInput((s) => !s)}
                className="h-9 rounded-md bg-muted text-xs font-semibold inline-flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> Save preset
              </button>
              <button
                onClick={reset}
                className="h-9 rounded-md bg-muted text-xs font-semibold inline-flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
            {showSaveInput && (
              <div className="flex gap-1.5">
                <input
                  autoFocus
                  value={savingName}
                  onChange={(e) => setSavingName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                  placeholder="Preset name"
                  className="flex-1 h-9 px-2 rounded-md bg-muted text-sm focus:outline-none"
                />
                <button
                  onClick={handleSavePreset}
                  className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-xs font-semibold"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {presets.length > 0 && (
            <div className="border-t border-border pt-3 flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: 'hsl(var(--text-muted))' }}>
                Presets
              </span>
              {presets.map((p) => {
                const board = getBoardById(p.boardId);
                return (
                  <div key={p.id} className="flex items-center gap-2 rounded-md bg-muted p-1.5">
                    <button
                      onClick={() => {
                        if (board) setSelectedBoardId(board.id);
                        // apply the preset config to draft
                        (Object.keys(p.config) as (keyof LiveStudioDraft)[]).forEach((k) => set(k, p.config[k]));
                        toast.success(`Loaded “${p.name}”`);
                      }}
                      className="flex-1 text-left text-xs font-medium truncate"
                    >
                      {p.name}
                      <span className="text-[10px] text-muted-foreground block truncate">
                        {board?.name ?? 'Unknown board'}
                      </span>
                    </button>
                    <button
                      onClick={() => removePreset(p.id)}
                      className="w-7 h-7 rounded-md hover:bg-background flex items-center justify-center"
                      aria-label="Delete preset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
