# Hockey Tracker Card

A [Home Assistant](https://www.home-assistant.io/) Lovelace card package that displays live scores, schedules, and playoff brackets for any team or league tracked by the Hockey Tracker integration — supporting **15 leagues** including NHL, PWHL, AHL, ECHL, CHL, OHL, WHL, QMJHL, USHL, and more.

This package includes two card types:

- **`hockey-tracker-card`** — Live scoreboard, game events, and recent results for a single tracked team
- **`hockey-playoff-card`** — Full playoff bracket view with live game data for up to 4 followed teams

> **Requires:** [ha-hockey-tracker](https://github.com/linkian19/ha-hockey-tracker) integration (v1.5.0+) to be installed and at least one sensor configured first.

---

## Features

### Hockey Tracker Card (`hockey-tracker-card`)
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

### Hockey Playoff Card (`hockey-playoff-card`)
- Full playoff bracket across all rounds and series for any supported league
- Followed teams highlighted with a colored border and tinted background
- Live game score and period shown inline within each series row during active games
- Series status labels (e.g. "COL leads 3–1", "Tied 2–2", "BUF wins 4–2")
- Toggle between **bracket view** (default) and **game view** (live scoreboard, events, next game)
- Rounds auto-collapse to focus on the current round — click any round header to expand/collapse
- Full UI editor — no YAML required
- `hp-` prefixed CSS classes for styling with card-mod

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

## Adding the Cards

### Hockey Tracker Card

1. Edit a dashboard and click **Add Card**
2. Search for **Hockey Tracker** (or scroll to "Custom: Hockey Tracker Card")
3. Select your Team Tracker sensor and configure using the UI editor

Or add manually with YAML:

```yaml
type: custom:hockey-tracker-card
entity: sensor.kansas_city_mavericks_game
```

### Hockey Playoff Card

1. Edit a dashboard and click **Add Card**
2. Search for **Hockey Playoff** (or scroll to "Custom: Hockey Playoff Card")
3. Select your Playoff Tracker sensor and configure using the UI editor

Or add manually with YAML:

```yaml
type: custom:hockey-playoff-card
entity: sensor.nhl_playoffs_col_edm_1
```

---

## Hockey Tracker Card Options

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

### Example

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

## Hockey Tracker Card — Display Modes

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

## Hockey Playoff Card Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **required** | The Playoff Tracker sensor entity |
| `title` | string | sensor name | Override the card title |
| `show_logo` | boolean | `true` | Show team logos in bracket and game views |
| `logo_size` | number | `132` | Logo size in pixels for game view (24–200) |
| `show_shots` | boolean | `true` | Show shots on goal row in game view |
| `show_next_game` | boolean | `true` | Show next game info when no game is active |
| `show_last_updated` | boolean | `true` | Show "Updated X ago" timestamp below the header |
| `show_events` | boolean | `true` | Show live game events (goals & penalties) in game view |
| `events_count` | number | `10` | Number of events to display (3–25) |
| `collapsible_events` | boolean | `true` | Show a collapse toggle on the Game Events section |

### Example

```yaml
type: custom:hockey-playoff-card
entity: sensor.nhl_playoffs_col_edm_1
title: 2025 Stanley Cup Playoffs
show_logo: true
logo_size: 132
show_shots: true
show_next_game: true
show_last_updated: true
show_events: true
events_count: 10
collapsible_events: true
```

---

## Hockey Playoff Card — Display Modes

The card has two views, toggled via buttons in the header:

| View | When shown | How to activate |
|------|------------|-----------------|
| **Bracket** (🏒) | Full playoff bracket, all rounds | Default; always available |
| **Game** (📺) | Live scoreboard, events, next game | Only shown when a followed team has an active game (LIVE, PRE, or recent FINAL) |

### Bracket view

All rounds are displayed as expandable sections. Rounds before the current active round are collapsed by default; the current round is expanded. Click any round header to toggle.

Each series row shows:
- Team logos (or abbreviation placeholder if no logo)
- Team abbreviations with win counts
- Series status label: `"COL leads 3–1"`, `"Tied 2–2"`, `"BUF wins 4–2"`, `"Game 1"`, etc.
- Live game score and period inline when `game_state = LIVE`

Followed teams' series are highlighted with a colored left border and tinted background.

### Game view

Reuses the Team Tracker card's scoreboard layout — full home/away scoreboard, period and clock, shots, game events feed, and next upcoming game. This view reflects the most relevant active game for any followed team.

---

## CSS Customization (card-mod)

### Hockey Tracker Card class reference

All elements in the `hockey-tracker-card` have stable `ht-` prefixed CSS class names so you can target them with [card-mod](https://github.com/thomasloven/lovelace-card-mod).

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

### Hockey Playoff Card class reference

All elements in the `hockey-playoff-card` have stable `hp-` prefixed CSS class names.

| Class | Element |
|-------|---------|
| `.hp-content` | Root content wrapper |
| `.hp-header` | Top bar (badge + title + view buttons) |
| `.hp-badge` | State badge pill |
| `.hp-badge--live` | Badge modifier — a followed team's game is in progress |
| `.hp-badge--pre` | Badge modifier — pre-game |
| `.hp-badge--final` | Badge modifier — game ended |
| `.hp-badge--none` | Badge modifier — no active game |
| `.hp-title` | Card title text |
| `.hp-header-btns` | Container for bracket / game / refresh buttons |
| `.hp-icon-btn` | Individual header icon button |
| `.hp-icon-btn--active` | Modifier on the currently active view button |
| `.hp-last-updated` | "Updated X ago" timestamp line |
| `.hp-round` | One round container |
| `.hp-round-header` | Round label row (clickable to collapse/expand) |
| `.hp-round-chevron` | Chevron indicator on the round header |
| `.hp-round-chevron--open` | Modifier when the round is expanded |
| `.hp-series` | One series matchup card |
| `.hp-series--followed` | Modifier on series where a followed team is playing |
| `.hp-series-team-row` | One team row within a series (logo + abbrev + name + wins) |
| `.hp-series-logo` | Team logo `<img>` within a series row |
| `.hp-series-logo-ph` | Placeholder shown when no logo is available or the image fails |
| `.hp-series-abbrev` | Team abbreviation |
| `.hp-series-abbrev--winner` | Modifier on the winning team's abbreviation |
| `.hp-series-name` | Full team name (secondary text, truncated) |
| `.hp-series-wins` | Win count |
| `.hp-series-wins--leader` | Modifier when this team leads the series |
| `.hp-series-wins--loser` | Modifier on the trailing team after series is complete |
| `.hp-series-status-row` | Status bar at the bottom of each series card |
| `.hp-series-live-score` | In-game score shown when `game_state = LIVE` |
| `.hp-series-status` | Series status label text |
| `.hp-series-status--live` | Modifier when the series has a live game |
| `.hp-series-status--pre` | Modifier when the series has a pre-game today |
| `.hp-game-tabs` | Tab bar container in game view |
| `.hp-game-tab` | Individual game tab button |
| `.hp-game-tab--active` | Active tab modifier |

### Example card-mod usage

```yaml
type: custom:hockey-playoff-card
entity: sensor.nhl_playoffs_col_edm_1
card_mod:
  style:
    hockey-playoff-card$: |
      .hp-series--followed { border-left-color: #ff6f00; }
      .hp-badge--live { background: #e65100; }
      .hp-series-wins--leader { color: #ff6f00; }
```

> **Note:** Use `hockey-playoff-card$` as the selector to pierce the Shadow DOM.

---

## Attribution

This card was inspired by [ha-teamtracker](https://github.com/vasqued2/ha-teamtracker) by [vasqued2](https://github.com/vasqued2).

---

## Issues & Contributing

Please open an issue at [github.com/linkian19/ha-hockey-tracker-card/issues](https://github.com/linkian19/ha-hockey-tracker-card/issues).
