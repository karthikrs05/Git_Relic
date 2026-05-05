import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import TerminalCard from '../components/TerminalCard';
import MonospaceInput from '../components/MonospaceInput';
import StatusBadge from '../components/StatusBadge';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';
const TECH_OPTIONS   = ['React', 'Node', 'Rust', 'Python', 'Go', 'TypeScript'];
const STATUS_OPTIONS = ['published', 'pending_review', 'salvaged', 'failed'];

export default function Explore() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [query, setQuery]       = useState('');
  const [techFilters, setTechFilters]     = useState([]);
  const [statusFilters, setStatusFilters] = useState([]);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/projects/list`);
        if (!res.ok) throw new Error('Failed to fetch projects');
        setProjects(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const toggle = useCallback((value, setter) => {
    setter((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]);
  }, []);

  const visible = projects.filter((p) => {
    const q = query.toLowerCase();
    const matchesQuery  = !q || p.title?.toLowerCase().includes(q) || p.techStack?.some((t) => t.toLowerCase().includes(q));
    const matchesTech   = techFilters.length === 0 || techFilters.some((f) => p.techStack?.some((t) => t.toLowerCase() === f.toLowerCase()));
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(p.status);
    return matchesQuery && matchesTech && matchesStatus;
  });

  return (
    <PageTransition>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Filters sidebar */}
        <TerminalCard className="h-fit p-5">
          <p className="mb-3 text-sm text-ghost-primary">filters</p>
          <div className="space-y-4 text-sm text-ghost-white/80">
            <div>
              <p className="mb-2 text-ghost-white/60">tech stack</p>
              <div className="space-y-1">
                {TECH_OPTIONS.map((x) => (
                  <label className="flex cursor-pointer items-center gap-2" key={x}>
                    <input type="checkbox" checked={techFilters.includes(x)} onChange={() => toggle(x, setTechFilters)} />
                    {x}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-ghost-white/60">status</p>
              <div className="space-y-1">
                {STATUS_OPTIONS.map((x) => (
                  <label className="flex cursor-pointer items-center gap-2" key={x}>
                    <input type="checkbox" checked={statusFilters.includes(x)} onChange={() => toggle(x, setStatusFilters)} />
                    {x}
                  </label>
                ))}
              </div>
            </div>
            {(techFilters.length > 0 || statusFilters.length > 0) && (
              <button
                className="text-xs text-ghost-primary underline"
                onClick={() => { setTechFilters([]); setStatusFilters([]); }}
              >
                clear_filters
              </button>
            )}
          </div>
        </TerminalCard>

        {/* Results */}
        <div className="space-y-4">
          <MonospaceInput
            placeholder="search_relics --query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {loading && <p className="text-sm text-ghost-primary">fetching_relics...</p>}
          {error   && <p className="text-sm text-red-400">&gt; error: {error}</p>}
          {!loading && !error && visible.length === 0 && (
            <p className="text-sm text-ghost-white/50">&gt; no relics match your query.</p>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((project) => (
              <TerminalCard
                key={project._id}
                hover
                className="cursor-pointer p-4 transition-transform hover:scale-[1.01]"
                onClick={() => navigate(`/relic_detail/${project._id}`)}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight">{project.title || 'untitled'}</h3>
                  <StatusBadge status={project.status} />
                </div>
                <div className="mb-3 flex flex-wrap gap-1">
                  {project.techStack?.map((s) => (
                    <span key={s} className="rounded-lg bg-ghost-primary/10 px-2 py-0.5 text-xs text-ghost-primary">{s}</span>
                  ))}
                </div>
                <p className="text-xs text-ghost-white/60">commits: {project.commitCount ?? '—'}</p>
                <p className="text-xs text-ghost-white/60">donor: {project.donorId?.username ?? '—'}</p>
              </TerminalCard>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
