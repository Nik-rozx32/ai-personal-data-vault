import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'datavault_auth_user';
const TOKEN_KEY = 'datavault_jwt_token';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || null;
    } catch (e) {
      return null;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Validate existing token with MongoDB backend on application mount
  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        if (isMounted) {
          setCurrentUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          if (isMounted) {
            setCurrentUser(userData);
            setToken(savedToken);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
          }
        } else {
          // Token expired or invalid
          if (isMounted) {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(TOKEN_KEY);
            setCurrentUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Backend verification unreachable:', err.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, []);

  // Real Login with MongoDB Backend
  const login = async (email, password) => {
    setIsLoading(true);

    if (!email || !password) {
      setIsLoading(false);
      throw new Error('Please fill in both email and password.');
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      const authenticatedUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role
      };

      setCurrentUser(authenticatedUser);
      setToken(data.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
      localStorage.setItem(TOKEN_KEY, data.token);

      return authenticatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  // Real Registration with MongoDB Backend
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
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      const newUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role
      };

      setCurrentUser(newUser);
      setToken(data.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      localStorage.setItem(TOKEN_KEY, data.token);

      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout & clear session
  const logout = async () => {
    const currentToken = token || localStorage.getItem(TOKEN_KEY);
    if (currentToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`
          }
        });
      } catch (e) {
        // Ignore network errors on logout
      }
    }

    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  // Initiate real Google Drive OAuth flow
  const connectGoogleDrive = async () => {
    const currentToken = token || localStorage.getItem(TOKEN_KEY);
    if (!currentToken) {
      throw new Error('Please log in before connecting Google Drive.');
    }

    const response = await fetch('/api/integrations/google-drive/connect', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      }
    });

    const data = await response.json();
    if (!response.ok || !data.url) {
      throw new Error(data.message || 'Failed to start Google Drive connection');
    }

    // Redirect to Google's consent screen
    window.location.href = data.url;
  };

  // Authenticated fetch helper
  const authFetch = (url, options = {}) => {
    const currentToken = token || localStorage.getItem(TOKEN_KEY);
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {})
      }
    });
  };

  const value = {
    currentUser,
    token,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    register,
    logout,
    connectGoogleDrive,
    authFetch
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
