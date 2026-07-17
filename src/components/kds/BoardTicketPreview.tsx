import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, Flame, ArrowRight } from 'lucide-react';

type Props = { boardId: string; identifier?: 'order' | 'guest' | 'table'; orderType?: string };

/** Returns the primary ticket identifier label based on the setting. */
export function idLabel(identifier: Props['identifier'] = 'table', variant: 'upper' | 'title' = 'upper') {
  const map = {
    order: variant === 'upper' ? 'ORDER #23' : 'Order #23',
    guest: variant === 'upper' ? 'JOHN PETERSON' : 'John Peterson',
    table: variant === 'upper' ? 'TABLE 4' : 'Table 4',
  } as const;
  return map[identifier];
}

/**
 * Board-specific standalone ticket previews.
 * Each variant mirrors the design and information hierarchy from the
 * KDS_Designs_and_Philosophy reference deck.
 */
export function BoardTicketPreview({ boardId, identifier = 'table', orderType }: Props) {
  const vprops: VProps = { identifier, orderType };
  switch (boardId) {
    case 'focus-lane':          return <FocusLaneTicket {...vprops} />;
    case 'distance-view':       return <DistanceViewTicket {...vprops} />;
    case 'progressive-ticket':  return <ProgressiveTicket {...vprops} />;
    case 'safety-first':        return <SafetyFirstTicket {...vprops} />;
    case 'timeline-flow':       return <TimelineFlowTicket {...vprops} />;
    case 'adaptive-density':    return <AdaptiveDensityTicket {...vprops} />;
    case 'dark-command-center': return <DarkCommandTicket {...vprops} />;
    case 'calm-board':
    default:                    return <CalmBoardTicket {...vprops} />;
  }
}

type VProps = { identifier: NonNullable<Props['identifier']>; orderType?: string };

/* ------------------------------- shared bits ------------------------------ */

const Card = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <div
    className={`w-full max-w-[320px] mx-auto rounded-lg overflow-hidden border shadow-sm ${
      dark ? 'bg-[#1A1A2E] border-[#2A2A44] text-white' : 'bg-white border-border text-[#2C3E50]'
    }`}
  >
    {children}
  </div>
);

const AllergenChip = ({ label, tone = 'red' }: { label: string; tone?: 'red' | 'amber' | 'blue' }) => {
  const styles =
    tone === 'red'
      ? 'bg-[#FBEAEA] text-[#C0392B]'
      : tone === 'amber'
      ? 'bg-[#FFF3D6] text-[#8A5A00]'
      : 'bg-[#E3F0FA] text-[#1D6FA5]';
  return (
    <span className={`inline-block px-1.5 py-[1px] rounded text-[9px] font-bold uppercase tracking-wide ${styles}`}>
      {label}
    </span>
  );
};

/* --------------------------------- CALM ----------------------------------- */

function CalmBoardTicket({ identifier, orderType }: VProps) {
  return (
    <Card>
      <div className="bg-[#1A1A2E] text-white px-3 py-1.5 flex justify-between items-center">
        <div className="text-[11px] font-bold tracking-wide">
          {orderType ? orderType.toUpperCase() : idLabel(identifier)}
        </div>
        <div className="text-[11px] font-mono">33:33</div>
      </div>
      <div className="px-3 py-1.5 flex justify-between text-[10px] border-b border-border">
        <span><span className="font-bold">23</span> John Peterson</span>
        <span className="text-text-secondary">Maria S. · 8:00 PM</span>
      </div>
      <div className="px-3 py-1 text-[9px] font-bold text-[#C0392B] border-b border-border">
        ALLERGENS: PEANUT, GLUTEN, NUT
      </div>
      <div className="px-3 py-2 space-y-1.5">
        <div className="text-[9px] font-bold text-text-secondary tracking-wide">APPETIZER</div>
        <div className="text-[12px] font-semibold">Cheese Selection</div>
        <div className="text-[9px] font-bold text-text-secondary tracking-wide pt-1">ENTREE</div>
        <div className="text-[12px] font-semibold">Meatballs</div>
        <div className="text-[12px] font-semibold">Filet Mignon</div>
        <div className="flex items-center justify-between text-[10px] text-text-secondary pt-1">
          <span>+ 2 Courses</span>
          <ChevronDown className="w-3 h-3" />
        </div>
      </div>
      <button className="w-full bg-[#1A1A2E] text-white text-[11px] font-bold py-2 tracking-wide">
        MARK AS SEEN
      </button>
    </Card>
  );
}

