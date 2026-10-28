/**
 * Hockey Tracker Card
 * https://github.com/linkian19/ha-hockey-tracker-card
 *
 * Inspired by ha-teamtracker (https://github.com/vasqued2/ha-teamtracker) by vasqued2.
 * Requires ha-hockey-tracker integration v1.9.0+.
 *
 * Source file — `npm run build` bundles Lit and writes dist/hockey-tracker-card.js
 * (the file HACS installs). Lit is bundled rather than loaded from a CDN so the
 * cards work without internet access and can't change between releases.
 */
import { LitElement, html, css } from "lit";

// Injected from package.json at build time (see vite.config.js)
const VERSION = __VERSION__;
// False when this module is evaluated a second time (resource loaded twice)
const FIRST_LOAD = !customElements.get("hockey-tracker-card");

// Guarded registration — the resource can load twice (duplicate dashboard
// resource, HACS cache-busting URL change) and a second define() throws,
// which would break every card on the dashboard.
function defineElement(name, cls) {
  if (!customElements.get(name)) customElements.define(name, cls);
}

// First Hockey Tracker sensor for the card picker's default config.
// playoff=true finds Playoff Tracker sensors (they carry a bracket attribute).
function findHockeySensor(hass, playoff) {
  if (!hass) return "";
  const ids = Object.keys(hass.states).filter((id) => id.startsWith("sensor."));
  const isHockey = (id) => hass.entities?.[id]
    ? hass.entities[id].platform === "hockey_tracker"
    : "team_name" in (hass.states[id].attributes || {}) || "bracket" in (hass.states[id].attributes || {});
  return ids.find((id) =>
    isHockey(id) && ("bracket" in (hass.states[id].attributes || {})) === playoff
  ) ?? "";
}

// Date/time formatting options from the user's HA profile: language,
// 12/24-hour setting and "server vs local" time zone (hass.locale), instead of
// the browser locale + always the server time zone.
function localeOpts(hass) {
  const loc = hass?.locale ?? {};
  const language = loc.time_format === "system" ? undefined : (loc.language || hass?.language || undefined);
  const timeZone = loc.time_zone === "local" ? undefined : (hass?.config?.time_zone || undefined);
  const hour12 = loc.time_format === "12" ? true : loc.time_format === "24" ? false : undefined;
  return { language, timeZone, hour12 };
}

// Only re-render on hass updates that touch this card's entity (or change
// theme/language) — HA pushes a new hass object on every state change.
function hassChangeAffects(changedProps, hass, entityId) {
  if (!changedProps.has("hass") || changedProps.size > 1) return true;
  const oldHass = changedProps.get("hass");
  if (!oldHass || !hass) return true;
  return (
    oldHass.states[entityId] !== hass.states[entityId] ||
    oldHass.locale !== hass.locale ||
    oldHass.themes !== hass.themes
  );
}

// Enter/Space activation for non-button elements with role="button"
function onActivateKey(handler) {
  return (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    handler(e);
  };
}

function fireConfigChanged(el, config) {
  el.dispatchEvent(new CustomEvent("config-changed", {
    detail: { config }, bubbles: true, composed: true,
  }));
}

// Refresh via the integration's force_refresh service (also clears its schedule
// cache); fall back to a plain entity update for older integration versions.
async function refreshEntity(hass, entityId) {
  try {
    await hass.callService("hockey_tracker", "force_refresh", { entity_id: entityId });
  } catch {
    try {
      await hass.callService("homeassistant", "update_entity", { entity_id: entityId });
    } catch (err) {
      console.warn("[hockey-tracker-card] Refresh failed:", err);
    }
  }
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

class HockeyTrackerCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, config: {} };
  }

  setConfig(config) {
    this.config = {
      show_logo: true,
      show_shots: true,
      show_next_game: true,
      show_recent_games: false,
      recent_games_count: 3,
      collapsible_recent: true,
      auto_collapse_recent: true,
      show_events: false,
      events_count: 10,
      collapsible_events: true,
      show_event_goals: true,
      show_event_penalties: true,
      show_event_shots: true,
      logo_size: 64,
      show_last_updated: true,
      ...config,
    };
  }

  static get _schema() {
    return [
      { name: "entity", required: true, selector: { entity: { domain: "sensor" } } },
      { name: "title", selector: { text: {} } },
      { name: "show_logo", selector: { boolean: {} } },
      { name: "show_shots", selector: { boolean: {} } },
      { name: "show_next_game", selector: { boolean: {} } },
      { name: "show_last_updated", selector: { boolean: {} } },
      { name: "show_recent_games", selector: { boolean: {} } },
      {
        name: "recent_games_count",
        default: 3,
        selector: { number: { min: 1, max: 10, step: 1, mode: "box" } },
      },
      { name: "collapsible_recent", selector: { boolean: {} } },
      { name: "auto_collapse_recent", selector: { boolean: {} } },
      { name: "show_events", selector: { boolean: {} } },
      {
        name: "events_count",
        default: 10,
        selector: { number: { min: 3, max: 25, step: 1, mode: "box" } },
      },
      { name: "collapsible_events", selector: { boolean: {} } },
      { name: "show_event_goals", selector: { boolean: {} } },
      { name: "show_event_penalties", selector: { boolean: {} } },
      { name: "show_event_shots", selector: { boolean: {} } },
      {
        name: "logo_size",
        default: 64,
        selector: { number: { min: 24, max: 200, step: 4, mode: "slider" } },
      },
    ];
  }

  _computeLabel(schema) {
    return {
      entity:             "Sensor Entity",
      title:              "Card Title (leave blank to use team name)",
      show_logo:          "Show team logos",
      show_shots:         "Show shots on goal",
      show_next_game:     "Show next game when no game is active",
      show_last_updated:  "Show time since last data refresh",
      show_recent_games:  "Show recent game results",
      recent_games_count: "Number of recent games to show (1–10, default: 3)",
      collapsible_recent:   "Allow recent games section to be collapsed",
      auto_collapse_recent: "Auto-collapse recent games when a game goes live",
      show_events:          "Show live game events (goals & penalties) during active games",
      events_count:         "Number of events to display (3–25, default: 10)",
      collapsible_events:   "Allow game events section to be collapsed",
      show_event_goals:     "Show goal events in ticker",
      show_event_penalties: "Show penalty events in ticker",
      show_event_shots:     "Show shot events in ticker (NHL only)",
      logo_size:            "Logo size in px (24–200, default: 64)",
    }[schema.name] ?? schema.name;
  }

  _valueChanged(ev) {
    ev.stopPropagation();
    fireConfigChanged(this, ev.detail.value);
  }

  render() {
    if (!this.hass || !this.config) return html``;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${HockeyTrackerCardEditor._schema}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}

defineElement("hockey-tracker-card-editor", HockeyTrackerCardEditor);

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

class HockeyTrackerCard extends LitElement {
  static get properties() {
    return { hass: {}, config: {} };
  }

  // Collapse state for optional sections
  _recentCollapsed = false;
  _eventsCollapsed = false;
  _prevLive = false;
  _showLastGame = false;
  _failedLogos = new Set();
  // Timer for updating the "last updated X ago" display
  _ageTimer = null;

