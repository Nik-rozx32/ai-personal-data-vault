import React, { useState } from 'react';
import { MoreVertical, FileText, Image, Code2, Download, Eye, Sparkles, Trash2, Share2 } from 'lucide-react';
import { GitHubIcon, NotionIcon } from './BrandIcons';

export const RecentFiles = ({ onViewAll, onSelectFile }) => {
  const [activeMenuId, setActiveMenuId] = useState(null);

  const files = [
    {
      id: 'file-1',
      name: 'Project_Proposal.pdf',
      path: '/Google Drive/Projects',
      source: 'Google Drive',
      time: '2 mins ago',
      icon: (
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
          letterSpacing: '0.02em'
        }}>
          PDF
        </div>
      )
    },
    {
      id: 'file-2',
      name: 'Research_Paper.docx',
      path: '/OneDrive/Research',
      source: 'OneDrive',
      time: '1 hour ago',
      icon: (
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: '#e0e7ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#3b82f6',
          fontSize: '10px',
          fontWeight: '800',
          letterSpacing: '0.02em'
        }}>
          DOCX
        </div>
      )
    },
    {
      id: 'file-3',
      name: 'Dashboard_UI.png',
      path: '/Dropbox/Designs',
      source: 'Dropbox',
      time: '3 hours ago',
      icon: (
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: '#f1f5f9',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #cbd5e1'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Image size={18} />
          </div>
        </div>
      )
    },
    {
      id: 'file-4',
      name: 'data-vault-backend',
      path: '/GitHub/Repositories',
      source: 'GitHub',
      time: '5 hours ago',
      icon: (
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: '#18181b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff'
        }}>
          <GitHubIcon size={20} />
        </div>
      )
    },
    {
      id: 'file-5',
      name: 'Meeting_Notes',
      path: '/Notion/Work',
      source: 'Notion',
      time: 'Yesterday',
      icon: (
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <NotionIcon size={36} />
        </div>
      )
    }
  ];

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
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
        <h2 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          margin: 0
        }}>
          Recent Files
        </h2>
        <button
          onClick={onViewAll}
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--primary-600)',
            cursor: 'pointer'
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
        gap: '4px'
      }}>
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => onSelectFile && onSelectFile(file)}
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
            {/* File Icon and Name & Path */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              flex: 1,
              minWidth: 0
            }}>
              {file.icon}
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

            {/* Source and Timestamp and Actions */}
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

              {/* 3-Dots Button */}
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
                    backgroundColor: activeMenuId === file.id ? 'var(--bg-surface-active)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-active)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (activeMenuId !== file.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
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
                      onClick={() => { setActiveMenuId(null); alert(`Previewing ${file.name}`); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '7px 10px',
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                        borderRadius: '6px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Eye size={14} /> Preview
                    </button>
                    <button
                      onClick={() => { setActiveMenuId(null); alert(`Summarizing ${file.name} with AI...`); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '7px 10px',
                        fontSize: '12px',
                        color: 'var(--primary-600)',
                        fontWeight: '500',
                        borderRadius: '6px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-50)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Sparkles size={14} /> AI Summarize
                    </button>
                    <button
                      onClick={() => { setActiveMenuId(null); alert(`Downloading ${file.name}...`); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '7px 10px',
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                        borderRadius: '6px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Download size={14} /> Download
                    </button>
                    <button
                      onClick={() => { setActiveMenuId(null); alert(`Share link copied for ${file.name}`); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '7px 10px',
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                        borderRadius: '6px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Share2 size={14} /> Share
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
