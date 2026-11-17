/**
 * Render tests: each card is created in a simulated DOM with a fake `hass`
 * object, then the rendered shadow DOM is checked.
 */
import { render as litRender } from "lit";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

beforeAll(async () => {
  await import("../src/hockey-tracker-card.js");
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

const ENTITY = "sensor.kansas_city_mavericks_game";
const PLAYOFF = "sensor.echl_playoffs";

function makeHass(states, callService = vi.fn().mockResolvedValue(undefined)) {
  return {
    states,
    locale: { language: "en", time_format: "12", time_zone: "server" },
    config: { time_zone: "America/Chicago" },
    language: "en",
    callService,
  };
}

function gameState(state, attributes = {}) {
  return {
    [ENTITY]: {
      entity_id: ENTITY,
      state,
      attributes: {
        friendly_name: "Kansas City Mavericks Game",
        team_name: "Kansas City Mavericks",
        home_team: "Kansas City Mavericks",
        away_team: "Tulsa Oilers",
        is_home: true,
        ...attributes,
      },
    },
  };
}

async function render(tag, config, hass) {
  const el = document.createElement(tag);
  el.setConfig(config);
  el.hass = hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const text = (el, selector) => el.shadowRoot.querySelector(selector)?.textContent.trim();
const all = (el, selector) => [...el.shadowRoot.querySelectorAll(selector)].map((n) => n.textContent.trim());

describe("hockey-tracker-card", () => {
  it("requires an entity", () => {
    const el = document.createElement("hockey-tracker-card");
    expect(() => el.setConfig({})).toThrow("Required: entity");
  });

  it("reports a missing entity", async () => {
    const el = await render("hockey-tracker-card", { entity: "sensor.nope" }, makeHass({}));
    expect(text(el, ".ht-content")).toBe("Entity not found: sensor.nope");
  });

  it("shows the live score, period and shots", async () => {
    const hass = makeHass(gameState("LIVE", {
      home_score: 2, away_score: 0, period: 3, clock: "10:48", home_shots: 29, away_shots: 18,
    }));
    const el = await render("hockey-tracker-card", { entity: ENTITY }, hass);
    expect(text(el, ".ht-badge")).toBe("Live");
    expect(text(el, ".ht-title")).toBe("Kansas City Mavericks");
    expect(all(el, ".ht-score")).toEqual(["0", "2"]); // away, home
    expect(text(el, ".ht-period")).toBe("Period 3 · 10:48");
    expect(all(el, ".ht-shots span")).toEqual(["18", "Shots on Goal", "29"]);
  });

  it("labels overtime periods", async () => {
    const hass = makeHass(gameState("LIVE", { home_score: 1, away_score: 1, period: 5 }));
    const el = await render("hockey-tracker-card", { entity: ENTITY }, hass);
    expect(text(el, ".ht-period")).toBe("OT2");
  });

  it("hides scores before puck drop", async () => {
    const soon = new Date(Date.now() + 10 * 60000).toISOString();
    const hass = makeHass(gameState("PRE", { start_time: soon, home_score: 0, away_score: 0 }));
    const el = await render("hockey-tracker-card", { entity: ENTITY }, hass);
    expect(text(el, ".ht-badge")).toBe("Pre-Game");
    expect(all(el, ".ht-score")).toEqual([]);
    expect(all(el, ".ht-score-dash")).toEqual(["—", "—"]);
  });

  it("shows Game Day on a game-day morning, in HA's time zone", async () => {
    // 10:00 AM in Chicago. Only Date is faked so Lit's scheduling still runs.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-16T16:00:00Z"));

    // 7:05 PM Chicago tonight — already tomorrow in UTC
    let el = await render("hockey-tracker-card", { entity: ENTITY },
      makeHass(gameState("NO_GAME", { next_game_date: "2026-11-17T01:05:00Z" })));
    expect(text(el, ".ht-badge")).toBe("Game Day");

    // 7:05 PM Chicago tomorrow
    el = await render("hockey-tracker-card", { entity: ENTITY },
      makeHass(gameState("NO_GAME", { next_game_date: "2026-11-18T01:05:00Z" })));
    expect(text(el, ".ht-badge")).toBe("No Game");
  });

  it("refreshes via force_refresh, falling back to update_entity", async () => {
    const callService = vi.fn()
      .mockRejectedValueOnce(new Error("service not found"))
      .mockResolvedValue(undefined);
    const el = await render("hockey-tracker-card", { entity: ENTITY },
      makeHass(gameState("NO_GAME"), callService));
    el.shadowRoot.querySelector(".ht-refresh-btn").click();
    await vi.waitFor(() => expect(callService).toHaveBeenCalledTimes(2));
    expect(callService.mock.calls.map((c) => `${c[0]}.${c[1]}`))
      .toEqual(["hockey_tracker.force_refresh", "homeassistant.update_entity"]);
    expect(callService.mock.calls[1][2]).toEqual({ entity_id: ENTITY });
  });

  const liveEvents = {
    home_score: 1, away_score: 0, period: 2, clock: "12:00",
    game_events: [
      // Newest first, as the integration sends them
      { type: "mystery", period: 2, time: "2:00", team_abbrev: "TUL" },
      { type: "penalty", period: 2, time: "1:10", team_abbrev: "TUL", player_name: "Sam Lipkin",
        description: "Fighting - Major", minutes: 5, incident: "fight" },
      { type: "goal", period: 1, time: "5:00", team_abbrev: "KC", is_tracked_team: true, player_name: "Kyle Kukkonen" },
    ],
    disallowed_goals: [
      { type: "goal_disallowed", period: 1, time: "16:28", team_abbrev: "TUL", is_tracked_team: false,
        player_name: "Nick Nardella", reason: "offside", challenged_by: "KC" },
    ],
  };

  it("shows disallowed goals in time order and skips unknown event types", async () => {
    const el = await render("hockey-tracker-card", { entity: ENTITY, show_events: true },
      makeHass(gameState("LIVE", liveEvents)));
    expect(all(el, ".ht-event-meta")).toEqual(["P2 · 1:10", "P1 · 16:28", "P1 · 5:00"]);
    const row = el.shadowRoot.querySelector(".ht-event-disallowed");
    expect(row.querySelector(".ht-event-disallowed-name").textContent.trim()).toBe("Nick Nardella");
    expect(row.querySelector(".ht-event-tag--disallowed").textContent).toBe("NO GOAL");
    expect(row.textContent).toContain("KC challenge: Offside");
  });

  it("hides disallowed goals when show_event_disallowed is off", async () => {
    const el = await render("hockey-tracker-card",
      { entity: ENTITY, show_events: true, show_event_disallowed: false },
      makeHass(gameState("LIVE", liveEvents)));
    expect(el.shadowRoot.querySelector(".ht-event-disallowed")).toBeNull();
    expect(all(el, ".ht-event-meta")).toEqual(["P2 · 1:10", "P1 · 5:00"]);
  });

  it("labels HockeyTech disallowed goals without a reason", async () => {
    const el = await render("hockey-tracker-card", { entity: ENTITY, show_events: true },
      makeHass(gameState("LIVE", {
        ...liveEvents,
        disallowed_goals: [{ period: 3, time: "3:04", team_abbrev: "KC", is_tracked_team: true,
          player_name: "Jake Smith", reason: null, challenged_by: null }],
      })));
    expect(text(el, ".ht-event-disallowed")).toContain("Taken off the board");
    expect(el.shadowRoot.querySelector(".ht-event-disallowed.ht-event--ours")).not.toBeNull();
  });

  it("picks team vs playoff sensors for the stub config", () => {
    const hass = makeHass({
      ...gameState("NO_GAME"),
      [PLAYOFF]: { entity_id: PLAYOFF, state: "NO_GAME", attributes: { bracket: [] } },
      "sensor.outdoor_temp": { entity_id: "sensor.outdoor_temp", state: "4", attributes: {} },
    });
    expect(customElements.get("hockey-tracker-card").getStubConfig(hass).entity).toBe(ENTITY);
    expect(customElements.get("hockey-playoff-card").getStubConfig(hass).entity).toBe(PLAYOFF);
  });
});

describe("hockey-playoff-card", () => {
  const bracket = [
    {
      round_number: 1, round_name: "Division Semifinals",
      series: [{
        team1_abbrev: "KC", team1_name: "Kansas City", team1_id: "68", team1_is_followed: true, team1_wins: 4,
        team2_abbrev: "TUL", team2_name: "Tulsa", team2_id: "61", team2_wins: 1,
        status: "complete", winner_id: "68",
      }],
    },
    {
      round_number: 2, round_name: "Division Finals",
      series: [{
        team1_abbrev: "KC", team1_name: "Kansas City", team1_id: "68", team1_is_followed: true, team1_wins: 1,
        team2_abbrev: "IDH", team2_name: "Idaho", team2_id: "70", team2_wins: 0,
        status: "active", game_state: "LIVE", game_score: "2-1",
      }],
    },
  ];
  const playoffHass = (attributes) => makeHass({
    [PLAYOFF]: { entity_id: PLAYOFF, state: "LIVE", attributes: { league: "ECHL", ...attributes } },
  });

  it("requires an entity", () => {
    const el = document.createElement("hockey-playoff-card");
    expect(() => el.setConfig({})).toThrow("entity is required");
  });

  it("titles the bracket by league and handles no data", async () => {
    const el = await render("hockey-playoff-card", { entity: PLAYOFF }, playoffHass({ bracket: [] }));
    expect(text(el, ".hp-title")).toBe("Kelly Cup Playoffs");
    expect(text(el, ".hp-badge")).toBe("LIVE");
    expect(el.shadowRoot.textContent).toContain("No playoff data available.");
  });

  it("shows disallowed goals in the game view events", async () => {
    const el = await render("hockey-playoff-card", { entity: PLAYOFF }, playoffHass({ bracket: [] }));
    const attr = {
      game_events: [{ type: "goal", period: 2, time: "4:00", team_abbrev: "STL", player_name: "A" }],
      disallowed_goals: [{ period: 1, time: "16:28", team_abbrev: "STL", player_name: "B",
        reason: "goaltender interference", challenged_by: "league" }],
    };
    const host = document.createElement("div");
    litRender(el._renderPlayoffEvents(attr, true), host);
    expect([...host.querySelectorAll(".ht-event-meta")].map((n) => n.textContent)).toEqual(["P2 4:00", "P1 16:28"]);
    expect(host.querySelector(".ht-event-disallowed").textContent).toContain("League review: Goaltender interference");

    el.setConfig({ entity: PLAYOFF, show_event_disallowed: false });
    const hidden = document.createElement("div");
    litRender(el._renderPlayoffEvents(attr, true), hidden);
    expect(hidden.querySelector(".ht-event-disallowed")).toBeNull();
  });

  it("collapses finished rounds and shows the live series", async () => {
    const el = await render("hockey-playoff-card", { entity: PLAYOFF },
      playoffHass({ bracket, current_round: 2 }));
    expect(all(el, ".hp-round-header span:first-child")).toEqual(["Division Semifinals", "Division Finals"]);
    // Round 1 auto-collapsed: only the round 2 series renders
    expect(all(el, ".hp-series .hp-series-abbrev")).toEqual(["KC", "IDH"]);
    expect(text(el, ".hp-series-live-score")).toBe("2-1");

    el.shadowRoot.querySelector(".hp-round-header").click();
    await el.updateComplete;
    expect(all(el, ".hp-series .hp-series-abbrev")).toEqual(["KC", "TUL", "KC", "IDH"]);
  });
});
