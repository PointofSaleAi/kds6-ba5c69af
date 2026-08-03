/**
 * Mock ticket data + shared constants for the glass ticket board.
 * Ported 1:1 from the kds-tickets.html reference implementation.
 */

export type GlassStage = 'unseen' | 'preparing' | 'ready' | 'served';

export interface GlassItem {
  qty: string;
  name: string;
  mods?: string;
  note?: string;
  tags?: string[];
  /**
   * Stable stage key. Set when a ticket is projected to a subset of its items
   * (Seen / Unseen screens) so lifecycle state survives the index shift.
   */
  stageKey?: string;
}

export interface GlassCourse {
  id: string;
  label?: string;
  prep?: string;
  showHeader?: boolean;
  items: GlassItem[];
}

export interface GlassTicket {
  id: string;
  type: string;
  num: string;
  kind: 'table' | 'pickup' | 'delivery' | 'drive' | 'curb' | 'banquet' | 'phone' | 'sched' | 'takeout';
  server: string;
  base: number;
  allergies: string[];
  posMessage?: string;
  posNote?: string;
  courses: GlassCourse[];
}

export const ORDER: GlassStage[] = ['unseen', 'preparing', 'ready', 'served'];
export const CTA: Record<GlassStage, string> = {
  unseen: 'Seen',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
};
export const DARK = 'rgba(20,20,24,0.92)';
export const RED = '#c92a1f';
export const CARD_W = 500;

