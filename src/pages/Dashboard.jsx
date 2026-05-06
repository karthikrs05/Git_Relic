import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import TerminalCard from '../components/TerminalCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

import { getUserProjects } from '../services/projects.js';
import { acceptPitch, getIncomingPitches, getUserPitches, rejectPitch } from '../services/pitches.js';
import { getMyInsights } from '../services/insights.js';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dropped relics');
  const tabs = ['dropped relics', 'salvaged relics', 'incoming requests', 'pitch tracker'];

  const [droppedProjects, setDroppedProjects] = useState([]);
  const [myPitches, setMyPitches] = useState([]);
  const [incomingPitches, setIncomingPitches] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !token) return;
    async function load() {
      setLoading(true);
      try {
        const [projData, pitchData, incomingData, insightsData] = await Promise.all([
          getUserProjects(user.id || user._id, token).catch(() => []),
          getUserPitches(token).catch(() => []),
          getIncomingPitches(token).catch(() => []),
          getMyInsights(token).catch(() => null),
        ]);
        setDroppedProjects(projData);
        setMyPitches(pitchData);
        setIncomingPitches(incomingData);
        setInsights(insightsData);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id, token]);

  const salvaged      = droppedProjects.filter((p) => p.status === 'salvaged');
  const droppedRelics = droppedProjects.filter((p) => p.status !== 'salvaged');
  const activePitches = myPitches.filter((p) => p.status === 'pending');
  const incomingPending = incomingPitches.filter((p) => p.status === 'pending');

  const stats = [
    ['reputation points', insights?.reputationPoints ?? 0],
    ['dropped projects',  droppedRelics.length],
    ['salvaged projects', salvaged.length],
    ['incoming requests', incomingPending.length],
  ];

  async function respondToPitch(pitchId, decision) {
    if (!token) return;
    setLoading(true);
    try {
      if (decision === 'accepted') await acceptPitch(pitchId, token);
      else await rejectPitch(pitchId, token);

      const [projData, pitchData, incomingData, insightsData] = await Promise.all([
        getUserProjects(user.id || user._id, token).catch(() => []),
        getUserPitches(token).catch(() => []),
        getIncomingPitches(token).catch(() => []),
        getMyInsights(token).catch(() => null),
      ]);
      setDroppedProjects(projData);
      setMyPitches(pitchData);
      setIncomingPitches(incomingData);
      setInsights(insightsData);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Profile header */}
        <TerminalCard className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-ghost-white/60">authenticated account</p>
              <h2 className="mt-2 text-2xl font-bold text-ghost-primary">{user?.username || 'unknown_user'}</h2>
              <p className="mt-1 text-sm text-ghost-white/70">{user?.email || 'no email on file'}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-ghost-white/70">
              <span className="rounded-xl border border-ghost-accent px-3 py-2">user_id: {user?.id || 'n/a'}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-ghost-primary px-3 py-2 text-ghost-primary hover:bg-ghost-primary/10"
              >
                logout
              </button>
            </div>
          </div>
        </TerminalCard>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([label, val]) => (
            <TerminalCard key={label} className="p-5">
              <p className="text-xs uppercase tracking-wider text-ghost-white/60">{label}</p>
              <p className="mt-2 text-3xl font-bold text-ghost-primary">
                {loading ? '...' : val}
              </p>
            </TerminalCard>
          ))}
        </div>

        {/* Tab content */}
        <TerminalCard className="p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                  tab === t
                    ? 'border-ghost-primary text-ghost-primary'
                    : 'border-ghost-accent text-ghost-white/70 hover:border-ghost-primary/50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-sm text-ghost-primary">loading_data...</p>
          ) : (
            <>
              {tab === 'dropped relics' && (
                droppedRelics.length === 0
                  ? <p className="text-sm text-ghost-white/50">&gt; no dropped relics yet. <span className="text-ghost-primary cursor-pointer" onClick={() => navigate('/drop_project')}>drop_one →</span></p>
                  : <div className="space-y-2">
                      {droppedRelics.map((p) => (
                        <div
                          key={p._id}
                          onClick={() => navigate(`/relic_detail/${p._id}`)}
                          className="flex cursor-pointer items-center justify-between rounded-xl border border-ghost-accent px-4 py-3 hover:border-ghost-primary transition-colors"
                        >
                          <span className="text-sm font-semibold">{p.title || p._id}</span>
                          <StatusBadge status={p.status} />
                        </div>
                      ))}
                    </div>
              )}

              {tab === 'salvaged relics' && (
                salvaged.length === 0
                  ? <p className="text-sm text-ghost-white/50">&gt; no salvaged relics yet.</p>
                  : <div className="space-y-2">
                      {salvaged.map((p) => (
                        <div
                          key={p._id}
                          onClick={() => navigate(`/relic_detail/${p._id}`)}
                          className="flex cursor-pointer items-center justify-between rounded-xl border border-ghost-accent px-4 py-3 hover:border-ghost-primary transition-colors"
                        >
                          <span className="text-sm font-semibold">{p.title || p._id}</span>
                          <StatusBadge status={p.status} />
                        </div>
                      ))}
                    </div>
              )}

              {tab === 'incoming requests' && (
                incomingPending.length === 0
                  ? <p className="text-sm text-ghost-white/50">&gt; no incoming revival requests yet.</p>
                  : <div className="space-y-3">
                      {incomingPending.map((p) => (
                        <div key={p._id} className="rounded-xl border border-ghost-accent px-4 py-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-semibold">
                                {p.projectId?.title || 'unknown project'}
                              </span>
                              <span className="text-xs text-ghost-white/60">
                                from: {p.salvagerId?.username || 'unknown'} (salvaged: {p.salvagerId?.salvagedProjects ?? 0})
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="rounded-xl border border-green-400/60 px-3 py-2 text-xs text-green-300 hover:bg-green-500/10"
                                onClick={() => respondToPitch(p._id, 'accepted')}
                              >
                                accept
                              </button>
                              <button
                                type="button"
                                className="rounded-xl border border-red-400/60 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10"
                                onClick={() => respondToPitch(p._id, 'rejected')}
                              >
                                reject
                              </button>
                            </div>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-xs text-ghost-white/70">{p.pitchText}</p>
                          {p.prLink && (
                            <p className="mt-2 text-xs text-ghost-white/50">
                              pr_link: <a className="text-ghost-primary underline" href={p.prLink} target="_blank" rel="noreferrer">{p.prLink}</a>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
              )}

              {tab === 'pitch tracker' && (
                myPitches.length === 0
                  ? <p className="text-sm text-ghost-white/50">&gt; no pitches submitted yet. <span className="text-ghost-primary cursor-pointer" onClick={() => navigate('/explore')}>browse_relics →</span></p>
                  : <div className="space-y-3">
                      {myPitches.map((p) => (
                        <div key={p._id} className="rounded-xl border border-ghost-accent px-4 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold">
                              {p.projectId?.title || 'unknown project'}
                            </span>
                            <span className={`text-xs font-bold ${
                              p.status === 'accepted' ? 'text-green-400'
                              : p.status === 'rejected' ? 'text-red-400'
                              : 'text-ghost-primary'
                            }`}>
                              [{p.status}]
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-ghost-white/60">{p.pitchText}</p>
                        </div>
                      ))}
                    </div>
              )}
            </>
          )}
        </TerminalCard>
      </div>
    </PageTransition>
  );
}
