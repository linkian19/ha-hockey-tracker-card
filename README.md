# Hockey Tracker Card

A [Home Assistant](https://www.home-assistant.io/) Lovelace card that displays live scores, schedule, and recent results for any **ECHL**, **AHL**, or **NHL** team.

> **Requires:** [ha-hockey-tracker](https://github.com/linkian19/ha-hockey-tracker) integration (v1.3.0+) to be installed and a team sensor configured first.

---

## Features

- Live scoreboard with period and game clock
- Shots on goal (home and away)
- State badge in top bar: `LIVE`, `PRE-GAME`, `FINAL`, `NO GAME`
- Team name title centered in top bar (auto-derived or custom)
- Configurable team logo size
- 2-hour post-game window — server-controlled, keeps the final scoreboard visible well after the buzzer
- "Updated X ago" timestamp — always know how fresh the data is
- Pre-game upcoming view with team matchup, start time, and venue
- Next game preview when no game is active
- Team logo displayed during off-season / no upcoming games
- Optional live game events feed (goals & penalties with PP/SH/EN badges)
- Optional recent game results list (W/L, score, opponent, date) — rows link to official game summaries
- Full UI editor — no YAML required
- Named CSS classes for styling with [card-mod](https://github.com/thomasloven/lovelace-card-mod)

---

## Installation

### HACS (recommended)

1. In Home Assistant, open **HACS → Frontend**
2. Click the three-dot menu → **Custom repositories**
3. Add `https://github.com/linkian19/ha-hockey-tracker-card` with category **Lovelace**
4. Search for **Hockey Tracker Card** and install
5. Reload your browser

### Manual

1. Download `hockey-tracker-card.js` from this repo
2. Copy it to `config/www/hockey-tracker-card.js` in your Home Assistant instance
3. Go to **Settings → Dashboards → Resources** and add:
   - **URL:** `/local/hockey-tracker-card.js`
   - **Type:** JavaScript Module
4. Reload your browser

---

## Adding the Card

1. Edit a dashboard and click **Add Card**
2. Search for **Hockey Tracker** (or scroll to "Custom: Hockey Tracker Card")
3. Select your sensor entity and configure using the UI editor

Or add manually with YAML:

```yaml
type: custom:hockey-tracker-card
entity: sensor.kansas_city_mavericks_game
```

---

## Card Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **required** | The Hockey Tracker sensor entity |
| `title` | string | team name | Override the card title (leave blank to auto-derive from sensor) |
| `show_logo` | boolean | `true` | Show team logos |
| `logo_size` | number | `64` | Logo size in pixels (24–200) |
| `show_shots` | boolean | `true` | Show shots on goal row during live/final games |
| `show_next_game` | boolean | `true` | Show next game info when no game is active |
| `show_last_updated` | boolean | `true` | Show "Updated X ago" timestamp below the header |
| `show_recent_games` | boolean | `false` | Show recent game results below the main view |
| `recent_games_count` | number | `3` | Number of recent games to show (1–10) |
| `collapsible_recent` | boolean | `true` | Show a collapse toggle on the Recent Games section |
| `auto_collapse_recent` | boolean | `true` | Auto-collapse Recent Games when a game goes live |
| `show_events` | boolean | `false` | Show live game events (goals & penalties) during active games |
| `events_count` | number | `10` | Number of events to display (3–25) |
| `collapsible_events` | boolean | `true` | Show a collapse toggle on the Game Events section |

### Example with all options

```yaml
type: custom:hockey-tracker-card
entity: sensor.kansas_city_mavericks_game
title: KC Mavericks
show_logo: true
logo_size: 80
show_shots: true
show_next_game: true
show_last_updated: true
show_recent_games: true
recent_games_count: 5
collapsible_recent: true
auto_collapse_recent: true
show_events: true
events_count: 10
collapsible_events: true
```

---

## Display Modes

The card automatically switches between views based on game state:

| Situation | View shown |
|-----------|------------|
| Game in progress (`LIVE`) | Full scoreboard with period/clock |
| Within 30 min of puck drop (`PRE`) | Full scoreboard layout, no scores yet |
| More than 30 min before game (`PRE`) | Upcoming matchup with start time |
| Game just ended (`FINAL`) | Full scoreboard with final scores (stays for up to 2 hours) |
| `NO_GAME` with upcoming game | Next game preview |
| `NO_GAME` with no upcoming games (off-season, eliminated) | Team logo + "No upcoming games scheduled" |

The 2-hour post-game window is managed server-side by the integration, so it persists across browser refreshes and new HA sessions.

---

## Notifications

Notification alerts (win, pre-game, goal) are configured in the **integration**, not the card. Go to **Settings → Devices & Services → Hockey Tracker → Configure** to set them up. See the [integration README](https://github.com/linkian19/ha-hockey-tracker) for details.

---

## CSS Customization (card-mod)

All elements in the card have stable, prefixed CSS class names so you can target them with [card-mod](https://github.com/thomasloven/lovelace-card-mod).

### Class reference

| Class | Element |
|-------|---------|
| `.ht-content` | Root content wrapper |
| `.ht-header` | Top bar (badge + title + refresh button) |
| `.ht-badge` | State badge pill |
| `.ht-badge--live` | Badge modifier — game in progress |
| `.ht-badge--pre` | Badge modifier — pre-game |
| `.ht-badge--final` | Badge modifier — game ended |
| `.ht-badge--none` | Badge modifier — no game |
| `.ht-title` | Card title text |
| `.ht-refresh-btn` | Refresh icon button |
| `.ht-last-updated` | "Updated X ago" timestamp line |
| `.ht-scoreboard` | Scoreboard container |
| `.ht-team` | Team column (logo + name + score) |
| `.ht-logo` | Team logo `<img>` |
| `.ht-logo-icon` | Fallback hockey puck icon |
| `.ht-team-name` | Team name below logo |
| `.ht-score` | Goal count |
| `.ht-score-dash` | Pre-game score placeholder |
| `.ht-mid` | Center column between teams |
| `.ht-at-sign` | "@" separator |
| `.ht-period` | Period and clock row |
| `.ht-start-time` | Pre-game start time |
| `.ht-shots` | Shots on goal row |
| `.ht-venue` | Venue name row |
| `.ht-next-game` | Upcoming / next game section |
| `.ht-next-game-label` | "Next Game" / "Today's Game" label |
| `.ht-next-game-teams` | Matchup row in upcoming view |
| `.ht-next-game-team` | Individual team in upcoming view |
| `.ht-next-game-at` | "@" in upcoming matchup |
| `.ht-next-game-time` | Start time in upcoming view |
| `.ht-next-game-venue` | Venue in upcoming view |
| `.ht-no-games` | No upcoming games container |
| `.ht-no-games-logo` | Team logo wrapper in no-games state |
| `.ht-no-games-text` | "No upcoming games scheduled" text |
| `.ht-events` | Game events section container |
| `.ht-event-row` | Individual event row |
| `.ht-event-goal` | Modifier on goal rows |
| `.ht-event-penalty` | Modifier on penalty rows |
| `.ht-event--ours` | Modifier when event involves the tracked team |
| `.ht-event-dot` | Colored dot indicator (green=goal, orange=penalty) |
| `.ht-event-meta` | Period and time label |
| `.ht-event-abbrev` | Team abbreviation |
| `.ht-event-body` | Player name, tag, and assists |
| `.ht-event-tag` | PP / SH / EN badge on goals |
| `.ht-event-assists` | Assist names on goals |
| `.ht-recent` | Recent games section |
| `.ht-section-header` | Header row containing section label + collapse toggle |
| `.ht-section-label` | Section label text ("Recent Games", "Game Events") |
| `.ht-collapse-btn` | Chevron collapse/expand toggle icon |
| `.ht-recent-row` | Individual recent game row |
| `.ht-recent-row--link` | Modifier on rows that have a clickable game summary link |
| `.ht-result` | W/L result indicator |
| `.ht-result--win` | Win result color |
| `.ht-result--loss` | Loss result color |
| `.ht-opponent` | Opponent name in recent row |
| `.ht-recent-score` | Score in recent row |
| `.ht-recent-date` | Date in recent row |
| `.ht-recent-link-icon` | External link icon on clickable recent game rows |

### Example card-mod usage

```yaml
type: custom:hockey-tracker-card
entity: sensor.kansas_city_mavericks_game
card_mod:
  style:
    hockey-tracker-card$: |
      .ht-badge--live { background: #e65100; }
      .ht-title { font-size: 1.3rem; }
      .ht-score { font-size: 2.8rem; }
      .ht-result--win { color: #00c853; }
```

> **Note:** The `hockey-tracker-card$` selector is required for card-mod to pierce the card's Shadow DOM. Add `!important` to overrides that don't apply.

---

## Issues & Contributing

Please open an issue at [github.com/linkian19/ha-hockey-tracker-card/issues](https://github.com/linkian19/ha-hockey-tracker-card/issues).
