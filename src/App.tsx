import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts';
import ErrorBoundary from './components/ErrorBoundary';
import Menu from './components/Menu';
import Chat from './components/Chat';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Statistics from './components/Statistics';
import OnlineUsers from './components/OnlineUsers';
import { useAuth } from './contexts';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route 
              path="/login" 
              element={
                <Login 
                  onRegisterClick={handleRegisterClick}
                  setSession={setSession}
                />
              } 
            />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <div>
                    <Menu />
                    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                      <div className="flex space-x-4">
                        <div className="flex-1">
                          <Chat />
                        </div>
                        <div className="hidden lg:block">
                          <OnlineUsers />
                        </div>
                      </div>
                      <div className="mt-6">
                        <Statistics />
                      </div>
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <div>
                    <Menu />
                    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                      <Profile />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
