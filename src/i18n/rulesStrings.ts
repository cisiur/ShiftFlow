/**
 * Language-specific strings used by the recommendation rules engine.
 * This file is intentionally free of React imports so rules.ts stays pure.
 */

export interface MealLabelNote { label: string; notes: string; }

export interface RulesStrings {
  caffeineAdvice: {
    stop:        (cutoffTime: string) => string;
    approaching: (cutoffTime: string) => string;
    lastCup:     (cutoffTime: string) => string;
    free:        (cutoffTime: string, maxCups: number) => string;
  };
  napReasons: {
    postNight:    string;
    preNight:     string;
    lowEnergy:    string;
    offDay:       string;
  };
  recoveryTips: {
    night_shift:             string[];
    post_night_transition:   string[];
    morning_shift:           string[];
    afternoon_shift:         string[];
    long_shift:              string[];
    off_day:                 string[];
    high_fatigue:            string[];
    rotating_shifts:         string[];
    extendedNapTip:          string;
  };
  meals: {
    offDay:         MealLabelNote[];
    morningShift:   { preShift: MealLabelNote; midShift: MealLabelNote; postShift: MealLabelNote; evening: MealLabelNote };
    afternoonShift: { breakfast: MealLabelNote; preShift: MealLabelNote; midShift: MealLabelNote; postShift: MealLabelNote };
    nightShift:     { preShiftDinner: MealLabelNote; preShiftSnack: MealLabelNote; earlyShift: MealLabelNote; lateShift: MealLabelNote; postShift: MealLabelNote };
    longDay:        { preShift: MealLabelNote; midShift: MealLabelNote; lateShift: MealLabelNote; postShift: MealLabelNote };
    extendedShift:  { preShift: MealLabelNote; earlyShift: MealLabelNote; midShift: MealLabelNote; lateShift: MealLabelNote; postNap: MealLabelNote };
    customShift:    { preShift: MealLabelNote; midShift: MealLabelNote; postShift: MealLabelNote };
  };
  explanation: {
    restDayBefore:    (shiftLabel: string) => string;
    fullRestDay:      string;
    multipleShifts:   (count: number, shiftLabel: string, durNote: string, sleepNote: string, energyNote: string) => string;
    nightShiftDay:    (sleepNote: string, energyNote: string) => string;
    regularShiftDay:  (shiftLabel: string, timeRange: string, sleepNote: string, energyNote: string) => string;
    sleepAround:      (time: string) => string;
    lowEnergyNote:    string;
    durationNote:     (h: number) => string;
  };
  shiftLabels: Record<string, string>;
}

// ─── English ──────────────────────────────────────────────────────────────────

