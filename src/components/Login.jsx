import { useState } from 'react';
import { motion } from 'framer-motion';
import { VALID_PASSWORD } from '../constants.js';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function Login({ onLogin }) {
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== VALID_PASSWORD) {
      setError(t.loginError);
      return;
    }
    setError('');
    onLogin({ username: username.trim() || 'Commander' });
  };

  return (
    <motion.div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030712] px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <motion.div
        className="glass-login relative z-10 w-full max-w-md rounded-2xl p-8"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 120 }}
      >
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <h1 className="font-orbitron neon-text-cyan text-2xl font-black tracking-wider text-white sm:text-3xl">
            {t.loginTitle}
          </h1>
          <span className="rounded-full bg-red-600/90 px-2.5 py-0.5 text-xs font-bold text-white shadow-[0_0_12px_rgba(220,38,38,0.5)]">
            GOV
          </span>
        </div>
        <p className="mb-2 font-orbitron text-xs tracking-[0.35em] text-slate-400">
          {t.loginSubtitle}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t.usernamePlaceholder}
            className="w-full rounded-xl border border-slate-600/50 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 backdrop-blur-sm transition focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.passwordPlaceholder}
            className="w-full rounded-xl border border-slate-600/50 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 backdrop-blur-sm transition focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />

          {error && (
            <motion.p
              className="text-center text-sm text-red-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 font-bold text-black shadow-[0_0_24px_rgba(245,158,11,0.35)]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 14.59l-3.3-3.29 1.42-1.42L11 12.17l4.88-4.88 1.42 1.42L11 15.59z" />
            </svg>
            {t.loginButton}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
