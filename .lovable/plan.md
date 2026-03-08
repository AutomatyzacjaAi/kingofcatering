

## Problem

Na desktopie modal ma `md:rounded-2xl`, ale zdjecia hero wewnatrz (`img` w `SimpleProductContent`, `ExpandableProductContent`, `ConfigurableProductContent`) nie maja zaokraglonych gornych rogow — przez co kwadratowy obraz "odstaje" od zaokraglonego modala. Ten sam problem na dole — przycisk "Dodaj" w kontenerze bez zaokraglonych dolnych rogow.

## Rozwiazanie

1. **Zdjecia hero** — dodac `md:rounded-t-2xl` do wszystkich trzech `<img>` w `ProductModal.tsx` (linie ok. 101, 157, 237) oraz do ich wrappera `<div className="relative">`.

2. **Dolny pasek z przyciskiem "Dodaj"** — dodac `md:rounded-b-2xl` do `<div className="p-4 border-t ...">` (linia ok. 85).

To 4 drobne zmiany CSS w jednym pliku, bez zmian logiki.

