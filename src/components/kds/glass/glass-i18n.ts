import { useLanguage } from '@/hooks/use-language';

/**
 * Glass ticket labels are free-form strings ("Table 4", "Maria S. · 12:09",
 * "PEANUT allergy", "3 items · done"), so they need light parsing before the
 * shared dictionaries can translate them. Keeps the Language settings preview
 * and the live glass board in sync with the chosen language(s).
 */
export function useGlassLabels() {
  const {
    to, toSecondary,
    tc, tcSecondary,
    ta, taSecondary,
    tl, tlSecondary,
    tn, tnSecondary,
    tperson, tpersonSecondary,
    displayMode, showSecondaryMenu, secondaryLang,
  } = useLanguage();

  const showSecondary = displayMode === 'dual' && showSecondaryMenu;
  const secondaryDir: 'ltr' | 'rtl' = secondaryLang === 'ar' ? 'rtl' : 'ltr';

  /** Translates a word/phrase through the order-type then embedded dictionary. */
  const word = (
    text: string,
    orderType: (s: string) => string,
    embedded: (s: string) => string,
  ) => {
    if (!text) return text;
    const viaType = orderType(text);
    if (viaType !== text) return viaType;
    const viaEmbedded = embedded(text);
    if (viaEmbedded !== text) return viaEmbedded;
    return text;
  };

  /** "Table 4" → "MESA 4"; "Phone In" → "TELÉFONO". */
  const makeType = (orderType: (s: string) => string, embedded: (s: string) => string) =>
    (label: string) => {
      if (!label) return label;
      const direct = word(label, orderType, embedded);
      if (direct !== label) return direct;
      const parts = label.trim().split(/\s+/);
      if (parts.length < 2) return label;
      const tail = parts[parts.length - 1];
      // Trailing table / lane / banquet identifiers stay as-is.
      if (!/^[0-9]+$|^[A-Za-z]$/.test(tail)) return label;
      const base = parts.slice(0, -1).join(' ');
      const translated = word(base, orderType, embedded);
      return translated === base ? label : `${translated} ${tail}`;
    };

  /** "Maria S. · 12:09" → "María S. · 12:09"; "Counter 1" → "Mostrador 1". */
  const makeServer = (
    person: (s: string) => string,
    orderType: (s: string) => string,
    embedded: (s: string) => string,
  ) =>
    (label: string) => {
      if (!label) return label;
      return label
        .split('·')
        .map((raw) => {
          const seg = raw.trim();
          if (!seg) return raw;
          const asPerson = person(seg);
          if (asPerson !== seg) return asPerson;
          const asWord = makeType(orderType, embedded)(seg);
          if (asWord !== seg) return asWord;
          // "24 covers" → "24 comensales"
          const m = seg.match(/^(\d+)\s+(.+)$/);
          if (m) {
            const t = word(m[2], orderType, embedded);
            if (t !== m[2]) return `${m[1]} ${t}`;
          }
          return seg;
        })
        .join(' · ');
    };

  /** "PEANUT allergy" → "MANÍ alergia". */
  const makeAllergy = (allergen: (s: string) => string, embedded: (s: string) => string) =>
    (label: string) => {
      if (!label) return label;
      const m = label.match(/^(.*?)\s+allergy$/i);
      if (!m) return allergen(label);
      return `${allergen(m[1])} ${embedded('allergy')}`;
    };

  /** "3 items · done" / "Prep 3:45" / "Fires 12:18 pm". */
  const makeMeta = (embedded: (s: string) => string) =>
    (label: string) => {
      if (!label) return label;
      return label
        .split('·')
        .map((raw) => {
          const seg = raw.trim();
          const countMatch = seg.match(/^(\d+)\s+(items?|item)$/i);
          if (countMatch) return `${countMatch[1]} ${embedded(countMatch[2].toLowerCase())}`;
          const prefixMatch = seg.match(/^(Prep|Fires)\s+(.+)$/i);
          if (prefixMatch) return `${embedded(prefixMatch[1])} ${prefixMatch[2]}`;
          const single = embedded(seg);
          return single;
        })
        .join(' · ');
    };

  return {
    showSecondary,
    secondaryDir,
    typeLabel: makeType(to, tl),
    typeLabelSecondary: makeType(toSecondary, tlSecondary),
    serverLabel: makeServer(tperson, to, tl),
    serverLabelSecondary: makeServer(tpersonSecondary, toSecondary, tlSecondary),
    courseLabel: (label: string) => tc(label),
    courseLabelSecondary: (label: string) => tcSecondary(label),
    allergyLabel: makeAllergy(ta, tl),
    allergyLabelSecondary: makeAllergy(taSecondary, tlSecondary),
    metaLabel: makeMeta(tl),
    ctaLabel: (label: string) => tl(label),
    noteLabel: (text: string) => tn(text),
    noteLabelSecondary: (text: string) => tnSecondary(text),
    embeddedLabel: (label: string) => tl(label),
    embeddedLabelSecondary: (label: string) => tlSecondary(label),
  };
}
