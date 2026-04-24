# ECHL Tracker Card

A [Home Assistant](https://www.home-assistant.io/) Lovelace card that displays live scores, game state, and upcoming schedule for any ECHL team.

> **Requires:** [ha-echl-tracker](https://github.com/linkian19/ha-echl-tracker) integration to be installed and configured first.

---

## Features

- Live scoreboard with period and game clock
- Shots on goal (home and away)
- State badges: `LIVE`, `PRE`, `FINAL`, `NO GAME`
- Next game preview with opponent, date, and venue
- Optional team logo display
- Configurable via the Home Assistant UI card editor — no YAML required

---

## Installation

### HACS (recommended)

1. In Home Assistant, open **HACS → Frontend**
2. Click the three-dot menu → **Custom repositories**
3. Add `https://github.com/linkian19/ha-echl-tracker-card` with category **Lovelace**
4. Search for "ECHL Tracker Card" and install
5. Add the resource (HACS usually handles this automatically — if not, see Manual step 3)
6. Reload your browser

### Manual

1. Download `dist/echl-tracker-card.js` from this repo
2. Copy it to `config/www/echl-tracker-card.js` in your Home Assistant instance
3. Go to **Settings → Dashboards → Resources** and add:
   - **URL:** `/local/echl-tracker-card.js`
   - **Type:** JavaScript Module
4. Reload your browser

---

## Adding the Card

1. Edit a dashboard and click **Add Card**
2. Search for **ECHL Tracker** (or scroll to "Custom: ECHL Tracker Card")
3. Configure using the UI editor

Or add manually with YAML:

```yaml
type: custom:echl-tracker-card
entity: sensor.kansas_city_mavericks_game
```

---

## Card Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **required** | The ECHL tracker sensor entity |
| `title` | string | team name | Override the card title |
| `logo_url` | string | — | URL to a team logo image |
| `show_logo` | boolean | `true` | Show the logo / icon in the header |
| `show_shots` | boolean | `true` | Show shots on goal row |
| `show_next_game` | boolean | `true` | Show next game info when no game is active |

### Example with all options

```yaml
type: custom:echl-tracker-card
entity: sensor.kansas_city_mavericks_game
title: KC Mavericks
logo_url: https://example.com/mavericks-logo.png
show_logo: true
show_shots: true
show_next_game: true
```

---

## Finding Your Team Logo URL

The ECHL hosts team logos through the HockeyTech CDN. You can right-click any team logo on [echl.com](https://www.echl.com/) and copy the image address to use as your `logo_url`.

---

## Issues & Contributing

Please open an issue at [github.com/linkian19/ha-echl-tracker-card/issues](https://github.com/linkian19/ha-echl-tracker-card/issues).
