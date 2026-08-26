import type { PanchangaDay, FestivalType, Tradition } from "@/lib/panchanga/types";

export interface FestivalRuleContext {
  prevDay?: PanchangaDay;
  nextDay?: PanchangaDay;
}

/**
 * A festival rule is a *predicate over computed Panchanga*, not a stored
 * Gregorian date. `match` is evaluated against every computed day in the
 * requested range; when it returns true the rule's metadata (via `build`)
 * becomes a Festival record for that date. This is what makes festival
 * dates move correctly from year to year and location to location instead
 * of being hardcoded.
 */
export interface FestivalRule {
  id: string;
  name: string | ((day: PanchangaDay) => string);
  type: FestivalType;
  tradition: Tradition;
  priority: number;
  color: string;
  fastingRequired: boolean;
  fastingType?: string;
  isSampleData?: boolean;
  /** Longer background on the observance (history, deity, why it's kept) shown in the detail view. */
  significance?: string;
  match: (day: PanchangaDay, ctx: FestivalRuleContext) => boolean;
  describe: (day: PanchangaDay) => string;
  explain: (day: PanchangaDay) => string;
  /** Optional fast-breaking (Parana) window for fasting festivals beyond Ekadashi. */
  breakingTime?: (day: PanchangaDay, ctx: FestivalRuleContext) => BreakingTime | undefined;
}

export interface BreakingTime {
  paranaDate: string;
  paranaStart: string;
  paranaEnd: string;
}

/** Midpoint between two ISO instants, as an ISO string. */
function midpointIso(aIso: string | null, bIso: string | null): string | null {
  if (!aIso || !bIso) return null;
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  return new Date(a + (b - a) / 2).toISOString();
}

// A tithi can span two consecutive sunrises (a "vriddhi" tithi), which would
// otherwise make a fixed-tithi rule match two days in a row. Festival/acharya
// days conventionally observe only the first such sunrise, so every helper
// here requires the previous day's sunrise-tithi to differ - a no-op on an
// ordinary day (where it always differs anyway) and the guard that suppresses
// the spurious second match on a vriddhi day.
const isFirstSunriseOfTithi = (day: PanchangaDay, ctx: FestivalRuleContext) =>
  ctx.prevDay?.tithi.index !== day.tithi.index;

const tithiIn = (day: PanchangaDay, ctx: FestivalRuleContext, masa: string, index: number) =>
  day.masaAmanta === masa && day.tithi.index === index && isFirstSunriseOfTithi(day, ctx);

// For Krishna-paksha festivals, most widely-recognized festival names follow
// the Purnimanta month convention (e.g. "Bhadrapada Krishna Ashtami" for
// Janmashtami, "Kartika Amavasya" for Diwali) even though the Amanta system
// would name that same Krishna paksha one month earlier (it belongs to the
// tail end of the Amanta month before). Both are astronomically the same
// day - only the month label differs by convention. See masaPurnimanta in
// the calculator for the derivation.
const tithiInPurnimanta = (day: PanchangaDay, ctx: FestivalRuleContext, masa: string, index: number) =>
  day.masaPurnimanta === masa && day.tithi.index === index && isFirstSunriseOfTithi(day, ctx);

