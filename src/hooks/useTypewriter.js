import { useEffect, useState } from 'react';

export function useTypewriter(text, speed = 42) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= text.length) return;
    const timer = setTimeout(() => setIndex((i) => i + 1), speed);
    return () => clearTimeout(timer);
  }, [index, speed, text]);

  return text.slice(0, index);
}
