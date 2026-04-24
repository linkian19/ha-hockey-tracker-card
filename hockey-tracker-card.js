/**
 * Hockey Tracker Card v1.2.0
 * https://github.com/linkian19/ha-hockey-tracker-card
 */
import { LitElement, html, css } from "https://unpkg.com/lit@2.8.0/index.js?module";

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

class HockeyTrackerCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, config: {} };
  }

  setConfig(config) {
    this.config = config;
  }

  static get _schema() {
    return [
      { name: "entity", required: true, selector: { entity: { domain: "sensor" } } },
      { name: "title", selector: { text: {} } },
      { name: "show_logo", selector: { boolean: {} } },
      { name: "show_shots", selector: { boolean: {} } },
      { name: "show_next_game", selector: { boolean: {} } },
      { name: "show_recent_games", selector: { boolean: {} } },
      {
        name: "recent_games_count",
        default: 3,
        selector: { number: { min: 1, max: 10, step: 1, mode: "box" } },
      },
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
      show_recent_games:  "Show recent game results",
      recent_games_count: "Number of recent games to show (1–10, default: 3)",
      logo_size:          "Logo size in px (24–200, default: 64)",
    }[schema.name] ?? schema.name;
  }

  _valueChanged(ev) {
    ev.stopPropagation();
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: ev.detail.value } }));
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

customElements.define("hockey-tracker-card-editor", HockeyTrackerCardEditor);

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

class HockeyTrackerCard extends LitElement {
  static get properties() {
    return { hass: {}, config: {} };
  }

  // Track when the sensor first entered FINAL state so we can apply the 30-min buffer
  _finalAt = null;

  static get styles() {
    return css`
      :host { display: block; }

      .content { padding: 14px 16px 12px; }

      /* ── Top bar ─────────────────────────────────────── */
      .top-bar {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
      }
      .badge {
        padding: 3px 10px;
        border-radius: 99px;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.07em;
        text-transform: uppercase;
      }
      .badge-live  { background: #d32f2f; color: #fff; }
      .badge-pre   { background: #1565c0; color: #fff; }
      .badge-final { background: var(--secondary-text-color); color: #fff; }
      .badge-none  { background: var(--disabled-color, #9e9e9e); color: #fff; }
      .card-title {
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
      .refresh-btn {
        --mdc-icon-button-size: 32px;
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
        margin-right: -4px;
      }

      /* ── Scoreboard ─────────────────────────────────── */
      .scoreboard {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 4px;
        padding: 8px 0 10px;
        border-top: 1px solid var(--divider-color);
        border-bottom: 1px solid var(--divider-color);
        margin-bottom: 8px;
      }
      .team-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        min-width: 0;
      }
      .team-logo-img {
        object-fit: contain;
      }
      .team-logo-icon {
        --mdc-icon-size: 48px;
        color: var(--primary-color);
      }
      .team-name {
        font-size: 0.78rem;
        text-align: center;
        color: var(--secondary-text-color);
        line-height: 1.2;
        word-break: break-word;
      }
      .score {
        font-size: 2.4rem;
        font-weight: 700;
        color: var(--primary-text-color);
        line-height: 1;
      }
      .score-dash {
        font-size: 1.4rem;
        color: var(--secondary-text-color);
      }
      .mid-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        flex-shrink: 0;
      }
      .at-sign {
        font-size: 1.1rem;
        color: var(--secondary-text-color);
        font-weight: 600;
      }

      /* ── Period / stats ─────────────────────────────── */
      .period-row, .stats-row, .venue-row {
        text-align: center;
        font-size: 0.82rem;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }
      .stats-grid {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        padding: 0 2px;
        margin-bottom: 4px;
      }

      /* ── PRE: start time ────────────────────────────── */
      .start-time {
        text-align: center;
        font-size: 0.9rem;
        color: var(--primary-text-color);
        font-weight: 500;
        margin-bottom: 4px;
      }

      /* ── Upcoming / no game ─────────────────────────── */
      .upcoming {
        padding: 10px 0 4px;
        border-top: 1px solid var(--divider-color);
      }
      .upcoming-label {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
        margin-bottom: 6px;
      }
      .upcoming-teams {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 8px;
      }
      .upcoming-team {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        font-size: 0.82rem;
        color: var(--secondary-text-color);
        text-align: center;
      }
      .upcoming-at {
        font-size: 0.9rem;
        color: var(--secondary-text-color);
        flex-shrink: 0;
      }
      .upcoming-time {
        text-align: center;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .upcoming-venue {
        text-align: center;
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        margin-top: 2px;
      }
      .no-games {
        padding: 16px 0 8px;
        text-align: center;
        color: var(--secondary-text-color);
        font-size: 0.88rem;
      }

      /* ── Recent games ───────────────────────────────── */
      .recent-games {
        border-top: 1px solid var(--divider-color);
        margin-top: 10px;
        padding-top: 8px;
      }
      .section-label {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
        margin-bottom: 6px;
      }
      .recent-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 3px 0;
        font-size: 0.82rem;
        border-bottom: 1px solid var(--divider-color);
      }
      .recent-row:last-child { border-bottom: none; }
      .result {
        font-weight: 700;
        font-size: 0.78rem;
        width: 16px;
        flex-shrink: 0;
      }
      .result-w { color: #388e3c; }
      .result-l { color: #d32f2f; }
      .recent-opp {
        flex: 1;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .recent-score {
        font-weight: 600;
        color: var(--primary-text-color);
        flex-shrink: 0;
      }
      .recent-date {
        color: var(--secondary-text-color);
        flex-shrink: 0;
        font-size: 0.78rem;
      }
    `;
  }