export const enRules: RulesStrings = {
  caffeineAdvice: {
    stop:        (t) => `Caffeine cutoff was ${t}. Switch to water or herbal tea to protect your sleep window.`,
    approaching: (t) => `Last call for caffeine — cutoff is at ${t}. Have this cup and switch to water.`,
    lastCup:     (t) => `Cutoff at ${t}. You can have one more cup before then.`,
    free:        (t, n) => `Caffeine window is open until ${t}. Stay within ${n} cups today.`,
  },

  napReasons: {
    postNight: 'Recovery nap after your night shift helps clear sleep debt and transition your body clock.',
    preNight:  'A pre-night-shift nap will carry you through the early morning hours.',
    lowEnergy: 'Your recent check-ins suggest low energy. A short power nap can restore alertness without disrupting nighttime sleep.',
    offDay:    'Rest day recovery — a short nap at the right time can deepen overnight sleep quality.',
  },

  recoveryTips: {
    night_shift: [
      'Wear sunglasses on your commute home to reduce morning light exposure and protect your sleep drive.',
      'Keep your bedroom cool (17–19°C / 63–66°F) and as dark as possible for daytime sleep.',
      'Let household members know your sleep window so they can minimize noise.',
      'A short walk or gentle stretch after your shift helps lower cortisol before sleep.',
      'Blue-light blocking glasses worn 2 hours before sleep can improve daytime sleep quality by up to 30 min.',
    ],
    post_night_transition: [
      'Short post-night nap first, then try to stay awake until a more normal evening bedtime to realign.',
      'Natural light exposure mid-afternoon (not morning) helps shift your body clock forward after nights.',
      'Your digestion is also adjusting — smaller, lighter meals for the next 48 hours.',
    ],
    morning_shift: [
      'Prepare your shift kit and meals the night before to reduce morning decision fatigue.',
      'A short (5–10 min) walk in morning light helps solidify your body clock and boosts alertness.',
      'If you feel a post-lunch dip, a 10-minute walk is more effective than a coffee.',
    ],
    afternoon_shift: [
      'Avoid bright screens for 30 minutes after your shift ends — your brain needs a decompression window.',
      'A warm shower post-shift signals your body that work is done and initiates the sleep process.',
      'Journaling 2–3 things from your shift can reduce mental chatter and improve sleep onset.',
    ],
    long_shift: [
      'Prioritize sleep duration tonight — a long shift creates higher sleep debt.',
      'Light stretching (10 min) post-shift reduces physical tension and improves sleep quality.',
      'Hydration during a long shift is critical — even mild dehydration worsens fatigue by 20%.',
    ],
    off_day: [
      'Use this rest day to anchor your sleep schedule — avoid sleeping more than 1 extra hour.',
      'A 20–30 min outdoor walk resets your circadian rhythm and improves sleep that night.',
      'Short rest days are best spent doing light movement, not total rest — your body recovers better.',
    ],
    high_fatigue: [
      'High fatigue detected. Today, protect sleep above everything else.',
      "Reduce decision load: prepare tomorrow's meals, clothes, and bag tonight.",
      "Even 15 minutes of quiet reading before bed improves sleep quality when you're highly fatigued.",
    ],
    rotating_shifts: [
      '"Anchor sleep" — keeping the same sleep start time on days off when possible — benefits rotating shift workers most.',
      'Melatonin (0.5–1 mg) 30 min before your new target sleep time can help during shift rotations. Consult your doctor.',
      'Strategic light exposure is the most powerful tool to adapt to rotating shifts — seek it or avoid it based on your current shift direction.',
    ],
    extendedNapTip: 'Use your planned rest windows deliberately — even a 20-min nap between 03:00–05:00 reduces performance impairment by 50%.',
  },

  meals: {
    offDay: [
      { label: 'Breakfast',            notes: 'Protein + slow carbs set a steady energy baseline.' },
      { label: 'Mid-morning snack',    notes: 'Optional — fruit or nuts.' },
      { label: 'Lunch',               notes: 'Largest meal of the day.' },
      { label: 'Afternoon snack',      notes: 'Small and light to avoid an energy crash.' },
      { label: 'Dinner',              notes: 'Finish at least 2–3 hours before bed.' },
    ],
    morningShift: {
      preShift:  { label: 'Pre-shift breakfast', notes: 'Light but protein-rich — eggs, Greek yogurt, or oats. Avoid heavy fats.' },
      midShift:  { label: 'Mid-shift meal',      notes: 'Balanced lunch — avoid high-sugar options that cause afternoon energy dip.' },
      postShift: { label: 'Post-shift meal',     notes: 'Recovery meal — include vegetables and protein.' },
      evening:   { label: 'Evening meal',        notes: 'Keep it light. Finish 2–3 hours before planned bedtime.' },
    },
    afternoonShift: {
      breakfast: { label: 'Breakfast',         notes: 'Standard morning meal — sets energy for the day.' },
      preShift:  { label: 'Pre-shift lunch',   notes: 'Moderate meal 1–2 hours before your shift starts.' },
      midShift:  { label: 'Mid-shift snack',   notes: 'Smaller meal or snack — nuts, fruit, or a wrap.' },
      postShift: { label: 'Post-shift supper', notes: 'Keep this light — your body needs to wind down for sleep.' },
    },
    nightShift: {
      preShiftDinner: { label: 'Pre-shift dinner',    notes: 'Your most important meal — protein + complex carbs. Avoid heavy fat that slows digestion.' },
      preShiftSnack:  { label: 'Pre-shift snack',     notes: '1–1.5h before shift: light snack to top up energy.' },
      earlyShift:     { label: 'Early shift meal',    notes: 'Warm, protein-focused meal. Avoid heavy carbs that induce sleepiness.' },
      lateShift:      { label: 'Late shift snack',    notes: 'Very light — fruit or a small snack. Eating too much at 3–4 AM disrupts digestion.' },
      postShift:      { label: 'Post-shift breakfast',notes: "Light protein after shift before sleep. Not too heavy — you'll be sleeping soon." },
    },
    longDay: {
      preShift:  { label: 'Pre-shift breakfast', notes: 'Fuel up — this is a long day. Oats, eggs, or protein smoothie.' },
      midShift:  { label: 'Mid-shift lunch',     notes: 'Balanced, moderate-sized meal. Avoid very heavy food mid-shift.' },
      lateShift: { label: 'Late shift snack',    notes: 'Small snack to sustain energy through the final stretch.' },
      postShift: { label: 'Post-shift dinner',   notes: "Recovery meal — but keep it lighter. You'll be eating close to bedtime." },
    },
    extendedShift: {
      preShift:  { label: 'Pre-shift meal',    notes: 'Balanced protein + complex carbs before your extended shift begins. Avoid heavy fats.' },
      earlyShift:{ label: 'Early-shift meal',  notes: 'First proper meal during the shift — warm, protein-focused.' },
      midShift:  { label: 'Mid-shift meal',    notes: 'Midpoint meal — prioritise protein and vegetables. Avoid large carb-heavy portions.' },
      lateShift: { label: 'Late-shift snack',  notes: 'Small, easy-to-digest snack to sustain energy through the final stretch.' },
      postNap:   { label: 'Post-nap snack',    notes: 'Light, protein snack to ease back into alertness after your rest window.' },
    },
    customShift: {
      preShift:  { label: 'Pre-shift meal',  notes: 'Light, balanced meal 1 hour before your shift starts.' },
      midShift:  { label: 'Mid-shift meal',  notes: 'Moderate meal during your shift break.' },
      postShift: { label: 'Post-shift meal', notes: 'Recovery meal after your shift ends.' },
    },
  },

  explanation: {
    restDayBefore:   (l) => `Rest day before your ${l} shift. Use today to anchor your sleep schedule and build recovery.`,
    fullRestDay:     'Full rest day. Focus on consistent sleep timing and light movement to maintain your body clock.',
    multipleShifts:  (n, l, dur, sleep, energy) => `${n} shifts today — ${l} is the most demanding${dur}. Recovery plan accounts for the combined workload.${sleep}${energy}`,
    nightShiftDay:   (sleep, energy) => `Night shift day. Plan for recovery sleep after your shift ends.${sleep}${energy}`,
    regularShiftDay: (l, range, sleep, energy) => `${l} shift day. Today's plan is built around your${range} schedule.${sleep}${energy}`,
    sleepAround:     (t) => ` Aim to sleep around ${t}.`,
    lowEnergyNote:   " Your recent check-ins show you're running low — prioritize rest today.",
    durationNote:    (h) => ` (${h}h total on-duty)`,
  },

  shiftLabels: {
    morning:    'morning',
    afternoon:  'afternoon',
    night:      'night',
    long_day:   'long day',
    long_night: 'long night',
    extended:   'extended',
    off:        'day off',
    custom:     'custom',
  },
};

