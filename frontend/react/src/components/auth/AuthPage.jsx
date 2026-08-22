import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Key, 
  Shield, 
  Zap, 
  Database, 
  Sun, 
  Moon, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  HardDrive,
  Cpu,
  Layers
} from 'lucide-react';
import { DataVaultShieldLogo, GoogleIcon, GitHubIcon } from '../BrandIcons';
import { GoogleAuthModal } from './GoogleAuthModal';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { useAuth } from '../../context/AuthContext';

export const AuthPage = ({ 
  initialMode = 'login', 
  onSuccess, 
  onBackToApp,
  theme = 'light',
  toggleTheme
}) => {
  const { login, register, loginWithGoogle, loginWithGithub, isLoading } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Password strength calculation
  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: 'None', color: 'transparent' };
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: '#ef4444' };
      case 2:
        return { score: 2, label: 'Fair', color: '#f59e0b' };
      case 3:
        return { score: 3, label: 'Good', color: '#3b82f6' };
      case 4:
        return { score: 4, label: 'Strong', color: '#10b981' };
      default:
        return { score: 0, label: 'Too short', color: '#ef4444' };
    }
  };

  const passwordStrength = calculatePasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'login') {
        if (!email || !password) {
          setErrorMsg('Please provide your email and password');
          return;
        }
        await login(email, password, rememberMe);
        setSuccessMsg('Welcome back to DataVault AI!');
        if (onSuccess) onSuccess();
      } else {
        if (!name || !email || !password) {
          setErrorMsg('Please fill in all required fields');
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match');
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters');
          return;
        }
        if (!agreeTerms) {
          setErrorMsg('Please accept the Terms of Service & Privacy Policy');
          return;
        }
        await register(name, email, password);
        setSuccessMsg('Account created successfully! Initializing your vault...');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your details.');
    }
  };

  const handleGoogleSuccess = (googleAccount) => {
    loginWithGoogle(googleAccount);
    setIsGoogleModalOpen(false);
    setSuccessMsg(`Welcome, ${googleAccount.name}! Connected via Google.`);
    if (onSuccess) onSuccess();
  };

  const handleDemoLogin = async () => {
    setEmail('john.doe@gmail.com');
    setPassword('vaultMaster2026!');
    setErrorMsg('');
    try {
      await login('john.doe@gmail.com', 'vaultMaster2026!', true);
      setSuccessMsg('Logged in with Demo Vault Account!');
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: 'var(--bg-primary)',
      fontFamily: 'var(--font-main)',
      position: 'relative'
    }}>
      {/* Left Column: Brand Hero & Security Showcase */}
      <div style={{
        flex: '1 1 50%',
        backgroundColor: '#0c1022',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 56px',
        color: '#ffffff',
        overflow: 'hidden',
        borderRight: '1px solid #1a2238'
      }}>
        {/* Subtle Background Glow Orbs */}
        <div style={{
          position: 'absolute',
          top: '-120px',
          left: '-80px',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.28) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-100px',
          right: '-60px',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.22) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />

        {/* Top Brand Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <DataVaultShieldLogo size={42} />
            <div>
              <span style={{
                fontSize: '20px',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                color: '#ffffff',
                display: 'block',
                lineHeight: 1.2
              }}>
                DataVault AI
              </span>
              <span style={{
                fontSize: '12px',
                color: '#94a3b8',
                fontWeight: '500'
              }}>
                Personal Intelligent Data Vault
              </span>
            </div>
          </div>

          {/* Theme Switcher & Dashboard Shortcut */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#e2e8f0',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
              >
                {theme === 'dark' ? <Sun size={17} style={{ color: '#fbbf24' }} /> : <Moon size={17} />}
              </button>
            )}

            {onBackToApp && (
              <button
                onClick={onBackToApp}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: '#cbd5e1',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Preview Vault</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Center Hero Content */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          margin: '40px 0',
          maxWidth: '540px'
        }}>
          {/* Security Pill Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(79, 70, 229, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            color: '#a5b4fc',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '24px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>Zero-Knowledge Architecture &bull; AES-256 GCM</span>
          </div>

          <h1 style={{
            fontSize: '38px',
            fontWeight: '800',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            marginBottom: '16px'
          }}>
            One Unified Vault for all your files, drives & knowledge.
          </h1>

          <p style={{
            fontSize: '15px',
            color: '#94a3b8',
            lineHeight: 1.6,
            marginBottom: '36px'
          }}>
            Securely index, search, deduplicate, and converse with files across Google Drive, Dropbox, OneDrive, Notion, and your local machine.
          </p>

          {/* 3 Feature Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Shield size={18} />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#f8fafc' }}>
                  Client-Side End-to-End Encryption
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Your encryption keys stay exclusively on your hardware.
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Zap size={18} />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#f8fafc' }}>
                  Unified Neural Semantic Search
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Query files naturally with AI embeddings across multiple cloud drives.
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                color: '#c084fc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#f8fafc' }}>
                  AI Data Assistant & Smart Clean-up
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Instant summaries, duplicate detection, and intelligent optimization.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status / Stats Footer */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          paddingTop: '20px',
          borderTop: '1px solid #161e32',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <div>&copy; 2026 DataVault AI Inc. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ color: '#94a3b8' }}>Privacy</span>
            <span style={{ color: '#94a3b8' }}>Terms</span>
            <span style={{ color: '#94a3b8' }}>Security</span>
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Login / Register Form */}
      <div style={{
        flex: '1 1 50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        backgroundColor: 'var(--bg-primary)',
        overflowY: 'auto'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '470px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '24px',
          border: '1px solid var(--border-default)',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.25s ease'
        }}>
          {/* Header Switcher Tabs */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '26px',
            border: '1px solid var(--border-default)'
          }}>
            <button
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '9px',
                fontSize: '13.5px',
                fontWeight: mode === 'login' ? '700' : '500',
                color: mode === 'login' ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: mode === 'login' ? '#4f46e5' : 'transparent',
                boxShadow: mode === 'login' ? '0 2px 8px rgba(79, 70, 229, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </button>

            <button
              onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '9px',
                fontSize: '13.5px',
                fontWeight: mode === 'register' ? '700' : '500',
                color: mode === 'register' ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: mode === 'register' ? '#4f46e5' : 'transparent',
                boxShadow: mode === 'register' ? '0 2px 8px rgba(79, 70, 229, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Create Account
            </button>
          </div>

          {/* Card Title & Intro */}
          <div style={{ marginBottom: '22px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '800',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '6px'
            }}>
              {mode === 'login' ? 'Welcome back' : 'Create your Vault'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              {mode === 'login'
                ? 'Enter your credentials or use 1-click Google Sign-in.'
                : 'Join thousands protecting and organizing their personal data.'}
            </p>
          </div>

          {/* Notification Feedback Alerts */}
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '11px 14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              fontSize: '12.5px',
              marginBottom: '18px',
              animation: 'fadeIn 0.2s ease'
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '11px 14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#10b981',
              fontSize: '12.5px',
              marginBottom: '18px',
              animation: 'fadeIn 0.2s ease'
            }}>
              <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Social Auth Providers (Google 1-Click + GitHub) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {/* Primary Google Login Button */}
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '11px 16px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-surface)',
                border: '1.5px solid var(--border-default)',
                color: 'var(--text-primary)',
                fontSize: '13.5px',
                fontWeight: '600',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4285f4';
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <GoogleIcon size={19} />
              <span>{mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}</span>
            </button>

            {/* GitHub & Quick Demo Option */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={loginWithGithub}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontSize: '12.5px',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                }}
              >
                <GitHubIcon size={16} />
                <span>GitHub</span>
              </button>

              <button
                type="button"
                onClick={handleDemoLogin}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(79, 70, 229, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  color: '#6366f1',
                  fontSize: '12.5px',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.08)';
                }}
              >
                <Zap size={14} />
                <span>1-Click Demo</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '20px 0'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              or with email
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
          </div>

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Full Name field (Register only) */}
            {mode === 'register' && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px'
                }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 38px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-default)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '13.5px',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--primary-500)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-default)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '6px'
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '13.5px',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary-500)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-default)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)'
                }}>
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    style={{
                      fontSize: '12px',
                      color: 'var(--primary-600)',
                      fontWeight: '600',
                      background: 'none',
                      border: 'none',
                      padding: 0
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={mode === 'login' ? '••••••••' : 'Create strong password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 38px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '13.5px',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary-500)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-default)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Meter for Registration */}
              {mode === 'register' && password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Strength</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', height: '4px', width: '100%' }}>
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        style={{
                          flex: 1,
                          borderRadius: '9999px',
                          backgroundColor: step <= passwordStrength.score ? passwordStrength.color : 'var(--border-default)',
                          transition: 'background-color 0.2s ease'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password (Register only) */}
            {mode === 'register' && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px'
                }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <ShieldCheck
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 38px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-default)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '13.5px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
                  />
                </div>
              </div>
            )}

            {/* Checkbox Options */}
            {mode === 'login' ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#4f46e5', width: '15px', height: '15px', borderRadius: '4px' }}
                  />
                  <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Remember this device</span>
                </label>
              </div>
            ) : (
              <div style={{ marginTop: '2px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{ accentColor: '#4f46e5', width: '15px', height: '15px', borderRadius: '4px', marginTop: '2px' }}
                  />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    I agree to DataVault AI's <strong style={{ color: 'var(--primary-600)' }}>Terms of Service</strong> & <strong style={{ color: 'var(--primary-600)' }}>Zero-Knowledge Privacy Policy</strong>.
                  </span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                marginTop: '8px',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(79, 70, 229, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.4)';
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{mode === 'login' ? 'Authenticating...' : 'Creating Vault...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Vault' : 'Create Secure Vault'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer toggle prompt */}
          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{
                    color: 'var(--primary-600)',
                    fontWeight: '700',
                    background: 'none',
                    border: 'none',
                    padding: 0
                  }}
                >
                  Create one now
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{
                    color: 'var(--primary-600)',
                    fontWeight: '700',
                    background: 'none',
                    border: 'none',
                    padding: 0
                  }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Google OAuth Simulation Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleGoogleSuccess}
      />

      {/* Forgot Password Recovery Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onBackToLogin={() => {
          setIsForgotModalOpen(false);
          setMode('login');
        }}
      />
    </div>
  );
};
