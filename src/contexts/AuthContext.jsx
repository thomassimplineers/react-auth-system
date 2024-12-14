import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulerad inloggningsfunktion - ersätt med riktig auth logik
  const login = async (email, password) => {
    // Implementera inloggningslogik här
    setCurrentUser({ email });
  };

  const register = async (email, password) => {
    // Implementera registreringslogik här
    setCurrentUser({ email });
  };

  const logout = async () => {
    // Implementera utloggningslogik här
    setCurrentUser(null);
  };

  const updateProfile = async (data) => {
    // Implementera profiluppdateringslogik här
    setCurrentUser(prev => ({ ...prev, ...data }));
  };

  useEffect(() => {
    // Kontrollera om användaren är inloggad vid sidladdning
    // Implementera sessions-kontroll här
    setLoading(false);
  }, []);

  const value = {
    currentUser,
    login,
    register,
    logout,
    updateProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
