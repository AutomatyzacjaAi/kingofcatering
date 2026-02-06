// ============= EXTRAS DATA =============

export type ExtraItem = {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  unitLabel: string; // "szt.", "event", "os."
  icon: string;
};

export type PackagingOption = {
  id: string;
  name: string;
  description: string;
  price: number; // 0 = free
  priceLabel: string; // "Gratis", "25 zł/os."
  requiresPersonCount?: boolean;
  icon: string;
};

export type WaiterServiceOption = {
  id: string;
  name: string;
  description: string;
  duration: string; // "4h", "8h", "12h"
  price: number;
  icon: string;
};

export type ExtrasCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
  required?: boolean;
};

// ============= EXTRAS CATEGORIES =============

export const extrasCategories: ExtrasCategory[] = [
  {
    id: "dodatki",
    name: "Dodatki",
    description: "Dodatkowe usługi",
    icon: "✨",
    required: false,
  },
  {
    id: "pakowanie",
    name: "Pakowanie",
    description: "Wybierz sposób pakowania",
    icon: "📦",
    required: true,
  },
  {
    id: "obsluga",
    name: "Obsługa",
    description: "Obsługa kelnerska",
    icon: "🧑‍🍳",
    required: false,
  },
];

// ============= EXTRAS - ADDITIONAL SERVICES =============

export const extraItems: ExtraItem[] = [
  {
    id: "wniesienie",
    name: "Wniesienie na salę",
    description: "Wniesiemy catering na wskazane piętro",
    longDescription: "Nasz personel wniesie wszystkie produkty cateringowe na wskazane przez Ciebie piętro lub salę. Cena obejmuje wniesienie i rozstawienie.",
    price: 150,
    unitLabel: "event",
    icon: "📦",
  },
  {
    id: "dekoracja-stolu",
    name: "Dekoracja stołu",
    description: "Profesjonalna dekoracja stołów cateringowych",
    longDescription: "Dekorujemy stoły kwiatami, świecami i elegancką zastawą. Wszystko w wybranej przez Ciebie kolorystyce.",
    price: 200,
    unitLabel: "event",
    icon: "🌸",
  },
  {
    id: "led-swiece",
    name: "Świece LED",
    description: "Atmosferyczne oświetlenie LED",
    longDescription: "Zestaw eleganckich świec LED, które stworzą niepowtarzalny klimat na Twoim wydarzeniu. Bezpieczne i długotrwałe.",
    price: 80,
    unitLabel: "zestaw",
    icon: "🕯️",
  },
  {
    id: "naczynia-podgrzewacze",
    name: "Podgrzewacze na naczynia",
    description: "Utrzymaj potrawy ciepłe przez całe wydarzenie",
    longDescription: "Profesjonalne podgrzewacze bufetowe z płomieniami. Idealne do dań gorących. W zestawie 6 sztuk.",
    price: 120,
    unitLabel: "zestaw",
    icon: "🔥",
  },
  {
    id: "odbiorcatering",
    name: "Odbiór resztek",
    description: "Przyjdziemy i zabierzemy wszystko po imprezie",
    longDescription: "Po zakończeniu wydarzenia przyjedziemy i zabierzemy wszystkie naczynia, resztki jedzenia i śmieci. Ty cieszysz się imprezą!",
    price: 100,
    unitLabel: "event",
    icon: "🚚",
  },
];

// ============= PACKAGING OPTIONS =============

export const packagingOptions: PackagingOption[] = [
  {
    id: "jednorazowa",
    name: "Zastawa jednorazowa",
    description: "Ekologiczna zastawa jednorazowa w cenie",
    price: 0,
    priceLabel: "W cenie",
    icon: "🍃",
  },
  {
    id: "porcelana",
    name: "Zastawa porcelanowa",
    description: "Elegancka porcelana z obsługą zwrotu",
    price: 25,
    priceLabel: "25 zł/os.",
    requiresPersonCount: true,
    icon: "🍽️",
  },
  {
    id: "premium",
    name: "Zastawa premium",
    description: "Ekskluzywna porcelana i kryształowe szkło",
    price: 45,
    priceLabel: "45 zł/os.",
    requiresPersonCount: true,
    icon: "✨",
  },
];

// ============= WAITER SERVICE OPTIONS =============

export const waiterServiceOptions: WaiterServiceOption[] = [
  {
    id: "basic",
    name: "Obsługa Basic",
    description: "1 kelner na 4 godziny",
    duration: "4h",
    price: 350,
    icon: "👤",
  },
  {
    id: "standard",
    name: "Obsługa Standard",
    description: "1 kelner na 8 godzin",
    duration: "8h",
    price: 600,
    icon: "👥",
  },
  {
    id: "premium",
    name: "Obsługa Premium",
    description: "1 kelner na 12 godzin + koordynator",
    duration: "12h",
    price: 950,
    icon: "🌟",
  },
];

// ============= PAYMENT METHODS =============

export type PaymentMethod = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export const paymentMethods: PaymentMethod[] = [
  {
    id: "online",
    name: "Płatność online",
    description: "Szybka płatność kartą lub przelewem",
    icon: "💳",
  },
  {
    id: "gotowka",
    name: "Gotówka",
    description: "Płatność przy odbiorze",
    icon: "💵",
  },
  {
    id: "oferta",
    name: "Oferta",
    description: "Otrzymasz szczegółową ofertę mailem",
    icon: "📧",
  },
  {
    id: "proforma",
    name: "Faktura proforma",
    description: "Płatność na podstawie proformy",
    icon: "📄",
  },
];
