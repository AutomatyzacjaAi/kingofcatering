
## Zmiany w kalendarzu - pełna szerokość, bez ramki

### Co zmieniam

Kalendarz w `FullscreenDateTimePicker.tsx` będzie wyglądał jak integralna część ekranu zamiast "wklejonego" elementu.

### Szczegóły techniczne

**Plik: `src/components/catering/FullscreenDateTimePicker.tsx`**

1. **Usunięcie kontenera centrującego** (linia 106):
   - Zmiana z `<div className="flex justify-center p-4">` na `<div className="px-4 py-2">`

2. **Usunięcie ramki i zaokrągleń z kalendarza** (linia 121):
   - Zmiana z `className="rounded-lg border p-3 pointer-events-auto"` na `className="w-full pointer-events-auto"`

3. **Rozciągnięcie komórek na całą szerokość**:
   - `head_cell`: zmiana z `w-10` na `flex-1 text-center`
   - `cell`: zmiana z `h-10 w-10` na `h-12 flex-1`
   - `day`: zmiana z `h-10 w-10` na `h-12 w-full`
   - `row`: dodanie `justify-between`

Kalendarz wypełni całą szerokość ekranu, dni będą równomiernie rozłożone, a całość będzie wyglądać jak natywna część interfejsu.
