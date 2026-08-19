import React, { useState } from 'react';
import { X, Sparkles, Trash2, CheckCircle2, AlertTriangle, HardDrive, ArrowRight, ShieldAlert, FileText } from 'lucide-react';

export const StorageOptimizerModal = ({ isOpen, onClose, onCleanUpSuccess }) => {
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleaned, setCleaned] = useState(false);

  if (!isOpen) return null;

  const duplicateGroups = [
    {
      name: 'Project_Assets_2025.zip',
      count: '3 copies',
      size: '4.8 GB',
      locations: ['Google Drive/Backups', 'Dropbox/Old', 'OneDrive/Archive']
    },
    {
      name: 'Dataset_raw_v2.csv',
      count: '2 copies',
      size: '3.6 GB',
      locations: ['Local Storage/Downloads', 'OneDrive/ML']
    },
    {
      name: 'Product_Demo_Video_4k.mp4',
      count: '2 copies',
      size: '4.0 GB',
      locations: ['Dropbox/Exports', 'Google Drive/Videos']
    }
  ];

  const handleCleanUp = () => {
    setIsCleaning(true);
    setTimeout(() => {
      setIsCleaning(false);
      setCleaned(true);
      if (onCleanUpSuccess) onCleanUpSuccess();
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', padding: '26px' }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6'
            }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                Storage Optimizer
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                AI-driven deduplication and space reclamation
              </p>
            </div>
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

        {cleaned ? (
          <div style={{
            padding: '36px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              12.4 GB Reclaimed Successfully!
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '380px' }}>
              342 redundant duplicate files removed across Google Drive, Dropbox, and OneDrive. All links and index pointers updated.
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: '10px',
                padding: '10px 24px',
                borderRadius: '10px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '13.5px'
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Savings Banner */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af' }}>
                  Potential Space Savings
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#1d4ed8', marginTop: '2px' }}>
                  12.4 GB <span style={{ fontSize: '13px', fontWeight: '500', color: '#3b82f6' }}>(342 duplicate files)</span>
                </div>
              </div>

              <button
                onClick={handleCleanUp}
                disabled={isCleaning}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                {isCleaning ? (
                  <>Optimizing...</>
                ) : (
                  <>
                    <Sparkles size={16} /> Clean All Duplicates
                  </>
                )}
              </button>
            </div>

            {/* Breakdown List */}
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px' }}>
              Largest Duplicate File Clusters
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {duplicateGroups.map((group, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-surface)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {group.name}
                    </div>
                    <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#2563eb' }}>
                      {group.size}
                    </div>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {group.count} across: {group.locations.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
