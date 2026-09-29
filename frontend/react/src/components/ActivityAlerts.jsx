import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  RefreshCw, 
  Upload, 
  LogIn, 
  LogOut, 
  Link, 
  Trash2,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const formatTime = (ts) => {
  if (!ts) return 'Recently';
  const diff = Date.now() - new Date(ts).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
};

const getActionDetails = (item) => {
  switch (item.action) {
    case 'USER_REGISTERED':
      return {
        title: 'Account Registered',
        desc: 'New vault user created in MongoDB',
        icon: <CheckCircle2 size={18} style={{ color: '#10b981' }} />,
        bg: '#ecfdf5'
      };
    case 'USER_LOGIN':
      return {
        title: 'Session Logged In',
        desc: 'Authenticated with bcrypt & JWT',
        icon: <LogIn size={18} style={{ color: '#3b82f6' }} />,
        bg: '#eff6ff'
      };
    case 'USER_LOGOUT':
      return {
        title: 'Session Signed Out',
        desc: 'Token session terminated',
        icon: <LogOut size={18} style={{ color: '#64748b' }} />,
        bg: '#f1f5f9'
      };
    case 'PLATFORM_CONNECTED':
      return {
        title: 'Google Drive Connected',
        desc: item.metadata?.providerAccountId || 'OAuth 2.0 authorized',
        icon: <Link size={18} style={{ color: '#10b981' }} />,
        bg: '#ecfdf5'
      };
    case 'PLATFORM_DISCONNECTED':
      return {
        title: 'Google Drive Disconnected',
        desc: 'Connection revoked',
        icon: <AlertTriangle size={18} style={{ color: '#f59e0b' }} />,
        bg: '#fffbeb'
      };
    case 'FILE_UPLOADED':
      return {
        title: `Uploaded: ${item.resourceName || 'Document'}`,
        desc: 'Stored securely in database',
        icon: <Upload size={18} style={{ color: '#6366f1' }} />,
        bg: '#f5f3ff'
      };
    case 'DOCUMENT_RETRIEVED':
      return {
        title: `Synced: ${item.resourceName || 'Document'}`,
        desc: 'Google Drive metadata recorded in MongoDB',
        icon: <RefreshCw size={17} style={{ color: '#06b6d4' }} />,
        bg: '#ecfeff'
      };
    case 'DOCUMENT_DELETED':
      return {
        title: `Deleted: ${item.resourceName || 'File'}`,
        desc: 'Removed from vault records',
        icon: <Trash2 size={18} style={{ color: '#ef4444' }} />,
        bg: '#fef2f2'
      };
    default:
      return {
        title: item.action?.replace(/_/g, ' ') || 'Vault Activity',
        desc: item.resourceName || 'User action processed',
        icon: <Info size={18} style={{ color: '#3b82f6' }} />,
        bg: '#eff6ff'
      };
  }
};

export const ActivityAlerts = ({ onViewAll, onOpenOptimizer }) => {
  const { authFetch } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/activity?limit=6');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('[ActivityAlerts] Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

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
            Activity & Alerts
          </h2>
          <button
            onClick={fetchActivity}
            title="Refresh activity logs"
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

      {/* Activity List */}
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
            Loading activity from MongoDB...
          </div>
        ) : logs.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '36px 16px',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            <Activity size={36} style={{ color: '#94a3b8', marginBottom: '8px' }} />
            <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
              No activity recorded yet
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Your actions will be recorded here in MongoDB.
            </div>
          </div>
        ) : (
          logs.map((item) => {
            const details = getActionDetails(item);
            return (
              <div
                key={item._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                    backgroundColor: details.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {details.icon}
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
                      {details.title}
                    </div>
                    <div style={{
                      fontSize: '11.5px',
                      color: 'var(--text-secondary)',
                      marginTop: '1px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {details.desc}
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
                  {formatTime(item.timestamp)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
