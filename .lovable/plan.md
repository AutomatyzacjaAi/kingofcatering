

# Strefy dostaw z cennikiem

## Obecny stan
- Formularz kontaktowy (`ContactForm.tsx`) zbiera adres dostawy (miasto, ulica, numer), ale **nie ma żadnego systemu stref dostaw ani cennika** — koszt dostawy nie jest nigdzie liczony.
- W bazie danych nie istnieje tabela stref dostaw.

## Plan implementacji

### 1. Nowa tabela `delivery_zones` w bazie danych
Kolumny:
- `id` (uuid, PK)
- `name` (text) — np. "Kraków centrum", "Kraków obrzeża", "Okolice Krakowa"
- `description` (text) — opis strefy
- `cities` (text[]) — lista miast/dzielnic należących do strefy
- `postal_codes` (text[]) — opcjonalnie kody pocztowe
- `price` (numeric) — cena dostawy w zł
- `free_delivery_above` (numeric, nullable) — próg darmowej dostawy
- `min_order_value` (numeric, nullable) — minimalna wartość zamówienia w tej strefie
- `is_active` (boolean, default true)
- `sort_order` (integer)
- `created_at`, `updated_at`

RLS: pełny dostęp (tak jak pozostałe tabele).

### 2. Panel admina — zarządzanie strefami dostaw
Nowy widok `SettingsDeliveryView.tsx` w sekcji ustawień admina:
- Lista stref z możliwością dodawania, edycji, usuwania
- Pola: nazwa, lista miast (tagi), kody pocztowe, cena dostawy, próg darmowej dostawy, min. wartość zamówienia
- Przycisk aktywacji/deaktywacji strefy

### 3. Formularz zamówienia — wybór strefy dostawy
W `ContactForm.tsx`:
- Po wpisaniu miasta (lub kodu pocztowego) — automatyczne dopasowanie strefy dostawy
- Wyświetlenie ceny dostawy lub informacji "Darmowa dostawa powyżej X zł"
- Jeśli adres nie pasuje do żadnej strefy — komunikat "Skontaktuj się z nami w sprawie dostawy"

### 4. Integracja z kalkulacją ceny
- W `useCateringOrder.ts` dodanie pola `deliveryZoneId` i `deliveryPrice`
- W `OrderSummary.tsx` — wyświetlenie kosztu dostawy jako osobnej pozycji
- W `submitOrder.ts` — zapis strefy dostawy i kosztu w zamówieniu

### 5. Kolumny w tabeli `orders`
Migracja dodająca:
- `delivery_zone_id` (uuid, nullable, FK → delivery_zones)
- `delivery_cost` (numeric, default 0)

### 6. Sidebar admina
Dodanie pozycji "Strefy dostaw" w menu ustawień (ikona `Truck`).

### Kolejność prac
1. Migracja bazy (tabela + kolumny w orders)
2. `SettingsDeliveryView.tsx` w adminie
3. Integracja w formularzu klienta (ContactForm + useCateringOrder)
4. Wyświetlenie w podsumowaniu i zapis do zamówienia

