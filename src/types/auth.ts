export interface User {
  uid?: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}