import {
  createDefaultServerState,
  DEFAULT_SERVER,
  gridKey,
  STORAGE_KEYS,
} from '../constants.js';

export function loadServerState(serverId) {
  try {
    const raw = localStorage.getItem(gridKey(serverId));
    if (!raw) return createDefaultServerState();
    const parsed = JSON.parse(raw);
    return {
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
