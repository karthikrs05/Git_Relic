import { useState } from 'react';
import PageTransition from '../components/PageTransition';
import TerminalCard from '../components/TerminalCard';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('dropped relics');
  const tabs = ['dropped relics', 'salvaged relics', 'pitch tracker'];
  const account = user?.account;
  const stats = [
    ['relic points', account?.stats?.relicPoints ?? 0],
    ['dropped projects', account?.stats?.droppedProjects ?? 0],
    ['salvaged projects', account?.stats?.salvagedProjects ?? 0],
    ['active pitches', account?.stats?.activePitches ?? 0],
  ];
  const activity = account?.activity || [];

  return (
    <PageTransition>
      <div className="space-y-6">
        <TerminalCard className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-ghost-white/60">authenticated account</p>
              <h2 className="mt-2 text-2xl font-bold text-ghost-primary">{user?.username || 'unknown_user'}</h2>
              <p className="mt-1 text-sm text-ghost-white/70">{user?.email || 'no email on file'}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-ghost-white/70">
              <span className="rounded-xl border border-ghost-accent px-3 py-2">user_id: {user?.id || 'n/a'}</span>
              <span className="rounded-xl border border-ghost-accent px-3 py-2">last_login: {account?.lastLoginAt ? new Date(account.lastLoginAt).toLocaleString() : 'n/a'}</span>
              <button type="button" onClick={logout} className="rounded-xl border border-ghost-primary px-3 py-2 text-ghost-primary">
                logout
              </button>
            </div>
          </div>
        </TerminalCard>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([label, val]) => (
            <TerminalCard key={label} className="p-5">
              <p className="text-xs uppercase tracking-wider text-ghost-white/60">{label}</p>
              <p className="mt-2 text-3xl font-bold text-ghost-primary">{val}</p>
            </TerminalCard>
          ))}
        </div>

        <TerminalCard className="p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-xl border px-3 py-2 text-sm ${tab === t ? 'border-ghost-primary text-ghost-primary' : 'border-ghost-accent text-ghost-white/70'}`}>{t}</button>
            ))}
          </div>
          <p className="text-sm text-ghost-white/80">active tab: {tab}</p>
        </TerminalCard>

        <TerminalCard className="p-5">
          <p className="mb-2 text-sm text-ghost-primary">account_activity</p>
          <div className="space-y-2 text-sm text-ghost-white/80">
            {activity.length > 0 ? activity.map((entry) => (
              <p key={`${entry.at}-${entry.type}`}>&gt; {entry.message} <span className="text-ghost-white/50">[{new Date(entry.at).toLocaleString()}]</span></p>
            )) : <p>&gt; no server activity yet</p>}
          </div>
        </TerminalCard>
      </div>
    </PageTransition>
  );
}
