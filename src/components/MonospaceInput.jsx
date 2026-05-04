export default function MonospaceInput({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-2xl border border-ghost-accent bg-black/40 px-4 py-2.5 text-sm text-ghost-white outline-none ring-0 placeholder:text-ghost-white/40 focus:border-ghost-primary focus:shadow-glow ${className}`}
      {...props}
    />
  );
}
