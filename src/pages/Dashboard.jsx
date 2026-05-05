import { useState } from 'react';
import PageTransition from '../components/PageTransition';
import TerminalCard from '../components/TerminalCard';
import { logs } from '../data/mockData';

const stats = [
  ['relic points', 1840],
  ['dropped projects', 12],
  ['salvaged projects', 7],
  ['active pitches', 5],
];

export default function Dashboard() {
  const [tab, setTab] = useState('dropped relics');
  const tabs = ['dropped relics', 'salvaged relics', 'pitch tracker'];

  return (
    <PageTransition>
      <div className="space-y-6">
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
          <p className="mb-2 text-sm text-ghost-primary">activity_feed</p>
          <div className="space-y-2 text-sm text-ghost-white/80">{logs.map((l) => <p key={l}>&gt; {l}</p>)}</div>
        </TerminalCard>
      </div>
    </PageTransition>
  );
}
