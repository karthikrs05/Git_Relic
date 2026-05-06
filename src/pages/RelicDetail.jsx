import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import TerminalCard from '../components/TerminalCard';
import NeonButton from '../components/NeonButton';

import { getProjectById, getProjectAnalysis } from '../services/projects.js';
import { getPitchesForProject } from '../services/pitches.js';

export default function RelicDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [project, setProject] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) return;
    async function load() {
      setLoading(true);
      try {
        try { setProject(await getProjectById(projectId)); } catch { setError('Project not found.'); }
        try { setAnalysis((await getProjectAnalysis(projectId)).aiAnalysis); } catch {}
        try { setPitches(await getPitchesForProject(projectId)); } catch {}
      } catch {
        setError('Failed to load project data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  if (!projectId) return <p className="p-8 text-red-400">No project ID in URL.</p>;
  if (loading) return <div className="p-8 text-sm text-ghost-primary">loading_relic_data...</div>;
  if (error || !project) return <p className="p-8 text-red-400">{error || 'Project not found.'}</p>;

  const langs = project.metadata?.languages || [];

  return (
    <PageTransition>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — main content */}
        <div className="space-y-6 lg:col-span-2">
          <TerminalCard className="p-5">
            <p className="mb-1 text-xs text-ghost-white/50">project_autopsy</p>
            <h1 className="mb-4 text-xl font-bold text-ghost-primary">{project.title || projectId}</h1>

            {/* Language distribution */}
            {langs.length > 0 && (
              <div className="mb-4 space-y-2 text-sm">
                <p className="text-ghost-white/60">Language Distribution</p>
                {langs.map((lang) => (
                  <div key={lang} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-xs text-ghost-white/60">{lang}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded bg-ghost-accent">
                      <div
                        className="h-full bg-ghost-primary"
                        style={{ width: `${Math.floor(100 / langs.length)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AI Pathologist Report */}
            {analysis ? (
              <div className="mt-4 space-y-1 text-sm">
                <p className="mb-2 text-ghost-primary">ai_pathologist_report</p>
                <p className="text-ghost-white/80">&gt; summary: {analysis.summary}</p>
                <p className="text-ghost-white/80">&gt; failure_reason: {analysis.failureReason}</p>
                <p className="text-ghost-white/80">&gt; difficulty: {analysis.difficulty}</p>
                <p className="text-ghost-white/80">&gt; estimated_hours: {analysis.estimatedHours}</p>
                {analysis.roadmap?.length > 0 && (
                  <div className="pt-2">
                    <p className="mb-1 text-ghost-primary">resurrection_roadmap</p>
                    {analysis.roadmap.map((step, i) => (
                      <p key={i} className="text-ghost-white/70">&gt; {i + 1}. {step}</p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-ghost-white/40">ai_analysis: not available</p>
            )}
          </TerminalCard>

          <TerminalCard className="p-5">
            <button className="mb-3 text-sm text-ghost-primary" onClick={() => setOpen((v) => !v)}>
              project_stats {open ? '[-]' : '[+]'}
            </button>
            {open && (
              <div className="space-y-1 text-sm text-ghost-white/80">
                <p>&gt; commits: {project.commitCount ?? '—'}</p>
                <p>&gt; files: {project.metadata?.fileCount ?? '—'}</p>
                <p>&gt; status: {project.status}</p>
                <p>&gt; tech_stack: {project.techStack?.join(', ') || '—'}</p>
                <p>&gt; donor: {project.donorId?.username ?? '—'}</p>
                <p>&gt; owner: {project.currentOwner?.username ?? '—'}</p>
              </div>
            )}
          </TerminalCard>
        </div>

        {/* Right — pitches */}
        <div className="space-y-6">
          <TerminalCard className="p-5">
            <p className="mb-3 text-sm text-ghost-primary">pitches ({pitches.length})</p>
            {pitches.length === 0 && (
              <p className="text-sm text-ghost-white/40">no_pitches_yet</p>
            )}
            <div className="space-y-3 text-sm">
              {pitches.map((p) => (
                <div key={p._id} className="rounded-xl border border-ghost-accent p-3">
                  <p className="font-semibold text-ghost-primary">
                    {p.salvagerId?.username ?? 'unknown'}
                    <span className="ml-2 text-xs text-ghost-white/50">[{p.status}]</span>
                  </p>
                  <p className="mt-1 text-ghost-white/80">{p.pitchText}</p>
                </div>
              ))}
            </div>
            <NeonButton
              className="mt-4 w-full"
              onClick={() => navigate('/pitch', { state: { projectId } })}
            >
              submit_pitch
            </NeonButton>
          </TerminalCard>
        </div>
      </div>
    </PageTransition>
  );
}
