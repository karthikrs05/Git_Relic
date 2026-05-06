import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import TerminalCard from '../components/TerminalCard';
import TypingText from '../components/TypingText';
import NeonButton from '../components/NeonButton';
import StatCounter from '../components/StatCounter';
import StatusBadge from '../components/StatusBadge';

import { API_BASE } from '../config.js';

export default function Landing() {
  const navigate = useNavigate();
  const [featuredRelics, setFeaturedRelics] = useState([]);
  const [counts, setCounts] = useState({ totalRelicsUploaded: 0, activeRevivalRequests: 0, revivedProjects: 0 });
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch(`${API_BASE}/insights/overview`);
        if (!res.ok) return;
        const data = await res.json();
        setFeaturedRelics(data.featuredRelics || []);
        setCounts(data.totals || { totalRelicsUploaded: 0, activeRevivalRequests: 0, revivedProjects: 0 });
        setActivity(data.activity || []);
      } catch {
        // Non-critical — landing page stays functional with zeros/empty feed
      }
    }
    fetchInsights();
  }, []);

  const stats = [
    { label: 'total relics uploaded',    value: counts.totalRelicsUploaded || 0 },
    { label: 'active revival requests',  value: counts.activeRevivalRequests || 0 },
    { label: 'revived projects',         value: counts.revivedProjects || 0 },
  ];

  return (
    <PageTransition>
      <section className="space-y-8">
        <TerminalCard className="p-8 md:p-12">
          <TypingText text="// abandoned code finds new life" className="text-sm text-ghost-primary" />
          <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-6xl">the graveyard for great software</h1>
          <p className="mt-4 max-w-2xl text-ghost-white/70">Drop dormant repositories, run autopsy intelligence, and let builders pitch revival plans.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/explore"><NeonButton>explore_relics</NeonButton></Link>
            <Link to="/drop_project"><NeonButton variant="outline">drop_a_project</NeonButton></Link>
            <Link to="/auth"><NeonButton variant="outline">login_register</NeonButton></Link>
          </div>
        </TerminalCard>

        {/* Live stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item) => (
            <TerminalCard key={item.label} className="p-5">
              <p className="text-xs uppercase tracking-widest text-ghost-white/60">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-ghost-primary"><StatCounter value={item.value} /></p>
            </TerminalCard>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Activity log — live */}
          <TerminalCard className="p-5">
            <p className="mb-3 text-sm text-ghost-primary">terminal_activity_feed.log</p>
            {activity.length === 0 ? (
              <p className="text-sm text-ghost-white/40">&gt; no activity yet.</p>
            ) : (
              <div className="h-48 space-y-2 overflow-hidden text-sm text-ghost-white/80">
                {activity.map((log, i) => (
                  <motion.p
                    key={`${log.type}-${log.at}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="cursor-pointer hover:text-ghost-primary"
                    onClick={() => log.projectId && navigate(`/relic_detail/${log.projectId}`)}
                  >
                    &gt; {log.message}
                  </motion.p>
                ))}
              </div>
            )}
          </TerminalCard>

          {/* Featured relics — live from API */}
          <TerminalCard className="p-5">
            <p className="mb-3 text-sm text-ghost-primary">featured_relics</p>
            {featuredRelics.length === 0 ? (
              <p className="text-sm text-ghost-white/40">&gt; no published relics yet.</p>
            ) : (
              <div className="space-y-3">
                {featuredRelics.map((relic) => (
                  <div
                    key={relic._id}
                    className="cursor-pointer rounded-xl border border-ghost-accent p-3 transition-colors hover:border-ghost-primary"
                    onClick={() => navigate(`/relic_detail/${relic._id}`)}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="font-semibold">{relic.title || 'untitled'}</p>
                      <StatusBadge status={relic.status} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {relic.techStack?.map((s) => (
                        <span key={s} className="rounded-lg bg-ghost-primary/10 px-2 py-0.5 text-xs text-ghost-primary">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TerminalCard>
        </div>

        <TerminalCard className="p-6">
          <p className="mb-5 text-sm text-ghost-primary">how_it_works.sh</p>
          <div className="grid gap-3 md:grid-cols-4">
            {['Drop', 'Autopsy', 'Pitch', 'Revive'].map((step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className="rounded-xl border border-ghost-accent p-4 text-center"
              >
                <p className="text-xs text-ghost-white/60">0{index + 1}</p>
                <p className="mt-2 text-lg font-bold text-ghost-primary">{step}</p>
              </motion.div>
            ))}
          </div>
        </TerminalCard>
      </section>
    </PageTransition>
  );
}
