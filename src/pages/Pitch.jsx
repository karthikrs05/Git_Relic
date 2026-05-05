import { useMemo, useState } from 'react';
import PageTransition from '../components/PageTransition';
import TerminalCard from '../components/TerminalCard';
import MonospaceInput from '../components/MonospaceInput';
import NeonButton from '../components/NeonButton';

export default function Pitch() {
  const [text, setText] = useState('');
  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);

  return (
    <PageTransition>
      <TerminalCard className="mx-auto max-w-4xl p-6">
        <p className="mb-4 text-sm text-ghost-primary">submit_pitch.md</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your revival plan in markdown..."
          className="h-72 w-full rounded-2xl border border-ghost-accent bg-black/40 p-4 text-sm outline-none focus:border-ghost-primary focus:shadow-glow"
        />
        <div className="mt-3 flex items-center justify-between text-xs text-ghost-white/70">
          <span>word_count: {words}</span>
          <span>shr_reputation_preview: 1260</span>
        </div>
        <div className="mt-4 space-y-3">
          <MonospaceInput placeholder="optional_pr_link" />
          <NeonButton>submit_pitch</NeonButton>
        </div>
      </TerminalCard>
    </PageTransition>
  );
}
