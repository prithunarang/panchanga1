export const TITHI_NAMES = [
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi", "Amavasya",
] as const;

export const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
] as const;

export const YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
  "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva",
  "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
  "Brahma", "Indra", "Vaidhriti",
] as const;

// Movable karanas repeat 8 times across the lunar month; 4 fixed karanas occupy
// the last four half-tithis of the month (indices 57-60, 0-indexed 56-59).
export const MOVABLE_KARANA_NAMES = ["Bava", "Balava", "Kaulava", "Taitila", "Garija", "Vanija", "Vishti"] as const;
export const FIXED_KARANA_NAMES = ["Shakuni", "Chatushpada", "Naga", "Kimstughna"] as const;

export function karanaNameForIndex(halfTithiIndex: number): string {
  // halfTithiIndex: 0..59 (60 karanas in a lunar month)
  if (halfTithiIndex === 0) return "Kimstughna";
  if (halfTithiIndex >= 57) return FIXED_KARANA_NAMES[halfTithiIndex - 57 + 1] ?? "Naga";
  return MOVABLE_KARANA_NAMES[(halfTithiIndex - 1) % 7];
}

export const MASA_NAMES_AMANTA = [
  "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
  "Ashwina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna",
] as const;

export const RASHI_NAMES = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena",
] as const;

export const WEEKDAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
] as const;

export const VARA_NAMES_SANSKRIT = [
  "Ravivara", "Somavara", "Mangalavara", "Budhavara", "Guruvara", "Shukravara", "Shanivara",
] as const;

// Rahu Kalam / Yamaganda / Gulika Kalam are each a fixed 1/8th segment of the
// sunrise-to-sunset daylight span, selected per weekday by these octant tables.
export const RAHU_KALAM_OCTANT = [7, 1, 6, 4, 5, 3, 2]; // index 0 = Sunday
export const YAMAGANDA_OCTANT = [4, 3, 2, 1, 0, 6, 5];
export const GULIKA_KALAM_OCTANT = [6, 5, 4, 3, 2, 1, 0];

export const EKADASHI_NAMES: Record<string, { shukla: string; krishna: string }> = {
  Chaitra: { shukla: "Kamada Ekadashi", krishna: "Papmochani Ekadashi" },
  Vaishakha: { shukla: "Mohini Ekadashi", krishna: "Varuthini Ekadashi" },
  Jyeshtha: { shukla: "Nirjala Ekadashi", krishna: "Apara Ekadashi" },
  Ashadha: { shukla: "Shayani (Devshayani) Ekadashi", krishna: "Yogini Ekadashi" },
  Shravana: { shukla: "Putrada (Shravana) Ekadashi", krishna: "Kamika Ekadashi" },
  Bhadrapada: { shukla: "Parsva (Parivartini) Ekadashi", krishna: "Ajaa (Annada) Ekadashi" },
  Ashwina: { shukla: "Papankusha Ekadashi", krishna: "Indira Ekadashi" },
  Kartika: { shukla: "Prabodhini (Devutthana) Ekadashi", krishna: "Rama Ekadashi" },
  Margashirsha: { shukla: "Mokshada Ekadashi", krishna: "Utpanna Ekadashi" },
  Pausha: { shukla: "Putrada (Pausha) Ekadashi", krishna: "Saphala Ekadashi" },
  Magha: { shukla: "Jaya (Bhaimi) Ekadashi", krishna: "Shattila Ekadashi" },
  Phalguna: { shukla: "Amalaki Ekadashi", krishna: "Vijaya Ekadashi" },
};
