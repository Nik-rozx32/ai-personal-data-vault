import React from 'react';

// Google Drive SVG Icon
export const GoogleDriveIcon = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 87.3 78" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
    <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 10.15z" fill="#ea4335"/>
    <path d="M43.65 25h27.5c0-1.55-.4-3.1-1.2-4.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3z" fill="#00832d"/>
    <path d="M59.8 53H13.75L0 76.8c1.35.8 2.9 1.2 4.5 1.2h78.3c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
    <path d="M73.4 26.5 43.65 25 59.8 53h27.5c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
  </svg>
);

// Dropbox SVG Icon
export const DropboxIcon = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#0061FE" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L0 6.5L6 11L12 6.5L6 2Z" />
    <path d="M18 2L12 6.5L18 11L24 6.5L18 2Z" />
    <path d="M0 15.5L6 20L12 15.5L6 11L0 15.5Z" />
    <path d="M24 15.5L18 11L12 15.5L18 20L24 15.5Z" />
    <path d="M6 21.25L12 17.5L18 21.25L12 25L6 21.25Z" transform="translate(0 -2.5)" />
  </svg>
);

// Microsoft OneDrive SVG Icon
export const OneDriveIcon = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="od-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0078D4"/>
        <stop offset="100%" stopColor="#005A9E"/>
      </linearGradient>
      <linearGradient id="od-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2896F3"/>
        <stop offset="100%" stopColor="#0078D4"/>
      </linearGradient>
    </defs>
    <path d="M18.8 11.2C17.6 7.6 13.7 5.5 10 6.6c-2.8.9-4.8 3.3-5.2 6.2C2.1 13.5 0 15.9 0 18.8c0 3.3 2.7 6 6 6h15c3.9 0 7-3.1 7-7 0-3.3-2.3-6.1-5.5-6.8-.7-.2-2.5-.5-3.7.2z" fill="url(#od-grad-1)"/>
    <path d="M23.5 13.5c-.5 0-1 .1-1.5.2 1.2 1.3 1.9 3 1.9 4.9 0 3.9-3.1 7-7 7H7.2c1.2 1.5 3 2.4 5 2.4h13.8c3.3 0 6-2.7 6-6 0-3.6-2.9-6.5-6.5-6.5-.7 0-1.3.1-2 .2v-2.2z" fill="url(#od-grad-2)"/>
  </svg>
);

// Notion SVG Icon
export const NotionIcon = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#18181B"/>
    <path d="M6.5 6.5C6.83 6.74 7.03 7.02 7.03 7.37V16.71C7.03 17.06 6.83 17.34 6.5 17.58H8.84V10.29L14.77 17.58H17.5V7.47C17.5 7.12 17.3 6.84 16.97 6.6H14.72V13.89L8.79 6.6H6.5V6.5Z" fill="white"/>
  </svg>
);

// Gmail SVG Icon
export const GmailIcon = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z"/>
    <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z"/>
    <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"/>
    <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L8.283,7.662C6.914,6.635,4.957,7.039,4.07,8.514L3,12.298z"/>
    <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l4.717-3.538c1.369-1.027,3.326-0.623,4.213,0.852L45,12.298z"/>
  </svg>
);

// Local Storage / PC Icon
export const LocalStorageIcon = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="20" height="14" rx="2" stroke="#3b82f6" strokeWidth="2" fill="#eff6ff" />
    <path d="M8 21h8" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 17v4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="10" r="2" fill="#3b82f6" />
  </svg>
);

// GitHub SVG Icon
export const GitHubIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

// DataVault AI Shield Lock Logo
export const DataVaultShieldLogo = ({ size = 38 }) => (
  <div style={{
    width: size,
    height: size,
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.45)',
    flexShrink: 0
  }}>
    <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <rect x="9" y="10" width="6" height="5" rx="1" fill="white" stroke="none" />
      <path d="M10 10V8a2 2 0 0 1 4 0v2" stroke="white" strokeWidth="1.8" />
    </svg>
  </div>
);
