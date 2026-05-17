import { SERVERS } from '../constants.js';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function Header({
  auth,
  serverId,
  onServerChange,
  onLogout,
  onScreenshot,
  screenshotBusy,
}) {
  const { lang, setLang, t, LANGUAGES } = useI18n();
  const langLabels = { en: 'EN', ar: 'AR', tr: 'TR' };

  return (
    <header className="glass-panel sticky top-0 z-40 border-b border-cyan-500/10 px-3 py-3 sm:px-4">
      <div className="mx-auto max-w-[1920px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-center sm:text-start">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="font-orbitron neon-text-cyan text-lg font-black tracking-wider text-white sm:text-2xl">
                {t.loginTitle}
              </h1>
              <span className="shrink-0 rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(220,38,38,0.45)] sm:text-xs">
                GOV
              </span>
            </div>
            <p className="mt-0.5 font-orbitron text-[9px] tracking-[0.28em] text-slate-500 sm:text-[10px] sm:tracking-[0.35em]">
              {t.loginSubtitle}
            </p>
            {auth?.username && (
              <p className="mt-1 text-xs text-slate-400">
                {t.commander}:{' '}
                <span className="text-amber-400/90">{auth.username}</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-end sm:gap-2">
            <select
              value={serverId}
              onChange={(e) => onServerChange(e.target.value)}
              className="max-w-[130px] flex-1 rounded-lg border border-slate-600/50 bg-slate-900/70 px-2 py-2 text-xs text-white backdrop-blur-sm focus:border-cyan-500 focus:outline-none sm:max-w-none sm:flex-none sm:text-sm"
              aria-label={t.server}
            >
              {SERVERS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.isMain ? `${t.mainServer} ` : ''}
                  {s.label}
                </option>
              ))}
            </select>

            <div className="flex rounded-lg border border-slate-600/50 p-0.5">
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`min-w-[34px] rounded-md px-2 py-1.5 text-xs font-semibold transition ${
                    lang === l
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {langLabels[l]}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onScreenshot}
              disabled={screenshotBusy}
              className="rounded-lg border border-cyan-600/40 bg-cyan-950/40 px-2.5 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-900/40 disabled:opacity-50 sm:px-3"
            >
              {screenshotBusy ? t.capturing : t.screenshot}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg border border-red-600/40 bg-red-950/40 px-2.5 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-900/40 sm:px-3"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}