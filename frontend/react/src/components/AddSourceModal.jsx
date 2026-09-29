import React, { useState, useEffect } from 'react';
import { X, Check, Search, Plus, ExternalLink, ShieldCheck, RefreshCw } from 'lucide-react';
import { 
  GoogleDriveIcon, 
  DropboxIcon, 
  OneDriveIcon, 
  NotionIcon, 
  GmailIcon, 
  LocalStorageIcon,
  GitHubIcon
} from './BrandIcons';
import { useAuth } from '../context/AuthContext';

export const AddSourceModal = ({ isOpen, onClose, onSourceAdded }) => {
  const { authFetch, connectGoogleDrive } = useAuth();
  const [connectingId, setConnectingId] = useState(null);
  const [isGDriveConnected, setIsGDriveConnected] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      authFetch('/api/integrations/google-drive/status')
        .then(res => res.json())
        .then(data => setIsGDriveConnected(data.connected || false))
        .catch(() => setIsGDriveConnected(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const availableSources = [
    { id: 'gdrive', name: 'Google Drive', category: 'Cloud Storage', icon: <GoogleDriveIcon size={28} />, isLive: true },
    { id: 'local', name: 'Local Disk / Storage', category: 'Local Storage', icon: <LocalStorageIcon size={26} />, isLive: true, connected: true },
    { id: 'dropbox', name: 'Dropbox', category: 'Cloud Storage', icon: <DropboxIcon size={26} />, isLive: false },
    { id: 'onedrive', name: 'Microsoft OneDrive', category: 'Cloud Storage', icon: <OneDriveIcon size={28} />, isLive: false },
    { id: 'notion', name: 'Notion Workspace', category: 'Productivity', icon: <NotionIcon size={26} />, isLive: false },
    { id: 'gmail', name: 'Google Workspace / Gmail', category: 'Email & Communications', icon: <GmailIcon size={26} />, isLive: false },
    { id: 'github', name: 'GitHub Repositories', category: 'Developer', icon: <GitHubIcon size={26} />, isLive: false },
    { id: 's3', name: 'Amazon Web Services S3', category: 'Cloud Storage', icon: <span style={{ fontSize: '22px' }}>☁️</span>, isLive: false },
    { id: 'box', name: 'Box Enterprise', category: 'Cloud Storage', icon: <span style={{ fontSize: '22px' }}>📦</span>, isLive: false },
    { id: 'icloud', name: 'Apple iCloud Drive', category: 'Cloud Storage', icon: <span style={{ fontSize: '22px' }}>🍎</span>, isLive: false },
  ];

  const handleConnect = async (source) => {
    setErrorMsg('');
    if (source.id === 'gdrive') {
      try {
        setConnectingId('gdrive');
        await connectGoogleDrive();
      } catch (err) {
        setConnectingId(null);
        setErrorMsg(err.message || 'Failed to start Google Drive authorization');
      }
    } else if (source.id === 'local') {
      onClose();
    } else {
      setErrorMsg(`${source.name} integration is scheduled for upcoming phase.`);
    }
  };

  const filtered = availableSources.filter(s => 
    s.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '560px', padding: '24px' }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              Connect Data Source
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Connect cloud storage or local files to your secure personal vault.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: '8px',
            fontSize: '12.5px',
            marginBottom: '14px'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-default)',
          borderRadius: '10px',
          padding: '8px 12px',
          marginBottom: '16px'
        }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Filter sources (e.g. Google Drive, Notion)..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              fontSize: '13px',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        {/* Source List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '380px',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {filtered.map((source) => {
            const isConnected = source.id === 'gdrive' ? isGDriveConnected : Boolean(source.connected);
            const isConnecting = connectingId === source.id;

            return (
              <div
                key={source.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  transition: 'all 0.18s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {source.icon}
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {source.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {source.category} {!source.isLive && source.id !== 'local' && '• Coming Soon'}
                    </div>
                  </div>
                </div>

                <div>
                  {isConnected ? (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#10b981',
                      backgroundColor: '#ecfdf5',
                      padding: '5px 10px',
                      borderRadius: '8px'
                    }}>
                      <Check size={14} strokeWidth={2.5} /> Connected
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConnect(source)}
                      disabled={isConnecting}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        backgroundColor: '#4f46e5',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw size={13} className="animate-spinSlow" /> Connecting...
                        </>
                      ) : (
                        'Connect'
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div style={{
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11.5px',
          color: 'var(--text-secondary)'
        }}>
          <ShieldCheck size={16} style={{ color: '#10b981' }} />
          <span>All connections are encrypted with 256-bit AES encryption.</span>
        </div>
      </div>
    </div>
  );
};
