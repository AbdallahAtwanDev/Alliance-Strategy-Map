import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import {
  COLS,
  getCoordinate,
  getTileIndex,
  GRID_SIZE,
  ROWS,
  ZONE_HEX,
} from '../constants.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import MapToolbar from './MapToolbar.jsx';

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.12;

export default function MapViewport({
  tiles,
  territories,
  markers,
  getAllianceById,
  onTileClick,
  modalIndex,
  structureFilter,
  translateTileType,
}) {
  const { t } = useI18n();
  const viewportRef = useRef(null);
  const containerRef = useRef(null);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const didPan = useRef(false);
  const pendingTile = useRef(null);
  const lastPinchDist = useRef(null);

  zoomRef.current = zoom;
  panRef.current = pan;

  const filterLower = structureFilter.trim().toLowerCase();

  const tileMatchesFilter = useCallback(
    (tile) => {
      if (!filterLower) return true;
      const en = tile.type.toLowerCase();
      const translated = translateTileType(tile.type).toLowerCase();
      return en.includes(filterLower) || translated.includes(filterLower);
    },
    [filterLower, translateTileType],
  );

  const hasActiveFilter = filterLower.length > 0;

  const applyZoom = useCallback((newZoom, originX, originY) => {
    const z = zoomRef.current;
    const p = panRef.current;
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));
    const scale = clamped / z;
    const nx = originX - (originX - p.x) * scale;
    const ny = originY - (originY - p.y) * scale;
    setZoom(clamped);
    setPan({ x: nx, y: ny });
  }, []);

  const handleZoomIn = () => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    applyZoom(zoomRef.current + ZOOM_STEP, rect.width / 2, rect.height / 2);
  };

  const handleZoomOut = () => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    applyZoom(zoomRef.current - ZOOM_STEP, rect.width / 2, rect.height / 2);
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleFullscreen = async () => {
    const el = viewportRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const ox = e.clientX - rect.left;
      const oy = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      applyZoom(zoomRef.current + delta, ox, oy);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [applyZoom]);

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    const tileEl = e.target.closest('[data-tile-index]');
    pendingTile.current = tileEl
      ? Number(tileEl.getAttribute('data-tile-index'))
      : null;
    didPan.current = false;
    setIsPanning(true);
    panStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    if (Math.hypot(dx, dy) > 5) didPan.current = true;
    setPan({
      x: panStart.current.panX + dx,
      y: panStart.current.panY + dy,
    });
  };

  const onPointerUp = (e) => {
    if (!didPan.current && pendingTile.current != null) {
      onTileClick(pendingTile.current);
    }
    pendingTile.current = null;
    setIsPanning(false);
    try {
      containerRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.hypot(dx, dy);
    }
  };

  const onTouchMove = (e) => {
    if (e.touches.length !== 2 || !lastPinchDist.current) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    const scale = dist / lastPinchDist.current;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    applyZoom(zoomRef.current * scale, rect.width / 2, rect.height / 2);
    lastPinchDist.current = dist;
  };

  const onTouchEnd = () => {
    lastPinchDist.current = null;
  };


  return (
    <div className="order-1 flex min-w-0 flex-1 flex-col gap-2 lg:order-2">
      <MapToolbar
        zoom={zoom}
        isFullscreen={isFullscreen}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onFullscreen={toggleFullscreen}
      />

      <div
        ref={viewportRef}
        className={`glass-panel relative min-h-[50vh] flex-1 overflow-hidden rounded-xl sm:min-h-[55vh] lg:min-h-[60vh] ${isFullscreen ? 'bg-slate-950 p-2 sm:p-4' : ''}`}
      >
        <p className="pointer-events-none absolute bottom-2 start-2 z-10 text-[10px] text-slate-500 sm:text-xs">
          {t.wheelHint}
        </p>
        <div
          ref={containerRef}
          className={`map-viewport h-full w-full overflow-hidden ${isPanning ? 'is-panning' : ''}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            id="capture-target"
            className="inline-block origin-top-left p-1 sm:p-3"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: isPanning ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            <div className="map-grid-inner grid gap-0 rounded-lg border border-[#164e63] bg-[#0f172a]">
              <div />
              {COLS.map((col) => (
                <div
                  key={`col-${col}`}
                  className="map-axis-label flex items-center justify-center font-bold text-[#22d3ee]"
                >
                  {col}
                </div>
              ))}

              {ROWS.map((row, rowIndex) => (
                <Fragment key={row}>
                  <div className="map-axis-label flex items-center justify-center font-bold text-[#22d3ee]">
                    {row}
                  </div>
                  {COLS.map((_, colIndex) => {
                    const index = getTileIndex(rowIndex, colIndex);
                    const tile = tiles[index];
                    const coord = getCoordinate(rowIndex, colIndex);
                    const zoneHex = ZONE_HEX[tile.zone];
                    const allianceId = territories[index];
                    const alliance = allianceId
                      ? getAllianceById(allianceId)
                      : null;
                    const isCapitol = tile.type === 'Capitol';
                    const isSelected = modalIndex === index;
                    const marker = markers[index];
                    const matches = tileMatchesFilter(tile);
                    const dimmed = hasActiveFilter && !matches;
                    const highlighted = hasActiveFilter && matches;

                    return (
                      <div
                        key={coord}
                        data-tile-index={index}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onTileClick(index);
                        }}
                        className={[
                          'map-tile relative flex cursor-pointer flex-col items-center justify-center overflow-hidden border p-0 text-center select-none touch-none',
                          isCapitol ? 'ring-1 ring-[#fbbf24]' : '',
                          isSelected ? 'ring-2 ring-[#22d3ee] z-10' : '',
                          dimmed ? 'tile-filter-dim' : '',
                          highlighted ? 'tile-highlight-match ring-2 ring-[#22d3ee]' : '',
                        ].join(' ')}
                        style={
                          alliance
                            ? {
                                backgroundColor: alliance.color,
                                color: '#ffffff',
                                borderColor: 'rgba(255,255,255,0.35)',
                              }
                            : isCapitol
                              ? {
                                  backgroundColor: '#ffffff',
                                  color: '#111827',
                                  borderColor: '#d1d5db',
                                }
                              : {
                                  backgroundColor: zoneHex.bg,
                                  color: zoneHex.text,
                                  borderColor: zoneHex.border,
                                }
                        }
                        title={coord}
                      >
                        {alliance && (
                          <span className="map-tile-alliance absolute inset-x-0 top-0 w-full truncate px-px font-bold leading-none">
                            {alliance.name}
                          </span>
                        )}
                        {marker && (
                          <span className="map-tile-marker absolute end-0 top-0 leading-none">
                            {t.markerEmoji[marker]}
                          </span>
                        )}
                        <div
                          className={`map-tile-text-wrap flex w-full flex-col items-center justify-center ${
                            alliance ? 'mt-1.5 sm:mt-2' : ''
                          }`}
                        >
                          <span className="map-tile-type w-full truncate px-px font-semibold leading-none">
                            {translateTileType(tile.type)}
                          </span>
                          <span className="map-tile-coord leading-none opacity-75">
                            {coord}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
