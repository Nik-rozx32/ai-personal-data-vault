import React, { useState, useEffect } from 'react';
import { FileText, Database, Layers, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const StatCards = ({ onOpenOptimizer }) => {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalStorageBytes: 0,
    connectedAccountsCount: 0,
    recentActivityCount: 0
  });

  useEffect(() => {
    authFetch('/api/users/stats')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.totalFiles === 'number') {
          setStats(data);
        }
      })
      .catch(err => console.warn('[StatCards] Stats fetch error:', err.message));
  }, []);

  const cardItems = [
    {
      id: 'total-files',
      title: 'Total Files',
      value: stats.totalFiles.toLocaleString(),
      subtitle: 'Stored in vault database',
      subtitleColor: 'var(--text-secondary)',
      icon: (
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          backgroundColor: '#f5f3ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6366f1',
          flexShrink: 0
        }}>
          <FileText size={24} strokeWidth={2} />
        </div>
      )
    },
    {
      id: 'total-storage',
      title: 'Vault Storage',
      value: formatBytes(stats.totalStorageBytes),
      subtitle: 'Real document data',
      subtitleColor: '#10b981',
      icon: (
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          backgroundColor: '#ecfdf5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#10b981',
          flexShrink: 0
        }}>
          <Database size={24} strokeWidth={2} />
        </div>
      )
    },
    {
      id: 'connected-sources',
      title: 'Active Sources',
      value: `${stats.connectedAccountsCount}`,
      subtitle: stats.connectedAccountsCount > 0 ? 'Connected & synced' : 'Connect Google Drive',
      subtitleColor: '#f59e0b',
      icon: (
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          backgroundColor: '#fffbeb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f59e0b',
          flexShrink: 0
        }}>
          <Layers size={24} strokeWidth={2} />
        </div>
      )
    },
    {
      id: 'activity-events',
      title: 'Vault Events',
      value: stats.recentActivityCount.toLocaleString(),
      subtitle: 'MongoDB audit trail',
      subtitleColor: '#3b82f6',
      icon: (
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          backgroundColor: '#eff6ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#3b82f6',
          flexShrink: 0
        }}>
          <Activity size={24} strokeWidth={2} />
        </div>
      )
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '18px',
      marginBottom: '28px'
    }}>
      {cardItems.map((stat) => (
        <div
          key={stat.id}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '16px',
            padding: '20px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
        >
          {stat.icon}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '12.5px',
              fontWeight: '500',
              color: 'var(--text-secondary)',
              marginBottom: '4px'
            }}>
              {stat.title}
            </div>
            
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: '4px'
            }}>
              {stat.value}
            </div>

            <div style={{
              fontSize: '12px',
              fontWeight: '500',
              color: stat.subtitleColor,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {stat.subtitle}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