/* ------------------------------ FOCUS LANE -------------------------------- */

function FocusLaneTicket({ identifier }: VProps) {
  return (
    <Card>
      <div className="h-1.5 bg-[#16A085]" />
      <div className="px-3 pt-2 pb-1.5 flex justify-between items-center">
        <div className="text-[16px] font-black">{idLabel(identifier)}</div>
        <div className="text-[13px] font-mono">33:33</div>
      </div>
      <div className="bg-[#FFF3D6] text-[#8A5A00] text-[10px] font-bold px-3 py-1">
        ALLERGEN WARNING: PEANUT, GLUTEN
      </div>
      <div className="px-3 py-1 border-b border-border text-[10px] font-bold text-text-secondary">
        CURRENT COURSE: ENTREE
      </div>
      <div className="px-3 py-2.5 space-y-2 border-b border-border">
        <div className="flex items-baseline gap-3">
          <span className="text-[22px] font-black leading-none">2</span>
          <span className="text-[15px] font-bold">Meatballs</span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-[22px] font-black leading-none">1</span>
          <span className="text-[15px] font-bold">Filet Mignon</span>
        </div>
      </div>
      <div className="px-3 py-1.5 border-b border-border">
        <div className="flex justify-between items-center text-[9px] font-bold text-text-secondary">
          <span>FUTURE: +APPETIZER, +DESSERT</span>
          <ChevronDown className="w-3 h-3" />
        </div>
        <div className="text-[11px] text-[#2471A3] font-semibold mt-0.5">+1 Grilled Barramundi</div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-border">
        <button className="py-2 text-[10px] font-bold text-[#16A085]">SEEN</button>
        <button className="py-2 text-[10px] font-bold text-[#16A085]">PREPARING</button>
        <button className="py-2 text-[10px] font-bold text-[#16A085]">READY</button>
      </div>
    </Card>
  );
}

/* ----------------------------- DISTANCE VIEW ------------------------------ */

function DistanceViewTicket({ identifier }: VProps) {
  return (
    <Card>
      <div className="bg-[#1A1A2E] text-white px-3 py-1 text-[10px] font-bold flex justify-between">
        <span>{idLabel(identifier)} | 8:09 PM | Maria S.</span>
      </div>
      <div className="bg-[#FDECEA] text-[#C0392B] text-[9px] font-bold px-3 py-1">
        Allergy to nuts. Prepare separately and notify server.
      </div>
      <div className="px-3 py-2 flex items-center justify-between border-b border-border">
        <div>
          <div className="text-[9px] text-text-secondary font-bold">Ticket</div>
          <div className="text-[42px] font-black leading-none">23</div>
          <div className="text-[9px] text-text-secondary">Order</div>
        </div>
        <div className="relative w-14 h-14 rounded-full border-[3px] border-[#E67E22] flex items-center justify-center">
          <span className="text-[11px] font-mono font-bold">32:24</span>
        </div>
      </div>
      <div className="px-3 py-2 space-y-2 border-b border-border">
        <div>
          <div className="text-[15px] font-black uppercase leading-tight">2x Filet Mignon</div>
          <div className="text-[10px] text-text-secondary">medium rare</div>
          <div className="text-[10px] text-[#2471A3] font-semibold">+ Extra Sauce</div>
          <div className="text-[10px] text-[#C0392B] font-semibold">No pickles</div>
        </div>
        <div>
          <div className="text-[15px] font-black uppercase leading-tight">2x Filet Mignon</div>
          <div className="text-[10px] text-text-secondary">medium rare</div>
          <div className="text-[10px] text-[#2471A3] font-semibold">+ Extra Sauce</div>
        </div>
      </div>
      <button className="w-full text-[11px] font-bold py-2.5 flex items-center justify-center gap-1.5 text-[#2C3E50]">
        <CheckCircle2 className="w-3.5 h-3.5" />
        MARK AS COMPLETE
      </button>
    </Card>
  );
}

