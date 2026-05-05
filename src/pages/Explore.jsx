import PageTransition from '../components/PageTransition';
import TerminalCard from '../components/TerminalCard';
import MonospaceInput from '../components/MonospaceInput';
import StatusBadge from '../components/StatusBadge';
import { relics } from '../data/mockData';

export default function Explore() {
  return (
    <PageTransition>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <TerminalCard className="h-fit p-5">
          <p className="mb-3 text-sm text-ghost-primary">filters</p>
          <div className="space-y-3 text-sm text-ghost-white/80">
            <div>
              <p className="mb-2 text-ghost-white/60">tech stack</p>
              <div className="space-y-1">
                {['React', 'Node', 'Rust', 'Python'].map((x) => <label className="block" key={x}><input className="mr-2" type="checkbox" />{x}</label>)}
              </div>
            </div>
            <div>
              <p className="mb-2 text-ghost-white/60">status</p>
              <div className="space-y-1">
                {['orphaned', 'auctioning', 'salvaged', 'revived'].map((x) => <label className="block" key={x}><input className="mr-2" type="checkbox" />{x}</label>)}
              </div>
            </div>
          </div>
        </TerminalCard>

        <div className="space-y-4">
          <MonospaceInput placeholder="search_relics --query" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {relics.map((relic) => (
              <TerminalCard key={relic.id} hover className="p-4 transition-transform">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{relic.title}</h3>
                  <StatusBadge status={relic.status} />
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {relic.stack.map((s) => <span key={s} className="rounded-lg bg-ghost-primary/10 px-2 py-1 text-xs text-ghost-primary">{s}</span>)}
                </div>
                <p className="text-xs text-ghost-white/70">commits: {relic.commits}</p>
                <p className="text-xs text-ghost-white/70">pitches: {relic.pitches}</p>
              </TerminalCard>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
