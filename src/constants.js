export const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
export const COLS = Array.from({ length: 13 }, (_, i) => i + 1);
export const GRID_SIZE = 13;
export const TOTAL_TILES = 169;
export const VALID_PASSWORD = 'GOVNUM1';
export const ROLES = { ADMIN: 'ADMIN', VIEWER: 'VIEWER' };

export const SERVERS = [
  { id: '1870', label: '1870', isMain: true },
  { id: '1869', label: '1869', isMain: false },
  { id: '1882', label: '1882', isMain: false },
  { id: '1884', label: '1884', isMain: false },
  { id: '1891', label: '1891', isMain: false },
  { id: '1965', label: '1965', isMain: false },
  { id: '1890', label: '1890', isMain: false },
  { id: '1866', label: '1866', isMain: false },
];

export const DEFAULT_SERVER = '1870';

export const STORAGE_KEYS = {
  auth: 'awsm_auth',
  language: 'awsm_lang',
  currentServer: 'awsm_server',
};

export function gridKey(serverId) {
  return `grid_${serverId}`;
}

export const DEFAULT_ALLIANCE_COLORS = [
  '#e6194b',
  '#3cb44b',
  '#ffe119',
  '#4363d8',
  '#f58231',
  '#911eb4',
  '#46f0f0',
  '#f032e6',
  '#bcf60c',
  '#008080',
  '#e6beff',
  '#9a6324',
  '#fffac8',
  '#800000',
  '#aaffc3',
  '#808000',
  '#ffd8b1',
  '#000075',
  '#fabed4',
  '#808080',
];

export const ZONE_HEX = {
  1: { bg: '#cfe2f3', border: '#9fc5e8', text: '#1f2937' },
  2: { bg: '#fff2cc', border: '#ffe599', text: '#1f2937' },
  3: { bg: '#d9ead3', border: '#b6d7a8', text: '#1f2937' },
  4: { bg: '#e2d5e7', border: '#d5a6bd', text: '#1f2937' },
  5: { bg: '#f4cccc', border: '#ea9999', text: '#1f2937' },
  6: { bg: '#fce5cd', border: '#f9cb9c', text: '#1f2937' },
};

/** @deprecated use ZONE_HEX for inline styles */
export const ZONE_STYLES = {
  1: { bg: 'bg-[#cfe2f3]', text: 'text-gray-800', border: 'border-[#9fc5e8]' },
  2: { bg: 'bg-[#fff2cc]', text: 'text-gray-800', border: 'border-[#ffe599]' },
  3: { bg: 'bg-[#d9ead3]', text: 'text-gray-800', border: 'border-[#b6d7a8]' },
  4: { bg: 'bg-[#e2d5e7]', text: 'text-gray-800', border: 'border-[#d5a6bd]' },
  5: { bg: 'bg-[#f4cccc]', text: 'text-gray-800', border: 'border-[#ea9999]' },
  6: { bg: 'bg-[#fce5cd]', text: 'text-gray-800', border: 'border-[#f9cb9c]' },
};

export const MARKER_TYPES = ['attack', 'defend', 'target'];

export function getCoordinate(rowIndex, colIndex) {
  return `${ROWS[rowIndex]}${COLS[colIndex]}`;
}

export function getTileIndex(rowIndex, colIndex) {
  return rowIndex * GRID_SIZE + colIndex;
}

export function createDefaultAlliances() {
  return DEFAULT_ALLIANCE_COLORS.map((color, index) => ({
    id: index + 1,
    name: `Alliance ${index + 1}`,
    color,
  }));
}

export function createDefaultServerState() {
  return {
    territories: {},
    alliances: createDefaultAlliances(),
    markers: {},
  };
}
