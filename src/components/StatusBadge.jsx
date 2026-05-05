const colors = {
  orphaned: 'text-yellow-300 border-yellow-400/30 bg-yellow-400/10',
  auctioning: 'text-cyan-300 border-cyan-400/30 bg-cyan-400/10',
  salvaged: 'text-ghost-primary border-ghost-primary/30 bg-ghost-primary/10',
  revived: 'text-purple-300 border-purple-400/30 bg-purple-400/10',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded-xl border px-3 py-1 text-xs uppercase tracking-wider ${colors[status] || colors.orphaned}`}>
      {status}
    </span>
  );
}
