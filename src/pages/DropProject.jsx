import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import TerminalCard from '../components/TerminalCard';
import NeonButton from '../components/NeonButton';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';
const steps = ['Upload repo', 'Security scan', 'Autopsy preview', 'Published'];

export default function DropProject() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleUpload() {
    if (!file) { setError('Select a .zip file first.'); return; }
    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('projectZip', file);
      const res = await fetch(`${API_BASE}/projects/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setResult(data);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const scan = result?.project?.securityScan;
  const meta = result?.project?.metadata;
  const ai   = result?.project?.aiAnalysis;

  return (
    <PageTransition>
      <TerminalCard className="p-6">
        <p className="mb-4 text-sm text-ghost-primary">drop_project_wizard</p>

        {/* Step indicators */}
        <div className="mb-6 grid gap-2 md:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`rounded-xl border px-3 py-2 text-sm ${
                step === i + 1
                  ? 'border-ghost-primary text-ghost-primary shadow-glow'
                  : step > i + 1
                  ? 'border-ghost-primary/40 text-ghost-primary/40'
                  : 'border-ghost-accent text-ghost-white/70'
              }`}
            >
              {i + 1}. {s}
            </div>
          ))}
        </div>

        {/* Step 1: File picker */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-ghost-white/80">
              Upload a <span className="text-ghost-primary">.zip</span> of your Git repository (max 500 MB).
              The archive must contain a <code className="text-xs bg-ghost-accent/20 px-1 rounded">.git/</code> directory.
            </p>
            <input
              id="zip-upload"
              type="file"
              accept=".zip,application/zip"
              onChange={(e) => { setFile(e.target.files[0] || null); setError(''); }}
              className="block text-sm text-ghost-white/80 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-ghost-primary/10 file:px-3 file:py-2 file:text-sm file:text-ghost-primary hover:file:bg-ghost-primary/20"
            />
            {file && (
              <p className="text-xs text-ghost-white/50">
                selected: {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
              </p>
            )}
          </div>
        )}

        {/* Step 2: Scan results */}
        {step === 2 && scan && (
          <div className="rounded-2xl border border-ghost-accent bg-black/40 p-4 text-sm space-y-1">
            <p className={`font-semibold ${scan.passed ? 'text-green-400' : 'text-red-400'}`}>
              &gt; scan_status: {scan.passed ? 'PASSED — no secrets detected' : 'BLOCKED — secrets detected'}
            </p>
            {!scan.passed && scan.issues?.map((issue, i) => (
              <p key={i} className="text-red-300/80">
                &gt; [{issue.severity}] {issue.type} in {issue.file} line {issue.line}
              </p>
            ))}
            <p className="text-ghost-white/50">&gt; issue_count: {scan.issueCount ?? 0}</p>
            <p className="text-ghost-white/50">&gt; project_id: {result?.project?.id}</p>
          </div>
        )}

        {/* Step 3: Autopsy preview */}
        {step === 3 && (
          <div className="space-y-1 text-sm text-ghost-white/80">
            <p>&gt; commits: {result?.project?.commitCount ?? '—'}</p>
            <p>&gt; files: {meta?.fileCount ?? '—'}</p>
            <p>&gt; languages: {meta?.languages?.join(', ') || '—'}</p>
            {ai && (
              <>
                <p>&gt; difficulty: {ai.difficulty}</p>
                <p>&gt; estimated_hours: {ai.estimatedHours}</p>
                <p>&gt; failure_reason: {ai.failureReason}</p>
                <p className="pt-1 text-ghost-white/60">&gt; ai_summary: {ai.summary}</p>
              </>
            )}
          </div>
        )}

        {/* Step 4: Published */}
        {step === 4 && (
          <div className="space-y-3 text-sm">
            <p className="text-green-400">&gt; {result?.message || 'Project processed.'}</p>
            <p className="text-ghost-white/60">&gt; status: {result?.project?.status}</p>
            <p className="text-ghost-white/60">&gt; id: {result?.project?.id}</p>
            <NeonButton onClick={() => navigate('/explore')}>browse_relics</NeonButton>
          </div>
        )}

        {error && <p className="mt-3 text-xs text-red-400">&gt; error: {error}</p>}

        {/* Navigation — hidden on step 4 */}
        {step < 4 && (
          <div className="mt-6 flex gap-3">
            <NeonButton
              variant="outline"
              disabled={step === 1 || loading}
              onClick={() => { setStep((s) => Math.max(1, s - 1)); setError(''); }}
            >
              prev_step
            </NeonButton>
            <NeonButton
              disabled={loading || (step === 1 && !file)}
              onClick={step === 1 ? handleUpload : () => setStep((s) => Math.min(4, s + 1))}
            >
              {loading ? 'uploading...' : step === 1 ? 'upload_and_scan' : 'next_step'}
            </NeonButton>
          </div>
        )}
      </TerminalCard>
    </PageTransition>
  );
}
