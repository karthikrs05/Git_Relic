import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import MonospaceInput from '../components/MonospaceInput';
import NeonButton from '../components/NeonButton';
import TypingText from '../components/TypingText';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, loading } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const isRegister = mode === 'register';
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, redirectTo]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password || (isRegister && !username)) {
      setError('Please fill all required fields.');
      return;
    }
    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      if (isRegister) {
        await register({ username, email, password });
      } else {
        await login({ email, password });
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageTransition>
      <div className="grid min-h-[78vh] overflow-hidden rounded-3xl border border-ghost-accent lg:grid-cols-2">
        <div className="bg-ghost-bgAlt p-8 flex flex-col justify-center">
          <TypingText text="init git-relic auth daemon" className="text-ghost-primary text-sm" />
          <h2 className="mt-4 text-4xl font-bold">Access the Vault</h2>
          <p className="mt-3 text-ghost-white/70">
            {isRegister ? 'Create your relic identity and start reviving abandoned code.' : 'Sign in to track relics, bids, and project revivals.'}
          </p>
          <pre className="mt-6 text-xs text-ghost-white/70">&gt; listening: relic-auth-node
&gt; handshake: encrypted
<span className="inline-block -translate-x-4">&gt; status: awaiting credentials</span></pre>
        </div>

        <div className="bg-black/50 p-8 flex items-center">
          <form className="w-full space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-ghost-accent p-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`rounded-xl py-2 text-sm ${!isRegister ? 'bg-ghost-primary text-black font-semibold' : 'text-ghost-white/70'}`}
              >
                login
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`rounded-xl py-2 text-sm ${isRegister ? 'bg-ghost-primary text-black font-semibold' : 'text-ghost-white/70'}`}
              >
                register
              </button>
            </div>

            {isRegister && <MonospaceInput placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />}
            <MonospaceInput placeholder="email_or_handle" value={email} onChange={(e) => setEmail(e.target.value)} />
            <MonospaceInput placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {isRegister && <MonospaceInput placeholder="confirm_password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />}

            <div>
              <p className="mb-2 text-xs text-ghost-white/60">password strength</p>
              <div className="grid grid-cols-4 gap-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`h-2 rounded ${i < strength ? 'bg-ghost-primary' : 'bg-ghost-accent'}`} />
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-red-300">{error}</p>}

            <NeonButton className="w-full" type="submit" disabled={submitting}>
              {submitting ? 'processing...' : (isRegister ? 'create_account' : 'login')}
            </NeonButton>
            <p className="text-center text-xs text-ghost-white/60">
              {isRegister ? 'already have access? ' : 'new to git relic? '}
              <button
                type="button"
                onClick={() => setMode(isRegister ? 'login' : 'register')}
                className="text-ghost-primary hover:underline"
              >
                {isRegister ? 'switch_to_login' : 'switch_to_register'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
