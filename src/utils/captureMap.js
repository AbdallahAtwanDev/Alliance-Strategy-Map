import {
  COLS,
  getCoordinate,
  getTileIndex,
  GRID_SIZE,
  ROWS,
  ZONE_HEX,
} from '../constants.js';

const TILE = 72;
const LABEL = 32;
const PAD = 28;
const SCALE = 2;
const FONT = 'Tahoma, "Segoe UI", Arial, sans-serif';
const MARKER_FALLBACK = { attack: 'ATK', defend: 'DEF', target: 'TGT' };

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

function getTileColors(tile, allianceId, alliances) {
  const alliance = allianceId != null ? findAlliance(alliances, allianceId) : null;
  if (alliance) {
    return { bg: alliance.color, text: '#ffffff', border: '#e8e8e8' };
  }
  if (tile.type === 'Capitol') {
    return { bg: '#ffffff', text: '#111827', border: '#9ca3af' };
  }
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

function drawText(ctx, text, x, y, font, color, align = 'center', rtl = false) {
  if (!text) return;
  const prevDir = ctx.direction;
  if (rtl) ctx.direction = 'rtl';
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.direction = prevDir;
}

function drawTile(
  ctx,
  px,
  py,
  tile,
  coord,
  allianceId,
  alliances,
  marker,
  getTileLabel,
  markerLabels,
  isRtl,
) {
  const colors = getTileColors(tile, allianceId, alliances);
  const alliance = allianceId != null ? findAlliance(alliances, allianceId) : null;

  ctx.fillStyle = colors.bg;
  ctx.fillRect(px, py, TILE, TILE);
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);

  const cx = px + TILE / 2;
  const maxW = TILE - 10;
  const typeFont = isRtl ? `bold 11px ${FONT}` : `bold 12px ${FONT}`;
  ctx.font = typeFont;
  const typeLabel = fitText(
    ctx,
    getTileLabel ? getTileLabel(tile.type) : tile.type,
    maxW,
  );

  let y = py + 14;

  if (alliance) {
    ctx.font = `bold 10px ${FONT}`;
    const name = fitText(ctx, alliance.name, maxW);
    drawText(ctx, name, cx, y, ctx.font, colors.text, 'center', isRtl);
    y += 14;
  }

  drawText(
    ctx,
    typeLabel,
    cx,
    alliance ? y + 4 : py + TILE / 2 - 4,
    typeFont,
    colors.text,
    'center',
    isRtl,
  );

  if (marker) {
    const mk = markerLabels?.[marker] || MARKER_FALLBACK[marker] || marker;
    drawText(ctx, `[${mk}]`, cx, py + TILE - 26, `bold 9px ${FONT}`, colors.text, 'center', isRtl);
  }

  drawText(ctx, coord, cx, py + TILE - 12, `bold 10px ${FONT}`, colors.text);
}

function drawHeader(ctx, ox, labels, serverId, gridW, isRtl) {
  let y = PAD;
  const tx = isRtl ? ox + gridW : ox;
  const prevDir = ctx.direction;

  ctx.textBaseline = 'top';
  ctx.textAlign = isRtl ? 'right' : 'left';
  if (isRtl) ctx.direction = 'rtl';

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
    ctx.textAlign = 'left';
  }

  y += 30;
  ctx.textAlign = isRtl ? 'right' : 'left';
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

  ctx.direction = prevDir;
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
  if (isRtl) ctx.direction = 'rtl';
  ctx.fillText(labels.leaderboard, isRtl ? ox + w : ox, y);
  y += 32;

  if (!stats.length) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = `13px ${FONT}`;
    ctx.fillText(labels.noStats, isRtl ? ox + w : ox, y);
    ctx.direction = 'ltr';
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

        ctx.textAlign = 'left';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`${labels.coal}: ${s.coal.toLocaleString()}`, ox + 10, cy);
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
        ctx.fillText(`${s.tiles} ${labels.tiles}`, ox + w * 0.48, cy);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`${labels.coal}: ${s.coal.toLocaleString()}`, ox + w - 10, cy);
        ctx.fillStyle = '#34d399';
        ctx.fillText(`${labels.rareSoil}: ${s.rareSoil.toLocaleString()}`, ox + w - 10, cy + 14);
      }

      y += rowH;
    });

  ctx.direction = 'ltr';
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
    getTileLabel,
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

  drawHeader(ctx, ox, labels, serverId, gridW, isRtl);

  const gx = ox;
  const gy = gridY;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(gx, gy, gridW, gridH);
  ctx.strokeStyle = '#0e7490';
  ctx.lineWidth = 2;
  ctx.strokeRect(gx, gy, gridW, gridH);

  COLS.forEach((col, i) => {
    const x = gx + LABEL + i * TILE;
    drawText(ctx, String(col), x + TILE / 2, gy + LABEL / 2, `bold 13px ${FONT}`, '#22d3ee');
  });

  ROWS.forEach((row, ri) => {
    const y = gy + LABEL + ri * TILE;
    drawText(ctx, row, gx + LABEL / 2, y + TILE / 2, `bold 13px ${FONT}`, '#22d3ee');

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
        getTileLabel,
        markerLabels,
        isRtl,
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
