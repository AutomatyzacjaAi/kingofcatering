

## Plan: Usunięcie przycisków "Kopiuj" i "Drukuj" z widoku zamówień

Dwie zmiany w `src/components/admin/OrdersView.tsx`:

1. **Lista zamówień (linia 2122-2127)** -- usunięcie dwóch przycisków ikon (Copy i Printer) z akcji przy każdym zamówieniu na liście.

2. **Widok szczegółów zamówienia (linia 348-351)** -- usunięcie przycisku "Drukuj" z nagłówka widoku szczegółów.

3. **Import** -- usunięcie `Copy` i `Printer` z importu lucide-react (jeśli nie są używane gdzie indziej).

