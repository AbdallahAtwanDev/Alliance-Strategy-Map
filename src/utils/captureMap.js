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
const SCALE = 2;
const FONT = 'Tahoma, "Segoe UI", Arial, sans-serif';
const MARKER_TEXT = { attack: 'ATK', defend: 'DEF', target: 'TGT' };

/** Short English codes — always readable in PNG export */
const TYPE_SHORT = {
  'Dig Site': 'DIG',
  Village: 'VLG',
  Town: 'TOWN',
  Factory: 'FAC',
  'Train Station': 'TRN',
  'Launch Site': 'LCH',
  'War Palace': 'PALACE',
  Capitol: 'CAPITOL',
};

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

function textOnBackground(hex) {
  const c = String(hex || '#000000').replace('#', '');
  if (c.length < 6) return '#ffffff';
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.62 ? '#111827' : '#ffffff';
}

function getTileColors(tile, allianceId, alliances) {
  const a = allianceId != null ? findAlliance(alliances, allianceId) : null;
  if (a) {
    return {
      bg: a.color,
      text: textOnBackground(a.color),
      border: '#e8e8e8',
    };
  }
  if (tile.type === 'Capitol') return { bg: '#ffffff', text: '#111827', border: '#9ca3af' };
  const z = ZONE_HEX[tile.zone];
  return { bg: z.bg, text: z.text, border: z.border };
}

function fitText(ctx, text, maxW) {
  const s = String(text || '');
  if (!s) return '';
  if (ctx.measureText(s).width <= maxW) return s;
  let t = s;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
  return `${t}…`;
}

function drawCentered(ctx, text, cx, cy, font, color) {
  if (!text) return;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy);
}

function drawTile(ctx, px, py, tile, coord, allianceId, alliances, marker, markerLabels) {
  const colors = getTileColors(tile, allianceId, alliances);
  const alliance = allianceId != null ? findAlliance(alliances, allianceId) : null;

  ctx.fillStyle = colors.bg;
  ctx.fillRect(px, py, TILE, TILE);
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);

  const cx = px + TILE / 2;
  const maxW = TILE - 8;
  let textY = py + 11;

  if (alliance) {
    ctx.font = `bold 9px ${FONT}`;
    drawCentered(ctx, fitText(ctx, alliance.name, maxW), cx, textY, ctx.font, colors.text);
    textY += 13;
  }

  const shortType = TYPE_SHORT[tile.type] || tile.type.slice(0, 6).toUpperCase();
  const lines = [shortType];

  const blockStart = alliance ? py + 28 : py + 24;
  const lineH = 11;
  lines.forEach((line, i) => {
    drawCentered(
      ctx,
      line,
      cx,
      blockStart + i * lineH,
      `bold ${i === 0 ? 11 : 9}px ${FONT}`,
      colors.text,
    );
  });

  if (marker) {
    const mk = markerLabels?.[marker] || MARKER_TEXT[marker] || marker;
    drawCentered(
      ctx,
      `[${mk}]`,
      cx,
      py + TILE - 22,
      `bold 8px ${FONT}`,
      colors.text,
    );
  }

  drawCentered(ctx, coord, cx, py + TILE - 9, `bold 9px ${FONT}`, colors.text);
}

