import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'datavault_auth_user';
const TOKEN_KEY = 'datavault_jwt_token';

// Default mock accounts for testing and Google login
export const PRESET_GOOGLE_ACCOUNTS = [
  {
    id: 'google-user-1',
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    provider: 'google',
    role: 'USER',
    plan: 'Pro Vault (1 TB)',
    storageUsed: '245.6 GB',
    storageTotal: '1 TB'
  },
  {
    id: 'google-user-2',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    provider: 'google',
    role: 'USER',
    plan: 'Enterprise Vault (5 TB)',
    storageUsed: '1.2 TB',
    storageTotal: '5 TB'
  },
  {
    id: 'google-user-3',
    name: 'Alex Rivera',
    email: 'alex.rivera.dev@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    provider: 'google',
    role: 'USER',
    plan: 'Pro Vault (1 TB)',
    storageUsed: '412.0 GB',
    storageTotal: '1 TB'
  }
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load auth user from storage', e);
    }
    return PRESET_GOOGLE_ACCOUNTS[0];
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || currentUser?.token || null;
    } catch (e) {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
      } catch (e) {
        console.error('Failed to save auth user to storage', e);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentUser]);

  useEffect(() => {
    if (token) {
      try {
        localStorage.setItem(TOKEN_KEY, token);
      } catch (e) {
        console.error('Failed to save token to storage', e);
      }
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  // Real Email / Password Login with backend integration + mock fallback
  const login = async (email, password, remember = true) => {
    setIsLoading(true);

    if (!email || !password) {
      setIsLoading(false);
      throw new Error('Please fill in both email and password.');
    }

    try {
      // Attempt backend login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      const authenticatedUser = {
        ...data.user,
        provider: 'email',
        token: data.token,
        plan: 'Personal Vault (500 GB)',
        storageUsed: '14.2 GB',
        storageTotal: '500 GB'
      };

      setCurrentUser(authenticatedUser);
      setToken(data.token);
      setIsLoading(false);
      return authenticatedUser;
    } catch (apiError) {
      // If backend is offline or network error, fallback to simulated user for UI demo
      if (apiError.message.includes('fetch') || apiError.message.includes('NetworkError') || apiError.message.includes('Failed to fetch')) {
        console.warn('[Auth] Backend unreachable, logging in offline demo mode:', apiError.message);
        const nameFromEmail = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const mockUser = {
          id: `user-${Date.now()}`,
          name: nameFromEmail || 'Vault User',
          email: email,
          avatar: null,
          provider: 'email',
          role: 'USER',
          token: 'demo-jwt-token-' + Date.now(),
          plan: 'Pro Vault (1 TB)',
          storageUsed: '184.2 GB',
          storageTotal: '1 TB',
          createdAt: new Date().toISOString()
        };
        setCurrentUser(mockUser);
        setToken(mockUser.token);
        setIsLoading(false);
        return mockUser;
      }
      setIsLoading(false);
      throw apiError;
    }
  };

  // Real Register New User with backend integration
  const register = async (name, email, password) => {
    setIsLoading(true);

    if (!name || !email || !password) {
      setIsLoading(false);
      throw new Error('Please fill in all required fields.');
    }

    if (password.length < 6) {
      setIsLoading(false);
      throw new Error('Password must be at least 6 characters.');
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      const newUser = {
        ...data.user,
        provider: 'email',
        token: data.token,
        plan: 'Personal Vault (500 GB)',
        storageUsed: '0 GB',
        storageTotal: '500 GB'
      };

      setCurrentUser(newUser);
      setToken(data.token);
      setIsLoading(false);
      return newUser;
    } catch (apiError) {
      if (apiError.message.includes('fetch') || apiError.message.includes('NetworkError') || apiError.message.includes('Failed to fetch')) {
        console.warn('[Auth] Backend unreachable, creating offline demo user:', apiError.message);
        const mockUser = {
          id: `user-${Date.now()}`,
          name: name,
          email: email,
          avatar: null,
          provider: 'email',
          role: 'USER',
          token: 'demo-jwt-token-' + Date.now(),
          plan: 'Pro Vault (1 TB)',
          storageUsed: '0 GB',
          storageTotal: '1 TB',
          createdAt: new Date().toISOString()
        };
        setCurrentUser(mockUser);
        setToken(mockUser.token);
        setIsLoading(false);
        return mockUser;
      }
      setIsLoading(false);
      throw apiError;
    }
  };

  // Google Login
  const loginWithGoogle = async (googleAccount = null) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 400));

    const selectedAccount = googleAccount || PRESET_GOOGLE_ACCOUNTS[0];
    const userWithToken = {
      ...selectedAccount,
      token: selectedAccount.token || 'demo-google-jwt-token'
    };
    setCurrentUser(userWithToken);
    setToken(userWithToken.token);
    setIsLoading(false);
    return userWithToken;
  };

  // GitHub Login
  const loginWithGithub = async () => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 400));

    const githubUser = {
      id: `gh-${Date.now()}`,
      name: 'Octo Dev',
      email: 'dev@github.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      provider: 'github',
      role: 'USER',
      token: 'demo-github-jwt-token',
      plan: 'Pro Vault (1 TB)',
      storageUsed: '310.4 GB',
      storageTotal: '1 TB'
    };

    setCurrentUser(githubUser);
    setToken(githubUser.token);
    setIsLoading(false);
    return githubUser;
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  // Reset Password simulation
  const resetPassword = async (email) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 500));
    setIsLoading(false);
    return true;
  };

  const value = {
    currentUser,
    token,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    register,
    loginWithGoogle,
    loginWithGithub,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
