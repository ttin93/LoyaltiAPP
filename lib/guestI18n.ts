// Prevodi gostovega flowa (SpinFlow + GuestApp + Scanner).
// SR/BS → HR (medsebojno razumljivo), neznano → SL.

export interface GuestStrings {
  // SpinFlow — kolo + registracija
  welcomeTo: (v: string) => string;
  firstVisitReward: string;
  kicker: { wheel: string; won: string; register: string; coupon: string };
  oneSpin: string;
  spinAndWin: string;
  everyGuestReward: string;
  spin: string;
  claimAfterRegister: string;
  hit: string;
  youWon: (label: string) => string;
  validDaysFirst: string;
  claimReward: string;
  almostYours: string;
  emailPassNote: string;
  email: string;
  password: string;
  min4: string;
  or: string;
  continueGoogle: string;
  termsNote: string;
  couponWaits: string;
  couponSavedNote: string;
  couponCode: string;
  activatesOnFirstScan: string;
  toMyLoyalty: string;
  poweredBy: string;
  noAppNote: string;
  googleNotSet: string;
  // GuestApp — domača stran
  everyCoffee: string;
  scanNote: string;
  points: string;
  stamps: string;
  coupons: string;
  yourCard: string;
  yourPoints: string;
  visitsLeft: (n: number, reward: string) => string;
  pointsToReward: (n: number) => string;
  canRedeem: string;
  cardFullActivate: string;
  scanReceipt: string;
  noCouponsYet: string;
  pointRewards: string;
  redeem: string;
  pendingCoupon: string;
  waits: string;
  validDays: string;
  activate: string;
  // success
  stampYours: (pts: number) => string;
  cardFull: string;
  oneStamp: string;
  couponInWallet: (reward: string) => string;
  backToCard: string;
  // review popup
  rateTitle: string;
  rateSub: string;
  tapToRate: string;
  thanksHonest: string;
  improveSub: string;
  feedbackPlaceholder: string;
  sendTeam: string;
  privateNote: string;
  yayThanks: string;
  shareGoogleSub: string;
  rateOnGoogle: string;
  googleThanks: string;
  maybeLater: string;
  feedbackSent: string;
  feedbackSentSub: string;
  thanksSupport: string;
  openingGoogle: string;
  close: string;
  // error
  scanOther: string;
  pointsStay: (n: number) => string;
  // redeem / timer / activate
  activateRewardBtn: string;
  forPoints: (n: number) => string;
  staffConfirm: string;
  hide: string;
  validEvenClosed: string;
  showStaff: string;
  cancel: string;
  activateNow: string;
  activateNote: (pts: number, min: number) => string;
  yesActivate: string;
  noBack: string;
  // scanner
  scanTitle: string;
  alignQr: string;
  cameraNa: string;
}