export const TICKETS: GlassTicket[] = [
  {
    id: 't23', type: 'Table 4', num: '23', kind: 'table', server: 'Maria S. · 12:09', base: 473,
    allergies: ['PEANUT allergy', 'GLUTEN allergy', 'NUT allergy'],
    posMessage: 'Table 4 guest has severe nut allergy. Please double check all dishes before plating.',
    posNote: 'Allergy to nuts. Please prepare food separately and notify server',
    courses: [
      { id: 'app', label: 'APPETIZER', items: [
        { qty: '1×', name: 'Bruschetta', mods: '+ Basil oil', tags: ['GLUTEN'] },
        { qty: '2×', name: 'Calamari', mods: 'Lemon aioli', tags: ['GLUTEN', 'EGG'] } ] },
      { id: 'ent', label: 'ENTREE', prep: 'Prep 3:45', items: [
        { qty: '2×', name: 'Meatballs', mods: 'Medium rare · + Extra Cheese', note: '“Make it extra spicy please”', tags: ['DAIRY'] },
        { qty: '1×', name: 'Filet Mignon', mods: 'Medium rare' } ] },
      { id: 'des', label: 'DESSERT', prep: 'Fires 12:18 pm', items: [
        { qty: '2×', name: 'Tiramisu', mods: 'No cocoa dust', tags: ['DAIRY', 'NUTS'] } ] },
    ],
  },
  {
    id: 't31', type: 'Pickup', num: '31', kind: 'pickup', server: 'David H. · 12:08', base: 533,
    allergies: ['DAIRY allergy', 'GLUTEN allergy', 'SESAME allergy'],
    courses: [ { id: 'all', showHeader: false, items: [
      { qty: '1×', name: 'Nachos', mods: '+ Jalapenos', tags: ['DAIRY'] },
      { qty: '2×', name: 'Beef Burger', mods: 'Well done · + Bacon · No pickles', tags: ['GLUTEN', 'SESAME'] },
      { qty: '1×', name: 'Fries', mods: 'Seasoned' },
      { qty: '2×', name: 'Milkshake', mods: 'Chocolate', tags: ['DAIRY'] } ] } ],
  },
  {
    id: 't33', type: 'Table 15', num: '33', kind: 'table', server: 'Emma T. · 12:07', base: 1490,
    allergies: ['GLUTEN allergy', 'SHELLFISH allergy', 'EGG allergy', 'DAIRY allergy', 'FISH allergy'],
    courses: [
      { id: 'app', label: 'APPETIZER', items: [
        { qty: '2×', name: 'Oysters', mods: 'Mignonette', tags: ['SHELLFISH'] },
        { qty: '1×', name: 'Caesar Salad', mods: 'No anchovy', tags: ['EGG', 'DAIRY'] } ] },
      { id: 'ent', label: 'ENTREE', prep: 'Prep 15:04', items: [
        { qty: '2×', name: 'Osso Buco', mods: '+ Gremolata' },
        { qty: '1×', name: 'Grilled Barramundi', mods: 'Crispy Skin · No fennel', tags: ['FISH'] },
        { qty: '1×', name: 'Veal Scallopini', mods: 'Marsala Sauce', tags: ['GLUTEN', 'DAIRY'] },
        { qty: '1×', name: 'Lamb Rack', mods: 'Medium rare · + Rosemary Jus' },
        { qty: '2×', name: 'Lobster Linguine', mods: '+ Extra Lobster', tags: ['SHELLFISH', 'GLUTEN'] },
        { qty: '1×', name: 'Truffle Risotto', mods: '+ Parmesan Crisp', tags: ['DAIRY'] } ] },
      { id: 'des', label: 'DESSERT', prep: 'Fires 12:18 pm', items: [
        { qty: '3×', name: 'Panna Cotta', mods: 'Berry compote', tags: ['DAIRY'] } ] },
    ],
  },
  {
    id: 't36', type: 'Delivery', num: '36', kind: 'delivery', server: 'DoorDash · 12:06', base: 1290,
    allergies: ['SOY allergy', 'SESAME allergy'],
    courses: [ { id: 'all', showHeader: false, items: [
      { qty: '2×', name: 'Pad Thai', mods: 'Medium spice · No peanuts', tags: ['SOY', 'EGG'] },
      { qty: '1×', name: 'Spring Rolls', mods: '+ Sweet chilli', tags: ['GLUTEN'] },
      { qty: '1×', name: 'Coconut Rice', mods: '' } ] } ],
  },
  {
    id: 't38', type: 'Drive Thru', num: '38', kind: 'drive', server: 'Lane 2 · 12:10', base: 322,
    allergies: ['GLUTEN allergy'],
    courses: [ { id: 'all', showHeader: false, items: [
      { qty: '3×', name: 'Chicken Wrap', mods: 'No mayo', tags: ['GLUTEN', 'MUSTARD'] },
      { qty: '2×', name: 'Onion Rings', mods: '', tags: ['GLUTEN'] },
      { qty: '3×', name: 'Iced Tea', mods: 'No sugar' } ] } ],
  },
  {
    id: 't40', type: 'Curb Side', num: '40', kind: 'curb', server: 'North Lot · 12:04', base: 560,
    allergies: ['DAIRY allergy', 'NUT allergy'],
    courses: [ { id: 'all', showHeader: false, items: [
      { qty: '1×', name: 'Margherita Pizza', mods: 'Well baked', tags: ['DAIRY', 'GLUTEN'] },
      { qty: '2×', name: 'Garlic Knots', mods: '+ Parmesan', tags: ['DAIRY', 'GLUTEN'] },
      { qty: '1×', name: 'Caprese Salad', mods: 'No basil', tags: ['DAIRY'] } ] } ],
  },
  {
    id: 't42', type: 'Banquet B', num: '42', kind: 'banquet', server: 'Priya P. · 24 covers', base: 1345,
    allergies: ['GLUTEN allergy', 'DAIRY allergy'],
    courses: [
      { id: 'sal', label: 'SALAD', items: [
        { qty: '4×', name: 'Garden Salad', mods: 'Vinaigrette on side' } ] },
      { id: 'ent', label: 'ENTREE', prep: 'Prep 8:20', items: [
        { qty: '3×', name: 'Roasted Chicken', mods: '+ Rosemary jus' },
        { qty: '2×', name: 'Eggplant Parmesan', mods: '', tags: ['DAIRY', 'GLUTEN'] },
        { qty: '2×', name: 'Sea Bass', mods: 'Lemon butter', tags: ['FISH', 'DAIRY'] } ] },
      { id: 'des', label: 'DESSERT', prep: 'Fires 12:40 pm', items: [
        { qty: '4×', name: 'Lemon Tart', mods: '', tags: ['GLUTEN', 'EGG'] } ] },
    ],
  },
  {
    id: 't45', type: 'Take Out', num: '45', kind: 'takeout', server: 'Counter 1 · 12:11', base: 145,
    allergies: ['GLUTEN allergy'],
    courses: [ { id: 'all', showHeader: false, items: [
      { qty: '2×', name: 'Chicken Biryani', mods: 'Medium spice · + Raita' },
      { qty: '1×', name: 'Butter Naan', mods: '', tags: ['GLUTEN', 'DAIRY'] },
      { qty: '2×', name: 'Mango Lassi', mods: 'No sugar', tags: ['DAIRY'] } ] } ],
  },
  {
    id: 't47', type: 'Phone In', num: '47', kind: 'phone', server: 'Aisha K. · 12:12', base: 96,
    allergies: ['SHELLFISH allergy'],
    posMessage: 'Guest calling back in 10 minutes to confirm pickup time.',
    posNote: 'Pack sauces separately, guest is collecting on the way home',
    courses: [ { id: 'all', showHeader: false, items: [
      { qty: '1×', name: 'Prawn Curry', mods: 'Extra hot', tags: ['SHELLFISH'] },
      { qty: '2×', name: 'Steamed Rice', mods: '' } ] } ],
  },
  {
    id: 't49', type: 'Scheduled', num: '49', kind: 'sched', server: 'Pickup 1:15 pm', base: 40,
    allergies: ['EGG allergy'],
    courses: [
      { id: 'app', label: 'APPETIZER', items: [
        { qty: '4×', name: 'Samosa', mods: '+ Tamarind chutney', tags: ['GLUTEN'] } ] },
      { id: 'ent', label: 'ENTREE', prep: 'Fires 1:00 pm', items: [
        { qty: '3×', name: 'Paneer Tikka', mods: 'Char grilled', tags: ['DAIRY'] },
        { qty: '2×', name: 'Dal Makhani', mods: '', tags: ['DAIRY'] } ] },
    ],
  },
  {
    id: 't51', type: 'Table 9', num: '51', kind: 'table', server: 'Leo M. · 12:13', base: 240,
    allergies: ['DAIRY allergy'],
    courses: [
      { id: 'app', label: 'APPETIZER', items: [
        { qty: '2×', name: 'Soup of the Day', mods: 'No cream', tags: ['DAIRY'] } ] },
      { id: 'ent', label: 'ENTREE', prep: 'Prep 2:10', items: [
        { qty: '1×', name: 'Ribeye Steak', mods: 'Medium · + Peppercorn sauce' },
        { qty: '1×', name: 'Duck Confit', mods: 'Crispy skin' } ] },
    ],
  },
];