function drawHeader(ctx, ox, labels, serverId, isRtl) {
  let y = PAD;
  const align = isRtl ? 'right' : 'left';
  const tx = isRtl ? ox + LABEL + GRID_SIZE * TILE : ox;

  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 22px ${FONT}`;
  ctx.fillText(labels.brandTitle, tx, y);

  if (!isRtl) {
    const titleW = ctx.measureText(labels.brandTitle).width;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(ox + titleW + 10, y + 2, 38, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 10px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('GOV', ox + titleW + 29, y + 8);
  }

  y += 30;
  ctx.textAlign = align;
  ctx.fillStyle = '#94a3b8';
  ctx.font = `11px ${FONT}`;
  ctx.fillText(labels.brandSubtitle, tx, y);

  y += 20;
  ctx.fillStyle = '#cbd5e1';
  ctx.font = `12px ${FONT}`;
  ctx.fillText(
    `${labels.server}: ${serverId}  ·  ${labels.exported}: ${new Date().toLocaleString()}`,
    tx,
    y,
  );
}

function drawStats(ctx, ox, sy, w, stats, labels, isRtl) {
  let y = sy + 20;

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ox, y);
  ctx.lineTo(ox + w, y);
  ctx.stroke();

  y += 16;
  ctx.fillStyle = '#22d3ee';
  ctx.font = `bold 17px ${FONT}`;
  ctx.textAlign = isRtl ? 'right' : 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(labels.leaderboard, isRtl ? ox + w : ox, y);
  y += 32;

  if (!stats.length) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = `13px ${FONT}`;
    ctx.fillText(labels.noStats, isRtl ? ox + w : ox, y);
    return;
  }

  [...stats]
    .sort((a, b) => b.tiles - a.tiles)
    .forEach((s, i) => {
      const rowH = 40;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(ox, y, w, rowH - 4);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(ox + 0.5, y + 0.5, w - 1, rowH - 5);

      const cy = y + (rowH - 4) / 2;
      ctx.textBaseline = 'middle';

      if (isRtl) {
        ctx.textAlign = 'right';
        ctx.font = `bold 12px ${FONT}`;
        ctx.fillStyle = '#64748b';
        ctx.fillText(`#${i + 1}`, ox + w - 10, cy);

        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(ox + w - 36, cy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = `bold 13px ${FONT}`;
        ctx.fillText(fitText(ctx, s.name, w * 0.3), ox + w - 50, cy);

        ctx.fillStyle = '#34d399';
        ctx.font = `11px ${FONT}`;
        ctx.fillText(
          `${labels.rareSoil}: ${s.rareSoil.toLocaleString()}`,
          ox + w - 50,
          cy + 12,
        );

        ctx.fillStyle = '#fbbf24';
        ctx.fillText(
          `${labels.coal}: ${s.coal.toLocaleString()}`,
          ox + 10,
          cy,
        );

        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`${s.tiles} ${labels.tiles}`, ox + 10, cy + 12);
      } else {
        ctx.textAlign = 'left';
        ctx.font = `bold 12px ${FONT}`;
        ctx.fillStyle = '#64748b';
        ctx.fillText(`#${i + 1}`, ox + 10, cy);

        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(ox + 44, cy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = `bold 13px ${FONT}`;
        ctx.fillText(fitText(ctx, s.name, w * 0.32), ox + 58, cy);

        ctx.fillStyle = '#94a3b8';
        ctx.font = `11px ${FONT}`;
        ctx.fillText(`${s.tiles} ${labels.tiles}`, ox + w * 0.5, cy);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`${labels.coal}: ${s.coal.toLocaleString()}`, ox + w - 10, cy);
        ctx.fillStyle = '#34d399';
        ctx.fillText(`${labels.rareSoil}: ${s.rareSoil.toLocaleString()}`, ox + w - 10, cy + 14);
      }

      y += rowH;
    });
}

export function captureMapScreenshot(data) {
  const {
    tiles,
    territories,
    alliances,
    markers,
    allianceStats,
    labels,
    serverId,
    markerLabels,
    isRtl = false,
  } = data;

  const gridW = LABEL + GRID_SIZE * TILE;
  const gridH = LABEL + GRID_SIZE * TILE;
  const headerExtra = 95;
  const statsRows = Math.max(allianceStats.length, 1);
  const statsH = 56 + statsRows * 40;
  const totalW = PAD * 2 + gridW;
  const totalH = PAD * 2 + headerExtra + gridH + statsH;

  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(totalW * SCALE);
  canvas.height = Math.ceil(totalH * SCALE);
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.scale(SCALE, SCALE);

  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, totalW, totalH);

  const ox = PAD;
  const gridY = PAD + headerExtra;

  drawHeader(ctx, ox, labels, serverId, isRtl);

  const gx = ox;
  const gy = gridY;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(gx, gy, gridW, gridH);
  ctx.strokeStyle = '#0e7490';
  ctx.lineWidth = 2;
  ctx.strokeRect(gx, gy, gridW, gridH);

  COLS.forEach((col, i) => {
    const x = gx + LABEL + i * TILE;
    drawCentered(ctx, String(col), x + TILE / 2, gy + LABEL / 2, `bold 12px ${FONT}`, '#22d3ee');
  });

  ROWS.forEach((row, ri) => {
    const y = gy + LABEL + ri * TILE;
    drawCentered(ctx, row, gx + LABEL / 2, y + TILE / 2, `bold 12px ${FONT}`, '#22d3ee');

    COLS.forEach((_, ci) => {
      const idx = getTileIndex(ri, ci);
      drawTile(
        ctx,
        gx + LABEL + ci * TILE,
        y,
        tiles[idx],
        getCoordinate(ri, ci),
        resolveAllianceId(territories, idx),
        alliances,
        markers[idx] ?? markers[String(idx)],
        markerLabels,
      );
    });
  });

  drawStats(ctx, ox, gridY + gridH, gridW, allianceStats, labels, isRtl);

  return canvas;
}

export function downloadCanvas(canvas, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}
