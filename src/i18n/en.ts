export const en = {
  // ── Common ────────────────────────────────────────────────────────────────────
  common: {
    continue: 'Continue',
    cancel: 'Cancel',
    save: 'Save',
    done: 'Done',
    skip: 'Skip for now',
    reset: 'Reset',
    yes: 'Yes',
    no: 'No',
    notSet: 'Not set',
    none: 'None',
  },

  // ── Language selection ────────────────────────────────────────────────────────
  language: {
    title: 'Choose language',
    subtitle: 'You can change this later in settings',
    en: 'English',
    pl: 'Polski',
  },

  // ── Welcome / onboarding index ────────────────────────────────────────────────
  welcome: {
    title: 'ShiftFlow',
    tagline: 'Recovery and energy planning\nbuilt for shift workers',
    getStarted: 'Get started',
    noSignUp: 'No sign-up required. Your data stays on your device.',
    features: {
      sleep: 'Personalised sleep windows around every shift',
      caffeine: 'Caffeine cutoffs that protect your sleep quality',
      energy: 'Energy scores and daily recovery guidance',
      recovery: 'Night shift recovery and transition plans',
    },
  },

  // ── Onboarding: Role ──────────────────────────────────────────────────────────
  role: {
    title: "What's your role?",
    subtitle: 'This helps us tailor your energy and recovery plan.',
  },

  // ── Onboarding: Shift pattern ─────────────────────────────────────────────────
  shiftPattern: {
    title: 'How does your schedule work?',
    subtitle: "We'll use this to build smarter transition plans.",
  },

  // ── Onboarding: Sleep profile ─────────────────────────────────────────────────
  sleepProfile: {
    title: 'How do you sleep?',
    subtitle: "Be honest — we'll protect your sleep windows accordingly.",
    targetSleepTitle: 'Target sleep per night',
    targetSleepHint: 'Most adults need 7–9 hours. Shift workers often need slightly more.',
    prepTimeTitle: 'Commute & prep time',
    prepTimeSubtitle: "How long before your shift do you need to be up and ready? We'll keep sleep and nap suggestions clear of this window.",
    sleepOptions: {
      easy: { label: 'Easy sleeper', description: 'I usually fall asleep quickly and sleep through' },
      moderate: { label: 'Moderate', description: 'Sleep is generally okay but shifts throw me off' },
      hard: { label: 'Difficult sleeper', description: 'I struggle to fall asleep or stay asleep' },
    },
  },

  // ── Onboarding: Caffeine ──────────────────────────────────────────────────────
  caffeine: {
    title: 'Caffeine sensitivity',
    subtitle: "We'll use this to set your daily caffeine cutoff time.",
    cutoffNote: 'Your caffeine cutoff will be set to',
    cutoffSuffix: 'to protect your sleep window.',
    options: {
      low: {
        label: 'Low sensitivity',
        description: 'I can have coffee in the evening and still sleep fine',
        cutoff: '4 hours before sleep',
      },
      medium: {
        label: 'Medium sensitivity',
        description: 'Afternoon coffee can affect my sleep',
        cutoff: '6 hours before sleep',
      },
      high: {
        label: 'High sensitivity',
        description: 'Even morning coffee can disrupt my night sleep',
        cutoff: '8 hours before sleep',
      },
    },
  },

  // ── Onboarding: Notifications ─────────────────────────────────────────────────
  notifications: {
    title: 'Notifications',
    subtitle: 'ShiftFlow sends timely nudges, not noise. You can always adjust these later.',
    enableLabel: 'Enable notifications',
    skipButton: 'Skip for now',
    toggles: {
      sleepReminder: { label: 'Sleep window', desc: '30 min before your target bedtime' },
      caffeineReminder: { label: 'Caffeine cutoff', desc: '15 min before the cutoff' },
      napReminder: { label: 'Nap window', desc: "When a nap is in today's plan" },
      shiftReminder: { label: 'Shift reminder', desc: '1 hour before your shift starts' },
      checkInReminder: { label: 'Daily check-in', desc: 'Reminder at 8 PM each day' },
    },
  },

  // ── Onboarding: Goals ─────────────────────────────────────────────────────────
  goals: {
    title: 'What do you want to improve?',
    subtitle: "Pick one or more. We'll shape your plan around these.",
    buildPlan: 'Build my plan',
    startWithDefaults: 'Start with defaults',
    caption: "You're all set. Your first plan generates automatically.",
  },

  // ── Settings ──────────────────────────────────────────────────────────────────
  settings: {
    title: 'Settings',
    sections: {
      profile: 'Profile',
      shiftDefaults: 'Shift time defaults',
      notifications: 'Notifications',
      language: 'Language',
      timeFormat: 'Time Format',
      data: 'Data & Privacy',
      about: 'About',
      developer: 'Developer',
    },
    fields: {
      role: 'Role',
      shiftPattern: 'Shift pattern',
      sleepGoal: 'Sleep goal',
      caffeineSensitivity: 'Caffeine sensitivity',
      sleepDifficulty: 'Sleep difficulty',
      prepTime: 'Commute & prep time',
      goals: 'Goals',
      enableNotifications: 'Enable notifications',
      dataStorage: 'Data storage',
      dataStorageDesc: 'All data is stored locally on your device.',
      version: 'Version',
      premiumStatus: 'Premium status',
    },
    shiftDefaultsDesc: 'Customise the default start/end times used when you assign each shift type to a day.',
    premium: {
      upgrade: 'Upgrade to Premium',
      upgradeDesc: 'AI explanations, adaptive plans, and more',
      active: 'Premium active',
      manageSubscription: 'Manage subscription',
    },
    modal: {
      cancel: 'Cancel',
      save: 'Save',
      yourRole: 'Your role',
      shiftPattern: 'Shift pattern',
      sleepGoal: 'Sleep goal',
      caffeineSensitivity: 'Caffeine sensitivity',
      sleepDifficulty: 'Sleep difficulty',
      prepTime: 'Commute & prep time',
      prepTimeDesc: 'How long before your shift do you need to be up and ready? Sleep and nap suggestions will end at least this far before your next shift.',
      goals: 'Your goals',
      startTime: 'Start time',
      endTime: 'End time',
      defaultHours: 'Default hours:',
      resetToDefault: 'Reset to original default',
      shiftDefaults: 'defaults',
    },
    reset: {
      buttonLabel: 'Reset all data',
      title: 'Reset all data',
      message: 'This will permanently delete your profile, schedule, and check-in history. This cannot be undone.',
      cancel: 'Cancel',
      confirm: 'Reset',
    },
    language: {
      en: 'English',
      pl: 'Polski',
    },
    timeFormat: {
      label: 'Time Format',
      h12: '12-hour (AM/PM)',
      h24: '24-hour',
    },
    sleepHours: {
      shortSleeper: 'Short sleeper',
      recommended: 'Recommended range',
      longSleeper: 'Long sleeper',
      hoursLabel: (h: number) => `${h} hours`,
    },
  },

  // ── Tabs ──────────────────────────────────────────────────────────────────────
  tabs: {
    today:    'Today',
    schedule: 'Schedule',
    calendar: 'Calendar',
    weekly:   'Weekly',
    settings: 'Settings',
  },

  // ── Calendar screen ───────────────────────────────────────────────────────────
  calendar: {
    title:     'Calendar',
    today:     'Today',
    noShifts:  'No shifts this week',
    noShiftsDesc: 'Add your shifts on the Schedule tab to see them here.',
  },

  // ── Today screen ──────────────────────────────────────────────────────────────
  today: {
    yourDay: 'Your day',
    hiName: (name: string) => `Hi, ${name}`,
    checkIn: 'Check in',
    whyRecommendations: 'Why these recommendations?',
    noPlan: {
      title: 'No plan yet',
      description: "Add your shifts to generate today's recovery and energy plan.",
      action: 'Add shift',
    },
    error: {
      title: 'Something went wrong',
      action: 'Try again',
    },
  },

  // ── Schedule screen ───────────────────────────────────────────────────────────
  schedule: {
    prevWeek: '‹',
    nextWeek: '›',
    off: 'Off',
    dayOff: 'Day Off',
    multiShift: 'shifts',
    modal: {
      todaysShifts: "TODAY'S SHIFTS",
      addAnotherShift: 'ADD ANOTHER SHIFT',
      selectType: 'SELECT SHIFT TYPE',
      addButton: 'Add Shift',
      setDayOff: 'Set as Day Off',
      done: 'Done',
    },
  },

  // ── Work role options ─────────────────────────────────────────────────────────
  roles: {
    nurse:          { label: 'Nurse / Midwife' },
    doctor:         { label: 'Doctor / Clinician' },
    paramedic:      { label: 'Paramedic / EMT' },
    factory_worker: { label: 'Factory / Production' },
    retail:         { label: 'Retail / Store' },
    security:       { label: 'Security / Guard' },
    driver:         { label: 'Driver / Transport' },
    hospitality:    { label: 'Hospitality / Hotel' },
    warehouse:      { label: 'Warehouse / Logistics' },
    other:          { label: 'Other' },
  },

  // ── Shift pattern options ─────────────────────────────────────────────────────
  patterns: {
    rotating:         { label: 'Rotating shifts',    description: 'Cycles between morning, afternoon, and night' },
    fixed_nights:     { label: 'Fixed nights',       description: 'Permanent night shifts' },
    fixed_days:       { label: 'Fixed days',         description: 'Permanent morning/day shifts' },
    fixed_afternoons: { label: 'Fixed afternoons',   description: 'Permanent afternoon/evening shifts' },
    irregular:        { label: 'Irregular',          description: 'No consistent pattern' },
    split:            { label: 'Split shifts',       description: 'Two or more periods per day' },
  },

  // ── Goal options ──────────────────────────────────────────────────────────────
  goalOptions: {
    better_sleep:    { label: 'Sleep better',      description: 'Improve sleep timing and quality' },
    less_fatigue:    { label: 'Reduce fatigue',    description: 'Feel more alert during your shift' },
    shift_recovery:  { label: 'Recover faster',    description: 'Bounce back after hard shifts' },
    stable_routine:  { label: 'Build a routine',   description: 'Create structure around shifting schedules' },
  },

  // ── Shift type labels ─────────────────────────────────────────────────────────
  shiftTypes: {
    morning:    { label: 'Morning',    description: '~06:00 – 14:00' },
    afternoon:  { label: 'Afternoon',  description: '~14:00 – 22:00' },
    night:      { label: 'Night',      description: '~22:00 – 06:00' },
    long_day:   { label: 'Long Day',   description: '~07:00 – 19:00' },
    long_night: { label: 'Long Night', description: '~19:00 – 07:00' },
    extended:   { label: 'Extended',   description: '24 h+ continuous' },
    off:        { label: 'Day Off',    description: 'Rest & recovery' },
    custom:     { label: 'Custom',     description: 'Set your own hours' },
  },

  // ── Streak / gamification ────────────────────────────────────────────────────
  streak: {
    current: 'Current streak',
    longest: 'Longest streak',
    days:    (count: number) => count === 1 ? '1 day' : `${count} days`,
  },

  // ── Weekly Insights ───────────────────────────────────────────────────────────
  weeklyInsights: {
    title:          'Weekly Insights',
    lockedProgress: (current: number) => `${current}/7 days`,
    lockedHint:     (remaining: number) =>
      remaining === 1 ? 'Complete 1 more day to unlock' : `Complete ${remaining} more days to unlock`,
    avgAlertness:   'Avg. alertness',
    avgSleep:       'Avg. sleep quality',
    checkInsCount:  'Check-ins this week',
    outOf5:         (n: number) => `${n}/5`,
    trend: {
      improving: 'Improving ↑',
      stable:    'Stable →',
      declining:  'Declining ↓',
    },
    insights: {
      consistent:    'Consistent check-ins are building a clearer picture of your health.',
      improveSleep:  'Sleep quality has been low this week. A consistent wind-down routine can help.',
      highAlertness: "Alertness is high — your routine is working. Keep it up.",
      trending_up:   'Alertness is improving compared to earlier this week. Good progress.',
      rest_needed:   'Alertness has dipped this week. Prioritise rest and recovery today.',
    },
  },

  // ── History access ────────────────────────────────────────────────────────────
  history: {
    lockedCount: (count: number) =>
      count === 1 ? '1 older entry locked' : `${count} older entries locked`,
    upgradeCta: 'Upgrade to Pro for full history & export',
  },

  // ── Export ────────────────────────────────────────────────────────────────────
  export: {
    title:   'Export check-in history',
    error:   'Export failed. Please try again.',
    proOnly: 'Pro feature',
  },

  // ── Weekly screen ─────────────────────────────────────────────────────────────
  weekly: {
    title: 'Weekly Plan',
    noPlan: {
      title: 'No weekly plan',
      description: 'Add your shifts for the week and your personalised plan will appear here.',
      action: 'Add shifts',
    },
    summary: {
      glance: 'This week at a glance',
      nightShifts: 'night shifts',
      restDays: 'rest days',
      avgEnergy: 'avg energy',
    },
    regenerateNote: 'Plans regenerate when you update your schedule or check in.',
  },

  // ── Prep time options ─────────────────────────────────────────────────────────
  prepTimeOptions: [
    { value: 0,  label: 'No commute', desc: 'Work from home or on-site' },
    { value: 15, label: '15 min',     desc: 'Short drive or walk' },
    { value: 30, label: '30 min',     desc: 'Average commute' },
    { value: 45, label: '45 min',     desc: 'Longer commute' },
    { value: 60, label: '1 hour',     desc: 'Far commute' },
    { value: 90, label: '1.5 hours',  desc: 'Very long commute' },
  ],

  // ── Caffeine sensitivity options ──────────────────────────────────────────────
  caffeineOptions: [
    { value: 'low',    label: 'Low',    description: 'Caffeine barely affects me' },
    { value: 'medium', label: 'Medium', description: 'Normal caffeine sensitivity' },
    { value: 'high',   label: 'High',   description: 'Very sensitive — affects sleep easily' },
  ],

  // ── Sleep difficulty options ──────────────────────────────────────────────────
  sleepDiffOptions: [
    { value: 'easy',     label: 'Easy',     description: 'I fall asleep quickly anytime' },
    { value: 'moderate', label: 'Moderate', description: 'Some difficulty around shift changes' },
    { value: 'hard',     label: 'Hard',     description: 'I struggle to sleep after night shifts' },
  ],

  // ── Day labels (used in relative date display) ────────────────────────────────
  days: {
    today:     'Today',
    tomorrow:  'Tomorrow',
    yesterday: 'Yesterday',
  },

  // ── Plan explanation screen ───────────────────────────────────────────────────
  planExplanation: {
    title:           'Why this plan?',
    close:           'Close',
    noPlan:          'No plan to explain yet.',
    summary:         'Summary',
    sleepWindow:     'Sleep window',
    sleepDesc:       'This window is calculated from your shift end time, commute buffer, and wind-down period.',
    sleepLow:        ' Note: this is below optimal — consider adjusting your schedule if possible.',
    caffeineTitle:   'Caffeine cutoff',
    caffeineDesc:    (sensitivity: string, hours: string) =>
      `Based on your ${sensitivity} caffeine sensitivity, we set your cutoff ${hours} hours before your target sleep time. This allows caffeine levels to drop below 25% before bed.`,
    napTitle:        'Nap suggestion',
    energyTitle:     (score: number) => `Energy score: ${score}/100`,
    energyDesc:      'Calculated from your last 7 days of check-ins. Fatigue and stress lower the score; sleep quality and alertness raise it.',
    energyLow:       " Your score is low — today's plan prioritises rest and minimal load.",
    premiumTitle:    'Premium',
    premiumDesc:     'Upgrade to get personalised AI explanations tailored to your exact schedule, fatigue patterns, and goals.',
    premiumCta:      'See Premium',
    disclaimer:      'Recommendations are informational and not medical advice.',
  },

  // ── Check-in screen ──────────────────────────────────────────────────────────
  checkIn: {
    title:        'Daily Check-in',
    subtitle:     "30 seconds to log your energy. We'll adjust today's plan accordingly.",
    privacy:      'Your data stays on your device and is never shared.',
    save:         'Save check-in',
    cancel:       'Cancel',
    saved:        'Check-in saved',
    savedDesc:    "Your energy plan has been updated based on how you're feeling today.",
    backToToday:  'Back to Today',
    fatigue:      { label: 'How tired are you?',      low: 'Not tired',  high: 'Exhausted' },
    sleepQuality: { label: 'Sleep quality last night', low: 'Poor',       high: 'Great' },
    stress:       { label: 'Stress level',             low: 'Relaxed',    high: 'Very stressed' },
    alertness:    { label: 'Current alertness',        low: 'Groggy',     high: 'Sharp' },
  },

  // ── Roster import screen ─────────────────────────────────────────────────────
  rosterImport: {
    title:            'Import Roster',
    close:            'Close',
    premiumTitle:     'Premium Feature',
    premiumMessage:   'Roster photo import requires a ShiftFlow Premium subscription.',
    premiumCta:       'See Premium',
    permissionLibrary: 'Please allow access to your photo library in Settings.',
    permissionCamera:  'Camera access is required to take a photo.',
    // pick step
    pickTitle:        'Photo your roster',
    pickDesc:         'Take a photo or upload a screenshot of your shift schedule. AI will extract the shifts automatically.',
    takePhoto:        'Take photo',
    chooseLibrary:    'Choose from library',
    tipsTitle:        '💡 Tips for best results:',
    tips:             '• Ensure the whole roster is visible\n• Good lighting — avoid glare\n• Month and dates must be readable\n• Works with printed rosters, whiteboards, and apps',
    noShiftsError:    'No shifts could be extracted from this image. Please try a clearer photo.',
    // processing step
    analysing:        'Analysing your roster…',
    analysingSub:     'We are checking your schedule',
    // review step
    reviewHint:       'Review extracted shifts. Tap to deselect any you don\'t want to import.',
    selected:         (n: number, total: number) => `${n} of ${total} shifts selected`,
    importBtn:        (n: number) => `Import ${n} shift${n !== 1 ? 's' : ''}`,
    saving:           'Saving…',
    tryAnother:       'Try a different photo',
    confidenceHigh:   'high confidence',
    confidenceMed:    'medium confidence',
    confidenceLow:    'low confidence',
    // done step
    doneTitle:        'Roster imported!',
    doneDesc:         (n: number) => `${n} shift${n !== 1 ? 's' : ''} have been added to your schedule.`,
    goToSchedule:     'Go to Schedule',
    importAnother:    'Import another',
  },

  // ── Feature component labels ───────────────────────────────────────────────
  features: {
    shiftCard: {
      todaysShift:  "Today's Shift",
      noShift:      'No shift scheduled',
      addShiftHint: "Tap + to add today's shift",
    },
    sleepWindow: {
      title:           'Sleep Window',
      notCalculated:   'Not yet calculated',
      addShiftsHint:   'Add your shifts to get a sleep recommendation.',
      recommended:     'Next Recommended Sleep',
      bedtime:         'BEDTIME',
      wake:            'WAKE',
      crossesMidnight: 'Sleep window crosses midnight',
      tonight:         'Tonight',
      tomorrow:        'Tomorrow',
    },
    caffeine: {
      title:  'Caffeine',
      cutoff: 'cutoff',
      maxToday: (n: number) => `Max today: ${n} cup${n !== 1 ? 's' : ''}`,
      phases: {
        free:               'Caffeine window open',
        last_cup:           'Last cup window',
        cutoff_approaching: 'Cutoff approaching',
        stop:               'Caffeine cutoff',
      },
    },
    nap: {
      title: 'Nap Suggestion',
    },
    energy: {
      readiness: 'Readiness',
      levels: {
        high:   'Good to go',
        medium: 'Moderate',
        low:    'Rest priority',
      },
    },
    meals: {
      title: 'Meal Timing',
    },
    recoveryTips: {
      title: 'Recovery Tips',
    },
    weekDayCard: {
      today: 'TODAY',
      cut:   'cut',
      nap:   'nap',
    },
  },
};

export type Translations = typeof en;
