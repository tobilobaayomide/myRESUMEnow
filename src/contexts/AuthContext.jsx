import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange } from '../firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthProvider: Setting up auth listener');
    
    // Set a timeout to ensure app loads even if auth is slow
    const timeout = setTimeout(() => {
      console.log('⚠️ Auth loading timeout - rendering app anyway');
      setLoading(false);
    }, 3000);

    const unsubscribe = onAuthChange((user) => {
      console.log('🔐 Auth state changed:', user ? user.email : 'No user');
      clearTimeout(timeout);
      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    loading
  };

  console.log('🔐 AuthProvider rendering, loading:', loading, 'user:', currentUser?.email || 'none');

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
