import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, AuthProviderProps, User } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<void> => {
    // Implementera inloggningslogik här
    setCurrentUser({ email });
  };

  const register = async (email: string, password: string): Promise<void> => {
    // Implementera registreringslogik här
    setCurrentUser({ email });
  };

  const logout = async (): Promise<void> => {
    // Implementera utloggningslogik här
    setCurrentUser(null);
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    // Implementera profiluppdateringslogik här
    setCurrentUser(prev => prev ? { ...prev, ...data } : null);
  };

  useEffect(() => {
    // Kontrollera om användaren är inloggad vid sidladdning
    // Implementera sessions-kontroll här
    setLoading(false);
  }, []);

  const value: AuthContextType = {
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
