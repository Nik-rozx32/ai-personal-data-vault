import React, { useState } from 'react';
import { Sparkles, Send, Bot, CornerDownLeft, RefreshCw, CheckCircle, FileText, ArrowRight } from 'lucide-react';

export const AIAssistantWidget = ({ onNewChat }) => {
  const [query, setQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [response, setResponse] = useState(null);

  const sampleResponses = {
    'Summarize my documents': "Based on your 12,458 files across Google Drive, OneDrive, Dropbox, and Notion, you have 3 active major projects: 'Project Alpha Q3 Proposal' (PDF), 'AI Architecture Spec' (DOCX), and 'Quarterly Financials' (XLSX). You have 1,234 AI summaries generated with 98.4% indexing complete.",
    'Find project files': "Found 18 files related to projects: 'Project_Proposal.pdf' in Google Drive (/Projects), 'Research_Paper.docx' in OneDrive (/Research), and 4 Figma wireframes in Dropbox (/Designs).",
    'Show recent images': "Found 4 recent image files: 'Dashboard_UI.png' (3h ago, Dropbox), 'system_arch.svg' (Yesterday, Notion), and 2 receipts in Google Drive.",
  };

  const handleAsk = (customText) => {
    const textToAsk = customText || query;
    if (!textToAsk.trim()) return;

    setIsThinking(true);
    setResponse(null);

    setTimeout(() => {
      setIsThinking(false);
      if (sampleResponses[textToAsk]) {
        setResponse({
          question: textToAsk,
          text: sampleResponses[textToAsk],
          time: 'Just now'
        });
      } else {
        setResponse({
          question: textToAsk,
          text: `I analyzed your connected sources for "${textToAsk}". Found 4 matching files across Google Drive and OneDrive with relevant timestamps and tags.`,
          time: 'Just now'
        });
      }
    }, 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAsk();
    }
  };

  const handleReset = () => {
    setQuery('');
    setResponse(null);
    if (onNewChat) onNewChat();
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
      gap: '16px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            AI Assistant
          </h2>
        </div>
        <button
          onClick={handleReset}
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
          New Chat
        </button>
      </div>

      {/* Main AI Card / Banner */}
      <div style={{
        background: 'var(--ai-gradient-bg)',
        border: '1px solid var(--ai-border)',
        borderRadius: '16px',
        padding: '24px 20px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Sparkle Icon */}
        <div style={{
          marginBottom: '10px',
          color: '#6366f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill="url(#sparkle-grad)"/>
            <path d="M19 16L19.9 19.1L23 20L19.9 20.9L19 24L18.1 20.9L15 20L18.1 19.1L19 16Z" fill="#818cf8"/>
            <defs>
              <linearGradient id="sparkle-grad" x1="4" y1="2" x2="20" y2="18" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1"/>
                <stop offset="1" stopColor="#a855f7"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Heading */}
        <h3 style={{
          fontSize: '15.5px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '6px'
        }}>
          Ask anything about your data
        </h3>

        {/* Subtitle */}
        <p style={{
          fontSize: '12.5px',
          color: 'var(--text-secondary)',
          maxWidth: '380px',
          lineHeight: 1.4,
          marginBottom: '18px'
        }}>
          Find documents, get summaries, discover insights from across all your sources.
        </p>

        {/* Search / Prompt Input */}
        <div style={{
          width: '100%',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '6px 8px 6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          marginBottom: '14px',
          transition: 'all 0.2s ease'
        }}>
          <input
            type="text"
            placeholder="Ask a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              fontSize: '13px',
              color: 'var(--text-primary)',
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={() => handleAsk()}
            disabled={!query.trim() && !isThinking}
            aria-label="Send prompt"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              opacity: (query.trim() || isThinking) ? 1 : 0.6,
              transition: 'transform 0.15s ease, background-color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
          >
            {isThinking ? (
              <RefreshCw size={14} className="animate-spinSlow" />
            ) : (
              <Send size={14} style={{ marginLeft: '-1px' }} />
            )}
          </button>
        </div>

        {/* Suggestion Chips */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center',
          width: '100%'
        }}>
          {[
            'Summarize my documents',
            'Find project files',
            'Show recent images'
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setQuery(chip);
                handleAsk(chip);
              }}
              style={{
                fontSize: '11.5px',
                fontWeight: '500',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                padding: '6px 12px',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-500)';
                e.currentTarget.style.color = 'var(--primary-600)';
                e.currentTarget.style.backgroundColor = 'var(--primary-50)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Live Answer Drawer / Box */}
        {response && (
          <div style={{
            marginTop: '14px',
            width: '100%',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--primary-200)',
            borderRadius: '12px',
            padding: '12px 14px',
            textAlign: 'left',
            animation: 'fadeIn 0.25s ease'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--primary-600)',
              marginBottom: '6px'
            }}>
              <Bot size={14} />
              <span>AI Response</span>
            </div>
            <p style={{
              fontSize: '12px',
              color: 'var(--text-primary)',
              lineHeight: 1.45,
              margin: 0
            }}>
              {response.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
