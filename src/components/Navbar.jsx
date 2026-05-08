import { Link, NavLink } from 'react-router-dom';
import NeonButton from './NeonButton';
import { useAuth } from '../context/AuthContext';

const links = [
  { label: 'explore', to: '/explore' },
  { label: 'drop', to: '/drop_project' },
  { label: 'dashboard', to: '/dashboard' },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-ghost-accent/60 bg-black/50 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/landing" className="text-ghost-primary text-lg font-bold tracking-wide">
          &gt; git-relic_
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {isAuthenticated && links.map((link) => (
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
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-ghost-white/60 md:block">
              {user?.username || 'authenticated'}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-ghost-accent px-4 py-2 text-sm uppercase tracking-widest text-ghost-white/80 transition hover:border-ghost-primary hover:text-ghost-primary"
            >
              logout
            </button>
          </div>
        ) : (
          <Link to="/auth">
            <NeonButton variant="outline">login_register</NeonButton>
          </Link>
        )}
      </nav>
    </header>
  );
}
