import { useState } from 'react';
import PageTransition from '../components/PageTransition';
import TerminalCard from '../components/TerminalCard';
import NeonButton from '../components/NeonButton';

const steps = ['Upload repo', 'Security scan', 'Autopsy preview', 'Publish'];
const scanLogs = ['scanning repository...', 'checking secrets and leaked tokens...', 'auditing dependencies...', 'no leaks found', 'scan complete'];

export default function DropProject() {
  const [step, setStep] = useState(1);
  return (
    <PageTransition>
      <TerminalCard className="p-6">
        <p className="mb-4 text-sm text-ghost-primary">drop_project_wizard</p>
        <div className="mb-6 grid gap-2 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s} className={`rounded-xl border px-3 py-2 text-sm ${step === i + 1 ? 'border-ghost-primary text-ghost-primary shadow-glow' : 'border-ghost-accent text-ghost-white/70'}`}>
              {i + 1}. {s}
            </div>
          ))}
        </div>

        {step === 1 && <div className="space-y-3"><p className="text-sm">upload .zip repository package</p><input type="file" className="block text-sm" /></div>}
        {step === 2 && <div className="rounded-2xl border border-ghost-accent bg-black/40 p-4 text-sm space-y-1">{scanLogs.map((l, i) => <p key={l} className="text-ghost-white/85" style={{ animationDelay: `${i * 200}ms` }}>&gt; {l}</p>)}</div>}
        {step === 3 && <p className="text-sm text-ghost-white/85">autopsy preview ready: 178 commits, 6 contributors, 17 stale branches.</p>}
        {step === 4 && <p className="text-sm text-ghost-white/85">project queued for listing. awaiting publish confirmation.</p>}

        <div className="mt-6 flex gap-3">
          <NeonButton variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))}>prev_step</NeonButton>
          <NeonButton onClick={() => setStep((s) => Math.min(4, s + 1))}>next_step</NeonButton>
        </div>
      </TerminalCard>
    </PageTransition>
  );
}