/* --------------------------- PROGRESSIVE TICKET --------------------------- */

function ProgressiveTicket({ identifier }: VProps) {
  return (
    <Card>
      <div className="px-3 py-2 flex justify-between items-center border-b border-border">
        <div className="text-[13px] font-bold">{idLabel(identifier, "title")} <span className="text-text-secondary font-normal">(3)</span></div>
        <div className="text-[12px] font-mono">33:33</div>
      </div>
      <div className="px-3 py-1 text-[9px] font-bold text-[#C0392B] border-b border-border">
        [CRITICAL ALLERGEN: PEANUT, GLUTEN, NUT]
      </div>
      <div className="px-3 py-1 text-[9px] font-bold text-text-secondary tracking-wide">ACTIVE COURSE</div>
      <div className="px-3 py-1.5 border-b border-border">
        <div className="flex items-center gap-1 text-[11px] font-bold">
          <ChevronDown className="w-3 h-3" /> APPETIZER
        </div>
        <div className="pl-4 mt-1 space-y-1">
          <Row n="1" name="Cheese Selection" chips={[['PEANUT ALLERGEN', 'red']]} />
          <Row n="2" name="Meatballs" chips={[['NUT ALLERGY', 'red']]} />
          <Row n="3" name="Filet Mignon" chips={[['DAIRY ALLERGY', 'blue']]} />
          <Row n="4" name="Eggplant Parmesan" chips={[['DAIRY ALLERGY', 'blue'], ['GLUTEN ALLERGY', 'amber']]} />
        </div>
      </div>
      <div className="px-3 py-1 border-b border-border">
        <div className="flex items-center justify-between text-[10px] text-text-secondary">
          <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> ENTREE (3 items)</span>
          <span>8:57 pm</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-text-secondary mt-0.5">
          <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> DESSERT (3 items)</span>
          <span>8:18 pm</span>
        </div>
      </div>
      <button className="w-full bg-[#16A085] text-white text-[11px] font-bold py-2 tracking-wide">
        PREPARING
      </button>
    </Card>
  );
}

