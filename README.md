# Pioneer Timer

Aplikacja webowa do śledzenia godzin służby pionierskiej z lokalnym przechowywaniem danych.

## Funkcjonalności

### 🕐 Wprowadzanie godzin
- Intuicyjny kalendarz do wyboru daty
- Wprowadzanie liczby godzin z obsługą ułamków (0.5h)
- Opcjonalne notatki do każdego wpisu
- Lista ostatnich wpisów z opcją edycji i usuwania

### 📊 Statystyki
- Podsumowanie godzin dla bieżącego roku i miesiąca
- Wizualny pasek postępu względem celu rocznego
- Wykres miesięczny pokazujący rozkład godzin
- Automatyczne obliczanie pozostałych godzin do celu

### ⚙️ Ustawienia
- Konfigurowalny cel godzinowy na rok (domyślnie 840h)
- Ustawienie domyślnej liczby godzin
- Opcje powiadomień
- Eksport/import danych w formacie JSON
- Możliwość wyczyszczenia wszystkich danych

## Technologie

- **HTML5** - struktura aplikacji
- **CSS3** - responsywny design z gradientami i animacjami
- **JavaScript ES6+** - logika aplikacji i zarządzanie stanem
- **Local Storage** - przechowywanie danych lokalnie w przeglądarce

## Instalacja i uruchomienie

1. Sklonuj repozytorium
2. Otwórz `index.html` w przeglądarce lub uruchom lokalny serwer:
   ```bash
   python3 -m http.server 8000
   ```
3. Przejdź do `http://localhost:8000`

## Cechy aplikacji

- ✅ **Zero backend** - wszystko działa lokalnie w przeglądarce
- ✅ **Offline-first** - brak wymagania połączenia z internetem
- ✅ **Responsywny design** - działa na telefonach i komputerach
- ✅ **Intuicyjny interfejs** - po polsku, łatwy w obsłudze
- ✅ **Bezpieczny** - dane pozostają lokalnie na urządzeniu
- ✅ **Szybki** - natychmiastowe ładowanie i reakcje

## Struktura plików

```
pioneer-timer/
├── index.html          # Główna struktura aplikacji
├── styles.css          # Style i responsywny design
├── script.js           # Logika aplikacji
└── README.md          # Dokumentacja
```

## Backup danych

Aplikacja oferuje funkcję eksportu danych do pliku JSON, który można zaimportować w przypadku potrzeby przywrócenia danych lub przeniesienia na inne urządzenie.