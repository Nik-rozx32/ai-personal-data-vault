import React from 'react';
import { 
  Home, 
  Folder, 
  Search, 
  Layers, 
  Sparkles, 
  Bookmark, 
  Users, 
  Trash2, 
  TrendingUp, 
  ChevronDown,
  User
} from 'lucide-react';
import { DataVaultShieldLogo } from './BrandIcons';

export const Sidebar = ({ 
  activeNav = 'Dashboard', 
  setActiveNav, 
  onOpenOptimizer, 
  onOpenSearch 
}) => {
  const navItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: Home },
    { id: 'All Files', label: 'All Files', icon: Folder },
    { id: 'Search', label: 'Search', icon: Search, onClick: onOpenSearch },
    { id: 'Sources', label: 'Sources', icon: Layers },
    { id: 'AI Assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'Collections', label: 'Collections', icon: Bookmark },
    { id: 'Shared', label: 'Shared', icon: Users },
    { id: 'Trash', label: 'Trash', icon: Trash2 },
  ];

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      backgroundColor: '#0c1022',
      color: '#94a3b8',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      borderRight: '1px solid #1a2238',
      zIndex: 40,
      userSelect: 'none',
      overflowY: 'auto'
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px 20px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <DataVaultShieldLogo size={38} />
        <div>
          <h1 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#ffffff',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            DataVault AI
          </h1>
          <p style={{
            fontSize: '11px',
            color: '#64748b',
            fontWeight: '500',
            margin: 0,
            letterSpacing: '0.01em'
          }}>
            Personal Data Vault
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: 1
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.onClick) item.onClick();
                if (setActiveNav) setActiveNav(item.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive 
                  ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' 
                  : 'transparent',
                boxShadow: isActive ? '0 4px 14px rgba(79, 70, 229, 0.38)' : 'none',
                textAlign: 'left',
                border: 'none',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#e2e8f0';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section: Storage Summary & User Profile */}
      <div style={{
        padding: '16px 16px 20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        borderTop: '1px solid #161e32'
      }}>
        {/* Storage Summary Box */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '12px',
          padding: '14px'
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: '700',
            letterSpacing: '0.08em',
            color: '#64748b',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}>
            Storage Summary
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Total Used</span>
          </div>

          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '10px'
          }}>
            245.6 GB <span style={{ color: '#64748b', fontWeight: '400' }}>/ 1 TB (24%)</span>
          </div>

          {/* Progress Bar */}
          <div style={{
            height: '6px',
            width: '100%',
            backgroundColor: '#1e293b',
            borderRadius: '9999px',
            overflow: 'hidden',
            marginBottom: '14px'
          }}>
            <div style={{
              height: '100%',
              width: '24%',
              background: 'linear-gradient(90deg, #6366f1 0%, #38bdf8 100%)',
              borderRadius: '9999px'
            }} />
          </div>

          {/* Storage Optimizer Button */}
          <button
            onClick={onOpenOptimizer}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '500',
              color: '#cbd5e1',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#cbd5e1';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <TrendingUp size={14} style={{ color: '#818cf8' }} />
            <span>Storage Optimizer</span>
          </button>
        </div>

        {/* User Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 6px',
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0
          }}>
            <User size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#ffffff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              John Doe
            </div>
            <div style={{
              fontSize: '11px',
              color: '#64748b',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              john.doe@email.com
            </div>
          </div>
          <ChevronDown size={16} style={{ color: '#64748b' }} />
        </div>
      </div>
    </aside>
  );
};
