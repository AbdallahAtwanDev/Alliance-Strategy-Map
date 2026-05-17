import {
  createDefaultServerState,
  DEFAULT_SERVER,
  gridKey,
  STORAGE_KEYS,
} from '../constants.js';

function normalizeTerritories(territories) {
  const out = {};
  for (const [key, value] of Object.entries(territories)) {
    const index = Number(key);
    const allianceId = Number(value);
    if (Number.isFinite(index) && Number.isFinite(allianceId) && allianceId > 0) {
      out[index] = allianceId;
    }
  }
  return out;
}

function normalizeMarkers(markers) {
  const out = {};
  for (const [key, value] of Object.entries(markers)) {
    const index = Number(key);
    if (Number.isFinite(index) && value) out[index] = value;
  }
  return out;
}

function normalizeAlliances(alliances) {
  return alliances.map((a) => ({
    ...a,
    id: Number(a.id),
  }));
}

function normalizeServerState(state) {
  return {
    territories: normalizeTerritories(state.territories || {}),
    alliances: normalizeAlliances(state.alliances),
    markers: normalizeMarkers(state.markers || {}),
  };
}

export function loadServerState(serverId) {
  try {
    const raw = localStorage.getItem(gridKey(serverId));
    if (!raw) return createDefaultServerState();
    const parsed = JSON.parse(raw);
    const state = {
      territories:
        parsed.territories && typeof parsed.territories === 'object'
          ? parsed.territories
          : {},
      alliances:
        Array.isArray(parsed.alliances) && parsed.alliances.length === 20
          ? parsed.alliances
          : createDefaultServerState().alliances,
      markers:
        parsed.markers && typeof parsed.markers === 'object'
          ? parsed.markers
          : {},
    };
    return normalizeServerState(state);
  } catch {
    return createDefaultServerState();
  }
}

export function saveServerState(serverId, state) {
  localStorage.setItem(
    gridKey(serverId),
    JSON.stringify({
      territories: state.territories,
      alliances: state.alliances,
      markers: state.markers,
    }),
  );
}

export function loadCurrentServer() {
  return localStorage.getItem(STORAGE_KEYS.currentServer) || DEFAULT_SERVER;
}

export function saveCurrentServer(serverId) {
  localStorage.setItem(STORAGE_KEYS.currentServer, serverId);
}

export function wipeServerData(serverId) {
  localStorage.removeItem(gridKey(serverId));
}
