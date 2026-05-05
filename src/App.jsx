import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AppLayout from './layouts/AppLayout';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import RelicDetail from './pages/RelicDetail';
import DropProject from './pages/DropProject';
import Leaderboard from './pages/Leaderboard';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
          <Route element={<AppLayout />}>
            <Route path="/landing" element={<Landing />} />
            <Route
              path="/explore"
              element={(
                <ProtectedRoute>
                  <Explore />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/relic_detail"
              element={(
                <ProtectedRoute>
                  <RelicDetail />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/drop_project"
              element={(
                <ProtectedRoute>
                  <DropProject />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/leaderboard"
            element={(
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            )}
          />
          <Route path="/pitch" element={<Navigate to="/leaderboard" replace />} />
          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )}
          />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Navigate to="/landing" replace />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
