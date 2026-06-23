import { useState } from 'react';
import { AiSectionHeader } from '@/components/ai/AiSectionHeader';
import { useVoiceCommand } from '@/hooks/use-voice-command';
import { describeIntent, isDestructive } from '@/lib/ai/intents';
import { useOrderStore } from '@/hooks/use-order-store';
import { Mic, MicOff, Languages, Play, Check, X } from 'lucide-react';

const TRANSLATIONS: Record<string, Record<string, string>> = {
  es: {
    'Filet Mignon': 'Filete Miñón',
    'Meatballs': 'Albóndigas',
    'Tres Leches': 'Tres Leches',
    'Cheese Selection': 'Selección de Quesos',
    'Medium rare': 'Término medio rojo',
    '+ Extra Cheese': '+ Queso extra',
    'Make it extra spicy please': 'Hazlo extra picante por favor',
  },
  hi: {
    'Filet Mignon': 'फ़िले मिग्नॉन',
    'Meatballs': 'मीटबॉल्स',
    'Tres Leches': 'त्रेस लेचेस',
    'Cheese Selection': 'चीज़ चयन',
    'Medium rare': 'मीडियम रेयर',
    '+ Extra Cheese': '+ अतिरिक्त चीज़',
    'Make it extra spicy please': 'कृपया अतिरिक्त मसालेदार बनाएं',
  },
  fr: {
    'Filet Mignon': 'Filet Mignon',
    'Meatballs': 'Boulettes de viande',
    'Tres Leches': 'Trois Laits',
    'Cheese Selection': 'Sélection de Fromages',
    'Medium rare': 'Saignant',
    '+ Extra Cheese': '+ Fromage supplémentaire',
    'Make it extra spicy please': 'Rendez-le extra épicé s\'il vous plaît',
  },
};

const SAMPLE_COMMANDS = [
  'bump table 4',
  'show grill only',
  'eta on 23',
  'recall 19',
];

