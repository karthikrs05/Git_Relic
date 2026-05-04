import { motion } from 'framer-motion';

export default function NeonButton({ children, variant = 'primary', className = '', ...props }) {
  const base = 'rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all border';
  const styles = {
    primary: 'bg-ghost-primary text-black border-ghost-primary shadow-glow hover:shadow-glowStrong',
    outline: 'bg-transparent text-ghost-primary border-ghost-accent hover:border-ghost-primary shadow-glow',
  };

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`${base} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
