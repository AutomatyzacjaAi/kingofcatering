// ============= EXTRAS DATA =============

export type ExtraItem = {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  image?: string;
  price: number;
  unitLabel: string; // "szt.", "event", "os."
  icon: string;
  contents?: string[]; // what's included
};

export type PackagingOption = {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  image?: string;
  price: number; // 0 = free
  priceLabel: string; // "Gratis", "25 zł/os."
  requiresPersonCount?: boolean;
  icon: string;
  contents?: string[];
};

export type WaiterServiceOption = {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  image?: string;
  duration: string; // "4h", "8h", "12h"
  price: number;
  icon: string;
  contents?: string[];
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
    longDescription: "Nasz profesjonalny personel wniesie wszystkie produkty cateringowe na wskazane przez Ciebie piętro lub salę. Cena obejmuje wniesienie, rozstawienie i przygotowanie bufetu do serwowania.",
    image: "/extras/wniesienie.jpg",
    price: 150,
    unitLabel: "event",
    icon: "📦",
    contents: [
      "Wniesienie na wskazane piętro",
      "Rozstawienie na stołach",
      "Przygotowanie bufetu",
      "Dekoracja podstawowa",
    ],
  },
  {
    id: "dekoracja-stolu",
    name: "Dekoracja stołu",
    description: "Profesjonalna dekoracja stołów cateringowych",
    longDescription: "Dekorujemy stoły kwiatami, świecami i elegancką zastawą. Wszystko w wybranej przez Ciebie kolorystyce. Nasi dekoratorzy stworzą niepowtarzalną atmosferę.",
    image: "/extras/dekoracja-stolu.jpg",
    price: 200,
    unitLabel: "event",
    icon: "🌸",
    contents: [
      "Kompozycje kwiatowe",
      "Świece dekoracyjne",
      "Eleganckie serwetki",
      "Obrusy w wybranym kolorze",
      "Drobne akcesoria dekoracyjne",
    ],
  },
  {
    id: "led-swiece",
    name: "Świece LED",
    description: "Atmosferyczne oświetlenie LED",
    longDescription: "Zestaw eleganckich świec LED, które stworzą niepowtarzalny klimat na Twoim wydarzeniu. Bezpieczne, bezwonne i długotrwałe - idealne do sal, gdzie ogień jest zabroniony.",
    image: "/extras/led-swiece.jpg",
    price: 80,
    unitLabel: "zestaw",
    icon: "🕯️",
    contents: [
      "12 świec LED różnej wysokości",
      "Baterie w zestawie",
      "Pilot do sterowania",
      "Tryb migotania płomienia",
    ],
  },
  {
    id: "naczynia-podgrzewacze",
    name: "Podgrzewacze na naczynia",
    description: "Utrzymaj potrawy ciepłe przez całe wydarzenie",
    longDescription: "Profesjonalne podgrzewacze bufetowe ze świecami podgrzewającymi. Utrzymują idealną temperaturę dań przez wiele godzin. Niezbędne przy daniach gorących.",
    image: "/extras/podgrzewacze.jpg",
    price: 120,
    unitLabel: "zestaw",
    icon: "🔥",
    contents: [
      "6 podgrzewaczy stalowych",
      "Świece podgrzewające (4h)",
      "Pokrywki szklane",
      "Podstawki ochronne",
    ],
  },
  {
    id: "odbiorcatering",
    name: "Odbiór resztek",
    description: "Przyjdziemy i zabierzemy wszystko po imprezie",
    longDescription: "Po zakończeniu wydarzenia przyjedziemy i zabierzemy wszystkie naczynia, resztki jedzenia i śmieci. Ty cieszysz się imprezą, a my zajmiemy się sprzątaniem!",
    image: "/extras/odbior.jpg",
    price: 100,
    unitLabel: "event",
    icon: "🚚",
    contents: [
      "Odbiór naczyń i zastawy",
      "Zabierzenie resztek jedzenia",
      "Podstawowe sprzątanie stołów",
      "Wywóz śmieci cateringowych",
    ],
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
