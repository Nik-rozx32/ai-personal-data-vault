import React, { useState, useEffect } from 'react';
import { 
  MoreVertical, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Eye, 
  Trash2, 
  Share2, 
  ExternalLink,
  FolderOpen,
  RefreshCw 
} from 'lucide-react';
import { GoogleDriveIcon, LocalStorageIcon } from './BrandIcons';
import { useAuth } from '../context/AuthContext';

// Format relative time helper
const formatRelativeTime = (dateStr) => {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

// Render file badge icon
const getFileIcon = (mimeType, name) => {
  const ext = (name || '').split('.').pop().toLowerCase();
  
  if (mimeType?.includes('pdf') || ext === 'pdf') {
    return (
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        backgroundColor: '#fee2e2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ef4444',
        fontSize: '10px',
        fontWeight: '800',
        letterSpacing: '0.02em',
        flexShrink: 0
      }}>
        PDF
      </div>
    );
  }

  if (mimeType?.includes('spreadsheet') || ext === 'xlsx' || ext === 'csv') {
    return (
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        backgroundColor: '#dcfce7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#16a34a',
        fontSize: '10px',
        fontWeight: '800',
        flexShrink: 0
      }}>
        SHEET
      </div>
    );
  }

  if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) {
    return (
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        backgroundColor: '#f3e8ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9333ea',
        flexShrink: 0
      }}>
        <ImageIcon size={18} />
      </div>
    );
  }

  return (
    <div style={{
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      backgroundColor: '#e0e7ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#4f46e5',
      fontSize: '10px',
      fontWeight: '800',
      flexShrink: 0
    }}>
      <FileText size={18} />
    </div>
  );
};

export const RecentFiles = ({ onViewAll, onSelectFile }) => {
  const { authFetch } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      // 1. Fetch user's stored vault documents from MongoDB
      const res = await authFetch('/api/files');
      let combined = [];

      if (res.ok) {
        const data = await res.json();
        combined = (data.files || []).map((f) => ({
          id: f.id,
          name: f.name,
          source: f.source === 'google_drive' ? 'Google Drive' : 'Local Vault',
          path: f.source === 'google_drive' ? '/Google Drive' : '/Vault Storage',
          time: formatRelativeTime(f.createdAt || f.sourceModifiedAt),
          url: f.url,
          mimeType: f.mimeType,
          isLocal: f.source === 'local'
        }));
      }

      // 2. Also check if Google Drive has live files if none synced yet
      if (combined.length === 0) {
        try {
          const gdriveRes = await authFetch('/api/integrations/google-drive/files?pageSize=10');
          if (gdriveRes.ok) {
            const gdriveData = await gdriveRes.json();
            const gfiles = (gdriveData.files || []).map((f) => ({
              id: f.id,
              name: f.name,
              source: 'Google Drive',
              path: '/Google Drive',
              time: formatRelativeTime(f.modifiedTime || f.createdTime),
              url: f.webViewLink,
              mimeType: f.mimeType,
              isLocal: false
            }));
            combined = gfiles;
          }
        } catch (gErr) {
          // GDrive might not be connected yet
        }
      }

      setFiles(combined);
    } catch (err) {
      console.error('[RecentFiles] Error loading files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleDelete = async (file, e) => {
    e.stopPropagation();
    if (!file.isLocal) {
      alert('Original files remain on Google Drive and cannot be deleted from here.');
      setActiveMenuId(null);
      return;
    }

    if (!window.confirm(`Delete ${file.name} from your vault?`)) return;

    try {
      const res = await authFetch(`/api/files/${file.id}`, { method: 'DELETE' });
      if (res.ok) {
        setFiles(prev => prev.filter(f => f.id !== file.id));
      }
    } catch (err) {
      console.error('Error deleting file:', err);
    }
    setActiveMenuId(null);
  };

  const handlePreview = (file, e) => {
    e.stopPropagation();
    if (file.url) {
      window.open(file.url, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Document: ${file.name}\nSource: ${file.source}\nSaved in MongoDB Vault`);
    }
    setActiveMenuId(null);
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: '18px',
      padding: '22px 24px',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Recent Files
          </h2>
          <button
            onClick={fetchFiles}
            title="Refresh files"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spinSlow' : ''} />
          </button>
        </div>
        <button
          onClick={onViewAll}
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--primary-600)',
            cursor: 'pointer',
            background: 'none',
            border: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
        >
          View all
        </button>
      </div>

      {/* Files List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minHeight: '120px'
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '36px 0',
            color: 'var(--text-secondary)',
            fontSize: '13px'
          }}>
            Loading files from database...
          </div>
        ) : files.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '36px 16px',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            <FolderOpen size={36} style={{ color: '#94a3b8', marginBottom: '8px' }} />
            <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
              No documents in vault yet
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px', maxWidth: '300px' }}>
              Connect Google Drive or upload a document to view your real files here.
            </div>
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              onClick={() => {
                if (file.url) {
                  window.open(file.url, '_blank', 'noopener,noreferrer');
                } else if (onSelectFile) {
                  onSelectFile(file);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '12px',
                transition: 'background-color 0.18s ease',
                cursor: 'pointer',
                position: 'relative'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {/* File Icon, Name & Path */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                flex: 1,
                minWidth: 0
              }}>
                {getFileIcon(file.mimeType, file.name)}
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '13.5px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {file.name}
                  </div>
                  <div style={{
                    fontSize: '11.5px',
                    color: 'var(--text-secondary)',
                    marginTop: '1px'
                  }}>
                    {file.path}
                  </div>
                </div>
              </div>

              {/* Source, Timestamp, and Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                flexShrink: 0
              }}>
                <div style={{
                  textAlign: 'right',
                  minWidth: '85px'
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: 'var(--text-primary)'
                  }}>
                    {file.source}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)'
                  }}>
                    {file.time}
                  </div>
                </div>

                {/* 3-Dots Menu Button */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={(e) => toggleMenu(file.id, e)}
                    aria-label="File options"
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-secondary)',
                      backgroundColor: activeMenuId === file.id ? 'var(--bg-surface-active)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuId === file.id && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '34px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '10px',
                        boxShadow: 'var(--shadow-lg)',
                        padding: '6px',
                        width: '160px',
                        zIndex: 60,
                        animation: 'fadeIn 0.15s ease'
                      }}
                    >
                      <button
                        onClick={(e) => handlePreview(file, e)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '7px 10px',
                          fontSize: '12px',
                          color: 'var(--text-primary)',
                          borderRadius: '6px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {file.url ? <ExternalLink size={14} /> : <Eye size={14} />} 
                        {file.url ? 'Open in Drive' : 'View Details'}
                      </button>

                      {file.isLocal && (
                        <button
                          onClick={(e) => handleDelete(file, e)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '7px 10px',
                            fontSize: '12px',
                            color: '#ef4444',
                            borderRadius: '6px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Trash2 size={14} /> Delete File
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
