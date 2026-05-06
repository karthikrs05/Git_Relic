import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import TerminalCard from '../components/TerminalCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

import { getUserProjects } from '../services/projects.js';
import { getUserPitches } from '../services/pitches.js';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dropped relics');
  const tabs = ['dropped relics', 'salvaged relics', 'pitch tracker'];

  const [droppedProjects, setDroppedProjects] = useState([]);
  const [myPitches, setMyPitches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !token) return;
    async function load() {
      setLoading(true);
      try {
        const [projData, pitchData] = await Promise.all([
          getUserProjects(user.id || user._id, token).catch(() => []),
          getUserPitches(token).catch(() => [])
        ]);
        setDroppedProjects(projData);
        setMyPitches(pitchData);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id, token]);

  const salvaged      = droppedProjects.filter((p) => p.status === 'salvaged');
  const activePitches = myPitches.filter((p) => p.status === 'pending');

  const stats = [
    ['relic points',      droppedProjects.length * 100],
    ['dropped projects',  droppedProjects.length],
    ['salvaged projects', salvaged.length],
    ['active pitches',    activePitches.length],
  ];

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
                droppedProjects.length === 0
                  ? <p className="text-sm text-ghost-white/50">&gt; no dropped relics yet. <span className="text-ghost-primary cursor-pointer" onClick={() => navigate('/drop_project')}>drop_one →</span></p>
                  : <div className="space-y-2">
                      {droppedProjects.map((p) => (
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
