import { motion } from 'framer-motion';

export default function TerminalCard({ children, className = '', hover = false }) {
  return (
    <motion.div
      whileHover={hover ? { y: -3, scale: 1.01 } : {}}
      className={`rounded-2xl border border-ghost-accent bg-ghost-bgAlt/80 shadow-glow backdrop-blur-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}
