import { motion, AnimatePresence } from 'framer-motion';
import { MARKER_TYPES } from '../constants.js';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function TileModal({
  tile,
  coordinate,
  allianceName,
  currentMarker,
  onClose,
  onRelease,
  onSetMarker,
}) {
  const { t, translateTileType } = useI18n();

  if (!tile) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-md sm:items-center sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="glass-panel relative max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl p-5 sm:max-w-md sm:rounded-2xl sm:p-6 neon-border-cyan"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute end-3 top-3 text-slate-400 hover:text-white"
          >
            ✕
          </button>

          <h2 className="font-orbitron mb-1 text-xl font-bold text-cyan-400">
            {coordinate}
          </h2>
          <p className="mb-4 text-sm text-slate-400">
            {translateTileType(tile.type)} · {t.level} {tile.level} · {t.zone}{' '}
            {tile.zone}
          </p>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-slate-700/50 pb-2">
              <dt className="text-slate-400">{t.occupyingAlliance}</dt>
              <dd className="text-end font-semibold text-white">
                {allianceName || t.unclaimed}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-slate-700/50 pb-2">
              <dt className="text-slate-400">{t.buffBonus}</dt>
              <dd className="text-end text-amber-400">{tile.bonus}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-slate-700/50 pb-2">
              <dt className="text-slate-400">{t.coalProduction}</dt>
              <dd className="text-end">
                {tile.coal.toLocaleString()} {t.perHour}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-slate-700/50 pb-2">
              <dt className="text-slate-400">{t.rareSoilProduction}</dt>
              <dd className="text-end">
                {tile.rareSoil.toLocaleString()} {t.perHour}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-slate-700/50 pb-2">
              <dt className="text-slate-400">{t.cityRareSoil}</dt>
              <dd className="text-end">
                {tile.citySoil.toLocaleString()} {t.perHour}
              </dd>
            </div>
            <div className="flex justify-between gap-4 pb-2">
              <dt className="text-slate-400">{t.temperature}</dt>
              <dd className="text-end text-cyan-300">{tile.temp}</dd>
            </div>
          </dl>

          <div className="mt-4 border-t border-slate-700/50 pt-4">
            <p className="mb-2 text-xs font-semibold text-cyan-400/80">
              {t.tacticalMarkers}
            </p>
            <div className="flex flex-wrap gap-2">
              {MARKER_TYPES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onSetMarker(currentMarker === m ? null : m)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition sm:py-1.5 ${
                    currentMarker === m
                      ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300'
                      : 'border-slate-600 text-slate-300 hover:border-slate-400'
                  }`}
                >
                  {t.markerEmoji[m]} {t.markers[m]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={onRelease}
              disabled={!allianceName}
              className="flex-1 rounded-lg border border-red-500/50 bg-red-950/50 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-900/50 disabled:cursor-not-allowed disabled:opacity-40 sm:py-2"
            >
              {t.releaseTerritory}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700 sm:py-2"
            >
              {t.close}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
