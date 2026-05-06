// Maps both the real DB status enum values AND the legacy/display values
const colors = {
  // Real DB enum values (Project.status)
  pending_scan:   'text-yellow-300 border-yellow-400/30 bg-yellow-400/10',
  scanned:        'text-blue-300 border-blue-400/30 bg-blue-400/10',
  pending_review: 'text-orange-300 border-orange-400/30 bg-orange-400/10',
  published:      'text-green-300 border-green-400/30 bg-green-400/10',
  salvaged:       'text-ghost-primary border-ghost-primary/30 bg-ghost-primary/10',
  failed:         'text-red-400 border-red-400/30 bg-red-400/10',

  // Legacy / display-only values (used in Leaderboard decorative UI)
  orphaned:       'text-yellow-300 border-yellow-400/30 bg-yellow-400/10',
  auctioning:     'text-cyan-300 border-cyan-400/30 bg-cyan-400/10',
  revived:        'text-purple-300 border-purple-400/30 bg-purple-400/10',
};

export default function StatusBadge({ status }) {
  const style = colors[status] || 'text-ghost-white/50 border-ghost-white/20 bg-ghost-white/5';
  return (
    <span className={`rounded-xl border px-3 py-1 text-xs uppercase tracking-wider ${style}`}>
      {status?.replace(/_/g, ' ') || 'unknown'}
    </span>
  );
}
