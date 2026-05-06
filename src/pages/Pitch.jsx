import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import TerminalCard from '../components/TerminalCard';
import MonospaceInput from '../components/MonospaceInput';
import NeonButton from '../components/NeonButton';
import { useAuth } from '../context/AuthContext';

import { submitPitch } from '../services/pitches.js';

export default function Pitch() {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = location.state?.projectId;

  const [text, setText] = useState('');
  const [prLink, setPrLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);

  async function handleSubmit() {
    if (!projectId) {
      setError('No project selected. Navigate here from a project page.');
      return;
    }
    if (!text.trim()) {
      setError('Pitch text is required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await submitPitch(projectId, { pitchText: text, prLink: prLink || undefined }, token);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <PageTransition>
        <TerminalCard className="mx-auto max-w-4xl p-6">
          <p className="mb-4 text-sm text-ghost-primary">pitch_submitted.md</p>
          <p className="text-green-400">&gt; pitch submitted successfully.</p>
          <p className="mt-2 text-ghost-white/60">&gt; status: pending</p>
          <NeonButton className="mt-6" onClick={() => navigate(-1)}>go_back</NeonButton>
        </TerminalCard>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <TerminalCard className="mx-auto max-w-4xl p-6">
        <p className="mb-4 text-sm text-ghost-primary">submit_pitch.md</p>

        {!projectId && (
          <p className="mb-4 text-xs text-yellow-400">
            &gt; warn: no project_id in navigation state. Navigate here from a relic page.
          </p>
        )}

        <textarea
          id="pitch-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your revival plan in markdown..."
          className="h-72 w-full rounded-2xl border border-ghost-accent bg-black/40 p-4 text-sm outline-none focus:border-ghost-primary focus:shadow-glow"
        />
        <div className="mt-3 flex items-center justify-between text-xs text-ghost-white/70">
          <span>word_count: {words}</span>
          <span>project_id: {projectId || 'none'}</span>
        </div>

        <div className="mt-4 space-y-3">
          <MonospaceInput
            id="pr-link"
            placeholder="optional_pr_link"
            value={prLink}
            onChange={(e) => setPrLink(e.target.value)}
          />
          {error && <p className="text-xs text-red-400">&gt; error: {error}</p>}
          <NeonButton
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
          >
            {submitting ? 'submitting...' : 'submit_pitch'}
          </NeonButton>
        </div>
      </TerminalCard>
    </PageTransition>
  );
}
