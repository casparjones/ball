# Bouncing Ball Game

Ein interaktives Physik-Spiel mit hüpfenden Bällen in einem rotierenden Oktagon.

Dieses Projekt wurde komplett mithilfe von KI erstellt: Zuerst kam Claude Code zum Einsatz, anschließend erfolgten Erweiterungen mit OpenAI Codex.

## Beschreibung

Dieses Projekt ist ein HTML5-Canvas-basiertes Spiel, das realistische Physik-Simulation mit visuell ansprechender Grafik kombiniert. Die Spieler können durch Klicken neue Bälle innerhalb eines rotierenden Oktagons erstellen, die dann mit Schwerkraft und Kollisionsdetektion interagieren.

## GitHub Page

Eine Live-Demo ist unter <https://casparjones.github.io/ball/> verfügbar.

## Features

- **Interaktive Ball-Erstellung**: Klicken Sie innerhalb des Oktagons, um neue Bälle zu erstellen
- **Realistische Physik**: Schwerkraft, Reibung und elastische Kollisionen
- **Rotierendes Oktagon**: Kontinuierlich rotierende Spielfläche
- **Audio-Feedback**: Bounce-Sounds bei Kollisionen (erfordert Benutzerinteraktion)
- **Zufällige Eigenschaften**: Jeder Ball hat eine zufällige Farbe, Größe und Anfangsgeschwindigkeit
- **Erweiterte Kollisionsdetektion**: Präzise Kollisionen mit Oktagon-Kanten und -Ecken

## Technische Details

### Architektur
- **Matter.js**: [liabru/matter-js](https://github.com/liabru/matter-js) für die Physik-Simulation
- **HTML5 Canvas**: Für 2D-Rendering und Animation
- **Web Audio API**: Für dynamische Sound-Effekte

### Hauptkomponenten

#### BouncingBallGame (`game.js`)
- Hauptspiel-Controller für den Karussell-Modus
- Verwaltet Canvas, Animation und Benutzereingaben
- Handhabt Audio-Initialisierung und Wiedergabe
- Koordiniert Physik-Updates und Rendering

#### RandomNumberGame (`randomNumber.js`)
- Ball fällt durch Hindernisse in eines von 25 Zahlenfeldern
- Nach Anzeige der Zahl wird nach kurzer Pause ein neuer Ball erzeugt

#### LottoGame (`lotto.js`)
- Simuliert eine Lotto-Ziehung mit 49 nummerierten Kugeln
- Zieht nacheinander sechs Kugeln und zeigt sie am Rand an


### Physik-Simulation
- **Schwerkraft**: 0.4 Pixel/Frame²
- **Reibung**: 90% Geschwindigkeitserhaltung bei Kollisionen
- **Elastische Kollisionen**: Realistische Reflexion basierend auf Oberflächennormalen
- **Kontinuierliche Rotation**: 0.01 Radian/Frame

## Installation

1. Klonen Sie das Repository:
   ```bash
   git clone <repository-url>
   cd ball
   ```
2. Starten Sie einen lokalen Server (z.B. mit `npx serve` oder `python3 -m http.server`):
   ```bash
   npx serve -l 8000 .
   ```
   oder
   ```bash
   python3 -m http.server 8000
   ```
3. Öffnen Sie `http://localhost:8000` in Ihrem Browser

## Verwendung

1. **Starten**: Öffnen Sie die Anwendung in einem modernen Webbrowser
2. **Bälle erstellen**: Klicken Sie innerhalb des Oktagons, um neue Bälle hinzuzufügen
3. **Audio aktivieren**: Der erste Klick aktiviert die Audio-Funktionalität
4. **Beobachten**: Sehen Sie zu, wie die Bälle mit dem rotierenden Oktagon interagieren

## Browser-Kompatibilität

- **Chrome/Edge**: Vollständig unterstützt
- **Firefox**: Vollständig unterstützt
- **Safari**: Unterstützt (Web Audio API erfordert Benutzerinteraktion)
- **Mobile Browser**: Unterstützt mit Touch-Eingabe

## Projektstruktur

```
css/                # Styling und Layout
js/                 # Sämtliche Spiel- und Hilfs-Skripte
img/                # Grafiken und Screenshots
index.html          # Einstiegspunkt der Anwendung
```

## Anpassungen

### Oktagon-Parameter
```javascript
this.octagonRadius = 360;    // Radius des Oktagons
this.octagonSides = 8;       // Anzahl der Seiten
this.rotationSpeed = 0.01;   // Rotationsgeschwindigkeit
```

### Physik-Parameter
```javascript
this.gravity = 0.4;          // Schwerkraft
this.friction = 0.90;        // Reibung bei Kollisionen
```

### Ball-Eigenschaften
```javascript
radius: 10 + Math.random() * 6,           // Ballgröße
vx: (Math.random() - 0.5) * 6,           // Horizontale Geschwindigkeit
vy: Math.random() * 2,                    // Vertikale Geschwindigkeit
```

## Entwicklung

Das Projekt basiert auf Vanilla JavaScript und nutzt für die Physik die Bibliothek [Matter.js](https://github.com/liabru/matter-js). Dadurch lassen sich realistische Kollisionen effizient simulieren.

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Weitere Details finden Sie in der LICENSE-Datei.

## Beiträge

Beiträge sind willkommen! Bitte erstellen Sie einen Pull Request oder öffnen Sie ein Issue für Verbesserungsvorschläge.
