import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoleRoute from './routes/ProtectedRoleRoute';
import { protectedRoutes } from './routes/routeConfig';
import {
  LoginPage,
  DeveloperLoginPage,
  AssetScanPage,
  AssetDetailPage,
  NotFoundPage,
} from './pages/pageImports';

const developerLoginEnabled = import.meta.env.DEV && import.meta.env.VITE_DEV_LOGIN_ENABLED === 'true';
const developerLoginPath = import.meta.env.VITE_DEV_LOGIN_PATH;

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors theme="dark" />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {developerLoginEnabled && developerLoginPath && (
            <Route path={developerLoginPath} element={<DeveloperLoginPage />} />
          )}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/asset/scan/:assetCode" element={<AssetScanPage />} />
          <Route path="/assets/:id/detail" element={<AssetDetailPage />} />

          {protectedRoutes.map(({ path, component, allowedRoles }) => (
            <Route
              key={path}
              path={path}
              element={<ProtectedRoleRoute component={component} allowedRoles={allowedRoles} />}
            />
          ))}

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;