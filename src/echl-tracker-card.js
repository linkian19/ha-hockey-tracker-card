import { LitElement, html, css } from "https://unpkg.com/lit@2/index.js?module";

const CARD_VERSION = "1.0.0";

class EchlTrackerCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      .card {
        padding: 16px;
        font-family: var(--paper-font-body1_-_font-family, sans-serif);
        background: var(--ha-card-background, var(--card-background-color, white));
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow, none);
        overflow: hidden;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .team-logo {
        width: 48px;
        height: 48px;
        object-fit: contain;
      }
      .team-name {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .game-state-badge {
        margin-left: auto;
        padding: 2px 8px;
        border-radius: 99px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .badge-live { background: #e53935; color: white; }
      .badge-pre  { background: #1976d2; color: white; }
      .badge-final { background: var(--secondary-text-color); color: white; }
      .badge-none  { background: var(--disabled-color, #ccc); color: white; }

      .scoreboard {
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 12px 0;
        border-top: 1px solid var(--divider-color);
        border-bottom: 1px solid var(--divider-color);
        margin-bottom: 12px;
      }
      .team-score {
        text-align: center;
        flex: 1;
      }
      .team-label {
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }
      .score {
        font-size: 2.4rem;
        font-weight: 700;
        color: var(--primary-text-color);
        line-height: 1;
      }
      .separator {
        font-size: 1.5rem;
        color: var(--secondary-text-color);
        padding: 0 8px;
      }
      .period-clock {
        text-align: center;
        color: var(--secondary-text-color);
        font-size: 0.9rem;
        margin-bottom: 8px;
      }
      .stats-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.82rem;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }
      .next-game {
        border-top: 1px solid var(--divider-color);
        padding-top: 10px;
        margin-top: 10px;
        font-size: 0.85rem;
        color: var(--secondary-text-color);
      }
      .next-game-label {
        font-weight: 600;
        color: var(--primary-text-color);
        margin-bottom: 2px;
      }
      .no-game {
        text-align: center;
        padding: 16px 0;
        color: var(--secondary-text-color);
        font-size: 0.9rem;
      }
    `;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("You must define an entity (the ECHL tracker sensor).");
    }
    this.config = {
      show_logo: true,
      show_shots: true,
      show_next_game: true,
      ...config,
    };
  }

  getCardSize() {
    return 3;
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const stateObj = this.hass.states[this.config.entity];
    if (!stateObj) {
      return html`<ha-card><div class="card"><p>Entity not found: ${this.config.entity}</p></div></ha-card>`;
    }

    const state = stateObj.state;
    const attr = stateObj.attributes;

    return html`
      <ha-card>
        <div class="card">
          ${this._renderHeader(attr, state)}
          ${state === "NO_GAME"
            ? this._renderNoGame(attr)
            : this._renderGame(attr, state)}
        </div>
      </ha-card>
    `;
  }

  _renderHeader(attr, state) {
    const teamName = this.config.title || attr.home_team || "ECHL";
    const badgeClass = {
      LIVE: "badge-live",
      PRE: "badge-pre",
      FINAL: "badge-final",
      NO_GAME: "badge-none",
    }[state] || "badge-none";

    return html`
      <div class="header">
        ${this.config.show_logo && this.config.logo_url
          ? html`<img class="team-logo" src="${this.config.logo_url}" alt="logo">`
          : html`<ha-icon icon="mdi:hockey-puck"></ha-icon>`}
        <span class="team-name">${teamName}</span>
        <span class="game-state-badge ${badgeClass}">${state.replace("_", " ")}</span>
      </div>
    `;
  }

  _renderGame(attr, state) {
    return html`
      <div class="scoreboard">
        <div class="team-score">
          <div class="team-label">${attr.away_team || "Away"}</div>
          <div class="score">${attr.away_score ?? "-"}</div>
        </div>
        <div class="separator">@</div>
        <div class="team-score">
          <div class="team-label">${attr.home_team || "Home"}</div>
          <div class="score">${attr.home_score ?? "-"}</div>
        </div>
      </div>

      ${state === "LIVE" ? html`
        <div class="period-clock">
          ${attr.period ? `Period ${attr.period}` : ""}
          ${attr.clock ? ` · ${attr.clock}` : ""}
        </div>
      ` : ""}

      ${this.config.show_shots && (attr.home_shots != null || attr.away_shots != null) ? html`
        <div class="stats-row">
          <span>SOG: ${attr.away_shots ?? "—"}</span>
          <span>Shots on Goal</span>
          <span>SOG: ${attr.home_shots ?? "—"}</span>
        </div>
      ` : ""}

      ${attr.venue ? html`<div class="stats-row"><span>${attr.venue}</span></div>` : ""}
    `;
  }

  _renderNoGame(attr) {
    if (!this.config.show_next_game || !attr.next_game_date) {
      return html`<div class="no-game">No game scheduled</div>`;
    }
    const date = new Date(attr.next_game_date);
    const formatted = date.toLocaleDateString(undefined, {
      weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    });
    return html`
      <div class="no-game">No game today</div>
      <div class="next-game">
        <div class="next-game-label">Next game</div>
        <div>${attr.next_game_home ? "vs" : "@"} ${attr.next_game_opponent || "TBD"}</div>
        <div>${formatted}</div>
      </div>
    `;
  }
}

EchlTrackerCard.cardEditor = "echl-tracker-card-editor";
customElements.define("echl-tracker-card", EchlTrackerCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "echl-tracker-card",
  name: "ECHL Tracker Card",
  description: "Displays live scores, schedule, and stats for an ECHL team.",
  preview: false,
  documentationURL: "https://github.com/IanStanek/ha-echl-tracker-card",
});
