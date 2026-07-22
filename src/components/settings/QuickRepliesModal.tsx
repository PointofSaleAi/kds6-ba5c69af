import { useMemo, useState } from 'react';
import { X, Plus, MessageSquare } from 'lucide-react';

const SUGGESTED_POOL: string[] = [
  'Got it',
  '5 min out',
  'Item unavailable',
  'On it',
  'Need more time',
  'Almost done',
  'Substitution needed',
  'Confirmed',
  'Running behind',
  'Please call server',
];

const MAX_SELECTED = 10;
const SOFT_CHAR_LIMIT = 30;

interface Props {
  open: boolean;
  onClose: () => void;
  selected: string[];
  onChange: (next: string[]) => void;
}

export function QuickRepliesModal({ open, onClose, selected, onChange }: Props) {
  const [draft, setDraft] = useState('');

  const suggested = useMemo(
    () => SUGGESTED_POOL.filter((s) => !selected.some((v) => v.toLowerCase() === s.toLowerCase())),
    [selected],
  );

  if (!open) return null;

  const atCap = selected.length >= MAX_SELECTED;

  const addFromSuggested = (text: string) => {
    if (atCap) return;
    onChange([...selected, text]);
  };

  const removeSelected = (idx: number) => {
    onChange(selected.filter((_, i) => i !== idx));
  };

  const addCustom = () => {
    const trimmed = draft.trim();
    if (!trimmed || atCap) return;
    if (selected.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...selected, trimmed]);
    setDraft('');
  };

  const draftLong = draft.length > SOFT_CHAR_LIMIT;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-[560px] max-w-[95vw] rounded-[20px] shadow-2xl overflow-hidden"
        style={{ background: 'hsl(var(--surface-card))' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-border">
          <div className="min-w-0">
            <h3 className="text-base font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
              Quick Replies
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--text-muted))' }}>
              Choose up to 10 quick responses kitchen staff can send on ticket messages.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Close"
          >
            <X size={18} style={{ color: 'hsl(var(--text-secondary))' }} />
          </button>
        </div>

        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto flex flex-col gap-4">
          {/* Selected */}
          <section>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'hsl(var(--text-muted))' }}>
                Selected
              </span>
              <span
                className="text-[11px] font-semibold tabular-nums"
                style={{ color: atCap ? 'hsl(var(--destructive))' : 'hsl(var(--text-muted))' }}
              >
                {selected.length}/{MAX_SELECTED}
              </span>
            </div>
            <div
              className="rounded-xl p-2.5 min-h-[52px]"
              style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}
            >
              {selected.length === 0 ? (
                <p className="text-xs px-1 py-2" style={{ color: 'hsl(var(--text-muted))' }}>
                  No quick replies selected yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selected.map((item, idx) => (
                    <span
                      key={`${item}-${idx}`}
                      className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full text-[13px] font-semibold"
                      style={{
                        background: 'hsl(var(--brand-primary))',
                        color: 'hsl(var(--brand-primary-foreground))',
                      }}
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeSelected(idx)}
                        className="flex items-center justify-center h-5 w-5 rounded-full hover:bg-black/20"
                        aria-label={`Remove ${item}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Suggested */}
          <section>
            <span className="text-[11px] font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'hsl(var(--text-muted))' }}>
              Suggested
            </span>
            {suggested.length === 0 ? (
              <p className="text-xs" style={{ color: 'hsl(var(--text-muted))' }}>
                All suggestions have been added.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {suggested.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={atCap}
                    onClick={() => addFromSuggested(s)}
                    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-[13px] font-semibold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: 'hsl(var(--surface-card))',
                      color: 'hsl(var(--text-primary))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  >
                    {s}
                    <Plus size={13} style={{ color: 'hsl(var(--brand-primary))' }} />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Add your own */}
          <section>
            <span className="text-[11px] font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'hsl(var(--text-muted))' }}>
              Add your own
            </span>
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-1.5"
              style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                placeholder="Type a custom reply"
                disabled={atCap}
                className="flex-1 bg-transparent outline-none text-[14px] font-medium disabled:opacity-40"
                style={{
                  color: draftLong ? 'hsl(var(--destructive))' : 'hsl(var(--text-primary))',
                }}
              />
              <span
                className="text-[11px] tabular-nums"
                style={{ color: draftLong ? 'hsl(var(--destructive))' : 'hsl(var(--text-muted))' }}
              >
                {draft.length}/{SOFT_CHAR_LIMIT}
              </span>
              <button
                type="button"
                onClick={addCustom}
                disabled={atCap || !draft.trim()}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'hsl(var(--brand-primary))',
                  color: 'hsl(var(--brand-primary-foreground))',
                }}
              >
                <Plus size={12} /> Add
              </button>
            </div>
            {atCap && (
              <p className="text-[11px] mt-1.5" style={{ color: 'hsl(var(--destructive))' }}>
                You've reached the 10 reply limit. Remove one to add another.
              </p>
            )}
          </section>
        </div>

      </div>
    </>
  );
}

export { MessageSquare };