export default function VoiceScreen() {
  const { supported, listening, transcript, intent, error, start, stop, simulate } = useVoiceCommand();
  const { orders } = useOrderStore();
  const [lang, setLang] = useState<'es' | 'hi' | 'fr'>('es');
  const [pickedOrder, setPickedOrder] = useState(orders[0]?.id ?? '');
  const [confirmed, setConfirmed] = useState<string | null>(null);

  const dict = TRANSLATIONS[lang];
  const order = orders.find((o) => o.id === pickedOrder);
  const items = order?.courses.flatMap((c) => c.items) ?? [];

  const tr = (s: string) => dict[s] ?? s;

  const confirmIntent = () => {
    if (!intent) return;
    setConfirmed(`Confirmed: ${describeIntent(intent)}`);
    setTimeout(() => setConfirmed(null), 2500);
  };

  return (
    <div>
      <AiSectionHeader
        title="Voice Commands & AI Translation"
        subtitle="Push-to-talk lets cooks bump, recall, filter and ask ETAs hands-free. AI translates ticket content (item names, modifiers, notes) into the cook's preferred language."
        pain="Cook can't read the ticket in their language; hands are occupied while needing to bump, recall, or ask a question."
      />

      <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice panel */}
        <section className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5">
          <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[hsl(var(--text-primary))] mb-3">Push-to-talk</h2>

          <div className="flex flex-col items-center gap-4 py-6">
            <button
              onClick={listening ? stop : start}
              disabled={!supported}
              className={`w-20 h-20 rounded-full grid place-items-center transition-all ${
                listening ? 'bg-red-600 scale-110 animate-pulse' : 'bg-[hsl(var(--brand-dark))]'
              } text-white disabled:opacity-50`}
            >
              {listening ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
            <p className="text-[11px] text-[hsl(var(--text-muted))]">
              {!supported ? 'Voice not supported in this browser — use simulate buttons.' : listening ? 'Listening…' : 'Tap and speak'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {SAMPLE_COMMANDS.map((c) => (
              <button
                key={c}
                onClick={() => simulate(c)}
                className="text-[11px] font-semibold px-2.5 py-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-bg))] text-left flex items-center gap-2"
              >
                <Play size={11} /> {c}
              </button>
            ))}
          </div>

          {transcript && (
            <div className="mt-2 p-3 rounded-lg bg-[hsl(var(--surface-bg))]">
              <div className="text-[10px] uppercase tracking-wider text-[hsl(var(--text-muted))]">Transcript</div>
              <div className="text-[13px] font-semibold text-[hsl(var(--text-primary))]">"{transcript}"</div>
            </div>
          )}
          {intent && (
            <div className={`mt-2 p-3 rounded-lg border ${intent.action === 'unknown' ? 'border-amber-300 bg-amber-50' : 'border-emerald-300 bg-emerald-50'}`}>
              <div className="text-[10px] uppercase tracking-wider text-[hsl(var(--text-muted))]">Parsed intent</div>
              <div className="text-[12px] font-bold text-[hsl(var(--text-primary))]">{describeIntent(intent)}</div>
              {intent.action !== 'unknown' && (
                <div className="mt-2 flex gap-2">
                  {isDestructive(intent) ? (
                    <>
                      <button onClick={confirmIntent} className="text-[11px] font-bold px-3 py-1.5 rounded bg-emerald-600 text-white flex items-center gap-1">
                        <Check size={12} /> Confirm
                      </button>
                      <button className="text-[11px] font-bold px-3 py-1.5 rounded border border-[hsl(var(--border))] flex items-center gap-1">
                        <X size={12} /> Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={confirmIntent} className="text-[11px] font-bold px-3 py-1.5 rounded bg-[hsl(var(--brand-dark))] text-white">
                      Run command
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          {confirmed && (
            <div className="mt-2 text-[11px] text-emerald-700 font-semibold">{confirmed}</div>
          )}
          {error && (
            <div className="mt-2 text-[11px] text-red-700">Error: {error}</div>
          )}
        </section>

        {/* Translation demo */}
        <section className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[hsl(var(--text-primary))] flex items-center gap-2">
              <Languages size={14} /> AI Ticket Translation
            </h2>
            <div className="flex gap-1">
              {(['es', 'hi', 'fr'] as const).map((code) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${lang === code ? 'bg-[hsl(var(--brand-dark))] text-white' : 'border border-[hsl(var(--border))]'}`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          <select
            value={pickedOrder}
            onChange={(e) => setPickedOrder(e.target.value)}
            className="w-full text-[12px] px-2 py-2 rounded border border-[hsl(var(--border))] mb-3"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>#{o.orderNumber} · {o.tableName}</option>
            ))}
          </select>

          {order && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-[hsl(var(--border))]">
                <div className="text-[10px] uppercase tracking-wider text-[hsl(var(--text-muted))] mb-2">Source (English)</div>
                <ul className="flex flex-col gap-2">
                  {items.map((i) => (
                    <li key={i.id} className="text-[12px]">
                      <div className="font-bold">{i.quantity}× {i.name}</div>
                      {i.modifiers.map((m, idx) => (
                        <div key={idx} className="text-[11px] text-[hsl(var(--text-secondary))]">· {m.text}</div>
                      ))}
                      {i.notes && <div className="text-[11px] italic text-[hsl(var(--text-muted))]">"{i.notes}"</div>}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-lg border-2 border-[hsl(var(--brand-dark))]">
                <div className="text-[10px] uppercase tracking-wider text-[hsl(var(--text-muted))] mb-2">AI-translated</div>
                <ul className="flex flex-col gap-2">
                  {items.map((i) => (
                    <li key={i.id} className="text-[12px]">
                      <div className="font-bold">{i.quantity}× {tr(i.name)}</div>
                      {i.modifiers.map((m, idx) => (
                        <div key={idx} className="text-[11px] text-[hsl(var(--text-secondary))]">· {tr(m.text)}</div>
                      ))}
                      {i.notes && <div className="text-[11px] italic text-[hsl(var(--text-muted))]">"{tr(i.notes)}"</div>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <p className="mt-3 text-[10px] text-[hsl(var(--text-muted))]">
            Demo uses cached translations. Wire to Lovable AI Gateway to translate any incoming string live.
          </p>
        </section>
      </div>
    </div>
  );
}