function Row({ n, name, chips = [] }: { n: string; name: string; chips?: [string, 'red' | 'amber' | 'blue'][] }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] font-bold text-text-secondary w-3">{n}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold leading-tight">{name}</div>
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {chips.map(([l, t]) => <AllergenChip key={l} label={l} tone={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ SAFETY FIRST ------------------------------ */

function SafetyFirstTicket({ identifier }: VProps) {
  return (
    <Card>
      <div className="bg-[#1A1A2E] text-white px-3 py-1.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="bg-[#C0392B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">{idLabel(identifier)}</span>
          <span className="text-[11px] font-bold">23</span>
        </div>
        <span className="bg-[#C0392B] text-white text-[10px] font-mono px-1.5 py-0.5 rounded">32:03</span>
      </div>
      <div className="px-3 py-0.5 text-[9px] flex justify-between border-b border-border">
        <span>John Peterson</span>
        <span className="text-text-secondary">Maria S · 8:11 PM</span>
      </div>
      <div className="bg-[#E84C3D] text-white text-[10px] font-bold px-3 py-1.5 leading-tight">
        ALLERGENS: PEANUT, GLUTEN | CONTACT: USE CLEAN BOARD, SEP. FRYER
      </div>
      <div className="px-3 py-2 space-y-1.5">
        <SafetyRow n="1" name="Cheese Selection" chip="PEANUT" />
        <SafetyRow n="2" name="Meatballs" chip="Shellfish Allergy" tone="red-outline" />
        <SafetyRow n="1" name="Filet Mignon" note="Medium rare" />
      </div>
      <button className="w-full border-t border-border text-[11px] font-bold py-2 text-[#2C3E50]">
        SERVE
      </button>
    </Card>
  );
}

function SafetyRow({ n, name, chip, note, tone }: { n: string; name: string; chip?: string; note?: string; tone?: 'red-outline' }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-4 h-4 rounded-full bg-muted text-[9px] font-bold flex items-center justify-center shrink-0">{n}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold leading-tight">{name}</div>
        {chip && (
          <span className={`inline-block mt-0.5 text-[9px] font-bold uppercase px-1.5 py-[1px] rounded ${
            tone === 'red-outline' ? 'border border-[#C0392B] text-[#C0392B]' : 'bg-[#FDECEA] text-[#C0392B]'
          }`}>
            <AlertTriangle className="w-2 h-2 inline mr-0.5" /> {chip}
          </span>
        )}
        {note && <div className="text-[10px] text-text-secondary">{note}</div>}
      </div>
    </div>
  );
}

/* ----------------------------- TIMELINE FLOW ------------------------------ */

function TimelineFlowTicket({ identifier }: VProps) {
  return (
    <div className="w-full max-w-[320px] mx-auto">
      <div className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 tracking-wide flex items-center gap-1">
        <Flame className="w-3 h-3 text-[#E67E22]" /> Cooking Lane
      </div>
      <Card>
        <div className="px-3 py-1.5 flex justify-between items-center border-b border-border">
          <div className="text-[12px] font-bold">Order 2</div>
          <div className="text-[11px] font-mono">12:43</div>
        </div>
        <div className="px-3 py-1 flex justify-between text-[10px] border-b border-border">
          <span>21 · Table #</span>
          <span className="text-text-secondary">8:07 PM</span>
        </div>
        <div className="px-3 py-2 space-y-1">
          <div className="flex justify-between border-l-2 border-[#E84C3D] pl-2 text-[11px]">
            <span className="font-semibold">Appetizer</span>
            <span className="font-bold">3</span>
          </div>
          <div className="flex justify-between border-l-2 border-[#16A085] pl-2 text-[11px]">
            <span className="font-semibold">Entrée</span>
            <span className="font-bold">3</span>
          </div>
        </div>
        <div className="px-3 py-1.5 border-t border-border">
          <div className="text-[9px] font-bold text-text-secondary">Allergies</div>
          <div className="text-[10px]">Allow pina</div>
        </div>
        <button className="w-full border-t border-border text-[11px] font-bold py-2 flex items-center justify-center gap-1.5">
          <Flame className="w-3 h-3" /> COOK
          <ArrowRight className="w-3 h-3 ml-1" />
        </button>
      </Card>
      <div className="text-[9px] text-text-secondary text-center mt-1">
        Next stage → Plating
      </div>
    </div>
  );
}

/* ---------------------------- ADAPTIVE DENSITY ---------------------------- */

function AdaptiveDensityTicket({ identifier }: VProps) {
  return (
    <div className="w-full max-w-[320px] mx-auto">
      <div className="flex gap-1 mb-1.5 text-[9px] font-bold">
        <span className="px-1.5 py-0.5 rounded-full bg-muted text-text-secondary">Comfortable</span>
        <span className="px-1.5 py-0.5 rounded-full bg-foreground text-background">Balanced</span>
        <span className="px-1.5 py-0.5 rounded-full bg-muted text-text-secondary">Rush</span>
      </div>
      <Card>
        <div className="px-3 py-1.5 flex justify-between items-center border-b border-border">
          <div className="flex items-center gap-1.5">
            <span className="bg-[#E84C3D] text-white text-[8px] font-bold px-1.5 py-0.5 rounded">URGENT</span>
            <span className="text-[12px] font-bold">23</span>
          </div>
          <span className="bg-[#FDECEA] text-[#C0392B] text-[10px] font-mono px-1.5 py-0.5 rounded">32:07</span>
        </div>
        <div className="px-3 py-0.5 text-[10px] flex justify-between border-b border-border">
          <span>John Peterson</span>
          <span className="text-text-secondary">Maria S. · 8:11 PM</span>
        </div>
        <div className="px-3 py-1 text-[9px] font-bold text-[#C0392B] border-b border-border">
          ! ALLERGENS: Dairy, Gluten, Nut
        </div>
        <div className="px-3 py-1.5 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-muted text-[9px] font-bold flex items-center justify-center">1</span>
            <span className="text-[11px] font-semibold">Cheese Selection</span>
            <AllergenChip label="PEANUT" />
          </div>
          <div className="text-[9px] font-bold text-text-secondary uppercase pt-1">APPETIZER</div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-muted text-[9px] font-bold flex items-center justify-center">2</span>
            <span className="text-[11px] font-semibold">Cheese Selection</span>
            <AllergenChip label="PEANUT" />
          </div>
        </div>
        <div className="px-3 py-1 space-y-0.5 border-t border-border text-[10px] text-text-secondary">
          <div className="flex justify-between">
            <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> ENTREE (2)</span>
            <span>8:46 pm</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> DESSERT (1)</span>
            <span>8:10 pm</span>
          </div>
          <div className="flex justify-between pt-0.5">
            <span className="italic">33 min. ago</span>
            <span>◉ Seen</span>
          </div>
        </div>
        <button className="w-full bg-[#16A085] text-white text-[11px] font-bold py-2 tracking-wide">
          Fulfill
        </button>
      </Card>
    </div>
  );
}

/* --------------------------- DARK COMMAND CENTER -------------------------- */

function DarkCommandTicket({ identifier }: VProps) {
  return (
    <Card dark>
      <div className="px-3 py-1.5 flex justify-between items-center border-b border-[#2A2A44]">
        <div className="flex items-center gap-1.5">
          <span className="bg-[#0D0D1A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">{idLabel(identifier)}</span>
          <span className="text-[12px] font-bold">23</span>
        </div>
        <span className="bg-[#3B1F1F] text-[#F5B4AC] text-[10px] font-mono px-1.5 py-0.5 rounded">32:03</span>
      </div>
      <div className="px-3 py-0.5 text-[10px] flex justify-between border-b border-[#2A2A44] text-[#B8B8CC]">
        <span>John Peterson</span>
        <span>Maria S. · 8:11 PM</span>
      </div>
      <div className="px-3 py-1 text-[9px] font-bold text-[#F5B4AC] border-b border-[#2A2A44]">
        ! PEANUT, GLUTEN, NUT
      </div>
      <div className="px-3 py-2 space-y-1.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#2A2A44] text-[9px] font-bold flex items-center justify-center">1</span>
            <span className="text-[12px] font-semibold">Cheese Selection</span>
          </div>
          <div className="pl-6 mt-0.5">
            <span className="inline-block text-[9px] font-bold uppercase px-1.5 py-[1px] rounded border border-[#F5B4AC] text-[#F5B4AC]">
              ! PEANUT
            </span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#2A2A44] text-[9px] font-bold flex items-center justify-center">2</span>
            <span className="text-[12px] font-semibold">Meatballs</span>
          </div>
          <div className="pl-6 mt-0.5 text-[10px] text-[#B8B8CC] space-y-0.5">
            <div>Medium rare</div>
            <div>Extra Cheese</div>
            <div className="italic">"Make it extra spicy please"</div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#2A2A44] text-[9px] font-bold flex items-center justify-center">1</span>
            <span className="text-[12px] font-semibold">Filet Mignon</span>
          </div>
        </div>
      </div>
      <button className="w-full border-t border-[#2A2A44] text-[11px] font-bold py-2 text-[#5EE3C1]">
        MARK PREPARED
      </button>
      <div className="px-3 py-1 text-[9px] text-[#8888A0] border-t border-[#2A2A44] flex items-center gap-1">
        <ChevronRight className="w-3 h-3" /> Collapsed: 1 DESSERTS
      </div>
    </Card>
  );
}
