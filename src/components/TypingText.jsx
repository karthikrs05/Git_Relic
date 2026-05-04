import BlinkingCursor from './BlinkingCursor';
import { useTypewriter } from '../hooks/useTypewriter';

export default function TypingText({ text, className = '' }) {
  const typed = useTypewriter(text);
  return (
    <p className={className}>
      {typed}
      <BlinkingCursor className="ml-1 h-4 w-1.5" />
    </p>
  );
}
