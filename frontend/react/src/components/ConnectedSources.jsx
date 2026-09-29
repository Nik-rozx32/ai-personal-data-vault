import React, { useState, useEffect } from 'react';
import { Plus, Check, RefreshCw, Unlink } from 'lucide-react';
import { 
  GoogleDriveIcon, 
  DropboxIcon, 
  OneDriveIcon, 
  NotionIcon, 
  GmailIcon, 
  LocalStorageIcon 
} from './BrandIcons';
import { useAuth } from '../context/AuthContext';

export const ConnectedSources = ({ onAddSource, onViewAll }) => {
  const { authFetch, connectGoogleDrive } = useAuth();
  const [gdriveStatus, setGdriveStatus] = useState({
    connected: false,
    providerAccountId: null,
    loading: true
  });
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const fetchGDriveStatus = async () => {
    try {
      const res = await authFetch('/api/integrations/google-drive/status');
      if (res.ok) {
        const data = await res.json();
        setGdriveStatus({
          connected: data.connected,
          providerAccountId: data.providerAccountId || null,
          loading: false
        });
      } else {
        setGdriveStatus({ connected: false, providerAccountId: null, loading: false });
      }
    } catch (err) {
      setGdriveStatus({ connected: false, providerAccountId: null, loading: false });
    }
  };

  useEffect(() => {
    fetchGDriveStatus();
  }, []);

  const handleDisconnect = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Disconnect Google Drive from your account?')) return;
    setIsDisconnecting(true);
    try {
      const res = await authFetch('/api/integrations/google-drive/disconnect', {
        method: 'DELETE'
      });
      if (res.ok) {
        setGdriveStatus({ connected: false, providerAccountId: null, loading: false });
      }
    } catch (err) {
      console.error('Error disconnecting Google Drive:', err);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const sources = [
    {
      id: 'gdrive',
      name: 'Google Drive',
      storage: gdriveStatus.connected
        ? (gdriveStatus.providerAccountId || 'Connected')
        : 'Not connected',
      icon: <GoogleDriveIcon size={26} />,
      status: gdriveStatus.connected ? 'connected' : 'disconnected',
      isGoogle: true
    },
    {
      id: 'local',
      name: 'Local Vault Storage',
      storage: 'Connected',
      icon: <LocalStorageIcon size={24} />,
      status: 'connected',
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      storage: 'Not connected',
      icon: <DropboxIcon size={24} />,
      status: 'disconnected',
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      storage: 'Not connected',
      icon: <OneDriveIcon size={26} />,
      status: 'disconnected',
    },
    {
      id: 'notion',
      name: 'Notion',
      storage: 'Not connected',
      icon: <NotionIcon size={24} />,
      status: 'disconnected',
    },
    {
      id: 'gmail',
      name: 'Gmail',
      storage: 'Not connected',
      icon: <GmailIcon size={24} />,
      status: 'disconnected',
    },
  ];

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: '18px',
      padding: '22px 24px',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          margin: 0
        }}>
          Connected Sources
        </h2>
        <button
          onClick={onViewAll}
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--primary-600)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
        >
          View all
        </button>
      </div>

      {/* Grid of Sources */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '14px'
      }}>
        {sources.map((source) => (
          <div
            key={source.id}
            onClick={() => {
              if (source.isGoogle && !gdriveStatus.connected) {
                connectGoogleDrive();
              } else if (!source.isGoogle && source.status === 'disconnected') {
                if (onAddSource) onAddSource();
              }
            }}
            style={{
              border: '1px solid var(--border-default)',
              borderRadius: '14px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'var(--bg-surface)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary-500)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {source.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '13.5px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.2
              }}>
                {source.name}
              </div>
              <div style={{
                fontSize: '11.5px',
                color: 'var(--text-secondary)',
                marginTop: '3px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {source.storage}
                </span>
                <span style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: source.status === 'connected' ? '#10b981' : '#94a3b8',
                  flexShrink: 0
                }} />
              </div>
            </div>

            {/* Disconnect button for Google Drive if connected */}
            {source.isGoogle && gdriveStatus.connected && (
              <button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                title="Disconnect Google Drive"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                <Unlink size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Centered "+ Add Source" Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '2px'
      }}>
        <button
          onClick={onAddSource}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--primary-600)',
            backgroundColor: 'var(--primary-50)',
            border: '1px dashed var(--primary-200)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-100)';
            e.currentTarget.style.borderColor = 'var(--primary-500)';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-50)';
            e.currentTarget.style.borderColor = 'var(--primary-200)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Add Source</span>
        </button>
      </div>
    </div>
  );
};
