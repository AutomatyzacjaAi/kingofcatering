import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";

const fmtNum = (n: number) => n.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export interface PdfOrder {
  id: string;
  client: string;
  email: string;
  phone: string;
  event: string;
  date: string;
  deliveryAddress: string;
  amount: string;
  amountNum: number;
  notes: string;
  deliveryCost: number;
  guestCount: number;
  discount?: number;
  items: {
    name: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    total: number;
    type?: string;
    foodCostPerUnit?: number;
    subItems?: { name: string; quantity: number; unit: string; foodCostPerUnit?: number }[];
  }[];
}

// ===== Font loading =====
let fontBase64: string | null = null;
let fontBoldBase64: string | null = null;

async function loadFont(): Promise<string> {
  if (fontBase64) return fontBase64;
  const response = await fetch("/fonts/Roboto-Regular.ttf");
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  fontBase64 = btoa(binary);
  return fontBase64;
}

// ===== Logo loading =====
let cachedLogoData: { base64: string; width: number; height: number; format: string } | null = null;
let logoFetched = false;

async function loadLogo(): Promise<typeof cachedLogoData> {
  if (logoFetched) return cachedLogoData;
  logoFetched = true;

  try {
    const { data } = await supabase.from("company_settings").select("logo_url").limit(1).single();
    const logoUrl = (data as any)?.logo_url;
    if (!logoUrl) return null;

    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = logoUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1];

    cachedLogoData = {
      base64,
      width: img.naturalWidth,
      height: img.naturalHeight,
      format: "PNG",
    };
    return cachedLogoData;
  } catch {
    return null;
  }
}

async function setupDoc(title: string): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const base64 = await loadFont();
  doc.addFileToVFS("Roboto-Regular.ttf", base64);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.setFont("Roboto", "normal");
  return doc;
}

// ===== NEW STYLE: Black & white, bold header with thick underline, logo top-right =====
const PAGE_LEFT = 14;
const PAGE_RIGHT = 196;
const PAGE_WIDTH = PAGE_RIGHT - PAGE_LEFT;

const addLogo = async (doc: jsPDF) => {
  const logo = await loadLogo();
  if (!logo) return;

  const maxH = 14;
  const maxW = 40;
  const ratio = logo.width / logo.height;
  let w = maxW;
  let h = w / ratio;
  if (h > maxH) { h = maxH; w = h * ratio; }

  doc.addImage(logo.base64, logo.format, PAGE_RIGHT - w, 8, w, h);
};

const addStyledHeader = async (doc: jsPDF, title: string) => {
  await addLogo(doc);

  doc.setFontSize(16);
  doc.setFont("Roboto", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(title.toUpperCase(), PAGE_LEFT, 18);

  // Thick black underline
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1.2);
  doc.line(PAGE_LEFT, 21, PAGE_RIGHT, 21);
  doc.setLineWidth(0.2);
};

type InfoLine = { label: string; value: string };

const addInfoBlock = (doc: jsPDF, lines: InfoLine[], startY: number): number => {
  let y = startY;
  // Black left border
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1.5);
  const blockHeight = lines.length * 5.5;
  doc.line(PAGE_LEFT, y - 1, PAGE_LEFT, y + blockHeight - 2);
  doc.setLineWidth(0.2);

  doc.setFontSize(9);
  lines.forEach(line => {
    doc.setFont("Roboto", "normal");
    doc.setTextColor(0, 0, 0);
    const labelW = doc.getTextWidth(line.label + ": ");
    doc.text(line.label.toUpperCase() + ": ", PAGE_LEFT + 5, y);
    doc.text(line.value.toUpperCase(), PAGE_LEFT + 5 + labelW, y);
    y += 5.5;
  });
  return y + 2;
};

const addFooterDate = (doc: jsPDF, y: number) => {
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const today = new Date().toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
  doc.text(`Dokument wygenerowany dnia ${today}`, PAGE_LEFT, y);
  doc.setTextColor(0, 0, 0);
};

