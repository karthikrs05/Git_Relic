import { Link, NavLink } from 'react-router-dom';
import NeonButton from './NeonButton';

const links = [
  { label: 'explore', to: '/explore' },
  { label: 'drop', to: '/drop_project' },
  { label: 'dashboard', to: '/dashboard' },
  { label: 'leaderboard', to: '/pitch' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-ghost-accent/60 bg-black/50 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/landing" className="text-ghost-primary text-lg font-bold tracking-wide">
          &gt; git-relic_
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm uppercase tracking-widest transition ${isActive ? 'text-ghost-primary' : 'text-ghost-white/70 hover:text-ghost-primary'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        <Link to="/auth">
          <NeonButton variant="outline">login_register</NeonButton>
        </Link>
      </nav>
    </header>
  );
}
