export default function BlinkingCursor({ className = '' }) {
  return <span className={`inline-block w-2 h-5 bg-ghost-primary align-middle animate-blink ${className}`} />;
}
