import React, { useState } from 'react';
import { X, UserPlus, Shield, Check, Loader2, ArrowRight } from 'lucide-react';
import { GoogleIcon } from '../BrandIcons';
import { PRESET_GOOGLE_ACCOUNTS } from '../../context/AuthContext';

export const GoogleAuthModal = ({ isOpen, onClose, onSelectAccount }) => {
  const [customEmail, setCustomEmail] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [loadingAccountId, setLoadingAccountId] = useState(null);

  if (!isOpen) return null;

  const handleAccountClick = async (account) => {
    setLoadingAccountId(account.id);
    await new Promise((res) => setTimeout(res, 500));
    setLoadingAccountId(null);
    onSelectAccount(account);
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail) return;

    setLoadingAccountId('custom');
    await new Promise((res) => setTimeout(res, 500));

    const name = customEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const newGoogleAccount = {
      id: `google-${Date.now()}`,
      name: name || 'Google User',
      email: customEmail.includes('@') ? customEmail : `${customEmail}@gmail.com`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${customEmail}`,
      provider: 'google',
      role: 'Vault Administrator',
      plan: 'Pro Vault (1 TB)',
      storageUsed: '120.0 GB',
      storageTotal: '1 TB'
    };

    setLoadingAccountId(null);
    onSelectAccount(newGoogleAccount);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '460px',
          padding: '0',
          borderRadius: '20px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Google Header */}
        <div style={{
          padding: '24px 28px 18px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'relative',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <GoogleIcon size={28} />
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em'
            }}>
              Sign in with Google
            </div>
          </div>

          <p style={{
            fontSize: '13.5px',
            color: 'var(--text-secondary)',
            margin: 0,
            lineHeight: 1.4
          }}>
            Choose an account to continue to <strong style={{ color: 'var(--text-primary)' }}>DataVault AI</strong>
          </p>
        </div>

        {/* Body Content */}
        <div style={{ padding: '20px 24px 24px 24px' }}>
          {!isCustomMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {PRESET_GOOGLE_ACCOUNTS.map((account) => {
                const isLoading = loadingAccountId === account.id;
                return (
                  <button
                    key={account.id}
                    onClick={() => handleAccountClick(account)}
                    disabled={!!loadingAccountId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-default)',
                      backgroundColor: 'var(--bg-primary)',
                      textAlign: 'left',
                      width: '100%',
                      cursor: loadingAccountId ? 'default' : 'pointer',
                      transition: 'all 0.18s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!loadingAccountId) {
                        e.currentTarget.style.borderColor = '#4285f4';
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loadingAccountId) {
                        e.currentTarget.style.borderColor = 'var(--border-default)';
                        e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <img
                      src={account.avatar}
                      alt={account.name}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--bg-surface)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {account.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {account.email}
                      </div>
                    </div>

                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" style={{ color: '#4285f4' }} />
                    ) : (
                      <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </button>
                );
              })}

              {/* Use Another Account Button */}
              <button
                onClick={() => setIsCustomMode(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px dashed var(--border-default)',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  width: '100%',
                  color: 'var(--text-secondary)',
                  marginTop: '4px',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-500)';
                  e.currentTarget.style.color = 'var(--primary-600)';
                  e.currentTarget.style.backgroundColor = 'var(--primary-50)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-surface-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <UserPlus size={18} />
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: '600' }}>
                  Use another Google account
                </div>
              </button>
            </div>
          ) : (
            /* Custom Google Email Form */
            <form onSubmit={handleCustomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px'
                }}>
                  Enter Google Email or Phone
                </label>
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4285f4'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: '13.5px',
                    fontWeight: '600'
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loadingAccountId === 'custom'}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '10px',
                    backgroundColor: '#4285f4',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)'
                  }}
                >
                  {loadingAccountId === 'custom' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Next'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Privacy and Security Notice */}
          <div style={{
            marginTop: '22px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <Shield size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
            <p style={{
              fontSize: '11.5px',
              color: 'var(--text-muted)',
              lineHeight: 1.45,
              margin: 0
            }}>
              To continue, Google will securely verify your identity with DataVault AI under Google's Privacy Policy and Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