  static get styles() {
    return css`
      :host { display: block; }

      /* Keyboard focus ring for clickable rows/toggles (also used by the playoff card) */
      [role="button"]:focus-visible, [role="link"]:focus-visible {
        outline: 2px solid var(--primary-color, #03a9f4);
        outline-offset: 2px;
        border-radius: 4px;
      }

      /* ── Root content wrapper ────────────────────────── */
      .ht-content { padding: 14px 16px 12px; }

      /* ── Top bar ─────────────────────────────────────── */
      .ht-header {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
      }
      .ht-badge {
        padding: 3px 10px;
        border-radius: 99px;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.07em;
        text-transform: uppercase;
      }
      .ht-badge--live  { background: #d32f2f; color: #fff; }
      .ht-badge--pre   { background: #1565c0; color: #fff; }
      .ht-badge--final { background: var(--secondary-text-color); color: #fff; }
      .ht-badge--none  { background: var(--disabled-color, #9e9e9e); color: #fff; }
      .ht-title {
        flex: 1;
        text-align: center;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 0 8px;
      }
      .ht-refresh-btn {
        --mdc-icon-button-size: 32px;
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
        margin-right: -4px;
      }
      .ht-history-btn {
        --mdc-icon-button-size: 32px;
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
      }
      .ht-history-btn--active {
        color: var(--primary-color);
      }
      .ht-last-updated {
        text-align: right;
        font-size: 0.68rem;
        color: var(--disabled-color, #9e9e9e);
        margin-bottom: 8px;
        padding-right: 2px;
      }

      /* ── Scoreboard ─────────────────────────────────── */
      .ht-scoreboard {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 4px;
        padding: 8px 0 10px;
        border-top: 1px solid var(--divider-color);
        border-bottom: 1px solid var(--divider-color);
        margin-bottom: 8px;
      }
      .ht-team {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        min-width: 0;
      }
      .ht-logo {
        object-fit: contain;
      }
      .ht-logo-icon {
        --mdc-icon-size: 48px;
        color: var(--primary-color);
      }
      .ht-team-name {
        font-size: 0.78rem;
        text-align: center;
        color: var(--secondary-text-color);
        line-height: 1.2;
        word-break: break-word;
      }
      .ht-score {
        font-size: 2.4rem;
        font-weight: 700;
        color: var(--primary-text-color);
        line-height: 1;
      }
      .ht-score-dash {
        font-size: 1.4rem;
        color: var(--secondary-text-color);
      }
      .ht-mid {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        align-self: stretch;
        gap: 4px;
        flex-shrink: 0;
      }
      .ht-at-sign {
        font-size: 1.1rem;
        color: var(--secondary-text-color);
        font-weight: 600;
      }

      /* ── Period / game info rows ─────────────────────── */
      .ht-last-game-label {
        text-align: center;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
        margin-bottom: 8px;
      }
      .ht-last-game-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 20px 0 12px;
      }
      .ht-last-game-empty-text {
        font-size: 0.85rem;
        color: var(--secondary-text-color);
      }
      .ht-last-game-load-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 16px;
        border-radius: 6px;
        border: 1px solid var(--primary-color);
        background: transparent;
        color: var(--primary-color);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
      }
      .ht-last-game-load-btn:hover { background: var(--primary-color); color: #fff; }
      .ht-last-game-load-btn ha-icon { --mdc-icon-size: 15px; }
      .ht-period, .ht-venue {
        text-align: center;
        font-size: 0.82rem;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }
      .ht-shots {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        padding: 0 2px;
        margin-bottom: 4px;
      }
      .ht-start-time {
        text-align: center;
        font-size: 0.9rem;
        color: var(--primary-text-color);
        font-weight: 500;
        margin-bottom: 4px;
      }

      /* ── Upcoming / next game ────────────────────────── */
      .ht-next-game {
        padding: 10px 0 4px;
        border-top: 1px solid var(--divider-color);
      }
      .ht-next-game-label {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
        margin-bottom: 6px;
      }
      .ht-next-game-teams {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 8px;
      }
      .ht-next-game-team {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        font-size: 0.82rem;
        color: var(--secondary-text-color);
        text-align: center;
      }
      .ht-next-game-at {
        font-size: 0.9rem;
        color: var(--secondary-text-color);
        flex-shrink: 0;
      }
      .ht-next-game-time {
        text-align: center;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .ht-next-game-venue {
        text-align: center;
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        margin-top: 2px;
      }

      /* ── No game / off-season ────────────────────────── */
      .ht-no-games {
        border-top: 1px solid var(--divider-color);
        padding: 16px 0 8px;
        text-align: center;
        color: var(--secondary-text-color);
        font-size: 0.88rem;
      }
      .ht-no-games-logo {
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
      }

      /* ── Game events (goals & penalties) ───────────── */
      .ht-events {
        border-top: 1px solid var(--divider-color);
        margin-top: 8px;
        padding-top: 8px;
      }
      .ht-event-row {
        display: grid;
        grid-template-columns: 10px 56px 32px 1fr;
        align-items: center;
        gap: 4px;
        padding: 4px 0;
        font-size: 0.78rem;
        border-bottom: 1px solid var(--divider-color);
        line-height: 1.3;
      }
      .ht-event-row:last-child { border-bottom: none; }
      .ht-event-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .ht-event-goal .ht-event-dot    { background: #388e3c; }
      .ht-event-penalty .ht-event-dot { background: #e65100; }
      .ht-event-shot .ht-event-dot    { background: #0288d1; }
      .ht-event-meta {
        color: var(--secondary-text-color);
        font-size: 0.72rem;
        white-space: nowrap;
      }
      .ht-event-abbrev {
        font-weight: 700;
        font-size: 0.74rem;
        color: var(--primary-text-color);
      }
      .ht-event-body {
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 0.78rem;
      }
      .ht-event--ours .ht-event-body { color: var(--primary-text-color); }
      .ht-event-tag {
        display: inline-block;
        padding: 0 3px;
        border-radius: 3px;
        font-size: 0.62rem;
        font-weight: 700;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        vertical-align: middle;
        margin-left: 2px;
      }
      .ht-event-assists {
        color: var(--secondary-text-color);
        font-size: 0.72rem;
      }

      /* ── Recent games ───────────────────────────────── */
      .ht-recent {
        border-top: 1px solid var(--divider-color);
        margin-top: 10px;
        padding-top: 8px;
      }
      .ht-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
      }
      .ht-section-label {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
        margin-bottom: 0;
      }
      .ht-collapse-btn {
        --mdc-icon-size: 16px;
        color: var(--secondary-text-color);
        cursor: pointer;
        flex-shrink: 0;
      }
      .ht-recent-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 3px 0;
        font-size: 0.82rem;
        border-bottom: 1px solid var(--divider-color);
        cursor: default;
      }
      .ht-recent-row--link {
        cursor: pointer;
      }
      .ht-recent-row--link:hover .ht-opponent,
      .ht-recent-row--link:hover .ht-recent-score {
        text-decoration: underline;
        color: var(--primary-color);
      }
      .ht-recent-row:last-child { border-bottom: none; }
      .ht-result {
        font-weight: 700;
        font-size: 0.78rem;
        width: 16px;
        flex-shrink: 0;
      }
      .ht-result--win  { color: #388e3c; }
      .ht-result--loss { color: #d32f2f; }
      .ht-opponent {
        flex: 1;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ht-recent-score {
        font-weight: 600;
        color: var(--primary-text-color);
        flex-shrink: 0;
      }
      .ht-recent-date {
        color: var(--secondary-text-color);
        flex-shrink: 0;
        font-size: 0.78rem;
      }
      .ht-recent-link-icon {
        --mdc-icon-size: 13px;
        color: var(--secondary-text-color);
        flex-shrink: 0;
        opacity: 0.6;
      }

      /* ── Game page link ─────────────────────────────── */
      .ht-game-link {
        text-align: center;
        margin-top: 6px;
        font-size: 0.78rem;
      }
      .ht-game-link a {
        color: var(--primary-color, #03a9f4);
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .ht-game-link a:hover { text-decoration: underline; }
      .ht-game-link ha-icon { --mdc-icon-size: 13px; }
    `;
  }

  static getConfigElement() {
    return document.createElement("hockey-tracker-card-editor");
  }

  static getStubConfig(hass) {
    return {
      entity: findHockeySensor(hass, false),
      show_logo: true,
      show_shots: true,
      show_next_game: true,
      show_recent_games: false,
      recent_games_count: 3,
      collapsible_recent: true,
      auto_collapse_recent: true,
      show_events: false,
      events_count: 10,
      collapsible_events: true,
      show_event_goals: true,
      show_event_penalties: true,
      show_event_shots: true,
      logo_size: 64,
      show_last_updated: true,
    };
  }

  setConfig(config) {
    if (!config.entity) throw new Error("Required: entity");
    this.config = {
      show_logo: true,
      show_shots: true,
      show_next_game: true,
      show_recent_games: false,
      recent_games_count: 3,
      collapsible_recent: true,
      auto_collapse_recent: true,
      show_events: false,
      events_count: 10,
      collapsible_events: true,
      show_event_goals: true,
      show_event_penalties: true,
      show_event_shots: true,
      logo_size: 64,
      show_last_updated: true,
      ...config,
    };
  }

  // State-driven view changes are applied before render (willUpdate) so they
  // land in the same render instead of triggering a second one
  willUpdate(changedProps) {
    super.willUpdate(changedProps);
    if (!changedProps.has("hass")) return;
    const stateObj = this.hass?.states[this.config?.entity];
    if (!stateObj) return;
    const state = stateObj.state;
    if ((state === "LIVE" || state === "FINAL") && this._showLastGame) {
      this._showLastGame = false;
    }
    const isLive = state === "LIVE";
    if (this.config.auto_collapse_recent !== false) {
      if (isLive && !this._prevLive) {
        this._recentCollapsed = true;
      } else if (!isLive && this._prevLive) {
        this._recentCollapsed = false;
      }
    }
    this._prevLive = isLive;
  }

  connectedCallback() {
    super.connectedCallback();
    // Refresh the "X ago" age display every 30 seconds without a full HA update
    this._ageTimer = setInterval(() => this.requestUpdate(), 30000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._ageTimer);
    this._ageTimer = null;
  }

  getCardSize() { return 4; }