const TABLE_STYLES = {
  styles: { fontSize: 9, cellPadding: 3.5, font: "Roboto" as const, textColor: [0, 0, 0] as [number, number, number], lineColor: [0, 0, 0] as [number, number, number], lineWidth: 0.3 },
  headStyles: { fillColor: [255, 255, 255] as [number, number, number], textColor: [0, 0, 0] as [number, number, number], fontStyle: "bold" as const, lineWidth: 0.3, lineColor: [0, 0, 0] as [number, number, number] },
  footStyles: { fillColor: [255, 255, 255] as [number, number, number], textColor: [0, 0, 0] as [number, number, number], fontStyle: "bold" as const, fontSize: 11, lineColor: [0, 0, 0] as [number, number, number], lineWidth: 0.3 },
  theme: "grid" as const,
};

const getTableFinalY = (doc: jsPDF, fallback: number): number => {
  return (doc as any).lastAutoTable?.finalY || fallback;
};

const EXTRA_TYPES = new Set(["extra", "service", "waiter", "packaging"]);

const splitItems = (items: PdfOrder["items"]) => {
  const products = items.filter(i => !EXTRA_TYPES.has(i.type || ""));
  const extras = items.filter(i => EXTRA_TYPES.has(i.type || ""));
  return { products, extras };
};

const ORDER_COL_STYLES = {
  0: { cellWidth: 80 },
  1: { halign: "center" as const, cellWidth: 25 },
  2: { halign: "right" as const, cellWidth: 35 },
  3: { halign: "right" as const, cellWidth: 40 },
};

const toRow = (item: PdfOrder["items"][0]) => [
  item.name.toUpperCase(),
  String(item.quantity),
  `${fmtNum(item.pricePerUnit)} PLN`,
  `${fmtNum(item.total)} PLN`,
];

const renderOrderTables = (
  doc: jsPDF, order: PdfOrder, startY: number,
): number => {
  const { products, extras } = splitItems(order.items);
  let y = startY;

  // Products table
  if (products.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["PRODUKT", "ILOŚĆ", "CENA JEDN.", "WARTOŚĆ NETTO"]],
      body: products.map(toRow),
      ...TABLE_STYLES,
      columnStyles: ORDER_COL_STYLES,
    });
    y = getTableFinalY(doc, y + 30) + 4;
  }

  // Extras table
  if (extras.length > 0) {
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("DODATKI I USŁUGI", PAGE_LEFT, y + 2);
    doc.setTextColor(0, 0, 0);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [["DODATEK / USŁUGA", "ILOŚĆ", "CENA JEDN.", "WARTOŚĆ NETTO"]],
      body: extras.map(toRow),
      ...TABLE_STYLES,
      columnStyles: ORDER_COL_STYLES,
    });
    y = getTableFinalY(doc, y + 30) + 4;
  }

  // Delivery + discount + total
  const footerRows: string[][] = [];
  if (order.deliveryCost > 0) {
    footerRows.push(["OPŁATA TRANSPORTOWA", "1", `${fmtNum(order.deliveryCost)} PLN`, `${fmtNum(order.deliveryCost)} PLN`]);
  }
  if (order.discount && order.discount > 0) {
    footerRows.push(["RABAT", "", "", `-${fmtNum(order.discount)} PLN`]);
  }

  if (footerRows.length > 0) {
    autoTable(doc, {
      startY: y,
      body: footerRows,
      foot: [["", "", "RAZEM DO ZAPŁATY:", order.amount]],
      ...TABLE_STYLES,
      columnStyles: ORDER_COL_STYLES,
      didParseCell: (data: any) => {
        if (data.section === "foot") {
          data.cell.styles.lineWidth = { top: 0.8, right: 0.3, bottom: 0.3, left: 0.3 };
        }
      },
    });
    y = getTableFinalY(doc, y + 20) + 4;
  } else {
    // Just total line
    autoTable(doc, {
      startY: y,
      body: [],
      foot: [["", "", "RAZEM DO ZAPŁATY:", order.amount]],
      ...TABLE_STYLES,
      columnStyles: ORDER_COL_STYLES,
      didParseCell: (data: any) => {
        if (data.section === "foot") {
          data.cell.styles.lineWidth = { top: 0.8, right: 0.3, bottom: 0.3, left: 0.3 };
        }
      },
    });
    y = getTableFinalY(doc, y + 10) + 4;
  }

  return y;
};

