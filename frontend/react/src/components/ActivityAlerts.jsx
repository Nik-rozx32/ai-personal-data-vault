import React from 'react';
import { CheckCircle2, Info, AlertTriangle, RefreshCw } from 'lucide-react';

export const ActivityAlerts = ({ onViewAll, onOpenOptimizer }) => {
  const activities = [
    {
      id: 'act-1',
      title: 'Backup completed successfully',
      desc: 'All sources are synchronized',
      time: '10 mins ago',
      type: 'success',
      icon: <CheckCircle2 size={18} style={{ color: '#10b981' }} />,
      bg: '#ecfdf5',
    },
    {
      id: 'act-2',
      title: 'Duplicate files detected',
      desc: '342 duplicates found. Save 12.4 GB',
      time: '1 hour ago',
      type: 'info',
      icon: <Info size={18} style={{ color: '#3b82f6' }} />,
      bg: '#eff6ff',
      onClick: onOpenOptimizer,
      isClickable: true,
    },
    {
      id: 'act-3',
      title: 'Storage optimization recommended',
      desc: 'Click to view optimization suggestions',
      time: '3 hours ago',
      type: 'warning',
      icon: <AlertTriangle size={18} style={{ color: '#f59e0b' }} />,
      bg: '#fffbeb',
      onClick: onOpenOptimizer,
      isClickable: true,
    },
    {
      id: 'act-4',
      title: 'GitHub repository synchronized',
      desc: 'data-vault-backend',
      time: '5 hours ago',
      type: 'sync',
      icon: <RefreshCw size={17} style={{ color: '#6366f1' }} />,
      bg: '#f5f3ff',
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
          Activity & Alerts
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

      {/* Activity List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {activities.map((item) => (
          <div
            key={item.id}
            onClick={item.onClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '12px',
              transition: 'all 0.18s ease',
              cursor: item.isClickable ? 'pointer' : 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
              if (item.isClickable) {
                e.currentTarget.style.transform = 'translateX(2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              if (item.isClickable) {
                e.currentTarget.style.transform = 'translateX(0)';
              }
            }}
          >
            {/* Icon + Title/Desc */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              flex: 1,
              minWidth: 0
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: item.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {item.icon}
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontSize: '11.5px',
                  color: 'var(--text-secondary)',
                  marginTop: '1px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.desc}
                </div>
              </div>
            </div>

            {/* Time */}
            <div style={{
              fontSize: '11.5px',
              color: 'var(--text-muted)',
              flexShrink: 0,
              marginLeft: '12px'
            }}>
              {item.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
