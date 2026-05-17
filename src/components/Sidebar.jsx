import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function Sidebar({
  sidebarTab,
  setSidebarTab,
  alliances,
  selectedAllianceId,
  setSelectedAllianceId,
  updateAllianceName,
  allianceStats,
  structureFilter,
  setStructureFilter,
  onWipeServer,
}) {
  const { t } = useI18n();

  return (
    <aside className="glass-panel order-2 w-full shrink-0 rounded-xl p-3 sm:p-4 lg:order-1 lg:w-72 xl:w-80">
      <div className="mb-3 flex rounded-lg border border-slate-700/50 p-0.5 sm:mb-4">
        <button
          type="button"
          onClick={() => setSidebarTab('paint')}
          className={`flex-1 rounded-md py-2 text-xs font-semibold transition sm:py-1.5 ${
            sidebarTab === 'paint'
              ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(34,211,238,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.alliancePaint}
        </button>
        <button
          type="button"
          onClick={() => setSidebarTab('stats')}
          className={`flex-1 rounded-md py-2 text-xs font-semibold transition sm:py-1.5 ${
            sidebarTab === 'stats'
              ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(34,211,238,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.statistics}
        </button>
      </div>

      <div className="mb-3 sm:mb-4">
        <label className="mb-1 block text-xs font-semibold text-cyan-400/80">
          {t.structureFilter}
        </label>
        <input
          type="text"
          value={structureFilter}
          onChange={(e) => setStructureFilter(e.target.value)}
          placeholder={t.filterPlaceholder}
          className="w-full rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none sm:py-2"
        />
      </div>

      <AnimatePresence mode="wait">
        {sidebarTab === 'paint' ? (
          <motion.div
            key="paint"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="max-h-[40vh] space-y-2 overflow-y-auto pr-1 sm:max-h-[50vh] lg:max-h-[55vh]"
          >
            <p className="mb-2 text-xs text-slate-400">{t.selectAllianceHint}</p>
            {selectedAllianceId != null && (
              <button
                type="button"
                onClick={() => setSelectedAllianceId(null)}
                className="mb-2 w-full rounded-lg border border-slate-600 py-2 text-xs text-slate-400 hover:text-white sm:py-1"
              >
                {t.clearSelection}
              </button>
            )}
            {alliances.map((alliance) => (
              <div
                key={alliance.id}
                className={`flex items-center gap-2 rounded-lg border p-2 transition ${
                  selectedAllianceId === alliance.id
                    ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400 neon-border-cyan'
                    : 'border-slate-700/50 hover:border-slate-500'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedAllianceId(alliance.id)}
                  className="h-9 w-9 shrink-0 rounded-lg border-2 border-white/20 shadow-inner sm:h-8 sm:w-8"
                  style={{ backgroundColor: alliance.color }}
                />
                <input
                  type="text"
                  value={alliance.name}
                  onChange={(e) =>
                    updateAllianceName(alliance.id, e.target.value)
                  }
                  className="min-w-0 flex-1 rounded-lg border border-slate-600/50 bg-slate-800/60 px-2 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={onWipeServer}
              className="mt-3 w-full rounded-lg border border-red-500/40 bg-red-950/30 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-900/40 sm:mt-4 sm:py-2"
            >
              {t.wipeServer}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="stats"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="max-h-[40vh] space-y-3 overflow-y-auto sm:max-h-[50vh] lg:max-h-[55vh]"
          >
            <h3 className="font-orbitron text-sm font-bold text-cyan-400">
              {t.leaderboard}
            </h3>
            {allianceStats.length === 0 ? (
              <p className="text-xs text-slate-500">{t.noTerritories}</p>
            ) : (
              allianceStats
                .sort((a, b) => b.tiles - a.tiles)
                .map((stat, i) => (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-3"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="font-orbitron text-xs text-slate-500">
                        #{i + 1}
                      </span>
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: stat.color }}
                      />
                      <span className="text-sm font-semibold text-white">
                        {stat.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({stat.tiles} {t.tiles})
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {t.coal}:{' '}
                      <span className="font-mono text-amber-300">
                        {stat.coal.toLocaleString()}
                        {t.perHour}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400">
                      {t.rareSoil}:{' '}
                      <span className="font-mono text-emerald-300">
                        {stat.rareSoil.toLocaleString()}
                        {t.perHour}
                      </span>
                    </p>
                  </motion.div>
                ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