const sl: GuestStrings = {
  welcomeTo: (v) => `Dobrodošel v ${v}`,
  firstVisitReward: "Tvoj prvi obisk si zasluži nagrado",
  kicker: { wheel: "Kolo sreče", won: "Tvoja nagrada", register: "Registracija", coupon: "Kupon" },
  oneSpin: "1 VRTLJAJ",
  spinAndWin: "Zavrti in osvoji",
  everyGuestReward: "Vsak nov gost dobi zajamčeno nagrado za prvi obisk.",
  spin: "ZAVRTI",
  claimAfterRegister: "Zadetek prevzameš ob registraciji",
  hit: "Zadetek!",
  youWon: (l) => `Osvojil si ${l} za prvi obisk.`,
  validDaysFirst: "velja 14 dni · ob prvem obisku",
  claimReward: "Prevzemi nagrado",
  almostYours: "Skoraj tvoje",
  emailPassNote: "Email in geslo — da shranimo kupon, žige in točke ter zaščitimo tvoj račun.",
  email: "Email",
  password: "Geslo",
  min4: "vsaj 6 znakov",
  or: "ali",
  continueGoogle: "Nadaljuj z Googlom",
  termsNote: "Z registracijo se strinjaš s pogoji. Brez spama.",
  couponWaits: "Kupon te čaka!",
  couponSavedNote: "Shranjen v tvoji denarnici. Aktivira se ob prvem skeniranju računa v lokalu — potem ga unovčiš.",
  couponCode: "Koda kupona",
  activatesOnFirstScan: "Aktivira se ob 1. skeniranju računa",
  toMyLoyalty: "Na mojo stran zvestobe",
  poweredBy: "powered by",
  noAppNote: "Brez prenosa aplikacije · velja samo v tem lokalu",
  googleNotSet: "Google prijava še ni nastavljena. Uporabi email.",
  everyCoffee: "Vsaka kava te približa nagradi.",
  scanNote: "Skeniraj račun ob obisku — vsak prinese žig in točke. Preprosto, toplo, tvoje.",
  points: "točk",
  stamps: "žigov",
  coupons: "kuponov",
  yourCard: "Tvoja kartica",
  yourPoints: "Tvoje točke",
  visitsLeft: (n, r) => `Še ${n} ${n === 1 ? "obisk" : n === 2 ? "obiska" : "obiskov"} do nagrade: ${r}.`,
  pointsToReward: (n) => `Še ${n} točk do nagrade.`,
  canRedeem: "Imaš dovolj točk — unovči nagrado.",
  cardFullActivate: "Kartonček je poln — aktiviraj kupon spodaj.",
  scanReceipt: "Skeniraj račun",
  noCouponsYet: "Nimaš še kuponov. Napolni kartico za nagrado.",
  pointRewards: "Nagrade za točke",
  redeem: "Unovči",
  pendingCoupon: "Na čakanju · aktivira se ob 1. skeniranju računa",
  waits: "ČAKA",
  validDays: "Velja še 12 dni",
  activate: "Aktiviraj",
  stampYours: (p) => `Žig je tvoj · +${p} točk`,
  cardFull: "Kartonček je poln!",
  oneStamp: "+1 žig",
  couponInWallet: (r) => `Kupon za ${r} je v tvoji denarnici 🎟️`,
  backToCard: "Super, nazaj na kartico",
  rateTitle: "Kako ti je bilo?",
  rateSub: "Oceni obisk in pomagaj nam postati boljši.",
  tapToRate: "Tapni za oceno svojega obiska",
  thanksHonest: "Hvala za iskrenost",
  improveSub: "Kaj bi lahko izboljšali? Sporočilo gre naravnost ekipi.",
  feedbackPlaceholder: "Kaj bi izboljšali? Beremo vse…",
  sendTeam: "Pošlji ekipi",
  privateNote: "Zasebno · vidi samo lastnik lokala",
  yayThanks: "Juhu, hvala!",
  shareGoogleSub: "Bi to delil še na Googlu? Vzame 10 sekund in nam ogromno pomeni.",
  rateOnGoogle: "Oceni na Googlu",
  googleThanks: "Hvala! 💛 En klik na Googlu nam ogromno pomeni — vzame le 10 sekund.",
  maybeLater: "Mogoče kasneje",
  feedbackSent: "Sporočilo oddano",
  feedbackSentSub: "Hvala — ekipa tvoje mnenje vidi takoj in se potrudi.",
  thanksSupport: "Hvala za podporo!",
  openingGoogle: "Odpiramo Google oceno v novem zavihku …",
  close: "Zapri",
  scanOther: "Skeniraj drug račun",
  pointsStay: (n) => `Tvoje točke ostajajo: ${n}`,
  activateRewardBtn: "Aktiviraj nagrado",
  forPoints: (n) => `Za ${n} točk`,
  staffConfirm: "Osebje potrdi",
  hide: "Skrij (časovnik še teče)",
  validEvenClosed: "Velja še, tudi če zapreš aplikacijo.",
  showStaff: "Pokaži natakarju",
  cancel: "Prekliči",
  activateNow: "Aktiviraj zdaj?",
  activateNote: (p, m) => `Točke (${p}) se takoj porabijo in imaš ${m} min, da kodo pokažeš natakarju. Časovnik teče, tudi če zapreš aplikacijo.`,
  yesActivate: "Da, aktiviraj",
  noBack: "Ne, nazaj",
  scanTitle: "Skeniraj račun",
  alignQr: "Poravnaj QR z dna računa v okvir. Žig se doda samodejno.",
  cameraNa: "Kamera ni na voljo. Za skeniranje računa uporabi telefon s kamero.",
};