// ─── Polish ───────────────────────────────────────────────────────────────────

export const plRules: RulesStrings = {
  caffeineAdvice: {
    stop:        (t) => `Limit kofeiny minął (${t}). Przejdź na wodę lub herbatę ziołową, aby chronić okno snu.`,
    approaching: (t) => `Ostatnia kawa — limit o ${t}. Wypij tę filiżankę i przejdź na wodę.`,
    lastCup:     (t) => `Limit o ${t}. Możesz jeszcze wypić jedną filiżankę.`,
    free:        (t, n) => `Okno kofeiny otwarte do ${t}. Nie przekraczaj ${n} filiżanek dziś.`,
  },

  napReasons: {
    postNight: 'Drzemka regeneracyjna po nocnej zmianie pomaga odrobić dług senny i przestawić zegar biologiczny.',
    preNight:  'Drzemka przed nocną zmianą pozwoli Ci przetrwać wczesne godziny poranne.',
    lowEnergy: 'Twoje ostatnie meldunki wskazują na niski poziom energii. Krótka drzemka regeneracyjna może przywrócić czujność bez zakłócania nocnego snu.',
    offDay:    'Regeneracja w dzień wolny — krótka drzemka o właściwej porze może pogłębić jakość nocnego snu.',
  },

  recoveryTips: {
    night_shift: [
      'Noś okulary przeciwsłoneczne w drodze do domu, aby ograniczyć ekspozycję na poranne światło i chronić popęd senny.',
      'Utrzymuj sypialnię chłodną (17–19°C) i jak najciemniejszą dla snu w ciągu dnia.',
      'Poinformuj domowników o swoim oknie snu, aby mogli zminimalizować hałas.',
      'Krótki spacer lub delikatne rozciąganie po zmianie pomaga obniżyć kortyzol przed snem.',
      'Okulary blokujące niebieskie światło, noszone 2 godziny przed snem, mogą poprawić jakość snu dziennego o nawet 30 minut.',
    ],
    post_night_transition: [
      'Najpierw krótka drzemka po nocy, potem staraj się nie spać do normalnej pory wieczornej, aby przestawić rytm dobowy.',
      'Ekspozycja na naturalne światło w środku dnia (nie rano) pomaga przestawić zegar biologiczny po nocnych zmianach.',
      'Twoje trawienie się też przestawia — przez następne 48 godzin jedz mniejsze i lżejsze posiłki.',
    ],
    morning_shift: [
      'Przygotuj torbę i posiłki dzień wcześniej, aby ograniczyć poranne decyzje i zmęczenie.',
      'Krótki spacer (5–10 min) w porannym świetle pomaga utrwalić rytm dobowy i zwiększa czujność.',
      'Jeśli czujesz popołudniowy spadek energii, 10-minutowy spacer jest skuteczniejszy niż kawa.',
    ],
    afternoon_shift: [
      'Unikaj jasnych ekranów przez 30 minut po zakończeniu zmiany — Twój mózg potrzebuje czasu na dekompresję.',
      'Ciepły prysznic po zmianie sygnalizuje ciału, że praca się skończyła i inicjuje proces zasypiania.',
      'Zapisanie 2–3 rzeczy ze zmiany może ograniczyć natłok myśli i poprawić zasypianie.',
    ],
    long_shift: [
      'Dziś w nocy priorytetem jest długość snu — długa zmiana tworzy większy dług senny.',
      'Delikatne rozciąganie (10 min) po zmianie zmniejsza napięcie fizyczne i poprawia jakość snu.',
      'Nawodnienie podczas długiej zmiany jest kluczowe — nawet łagodne odwodnienie pogarsza zmęczenie o 20%.',
    ],
    off_day: [
      'Wykorzystaj ten wolny dzień, aby zakotwić harmonogram snu — unikaj spania więcej niż 1 godzinę dłużej.',
      'Spacer na zewnątrz przez 20–30 minut resetuje rytm dobowy i poprawia nocny sen.',
      'Wolne dni najlepiej spędzić na lekkim ruchu, nie na totalnym odpoczynku — ciało regeneruje się lepiej.',
    ],
    high_fatigue: [
      'Wykryto wysokie zmęczenie. Dziś chroń sen ponad wszystko.',
      'Ogranicz liczbę decyzji: przygotuj jutrzejsze posiłki, ubrania i torbę dziś wieczorem.',
      'Nawet 15 minut cichego czytania przed snem poprawia jakość snu przy wysokim zmęczeniu.',
    ],
    rotating_shifts: [
      '"Kotwica snu" — utrzymanie tej samej pory zasypiania w wolne dni — najbardziej pomaga pracownikom rotacyjnym.',
      'Melatonina (0,5–1 mg) 30 min przed nową docelową porą snu może pomóc przy rotacji zmian. Skonsultuj się z lekarzem.',
      'Strategiczna ekspozycja na światło to najpotężniejsze narzędzie adaptacji do zmian rotacyjnych — szukaj jej lub unikaj zależnie od kierunku rotacji.',
    ],
    extendedNapTip: 'Korzystaj z zaplanowanych okien odpoczynku świadomie — nawet 20-minutowa drzemka między 03:00–05:00 zmniejsza zaburzenia wydajności o 50%.',
  },

  meals: {
    offDay: [
      { label: 'Śniadanie',               notes: 'Białko + wolne węglowodany stabilizują poziom energii.' },
      { label: 'Przekąska przedpołudniowa', notes: 'Opcjonalnie — owoce lub orzechy.' },
      { label: 'Obiad',                   notes: 'Największy posiłek dnia.' },
      { label: 'Przekąska popołudniowa',   notes: 'Mała i lekka, żeby uniknąć spadku energii.' },
      { label: 'Kolacja',                 notes: 'Zjedz co najmniej 2–3 godziny przed snem.' },
    ],
    morningShift: {
      preShift:  { label: 'Śniadanie przed zmianą', notes: 'Lekkie, ale bogate w białko — jajka, jogurt grecki lub płatki owsiane. Unikaj ciężkich tłuszczów.' },
      midShift:  { label: 'Posiłek w trakcie zmiany', notes: 'Zrównoważony obiad — unikaj wysokocukrowych opcji powodujących popołudniowy spadek energii.' },
      postShift: { label: 'Posiłek po zmianie',    notes: 'Posiłek regeneracyjny — zawieraj warzywa i białko.' },
      evening:   { label: 'Kolacja',              notes: 'Lekka. Zjedz 2–3 godziny przed planowanym snem.' },
    },
    afternoonShift: {
      breakfast: { label: 'Śniadanie',            notes: 'Standardowy poranny posiłek — nastawia energię na cały dzień.' },
      preShift:  { label: 'Obiad przed zmianą',   notes: 'Umiarkowany posiłek 1–2 godziny przed rozpoczęciem zmiany.' },
      midShift:  { label: 'Przekąska na zmianie', notes: 'Mniejszy posiłek lub przekąska — orzechy, owoce lub wrap.' },
      postShift: { label: 'Kolacja po zmianie',   notes: 'Lekka — Twoje ciało musi się wyciszyć przed snem.' },
    },
    nightShift: {
      preShiftDinner: { label: 'Kolacja przed zmianą',   notes: 'Twój najważniejszy posiłek — białko + złożone węglowodany. Unikaj ciężkich tłuszczów spowalniających trawienie.' },
      preShiftSnack:  { label: 'Przekąska przed zmianą', notes: '1–1,5h przed zmianą: lekka przekąska uzupełniająca energię.' },
      earlyShift:     { label: 'Wczesny posiłek na zmianie', notes: 'Ciepły posiłek bogaty w białko. Unikaj ciężkich węglowodanów powodujących senność.' },
      lateShift:      { label: 'Późna przekąska na zmianie', notes: 'Bardzo lekka — owoce lub mała przekąska. Jedzenie zbyt dużo o 3–4 w nocy zaburza trawienie.' },
      postShift:      { label: 'Śniadanie po zmianie',  notes: 'Lekkie białko po zmianie przed snem. Niezbyt ciężkie — wkrótce będziesz spać.' },
    },
    longDay: {
      preShift:  { label: 'Śniadanie przed zmianą',     notes: 'Zatankuj — to długi dzień. Płatki owsiane, jajka lub koktajl proteinowy.' },
      midShift:  { label: 'Obiad w trakcie zmiany',     notes: 'Zrównoważony, umiarkowany posiłek. Unikaj bardzo ciężkiego jedzenia w środku zmiany.' },
      lateShift: { label: 'Późna przekąska na zmianie', notes: 'Mała przekąska podtrzymująca energię przez ostatni etap.' },
      postShift: { label: 'Kolacja po zmianie',         notes: 'Posiłek regeneracyjny — ale lżejszy. Będziesz jeść blisko pory snu.' },
    },
    extendedShift: {
      preShift:   { label: 'Posiłek przed zmianą',         notes: 'Białko + złożone węglowodany przed długą zmianą. Unikaj ciężkich tłuszczów.' },
      earlyShift: { label: 'Wczesny posiłek na zmianie',   notes: 'Pierwszy właściwy posiłek podczas zmiany — ciepły, bogaty w białko.' },
      midShift:   { label: 'Środkowy posiłek na zmianie',  notes: 'Posiłek w połowie zmiany — priorytet białku i warzywom. Unikaj dużych porcji bogatych w węglowodany.' },
      lateShift:  { label: 'Późna przekąska na zmianie',   notes: 'Mała, łatwostrawna przekąska podtrzymująca energię przez ostatni etap.' },
      postNap:    { label: 'Przekąska po drzemce',         notes: 'Lekka przekąska proteinowa ułatwiająca powrót do czujności po oknie odpoczynku.' },
    },
    customShift: {
      preShift:  { label: 'Posiłek przed zmianą',   notes: 'Lekki, zrównoważony posiłek 1 godzinę przed rozpoczęciem zmiany.' },
      midShift:  { label: 'Posiłek w trakcie zmiany', notes: 'Umiarkowany posiłek podczas przerwy.' },
      postShift: { label: 'Posiłek po zmianie',     notes: 'Posiłek regeneracyjny po zakończeniu zmiany.' },
    },
  },

  explanation: {
    restDayBefore:   (l) => `Dzień wolny przed zmianą ${l}. Wykorzystaj dziś do zakotwienia harmonogramu snu i regeneracji.`,
    fullRestDay:     'Pełny dzień odpoczynku. Skup się na regularnych porach snu i lekkim ruchu, aby utrzymać rytm dobowy.',
    multipleShifts:  (n, l, dur, sleep, energy) => `${n} zmiany dziś — ${l} jest najbardziej wymagającą${dur}. Plan regeneracji uwzględnia łączne obciążenie.${sleep}${energy}`,
    nightShiftDay:   (sleep, energy) => `Dzień nocnej zmiany. Zaplanuj sen regeneracyjny po zakończeniu zmiany.${sleep}${energy}`,
    regularShiftDay: (l, range, sleep, energy) => `Dzień zmiany ${l}. Plan jest zbudowany wokół Twojego harmonogramu${range}.${sleep}${energy}`,
    sleepAround:     (t) => ` Staraj się zasypiać około ${t}.`,
    lowEnergyNote:   ' Twoje ostatnie meldunki wskazują na niedobór energii — dziś priorytetem jest odpoczynek.',
    durationNote:    (h) => ` (${h}h łącznie na służbie)`,
  },

  shiftLabels: {
    morning:    'porannej',
    afternoon:  'popołudniowej',
    night:      'nocnej',
    long_day:   'długiego dnia',
    long_night: 'długiej nocy',
    extended:   'rozszerzonej',
    off:        'wolnego',
    custom:     'własnej',
  },
};
