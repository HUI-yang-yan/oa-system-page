import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserDTO } from '../types';

interface AuthContextType {
  user: UserDTO | null;
  token: string | null;
  login: (token: string, user: UserDTO) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth State from LocalStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          // 1. Clean Token
          const cleanToken = storedToken.replace(/^["']|["']$/g, '').trim();
          
          // 2. Safe Parse User
          // If storedUser is "undefined" or "null" string, JSON.parse might return null/undefined depending on implementation quirks,
          // so we treat the string check strictly first.
          if (storedUser === 'undefined' || storedUser === 'null') {
            throw new Error('Invalid user string in storage');
          }

          const parsedUser = JSON.parse(storedUser);
          
          if (parsedUser && typeof parsedUser === 'object') {
            setToken(cleanToken);
            setUser(parsedUser);
          } else {
            throw new Error('Parsed user is not an object');
          }
        }
      } catch (error) {
        console.warn("Auth initialization failed (data corrupted). Clearing storage.", error);
        // Self-healing: Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: UserDTO) => {
    // Defensive coding
    const cleanToken = newToken.replace(/^["']|["']$/g, '').trim();
    // Ensure the fallback object matches the UserDTO interface completely to avoid type errors
    const safeUser: UserDTO = newUser || { 
      id: 0, 
      realName: 'User', 
      username: 'user',
      employeeId: '',
      departmentId: 0,
      status: 1, // Active
      position: '',
      email: '',
      phone: ''
    };

    setToken(cleanToken);
    setUser(safeUser);

    localStorage.setItem('token', cleanToken);
    localStorage.setItem('user', JSON.stringify(safeUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};