const en: GuestStrings = {
  welcomeTo: (v) => `Welcome to ${v}`,
  firstVisitReward: "Your first visit deserves a reward",
  kicker: { wheel: "Wheel of fortune", won: "Your reward", register: "Sign up", coupon: "Coupon" },
  oneSpin: "1 SPIN",
  spinAndWin: "Spin and win",
  everyGuestReward: "Every new guest gets a guaranteed reward for their first visit.",
  spin: "SPIN",
  claimAfterRegister: "Claim your prize when you sign up",
  hit: "You won!",
  youWon: (l) => `You won ${l} for your first visit.`,
  validDaysFirst: "valid 14 days · on first visit",
  claimReward: "Claim reward",
  almostYours: "Almost yours",
  emailPassNote: "Email and password — so we can save your coupon, stamps and points and protect your account.",
  email: "Email",
  password: "Password",
  min4: "at least 6 characters",
  or: "or",
  continueGoogle: "Continue with Google",
  termsNote: "By signing up you agree to the terms. No spam.",
  couponWaits: "Your coupon awaits!",
  couponSavedNote: "Saved in your wallet. It activates on your first receipt scan here — then you can redeem it.",
  couponCode: "Coupon code",
  activatesOnFirstScan: "Activates on 1st receipt scan",
  toMyLoyalty: "To my loyalty page",
  poweredBy: "powered by",
  noAppNote: "No app download · valid only at this venue",
  googleNotSet: "Google sign-in isn't set up yet. Use email.",
  everyCoffee: "Every coffee brings you closer to a reward.",
  scanNote: "Scan your receipt each visit — every one earns a stamp and points. Simple and warm.",
  points: "points",
  stamps: "stamps",
  coupons: "coupons",
  yourCard: "Your card",
  yourPoints: "Your points",
  visitsLeft: (n, r) => `${n} more ${n === 1 ? "visit" : "visits"} to your reward: ${r}.`,
  pointsToReward: (n) => `${n} points to your reward.`,
  canRedeem: "You have enough points — redeem your reward.",
  cardFullActivate: "Card is full — activate the coupon below.",
  scanReceipt: "Scan receipt",
  noCouponsYet: "No coupons yet. Fill your card for a reward.",
  pointRewards: "Point rewards",
  redeem: "Redeem",
  pendingCoupon: "Pending · activates on 1st receipt scan",
  waits: "PENDING",
  validDays: "Valid 12 more days",
  activate: "Activate",
  stampYours: (p) => `Stamp earned · +${p} points`,
  cardFull: "Your card is full!",
  oneStamp: "+1 stamp",
  couponInWallet: (r) => `A ${r} coupon is in your wallet 🎟️`,
  backToCard: "Great, back to card",
  rateTitle: "How was it?",
  rateSub: "Rate your visit and help us get better.",
  tapToRate: "Tap to rate your visit",
  thanksHonest: "Thanks for the honesty",
  improveSub: "What could we improve? Your message goes straight to the team.",
  feedbackPlaceholder: "What would you improve? We read everything…",
  sendTeam: "Send to team",
  privateNote: "Private · only the owner sees this",
  yayThanks: "Yay, thank you!",
  shareGoogleSub: "Would you share it on Google? It takes 10 seconds and means a lot.",
  rateOnGoogle: "Rate on Google",
  googleThanks: "Thanks! 💛 One click on Google means a lot — just 10 seconds.",
  maybeLater: "Maybe later",
  feedbackSent: "Message sent",
  feedbackSentSub: "Thanks — the team sees your feedback right away.",
  thanksSupport: "Thanks for your support!",
  openingGoogle: "Opening Google review in a new tab …",
  close: "Close",
  scanOther: "Scan another receipt",
  pointsStay: (n) => `Your points remain: ${n}`,
  activateRewardBtn: "Activate reward",
  forPoints: (n) => `For ${n} points`,
  staffConfirm: "Staff confirms",
  hide: "Hide (timer keeps running)",
  validEvenClosed: "Stays valid even if you close the app.",
  showStaff: "Show the staff",
  cancel: "Cancel",
  activateNow: "Activate now?",
  activateNote: (p, m) => `Your points (${p}) are used immediately and you have ${m} min to show the code to the staff. The timer runs even if you close the app.`,
  yesActivate: "Yes, activate",
  noBack: "No, go back",
  scanTitle: "Scan receipt",
  alignQr: "Align the QR at the bottom of the receipt. The stamp is added automatically.",
  cameraNa: "Camera unavailable. Use a phone with a camera to scan.",
};

