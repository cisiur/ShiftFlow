import type { Translations } from './en';

export const pl: Translations = {
  // ── Common ────────────────────────────────────────────────────────────────────
  common: {
    continue: 'Kontynuuj',
    cancel: 'Anuluj',
    save: 'Zapisz',
    done: 'Gotowe',
    skip: 'Pomiń na razie',
    reset: 'Resetuj',
    yes: 'Tak',
    no: 'Nie',
    notSet: 'Nie ustawiono',
    none: 'Brak',
  },

  // ── Language selection ────────────────────────────────────────────────────────
  language: {
    title: 'Wybierz język',
    subtitle: 'Możesz to zmienić później w ustawieniach',
    en: 'English',
    pl: 'Polski',
  },

  // ── Welcome / onboarding index ────────────────────────────────────────────────
  welcome: {
    title: 'ShiftFlow',
    tagline: 'Planowanie regeneracji i energii\ndla pracowników zmianowych',
    getStarted: 'Rozpocznij',
    noSignUp: 'Bez rejestracji. Twoje dane zostają na urządzeniu.',
    features: {
      sleep: 'Spersonalizowane okna snu dopasowane do każdej zmiany',
      caffeine: 'Limity kofeiny chroniące jakość Twojego snu',
      energy: 'Wyniki energii i codzienna pomoc w regeneracji',
      recovery: 'Plany regeneracji i przejścia po nocnych zmianach',
    },
  },

  // ── Onboarding: Role ──────────────────────────────────────────────────────────
  role: {
    title: 'Jaka jest Twoja rola?',
    subtitle: 'Pomaga nam to dostosować plan energii i regeneracji.',
  },

  // ── Onboarding: Shift pattern ─────────────────────────────────────────────────
  shiftPattern: {
    title: 'Jak wygląda Twój harmonogram?',
    subtitle: 'Użyjemy tego do budowania lepszych planów przejść.',
  },

  // ── Onboarding: Sleep profile ─────────────────────────────────────────────────
  sleepProfile: {
    title: 'Jak śpisz?',
    subtitle: 'Bądź szczery — odpowiednio zabezpieczymy Twoje okna snu.',
    targetSleepTitle: 'Docelowy czas snu na dobę',
    targetSleepHint: 'Większość dorosłych potrzebuje 7–9 godzin. Pracownicy zmianowi często potrzebują nieco więcej.',
    prepTimeTitle: 'Dojazd i czas przygotowania',
    prepTimeSubtitle: 'Ile czasu przed zmianą musisz wstać i być gotowy? Sugestie snu i drzemek będą uwzględniać to okno.',
    sleepOptions: {
      easy: { label: 'Łatwe zasypianie', description: 'Zazwyczaj zasypiam szybko i śpię przez całą noc' },
      moderate: { label: 'Umiarkowane', description: 'Sen jest generalnie dobry, ale zmiany go rozregulowują' },
      hard: { label: 'Trudne zasypianie', description: 'Mam trudności z zasypianiem lub budzę się w nocy' },
    },
  },

  // ── Onboarding: Caffeine ──────────────────────────────────────────────────────
  caffeine: {
    title: 'Wrażliwość na kofeinę',
    subtitle: 'Użyjemy tego do ustawienia codziennego limitu kofeiny.',
    cutoffNote: 'Twój limit kofeiny zostanie ustawiony na',
    cutoffSuffix: 'aby chronić okno snu.',
    options: {
      low: {
        label: 'Niska wrażliwość',
        description: 'Mogę pić kawę wieczorem i nadal dobrze spać',
        cutoff: '4 godziny przed snem',
      },
      medium: {
        label: 'Średnia wrażliwość',
        description: 'Popołudniowa kawa może wpływać na mój sen',
        cutoff: '6 godzin przed snem',
      },
      high: {
        label: 'Wysoka wrażliwość',
        description: 'Nawet poranna kawa może zakłócić mój nocny sen',
        cutoff: '8 godzin przed snem',
      },
    },
  },

  // ── Onboarding: Notifications ─────────────────────────────────────────────────
  notifications: {
    title: 'Powiadomienia',
    subtitle: 'ShiftFlow wysyła trafne przypomnienia, nie spam. Możesz to zmienić później.',
    enableLabel: 'Włącz powiadomienia',
    skipButton: 'Pomiń na razie',
    toggles: {
      sleepReminder: { label: 'Okno snu', desc: '30 min przed docelową porą snu' },
      caffeineReminder: { label: 'Limit kofeiny', desc: '15 min przed limitem' },
      napReminder: { label: 'Okno drzemki', desc: 'Gdy drzemka jest w planie dnia' },
      shiftReminder: { label: 'Przypomnienie o zmianie', desc: '1 godzinę przed rozpoczęciem zmiany' },
      checkInReminder: { label: 'Codzienny check-in', desc: 'Przypomnienie o godzinie 20:00 każdego dnia' },
    },
  },

  // ── Onboarding: Goals ─────────────────────────────────────────────────────────
  goals: {
    title: 'Co chcesz poprawić?',
    subtitle: 'Wybierz jeden lub więcej. Dopasujemy plan do Twoich celów.',
    buildPlan: 'Zbuduj mój plan',
    startWithDefaults: 'Zacznij z domyślnymi',
    caption: 'Wszystko gotowe. Twój pierwszy plan zostanie wygenerowany automatycznie.',
  },

  // ── Settings ──────────────────────────────────────────────────────────────────
  settings: {
    title: 'Ustawienia',
    sections: {
      profile: 'Profil',
      shiftDefaults: 'Domyślne godziny zmian',
      notifications: 'Powiadomienia',
      language: 'Język',
      timeFormat: 'Format czasu',
      data: 'Dane i prywatność',
      about: 'O aplikacji',
      developer: 'Deweloper',
    },
    fields: {
      role: 'Rola',
      shiftPattern: 'Wzorzec zmian',
      sleepGoal: 'Cel snu',
      caffeineSensitivity: 'Wrażliwość na kofeinę',
      sleepDifficulty: 'Trudności ze snem',
      prepTime: 'Dojazd i czas przygotowania',
      goals: 'Cele',
      enableNotifications: 'Włącz powiadomienia',
      dataStorage: 'Przechowywanie danych',
      dataStorageDesc: 'Wszystkie dane są przechowywane lokalnie na Twoim urządzeniu.',
      version: 'Wersja',
      premiumStatus: 'Status premium',
    },
    shiftDefaultsDesc: 'Dostosuj domyślne godziny używane przy przypisywaniu typów zmian do dni.',
    premium: {
      upgrade: 'Przejdź na Premium',
      upgradeDesc: 'Wyjaśnienia AI, adaptacyjne plany i więcej',
      active: 'Premium aktywne',
    },
    modal: {
      cancel: 'Anuluj',
      save: 'Zapisz',
      yourRole: 'Twoja rola',
      shiftPattern: 'Wzorzec zmian',
      sleepGoal: 'Cel snu',
      caffeineSensitivity: 'Wrażliwość na kofeinę',
      sleepDifficulty: 'Trudności ze snem',
      prepTime: 'Dojazd i czas przygotowania',
      prepTimeDesc: 'Ile czasu przed zmianą musisz wstać i być gotowy? Sugestie snu i drzemek zakończą się co najmniej tyle wcześniej przed Twoją zmianą.',
      goals: 'Twoje cele',
      startTime: 'Czas rozpoczęcia',
      endTime: 'Czas zakończenia',
      defaultHours: 'Domyślne godziny:',
      resetToDefault: 'Przywróć domyślne',
      shiftDefaults: 'domyślne',
    },
    reset: {
      buttonLabel: 'Resetuj wszystkie dane',
      title: 'Resetuj wszystkie dane',
      message: 'Spowoduje to trwałe usunięcie profilu, harmonogramu i historii check-inów. Nie można tego cofnąć.',
      cancel: 'Anuluj',
      confirm: 'Resetuj',
    },
    language: {
      en: 'English',
      pl: 'Polski',
    },
    timeFormat: {
      label: 'Format czasu',
      h12: '12-godzinny (AM/PM)',
      h24: '24-godzinny',
    },
    sleepHours: {
      shortSleeper: 'Krótki sen',
      recommended: 'Zalecany zakres',
      longSleeper: 'Długi sen',
      hoursLabel: (h: number) => `${h} ${h === 1 ? 'godzina' : (h % 1 !== 0 || (h >= 2 && h <= 4)) ? 'godziny' : 'godzin'}`,
    },
  },

  // ── Tabs ──────────────────────────────────────────────────────────────────────
  tabs: {
    today:    'Dziś',
    schedule: 'Harmonogram',
    calendar: 'Kalendarz',
    weekly:   'Tygodniowo',
    settings: 'Ustawienia',
  },

  // ── Calendar screen ───────────────────────────────────────────────────────────
  calendar: {
    title:     'Kalendarz',
    today:     'Dziś',
    noShifts:  'Brak zmian w tym tygodniu',
    noShiftsDesc: 'Dodaj swoje zmiany w zakładce Harmonogram, aby zobaczyć je tutaj.',
  },

  // ── Today screen ──────────────────────────────────────────────────────────────
  today: {
    yourDay: 'Twój dzień',
    hiName: (name: string) => `Cześć, ${name}`,
    checkIn: 'Zamelduj się',
    whyRecommendations: 'Dlaczego te rekomendacje?',
    noPlan: {
      title: 'Brak planu',
      description: 'Dodaj swoje zmiany, aby wygenerować plan regeneracji i energii na dziś.',
      action: 'Dodaj zmianę',
    },
    error: {
      title: 'Coś poszło nie tak',
      action: 'Spróbuj ponownie',
    },
  },

  // ── Schedule screen ───────────────────────────────────────────────────────────
  schedule: {
    prevWeek: '‹',
    nextWeek: '›',
    off: 'Wolne',
    dayOff: 'Wolny dzień',
    multiShift: 'zmian',
    modal: {
      todaysShifts: 'ZMIANY NA TEN DZIEŃ',
      addAnotherShift: 'DODAJ KOLEJNĄ ZMIANĘ',
      selectType: 'WYBIERZ TYP ZMIANY',
      addButton: 'Dodaj zmianę',
      setDayOff: 'Ustaw jako wolny dzień',
      done: 'Gotowe',
    },
  },

  // ── Work role options ─────────────────────────────────────────────────────────
  roles: {
    nurse:          { label: 'Pielęgniarka / Położna' },
    doctor:         { label: 'Lekarz / Klinicysta' },
    paramedic:      { label: 'Ratownik medyczny' },
    factory_worker: { label: 'Pracownik fabryki / Produkcji' },
    retail:         { label: 'Sprzedawca / Sklep' },
    security:       { label: 'Ochroniarz' },
    driver:         { label: 'Kierowca / Transport' },
    hospitality:    { label: 'Hotelarstwo / Gastronomia' },
    warehouse:      { label: 'Magazyn / Logistyka' },
    other:          { label: 'Inne' },
  },

  // ── Shift pattern options ─────────────────────────────────────────────────────
  patterns: {
    rotating:         { label: 'Zmiany rotacyjne',     description: 'Cykl między poranną, popołudniową i nocną' },
    fixed_nights:     { label: 'Stałe noce',           description: 'Permanentne zmiany nocne' },
    fixed_days:       { label: 'Stałe dni',            description: 'Permanentne zmiany poranne / dzienne' },
    fixed_afternoons: { label: 'Stałe popołudnia',     description: 'Permanentne zmiany popołudniowe / wieczorne' },
    irregular:        { label: 'Nieregularne',         description: 'Brak przewidywalnego wzorca' },
    split:            { label: 'Zmiany podzielone',    description: 'Dwa lub więcej okresy dziennie' },
  },

  // ── Goal options ──────────────────────────────────────────────────────────────
  goalOptions: {
    better_sleep:    { label: 'Lepszy sen',            description: 'Popraw czas i jakość snu' },
    less_fatigue:    { label: 'Mniej zmęczenia',       description: 'Czuj się bardziej czujny podczas zmiany' },
    shift_recovery:  { label: 'Szybsza regeneracja',  description: 'Wróć do formy po trudnych zmianach' },
    stable_routine:  { label: 'Zbuduj rutynę',        description: 'Stwórz strukturę wokół zmiennego harmonogramu' },
  },

  // ── Shift type labels ─────────────────────────────────────────────────────────
  shiftTypes: {
    morning:    { label: 'Poranna',      description: '~06:00 – 14:00' },
    afternoon:  { label: 'Popołudniowa', description: '~14:00 – 22:00' },
    night:      { label: 'Nocna',        description: '~22:00 – 06:00' },
    long_day:   { label: 'Długi dzień',  description: '~07:00 – 19:00' },
    long_night: { label: 'Długa noc',    description: '~19:00 – 07:00' },
    extended:   { label: 'Rozszerzona',  description: '24 h+ ciągła' },
    off:        { label: 'Wolny dzień',  description: 'Odpoczynek i regeneracja' },
    custom:     { label: 'Własna',       description: 'Ustaw własne godziny' },
  },

  // ── Weekly screen ─────────────────────────────────────────────────────────────
  weekly: {
    title: 'Plan tygodniowy',
    noPlan: {
      title: 'Brak planu tygodniowego',
      description: 'Dodaj swoje zmiany na tydzień, a spersonalizowany plan pojawi się tutaj.',
      action: 'Dodaj zmiany',
    },
    summary: {
      glance: 'Ten tydzień w skrócie',
      nightShifts: 'nocnych zmian',
      restDays: 'dni wolnych',
      avgEnergy: 'śr. energia',
    },
    regenerateNote: 'Plany regenerują się po aktualizacji harmonogramu lub odprawie.',
  },

  // ── Prep time options ─────────────────────────────────────────────────────────
  prepTimeOptions: [
    { value: 0,  label: 'Brak dojazdu', desc: 'Praca zdalna lub na miejscu' },
    { value: 15, label: '15 min',       desc: 'Krótka jazda lub spacer' },
    { value: 30, label: '30 min',       desc: 'Przeciętny dojazd' },
    { value: 45, label: '45 min',       desc: 'Dłuższy dojazd' },
    { value: 60, label: '1 godzina',    desc: 'Daleki dojazd' },
    { value: 90, label: '1,5 godziny',  desc: 'Bardzo długi dojazd' },
  ],

  // ── Caffeine sensitivity options ──────────────────────────────────────────────
  caffeineOptions: [
    { value: 'low',    label: 'Niska',    description: 'Kofeina prawie nie wpływa na mnie' },
    { value: 'medium', label: 'Średnia',  description: 'Normalna wrażliwość na kofeinę' },
    { value: 'high',   label: 'Wysoka',   description: 'Bardzo wrażliwy — łatwo wpływa na sen' },
  ],

  // ── Sleep difficulty options ──────────────────────────────────────────────────
  sleepDiffOptions: [
    { value: 'easy',     label: 'Łatwe',        description: 'Zasypiam szybko o każdej porze' },
    { value: 'moderate', label: 'Umiarkowane',  description: 'Pewne trudności przy zmianach harmonogramu' },
    { value: 'hard',     label: 'Trudne',       description: 'Mam trudności ze snem po nocnych zmianach' },
  ],

  // ── Day labels (used in relative date display) ────────────────────────────────
  days: {
    today:     'Dziś',
    tomorrow:  'Jutro',
    yesterday: 'Wczoraj',
  },

  // ── Plan explanation screen ───────────────────────────────────────────────────
  planExplanation: {
    title:           'Dlaczego ten plan?',
    close:           'Zamknij',
    noPlan:          'Brak planu do wyjaśnienia.',
    summary:         'Podsumowanie',
    sleepWindow:     'Okno snu',
    sleepDesc:       'Okno obliczane jest na podstawie końca zmiany, czasu dojazdu i okresu wyciszenia.',
    sleepLow:        ' Uwaga: poniżej optymalnego — jeśli możliwe, rozważ zmianę harmonogramu.',
    caffeineTitle:   'Limit kofeiny',
    caffeineDesc:    (sensitivity: string, hours: string) =>
      `Na podstawie Twojej ${sensitivity} wrażliwości na kofeinę ustawiliśmy limit ${hours} godzin przed docelową porą snu. Pozwala to na spadek poziomu kofeiny poniżej 25% przed snem.`,
    napTitle:        'Sugestia drzemki',
    energyTitle:     (score: number) => `Wynik energii: ${score}/100`,
    energyDesc:      'Obliczony na podstawie Twoich ostatnich 7 dni check-inów. Zmęczenie i stres obniżają wynik; jakość snu i czujność go podnoszą.',
    energyLow:       ' Twój wynik jest niski — dzisiejszy plan stawia na odpoczynek i minimalne obciążenie.',
    premiumTitle:    'Premium',
    premiumDesc:     'Przejdź na Premium, aby otrzymać spersonalizowane wyjaśnienia AI dostosowane do Twojego harmonogramu, wzorców zmęczenia i celów.',
    premiumCta:      'Zobacz Premium',
    disclaimer:      'Rekomendacje mają charakter informacyjny i nie stanowią porady medycznej.',
  },

  // ── Check-in screen ──────────────────────────────────────────────────────────
  checkIn: {
    title:        'Codzienny check-in',
    subtitle:     '30 sekund na zalogowanie energii. Odpowiednio zaktualizujemy Twój plan.',
    privacy:      'Twoje dane zostają na urządzeniu i nigdy nie są udostępniane.',
    save:         'Zapisz check-in',
    cancel:       'Anuluj',
    saved:        'Check-in zapisany',
    savedDesc:    'Twój plan energii został zaktualizowany na podstawie Twojego samopoczucia.',
    backToToday:  'Wróć do dziś',
    fatigue:      { label: 'Jak zmęczony jesteś?',            low: 'Brak zmęczenia', high: 'Wyczerpany' },
    sleepQuality: { label: 'Jakość snu ostatniej nocy',        low: 'Słaba',          high: 'Świetna' },
    stress:       { label: 'Poziom stresu',                    low: 'Zrelaksowany',   high: 'Bardzo zestresowany' },
    alertness:    { label: 'Obecna czujność',                  low: 'Ospały',         high: 'Skupiony' },
  },

  // ── Feature component labels ───────────────────────────────────────────────
  features: {
    shiftCard: {
      todaysShift:  'Twoja zmiana',
      noShift:      'Brak zmiany',
      addShiftHint: 'Dotknij +, aby dodać zmianę',
    },
    sleepWindow: {
      title:           'Okno snu',
      notCalculated:   'Jeszcze nie obliczono',
      addShiftsHint:   'Dodaj swoje zmiany, aby uzyskać rekomendację snu.',
      recommended:     'Następny zalecany sen',
      bedtime:         'ZASYPIANIE',
      wake:            'POBUDKA',
      crossesMidnight: 'Okno snu przekracza północ',
      tonight:         'Dziś w nocy',
      tomorrow:        'Jutro',
    },
    caffeine: {
      title:  'Kofeina',
      cutoff: 'limit',
      maxToday: (n: number) => `Maks. dziś: ${n} ${n === 1 ? 'filiżanka' : (n >= 2 && n <= 4) ? 'filiżanki' : 'filiżanek'}`,
      phases: {
        free:               'Okno kofeiny otwarte',
        last_cup:           'Ostatnia filiżanka',
        cutoff_approaching: 'Zbliża się limit',
        stop:               'Limit kofeiny',
      },
    },
    nap: {
      title: 'Sugestia drzemki',
    },
    energy: {
      readiness: 'Gotowość',
      levels: {
        high:   'Gotowy do działania',
        medium: 'Umiarkowana',
        low:    'Priorytet: odpoczynek',
      },
    },
    meals: {
      title: 'Posiłki',
    },
    recoveryTips: {
      title: 'Wskazówki regeneracyjne',
    },
    weekDayCard: {
      today: 'DZIŚ',
      cut:   'limit',
      nap:   'drzemka',
    },
  },
};
