import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function AppLayout() {
  return (
    <div className="scanlines min-h-screen bg-ghost-bg text-ghost-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid grid-overlay opacity-20" />
      <div className="pointer-events-none fixed inset-0 -z-10 animate-scan bg-gradient-to-b from-transparent via-ghost-primary/5 to-transparent" />
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  );
}
