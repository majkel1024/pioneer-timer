# Pioneer Timer - Licznik godzin służby pioniera

[![Build and Deploy](https://github.com/majkel1024/pioneer-timer/actions/workflows/build-and-deploy.yml/badge.svg)](https://github.com/majkel1024/pioneer-timer/actions/workflows/build-and-deploy.yml)

Aplikacja Angular TypeScript do śledzenia godzin służby pioniera z trwałym przechowywaniem danych w przeglądarce.

## 🌐 Demo online

**[👉 Wypróbuj aplikację tutaj](https://majkel1024.github.io/pioneer-timer/)**

Aplikacja jest automatycznie aktualizowana i publikowana na GitHub Pages przy każdym commicie.

## ✨ Funkcjonalności

- **📝 Wprowadzanie godzin**: Dodawanie wpisów godzin służby z datą, typem i notatkami
- **📊 Statystyki**: Podgląd statystyk miesięcznych i rocznych z wykresami
- **⚙️ Ustawienia**: Konfiguracja celu godzinowego i typów godzin
- **💾 Trwałe przechowywanie**: Dane zapisywane lokalnie w IndexedDB przy użyciu Dexie.js
- **📤📥 Import/Export**: Możliwość kopii zapasowej i przywracania danych
- **📱 Responsywność**: Działa na urządzeniach mobilnych i desktopowych

## 🚀 Technologie

- **Angular 19** - Najnowszy framework frontendowy
- **TypeScript 5.6** - Typowany JavaScript
- **Dexie.js 4.0** - Zaawansowana biblioteka do zarządzania IndexedDB
- **SCSS** - Zaawansowane stylowanie
- **RxJS** - Reaktywne programowanie

## 🛠️ Instalacja i uruchomienie

### Wymagania
- Node.js (wersja 18 lub nowsza)
- npm

### Kroki instalacji

1. **Sklonuj repozytorium**:
   ```bash
   git clone https://github.com/majkel1024/pioneer-timer.git
   cd pioneer-timer
   ```

2. **Zainstaluj zależności**:
   ```bash
   npm install
   ```

3. **Uruchom aplikację w trybie developerskim**:
   ```bash
   npm start
   ```
   Aplikacja będzie dostępna pod adresem `http://localhost:4200`

4. **Zbuduj aplikację do produkcji**:
   ```bash
   npm run build
   ```
   Pliki produkcyjne znajdą się w folderze `dist/`

## 📋 Komendy NPM

- `npm start` - Uruchomienie serwera developerskiego
- `npm run build` - Budowanie aplikacji do produkcji
- `npm run build:gh-pages` - Budowanie dla GitHub Pages
- `npm run watch` - Budowanie z obserwowaniem zmian
- `npm test` - Uruchomienie testów jednostkowych
- `npm run lint` - Sprawdzenie jakości kodu

## � Deployment

### GitHub Pages (automatyczny)

Aplikacja jest automatycznie budowana i publikowana na GitHub Pages przy każdym push do głównej gałęzi:

1. **GitHub Actions** automatycznie uruchamia workflow
2. Kod jest budowany z `npm run build:gh-pages`
3. Artefakty są publikowane na GitHub Pages
4. Aplikacja dostępna pod adresem: `https://majkel1024.github.io/pioneer-timer/`

### Lokalny deployment

```bash
# Zbuduj aplikację dla GitHub Pages
npm run build:gh-pages

# Pliki gotowe do publikacji znajdą się w dist/pioneer-timer/
```

## �📁 Struktura projektu

```
src/
├── app/
│   ├── components/           # Komponenty UI
│   │   ├── input.component.ts
│   │   ├── statistics.component.ts
│   │   └── settings.component.ts
│   ├── services/            # Serwisy biznesowe
│   │   ├── database.service.ts
│   │   └── pioneer-timer.service.ts
│   ├── models/              # Modele TypeScript
│   │   └── index.ts
│   └── app.component.ts     # Główny komponent
├── assets/                  # Zasoby statyczne
├── index.html              # Główny plik HTML
├── main.ts                 # Bootstrap aplikacji
└── styles.scss             # Globalne style
```

## 💾 Przechowywanie danych

Aplikacja używa **IndexedDB** do lokalnego przechowywania danych w przeglądarce:

- **Tabela `entries`**: Wpisy godzin służby
- **Tabela `settings`**: Ustawienia aplikacji i typy godzin

Dane są automatycznie synchronizowane i dostępne offline. Można je eksportować do pliku JSON i importować z powrotem.

## 📖 Funkcjonalności główne

### 1. 📝 Wprowadzanie godzin
- Wybór daty
- Wybór typu godzin (Służba, inne typy)
- Wprowadzanie czasu w formacie godziny:minuty
- Opcjonalne notatki
- Historia ostatnich wpisów z możliwością edycji

### 2. 📊 Statystyki
- Podsumowanie bieżącego miesiąca
- Podsumowanie roku służbowego (wrzesień-sierpień)
- Postęp względem celu rocznego
- Wymagania dzienne do osiągnięcia celów
- Wykres miesięczny z podziałem na typy godzin

### 3. ⚙️ Ustawienia
- Konfiguracja celu godzinowego (domyślnie 600h)
- Zarządzanie typami godzin (do 5 dodatkowych typów)
- Export/import danych w formacie JSON
- Czyszczenie wszystkich danych

## 📅 Rok służbowy

Aplikacja operuje na roku służbowym od **1 września** do **31 sierpnia** następnego roku, zgodnie ze standardami pionierów.

## ⏰ Limity godzin

- **Służba**: Bez limitu miesięcznego - wszystkie godziny liczą się do statystyk
- **Inne typy**: Maksymalnie **55 godzin miesięcznie** liczą się do statystyk

## 🌐 Wsparcie przeglądarek

Aplikacja działa na wszystkich nowoczesnych przeglądarkach obsługujących:
- ES2022
- IndexedDB
- Service Workers (przyszła funkcjonalność PWA)

## 🔒 Bezpieczeństwo

✅ **Wszystkie podatności bezpieczeństwa zostały usunięte**
- Zaktualizowane do najnowszych wersji Angular 19
- Usunięte przestarzałe zależności
- Brak znanych luk bezpieczeństwa

## 🚀 Przyszły rozwój

Aplikacja jest przygotowana do rozszerzenia o:
- 📱 Progressive Web App (PWA)
- 🔔 Powiadomienia push
- ☁️ Synchronizację w chmurze
- 📈 Dodatkowe wykresy i statystyki
- 📄 Raporty PDF
- 🌍 Tryb offline

## 🛡️ Stan bezpieczeństwa

```
npm audit
found 0 vulnerabilities
```

## 📄 Licencja

Projekt udostępniony na licencji MIT.

## 🤝 Wkład w rozwój

Zapraszamy do współtworzenia projektu! Sprawdź nasze issues i prześlij pull request.

---

**Pioneer Timer** - Nowoczesne narzędzie do śledzenia godzin służby pionierskiej z wykorzystaniem najnowszych technologii webowych.
