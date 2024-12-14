import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
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
    </Router>
  );
};

export default App;
