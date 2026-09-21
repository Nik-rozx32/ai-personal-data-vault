import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { ConnectedSources } from './components/ConnectedSources';
import { AIAssistantWidget } from './components/AIAssistantWidget';
import { RecentFiles } from './components/RecentFiles';
import { ActivityAlerts } from './components/ActivityAlerts';
import { AddSourceModal } from './components/AddSourceModal';
import { StorageOptimizerModal } from './components/StorageOptimizerModal';
import { FileUploadModal } from './components/FileUploadModal';
import { CommandPalette } from './components/CommandPalette';
import { AuthPage } from './components/auth/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Plus, Upload, ArrowLeft, Folder, Sparkles, Database, Bookmark, Trash2, Users } from 'lucide-react';

function MainVaultApp() {
  const { currentUser, isAuthenticated } = useAuth();
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [theme, setTheme] = useState('light');
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Theme Switch
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  useEffect(() => {
    // Keyboard shortcut for Ctrl+K
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // If user is not authenticated or explicitly clicks Auth navigation, show Auth page
  if (!isAuthenticated || activeNav === 'Auth') {
    return (
      <AuthPage
        initialMode="login"
        theme={theme}
        toggleTheme={toggleTheme}
        onSuccess={() => setActiveNav('Dashboard')}
        onBackToApp={isAuthenticated ? () => setActiveNav('Dashboard') : null}
      />
    );
  }

  const userFirstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'User';

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      fontFamily: 'var(--font-main)'
    }}>
      {/* Dark Sidebar */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onOpenOptimizer={() => setIsOptimizerOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={() => setActiveNav('Auth')}
      />

      {/* Main App Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflowX: 'hidden'
      }}>
        {/* Top Header */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenNotifications={() => {}}
          onOpenAuth={() => setActiveNav('Auth')}
        />

        {/* Main Content Body */}
        <main style={{
          padding: '28px 36px 48px 36px',
          flex: 1,
          maxWidth: '1500px',
          width: '100%',
          margin: '0 auto'
        }}>
          {activeNav === 'Dashboard' ? (
            <>
              {/* Dashboard Title & CTA Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px'
              }}>
                <div>
                  <h1 style={{
                    fontSize: '26px',
                    fontWeight: '800',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    margin: 0
                  }}>
                    Dashboard
                  </h1>
                  <p style={{
                    fontSize: '13.5px',
                    color: 'var(--text-secondary)',
                    fontWeight: '500',
                    marginTop: '4px',
                    marginBottom: 0
                  }}>
                    Welcome back, {userFirstName}! 👋
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(79, 70, 229, 0.1)',
                      color: '#4f46e5',
                      border: '1px solid rgba(79, 70, 229, 0.25)',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      transition: 'all 0.18s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.18)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Upload size={16} strokeWidth={2.5} />
                    <span>Upload & Chunk</span>
                  </button>

                  <button
                    onClick={() => setIsAddSourceOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      backgroundColor: '#4f46e5',
                      color: '#ffffff',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      border: 'none',
                      boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                      transition: 'all 0.18s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#4338ca';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#4f46e5';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Add Source</span>
                  </button>
                </div>
              </div>

              {/* 4 Top Metric Cards */}
              <StatCards onOpenOptimizer={() => setIsOptimizerOpen(true)} />

              {/* Middle Row: Connected Sources (Left) & AI Assistant (Right) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                gap: '24px',
                marginBottom: '24px'
              }}>
                <ConnectedSources
                  onAddSource={() => setIsAddSourceOpen(true)}
                  onViewAll={() => setActiveNav('Sources')}
                />
                <AIAssistantWidget
                  onNewChat={() => {}}
                />
              </div>

              {/* Bottom Row: Recent Files (Left) & Activity & Alerts (Right) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                gap: '24px'
              }}>
                <RecentFiles
                  onViewAll={() => setActiveNav('All Files')}
                  onSelectFile={(file) => alert(`Selected file: ${file.name}`)}
                />
                <ActivityAlerts
                  onViewAll={() => {}}
                  onOpenOptimizer={() => setIsOptimizerOpen(true)}
                />
              </div>
            </>
          ) : (
            /* Sub-Pages View for other Nav tabs */
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setActiveNav('Dashboard')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-surface-hover)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    {activeNav}
                  </h2>
                </div>
                <button
                  onClick={() => setIsAddSourceOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  <Plus size={14} /> Add Items
                </button>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Manage and explore all records inside your <strong>{activeNav}</strong> section.
              </p>

              {activeNav === 'All Files' && (
                <RecentFiles
                  onViewAll={() => {}}
                  onSelectFile={(file) => alert(`Selected file: ${file.name}`)}
                />
              )}

              {activeNav === 'Sources' && (
                <ConnectedSources
                  onAddSource={() => setIsAddSourceOpen(true)}
                  onViewAll={() => {}}
                />
              )}

              {activeNav === 'AI Assistant' && (
                <AIAssistantWidget onNewChat={() => {}} />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <AddSourceModal
        isOpen={isAddSourceOpen}
        onClose={() => setIsAddSourceOpen(false)}
        onSourceAdded={(source) => {
          setIsAddSourceOpen(false);
          alert(`Successfully connected ${source.name}!`);
        }}
      />

      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={(result) => {
          console.log('[Upload Success]:', result);
        }}
      />

      <StorageOptimizerModal
        isOpen={isOptimizerOpen}
        onClose={() => setIsOptimizerOpen(false)}
        onCleanUpSuccess={() => {}}
      />

      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectAction={(item) => {
          if (item.category === 'Tool') setIsOptimizerOpen(true);
          if (item.category === 'Source') setActiveNav('Sources');
          if (item.category === 'Auth') setActiveNav('Auth');
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainVaultApp />
    </AuthProvider>
  );
}

export default App;
