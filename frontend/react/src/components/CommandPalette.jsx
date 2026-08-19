import React, { useState, useEffect } from 'react';
import { Search, FileText, Database, Sparkles, Folder, ArrowRight, X, Clock, Settings, Command } from 'lucide-react';

export const CommandPalette = ({ isOpen, onClose, onSelectAction }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    { id: '1', title: 'Project_Proposal.pdf', category: 'Recent File', icon: <FileText size={16} /> },
    { id: '2', title: 'Research_Paper.docx', category: 'Recent File', icon: <FileText size={16} /> },
    { id: '3', title: 'Search Google Drive Files', category: 'Source', icon: <Database size={16} /> },
    { id: '4', title: 'Ask AI: Summarize my documents', category: 'AI Assistant', icon: <Sparkles size={16} /> },
    { id: '5', title: 'Open Storage Optimizer', category: 'Tool', icon: <Settings size={16} /> },
    { id: '6', title: 'Connect new cloud drive', category: 'Action', icon: <Folder size={16} /> },
  ];

  const filtered = items.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', padding: '0', overflow: 'hidden' }}
      >
        {/* Input box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <Search size={20} style={{ color: 'var(--text-secondary)' }} />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              fontSize: '15px',
              color: 'var(--text-primary)',
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={onClose}
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '11px',
              backgroundColor: 'var(--bg-surface-hover)',
              color: 'var(--text-muted)'
            }}
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div style={{
          maxHeight: '320px',
          overflowY: 'auto',
          padding: '8px'
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No results found for "{query}"
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (onSelectAction) onSelectAction(item);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--primary-600)' }}>{item.icon}</span>
                  <span style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: '500' }}>
                    {item.title}
                  </span>
                </div>
                <span style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-surface-hover)',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {item.category}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--text-muted)'
        }}>
          <span>Navigation: <kbd style={{ padding: '1px 4px', border: '1px solid var(--border-default)', borderRadius: '3px' }}>↑</kbd> <kbd style={{ padding: '1px 4px', border: '1px solid var(--border-default)', borderRadius: '3px' }}>↓</kbd></span>
          <span>Select: <kbd style={{ padding: '1px 4px', border: '1px solid var(--border-default)', borderRadius: '3px' }}>↵</kbd></span>
        </div>
      </div>
    </div>
  );
};
