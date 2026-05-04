import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import TerminalCard from '../components/TerminalCard';
import TypingText from '../components/TypingText';
import NeonButton from '../components/NeonButton';
import StatCounter from '../components/StatCounter';
import StatusBadge from '../components/StatusBadge';
import { logs, relics, stats } from '../data/mockData';

export default function Landing() {
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <TerminalCard key={item.label} className="p-5">
              <p className="text-xs uppercase tracking-widest text-ghost-white/60">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-ghost-primary"><StatCounter value={item.value} /></p>
            </TerminalCard>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TerminalCard className="p-5">
            <p className="mb-3 text-sm text-ghost-primary">terminal_activity_feed.log</p>
            <div className="h-48 space-y-2 overflow-hidden text-sm text-ghost-white/80">
              {logs.concat(logs).map((log, i) => (
                <motion.p key={`${log}-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                  &gt; {log}
                </motion.p>
              ))}
            </div>
          </TerminalCard>

          <TerminalCard className="p-5">
            <p className="mb-3 text-sm text-ghost-primary">featured_relics</p>
            <div className="space-y-3">
              {relics.slice(0, 3).map((relic) => (
                <div key={relic.id} className="rounded-xl border border-ghost-accent p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="font-semibold">{relic.title}</p>
                    <StatusBadge status={relic.status} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {relic.stack.map((s) => (
                      <span key={s} className="rounded-lg bg-ghost-primary/10 px-2 py-1 text-xs text-ghost-primary">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
