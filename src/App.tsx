import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FeedProvider } from './contexts/FeedContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';

import Menu from './components/Menu';
import Dashboard from './components/Dashboard';
import Thread from './components/Chat/Thread';
import Profile from './components/Profile/Profile';
import Feed from './components/Feed/Feed';
import FplLayout from './components/Fpl/FplLayout';
import FplMyTeam from './components/Fpl/FplMyTeam';
import FplLeaderboard from './components/Fpl/FplLeaderboard';
import FplHistory from './components/Fpl/FplHistory';
import FplEvents from './components/Fpl/FplEvents';
import Login from './components/Auth/Login';
import FplDashboard from './components/Fpl/FplDashboard';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <FeedProvider>
          <div className="min-h-screen bg-gray-100">
            <Menu />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/thread/:threadId" element={<ProtectedRoute><Thread /></ProtectedRoute>} />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/fpl" 
                  element={
                    <ProtectedRoute>
                      <FplLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<FplDashboard />} />
                  <Route path="my-team" element={<FplMyTeam />} />
                  <Route path="leagues" element={<FplLeaderboard />} />
                  <Route path="history" element={<FplHistory />} />
                </Route>
              </Routes>
            </div>
            <FplEvents />
          </div>
        </FeedProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;