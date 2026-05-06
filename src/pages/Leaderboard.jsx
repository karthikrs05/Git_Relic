import { useEffect, useState } from 'react';
import PageTransition from '../components/PageTransition';
import TerminalCard from '../components/TerminalCard';
import StatusBadge from '../components/StatusBadge';
import NeonButton from '../components/NeonButton';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';

// Decorative fallback shown while loading or when no salvages exist yet
const MOCK_ENTRIES = [
  { username: 'root_alpha', reputation: 1860, salvaged: 18, summary: 'Ship account recovery, upgrade auth flow.' },
  { username: 'zer0day',    reputation: 1675, salvaged: 16, summary: 'Stabilize CI/CD and ship roadmap in 30 days.' },
  { username: 'sh1ft',      reputation: 1420, salvaged: 14, summary: 'Modularize auth and cut infra cost by 40%.' },
  { username: 'ghostpatch', reputation: 1315, salvaged: 12, summary: 'Refactor the rescue pipeline.' },
  { username: 'coldstack',  reputation: 980,  salvaged: 9,  summary: 'Port to Bun runtime, add typed plugin API.' },
  { username: 'stackforge', reputation: 1095, salvaged: 10, summary: 'Recover abandoned monorepos.' },
  { username: 'nullwave',   reputation: 890,  salvaged: 8,  summary: 'Replace brittle routes with guard rails.' },
];

export default function Leaderboard() {
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [isMock, setIsMock]     = useState(false);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch(`${API_BASE}/projects/leaderboard`);
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        if (data.length === 0) {
          // No salvages yet — show decorative mock data
          setEntries(MOCK_ENTRIES.map((e, i) => ({ ...e, rank: i + 1 })));
          setIsMock(true);
        } else {
          setEntries(data);
          setIsMock(false);
        }
      } catch {
        // Fallback to mock when API unavailable
        setEntries(MOCK_ENTRIES.map((e, i) => ({ ...e, rank: i + 1 })));
        setIsMock(true);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const podium = entries.slice(0, 3);

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
              {isMock && !loading && (
                <p className="mt-3 text-xs text-yellow-400/80">
                  &gt; demo_data — salvage projects to appear on the real board
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-ghost-accent bg-black/40 px-4 py-3 text-xs uppercase tracking-wider text-ghost-white/70">
                {isMock ? 'demo mode' : `${entries.length} builders`}
              </div>
              <div className="rounded-2xl border border-ghost-accent bg-black/40 px-4 py-3 text-xs uppercase tracking-wider text-ghost-white/70">
                ranked by salvages
              </div>
            </div>
          </div>
        </TerminalCard>

        {loading ? (
          <p className="text-sm text-ghost-primary">fetching_board...</p>
        ) : (
          <>
            {/* Podium — top 3 */}
            <div className="grid gap-4 lg:grid-cols-3">
              {podium.map((entry, index) => (
                <TerminalCard
                  key={entry.username}
                  className={`p-5 ${index === 0 ? 'border-ghost-primary shadow-glow lg:scale-[1.02]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-ghost-white/50">rank 0{entry.rank}</p>
                      <h2 className="mt-2 text-2xl font-bold text-ghost-primary">{entry.username}</h2>
                    </div>
                    <StatusBadge status={index === 0 ? 'revived' : index === 1 ? 'salvaged' : 'scanned'} />
                  </div>
                  <p className="mt-5 text-4xl font-black text-ghost-white">{entry.reputation}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-ghost-white/50">reputation</p>
                  <p className="mt-4 text-sm leading-6 text-ghost-white/75">
                    {entry.summary || `${entry.salvaged} project${entry.salvaged !== 1 ? 's' : ''} salvaged`}
                  </p>
                  <p className="mt-4 text-xs uppercase tracking-widest text-ghost-primary">
                    {index === 0 ? 'top_salvager' : `rank_${entry.rank}`}
                  </p>
                </TerminalCard>
              ))}
            </div>

            {/* Full table */}
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
              <TerminalCard className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-ghost-primary">full_rankings</p>
                  <NeonButton variant="outline" onClick={() => window.location.reload()}>
                    refresh_board
                  </NeonButton>
                </div>
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div
                      key={entry.username}
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
                          <p className="text-lg font-semibold">{entry.username}</p>
                          <StatusBadge status={entry.rank === 1 ? 'revived' : entry.rank <= 3 ? 'salvaged' : 'published'} />
                        </div>
                        <p className="mt-1 text-sm text-ghost-white/70">
                          {entry.summary || `${entry.salvaged} relic${entry.salvaged !== 1 ? 's' : ''} salvaged`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-ghost-white">{entry.reputation}</p>
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
                    <p>&gt; each salvage earns 100 reputation</p>
                    <p>&gt; positional bonus for top 20 builders</p>
                    <p>&gt; stale accounts decay over time</p>
                  </div>
                </TerminalCard>

                <TerminalCard className="p-5">
                  <p className="text-sm text-ghost-primary">how_to_rank</p>
                  <div className="mt-4 space-y-3 text-sm text-ghost-white/75">
                    <p>&gt; explore abandoned relics</p>
                    <p>&gt; submit a revival pitch</p>
                    <p>&gt; get accepted by the donor</p>
                    <p>&gt; your rep goes up</p>
                  </div>
                </TerminalCard>
              </div>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}
