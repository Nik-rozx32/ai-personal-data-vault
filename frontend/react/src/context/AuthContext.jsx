import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'datavault_auth_user';

// Default mock accounts for testing and Google login
export const PRESET_GOOGLE_ACCOUNTS = [
  {
    id: 'google-user-1',
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    provider: 'google',
    role: 'Vault Administrator',
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
    role: 'Security Lead',
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
    role: 'AI Researcher',
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
    // Default initial user for seamless dashboard access out of the box
    return PRESET_GOOGLE_ACCOUNTS[0];
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

  // Email / Password Login
  const login = async (email, password, remember = true) => {
    setIsLoading(true);
    // Simulate network latency for authentic feel
    await new Promise((res) => setTimeout(res, 650));

    // Basic validation
    if (!email || !password) {
      setIsLoading(false);
      throw new Error('Please fill in both email and password.');
    }

    const nameFromEmail = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const user = {
      id: `user-${Date.now()}`,
      name: nameFromEmail || 'Vault User',
      email: email,
      avatar: null,
      provider: 'email',
      role: 'Vault Owner',
      plan: 'Pro Vault (1 TB)',
      storageUsed: '184.2 GB',
      storageTotal: '1 TB',
      createdAt: new Date().toISOString()
    };

    setCurrentUser(user);
    setIsLoading(false);
    return user;
  };

  // Register New User
  const register = async (name, email, password) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 800));

    if (!name || !email || !password) {
      setIsLoading(false);
      throw new Error('Please fill in all required fields.');
    }

    if (password.length < 6) {
      setIsLoading(false);
      throw new Error('Password must be at least 6 characters.');
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: name,
      email: email,
      avatar: null,
      provider: 'email',
      role: 'Vault Administrator',
      plan: 'Pro Vault (1 TB)',
      storageUsed: '0 GB',
      storageTotal: '1 TB',
      createdAt: new Date().toISOString()
    };

    setCurrentUser(newUser);
    setIsLoading(false);
    return newUser;
  };

  // Google Login
  const loginWithGoogle = async (googleAccount = null) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 600));

    const selectedAccount = googleAccount || PRESET_GOOGLE_ACCOUNTS[0];
    setCurrentUser(selectedAccount);
    setIsLoading(false);
    return selectedAccount;
  };

  // GitHub Login
  const loginWithGithub = async () => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 600));

    const githubUser = {
      id: `gh-${Date.now()}`,
      name: 'Octo Dev',
      email: 'dev@github.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      provider: 'github',
      role: 'Developer Vault',
      plan: 'Pro Vault (1 TB)',
      storageUsed: '310.4 GB',
      storageTotal: '1 TB'
    };

    setCurrentUser(githubUser);
    setIsLoading(false);
    return githubUser;
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
  };

  // Reset Password simulation
  const resetPassword = async (email) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 750));
    setIsLoading(false);
    return true;
  };

  const value = {
    currentUser,
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