export const FESTIVAL_RULES: FestivalRule[] = [
  {
    id: "purnima",
    name: "Purnima",
    type: "purnima",
    tradition: "general",
    priority: 5,
    color: "#C9A227",
    fastingRequired: false,
    match: (day) => day.tithi.index === 14,
    describe: () => "Full Moon (Purnima) — an auspicious lunar day observed across Hindu traditions.",
    significance: "Purnima marks the Moon's full illumination, considered a time of completion and heightened spiritual energy. Many temples hold special evening aratis, and it is a traditional day for Satyanarayan puja and fasting/charity in various regional customs.",
    explain: (day) => `Tithi reached index 14 (Purnima) at sunrise on ${day.date} in ${day.masaAmanta} masa.`,
  },
  {
    id: "amavasya",
    name: "Amavasya",
    type: "amavasya",
    tradition: "general",
    priority: 5,
    color: "#171A3A",
    fastingRequired: false,
    match: (day) => day.tithi.index === 29,
    describe: () => "New Moon (Amavasya) — traditionally observed for ancestral rites (Shraddha/Tarpana).",
    significance: "Amavasya, when the Moon is invisible, is traditionally set aside for honoring ancestors (Pitru Tarpana) and for introspective, quiet worship. Some Amavasyas carry their own names and added significance (e.g. Mauni, Somvati, Kartika) depending on the weekday and masa they fall in.",
    explain: (day) => `Tithi reached index 29 (Amavasya) at sunrise on ${day.date} in ${day.masaAmanta} masa.`,
  },
  {
    id: "sankranti",
    name: (day) => `${day.rashiOfSun} Sankranti`,
    type: "sankranti",
    tradition: "general",
    priority: 6,
    color: "#7A2946",
    fastingRequired: false,
    match: (day) => day.isSankranti,
    describe: (day) => `The Sun's sidereal transit into ${day.rashiOfSun}, marking a solar-month boundary.`,
    significance: "Sankranti days mark the Sun's entry into a new sidereal sign and are considered auspicious for charity, holy bathing and the start of new solar-calendar months. Makar Sankranti (into Capricorn) is especially significant, marking the Sun's northward turn (Uttarayana).",
    explain: (day) => `Sun's sidereal longitude crossed into ${day.rashiOfSun} rashi (0°) on or before sunrise of ${day.date}.`,
  },
  {
    id: "maha-shivaratri",
    name: "Maha Shivaratri",
    type: "festival",
    tradition: "general",
    priority: 2,
    color: "#171A3A",
    fastingRequired: true,
    fastingType: "Night vigil fast, broken the following morning",
    match: (day, ctx) => tithiInPurnimanta(day, ctx, "Phalguna", 28),
    describe: () => "Great Night of Shiva — a night of vigil, fasting and worship of Lord Shiva.",
    significance: "Maha Shivaratri commemorates the night Lord Shiva performed his cosmic dance (Tandava) and, in some traditions, the night of his marriage to Parvati. Devotees observe a fast, stay awake through the night (jagarana), and offer bael leaves, milk and water to the Shiva Linga during each of the night's four prahara (watches).",
    explain: (day) => `Krishna Chaturdashi tithi (index 28) of Phalguna masa falls on ${day.date}.`,
    breakingTime: (day, ctx) => {
      // Fast is broken the following morning after sunrise, traditionally before madhyahna (midday).
      if (!ctx.nextDay?.sunrise) return undefined;
      const sunrise = new Date(ctx.nextDay.sunrise);
      return {
        paranaDate: ctx.nextDay.date,
        paranaStart: sunrise.toISOString(),
        paranaEnd: new Date(sunrise.getTime() + 4 * 60 * 60 * 1000).toISOString(),
      };
    },
  },
  {
    id: "holika-dahan",
    name: "Holika Dahan",
    type: "festival",
    tradition: "general",
    priority: 3,
    color: "#D97732",
    fastingRequired: false,
    match: (day, ctx) => tithiIn(day, ctx, "Phalguna", 14),
    describe: () => "Bonfire on the eve of Holi, symbolizing the triumph of good over evil.",
    significance: "Holika Dahan commemorates the legend of Prahlada, a devotee of Vishnu, who survived a fire set by his demoness aunt Holika because of his unwavering faith - while Holika, despite her boon of fire-immunity, perished. Bonfires are lit and circumambulated the evening before Holi.",
    explain: (day) => `Phalguna Purnima (tithi index 14) falls on ${day.date}.`,
  },
  {
    id: "holi",
    name: "Holi",
    type: "festival",
    tradition: "general",
    priority: 2,
    color: "#E8B6B6",
    fastingRequired: false,
    match: (day, ctx) => day.tithi.index === 0 && ctx.prevDay?.masaAmanta === "Phalguna" && ctx.prevDay?.tithi.index === 14,
    describe: () => "Festival of Colors, celebrated the morning after Holika Dahan.",
    significance: "Holi celebrates the arrival of spring and the playful, colorful pastimes (lila) of Radha and Krishna in Vraja, alongside the victory of devotion over demoniac pride. People douse each other in colored powder and water as an expression of joy and the dissolving of social distinctions for the day.",
    explain: (day) => `Pratipada tithi following Phalguna Purnima falls on ${day.date}.`,
  },
  {
    id: "rama-navami",
    name: "Rama Navami",
    type: "festival",
    tradition: "general",
    priority: 2,
    color: "#D97732",
    fastingRequired: true,
    fastingType: "Optional day-fast until noon puja",
    match: (day, ctx) => tithiIn(day, ctx, "Chaitra", 8),
    describe: () => "Birth anniversary of Lord Rama, observed on Chaitra Shukla Navami.",
    significance: "Rama Navami marks the appearance of Lord Rama, the seventh incarnation of Vishnu and hero of the Ramayana, born to King Dasharatha of Ayodhya at noon (madhyahna) on this tithi. It falls on the ninth day of Chaitra Navaratri and is observed with readings of the Ramayana and temple processions.",
    explain: (day) => `Shukla Navami tithi (index 8) of Chaitra masa falls on ${day.date}.`,
  },
  {
    id: "hanuman-jayanti",
    name: "Hanuman Jayanti",
    type: "festival",
    tradition: "general",
    priority: 3,
    color: "#7A2946",
    fastingRequired: false,
    match: (day, ctx) => tithiIn(day, ctx, "Chaitra", 14),
    describe: () => "Celebrated as the appearance day of Lord Hanuman (regional variations exist).",
    significance: "Hanuman Jayanti honors Lord Hanuman, the devoted monkey-deity and hero of the Ramayana, celebrated for his strength, courage and unwavering devotion (bhakti) to Rama. Regional traditions differ on the exact tithi - some observe it on Chaitra Purnima, others on Kartika or Margashirsha dates.",
    explain: (day) => `Chaitra Purnima (tithi index 14) falls on ${day.date}.`,
  },
  {
    id: "akshaya-tritiya",
    name: "Akshaya Tritiya",
    type: "festival",
    tradition: "general",
    priority: 2,
    color: "#C9A227",
    fastingRequired: false,
    match: (day, ctx) => tithiIn(day, ctx, "Vaishakha", 2),
    describe: () => "A day considered eternally auspicious for new beginnings, especially gold purchases and charity.",
    significance: "Akshaya means 'imperishable' - actions and investments begun on this day are believed to yield undiminishing merit. It is associated with the start of Treta Yuga, the appearance of Parashurama, and Ved Vyasa beginning to narrate the Mahabharata to Ganesha.",
    explain: (day) => `Shukla Tritiya tithi (index 2) of Vaishakha masa falls on ${day.date}.`,
  },
  {
    id: "guru-purnima",
    name: "Guru Purnima",
    type: "festival",
    tradition: "general",
    priority: 3,
    color: "#C9A227",
    fastingRequired: false,
    match: (day, ctx) => tithiIn(day, ctx, "Ashadha", 14),
    describe: () => "A day of reverence and gratitude toward one's spiritual teacher (guru).",
    significance: "Guru Purnima honors Ved Vyasa, compiler of the Vedas and author of the Mahabharata, revered as the adi-guru (first guru). Disciples across Hindu, Buddhist and Jain traditions use this day to offer gratitude and worship to their own spiritual teachers.",
    explain: (day) => `Ashadha Purnima (tithi index 14) falls on ${day.date}.`,
  },
  {
    id: "raksha-bandhan",
    name: "Raksha Bandhan",
    type: "festival",
    tradition: "general",
    priority: 3,
    color: "#E8B6B6",
    fastingRequired: false,
    match: (day, ctx) => tithiIn(day, ctx, "Shravana", 14),
    describe: () => "Festival celebrating the bond between siblings, marked by tying a protective thread (rakhi).",
    significance: "A sister ties a rakhi (protective thread) on her brother's wrist, praying for his wellbeing, while he vows to protect her - a bond celebrated regardless of blood relation. In some regions the day is also observed as Upakarmam, when Brahmins change their sacred thread.",
    explain: (day) => `Shravana Purnima (tithi index 14) falls on ${day.date}.`,
  },
  {
    id: "balarama-appearance",
    name: "Lord Balarama — Appearance",
    type: "appearance",
    tradition: "vaishnava",
    priority: 2,
    color: "#171A3A",
    fastingRequired: false,
    match: (day, ctx) => tithiIn(day, ctx, "Shravana", 14),
    describe: () => "Appearance of Lord Balarama, elder brother of Sri Krishna, observed on Shravana Purnima.",
    significance: "Balarama is Krishna's elder brother, an incarnation of Ananta Shesha, celebrated for his immense strength (he carries the plow and mace) and his role as Krishna's constant companion and protector in Vrindavan and Dvaraka.",
    explain: (day) => `Shravana Purnima (tithi index 14) falls on ${day.date}.`,
  },
  {
    id: "janmashtami",
    name: "Sri Krishna Janmashtami",
    type: "festival",
    tradition: "vaishnava",
    priority: 1,
    color: "#171A3A",
    fastingRequired: true,
    fastingType: "Full-day fast broken after midnight (Nishita Puja) or the following morning per tradition",
    match: (day, ctx) => tithiInPurnimanta(day, ctx, "Bhadrapada", 22),
    describe: (day) =>
      day.nakshatra.index === 3
        ? "Appearance of Lord Sri Krishna — this year coincides with Rohini Nakshatra, considered the most auspicious combination (Jayanti Yoga)."
        : "Appearance of Lord Sri Krishna, observed on Krishna Ashtami of Bhadrapada masa.",
    significance: "Janmashtami marks the midnight appearance of Lord Krishna, eighth incarnation of Vishnu, in a prison cell in Mathura to end the tyranny of King Kamsa. Devotees fast through the day, stay awake until midnight for Nishita Puja, and celebrate with devotional singing, dance-dramas (Rasa Lila) and the swinging of Krishna's deity in a cradle.",
    explain: (day) => `Krishna Ashtami tithi (index 22) of Bhadrapada masa falls on ${day.date}, with Moon in ${day.nakshatra.name} Nakshatra.`,
    breakingTime: (day, ctx) => {
      // Nishita Kaal (the moment of Krishna's appearance) is the midpoint of
      // that night, i.e. between this day's sunset and the next day's sunrise.
      // Many devotees break the fast right after Nishita Puja; others continue
      // until the following sunrise - the window below spans both customs.
      const nishita = midpointIso(day.sunset, ctx.nextDay?.sunrise ?? null);
      if (!nishita || !ctx.nextDay?.sunrise) return undefined;
      const sunrise = new Date(ctx.nextDay.sunrise);
      return {
        paranaDate: ctx.nextDay.date,
        paranaStart: nishita,
        paranaEnd: new Date(sunrise.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      };
    },
  },
  {
    id: "radhashtami",
    name: "Sri Radhashtami",
    type: "appearance",
    tradition: "vaishnava",
    priority: 1,
    color: "#7A2946",
    fastingRequired: true,
    fastingType: "Optional fast until noon (madhyahna) puja, or a full day-fast for advanced practitioners",
    match: (day, ctx) => tithiInPurnimanta(day, ctx, "Bhadrapada", 7),
    describe: () => "Appearance of Srimati Radharani, observed on Shukla Ashtami of Bhadrapada masa, 15 days after Janmashtami.",
    significance: "Radharani is Krishna's eternal consort, embodying the highest ideal of selfless devotion (prema-bhakti) in Vaishnava theology. Radhashtami is celebrated with especially elaborate deity decoration and abhisheka (ceremonial bathing), often at noon, when she is believed to have appeared.",
    explain: (day) => `Shukla Ashtami tithi (index 7) of Bhadrapada masa falls on ${day.date}.`,
  },
  {
    id: "navaratri-day",
    name: (day) => `Navaratri — Day ${day.tithi.index + 1}`,
    type: "festival",
    tradition: "general",
    priority: 4,
    color: "#7A2946",
    fastingRequired: true,
    fastingType: "Nine-night fast/vrata to the Goddess (partial fasting customary)",
    match: (day) => day.masaAmanta === "Ashwina" && day.tithi.index >= 0 && day.tithi.index <= 8,
    describe: (day) => `Day ${day.tithi.index + 1} of Sharad Navaratri, nine nights dedicated to the Goddess.`,
    significance: "Navaratri's nine nights honor the Goddess Durga in her nine forms (Navadurga), traditionally grouped into three sets of three nights each dedicated to Durga, Lakshmi and Saraswati. It commemorates Durga's nine-day battle with the buffalo-demon Mahishasura, culminating in his defeat on Vijayadashami.",
    explain: (day) => `Shukla ${day.tithi.name} tithi (index ${day.tithi.index}) of Ashwina masa falls on ${day.date}.`,
  },
  {
    id: "dussehra",
    name: "Vijayadashami (Dussehra)",
    type: "festival",
    tradition: "general",
    priority: 1,
    color: "#D97732",
    fastingRequired: false,
    match: (day, ctx) => tithiIn(day, ctx, "Ashwina", 9),
    describe: () => "Celebrates the triumph of good over evil, concluding the Navaratri festival.",
    significance: "Vijayadashami ('the tenth day of victory') marks both Durga's defeat of Mahishasura and Lord Rama's defeat of the demon-king Ravana. Effigies of Ravana are ceremonially burned in many regions, and the day is considered auspicious for beginning new ventures and learning.",
    explain: (day) => `Shukla Dashami tithi (index 9) of Ashwina masa falls on ${day.date}.`,
  },
  {
    id: "dhanteras",
    name: "Dhanteras",
    type: "festival",
    tradition: "general",
    priority: 2,
    color: "#C9A227",
    fastingRequired: false,
    match: (day, ctx) => tithiInPurnimanta(day, ctx, "Kartika", 27),
    describe: () => "Opens the Diwali festivities; considered auspicious for purchasing gold, silver and utensils.",
    significance: "Dhanteras honors Dhanvantari, the god of Ayurvedic medicine who is said to have emerged from the churning of the cosmic ocean bearing the pot of nectar, and Goddess Lakshmi, whose blessings for wealth and health are invoked as the five-day Diwali festival begins.",
    explain: (day) => `Krishna Trayodashi tithi (index 27) of Kartika masa falls on ${day.date}.`,
  },
  {
    id: "naraka-chaturdashi",
    name: "Naraka Chaturdashi (Choti Diwali)",
    type: "festival",
    tradition: "general",
    priority: 3,
    color: "#D97732",
    fastingRequired: false,
    match: (day, ctx) => tithiInPurnimanta(day, ctx, "Kartika", 28),
    describe: () => "Commemorates Krishna's victory over the demon Narakasura.",
    significance: "Naraka Chaturdashi commemorates Krishna (with Satyabhama) slaying the demon Narakasura and freeing 16,000 captive women. Many take a pre-dawn ritual oil bath (abhyanga snana) on this day, believed to remove sin and ill fortune.",
    explain: (day) => `Krishna Chaturdashi tithi (index 28) of Kartika masa falls on ${day.date}.`,
  },
  {
    id: "diwali",
    name: "Diwali (Lakshmi Puja)",
    type: "festival",
    tradition: "general",
    priority: 1,
    color: "#C9A227",
    fastingRequired: false,
    match: (day, ctx) => tithiInPurnimanta(day, ctx, "Kartika", 29),
    describe: () => "Festival of Lights, marking the worship of Goddess Lakshmi on Kartika Amavasya.",
    significance: "Diwali celebrates Lord Rama's return to Ayodhya after 14 years of exile and his victory over Ravana, welcomed home with rows of oil lamps (diyas) lighting the way. It is also the principal night for Lakshmi Puja, inviting the goddess of prosperity into homes and businesses for the new financial year in many regions.",
    explain: (day) =>
      `Amavasya tithi (index 29) of Kartika masa (Purnimanta) falls on ${day.date} by the sunrise-day rule used throughout this app. ` +
      `Note: many published almanacs instead select Diwali by which day's Pradosh Kaal (dusk) carries the Amavasya tithi, which can shift the date by one day versus a pure sunrise rule - cross-check against a regional almanac near the boundary.`,
  },
  {
    id: "govardhan-puja",
    name: "Govardhan Puja",
    type: "festival",
    tradition: "vaishnava",
    priority: 2,
    color: "#7A2946",
    fastingRequired: false,
    match: (day, ctx) => day.masaAmanta === "Kartika" && day.tithi.index === 0 && ctx.prevDay?.masaPurnimanta === "Kartika" && ctx.prevDay?.tithi.index === 29,
    describe: () => "Commemorates Krishna lifting Govardhan Hill; celebrated the day after Diwali.",
    significance: "Krishna lifted Govardhan Hill on his little finger for seven days to shelter the residents of Vraja from Indra's torrential rains, teaching Indra humility and shifting the villagers' worship from the sky-god to Govardhan itself. Devotees prepare an elaborate food offering (Annakuta, 'mountain of food') to commemorate it.",
    explain: (day) => `Shukla Pratipada tithi immediately following Kartika Amavasya falls on ${day.date}.`,
  },
  {
    id: "bhai-dooj",
    name: "Bhai Dooj",
    type: "festival",
    tradition: "general",
    priority: 3,
    color: "#E8B6B6",
    fastingRequired: false,
    match: (day, ctx) => day.masaAmanta === "Kartika" && day.tithi.index === 1 && ctx.prevDay?.masaAmanta === "Kartika" && ctx.prevDay?.tithi.index === 0,
    describe: () => "Celebrates the bond between brothers and sisters, two days after Diwali.",
    significance: "Bhai Dooj mirrors Raksha Bandhan's spirit at the other end of the year: sisters perform an arati and apply a tilak to their brothers' foreheads, praying for their long life, while brothers offer gifts in return - commemorating Yama's visit to his sister Yamuna on this day.",
    explain: (day) => `Shukla Dvitiya tithi of the month following Diwali falls on ${day.date}.`,
  },
  {
    id: "chaturmasya-start",
    name: "Chaturmasya begins (Devshayani Ekadashi)",
    type: "chaturmasya",
    tradition: "vaishnava",
    priority: 3,
    color: "#171A3A",
    fastingRequired: false,
    match: (day, ctx) => tithiIn(day, ctx, "Ashadha", 10),
    describe: () => "Beginning of the four holy months (Chaturmasya), when Lord Vishnu is said to enter cosmic sleep.",
    significance: "During Chaturmasya, Lord Vishnu is said to rest in cosmic yogic sleep on the serpent Shesha in the causal ocean. The four-month period is traditionally observed with increased austerity, pilgrimage, and dietary restrictions (different vegetables/foods are often given up in successive months), ending when he awakens on Prabodhini Ekadashi.",
    explain: (day) => `Ashadha Shukla Ekadashi (tithi index 10) falls on ${day.date}.`,
  },
  {
    id: "chaturmasya-end",
    name: "Chaturmasya ends (Prabodhini Ekadashi)",
    type: "chaturmasya",
    tradition: "vaishnava",
    priority: 3,
    color: "#171A3A",
    fastingRequired: false,
    match: (day, ctx) => tithiIn(day, ctx, "Kartika", 10),
    describe: () => "Conclusion of Chaturmasya, when Lord Vishnu is said to awaken from cosmic sleep.",
    significance: "Also called Devutthana or Dev Diwali Ekadashi, this marks Vishnu's awakening from his four-month cosmic sleep. It traditionally opens the season for auspicious ceremonies (weddings, housewarmings) that are paused during Chaturmasya, and is celebrated with Tulsi Vivah in many households.",
    explain: (day) => `Kartika Shukla Ekadashi (tithi index 10) falls on ${day.date}.`,
  },
  {
    id: "rupa-gosvami-disappearance",
    name: "Srila Rupa Gosvami — Disappearance",
    type: "disappearance",
    tradition: "gaudiya",
    priority: 2,
    color: "#7A2946",
    fastingRequired: false,
    match: (day, ctx) => tithiIn(day, ctx, "Shravana", 11),
    describe: () => "Disappearance of Srila Rupa Gosvami, foremost of the Six Gosvamis of Vrindavan.",
    significance: "Srila Rupa Gosvami, a chief disciple of Sri Chaitanya Mahaprabhu, was sent with his brother Sanatana to Vrindavan to establish its temples and literature. His writings (including the Bhakti-rasamrita-sindhu) remain foundational to Gaudiya Vaishnava theology and aesthetics of devotion.",
    explain: (day) => `Shravana Shukla Dvadashi tithi (index 11) falls on ${day.date}.`,
  },
  {
    id: "gauridasa-pandita-disappearance",
    name: "Sri Gauridasa Pandita — Disappearance",
    type: "disappearance",
    tradition: "gaudiya",
    priority: 2,
    color: "#7A2946",
    fastingRequired: false,
    match: (day, ctx) => tithiIn(day, ctx, "Shravana", 11),
    describe: () => "Disappearance of Sri Gauridasa Pandita, a prominent associate of Sri Chaitanya Mahaprabhu.",
    significance: "Sri Gauridasa Pandita was a beloved associate of Sri Chaitanya Mahaprabhu, remembered in Gaudiya Vaishnava tradition for his deep affection for Chaitanya and Nityananda and his establishment of deity worship in Bengal.",
    explain: (day) => `Shravana Shukla Dvadashi tithi (index 11) falls on ${day.date}.`,
  },
  {
    id: "prabhupada-appearance",
    name: "Srila Prabhupada — Appearance",
    type: "appearance",
    tradition: "gaudiya",
    priority: 2,
    color: "#171A3A",
    fastingRequired: false,
    match: (day, ctx) => tithiInPurnimanta(day, ctx, "Bhadrapada", 23),
    describe: () => "Appearance (Vyasa-puja) of Srila A.C. Bhaktivedanta Swami Prabhupada, Founder-Acharya of ISKCON.",
    significance: "Srila Prabhupada founded the International Society for Krishna Consciousness (ISKCON) in 1966, spreading Gaudiya Vaishnavism worldwide through his translations and commentaries on the Bhagavad-gita and Srimad-Bhagavatam. His appearance day is celebrated with a Vyasa-puja ceremony honoring him as a spiritual teacher.",
    explain: (day) => `Bhadrapada Krishna Navami tithi (index 23) falls on ${day.date}.`,
  },
  {
    id: "vamana-dvadashi",
    name: "Sri Vamana Dvadashi",
    type: "appearance",
    tradition: "vaishnava",
    priority: 2,
    color: "#171A3A",
    fastingRequired: false,
    match: (day, ctx) => tithiIn(day, ctx, "Bhadrapada", 11),
    describe: () => "Appearance of Lord Vamanadeva, the dwarf-brahmana incarnation of Vishnu.",
    significance: "Vamana, the dwarf incarnation of Vishnu, approached the demon-king Bali and asked for only as much land as he could cover in three steps - then grew to cosmic size, covering the earth and heavens in two steps and placing his third on Bali's head, humbling his pride while honoring his generosity.",
    explain: (day) => `Bhadrapada Shukla Dvadashi tithi (index 11) falls on ${day.date}.`,
  },
];

/**
 * SAMPLE-ONLY entries: Vaishnava/Gaudiya appearance and disappearance days
 * genuinely require verification against an acharya-board-approved
 * (e.g. ISKCON GBC) calendar, since exact tithi attributions vary by
 * sampradaya and some depend on additional nakshatra/yoga conditions this
 * demo does not model. Entries here are clearly flagged `isSampleData: true`
 * and must not be presented to end users as authoritative until a real
 * tithi/masa has been confirmed against a trusted calendar (see the verified
 * acharya-day entries above in FESTIVAL_RULES for the pattern once
 * confirmed).
 */
export const SAMPLE_VAISHNAVA_RULES: FestivalRule[] = [];

export function allFestivalRules(includeSample: boolean): FestivalRule[] {
  return includeSample ? [...FESTIVAL_RULES, ...SAMPLE_VAISHNAVA_RULES] : FESTIVAL_RULES;
}
