import React from 'react';
import { Plus, ExternalLink } from 'lucide-react';
import { 
  GoogleDriveIcon, 
  DropboxIcon, 
  OneDriveIcon, 
  NotionIcon, 
  GmailIcon, 
  LocalStorageIcon 
} from './BrandIcons';

export const ConnectedSources = ({ onAddSource, onViewAll }) => {
  const sources = [
    {
      id: 'gdrive',
      name: 'Google Drive',
      storage: '68.4 GB',
      icon: <GoogleDriveIcon size={26} />,
      status: 'connected',
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      storage: '45.2 GB',
      icon: <DropboxIcon size={24} />,
      status: 'connected',
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      storage: '36.7 GB',
      icon: <OneDriveIcon size={26} />,
      status: 'connected',
    },
    {
      id: 'notion',
      name: 'Notion',
      storage: '12.6 GB',
      icon: <NotionIcon size={24} />,
      status: 'connected',
    },
    {
      id: 'gmail',
      name: 'Gmail',
      storage: '8.7 GB',
      icon: <GmailIcon size={24} />,
      status: 'connected',
    },
    {
      id: 'local',
      name: 'Local Storage',
      storage: '51.0 GB',
      icon: <LocalStorageIcon size={24} />,
      status: 'connected',
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

      {/* Grid of 6 Sources (3 cols x 2 rows) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '14px'
      }}>
        {sources.map((source) => (
          <div
            key={source.id}
            style={{
              border: '1px solid var(--border-default)',
              borderRadius: '14px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'var(--bg-surface)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
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
                <span>{source.storage}</span>
                <span style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }} />
              </div>
            </div>
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
            transition: 'all 0.2s ease'
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
