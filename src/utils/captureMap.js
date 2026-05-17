import {
  COLS,
  getCoordinate,
  getTileIndex,
  GRID_SIZE,
  ROWS,
  ZONE_HEX,
} from '../constants.js';

const TILE = 64;
const LABEL = 28;
const PAD = 28;
const FONT = 'Tahoma, "Segoe UI", Arial, sans-serif';
const MARKER_TEXT = { attack: 'ATK', defend: 'DEF', target: 'TGT' };

function findAlliance(alliances, allianceId) {
  const n = Number(allianceId);
  if (!Number.isFinite(n)) return null;
  return alliances.find((x) => Number(x.id) === n) || null;
}

function resolveAllianceId(territories, index) {
  const raw = territories[index] ?? territories[String(index)];
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function getTileStyle(tile, allianceId, alliances) {
  const alliance = allianceId != null ? findAlliance(alliances, allianceId) : null;
  if (alliance) {
    return {
      background: alliance.color,
      color: '#ffffff',
      border: '1px solid rgba(255,255,255,0.35)',
    };
  }
  if (tile.type === 'Capitol') {
    return { background: '#ffffff', color: '#111827', border: '1px solid #d1d5db' };
  }
  const z = ZONE_HEX[tile.zone];
  return { background: z.bg, color: z.text, border: `1px solid ${z.border}` };
}

function el(tag, style, text) {
  const node = document.createElement(tag);
  if (style) Object.assign(node.style, style);
  if (text != null) node.textContent = text;
  return node;
}

function buildTileCell(tile, coord, allianceId, alliances, marker, getTileLabel, markerLabels) {
  const styles = getTileStyle(tile, allianceId, alliances);
  const alliance = allianceId != null ? findAlliance(alliances, allianceId) : null;

  const cell = el('div', {
    width: `${TILE}px`,
    height: `${TILE}px`,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    overflow: 'hidden',
    fontFamily: FONT,
    lineHeight: '1.1',
    padding: '2px',
    ...styles,
  });

  if (alliance) {
    cell.appendChild(
      el('span', {
        width: '100%',
        fontSize: '9px',
        fontWeight: '700',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
      }, alliance.name),
    );
  }

  cell.appendChild(
    el('span', {
      fontSize: '10px',
      fontWeight: '600',
      marginTop: alliance ? '2px' : '0',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      width: '100%',
    }, getTileLabel(tile.type)),
  );

  if (marker) {
    const mk = markerLabels?.[marker] || MARKER_TEXT[marker] || marker;
    cell.appendChild(
      el('span', {
        fontSize: '8px',
        fontWeight: '700',
        marginTop: '1px',
      }, `[${mk}]`),
    );
  }

  cell.appendChild(
    el('span', {
      fontSize: '9px',
      fontWeight: '700',
      opacity: '0.85',
      marginTop: 'auto',
    }, coord),
  );

  return cell;
}

function buildExportRoot(data) {
  const {
    tiles,
    territories,
    alliances,
    markers,
    allianceStats,
    getTileLabel,
    labels,
    serverId,
    markerLabels,
  } = data;

  const root = el('div', {
    position: 'fixed',
    left: '-20000px',
    top: '0',
    zIndex: '-1',
    direction: 'ltr',
    background: '#030712',
    color: '#e2e8f0',
    fontFamily: FONT,
    padding: `${PAD}px`,
    boxSizing: 'border-box',
  });

  const header = el('div', { marginBottom: '16px', direction: 'ltr', textAlign: 'left' });
  const titleRow = el('div', { display: 'flex', alignItems: 'center', gap: '10px' });
  titleRow.appendChild(
    el('span', { fontSize: '22px', fontWeight: '700', color: '#ffffff' }, labels.brandTitle),
  );
  titleRow.appendChild(
    el('span', {
      background: '#dc2626',
      color: '#fff',
      fontSize: '10px',
      fontWeight: '700',
      padding: '3px 10px',
      borderRadius: '999px',
    }, 'GOV'),
  );
  header.appendChild(titleRow);
  header.appendChild(
    el('div', { fontSize: '11px', color: '#94a3b8', marginTop: '6px' }, labels.brandSubtitle),
  );
  header.appendChild(
    el('div', {
      fontSize: '12px',
      color: '#cbd5e1',
      marginTop: '10px',
    }, `${labels.server}: ${serverId}  ·  ${labels.exported}: ${new Date().toLocaleString()}`),
  );
  root.appendChild(header);

  const grid = el('div', {
    display: 'grid',
    gridTemplateColumns: `${LABEL}px repeat(${GRID_SIZE}, ${TILE}px)`,
    gridTemplateRows: `${LABEL}px repeat(${GRID_SIZE}, ${TILE}px)`,
    border: '2px solid #0e7490',
    background: '#0f172a',
    direction: 'ltr',
    width: 'fit-content',
  });

  grid.appendChild(el('div', { width: `${LABEL}px`, height: `${LABEL}px` }));

  COLS.forEach((col) => {
    grid.appendChild(
      el('div', {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: '700',
        color: '#22d3ee',
      }, String(col)),
    );
  });

  ROWS.forEach((row, ri) => {
    grid.appendChild(
      el('div', {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: '700',
        color: '#22d3ee',
      }, row),
    );

    COLS.forEach((_, ci) => {
      const idx = getTileIndex(ri, ci);
      grid.appendChild(
        buildTileCell(
          tiles[idx],
          getCoordinate(ri, ci),
          resolveAllianceId(territories, idx),
          alliances,
          markers[idx] ?? markers[String(idx)],
          getTileLabel,
          markerLabels,
        ),
      );
    });
  });

  root.appendChild(grid);

  const statsWrap = el('div', {
    marginTop: '20px',
    width: `${LABEL + GRID_SIZE * TILE}px`,
    direction: 'ltr',
    textAlign: 'left',
    borderTop: '2px solid #334155',
    paddingTop: '14px',
  });
  const statsTitle = el('div', {
    fontSize: '17px',
    fontWeight: '700',
    color: '#22d3ee',
    marginBottom: '12px',
  }, labels.leaderboard);
  statsWrap.appendChild(statsTitle);

  const sorted = [...allianceStats].sort((a, b) => b.tiles - a.tiles);
  if (!sorted.length) {
    statsWrap.appendChild(
      el('div', { fontSize: '13px', color: '#94a3b8' }, labels.noStats),
    );
  } else {
    sorted.forEach((s, i) => {
      const row = el('div', {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: '#1e293b',
        border: '1px solid #475569',
        borderRadius: '4px',
        padding: '8px 10px',
        marginBottom: '6px',
        fontSize: '12px',
      });
      row.appendChild(el('span', { color: '#64748b', fontWeight: '700', minWidth: '24px' }, `#${i + 1}`));
      row.appendChild(
        el('span', {
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: s.color,
          border: '1px solid #fff',
          flexShrink: '0',
        }),
      );
      row.appendChild(
        el('span', { fontWeight: '700', color: '#f8fafc', flex: '1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, s.name),
      );
      row.appendChild(
        el('span', { color: '#94a3b8', whiteSpace: 'nowrap' }, `${s.tiles} ${labels.tiles}`),
      );
      row.appendChild(
        el('span', { color: '#fbbf24', whiteSpace: 'nowrap' }, `${labels.coal}: ${s.coal.toLocaleString()}`),
      );
      row.appendChild(
        el('span', { color: '#34d399', whiteSpace: 'nowrap' }, `${labels.rareSoil}: ${s.rareSoil.toLocaleString()}`),
      );
      statsWrap.appendChild(row);
    });
  }

  root.appendChild(statsWrap);
  return root;
}

export async function captureMapScreenshot(data) {
  const { default: html2canvas } = await import('html2canvas');
  const root = buildExportRoot(data);
  document.body.appendChild(root);

  try {
    if (document.fonts?.ready) await document.fonts.ready;
    return await html2canvas(root, {
      backgroundColor: '#030712',
      scale: 2,
      logging: false,
      useCORS: true,
    });
  } finally {
    root.remove();
  }
}

export function downloadCanvas(canvas, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}
