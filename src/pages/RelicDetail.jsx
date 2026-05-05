import { useState } from 'react';
import PageTransition from '../components/PageTransition';
import TerminalCard from '../components/TerminalCard';
import { commits, pitches } from '../data/mockData';

export default function RelicDetail() {
  const [open, setOpen] = useState(true);
  return (
    <PageTransition>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TerminalCard className="p-5">
            <p className="mb-4 text-sm text-ghost-primary">project_autopsy</p>
            <div className="mb-4 grid grid-cols-12 gap-1">
              {[...Array(72)].map((_, i) => <div key={i} className={`h-4 rounded ${i % 5 === 0 ? 'bg-ghost-primary/80' : i % 3 === 0 ? 'bg-ghost-primary/40' : 'bg-ghost-accent/60'}`} />)}
            </div>
            <div className="mb-4 space-y-2 text-sm">
              <p>Language Distribution</p>
              <div className="h-3 w-full rounded bg-ghost-accent overflow-hidden"><div className="h-full w-[56%] bg-ghost-primary" /></div>
              <div className="h-3 w-full rounded bg-ghost-accent overflow-hidden"><div className="h-full w-[24%] bg-cyan-400" /></div>
              <div className="h-3 w-full rounded bg-ghost-accent overflow-hidden"><div className="h-full w-[20%] bg-yellow-300" /></div>
            </div>
            <p className="mb-2 text-sm text-ghost-white/70">Final Words</p>
            <div className="space-y-2 text-sm text-ghost-white/85">{commits.map((c) => <p key={c}>&gt; {c}</p>)}</div>
          </TerminalCard>

          <TerminalCard className="p-5">
            <button className="mb-3 text-sm text-ghost-primary" onClick={() => setOpen((v) => !v)}>file_tree {open ? '[-]' : '[+]'}</button>
            {open && (
              <pre className="text-sm text-ghost-white/80">src/
  components/
    DashboardShell.jsx
  core/
    scheduler.ts
  scripts/
    migrate.sh
README.md</pre>
            )}
          </TerminalCard>
        </div>

        <div className="space-y-6">
          <TerminalCard className="p-5">
            <p className="mb-2 text-sm text-ghost-primary">lineage_tree</p>
            <div className="text-xs text-ghost-white/75 leading-6">legacy-core
  |- fork/ops-hotfix
  |  |- patch/memory-leak
  |- branch/revamp-ui
     |- branch/typed-api</div>
          </TerminalCard>

          <TerminalCard className="p-5">
            <p className="mb-3 text-sm text-ghost-primary">pitches</p>
            <div className="space-y-3 text-sm">
              {pitches.map((p) => (
                <div key={p.user} className="rounded-xl border border-ghost-accent p-3">
                  <p className="font-semibold text-ghost-primary">{p.user} <span className="text-xs text-ghost-white/60">rep {p.rep}</span></p>
                  <p className="mt-1 text-ghost-white/80">{p.summary}</p>
                </div>
              ))}
            </div>
          </TerminalCard>
        </div>
      </div>
    </PageTransition>
  );
}