  static getConfigElement() {
    return document.createElement("hockey-tracker-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "",
      show_logo: true,
      show_shots: true,
      show_next_game: true,
      show_recent_games: false,
      recent_games_count: 3,
      logo_size: 64,
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
      logo_size: 64,
      ...config,
    };
  }

  getCardSize() { return 4; }

  // ------------------------------------------------------------------
  // Display mode
  // ------------------------------------------------------------------

  _displayMode(state, a) {
    if (state === "LIVE") {
      this._finalAt = null;
      return "game";
    }
    if (state === "FINAL") {
      if (!this._finalAt) this._finalAt = Date.now();
      return (Date.now() - this._finalAt) / 60000 <= 30 ? "game" : "upcoming";
    }
    this._finalAt = null;
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
      return html`<ha-card><div class="content">Entity not found: ${this.config.entity}</div></ha-card>`;
    }

    const state = stateObj.state;
    const a = stateObj.attributes;
    const mode = this._displayMode(state, a);

    const badgeMap = { LIVE: "badge-live", PRE: "badge-pre", FINAL: "badge-final", NO_GAME: "badge-none" };
    const badgeLabel = { LIVE: "Live", PRE: "Pre-Game", FINAL: "Final", NO_GAME: "No Game" }[state] ?? state;

    return html`
      <ha-card>
        <div class="content">
          <div class="top-bar">
            <span class="badge ${badgeMap[state] ?? 'badge-none'}">${badgeLabel}</span>
            <span class="card-title">${this._cardTitle(a, stateObj)}</span>
            <ha-icon-button class="refresh-btn" label="Refresh" @click=${this._refresh}>
              <ha-icon icon="mdi:refresh"></ha-icon>
            </ha-icon-button>
          </div>

          ${mode === "game"
            ? this._renderGame(a, state)
            : this._renderUpcoming(a, state)}

          ${this.config.show_recent_games && a.recent_games?.length
            ? this._renderRecentGames(a.recent_games)
            : ""}
        </div>
      </ha-card>
    `;
  }

  // ------------------------------------------------------------------
  // Game view (LIVE, FINAL ≤30min, PRE ≤30min)
  // ------------------------------------------------------------------

  _renderGame(a, state) {
    const showScores = state !== "PRE";

    return html`
      <div class="scoreboard">
        <div class="team-col">
          ${this._logo(a.away_logo_url)}
          <div class="team-name">${a.away_team ?? "Away"}</div>
          ${showScores
            ? html`<div class="score">${a.away_score ?? "—"}</div>`
            : html`<div class="score-dash">—</div>`}
        </div>

        <div class="mid-col">
          <span class="at-sign">@</span>
        </div>

        <div class="team-col">
          ${this._logo(a.home_logo_url)}
          <div class="team-name">${a.home_team ?? "Home"}</div>
          ${showScores
            ? html`<div class="score">${a.home_score ?? "—"}</div>`
            : html`<div class="score-dash">—</div>`}
        </div>
      </div>

      ${state === "PRE" ? html`
        <div class="start-time">${this._fmtGameTime(a.start_time)}</div>
      ` : ""}

      ${state === "LIVE" && (a.period || a.clock) ? html`
        <div class="period-row">
          ${a.period ? `Period ${a.period}` : ""}${a.clock ? ` · ${a.clock}` : ""}
        </div>
      ` : ""}

      ${this.config.show_shots && showScores && (a.away_shots != null || a.home_shots != null) ? html`
        <div class="stats-grid">
          <span>${a.away_shots ?? "—"}</span>
          <span>Shots on Goal</span>
          <span>${a.home_shots ?? "—"}</span>
        </div>
      ` : ""}

      ${a.venue ? html`<div class="venue-row">${a.venue}</div>` : ""}
    `;
  }

  // ------------------------------------------------------------------
  // Upcoming view (NO_GAME, PRE >30min, old FINAL)
  // ------------------------------------------------------------------

  _renderUpcoming(a, state) {
    // PRE but >30 min away — we already have the game data
    if (state === "PRE") {
      return html`
        <div class="upcoming">
          <div class="upcoming-label">Today's Game</div>
          ${this._upcomingTeams(a.away_logo_url, a.away_team, a.home_logo_url, a.home_team)}
          <div class="upcoming-time">${this._fmtGameTime(a.start_time)}</div>
          ${a.venue ? html`<div class="upcoming-venue">${a.venue}</div>` : ""}
        </div>
      `;
    }

    if (!this.config.show_next_game) return html``;

    const hasNext = a.next_game_date;
    if (!hasNext) {
      return html`<div class="no-games">No upcoming games scheduled</div>`;
    }

    return html`
      <div class="upcoming">
        <div class="upcoming-label">Next Game</div>
        ${this._upcomingTeams(a.next_game_away_logo_url, a.next_game_away_team, a.next_game_home_logo_url, a.next_game_home_team)}
        <div class="upcoming-time">${this._fmtGameTime(a.next_game_date)}</div>
        ${a.next_game_venue ? html`<div class="upcoming-venue">${a.next_game_venue}</div>` : ""}
      </div>
    `;
  }

  _upcomingTeams(awayLogo, awayName, homeLogo, homeName) {
    return html`
      <div class="upcoming-teams">
        <div class="upcoming-team">
          ${this._logo(awayLogo)}
          <span>${awayName ?? "Away"}</span>
        </div>
        <span class="upcoming-at">@</span>
        <div class="upcoming-team">
          ${this._logo(homeLogo)}
          <span>${homeName ?? "Home"}</span>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------------
  // Recent games
  // ------------------------------------------------------------------

  _renderRecentGames(games) {
    const count = Math.min(this.config.recent_games_count || 3, games.length);
    return html`
      <div class="recent-games">
        <div class="section-label">Recent Games</div>
        ${games.slice(0, count).map(g => html`
          <div class="recent-row">
            <span class="result ${g.win ? 'result-w' : 'result-l'}">${g.win ? "W" : "L"}</span>
            <span class="recent-opp">${g.is_home ? "vs" : "@"} ${g.opponent}</span>
            <span class="recent-score">${g.team_score}–${g.opponent_score}</span>
            <span class="recent-date">${this._fmtShortDate(g.date)}</span>
          </div>
        `)}
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
    return stateObj.attributes.friendly_name ?? "";
  }

  _logo(url, size) {
    size = size ?? this.config.logo_size ?? 64;
    if (!this.config.show_logo) return html``;
    if (url) {
      return html`
        <img
          class="team-logo-img"
          style="width:${size}px;height:${size}px"
          src="${url}"
          alt=""
          @error=${(e) => { e.target.style.display = "none"; }}
        >`;
    }
    return html`<ha-icon class="team-logo-icon" style="--mdc-icon-size:${size}px" icon="mdi:hockey-puck"></ha-icon>`;
  }

  _fmtGameTime(iso) {
    if (!iso) return "";
    try {
      const tz = this.hass?.config?.time_zone ?? undefined;
      return new Date(iso).toLocaleString(undefined, {
        timeZone: tz,
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
      const tz = this.hass?.config?.time_zone ?? undefined;
      return new Date(iso).toLocaleDateString(undefined, {
        timeZone: tz,
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  }

  async _refresh() {
    if (!this.hass || !this.config.entity) return;
    await this.hass.callService("homeassistant", "update_entity", {
      entity_id: this.config.entity,
    });
  }
}

customElements.define("hockey-tracker-card", HockeyTrackerCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "hockey-tracker-card",
  name: "Hockey Tracker Card",
  description: "Live scores, schedule, and stats for ECHL, AHL, or NHL teams.",
  preview: false,
  documentationURL: "https://github.com/linkian19/ha-hockey-tracker-card",
});
