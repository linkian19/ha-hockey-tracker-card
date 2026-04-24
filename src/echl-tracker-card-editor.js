import { LitElement, html, css } from "https://unpkg.com/lit@2/index.js?module";

class EchlTrackerCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  static get styles() {
    return css`
      .form-row {
        display: flex;
        flex-direction: column;
        margin-bottom: 12px;
      }
      label {
        font-size: 0.85rem;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }
    `;
  }

  setConfig(config) {
    this.config = config;
  }

  _valueChanged(ev) {
    const key = ev.target.getAttribute("data-key");
    const value = ev.target.value ?? ev.target.checked;
    const newConfig = { ...this.config, [key]: value };
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: newConfig } }));
  }

  _boolChanged(ev) {
    const key = ev.target.getAttribute("data-key");
    const newConfig = { ...this.config, [key]: ev.target.checked };
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: newConfig } }));
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const entities = Object.keys(this.hass.states).filter(
      (e) => e.startsWith("sensor.") && this.hass.states[e].attributes?.game_state !== undefined
    );

    return html`
      <div class="form-row">
        <label>Sensor Entity</label>
        <select data-key="entity" @change=${this._valueChanged}>
          ${entities.map((e) => html`<option value="${e}" ?selected=${e === this.config.entity}>${e}</option>`)}
        </select>
      </div>

      <div class="form-row">
        <label>Card Title (optional — defaults to team name)</label>
        <input type="text" data-key="title" .value=${this.config.title || ""} @input=${this._valueChanged}>
      </div>

      <div class="form-row">
        <label>Logo URL (optional)</label>
        <input type="text" data-key="logo_url" .value=${this.config.logo_url || ""} @input=${this._valueChanged}>
      </div>

      <div class="form-row">
        <label>
          <input type="checkbox" data-key="show_logo" ?checked=${this.config.show_logo !== false} @change=${this._boolChanged}>
          Show team logo
        </label>
      </div>

      <div class="form-row">
        <label>
          <input type="checkbox" data-key="show_shots" ?checked=${this.config.show_shots !== false} @change=${this._boolChanged}>
          Show shots on goal
        </label>
      </div>

      <div class="form-row">
        <label>
          <input type="checkbox" data-key="show_next_game" ?checked=${this.config.show_next_game !== false} @change=${this._boolChanged}>
          Show next game when no game today
        </label>
      </div>
    `;
  }
}

customElements.define("echl-tracker-card-editor", EchlTrackerCardEditor);