/* ── shared style strings (verbatim from the reference file) ── */
export const GLOSS_TICKET: React.CSSProperties = {
  padding: '8px 15px 9px',
  borderRadius: 999,
  background: 'linear-gradient(180deg, rgba(255,250,249,0.97) 0%, rgba(255,234,231,0.9) 48%, rgba(252,208,202,0.78) 100%)',
  border: '1px solid rgba(255,255,255,0.85)',
  color: '#9e1f14',
  whiteSpace: 'nowrap',
  fontWeight: 700,
  fontSize: 15,
  lineHeight: 1,
  textShadow: '0 1px 0 rgba(255,255,255,0.8)',
  boxShadow: '0 4px 10px rgba(158,31,20,0.22), inset 0 1.5px 0 rgba(255,255,255,0.9), inset 0 -2px 3px rgba(190,90,80,0.3)',
};

export const GLOSS_ITEM: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  padding: '5px 11px 6px',
  borderRadius: 999,
  background: 'linear-gradient(180deg, rgba(255,250,249,0.96) 0%, rgba(255,236,233,0.88) 50%, rgba(252,212,206,0.76) 100%)',
  border: '1px solid rgba(255,255,255,0.8)',
  color: '#9e1f14',
  whiteSpace: 'nowrap',
  fontWeight: 700,
  fontSize: 14,
  lineHeight: 1,
  letterSpacing: '0.05em',
  textShadow: '0 1px 0 rgba(255,255,255,0.75)',
  boxShadow: '0 3px 8px rgba(158,31,20,0.2), inset 0 1.5px 0 rgba(255,255,255,0.9)',
};