// ===== SINGLE ORDER OFFER PDF =====
export async function generateOfferPdf(order: PdfOrder, companyName?: string) {
  const doc = await setupDoc("Oferta");
  await addStyledHeader(doc, `Podsumowanie kosztów - ${order.event || "Wydarzenie"} ${order.date}`);

  const infoLines: InfoLine[] = [
    { label: "Klient", value: order.client },
  ];
  if (order.deliveryAddress) infoLines.push({ label: "Miejsce", value: order.deliveryAddress });
  if (order.guestCount > 0) infoLines.push({ label: "Łączna liczba osób", value: String(order.guestCount) });
  if (order.notes) infoLines.push({ label: "Uwagi", value: order.notes });

  let y = addInfoBlock(doc, infoLines, 28);

  const finalY = renderOrderTables(doc, order, y);

  if (order.guestCount > 0) {
    const pricePerPerson = order.amountNum / order.guestCount;
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Cena na osobę: ${fmtNum(pricePerPerson)} PLN`, PAGE_LEFT, finalY + 6);
    doc.setTextColor(0, 0, 0);
  }

  addFooterDate(doc, finalY + 14);
  doc.save(`oferta_${order.id}.pdf`);
}

// ===== SINGLE ORDER SHOPPING LIST PDF =====
export async function generateShoppingListPdf(order: PdfOrder) {
  const doc = await setupDoc("Lista zakupów");
  await addStyledHeader(doc, `Lista zakupów - ${order.id}`);

  const infoLines: InfoLine[] = [
    { label: "Klient", value: order.client },
    { label: "Data", value: order.date },
  ];
  let y = addInfoBlock(doc, infoLines, 28);

  const ingredientMap: Record<string, { name: string; totalQty: number; unit: string }> = {};
  order.items.forEach(item => {
    if (item.subItems) {
      item.subItems.forEach(sub => {
        const key = `${sub.name}__${sub.unit}`;
        if (!ingredientMap[key]) ingredientMap[key] = { name: sub.name, totalQty: 0, unit: sub.unit };
        ingredientMap[key].totalQty += sub.quantity;
      });
    }
  });
  const ingredients = Object.values(ingredientMap).sort((a, b) => a.name.localeCompare(b.name, "pl"));

  if (ingredients.length === 0) {
    doc.setFontSize(10);
    doc.text("Brak danych o składnikach dla tego zamówienia.", PAGE_LEFT, y + 5);
    doc.save(`lista_zakupow_${order.id}.pdf`);
    return;
  }

  autoTable(doc, {
    startY: y,
    head: [["SKŁADNIK", "ILOŚĆ", "JEDNOSTKA"]],
    body: ingredients.map(i => [i.name.toUpperCase(), fmtNum(i.totalQty), i.unit]),
    ...TABLE_STYLES,
  });

  addFooterDate(doc, getTableFinalY(doc, y + 40) + 10);
  doc.save(`lista_zakupow_${order.id}.pdf`);
}

export interface FoodCostExtra {
  id: string;
  name: string;
  amount: number;
}

// ===== SINGLE ORDER FOOD COST PDF =====
export async function generateFoodCostPdf(order: PdfOrder, extras?: FoodCostExtra[]) {
  const doc = await setupDoc("Food cost");
  await addStyledHeader(doc, `Food cost - ${order.id}`);

  const infoLines: InfoLine[] = [
    { label: "Klient", value: order.client },
    { label: "Data", value: order.date },
  ];
  let y = addInfoBlock(doc, infoLines, 28);

  const items = order.items
    .filter(i => i.type !== "service" && i.type !== "waiter" && i.foodCostPerUnit)
    .map(item => {
      const totalFC = item.foodCostPerUnit! * item.quantity;
      const margin = item.total > 0 ? ((item.total - totalFC) / item.total) * 100 : 0;
      return {
        name: item.name, quantity: item.quantity, unit: item.unit,
        fcPerUnit: item.foodCostPerUnit!, totalFC, revenue: item.total, margin,
      };
    });

  const rows = items.map(i => [
    i.name.toUpperCase(), `${i.quantity} ${i.unit}`,
    `${fmtNum(i.fcPerUnit)} PLN`, `${fmtNum(i.totalFC)} PLN`,
    `${fmtNum(i.revenue)} PLN`, `${i.margin.toFixed(1)}%`,
  ]);

  const safeExtras = extras || [];
  safeExtras.forEach(e => {
    rows.push([`⊕ ${e.name.toUpperCase()}`, "—", "—", `${fmtNum(e.amount)} PLN`, "—", "—"]);
  });

  const extrasTotal = safeExtras.reduce((s, e) => s + e.amount, 0);
  const totalFC = items.reduce((s, i) => s + i.totalFC, 0) + extrasTotal;
  const totalRev = items.reduce((s, i) => s + i.revenue, 0);
  const totalMargin = totalRev > 0 ? ((totalRev - totalFC) / totalRev) * 100 : 0;

  autoTable(doc, {
    startY: y,
    head: [["PRODUKT", "ILOŚĆ", "FC/JEDN.", "FC ŁĄCZNIE", "PRZYCHÓD", "MARŻA"]],
    body: rows,
    foot: [["SUMA", "", "", `${fmtNum(totalFC)} PLN`, `${fmtNum(totalRev)} PLN`, `${totalMargin.toFixed(1)}%`]],
    ...TABLE_STYLES,
    styles: { ...TABLE_STYLES.styles, fontSize: 8, cellPadding: 2.5 },
    headStyles: { ...TABLE_STYLES.headStyles, fontSize: 8 },
    columnStyles: {
      2: { halign: "right" as const }, 3: { halign: "right" as const },
      4: { halign: "right" as const }, 5: { halign: "right" as const },
    },
  });

  addFooterDate(doc, getTableFinalY(doc, y + 40) + 10);
  doc.save(`food_cost_${order.id}.pdf`);
}

// ===== SINGLE ORDER KITCHEN BREAKDOWN PDF =====
export async function generateKitchenPdf(order: PdfOrder) {
  const doc = await setupDoc("Rozpiska na kuchnię");
  await addStyledHeader(doc, `Rozpiska na kuchnię - ${order.id}`);

  const infoLines: InfoLine[] = [
    { label: "Klient", value: order.client },
    { label: "Data", value: order.date },
    { label: "Gości", value: String(order.guestCount) },
  ];
  let y = addInfoBlock(doc, infoLines, 28);

  type DishEntry = { name: string; totalQty: number; unit: string; source: string };
  const dishMap: Record<string, DishEntry> = {};
  order.items.forEach(item => {
    if (item.type === "service" || item.type === "waiter" || item.type === "extra" || item.type === "packaging") return;
    if ((item.type === "configurable" || item.type === "bundle") && item.subItems) {
      item.subItems.forEach(sub => {
        const key = sub.name;
        if (!dishMap[key]) dishMap[key] = { name: sub.name, totalQty: 0, unit: sub.unit, source: item.name };
        dishMap[key].totalQty += sub.quantity;
      });
    } else {
      const key = item.name;
      if (!dishMap[key]) dishMap[key] = { name: item.name, totalQty: 0, unit: item.unit, source: "" };
      dishMap[key].totalQty += item.quantity;
    }
  });
  const dishes = Object.values(dishMap).sort((a, b) => a.name.localeCompare(b.name, "pl"));

  autoTable(doc, {
    startY: y,
    head: [["DANIE", "ILOŚĆ", "ŹRÓDŁO"]],
    body: dishes.map(d => [d.name.toUpperCase(), `${d.totalQty} ${d.unit}`, d.source || "-"]),
    ...TABLE_STYLES,
  });

  addFooterDate(doc, getTableFinalY(doc, y + 40) + 10);
  doc.save(`kuchnia_${order.id}.pdf`);
}

// ===== HELPERS FOR GROUPING BY DATE =====
const parseDateForGrouping = (dateStr: string): string => {
  const dayNames = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];
  const months: Record<string, number> = {
    "sty": 0, "lut": 1, "mar": 2, "kwi": 3, "maj": 4, "cze": 5,
    "lip": 6, "sie": 7, "wrz": 8, "paź": 9, "lis": 10, "gru": 11,
  };
  const parts = dateStr.trim().split(" ");
  if (parts.length !== 3) return dateStr;
  const day = parseInt(parts[0]);
  const month = months[parts[1]];
  const year = parseInt(parts[2]);
  if (isNaN(day) || month === undefined || isNaN(year)) return dateStr;
  const d = new Date(year, month, day);
  return `${dayNames[d.getDay()]}, ${dateStr}`;
};

const groupOrdersByDate = (orders: PdfOrder[]): Map<string, PdfOrder[]> => {
  const map = new Map<string, PdfOrder[]>();
  orders.forEach(o => {
    const key = o.date || "Brak daty";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(o);
  });
  const sorted = new Map([...map.entries()].sort((a, b) => {
    const da = a[1][0]?.date || "";
    const db = b[1][0]?.date || "";
    return da.localeCompare(db);
  }));
  return sorted;
};

// ===== Day header in summary docs =====
const addDayHeader = (doc: jsPDF, label: string, extra: string, y: number): number => {
  doc.setFontSize(11);
  doc.setFont("Roboto", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`${label}  —  ${extra}`.toUpperCase(), PAGE_LEFT, y);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(PAGE_LEFT, y + 1.5, PAGE_RIGHT, y + 1.5);
  doc.setLineWidth(0.2);
  return y + 4;
};

// ===== SUMMARY PDF (multiple orders) =====
export type SummaryDocType = "zamowienia" | "lista-zakupow" | "lista-dan" | "food-cost";

export async function generateSummaryPdf(orders: PdfOrder[], docType: SummaryDocType, dateRange?: string) {
  const doc = await setupDoc("Podsumowanie");
  const totalAmount = fmtNum(orders.reduce((s, o) => s + o.amountNum, 0));
  const grouped = groupOrdersByDate(orders);

  const titleMap: Record<SummaryDocType, string> = {
    "zamowienia": "Lista zamówień",
    "lista-zakupow": "Lista zakupów - podsumowanie",
    "lista-dan": "Lista dań - podsumowanie",
    "food-cost": "Food cost - podsumowanie",
  };

  await addStyledHeader(doc, titleMap[docType]);

  const infoLines: InfoLine[] = [];
  if (dateRange) infoLines.push({ label: "Okres", value: dateRange });
  infoLines.push({ label: "Zamówień", value: String(orders.length) });
  infoLines.push({ label: "Łączna kwota", value: `${totalAmount} PLN` });

  let y = addInfoBlock(doc, infoLines, 28);

  const checkPage = (doc: jsPDF, currentY: number, needed: number = 40): number => {
    if (currentY > 260) { doc.addPage(); return 20; }
    return currentY;
  };

  if (docType === "zamowienia") {
    for (const [date, dateOrders] of grouped) {
      const dayLabel = parseDateForGrouping(date);
      const dayTotal = fmtNum(dateOrders.reduce((s, o) => s + o.amountNum, 0));

      y = checkPage(doc, y);
      y = addDayHeader(doc, dayLabel, `${dateOrders.length} zam. / ${dayTotal} PLN`, y);

      autoTable(doc, {
        startY: y,
        head: [["NR", "KLIENT", "WYDARZENIE", "KWOTA", "GOŚCI", "ADRES"]],
        body: dateOrders.map(o => [
          o.id, o.client.toUpperCase(), (o.event || "-").toUpperCase(), o.amount,
          o.guestCount > 0 ? String(o.guestCount) : "-",
          o.deliveryAddress || "-",
        ]),
        ...TABLE_STYLES,
        styles: { ...TABLE_STYLES.styles, fontSize: 8, cellPadding: 2.5 },
      });
      y = getTableFinalY(doc, y + 30) + 8;
    }

    // Detail pages per order
    orders.forEach(order => {
      doc.addPage();
      // Re-add logo on each new page
      addLogo(doc);

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`ZAMÓWIENIE ${order.id}`.toUpperCase(), PAGE_LEFT, 18);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1.2);
      doc.line(PAGE_LEFT, 21, PAGE_RIGHT, 21);
      doc.setLineWidth(0.2);

      const info: InfoLine[] = [
        { label: "Klient", value: order.client },
        { label: "Wydarzenie", value: order.event || "-" },
        { label: "Data", value: order.date },
      ];
      if (order.deliveryAddress) info.push({ label: "Adres", value: order.deliveryAddress });
      if (order.guestCount > 0) info.push({ label: "Gości", value: String(order.guestCount) });
      if (order.notes) info.push({ label: "Uwagi", value: order.notes });

      let y2 = addInfoBlock(doc, info, 28);

      const detailFinalY = renderOrderTables(doc, order, y2);
      addFooterDate(doc, detailFinalY + 6);
    });

  } else if (docType === "lista-zakupow") {
    for (const [date, dateOrders] of grouped) {
      const dayLabel = parseDateForGrouping(date);
      const ingredientMap: Record<string, { name: string; totalQty: number; unit: string }> = {};
      dateOrders.forEach(o => {
        o.items.forEach(item => {
          if (item.subItems) {
            item.subItems.forEach(sub => {
              const key = `${sub.name}__${sub.unit}`;
              if (!ingredientMap[key]) ingredientMap[key] = { name: sub.name, totalQty: 0, unit: sub.unit };
              ingredientMap[key].totalQty += sub.quantity;
            });
          }
        });
      });
      const ingredients = Object.values(ingredientMap).sort((a, b) => a.name.localeCompare(b.name, "pl"));
      if (ingredients.length === 0) continue;

      y = checkPage(doc, y);
      y = addDayHeader(doc, dayLabel, `${dateOrders.length} zam.`, y);

      autoTable(doc, {
        startY: y,
        head: [["SKŁADNIK", "ILOŚĆ", "JEDNOSTKA"]],
        body: ingredients.map(i => [i.name.toUpperCase(), fmtNum(i.totalQty), i.unit]),
        ...TABLE_STYLES,
      });
      y = getTableFinalY(doc, y + 30) + 8;
    }

  } else if (docType === "lista-dan") {
    for (const [date, dateOrders] of grouped) {
      const dayLabel = parseDateForGrouping(date);
      type DishEntry = { name: string; totalQty: number; unit: string; source: string };
      const dishMap: Record<string, DishEntry> = {};
      dateOrders.forEach(o => {
        o.items.forEach(item => {
          if (item.type === "service" || item.type === "waiter" || item.type === "extra" || item.type === "packaging") return;
          if ((item.type === "configurable" || item.type === "bundle") && item.subItems) {
            item.subItems.forEach(sub => {
              const key = `${sub.name}__dish`;
              if (!dishMap[key]) dishMap[key] = { name: sub.name, totalQty: 0, unit: sub.unit, source: item.name };
              dishMap[key].totalQty += sub.quantity;
            });
          } else {
            const key = `${item.name}__dish`;
            if (!dishMap[key]) dishMap[key] = { name: item.name, totalQty: 0, unit: item.unit, source: "" };
            dishMap[key].totalQty += item.quantity;
          }
        });
      });
      const dishes = Object.values(dishMap).sort((a, b) => a.name.localeCompare(b.name, "pl"));
      if (dishes.length === 0) continue;

      y = checkPage(doc, y);
      y = addDayHeader(doc, dayLabel, `${dateOrders.length} zam. / ${dateOrders.reduce((s, o) => s + o.guestCount, 0)} gości`, y);

      autoTable(doc, {
        startY: y,
        head: [["DANIE", "ILOŚĆ", "JEDNOSTKA", "ŹRÓDŁO"]],
        body: dishes.map(d => [d.name.toUpperCase(), String(d.totalQty), d.unit, d.source || "-"]),
        ...TABLE_STYLES,
      });
      y = getTableFinalY(doc, y + 30) + 8;
    }

  } else if (docType === "food-cost") {
    let grandFC = 0, grandRev = 0;

    for (const [date, dateOrders] of grouped) {
      const dayLabel = parseDateForGrouping(date);
      const rows: string[][] = [];
      let dayFC = 0, dayRev = 0;

      dateOrders.forEach(o => {
        o.items.forEach(item => {
          if (item.type === "service" || item.type === "waiter" || !item.foodCostPerUnit) return;
          const totalFC = item.foodCostPerUnit * item.quantity;
          const margin = item.total > 0 ? ((item.total - totalFC) / item.total) * 100 : 0;
          rows.push([
            o.id, item.name.toUpperCase(), `${item.quantity} ${item.unit}`,
            `${fmtNum(item.foodCostPerUnit)} PLN`, `${fmtNum(totalFC)} PLN`,
            `${fmtNum(item.total)} PLN`, `${margin.toFixed(1)}%`,
          ]);
          dayFC += totalFC;
          dayRev += item.total;
        });
      });

      if (rows.length === 0) continue;
      grandFC += dayFC;
      grandRev += dayRev;
      const dayMargin = dayRev > 0 ? ((dayRev - dayFC) / dayRev) * 100 : 0;

      y = checkPage(doc, y);
      y = addDayHeader(doc, dayLabel, `FC: ${fmtNum(dayFC)} PLN / Marża: ${dayMargin.toFixed(1)}%`, y);

      autoTable(doc, {
        startY: y,
        head: [["ZAMÓWIENIE", "PRODUKT", "ILOŚĆ", "FC/JEDN.", "FC ŁĄCZNIE", "PRZYCHÓD", "MARŻA"]],
        body: rows,
        ...TABLE_STYLES,
        styles: { ...TABLE_STYLES.styles, fontSize: 7, cellPadding: 2 },
        headStyles: { ...TABLE_STYLES.headStyles, fontSize: 7 },
        columnStyles: { 3: { halign: "right" as const }, 4: { halign: "right" as const }, 5: { halign: "right" as const }, 6: { halign: "right" as const } },
      });
      y = getTableFinalY(doc, y + 30) + 8;
    }

    // Grand total
    y = checkPage(doc, y);
    const grandMargin = grandRev > 0 ? ((grandRev - grandFC) / grandRev) * 100 : 0;
    doc.setFontSize(11);
    doc.setFont("Roboto", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`SUMA: FOOD COST ${fmtNum(grandFC)} PLN | PRZYCHÓD ${fmtNum(grandRev)} PLN | MARŻA ${grandMargin.toFixed(1)}%`, PAGE_LEFT, y);
  }

  addFooterDate(doc, Math.min(getTableFinalY(doc, y) + 10, 285));
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`podsumowanie_${docType}_${dateStr}.pdf`);
}
