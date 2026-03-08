import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const fmtNum = (n: number) => n.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface PdfOrder {
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

// Polish chars support - use built-in helvetica (no diacritics) or encode properly
const setupDoc = (title: string): jsPDF => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  return doc;
};

const addHeader = (doc: jsPDF, title: string, subtitle?: string) => {
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 20);
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(subtitle, 14, 28);
    doc.setTextColor(0, 0, 0);
  }
  doc.setDrawColor(200, 200, 200);
  doc.line(14, subtitle ? 32 : 26, 196, subtitle ? 32 : 26);
};

// ===== SINGLE ORDER OFFER PDF =====
export function generateOfferPdf(order: PdfOrder, companyName?: string) {
  const doc = setupDoc("Oferta");
  addHeader(doc, `Oferta ${order.id}`, `${order.client} | ${order.event || "Wydarzenie"} | ${order.date}`);

  let y = 38;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Adres dostawy: ${order.deliveryAddress}`, 14, y);
  y += 5;
  if (order.guestCount > 0) {
    doc.text(`Liczba gosci: ${order.guestCount}`, 14, y);
    y += 5;
  }
  if (order.notes) {
    doc.text(`Uwagi: ${order.notes}`, 14, y);
    y += 5;
  }
  y += 3;

  const rows = order.items.map(item => [
    item.name,
    `${item.quantity} ${item.unit}`,
    `${fmtNum(item.pricePerUnit)} zl`,
    `${fmtNum(item.total)} zl`,
  ]);

  if (order.deliveryCost > 0) {
    rows.push(["Dostawa", "1", `${fmtNum(order.deliveryCost)} zl`, `${fmtNum(order.deliveryCost)} zl`]);
  }

  autoTable(doc, {
    startY: y,
    head: [["Pozycja", "Ilosc", "Cena jedn.", "Razem"]],
    body: rows,
    foot: [["", "", "SUMA:", order.amount]],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [40, 40, 40], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: "bold", fontSize: 11 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: "center", cellWidth: 30 },
      2: { halign: "right", cellWidth: 35 },
      3: { halign: "right", cellWidth: 35 },
    },
    theme: "grid",
  });

  if (order.guestCount > 0) {
    const pricePerPerson = order.amountNum / order.guestCount;
    const finalY = (doc as any).lastAutoTable?.finalY || y + 40;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Cena na osobe: ${fmtNum(pricePerPerson)} zl`, 14, finalY + 8);
    doc.setTextColor(0, 0, 0);
  }

  doc.save(`oferta_${order.id}.pdf`);
}

// ===== SINGLE ORDER SHOPPING LIST PDF =====
export function generateShoppingListPdf(order: PdfOrder) {
  const doc = setupDoc("Lista zakupow");
  addHeader(doc, `Lista zakupow`, `${order.id} | ${order.client} | ${order.date}`);

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
    doc.text("Brak danych o skladnikach dla tego zamowienia.", 14, 40);
    doc.save(`lista_zakupow_${order.id}.pdf`);
    return;
  }

  autoTable(doc, {
    startY: 38,
    head: [["Skladnik", "Ilosc", "Jednostka"]],
    body: ingredients.map(i => [i.name, fmtNum(i.totalQty), i.unit]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [40, 40, 40], textColor: 255 },
    theme: "grid",
  });

  doc.save(`lista_zakupow_${order.id}.pdf`);
}

// ===== SINGLE ORDER FOOD COST PDF =====
export function generateFoodCostPdf(order: PdfOrder) {
  const doc = setupDoc("Food cost");
  addHeader(doc, `Food cost`, `${order.id} | ${order.client} | ${order.date}`);

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

  const totalFC = items.reduce((s, i) => s + i.totalFC, 0);
  const totalRev = items.reduce((s, i) => s + i.revenue, 0);
  const totalMargin = totalRev > 0 ? ((totalRev - totalFC) / totalRev) * 100 : 0;

  autoTable(doc, {
    startY: 38,
    head: [["Produkt", "Ilosc", "FC/jedn.", "FC lacznie", "Przychod", "Marza"]],
    body: items.map(i => [
      i.name, `${i.quantity} ${i.unit}`,
      `${fmtNum(i.fcPerUnit)} zl`, `${fmtNum(i.totalFC)} zl`,
      `${fmtNum(i.revenue)} zl`, `${i.margin.toFixed(1)}%`,
    ]),
    foot: [["SUMA", "", "", `${fmtNum(totalFC)} zl`, `${fmtNum(totalRev)} zl`, `${totalMargin.toFixed(1)}%`]],
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [40, 40, 40], textColor: 255, fontSize: 8 },
    footStyles: { fillColor: [245, 245, 245], fontStyle: "bold" },
    columnStyles: {
      2: { halign: "right" }, 3: { halign: "right" },
      4: { halign: "right" }, 5: { halign: "right" },
    },
    theme: "grid",
  });

  doc.save(`food_cost_${order.id}.pdf`);
}

// ===== SINGLE ORDER KITCHEN BREAKDOWN PDF =====
export function generateKitchenPdf(order: PdfOrder) {
  const doc = setupDoc("Rozpiska na kuchnie");
  addHeader(doc, `Rozpiska na kuchnie`, `${order.id} | ${order.client} | ${order.date}`);

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
    startY: 38,
    head: [["Danie", "Ilosc", "Zrodlo"]],
    body: dishes.map(d => [d.name, `${d.totalQty} ${d.unit}`, d.source || "-"]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [40, 40, 40], textColor: 255 },
    theme: "grid",
  });

  doc.save(`kuchnia_${order.id}.pdf`);
}