export const ACT_BTN: React.CSSProperties = {
  width: 48,
  height: 48,
  flex: '0 0 auto',
  display: 'grid',
  placeItems: 'center',
  cursor: 'pointer',
  borderRadius: 15,
  boxShadow: '0 5px 14px rgba(28,33,54,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
};

/* ── helpers ── */
export const keyOf = (t: string, c: string, i: number) => `${t}:${c}:${i}`;

/** Resolves an item's lifecycle key, honouring projected (filtered) tickets. */
export const itemKey = (t: GlassTicket, c: GlassCourse, it: GlassItem, i: number) =>
  it.stageKey ?? keyOf(t.id, c.id, i);

export const fmt = (sec: number) => {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export function ticketKeys(t: GlassTicket): string[] {
  const out: string[] = [];
  t.courses.forEach((c) => c.items.forEach((it, i) => out.push(itemKey(t, c, it, i))));
  return out;
}

/**
 * Ticket button reflects the LEAST advanced stage across items — the ticket only
 * moves to the next stage once every product reached it.
 */
export function ticketStage(t: GlassTicket, items: Record<string, GlassStage>): GlassStage {
  const idx = ticketKeys(t).map((k) => ORDER.indexOf(items[k] || 'unseen'));
  return ORDER[Math.min(...(idx.length ? idx : [0]))];
}

export function activeCourse(t: GlassTicket, items: Record<string, GlassStage>): number {
  for (let i = 0; i < t.courses.length; i++) {
    const c = t.courses[i];
    if (!c.items.every((it, j) => (items[itemKey(t, c, it, j)] || 'unseen') === 'served')) return i;
  }
  return t.courses.length - 1;
}

export function stageVisuals(stage: GlassStage) {
  const filled = stage === 'preparing' || stage === 'served';
  return {
    icon: (stage === 'unseen' ? 'eye' : stage === 'preparing' ? 'dome' : 'tick') as 'eye' | 'dome' | 'tick',
    sw: stage === 'ready' || stage === 'served' ? 2.6 : 1.9,
    bg: filled ? DARK : 'rgba(255,255,255,0.7)',
    fg: filled ? '#ffffff' : '#0b0b0c',
    border: filled ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.9)',
  };
}

/**
 * Aging tones, aligned 1:1 with the shared ticket aging bands
 * (New 0–3m · Medium 3–5m · Delay 5–7m · Overtime 7m+), stop-light gradients.
 */
export function timerTone(sec: number) {
  const min = sec / 60;
  if (min < 3) return { bg: 'linear-gradient(180deg, #34d15b, #1da94a)', fg: '#ffffff', glow: '52,209,91' };
  if (min < 5) return { bg: 'linear-gradient(180deg, #ffb340, #f08c00)', fg: '#3d2400', glow: '255,179,64' };
  if (min < 7) return { bg: 'linear-gradient(180deg, #ff453a, #e0281c)', fg: '#ffffff', glow: '255,69,58' };
  return { bg: 'linear-gradient(180deg, #a259e6, #7b2fc4)', fg: '#ffffff', glow: '162,89,230' };
}
