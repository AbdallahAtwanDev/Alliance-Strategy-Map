import { motion } from 'framer-motion';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function MapToolbar({
  zoom,
  isFullscreen,
  onZoomIn,
  onZoomOut,
  onReset,
  onFullscreen,
}) {
  const { t } = useI18n();

  const btn =
    'rounded-lg border border-slate-600/50 bg-slate-900/60 px-2.5 py-2 text-[11px] font-semibold text-slate-200 backdrop-blur-sm transition hover:border-cyan-500/50 hover:text-cyan-300 sm:px-3 sm:py-1.5 sm:text-xs';

  return (
    <motion.div
      className="flex flex-wrap items-center gap-1.5 sm:gap-2"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button type="button" onClick={onZoomIn} className={btn} aria-label={t.zoomIn}>
        + {t.zoomIn}
      </button>
      <button type="button" onClick={onZoomOut} className={btn} aria-label={t.zoomOut}>
        − {t.zoomOut}
      </button>
      <button type="button" onClick={onReset} className={btn}>
        {t.resetView}
      </button>
      <span className="w-full text-center text-[10px] text-slate-500 sm:w-auto sm:text-xs">
        {Math.round(zoom * 100)}%
      </span>
      <button type="button" onClick={onFullscreen} className={btn}>
        {isFullscreen ? t.exitFullscreen : t.fullscreen}
      </button>
    </motion.div>
  );
}
