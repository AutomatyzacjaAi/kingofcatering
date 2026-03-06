export interface ClientData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneAlt: string;
  // Company
  companyName: string;
  nip: string;
  companyAddress: string;
  companyCity: string;
  companyPostalCode: string;
  // Personal address
  address: string;
  city: string;
  postalCode: string;
  // Meta
  notes: string;
  orders: number;
  totalSpent: string;
  lastOrder: string;
  createdAt: string;
}

export interface ClientOrder {
  id: string;
  date: string;
  event: string;
  amount: string;
  status: string;
}

export const mockClients: ClientData[] = [
  {
    id: "1", firstName: "Anna", lastName: "Kowalska", email: "anna.k@email.pl",
    phone: "+48 500 100 200", phoneAlt: "+48 500 100 201",
    companyName: "Kowalska Events Sp. z o.o.", nip: "5271234567",
    companyAddress: "ul. Marszałkowska 10/5", companyCity: "Warszawa", companyPostalCode: "00-624",
    address: "ul. Kwiatowa 15/3", city: "Warszawa", postalCode: "00-001",
    notes: "Preferuje kontakt mailowy. Stała klientka.",
    orders: 5, totalSpent: "8 420,00 zł", lastOrder: "28 sty 2026", createdAt: "15 mar 2025",
  },
  {
    id: "2", firstName: "Jan", lastName: "Nowak", email: "jan.nowak@email.pl",
    phone: "+48 600 300 400", phoneAlt: "",
    companyName: "", nip: "", companyAddress: "", companyCity: "", companyPostalCode: "",
    address: "ul. Ogrodowa 8", city: "Kraków", postalCode: "30-001",
    notes: "", orders: 2, totalSpent: "1 200,00 zł", lastOrder: "21 sty 2026", createdAt: "10 gru 2025",
  },
  {
    id: "3", firstName: "Maria", lastName: "Wiśniewska", email: "maria.w@email.pl",
    phone: "+48 700 500 600", phoneAlt: "+48 700 500 601",
    companyName: "Wiśniewska Catering & Events", nip: "6781234567",
    companyAddress: "ul. Długa 22", companyCity: "Gdańsk", companyPostalCode: "80-001",
    address: "ul. Morska 5/12", city: "Gdańsk", postalCode: "80-200",
    notes: "Duże zamówienia firmowe. Faktura zawsze na firmę.",
    orders: 8, totalSpent: "22 350,00 zł", lastOrder: "28 sty 2026", createdAt: "02 sty 2025",
  },
  {
    id: "4", firstName: "Piotr", lastName: "Zieliński", email: "piotr.z@email.pl",
    phone: "+48 800 700 800", phoneAlt: "",
    companyName: "", nip: "", companyAddress: "", companyCity: "", companyPostalCode: "",
    address: "ul. Polna 3", city: "Wrocław", postalCode: "50-001",
    notes: "", orders: 1, totalSpent: "246,00 zł", lastOrder: "21 sty 2026", createdAt: "18 sty 2026",
  },
  {
    id: "5", firstName: "Katarzyna", lastName: "Wójcik", email: "k.wojcik@email.pl",
    phone: "+48 510 220 330", phoneAlt: "",
    companyName: "KW Solutions", nip: "9441234567",
    companyAddress: "ul. Biznesowa 44", companyCity: "Poznań", companyPostalCode: "60-001",
    address: "ul. Lipowa 9/2", city: "Poznań", postalCode: "60-100",
    notes: "Zamówienia na eventy firmowe, zazwyczaj 50+ osób.",
    orders: 3, totalSpent: "4 890,00 zł", lastOrder: "26 sty 2026", createdAt: "05 wrz 2025",
  },
  {
    id: "6", firstName: "Tomasz", lastName: "Kamiński", email: "t.kaminski@email.pl",
    phone: "+48 660 440 550", phoneAlt: "+48 660 440 551",
    companyName: "Kamiński Group S.A.", nip: "1131234567",
    companyAddress: "Al. Jerozolimskie 100", companyCity: "Warszawa", companyPostalCode: "00-807",
    address: "ul. Parkowa 18", city: "Warszawa", postalCode: "02-001",
    notes: "VIP klient. Zawsze duże zamówienia. Wymaga premium obsługi.",
    orders: 12, totalSpent: "45 200,00 zł", lastOrder: "13 sty 2026", createdAt: "20 cze 2024",
  },
];

export const mockClientOrders: Record<string, ClientOrder[]> = {
  "1": [
    { id: "ZAM-KOC8L7K", date: "28 sty 2026", event: "Urodziny", amount: "2 211,00 zł", status: "Nowe" },
    { id: "ZAM-KOC4X2M", date: "15 gru 2025", event: "Wigilia firmowa", amount: "3 100,00 zł", status: "Zrealizowane" },
    { id: "ZAM-KOC1P8N", date: "20 paź 2025", event: "", amount: "1 050,00 zł", status: "Zrealizowane" },
    { id: "ZAM-KOC9Y3K", date: "05 sie 2025", event: "Garden party", amount: "1 200,00 zł", status: "Zrealizowane" },
    { id: "ZAM-KOC2Z1L", date: "12 kwi 2025", event: "", amount: "859,00 zł", status: "Zrealizowane" },
  ],
  "2": [
    { id: "ZAM-KOC01SQ", date: "21 sty 2026", event: "", amount: "350,00 zł", status: "Potwierdzone" },
    { id: "ZAM-KOC7H4R", date: "10 gru 2025", event: "", amount: "850,00 zł", status: "Zrealizowane" },
  ],
  "3": [
    { id: "ZAM-KOC5CJA", date: "28 sty 2026", event: "Wesele", amount: "3 276,00 zł", status: "Zrealizowane" },
    { id: "ZAM-KOCX6J3", date: "13 sty 2026", event: "Impreza firmowa", amount: "14 970,00 zł", status: "Potwierdzone" },
    { id: "ZAM-KOC3UTX", date: "20 sty 2026", event: "Impreza firmowa", amount: "4 648,00 zł", status: "W realizacji" },
  ],
  "4": [
    { id: "ZAM-KOC1RA9", date: "21 sty 2026", event: "", amount: "246,00 zł", status: "Anulowane" },
  ],
  "5": [
    { id: "ZAM-KOC0MII", date: "26 sty 2026", event: "Stypa", amount: "402,00 zł", status: "Zrealizowane" },
    { id: "ZAM-KOCI715", date: "24 gru 2025", event: "Impreza firmowa", amount: "2 685,00 zł", status: "W realizacji" },
    { id: "ZAM-KOCI69E", date: "30 lis 2025", event: "Konferencja", amount: "1 803,00 zł", status: "Zrealizowane" },
  ],
  "6": [
    { id: "ZAM-KOCELA3", date: "13 sty 2026", event: "Gala", amount: "30 885,00 zł", status: "Potwierdzone" },
    { id: "ZAM-KOC6B2P", date: "28 gru 2025", event: "Impreza firmowa", amount: "8 200,00 zł", status: "Zrealizowane" },
    { id: "ZAM-KOC4D9Q", date: "15 lis 2025", event: "Konferencja", amount: "6 115,00 zł", status: "Zrealizowane" },
  ],
};
