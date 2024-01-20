Nazwa Projektu
Rodzinny Spis Obowiązków
Opis
Prosta aplikacja do zarządzania listą obowiązków rodzinnych. Umożliwia dodawanie, edytowanie, usuwanie notatek, a także logowanie i rejestrację użytkowników.

Technologie
React
Node.js
Express.js
MongoDB
CSS
Struktura Projektu
src/ - Źródłowy kod aplikacji React
components/ - Komponenty React
App.js - Główny komponent aplikacji
index.js - Plik startowy aplikacji
server/ - Serwer Node.js
app.js - Plik startowy serwera
routes/ - Trasy serwera Express
controllers/ - Kontrolery obsługujące logikę biznesową
db/ - Konfiguracja i modele MongoDB
Uruchamianie Projektu
Instalacja zależności

bash
Copy code
cd server
npm install

cd ../src
npm install
Uruchomienie serwera

bash
Copy code
cd server
npm start
Uruchomienie aplikacji React

bash
Copy code
cd src
npm start
Konfiguracja Bazy Danych
Baza danych MongoDB powinna być skonfigurowana w pliku server/db/index.js.
Zainstaluj MongoDB lokalnie lub skonfiguruj zdalne połączenie.
Konfiguracja Serwera
Port serwera można skonfigurować w pliku server/app.js.
Uwagi
Projekt nie zawiera zabezpieczeń, takich jak SSL, walidacji wejścia itp. Należy dodać odpowiednie zabezpieczenia do środowiska produkcyjnego.
Dokumentacja jest podstawowa i może wymagać dostosowania w zależności od rozwoju projektu.
Autor
[Jolanta Nowak]

Licencja
Ten projekt jest dostępny na licencji MIT - zobacz plik LICENSE.md dla więcej informacji.

Znane Problemy
[brak]
Changelog
[v1.0.0] - 2024.01.20
Pierwsze wydanie

