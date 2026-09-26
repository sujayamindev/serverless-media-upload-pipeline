import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import theme from './theme';
import Eyebrow from './components/Eyebrow';
import { t } from './lib/tokens';
import UploadPage from './pages/UploadPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AuthPage from './pages/AuthPage';
import { AuthProvider } from './auth/AuthContext';
import { useAuth } from './auth/useAuth';

function LoadingScreen() {
  return (
    <Box
      role="status"
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: t.bg }}
    >
      <Eyebrow tone="strong" dot={t.chartAmber} pulse>
        Loading
      </Eyebrow>
    </Box>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function LoginRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <AuthPage />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/how-this-works"
              element={
                <ProtectedRoute>
                  <HowItWorksPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
