import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/UI/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components
const LoginForm = lazy(() => import('./components/Auth/LoginForm'));
const SignUpForm = lazy(() => import('./components/Auth/SignUpForm'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const NotFound = lazy(() => import('./components/NotFound'));
const ProtectedRoute = lazy(() => import('./components/Auth/ProtectedRoute'));

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 5000,
              style: { background: '#333', color: '#fff' }
            }} 
          />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignUpForm />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}