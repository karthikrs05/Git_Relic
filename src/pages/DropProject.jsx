import { useMemo, useState } from 'react';
import PageTransition from '../components/PageTransition';
import TerminalCard from '../components/TerminalCard';
import NeonButton from '../components/NeonButton';

const steps = ['Upload repo', 'Security scan', 'Autopsy preview', 'Publish'];
const scanLogs = ['scanning repository...', 'checking secrets and leaked tokens...', 'auditing dependencies...', 'no leaks found', 'scan complete'];

export default function DropProject() {
  const [step, setStep] = useState(1);
  const progress = useMemo(() => (step - 1) / (steps.length - 1), [step]);

  return (
    <PageTransition>
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <TerminalCard className="relative overflow-hidden p-6 md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,255,159,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(0,255,159,0.08),transparent_24%)]" />
          <div className="relative">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-ghost-primary">drop_project_wizard</p>
                <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">stage a dormant repo for revival</h1>
              </div>
            </div>

            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-widest text-ghost-white/50">
                <span>pipeline progress</span>
                <span>{step}/{steps.length}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-ghost-accent/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-ghost-primary via-cyan-300 to-ghost-primary shadow-glow transition-all duration-500"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              {steps.map((s, i) => {
                const active = step === i + 1;
                const complete = step > i + 1;
                return (
                  <div
                    key={s}
                    className={`rounded-2xl border px-4 py-4 text-sm transition ${
                      active
                        ? 'border-ghost-primary bg-ghost-primary/10 text-ghost-primary shadow-glow'
                        : complete
                          ? 'border-ghost-primary/50 bg-ghost-primary/5 text-ghost-white/85'
                          : 'border-ghost-accent bg-black/25 text-ghost-white/60'
                    }`}
                  >
                    <p className="text-[11px] uppercase tracking-[0.3em] text-inherit/70">0{i + 1}</p>
                    <p className="mt-2 font-semibold">{s}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-3xl border border-ghost-accent bg-black/35 p-5">
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-ghost-primary">01 / upload package</p>
                    <p className="mt-2 text-sm text-ghost-white/65">Drop a zipped repository bundle to begin the relic scan.</p>
                  </div>
                  <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-ghost-accent bg-black/30 px-6 py-8 text-center transition hover:border-ghost-primary hover:bg-ghost-primary/5">
                    <span className="text-sm text-ghost-white/60">drag & drop archive here</span>
                    <span className="mt-2 text-xs uppercase tracking-[0.3em] text-ghost-primary">or click to select</span>
                    <input type="file" className="sr-only" />
                  </label>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-ghost-primary">02 / security scan</p>
                    <p className="mt-2 text-sm text-ghost-white/65">Static checks are running before the project enters the board.</p>
                  </div>
                  <div className="space-y-2 rounded-2xl border border-ghost-accent bg-black/50 p-4 text-sm">
                    {scanLogs.map((l, i) => (
                      <p key={l} className="animate-[fadeIn_0.5s_ease_both]" style={{ animationDelay: `${i * 180}ms` }}>
                        <span className="text-ghost-primary">&gt;</span> {l}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-ghost-primary">03 / autopsy preview</p>
                    <p className="mt-2 text-sm text-ghost-white/65">The board now shows a human-readable summary of the repo’s condition.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ['commits', '178'],
                      ['contributors', '6'],
                      ['stale branches', '17'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-ghost-accent bg-black/40 p-4">
                        <p className="text-xs uppercase tracking-widest text-ghost-white/50">{label}</p>
                        <p className="mt-2 text-2xl font-black text-ghost-primary">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-ghost-primary">04 / publish</p>
                    <p className="mt-2 text-sm text-ghost-white/65">The relic is queued for listing and ready for builder review.</p>
                  </div>
                  <div className="rounded-2xl border border-ghost-primary/40 bg-ghost-primary/10 p-4">
                    <p className="text-sm text-ghost-white/85">project queued for listing.</p>
                    <p className="mt-1 text-xs uppercase tracking-widest text-ghost-primary">awaiting publish confirmation</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <NeonButton
                variant="outline"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="disabled:cursor-not-allowed disabled:opacity-50"
              >
                prev_step
              </NeonButton>
              <NeonButton
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                disabled={step === 4}
                className="disabled:cursor-not-allowed disabled:opacity-50"
              >
                next_step
              </NeonButton>
            </div>
          </div>
        </TerminalCard>

        <div className="space-y-6">
          <TerminalCard className="p-6">
            <p className="text-sm text-ghost-primary">scan_output</p>
            <div className="mt-4 space-y-3 text-sm text-ghost-white/75">
              <p>&gt; file type: repository archive</p>
              <p>&gt; integrity: pending</p>
              <p>&gt; secrets: unchecked</p>
              <p>&gt; visibility: private until publish</p>
            </div>
          </TerminalCard>

          <TerminalCard className="p-6">
            <p className="text-sm text-ghost-primary">upload_notes</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-ghost-white/75">
              <p>&gt; keep the archive under 500MB for smoother scans.</p>
              <p>&gt; include a README so the autopsy preview can extract context.</p>
              <p>&gt; the next pass will wire this UI to backend processing.</p>
            </div>
          </TerminalCard>
        </div>
      </div>
    </PageTransition>
  );
}