const hr: GuestStrings = {
  welcomeTo: (v) => `Dobrodošao u ${v}`,
  firstVisitReward: "Tvoj prvi posjet zaslužuje nagradu",
  kicker: { wheel: "Kolo sreće", won: "Tvoja nagrada", register: "Registracija", coupon: "Kupon" },
  oneSpin: "1 OKRETAJ",
  spinAndWin: "Zavrti i osvoji",
  everyGuestReward: "Svaki novi gost dobiva zajamčenu nagradu za prvi posjet.",
  spin: "ZAVRTI",
  claimAfterRegister: "Nagradu preuzimaš pri registraciji",
  hit: "Pogodak!",
  youWon: (l) => `Osvojio si ${l} za prvi posjet.`,
  validDaysFirst: "vrijedi 14 dana · uz prvi posjet",
  claimReward: "Preuzmi nagradu",
  almostYours: "Skoro tvoje",
  emailPassNote: "Email i lozinka — da spremimo kupon, žigove i bodove te zaštitimo tvoj račun.",
  email: "Email",
  password: "Lozinka",
  min4: "barem 6 znakova",
  or: "ili",
  continueGoogle: "Nastavi s Googleom",
  termsNote: "Registracijom prihvaćaš uvjete. Bez spama.",
  couponWaits: "Kupon te čeka!",
  couponSavedNote: "Spremljen u tvom novčaniku. Aktivira se uz prvo skeniranje računa — onda ga iskoristiš.",
  couponCode: "Kod kupona",
  activatesOnFirstScan: "Aktivira se uz 1. skeniranje računa",
  toMyLoyalty: "Na moju karticu vjernosti",
  poweredBy: "powered by",
  noAppNote: "Bez preuzimanja aplikacije · vrijedi samo u ovom lokalu",
  googleNotSet: "Google prijava još nije postavljena. Koristi email.",
  everyCoffee: "Svaka kava te približava nagradi.",
  scanNote: "Skeniraj račun pri svakom posjetu — svaki donosi žig i bodove. Jednostavno i toplo.",
  points: "bodova",
  stamps: "žigova",
  coupons: "kupona",
  yourCard: "Tvoja kartica",
  yourPoints: "Tvoji bodovi",
  visitsLeft: (n, r) => `Još ${n} ${n === 1 ? "posjet" : "posjeta"} do nagrade: ${r}.`,
  pointsToReward: (n) => `Još ${n} bodova do nagrade.`,
  canRedeem: "Imaš dovoljno bodova — iskoristi nagradu.",
  cardFullActivate: "Kartica je puna — aktiviraj kupon ispod.",
  scanReceipt: "Skeniraj račun",
  noCouponsYet: "Još nemaš kupona. Napuni karticu za nagradu.",
  pointRewards: "Nagrade za bodove",
  redeem: "Iskoristi",
  pendingCoupon: "Na čekanju · aktivira se uz 1. skeniranje računa",
  waits: "ČEKA",
  validDays: "Vrijedi još 12 dana",
  activate: "Aktiviraj",
  stampYours: (p) => `Žig je tvoj · +${p} bodova`,
  cardFull: "Kartica je puna!",
  oneStamp: "+1 žig",
  couponInWallet: (r) => `Kupon za ${r} je u tvom novčaniku 🎟️`,
  backToCard: "Super, natrag na karticu",
  rateTitle: "Kako je bilo?",
  rateSub: "Ocijeni posjet i pomozi nam da budemo bolji.",
  tapToRate: "Dodirni za ocjenu posjeta",
  thanksHonest: "Hvala na iskrenosti",
  improveSub: "Što bismo mogli poboljšati? Poruka ide ravno timu.",
  feedbackPlaceholder: "Što bi poboljšao? Čitamo sve…",
  sendTeam: "Pošalji timu",
  privateNote: "Privatno · vidi samo vlasnik lokala",
  yayThanks: "Juhu, hvala!",
  shareGoogleSub: "Bi li to podijelio na Googleu? Traje 10 sekundi i puno nam znači.",
  rateOnGoogle: "Ocijeni na Googleu",
  googleThanks: "Hvala! 💛 Jedan klik na Googleu puno znači — samo 10 sekundi.",
  maybeLater: "Možda kasnije",
  feedbackSent: "Poruka poslana",
  feedbackSentSub: "Hvala — tim odmah vidi tvoje mišljenje.",
  thanksSupport: "Hvala na podršci!",
  openingGoogle: "Otvaramo Google ocjenu u novoj kartici …",
  close: "Zatvori",
  scanOther: "Skeniraj drugi račun",
  pointsStay: (n) => `Tvoji bodovi ostaju: ${n}`,
  activateRewardBtn: "Aktiviraj nagradu",
  forPoints: (n) => `Za ${n} bodova`,
  staffConfirm: "Osoblje potvrđuje",
  hide: "Sakrij (mjerač i dalje ide)",
  validEvenClosed: "Vrijedi i ako zatvoriš aplikaciju.",
  showStaff: "Pokaži osoblju",
  cancel: "Odustani",
  activateNow: "Aktiviraj sada?",
  activateNote: (p, m) => `Bodovi (${p}) se odmah troše i imaš ${m} min da kod pokažeš osoblju. Mjerač ide i ako zatvoriš aplikaciju.`,
  yesActivate: "Da, aktiviraj",
  noBack: "Ne, natrag",
  scanTitle: "Skeniraj račun",
  alignQr: "Poravnaj QR s dna računa u okvir. Žig se dodaje automatski.",
  cameraNa: "Kamera nije dostupna. Za skeniranje koristi telefon s kamerom.",
};

