import PageTransition from '../components/PageTransition';
import TerminalCard from '../components/TerminalCard';
import StatusBadge from '../components/StatusBadge';
import NeonButton from '../components/NeonButton';
import { pitches } from '../data/mockData';

const leaderboard = pitches
  .slice()
  .sort((a, b) => b.rep - a.rep)
  .map((entry, index) => ({
    ...entry,
    rank: index + 1,
    delta: index === 0 ? 'top_recruit' : `${Math.max(18, 92 - index * 11)} rep behind`,
  }));

const podium = leaderboard.slice(0, 3);

export default function Leaderboard() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <TerminalCard className="p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm text-ghost-primary">builder_leaderboard</p>
              <h1 className="mt-3 text-3xl font-extrabold md:text-5xl">ranked by reputation, shipped work, and revival impact</h1>
              <p className="mt-4 text-sm leading-6 text-ghost-white/70">
                The top builders are surfaced here. Higher reputation means more trust, more visibility, and better access to relic revivals.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-ghost-accent bg-black/40 px-4 py-3 text-xs uppercase tracking-wider text-ghost-white/70">
                active builders: 47
              </div>
              <div className="rounded-2xl border border-ghost-accent bg-black/40 px-4 py-3 text-xs uppercase tracking-wider text-ghost-white/70">
                weekly climbs: 12
              </div>
              <div className="rounded-2xl border border-ghost-accent bg-black/40 px-4 py-3 text-xs uppercase tracking-wider text-ghost-white/70">
                reviews pending: 3
              </div>
            </div>
          </div>
        </TerminalCard>

        <div className="grid gap-4 lg:grid-cols-3">
          {podium.map((entry, index) => (
            <TerminalCard
              key={entry.user}
              className={`p-5 ${index === 0 ? 'border-ghost-primary shadow-glow lg:scale-[1.02]' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-ghost-white/50">rank 0{entry.rank}</p>
                  <h2 className="mt-2 text-2xl font-bold text-ghost-primary">{entry.user}</h2>
                </div>
                <StatusBadge status={index === 0 ? 'revived' : index === 1 ? 'salvaged' : 'auctioning'} />
              </div>
              <p className="mt-5 text-4xl font-black text-ghost-white">{entry.rep}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-ghost-white/50">reputation</p>
              <p className="mt-4 text-sm leading-6 text-ghost-white/75">{entry.summary}</p>
              <p className="mt-4 text-xs uppercase tracking-widest text-ghost-primary">{entry.delta}</p>
            </TerminalCard>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <TerminalCard className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-ghost-primary">full_rankings</p>
              <NeonButton variant="outline">refresh_board</NeonButton>
            </div>
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.user}
                  className={`grid gap-4 rounded-2xl border px-4 py-4 md:grid-cols-[72px_1fr_auto] md:items-center ${
                    entry.rank === 1 ? 'border-ghost-primary bg-ghost-primary/5' : 'border-ghost-accent bg-black/30'
                  }`}
                >
                  <div>
                    <p className="text-xs uppercase tracking-widest text-ghost-white/50">rank</p>
                    <p className="text-2xl font-bold text-ghost-primary">#{entry.rank}</p>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-semibold">{entry.user}</p>
                      <StatusBadge status={entry.rank === 1 ? 'revived' : entry.rank <= 3 ? 'salvaged' : 'auctioning'} />
                    </div>
                    <p className="mt-1 text-sm text-ghost-white/70">{entry.summary}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-ghost-white">{entry.rep}</p>
                    <p className="text-xs uppercase tracking-widest text-ghost-white/50">rep</p>
                  </div>
                </div>
              ))}
            </div>
          </TerminalCard>

          <div className="space-y-6">
            <TerminalCard className="p-5">
              <p className="text-sm text-ghost-primary">ranking_rules</p>
              <div className="mt-4 space-y-3 text-sm text-ghost-white/75">
                <p>&gt; reputation is weighted by shipped revivals</p>
                <p>&gt; higher quality pitches increase board visibility</p>
                <p>&gt; active account health boosts trust ranking</p>
                <p>&gt; stale accounts decay over time</p>
              </div>
            </TerminalCard>

            <TerminalCard className="p-5">
              <p className="text-sm text-ghost-primary">next_up</p>
              <div className="mt-4 space-y-3 text-sm text-ghost-white/75">
                <p>&gt; review pending submissions</p>
                <p>&gt; open a builder profile</p>
                <p>&gt; compare revival proposals</p>
              </div>
            </TerminalCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
