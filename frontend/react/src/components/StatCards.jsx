import React from 'react';
import { FileText, Database, Cpu, ShieldAlert, Sparkles, HardDrive } from 'lucide-react';

export const StatCards = ({ onOpenOptimizer }) => {
  const stats = [
    {
      id: 'total-files',
      title: 'Total Files',
      value: '12,458',
      subtitle: 'Across all sources',
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
      title: 'Total Storage',
      value: '245.6 GB',
      subtitle: 'of 1 TB used',
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
      id: 'ai-summaries',
      title: 'AI Summaries',
      value: '1,234',
      subtitle: 'Generated',
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
          <Cpu size={24} strokeWidth={2} />
        </div>
      )
    },
    {
      id: 'duplicates-found',
      title: 'Duplicates Found',
      value: '342',
      subtitle: 'Save 12.4 GB',
      subtitleColor: '#3b82f6',
      isClickable: true,
      onClick: onOpenOptimizer,
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
          <ShieldAlert size={24} strokeWidth={2} />
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
      {stats.map((stat) => (
        <div
          key={stat.id}
          onClick={stat.onClick}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '16px',
            padding: '20px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: 'var(--shadow-sm)',
            cursor: stat.isClickable ? 'pointer' : 'default',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            if (stat.isClickable) {
              e.currentTarget.style.borderColor = 'var(--primary-500)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            if (stat.isClickable) {
              e.currentTarget.style.borderColor = 'var(--border-default)';
            }
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