const de: GuestStrings = {
  welcomeTo: (v) => `Willkommen bei ${v}`,
  firstVisitReward: "Dein erster Besuch verdient eine Belohnung",
  kicker: { wheel: "Glücksrad", won: "Deine Belohnung", register: "Registrierung", coupon: "Gutschein" },
  oneSpin: "1 DREHUNG",
  spinAndWin: "Drehen und gewinnen",
  everyGuestReward: "Jeder neue Gast erhält eine garantierte Belohnung zum ersten Besuch.",
  spin: "DREHEN",
  claimAfterRegister: "Gewinn bei der Registrierung einlösen",
  hit: "Gewonnen!",
  youWon: (l) => `Du hast ${l} zum ersten Besuch gewonnen.`,
  validDaysFirst: "14 Tage gültig · beim ersten Besuch",
  claimReward: "Belohnung holen",
  almostYours: "Fast deins",
  emailPassNote: "E-Mail und Passwort — damit wir Gutschein, Stempel und Punkte speichern und dein Konto schützen.",
  email: "E-Mail",
  password: "Passwort",
  min4: "mindestens 6 Zeichen",
  or: "oder",
  continueGoogle: "Weiter mit Google",
  termsNote: "Mit der Registrierung stimmst du den Bedingungen zu. Kein Spam.",
  couponWaits: "Dein Gutschein wartet!",
  couponSavedNote: "In deiner Wallet gespeichert. Wird beim ersten Beleg-Scan aktiviert — dann kannst du ihn einlösen.",
  couponCode: "Gutscheincode",
  activatesOnFirstScan: "Aktiviert beim 1. Beleg-Scan",
  toMyLoyalty: "Zu meiner Treuekarte",
  poweredBy: "powered by",
  noAppNote: "Kein App-Download · nur in diesem Lokal gültig",
  googleNotSet: "Google-Anmeldung ist noch nicht eingerichtet. Nutze E-Mail.",
  everyCoffee: "Jeder Kaffee bringt dich näher zur Belohnung.",
  scanNote: "Scanne deinen Beleg bei jedem Besuch — jeder bringt einen Stempel und Punkte. Einfach und herzlich.",
  points: "Punkte",
  stamps: "Stempel",
  coupons: "Gutscheine",
  yourCard: "Deine Karte",
  yourPoints: "Deine Punkte",
  visitsLeft: (n, r) => `Noch ${n} ${n === 1 ? "Besuch" : "Besuche"} bis zur Belohnung: ${r}.`,
  pointsToReward: (n) => `Noch ${n} Punkte bis zur Belohnung.`,
  canRedeem: "Du hast genug Punkte — Belohnung einlösen.",
  cardFullActivate: "Karte ist voll — Gutschein unten aktivieren.",
  scanReceipt: "Beleg scannen",
  noCouponsYet: "Noch keine Gutscheine. Fülle deine Karte für eine Belohnung.",
  pointRewards: "Punkte-Belohnungen",
  redeem: "Einlösen",
  pendingCoupon: "Ausstehend · aktiviert beim 1. Beleg-Scan",
  waits: "WARTET",
  validDays: "Noch 12 Tage gültig",
  activate: "Aktivieren",
  stampYours: (p) => `Stempel erhalten · +${p} Punkte`,
  cardFull: "Deine Karte ist voll!",
  oneStamp: "+1 Stempel",
  couponInWallet: (r) => `Ein ${r}-Gutschein ist in deiner Wallet 🎟️`,
  backToCard: "Super, zurück zur Karte",
  rateTitle: "Wie war es?",
  rateSub: "Bewerte deinen Besuch und hilf uns, besser zu werden.",
  tapToRate: "Tippe, um deinen Besuch zu bewerten",
  thanksHonest: "Danke für die Ehrlichkeit",
  improveSub: "Was könnten wir verbessern? Die Nachricht geht direkt ans Team.",
  feedbackPlaceholder: "Was würdest du verbessern? Wir lesen alles…",
  sendTeam: "Ans Team senden",
  privateNote: "Privat · nur der Inhaber sieht das",
  yayThanks: "Juhu, danke!",
  shareGoogleSub: "Würdest du es auf Google teilen? Dauert 10 Sekunden und bedeutet uns viel.",
  rateOnGoogle: "Auf Google bewerten",
  googleThanks: "Danke! 💛 Ein Klick auf Google bedeutet viel — nur 10 Sekunden.",
  maybeLater: "Vielleicht später",
  feedbackSent: "Nachricht gesendet",
  feedbackSentSub: "Danke — das Team sieht dein Feedback sofort.",
  thanksSupport: "Danke für deine Unterstützung!",
  openingGoogle: "Google-Bewertung wird in neuem Tab geöffnet …",
  close: "Schließen",
  scanOther: "Anderen Beleg scannen",
  pointsStay: (n) => `Deine Punkte bleiben: ${n}`,
  activateRewardBtn: "Belohnung aktivieren",
  forPoints: (n) => `Für ${n} Punkte`,
  staffConfirm: "Personal bestätigt",
  hide: "Ausblenden (Timer läuft weiter)",
  validEvenClosed: "Bleibt gültig, auch wenn du die App schließt.",
  showStaff: "Dem Personal zeigen",
  cancel: "Abbrechen",
  activateNow: "Jetzt aktivieren?",
  activateNote: (p, m) => `Die Punkte (${p}) werden sofort verbraucht und du hast ${m} Min, um den Code dem Personal zu zeigen. Der Timer läuft, auch wenn du die App schließt.`,
  yesActivate: "Ja, aktivieren",
  noBack: "Nein, zurück",
  scanTitle: "Beleg scannen",
  alignQr: "Richte den QR unten am Beleg im Rahmen aus. Der Stempel wird automatisch hinzugefügt.",
  cameraNa: "Kamera nicht verfügbar. Nutze ein Handy mit Kamera zum Scannen.",
};

export function gt(lang?: string | null): GuestStrings {
  switch (lang) {
    case "en": return en;
    case "de": return de;
    case "hr":
    case "sr":
    case "bs": return hr;
    default: return sl;
  }
}