// ===== SUMMARY PDF (multiple orders) =====
export type SummaryDocType = "zamowienia" | "lista-zakupow" | "lista-dan" | "food-cost";

export function generateSummaryPdf(orders: PdfOrder[], docType: SummaryDocType, dateRange?: string) {
  const doc = setupDoc("Podsumowanie");
  const subtitle = `${dateRange || ""} | ${orders.length} zamowien | Laczna kwota: ${fmtNum(orders.reduce((s, o) => s + o.amountNum, 0))} zl`;

  if (docType === "zamowienia") {
    addHeader(doc, "Lista zamowien", subtitle);
    autoTable(doc, {
      startY: 38,
      head: [["Nr", "Klient", "Wydarzenie", "Data", "Kwota", "Status"]],
      body: orders.map(o => [o.id, o.client, o.event || "-", o.date, o.amount, ""]),
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [40, 40, 40], textColor: 255 },
      theme: "grid",
    });

    // Orders detail pages
    orders.forEach((order, idx) => {
      doc.addPage();
      addHeader(doc, `${order.id}`, `${order.client} | ${order.event || "Wydarzenie"} | ${order.date}`);

      let y = 38;
      doc.setFontSize(9);
      doc.text(`Adres: ${order.deliveryAddress}`, 14, y); y += 5;
      if (order.guestCount > 0) { doc.text(`Gosci: ${order.guestCount}`, 14, y); y += 5; }
      if (order.notes) { doc.text(`Uwagi: ${order.notes}`, 14, y); y += 5; }
      y += 3;

      const rows = order.items.map(item => [
        item.name, `${item.quantity} ${item.unit}`,
        `${fmtNum(item.pricePerUnit)} zl`, `${fmtNum(item.total)} zl`,
      ]);
      if (order.deliveryCost > 0) {
        rows.push(["Dostawa", "1", `${fmtNum(order.deliveryCost)} zl`, `${fmtNum(order.deliveryCost)} zl`]);
      }

      autoTable(doc, {
        startY: y,
        head: [["Pozycja", "Ilosc", "Cena jedn.", "Razem"]],
        body: rows,
        foot: [["", "", "SUMA:", order.amount]],
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [40, 40, 40], textColor: 255 },
        footStyles: { fillColor: [245, 245, 245], fontStyle: "bold" },
        columnStyles: { 2: { halign: "right" }, 3: { halign: "right" } },
        theme: "grid",
      });
    });
  } else if (docType === "lista-zakupow") {
    addHeader(doc, "Lista zakupow — podsumowanie", subtitle);
    const ingredientMap: Record<string, { name: string; totalQty: number; unit: string }> = {};
    orders.forEach(o => {
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

    autoTable(doc, {
      startY: 38,
      head: [["Skladnik", "Ilosc", "Jednostka"]],
      body: ingredients.map(i => [i.name, fmtNum(i.totalQty), i.unit]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [40, 40, 40], textColor: 255 },
      theme: "grid",
    });
  } else if (docType === "lista-dan") {
    addHeader(doc, "Lista dan — podsumowanie", subtitle);
    type DishEntry = { name: string; totalQty: number; unit: string; source: string };
    const dishMap: Record<string, DishEntry> = {};
    orders.forEach(o => {
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

    autoTable(doc, {
      startY: 38,
      head: [["Danie", "Ilosc", "Jednostka", "Zrodlo"]],
      body: dishes.map(d => [d.name, String(d.totalQty), d.unit, d.source || "-"]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [40, 40, 40], textColor: 255 },
      theme: "grid",
    });
  } else if (docType === "food-cost") {
    addHeader(doc, "Food cost — podsumowanie", subtitle);
    const rows: string[][] = [];
    let grandFC = 0, grandRev = 0;
    orders.forEach(o => {
      o.items.forEach(item => {
        if (item.type === "service" || item.type === "waiter" || !item.foodCostPerUnit) return;
        const totalFC = item.foodCostPerUnit * item.quantity;
        const margin = item.total > 0 ? ((item.total - totalFC) / item.total) * 100 : 0;
        rows.push([
          o.id, item.name, `${item.quantity} ${item.unit}`,
          `${fmtNum(item.foodCostPerUnit)} zl`, `${fmtNum(totalFC)} zl`,
          `${fmtNum(item.total)} zl`, `${margin.toFixed(1)}%`,
        ]);
        grandFC += totalFC;
        grandRev += item.total;
      });
    });
    const grandMargin = grandRev > 0 ? ((grandRev - grandFC) / grandRev) * 100 : 0;

    autoTable(doc, {
      startY: 38,
      head: [["Zamowienie", "Produkt", "Ilosc", "FC/jedn.", "FC lacznie", "Przychod", "Marza"]],
      body: rows,
      foot: [["SUMA", "", "", "", `${fmtNum(grandFC)} zl`, `${fmtNum(grandRev)} zl`, `${grandMargin.toFixed(1)}%`]],
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [40, 40, 40], textColor: 255, fontSize: 7 },
      footStyles: { fillColor: [245, 245, 245], fontStyle: "bold" },
      columnStyles: { 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" }, 6: { halign: "right" } },
      theme: "grid",
    });
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`podsumowanie_${docType}_${dateStr}.pdf`);
}
