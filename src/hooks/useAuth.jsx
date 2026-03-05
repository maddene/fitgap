import { createContext, useContext, useEffect, useState } from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import { MOCK_MODE, mockUser } from '../lib/mockData';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In dev mode, use mock user
    if (MOCK_MODE) {
      console.log('[MOCK MODE] Using mock authentication');
      setUser(mockUser);
      setLoading(false);
      return;
    }

    // Initialize Netlify Identity
    netlifyIdentity.init();

    // Check for existing user
    const currentUser = netlifyIdentity.currentUser();
    setUser(currentUser);
    setLoading(false);

    // Listen for login events
    netlifyIdentity.on('login', (user) => {
      setUser(user);
      netlifyIdentity.close();
    });

    // Listen for logout events
    netlifyIdentity.on('logout', () => {
      setUser(null);
    });

    // Cleanup
    return () => {
      netlifyIdentity.off('login');
      netlifyIdentity.off('logout');
    };
  }, []);

  const signUp = () => {
    if (MOCK_MODE) {
      console.log('[MOCK MODE] Sign up not available in dev mode');
      return;
    }
    netlifyIdentity.open('signup');
  };

  const signIn = () => {
    if (MOCK_MODE) {
      console.log('[MOCK MODE] Already signed in with mock user');
      return;
    }
    netlifyIdentity.open('login');
  };

  const signOut = () => {
    if (MOCK_MODE) {
      console.log('[MOCK MODE] Signing out mock user');
      setUser(null);
      return;
    }
    netlifyIdentity.logout();
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
