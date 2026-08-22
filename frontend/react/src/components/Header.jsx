import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  ShieldCheck, 
  Key, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from './BrandIcons';

export const Header = ({ 
  onOpenSearch, 
  searchQuery, 
  setSearchQuery, 
  theme, 
  toggleTheme,
  onOpenNotifications,
  onOpenAuth
}) => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'Backup synchronized', time: '10m ago', unread: true },
    { id: 2, title: '342 duplicates found', time: '1h ago', unread: true },
    { id: 3, title: 'GitHub webhook updated', time: '5h ago', unread: false },
  ];

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'DV';

  return (
    <header style={{
      height: '70px',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-default)',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      transition: 'background-color 0.25s ease, border-color 0.25s ease'
    }}>
      {/* Search Input Container */}
      <div 
        onClick={onOpenSearch}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '9px 14px',
          width: '420px',
          maxWidth: '100%',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.02)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-500)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
      >
        <Search size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search anything in your vault..."
          value={searchQuery}
          onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
          onClick={(e) => {
            // Keep native typing
          }}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '13.5px',
            color: 'var(--text-primary)',
            width: '100%',
            fontFamily: 'inherit'
          }}
        />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          padding: '2px 7px',
          fontSize: '11px',
          fontWeight: '600',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '6px',
          flexShrink: 0,
          fontFamily: 'var(--font-mono)'
        }}>
          Ctrl + K
        </div>
      </div>

      {/* Right Controls: Notifications, Dark/Light Switch, Auth/User */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'relative'
      }}>
        {/* Quick Auth Switch / Log in link if unauthenticated */}
        {!isAuthenticated ? (
          <button
            onClick={onOpenAuth}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 2px 10px rgba(79, 70, 229, 0.3)'
            }}
          >
            Sign In / Register
          </button>
        ) : null}

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            aria-label="Notifications"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              backgroundColor: showNotifications ? 'var(--bg-surface-hover)' : 'transparent',
              border: '1px solid var(--border-subtle)',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              if (!showNotifications) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <Bell size={19} />
            {/* Notification Alert Dot */}
            <span style={{
              position: 'absolute',
              top: '9px',
              right: '9px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              border: '1.5px solid var(--bg-surface)'
            }} />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '290px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: '14px',
              boxShadow: 'var(--shadow-lg)',
              padding: '12px',
              zIndex: 50,
              animation: 'fadeIn 0.18s ease'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Notifications
                </span>
                <span style={{ fontSize: '11px', color: 'var(--primary-600)', fontWeight: '600', cursor: 'pointer' }}>
                  Mark all read
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: n.unread ? 'var(--primary-50)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: n.unread ? '600' : '400', color: 'var(--text-primary)' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        {n.time}
                      </div>
                    </div>
                    {n.unread && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary-600)' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark/Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          {theme === 'dark' ? <Sun size={19} style={{ color: '#fbbf24' }} /> : <Moon size={19} />}
        </button>

        {/* User Profile Avatar & Dropdown */}
        {isAuthenticated && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 6px 4px 4px',
                borderRadius: '12px',
                backgroundColor: showUserMenu ? 'var(--bg-surface-hover)' : 'transparent',
                border: '1px solid var(--border-subtle)',
                transition: 'all 0.18s ease'
              }}
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }}
                />
              ) : (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '12px',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
                }}>
                  {userInitials}
                </div>
              )}
              <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '260px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                padding: '16px',
                zIndex: 50,
                animation: 'fadeIn 0.18s ease'
              }}>
                {/* User Info Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: '700',
                      fontSize: '14px'
                    }}>
                      {userInitials}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {currentUser?.name || 'Vault User'}
                    </div>
                    <div style={{
                      fontSize: '11.5px',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {currentUser?.email || 'user@datavault.ai'}
                    </div>
                  </div>
                </div>

                {/* Provider Tag */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-default)',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '14px'
                }}>
                  {currentUser?.provider === 'google' ? (
                    <>
                      <GoogleIcon size={14} />
                      <span>Google Verified Account</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} style={{ color: '#10b981' }} />
                      <span>End-to-End Encrypted</span>
                    </>
                  )}
                </div>

                {/* Menu Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onOpenAuth) onOpenAuth();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <ExternalLink size={15} style={{ color: 'var(--primary-600)' }} />
                    <span>Switch / Auth Portal</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                      if (onOpenAuth) onOpenAuth();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: '600',
                      color: '#ef4444',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={15} />
                    <span>Sign Out of Vault</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