  // Sections layout: full width by default, height follows content
  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6 };
  }

  shouldUpdate(changedProps) {
    return hassChangeAffects(changedProps, this.hass, this.config?.entity);
  }

  // ------------------------------------------------------------------
  // Display mode — server manages the FINAL window, card just follows state
  // ------------------------------------------------------------------

  _displayMode(state, a) {
    if (state === "LIVE" || state === "FINAL") return "game";
    if (state === "PRE" && a.start_time) {
      const minsUntil = (new Date(a.start_time) - Date.now()) / 60000;
      return minsUntil <= 30 ? "game" : "upcoming";
    }
    return "upcoming";
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  render() {
    if (!this.hass || !this.config) return html``;

    const stateObj = this.hass.states[this.config.entity];
    if (!stateObj) {
      return html`<ha-card><div class="ht-content">Entity not found: ${this.config.entity}</div></ha-card>`;
    }

    const state = stateObj.state;
    const a = stateObj.attributes;

    // History button only makes sense when there's no active game to watch
    const canShowHistory = state === "NO_GAME" || state === "PRE";
    const showingLastGame = this._showLastGame && canShowHistory;
    const mode = showingLastGame ? "last_game" : this._displayMode(state, a);

    const badgeClass = { LIVE: "ht-badge--live", PRE: "ht-badge--pre", FINAL: "ht-badge--final", NO_GAME: "ht-badge--none" }[state] ?? "ht-badge--none";
    const badgeLabel = { LIVE: "Live", PRE: "Pre-Game", FINAL: "Final", NO_GAME: "No Game" }[state] ?? state;

    return html`
      <ha-card>
        <div class="ht-content">
          <div class="ht-header">
            <span class="ht-badge ${badgeClass}">${badgeLabel}</span>
            <span class="ht-title">${this._cardTitle(a, stateObj)}</span>
            ${canShowHistory ? html`
              <ha-icon-button
                class="ht-history-btn${showingLastGame ? " ht-history-btn--active" : ""}"
                label="${showingLastGame ? "Current" : "Last Game"}"
                @click=${() => { this._showLastGame = !this._showLastGame; this.requestUpdate(); }}
              >
                <ha-icon icon="${showingLastGame ? "mdi:close" : "mdi:history"}"></ha-icon>
              </ha-icon-button>
            ` : ""}
            <ha-icon-button class="ht-refresh-btn" label="Refresh" @click=${this._refresh}>
              <ha-icon icon="mdi:refresh"></ha-icon>
            </ha-icon-button>
          </div>

          ${this.config.show_last_updated !== false && a.last_fetched ? html`
            <div class="ht-last-updated">Updated ${this._fmtAge(a.last_fetched)}</div>
          ` : ""}

          ${mode === "last_game"
            ? this._renderLastGame(a)
            : mode === "game"
            ? this._renderGame(a, state)
            : this._renderUpcoming(a, state)}

          ${this.config.show_events
            ? mode === "last_game" && a.last_game_events?.length
              ? this._renderGameEvents(a.last_game_events)
              : mode === "game" && a.game_events?.length
              ? this._renderGameEvents(a.game_events)
              : ""
            : ""}

          ${this.config.show_recent_games && a.recent_games?.length
            ? this._renderRecentGames(a.recent_games)
            : ""}
        </div>
      </ha-card>
    `;
  }

  // ------------------------------------------------------------------
  // Game view (LIVE, FINAL, PRE ≤30min)
  // ------------------------------------------------------------------

  _renderGame(a, state) {
    const showScores = state !== "PRE";

    return html`
      <div class="ht-scoreboard">
        <div class="ht-team">
          ${this._logo(a.away_logo_url)}
          <div class="ht-team-name">${a.away_team ?? "Away"}</div>
          ${showScores
            ? html`<div class="ht-score">${a.away_score ?? "—"}</div>`
            : html`<div class="ht-score-dash">—</div>`}
        </div>

        <div class="ht-mid">
          <span class="ht-at-sign">@</span>
        </div>

        <div class="ht-team">
          ${this._logo(a.home_logo_url)}
          <div class="ht-team-name">${a.home_team ?? "Home"}</div>
          ${showScores
            ? html`<div class="ht-score">${a.home_score ?? "—"}</div>`
            : html`<div class="ht-score-dash">—</div>`}
        </div>
      </div>

      ${state === "PRE" ? html`
        <div class="ht-start-time">${this._fmtGameTime(a.start_time)}</div>
      ` : ""}

      ${state === "LIVE" && (a.period || a.clock) ? html`
        <div class="ht-period">
          ${a.period ? this._periodLabel(a.period) : ""}${a.clock ? ` · ${a.clock}` : ""}
        </div>
      ` : ""}

      ${this.config.show_shots && showScores && (a.away_shots != null || a.home_shots != null) ? html`
        <div class="ht-shots">
          <span>${a.away_shots ?? "—"}</span>
          <span>Shots on Goal</span>
          <span>${a.home_shots ?? "—"}</span>
        </div>
      ` : ""}

      ${a.venue ? html`<div class="ht-venue">${a.venue}</div>` : ""}

      ${(state === "LIVE" || state === "FINAL") && a.game_url ? html`
        <div class="ht-game-link">
          <a href="${a.game_url}" target="_blank" rel="noopener noreferrer">
            <ha-icon icon="mdi:open-in-new"></ha-icon>View on league site
          </a>
        </div>
      ` : ""}
    `;
  }

  // ------------------------------------------------------------------
  // Last game view (previous completed game, toggled via history button)
  // ------------------------------------------------------------------

  _renderLastGame(a) {
    if (!a.last_game_home_team) {
      return html`
        <div class="ht-last-game-empty">
          <div class="ht-last-game-empty-text">No saved data from last game</div>
          <button class="ht-last-game-load-btn" @click=${this._refresh}>
            <ha-icon icon="mdi:download"></ha-icon>
            Load Last Game
          </button>
        </div>
      `;
    }

    return html`
      <div class="ht-last-game-label">Previous Game · Final</div>
      <div class="ht-scoreboard">
        <div class="ht-team">
          ${this._logo(a.last_game_away_logo_url)}
          <div class="ht-team-name">${a.last_game_away_team ?? "Away"}</div>
          <div class="ht-score">${a.last_game_away_score ?? "—"}</div>
        </div>
        <div class="ht-mid">
          <span class="ht-at-sign">@</span>
        </div>
        <div class="ht-team">
          ${this._logo(a.last_game_home_logo_url)}
          <div class="ht-team-name">${a.last_game_home_team ?? "Home"}</div>
          <div class="ht-score">${a.last_game_home_score ?? "—"}</div>
        </div>
      </div>

      ${this.config.show_shots && (a.last_game_away_shots != null || a.last_game_home_shots != null) ? html`
        <div class="ht-shots">
          <span>${a.last_game_away_shots ?? "—"}</span>
          <span>Shots on Goal</span>
          <span>${a.last_game_home_shots ?? "—"}</span>
        </div>
      ` : ""}

      ${a.last_game_venue ? html`<div class="ht-venue">${a.last_game_venue}</div>` : ""}

      ${a.last_game_date ? html`
        <div class="ht-venue">${this._fmtGameTime(a.last_game_date)}</div>
      ` : ""}

      ${a.last_game_url ? html`
        <div class="ht-game-link">
          <a href="${a.last_game_url}" target="_blank" rel="noopener noreferrer">
            <ha-icon icon="mdi:open-in-new"></ha-icon>View on league site
          </a>
        </div>
      ` : ""}
    `;
  }

  // ------------------------------------------------------------------
  // Upcoming view (NO_GAME, PRE >30min)
  // ------------------------------------------------------------------

  _renderUpcoming(a, state) {
    // PRE — show home/away matchup, label depends on whether game is actually today
    if (state === "PRE") {
      const label = this._isToday(a.start_time) ? "Today's Game" : "Next Game";
      return html`
        <div class="ht-next-game">
          <div class="ht-next-game-label">${label}</div>
          ${this._upcomingTeams(a.away_logo_url, a.away_team, a.home_logo_url, a.home_team)}
          <div class="ht-next-game-time">${this._fmtGameTime(a.start_time)}</div>
          ${a.venue ? html`<div class="ht-next-game-venue">${a.venue}</div>` : ""}
        </div>
      `;
    }

    if (!this.config.show_next_game) return html``;

    const hasNext = a.next_game_date;
    if (!hasNext) {
      return html`
        <div class="ht-no-games">
          ${this.config.show_logo && a.team_logo_url ? html`
            <div class="ht-no-games-logo">${this._logo(a.team_logo_url)}</div>
          ` : ""}
          <div class="ht-no-games-text">No upcoming games scheduled</div>
        </div>
      `;
    }

    return html`
      <div class="ht-next-game">
        <div class="ht-next-game-label">Next Game</div>
        ${this._upcomingTeams(a.next_game_away_logo_url, a.next_game_away_team, a.next_game_home_logo_url, a.next_game_home_team)}
        <div class="ht-next-game-time">${this._fmtGameTime(a.next_game_date)}</div>
        ${a.next_game_venue ? html`<div class="ht-next-game-venue">${a.next_game_venue}</div>` : ""}
      </div>
    `;
  }

  _upcomingTeams(awayLogo, awayName, homeLogo, homeName) {
    return html`
      <div class="ht-next-game-teams">
        <div class="ht-next-game-team">
          ${this._logo(awayLogo)}
          <span>${awayName ?? "Away"}</span>
        </div>
        <span class="ht-next-game-at">@</span>
        <div class="ht-next-game-team">
          ${this._logo(homeLogo)}
          <span>${homeName ?? "Home"}</span>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------------
  // Game events (goals & penalties)
  // ------------------------------------------------------------------

  _renderGameEvents(events) {
    const visible = events.filter(e => {
      if (e.type === "goal" && this.config.show_event_goals === false) return false;
      if (e.type === "penalty" && this.config.show_event_penalties === false) return false;
      if (e.type === "shot" && this.config.show_event_shots === false) return false;
      return true;
    });
    const count = Math.min(this.config.events_count || 10, visible.length);
    const collapsible = this.config.collapsible_events !== false;
    const collapsed = collapsible && this._eventsCollapsed;
    return html`
      <div class="ht-events">
        <div class="ht-section-header">
          <span class="ht-section-label">Game Events</span>
          ${collapsible ? html`
            <ha-icon
              class="ht-collapse-btn"
              icon="${collapsed ? "mdi:chevron-down" : "mdi:chevron-up"}"
              role="button"
              tabindex="0"
              aria-label="${collapsed ? "Expand game events" : "Collapse game events"}"
              aria-expanded="${collapsed ? "false" : "true"}"
              @click=${() => { this._eventsCollapsed = !this._eventsCollapsed; this.requestUpdate(); }}
              @keydown=${onActivateKey(() => { this._eventsCollapsed = !this._eventsCollapsed; this.requestUpdate(); })}
            ></ha-icon>
          ` : ""}
        </div>
        ${!collapsed ? visible.slice(0, count).map(e =>
          e.type === "goal" ? this._renderGoal(e) :
          e.type === "shot" ? this._renderShot(e) :
          this._renderPenalty(e)
        ) : ""}
      </div>
    `;
  }

  _renderGoal(e) {
    const tag = e.is_power_play ? "PP" : e.is_short_handed ? "SH" : e.is_empty_net ? "EN" : "";
    const assists = e.assists?.length
      ? html`<span class="ht-event-assists"> · ${e.assists.join(", ")}</span>`
      : "";
    return html`
      <div class="ht-event-row ht-event-goal ${e.is_tracked_team ? "ht-event--ours" : ""}">
        <span class="ht-event-dot"></span>
        <span class="ht-event-meta">P${e.period} · ${e.time}</span>
        <span class="ht-event-abbrev">${e.team_abbrev}</span>
        <span class="ht-event-body">
          ${e.player_number != null ? `#${e.player_number} ` : ""}${e.player_name}${tag ? html`<span class="ht-event-tag">${tag}</span>` : ""}${assists}
        </span>
      </div>
    `;
  }

  _renderPenalty(e) {
    return html`
      <div class="ht-event-row ht-event-penalty ${e.is_tracked_team ? "ht-event--ours" : ""}">
        <span class="ht-event-dot"></span>
        <span class="ht-event-meta">P${e.period} · ${e.time}</span>
        <span class="ht-event-abbrev">${e.team_abbrev}</span>
        <span class="ht-event-body">${e.player_number != null ? `#${e.player_number} ` : ""}${e.player_name} — ${e.description} (${e.minutes}min)</span>
      </div>
    `;
  }

  _renderShot(e) {
    return html`
      <div class="ht-event-row ht-event-shot ${e.is_tracked_team ? "ht-event--ours" : ""}">
        <span class="ht-event-dot"></span>
        <span class="ht-event-meta">P${e.period} · ${e.time}</span>
        <span class="ht-event-abbrev">${e.team_abbrev}</span>
        <span class="ht-event-body">SOG: ${e.player_name}</span>
      </div>
    `;
  }

  // ------------------------------------------------------------------
  // Recent games
  // ------------------------------------------------------------------

  _renderRecentGames(games) {
    const count = Math.min(this.config.recent_games_count || 3, games.length);
    const collapsible = this.config.collapsible_recent !== false;
    const collapsed = collapsible && this._recentCollapsed;
    return html`
      <div class="ht-recent">
        <div class="ht-section-header">
          <span class="ht-section-label">Recent Games</span>
          ${collapsible ? html`
            <ha-icon
              class="ht-collapse-btn"
              icon="${collapsed ? "mdi:chevron-down" : "mdi:chevron-up"}"
              role="button"
              tabindex="0"
              aria-label="${collapsed ? "Expand recent games" : "Collapse recent games"}"
              aria-expanded="${collapsed ? "false" : "true"}"
              @click=${() => { this._recentCollapsed = !this._recentCollapsed; this.requestUpdate(); }}
              @keydown=${onActivateKey(() => { this._recentCollapsed = !this._recentCollapsed; this.requestUpdate(); })}
            ></ha-icon>
          ` : ""}
        </div>
        ${!collapsed ? games.slice(0, count).map(g => html`
          <div
            class="ht-recent-row ${g.game_url ? "ht-recent-row--link" : ""}"
            role=${g.game_url ? "link" : "listitem"}
            tabindex=${g.game_url ? "0" : "-1"}
            @click=${() => g.game_url && window.open(g.game_url, "_blank", "noopener")}
            @keydown=${onActivateKey(() => g.game_url && window.open(g.game_url, "_blank", "noopener"))}
          >
            <span class="ht-result ${g.win ? 'ht-result--win' : 'ht-result--loss'}">${g.win ? "W" : "L"}</span>
            <span class="ht-opponent">${g.is_home ? "vs" : "@"} ${g.opponent}</span>
            <span class="ht-recent-score">${g.team_score}–${g.opponent_score}</span>
            <span class="ht-recent-date">${this._fmtShortDate(g.date)}</span>
            ${g.game_url ? html`<ha-icon class="ht-recent-link-icon" icon="mdi:open-in-new"></ha-icon>` : ""}
          </div>
        `) : ""}
      </div>
    `;
  }

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------

  _cardTitle(a, stateObj) {
    if (this.config.title) return this.config.title;
    if (a.home_team && a.away_team) {
      return a.is_home ? a.home_team : a.away_team;
    }
    return a.team_name || stateObj.attributes.friendly_name?.replace(/ Game$/i, "") || "";
  }

  _logo(url, size) {
    size = size ?? this.config.logo_size ?? 64;
    if (!this.config.show_logo) return html``;
    if (url && !this._failedLogos.has(url)) {
      return html`
        <img
          class="ht-logo"
          style="width:${size}px;height:${size}px"
          src="${url}"
          alt=""
          @error=${() => { this._failedLogos.add(url); this.requestUpdate(); }}
        >`;
    }
    return html`<ha-icon class="ht-logo-icon" style="--mdc-icon-size:${size}px" icon="mdi:hockey-puck"></ha-icon>`;
  }

  _periodLabel(period) {
    if (period <= 3) return `Period ${period}`;
    if (period === 4) return "OT";
    return `OT${period - 3}`;
  }

  _isToday(iso) {
    if (!iso) return false;
    try {
      const { language, timeZone: tz, hour12 } = localeOpts(this.hass);
      const opts = { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" };
      return (
        new Date(iso).toLocaleDateString(language, opts) ===
        new Date().toLocaleDateString(language, opts)
      );
    } catch {
      return new Date(iso).toDateString() === new Date().toDateString();
    }
  }

  _fmtGameTime(iso) {
    if (!iso) return "";
    try {
      const { language, timeZone: tz, hour12 } = localeOpts(this.hass);
      return new Date(iso).toLocaleString(language, {
        timeZone: tz,
        hour12,
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      });
    } catch {
      return iso;
    }
  }

  _fmtShortDate(iso) {
    if (!iso) return "";
    try {
      const { language, timeZone: tz, hour12 } = localeOpts(this.hass);
      return new Date(iso).toLocaleDateString(language, {
        timeZone: tz,
        hour12,
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  }

  _fmtAge(iso) {
    if (!iso) return "";
    try {
      const secs = Math.floor((Date.now() - new Date(iso)) / 1000);
      if (secs < 10) return "just now";
      if (secs < 60) return `${secs}s ago`;
      const mins = Math.floor(secs / 60);
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      return `${hrs}h ago`;
    } catch {
      return "";
    }
  }

  async _refresh() {
    if (!this.hass || !this.config.entity) return;
    await refreshEntity(this.hass, this.config.entity);
  }
}

defineElement("hockey-tracker-card", HockeyTrackerCard);

// ---------------------------------------------------------------------------
// Playoff Tracker Card Editor
// ---------------------------------------------------------------------------

class HockeyPlayoffCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, config: {} };
  }

  setConfig(config) {
    this.config = {
      show_logo: true,
      logo_size: 132,
      show_shots: true,
      show_next_game: true,
      show_events: true,
      events_count: 10,
      collapsible_events: true,
      show_event_goals: true,
      show_event_penalties: true,
      show_event_shots: true,
      show_last_updated: true,
      ...config,
    };
  }

  static get _schema() {
    return [
      { name: "entity", required: true, selector: { entity: { domain: "sensor" } } },
      { name: "title", selector: { text: {} } },
      { name: "show_logo", selector: { boolean: {} } },
      {
        name: "logo_size",
        default: 132,
        selector: { number: { min: 24, max: 200, step: 4, mode: "slider" } },
      },
      { name: "show_shots", selector: { boolean: {} } },
      { name: "show_next_game", selector: { boolean: {} } },
      { name: "show_events", selector: { boolean: {} } },
      {
        name: "events_count",
        default: 10,
        selector: { number: { min: 3, max: 25, step: 1, mode: "box" } },
      },
      { name: "collapsible_events", selector: { boolean: {} } },
      { name: "show_event_goals", selector: { boolean: {} } },
      { name: "show_event_penalties", selector: { boolean: {} } },
      { name: "show_event_shots", selector: { boolean: {} } },
      { name: "show_last_updated", selector: { boolean: {} } },
    ];
  }

  _computeLabel(schema) {
    return {
      entity:             "Sensor Entity",
      title:              "Card Title (leave blank to auto-derive)",
      show_logo:          "Show team logos",
      logo_size:          "Game view logo size in px (24–200, default: 132)",
      show_shots:         "Show shots on goal in game view",
      show_next_game:     "Show next game when no game is active",
      show_events:        "Show live game events (goals & penalties) in game view",
      events_count:       "Number of events to display (3–25, default: 10)",
      collapsible_events:   "Allow game events section to be collapsed",
      show_event_goals:     "Show goal events in ticker",
      show_event_penalties: "Show penalty events in ticker",
      show_event_shots:     "Show shot events in ticker (NHL only)",
      show_last_updated:  "Show time since last data refresh",
    }[schema.name] ?? schema.name;
  }

  _valueChanged(ev) {
    ev.stopPropagation();
    fireConfigChanged(this, ev.detail.value);
  }

  render() {
    if (!this.hass || !this.config) return html``;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${HockeyPlayoffCardEditor._schema}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}

defineElement("hockey-playoff-card-editor", HockeyPlayoffCardEditor);

// ---------------------------------------------------------------------------
// Playoff Tracker Card
// ---------------------------------------------------------------------------

class HockeyPlayoffCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
      _view: { state: true },
      _collapsedRounds: { state: true },
      _eventsCollapsed: { state: true },
      _selectedSeries: { state: true },
    };
  }

  static get styles() {
    return [
      // Pull in all ht-* styles so the game view renders correctly
      HockeyTrackerCard.styles,
      css`
        ha-card { overflow: hidden; }
        .hp-content { padding: 12px 16px; }

        /* Header */
        .hp-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .hp-badge { padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #fff; background: #555; flex-shrink: 0; }
        .hp-badge--live { background: #c62828; animation: hp-pulse 1.6s ease-in-out infinite; }
        .hp-badge--pre  { background: #1565c0; }
        .hp-badge--final{ background: #2e7d32; }
        .hp-badge--none { background: #555; }
        @keyframes hp-pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
        .hp-title { flex: 1; font-weight: 600; font-size: 1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; }
        .hp-header-btns { display: flex; gap: 4px; flex-shrink: 0; }
        .hp-icon-btn { background: none; border: none; cursor: pointer; color: var(--primary-text-color); opacity: 0.6; padding: 4px; border-radius: 4px; font-size: 1.1rem; line-height: 1; }
        .hp-icon-btn:hover { opacity: 1; background: var(--secondary-background-color); }
        .hp-icon-btn--active { opacity: 1; color: var(--primary-color); }
        .hp-last-updated { font-size: 0.7rem; color: var(--secondary-text-color); margin-bottom: 10px; }

        /* Round headers */
        .hp-round { margin-bottom: 10px; }
        .hp-round-header { display: flex; align-items: center; justify-content: space-between; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--secondary-text-color); padding: 4px 0; border-bottom: 1px solid var(--divider-color); margin-bottom: 6px; cursor: pointer; user-select: none; }
        .hp-round-chevron { font-size: 0.8rem; transition: transform 0.2s; }
        .hp-round-chevron--open { transform: rotate(90deg); }

        /* Series — stacked matchup layout */
        .hp-series { margin-bottom: 6px; border-radius: 6px; overflow: hidden; border: 1px solid var(--divider-color); transition: border-color 0.15s; }
        .hp-series:hover { border-color: var(--secondary-text-color); }
        .hp-series--followed { border-color: var(--primary-color, #03a9f4); border-left: 3px solid var(--primary-color, #03a9f4); }
        .hp-series-team-row { display: flex; align-items: center; gap: 6px; padding: 5px 8px; }
        .hp-series-team-row + .hp-series-team-row { border-top: 1px solid var(--divider-color); }
        .hp-series-logo { width: 24px; height: 24px; object-fit: contain; flex-shrink: 0; }
        .hp-series-logo-ph { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700; color: var(--secondary-text-color); flex-shrink: 0; }
        .hp-series-abbrev { font-size: 0.75rem; font-weight: 700; color: var(--primary-text-color); flex-shrink: 0; min-width: 30px; }
        .hp-series-abbrev--winner { color: var(--primary-color, #03a9f4); }
        .hp-series-name { flex: 1; font-size: 0.75rem; color: var(--secondary-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .hp-series-wins { font-size: 1.05rem; font-weight: 700; color: var(--primary-text-color); min-width: 16px; text-align: right; flex-shrink: 0; }
        .hp-series-wins--leader { color: var(--primary-color, #03a9f4); }
        .hp-series-wins--loser { color: var(--secondary-text-color); font-weight: 400; }
        .hp-series-status-row { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 3px 8px 4px; background: var(--secondary-background-color); border-top: 1px solid var(--divider-color); }
        .hp-series-live-score { font-size: 0.8rem; font-weight: 700; color: var(--primary-text-color); }
        .hp-series-status { font-size: 0.68rem; text-align: center; color: var(--secondary-text-color); }
        .hp-series-status--live { color: #c62828; font-weight: 700; }
        .hp-series-status--pre { color: #1565c0; }

        /* Series wins column header in bracket */
        .hp-series-wins-hdr-row { display: flex; justify-content: flex-end; padding: 2px 8px 0; }
        .hp-series-wins-hdr { font-size: 0.58rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--disabled-color, #9e9e9e); }
        /* Series detail — standings */
        .hp-standings-heading { font-size: 0.63rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--secondary-text-color); text-align: center; padding: 8px 0 4px; }
        .hp-standings-row { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 2px 0 6px; }
        .hp-standings-team { font-size: 0.8rem; color: var(--secondary-text-color); flex: 1; text-align: center; }
        .hp-standings-score { font-size: 1.8rem; font-weight: 700; color: var(--primary-text-color); line-height: 1; }
        .hp-standings-dash { font-size: 1.2rem; color: var(--secondary-text-color); }
        .hp-standings-leader { color: var(--primary-color, #03a9f4) !important; }
        .hp-standings-divider { border-top: 1px solid var(--divider-color); margin: 0 0 8px; }
        .hp-series-no-game-status { text-align: center; font-size: 0.78rem; color: var(--secondary-text-color); padding: 4px 0; }
        /* hp-standings-divider already provides the visual separator; cancel the inherited border */
        .ht-next-game { border-top: none; padding-top: 4px; }
      `,
    ];
  }

  constructor() {
    super();
    this._view = "bracket";
    this._collapsedRounds = new Set();
    this._eventsCollapsed = false;
    this._autoCollapseDone = false;
    this._failedLogos = new Set();
    this._selectedSeries = null;
  }

  setConfig(config) {
    if (!config.entity) throw new Error("entity is required");
    this.config = {
      show_logo: true,
      logo_size: 132,
      show_shots: true,
      show_next_game: true,
      show_events: true,
      events_count: 10,
      collapsible_events: true,
      show_event_goals: true,
      show_event_penalties: true,
      show_event_shots: true,
      show_last_updated: true,
      ...config,
    };
    this._autoCollapseDone = false;
    this._failedLogos = new Set();
  }

  static getConfigElement() {
    return document.createElement("hockey-playoff-card-editor");
  }

  static getStubConfig(hass) {
    return { entity: findHockeySensor(hass, true) };
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6 };
  }

  shouldUpdate(changedProps) {
    return hassChangeAffects(changedProps, this.hass, this.config?.entity);
  }

  // Applied before render so the collapsed rounds show on the first render
  // (as updated() it only took effect on the next state change)
  willUpdate(changedProps) {
    super.willUpdate(changedProps);
    // One-time auto-collapse of rounds before the current active round.
    // Guard: only run while in bracket view so a pending collapse never
    // interferes with a just-triggered series detail render.
    if (!this._autoCollapseDone && this._view === "bracket") {
      const bracket = this._attr.bracket || [];
      if (bracket.length > 0) {
        this._autoCollapseDone = true;
        if (bracket.length > 1) {
          const current = this._attr.current_round || 0;
          const collapsed = new Set();
          for (const r of bracket) {
            if (r.round_number < current) collapsed.add(r.round_number);
          }
          this._collapsedRounds = collapsed;
        }
      }
    }
  }

  get _stateObj() {
    return this.hass?.states[this.config?.entity];
  }

  get _attr() {
    return this._stateObj?.attributes || {};
  }

  _badge() {
    if (this._stateObj?.state === "LIVE") {
      return html`<span class="hp-badge hp-badge--live">LIVE</span>`;
    }
    return html`<ha-icon icon="mdi:hockey-puck" style="color:var(--secondary-text-color);opacity:0.5;flex-shrink:0;--mdi-icon-size:1.2rem;"></ha-icon>`;
  }

  _title() {
    if (this.config.title) return this.config.title;
    const league = this._attr.league || "";
    const cupNames = {
      NHL: "Stanley Cup Playoffs",
      AHL: "Calder Cup Playoffs",
      ECHL: "Kelly Cup Playoffs",
      OHL: "OHL Playoffs",
      WHL: "WHL Playoffs",
      QMJHL: "President's Cup Playoffs",
      PWHL: "PWHL Playoffs",
      USHL: "Clark Cup Playoffs",
    };
    return cupNames[league] || `${league} Playoffs`;
  }

  _timeAgo(iso) {
    if (!iso) return "";
    try {
      const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
      if (secs < 10) return "just now";
      if (secs < 60) return `${secs}s ago`;
      if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
      return `${Math.floor(secs / 3600)}h ago`;
    } catch {
      return "";
    }
  }

  // ------------------------------------------------------------------
  // Bracket view
  // ------------------------------------------------------------------

  _renderBracket() {
    const bracket = this._attr.bracket || [];
    if (!bracket.length) {
      return html`<div style="text-align:center;padding:20px 0;color:var(--secondary-text-color)">No playoff data available.</div>`;
    }
    return html`${bracket.map((round) => html`
      <div class="hp-round">
        <div class="hp-round-header" role="button" tabindex="0"
             aria-expanded="${this._collapsedRounds.has(round.round_number) ? "false" : "true"}"
             @click=${() => this._toggleRound(round.round_number)}
             @keydown=${onActivateKey(() => this._toggleRound(round.round_number))}>
          <span>${round.round_name}</span>
          <span class="hp-round-chevron ${this._collapsedRounds.has(round.round_number) ? "" : "hp-round-chevron--open"}">▶</span>
        </div>
        ${this._collapsedRounds.has(round.round_number)
          ? html``
          : html`${round.series.map((s) => this._renderSeries(s))}`
        }
      </div>
    `)}`;
  }

  _toggleRound(roundNum) {
    const next = new Set(this._collapsedRounds);
    if (next.has(roundNum)) next.delete(roundNum);
    else next.add(roundNum);
    this._collapsedRounds = next;
  }

  _renderSeries(s) {
    const followed = s.team1_is_followed || s.team2_is_followed;
    const t1wins = s.team1_wins || 0;
    const t2wins = s.team2_wins || 0;
    const complete = s.status === "complete";
    const t1leads = t1wins > t2wins;
    const t2leads = t2wins > t1wins;
    const isLive = s.game_state === "LIVE";
    const showLogo = this.config.show_logo !== false;

    return html`
      <div class="hp-series ${followed ? "hp-series--followed" : ""}"
           style="cursor:pointer"
           role="button" tabindex="0"
           aria-label="${`${s.team1_name || s.team1_abbrev || "TBD"} vs ${s.team2_name || s.team2_abbrev || "TBD"}, series ${t1wins}–${t2wins}`}"
           @click=${(e) => { e.stopPropagation(); this._selectSeries(s); }}
           @keydown=${onActivateKey((e) => { e.stopPropagation(); this._selectSeries(s); })}>
        <div class="hp-series-wins-hdr-row">
          <span class="hp-series-wins-hdr">W</span>
        </div>
        <div class="hp-series-team-row">
          ${showLogo ? this._seriesLogo(s.team1_logo_url, s.team1_abbrev) : ""}
          <span class="hp-series-abbrev ${s.winner_id === s.team1_id ? "hp-series-abbrev--winner" : ""}">${s.team1_abbrev || "TBD"}</span>
          <span class="hp-series-name">${s.team1_name || ""}</span>
          <span class="hp-series-wins ${t1leads ? "hp-series-wins--leader" : (complete && !t1leads ? "hp-series-wins--loser" : "")}">${t1wins}</span>
        </div>
        <div class="hp-series-team-row">
          ${showLogo ? this._seriesLogo(s.team2_logo_url, s.team2_abbrev) : ""}
          <span class="hp-series-abbrev ${s.winner_id === s.team2_id ? "hp-series-abbrev--winner" : ""}">${s.team2_abbrev || "TBD"}</span>
          <span class="hp-series-name">${s.team2_name || ""}</span>
          <span class="hp-series-wins ${t2leads ? "hp-series-wins--leader" : (complete && !t2leads ? "hp-series-wins--loser" : "")}">${t2wins}</span>
        </div>
        <div class="hp-series-status-row">
          ${isLive ? html`<span class="hp-series-live-score">${s.game_score || "0-0"}</span>` : ""}
          <span class="hp-series-status ${isLive ? "hp-series-status--live" : (s.game_state === "PRE" ? "hp-series-status--pre" : "")}">${this._seriesStatusLabel(s)}</span>
        </div>
      </div>
    `;
  }

  _selectSeries(s) {
    this._selectedSeries = s;
    this._view = "series";
    this.requestUpdate();
  }

  _seriesLogo(url, abbrev) {
    if (!url || this._failedLogos.has(url)) {
      return html`<div class="hp-series-logo-ph">${abbrev || "?"}</div>`;
    }
    return html`
      <img
        class="hp-series-logo"
        src="${url}"
        alt="${abbrev || ""}"
        @error=${() => { this._failedLogos.add(url); this.requestUpdate(); }}
      >`;
  }

  _fmtSeriesTime(iso) {
    if (!iso) return "";
    try {
      const { language, timeZone: tz, hour12 } = localeOpts(this.hass);
      return new Date(iso).toLocaleTimeString(language, {
        timeZone: tz,
        hour12,
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      });
    } catch { return ""; }
  }

  _fmtSeriesDateTime(iso) {
    if (!iso) return "";
    try {
      const { language, timeZone: tz, hour12 } = localeOpts(this.hass);
      return new Date(iso).toLocaleString(language, {
        timeZone: tz,
        hour12,
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      });
    } catch { return iso; }
  }

  _seriesStatusLabel(s) {
    if (s.game_state === "LIVE") {
      const p = s.game_period ? `P${s.game_period}` : "";
      const c = s.game_clock || "";
      return [p, c].filter(Boolean).join(" ") || "LIVE";
    }
    if (s.game_state === "PRE") {
      const dayLabel = this._isToday(s.game_start_time) ? "Today" : this._fmtShortDate(s.game_start_time) || "Upcoming";
      const t = s.game_start_time ? ` · ${this._fmtSeriesTime(s.game_start_time)}` : "";
      return `${dayLabel}${t}`;
    }
    // game_state === "FINAL" means today's game just ended — show series standing, not "Final"
    if (s.status === "complete") {
      const w = s.team1_wins > s.team2_wins ? s.team1_abbrev : s.team2_abbrev;
      const ws = Math.max(s.team1_wins, s.team2_wins);
      const ls = Math.min(s.team1_wins, s.team2_wins);
      return `${w} wins ${ws}–${ls}`;
    }
    if (s.status === "scheduled") return "Upcoming";
    const t1wins = s.team1_wins || 0, t2wins = s.team2_wins || 0;
    if (t1wins === t2wins) return t1wins > 0 ? `Tied ${t1wins}–${t2wins}` : "Game 1";
    const leader = t1wins > t2wins ? s.team1_abbrev : s.team2_abbrev;
    return `${leader} leads ${Math.max(t1wins, t2wins)}–${Math.min(t1wins, t2wins)}`;
  }

  // ------------------------------------------------------------------
  // Helpers shared with team card (duplicated here — HockeyPlayoffCard
  // does not extend HockeyTrackerCard)
  // ------------------------------------------------------------------

  _periodLabel(period) {
    if (period <= 3) return `Period ${period}`;
    if (period === 4) return "OT";
    return `OT${period - 3}`;
  }

  _isToday(iso) {
    if (!iso) return false;
    try {
      const { language, timeZone: tz, hour12 } = localeOpts(this.hass);
      const opts = { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" };
      return (
        new Date(iso).toLocaleDateString(language, opts) ===
        new Date().toLocaleDateString(language, opts)
      );
    } catch {
      return new Date(iso).toDateString() === new Date().toDateString();
    }
  }

  _fmtGameTime(iso) {
    if (!iso) return "";
    try {
      const { language, timeZone: tz, hour12 } = localeOpts(this.hass);
      return new Date(iso).toLocaleString(language, {
        timeZone: tz,
        hour12,
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      });
    } catch {
      return iso;
    }
  }

  _fmtShortDate(iso) {
    if (!iso) return "";
    try {
      const { language, timeZone: tz, hour12 } = localeOpts(this.hass);
      return new Date(iso).toLocaleDateString(language, {
        timeZone: tz,
        hour12,
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  }

  _upcomingTeams(awayLogo, awayName, homeLogo, homeName) {
    return html`
      <div class="ht-next-game-teams">
        <div class="ht-next-game-team">
          ${this._gameLogo(awayLogo, 64)}
          <span>${awayName ?? "Away"}</span>
        </div>
        <span class="ht-next-game-at">@</span>
        <div class="ht-next-game-team">
          ${this._gameLogo(homeLogo, 64)}
          <span>${homeName ?? "Home"}</span>
        </div>
      </div>
    `;
  }

  // Neutral team pair display (no "@" — used when home/away isn't known, e.g. bracket-series PRE view)
  _seriesTeams(logo1, name1, logo2, name2) {
    return html`
      <div class="ht-next-game-teams">
        <div class="ht-next-game-team">
          ${this._gameLogo(logo1, 64)}
          <span>${name1 ?? "Team 1"}</span>
        </div>
        <span class="ht-next-game-at">vs</span>
        <div class="ht-next-game-team">
          ${this._gameLogo(logo2, 64)}
          <span>${name2 ?? "Team 2"}</span>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------------
  // Series detail view (shown when a bracket series is clicked)
  // ------------------------------------------------------------------

  _isActiveGame(s) {
    const attr = this._attr;
    const hid = attr.home_team_id;
    const aid = attr.away_team_id;
    if (hid && aid) {
      const idSet = new Set([String(hid), String(aid)]);
      if (idSet.has(String(s.team1_id)) && idSet.has(String(s.team2_id))) return true;
    }
    // Fallback: match by abbreviation (handles HT where bracket team1_id may be
    // the schedule's home_team code rather than the scorebar's HomeID)
    const ha = attr.home_team_abbrev;
    const aa = attr.away_team_abbrev;
    if (ha && aa && s.team1_abbrev && s.team2_abbrev) {
      const abbrSet = new Set([String(ha), String(aa)]);
      if (abbrSet.has(String(s.team1_abbrev)) && abbrSet.has(String(s.team2_abbrev))) return true;
    }
    return false;
  }

  _renderSeriesDetail(s) {
    const isActive = this._isActiveGame(s);
    const state = this._stateObj?.state || "NO_GAME";
    const attr = this._attr;
    const t1wins = s.team1_wins ?? 0;
    const t2wins = s.team2_wins ?? 0;

    return html`
      <div class="hp-standings-heading">Series</div>
      <div class="hp-standings-row">
        <span class="hp-standings-team ${t1wins > t2wins ? "hp-standings-leader" : ""}">${s.team1_name || s.team1_abbrev || "TBD"}</span>
        <span class="hp-standings-score ${t1wins > t2wins ? "hp-standings-leader" : ""}">${t1wins}</span>
        <span class="hp-standings-dash">–</span>
        <span class="hp-standings-score ${t2wins > t1wins ? "hp-standings-leader" : ""}">${t2wins}</span>
        <span class="hp-standings-team ${t2wins > t1wins ? "hp-standings-leader" : ""}">${s.team2_name || s.team2_abbrev || "TBD"}</span>
      </div>
      <div class="hp-standings-divider"></div>
      ${this._renderSeriesGameSection(s, isActive, state, attr)}
    `;
  }

  _renderSeriesGameSection(s, isActive, state, attr) {
    if (isActive) {
      const mode = this._seriesDisplayMode(state, attr);
      return mode === "game"
        ? this._renderSeriesGameView(state, attr)
        : this._renderSeriesUpcomingView(state, attr);
    }
    return this._renderSeriesNonActiveGame(s);
  }

  _seriesDisplayMode(state, attr) {
    if (state === "LIVE" || state === "FINAL") return "game";
    if (state === "PRE" && attr.start_time) {
      const minsUntil = (new Date(attr.start_time) - Date.now()) / 60000;
      return minsUntil <= 30 ? "game" : "upcoming";
    }
    return "upcoming";
  }

  _renderSeriesGameView(state, attr) {
    const showScores = state !== "PRE";
    const logoSize = this.config.logo_size ?? 64;
    const showShots = this.config.show_shots !== false &&
      (attr.home_shots != null || attr.away_shots != null);

    return html`
      <div class="ht-scoreboard" style="border-top:none">
        <div class="ht-team">
          ${this._gameLogo(attr.away_logo_url, logoSize)}
          <div class="ht-team-name">${attr.away_team ?? "Away"}</div>
          ${showScores
            ? html`<div class="ht-score">${attr.away_score ?? "—"}</div>`
            : html`<div class="ht-score-dash">—</div>`}
        </div>
        <div class="ht-mid"><span class="ht-at-sign">@</span></div>
        <div class="ht-team">
          ${this._gameLogo(attr.home_logo_url, logoSize)}
          <div class="ht-team-name">${attr.home_team ?? "Home"}</div>
          ${showScores
            ? html`<div class="ht-score">${attr.home_score ?? "—"}</div>`
            : html`<div class="ht-score-dash">—</div>`}
        </div>
      </div>
      ${state === "PRE" ? html`
        <div class="ht-start-time">${this._fmtGameTime(attr.start_time)}</div>
      ` : ""}
      ${state === "LIVE" && (attr.period || attr.clock) ? html`
        <div class="ht-period">
          ${attr.period ? this._periodLabel(attr.period) : ""}${attr.clock ? ` · ${attr.clock}` : ""}
        </div>
      ` : ""}
      ${state === "FINAL" ? html`<div class="ht-period">Final</div>` : ""}
      ${showScores && showShots ? html`
        <div class="ht-shots">
          <span>${attr.away_shots ?? "—"}</span>
          <span>Shots on Goal</span>
          <span>${attr.home_shots ?? "—"}</span>
        </div>
      ` : ""}
      ${attr.venue ? html`<div class="ht-venue">${attr.venue}</div>` : ""}

      ${(state === "LIVE" || state === "FINAL") && attr.game_url ? html`
        <div class="ht-game-link">
          <a href="${attr.game_url}" target="_blank" rel="noopener noreferrer">
            <ha-icon icon="mdi:open-in-new"></ha-icon>View on league site
          </a>
        </div>
      ` : ""}

      ${this._renderPlayoffEvents(attr, true)}
    `;
  }

  _renderSeriesUpcomingView(state, attr) {
    if (state === "PRE") {
      const label = this._isToday(attr.start_time) ? "Today's Game" : "Next Game";
      return html`
        <div class="ht-next-game">
          <div class="ht-next-game-label">${label}</div>
          ${this._upcomingTeams(attr.away_logo_url, attr.away_team, attr.home_logo_url, attr.home_team)}
          <div class="ht-next-game-time">${this._fmtGameTime(attr.start_time)}</div>
          ${attr.venue ? html`<div class="ht-next-game-venue">${attr.venue}</div>` : ""}
        </div>
      `;
    }
    if (!this.config.show_next_game) return html``;
    const ng = attr.next_game;
    if (!ng?.game_date) return html``;
    return html`
      <div class="ht-next-game">
        <div class="ht-next-game-label">Next Game</div>
        ${this._upcomingTeams(ng.away_logo_url, ng.away_team, ng.home_logo_url, ng.home_team)}
        <div class="ht-next-game-time">${this._fmtGameTime(ng.game_date)}</div>
        ${ng.venue ? html`<div class="ht-next-game-venue">${ng.venue}</div>` : ""}
      </div>
    `;
  }

  _renderSeriesNonActiveGame(s) {
    const logoSize = this.config.logo_size ?? 64;

    if (s.game_state === "LIVE" && s.game_score) {
      const period = s.game_period ? this._periodLabel(s.game_period) : "";
      const clock = s.game_clock || "";
      const periodInfo = [period, clock].filter(Boolean).join(" · ");
      return html`
        <div class="ht-scoreboard" style="border-top:none">
          <div class="ht-team">
            ${this._gameLogo(s.team1_logo_url, logoSize)}
            <div class="ht-team-name">${s.team1_name || s.team1_abbrev || "TBD"}</div>
          </div>
          <div class="ht-mid">
            <div style="text-align:center">
              <div style="color:#c62828;font-size:0.65rem;font-weight:700;letter-spacing:0.05em">🔴 LIVE</div>
              <div class="ht-score" style="font-size:1.5rem">${s.game_score}</div>
              ${periodInfo ? html`<div class="ht-period" style="margin-top:2px">${periodInfo}</div>` : ""}
            </div>
          </div>
          <div class="ht-team">
            ${this._gameLogo(s.team2_logo_url, logoSize)}
            <div class="ht-team-name">${s.team2_name || s.team2_abbrev || "TBD"}</div>
          </div>
        </div>
      `;
    }
    if (s.game_state === "FINAL" && s.game_score) {
      return html`
        <div class="ht-scoreboard" style="border-top:none">
          <div class="ht-team">
            ${this._gameLogo(s.team1_logo_url, logoSize)}
            <div class="ht-team-name">${s.team1_name || s.team1_abbrev || "TBD"}</div>
          </div>
          <div class="ht-mid">
            <div style="text-align:center">
              <div class="ht-score" style="font-size:1.5rem">${s.game_score}</div>
              <div class="ht-period">Final</div>
            </div>
          </div>
          <div class="ht-team">
            ${this._gameLogo(s.team2_logo_url, logoSize)}
            <div class="ht-team-name">${s.team2_name || s.team2_abbrev || "TBD"}</div>
          </div>
        </div>
      `;
    }
    if (s.game_state === "PRE" && s.game_start_time) {
      const label = this._isToday(s.game_start_time) ? "Today's Game" : "Next Game";
      return html`
        <div class="ht-next-game">
          <div class="ht-next-game-label">${label}</div>
          ${this._seriesTeams(s.team1_logo_url, s.team1_name || s.team1_abbrev, s.team2_logo_url, s.team2_name || s.team2_abbrev)}
          <div class="ht-next-game-time">${this._fmtGameTime(s.game_start_time)}</div>
        </div>
      `;
    }
    // Try to show the entity's next_game if it's confirmed to be for this series.
    // The coordinator now includes home/away team IDs or abbrevs in next_game so
    // we can reliably match without comparing long name strings.
    if (this.config.show_next_game !== false) {
      const ng = this._attr.next_game;
      if (ng?.game_date) {
        const ngIds = new Set(
          [ng.home_team_abbrev, ng.away_team_abbrev, ng.home_team_id, ng.away_team_id]
            .filter(Boolean).map(String)
        );
        const s1 = [s.team1_id, s.team1_abbrev].filter(Boolean).map(String);
        const s2 = [s.team2_id, s.team2_abbrev].filter(Boolean).map(String);
        if (s1.some(id => ngIds.has(id)) && s2.some(id => ngIds.has(id))) {
          return html`
            <div class="ht-next-game">
              <div class="ht-next-game-label">Next Game</div>
              ${this._upcomingTeams(ng.away_logo_url, ng.away_team, ng.home_logo_url, ng.home_team)}
              <div class="ht-next-game-time">${this._fmtGameTime(ng.game_date)}</div>
              ${ng.venue ? html`<div class="ht-next-game-venue">${ng.venue}</div>` : ""}
            </div>
          `;
        }
      }
    }
    // Fallback: show the series standing as a subtle status line
    const statusLabel = this._seriesStatusLabel(s);
    if (statusLabel) {
      return html`<div class="hp-series-no-game-status">${statusLabel}</div>`;
    }
    return html``;
  }

  _gameLogo(url, size) {
    if (this.config.show_logo === false) return html``;
    if (url) {
      return html`<img class="ht-logo" style="width:${size}px;height:${size}px" src="${url}" alt="" @error=${(e) => { e.target.style.display = "none"; }}>`;
    }
    return html`<ha-icon class="ht-logo-icon" style="--mdc-icon-size:${size}px" icon="mdi:hockey-puck"></ha-icon>`;
  }

  _renderPlayoffEvents(attr, isActive) {
    if (!this.config.show_events || !isActive) return html``;
    const visible = (attr.game_events || []).filter(e => {
      if (e.type === "goal" && this.config.show_event_goals === false) return false;
      if (e.type === "penalty" && this.config.show_event_penalties === false) return false;
      if (e.type === "shot" && this.config.show_event_shots === false) return false;
      return true;
    }).slice(0, this.config.events_count || 10);
    if (!visible.length) return html``;

    const collapsible = this.config.collapsible_events !== false;
    const collapsed = collapsible && this._eventsCollapsed;

    return html`
      <div class="ht-events">
        <div class="ht-section-header">
          <span class="ht-section-label">Game Events</span>
          ${collapsible ? html`
            <ha-icon
              class="ht-collapse-btn"
              icon="${collapsed ? "mdi:chevron-down" : "mdi:chevron-up"}"
              role="button"
              tabindex="0"
              aria-label="${collapsed ? "Expand game events" : "Collapse game events"}"
              aria-expanded="${collapsed ? "false" : "true"}"
              @click=${() => { this._eventsCollapsed = !this._eventsCollapsed; this.requestUpdate(); }}
              @keydown=${onActivateKey(() => { this._eventsCollapsed = !this._eventsCollapsed; this.requestUpdate(); })}
            ></ha-icon>
          ` : ""}
        </div>
        ${!collapsed ? visible.map((e) => {
          const typeClass = e.type === "goal" ? "ht-event-goal" : e.type === "shot" ? "ht-event-shot" : "ht-event-penalty";
          return html`
            <div class="ht-event-row ${typeClass} ${e.is_tracked_team ? "ht-event--ours" : ""}">
              <span class="ht-event-dot"></span>
              <span class="ht-event-meta">P${e.period} ${e.time}</span>
              <span class="ht-event-abbrev">${e.team_abbrev}</span>
              <span class="ht-event-body">
                ${e.player_name}
                ${e.type === "goal" ? html`
                  ${e.is_power_play ? html`<span class="ht-event-tag">PP</span>` : ""}
                  ${e.is_short_handed ? html`<span class="ht-event-tag">SH</span>` : ""}
                  ${e.is_empty_net ? html`<span class="ht-event-tag">EN</span>` : ""}
                  ${e.assists?.length ? html`<span class="ht-event-assists"> · ${e.assists.join(", ")}</span>` : ""}
                ` : e.type === "shot" ? html`` : html`<span class="ht-event-assists">${e.description || ""} ${e.minutes ? `(${e.minutes} min)` : ""}</span>`}
              </span>
            </div>
          `;
        }) : ""}
      </div>
    `;
  }

  async _refresh() {
    if (!this.hass || !this.config?.entity) return;
    await refreshEntity(this.hass, this.config.entity);
  }

  render() {
    if (!this.hass || !this.config?.entity) {
      return html`<ha-card><div class="hp-content">Configure entity.</div></ha-card>`;
    }
    const attr = this._attr;
    const inSeries = this._view === "series" && this._selectedSeries;

    return html`
      <ha-card>
        <div class="hp-content">
          <div class="hp-header">
            ${this._badge()}
            <span class="hp-title">${inSeries
              ? (this._selectedSeries.team1_abbrev || "?") + " vs " + (this._selectedSeries.team2_abbrev || "?")
              : this._title()}</span>
            <div class="hp-header-btns">
              <button
                class="hp-icon-btn ${!inSeries ? "hp-icon-btn--active" : ""}"
                title="Bracket view"
                aria-label="Bracket view"
                @click=${() => { this._view = "bracket"; this._selectedSeries = null; }}
              >🏒</button>
              <button class="hp-icon-btn" title="Refresh" aria-label="Refresh" @click=${this._refresh}>↻</button>
            </div>
          </div>
          ${this.config.show_last_updated !== false
            ? html`<div class="hp-last-updated">Updated ${this._timeAgo(attr.last_fetched)}</div>`
            : ""}
          ${inSeries
            ? this._renderSeriesDetail(this._selectedSeries)
            : this._renderBracket()
          }
        </div>
      </ha-card>
    `;
  }
}

defineElement("hockey-playoff-card", HockeyPlayoffCard);

window.customCards = window.customCards || [];
for (const card of [
  {
    type: "hockey-tracker-card",
    name: "Hockey Tracker Card",
    description: "Live scores, schedule, and stats for any supported hockey league team.",
    version: VERSION,
    preview: false,
    documentationURL: "https://github.com/linkian19/ha-hockey-tracker-card",
  },
  {
    type: "hockey-playoff-card",
    name: "Hockey Playoff Card",
    description: "Playoff bracket and live game view for followed teams across any supported league.",
    version: VERSION,
    preview: false,
    documentationURL: "https://github.com/linkian19/ha-hockey-tracker-card",
  },
]) {
  if (!window.customCards.some((c) => c.type === card.type)) window.customCards.push(card);
}

if (FIRST_LOAD) console.info(
  `%c HOCKEY-TRACKER-CARD %c v${VERSION} `,
  "color: white; background: #1565c0; font-weight: 700;",
  "color: #1565c0; background: white; font-weight: 700;"
);
