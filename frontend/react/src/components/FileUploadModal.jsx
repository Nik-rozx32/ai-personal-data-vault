import React, { useState, useRef, useMemo } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Layers, 
  Cpu, 
  HardDrive, 
  ArrowDown, 
  Info, 
  Folder, 
  RefreshCw,
  FileCode,
  FileSpreadsheet,
  FileAudio,
  FileVideo,
  FileArchive,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Helper to determine file icon and type category
const getFileTypeInfo = (filename, mimeType) => {
  const ext = (filename || '').split('.').pop().toLowerCase();
  
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) || mimeType?.startsWith('image/')) {
    return { label: 'Image (' + ext.toUpperCase() + ')', icon: ImageIcon, color: '#06b6d4' };
  }
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext) || mimeType?.startsWith('video/')) {
    return { label: 'Video (' + ext.toUpperCase() + ')', icon: FileVideo, color: '#8b5cf6' };
  }
  if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext) || mimeType?.startsWith('audio/')) {
    return { label: 'Audio (' + ext.toUpperCase() + ')', icon: FileAudio, color: '#ec4899' };
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return { label: 'Archive (' + ext.toUpperCase() + ')', icon: FileArchive, color: '#f59e0b' };
  }
  if (['csv', 'xlsx', 'xls'].includes(ext)) {
    return { label: 'Spreadsheet (' + ext.toUpperCase() + ')', icon: FileSpreadsheet, color: '#10b981' };
  }
  if (['js', 'jsx', 'ts', 'tsx', 'cpp', 'h', 'py', 'json', 'html', 'css', 'txt', 'md'].includes(ext)) {
    return { label: 'Code / Text (' + ext.toUpperCase() + ')', icon: FileCode, color: '#3b82f6' };
  }
  if (ext === 'pdf' || mimeType === 'application/pdf') {
    return { label: 'PDF Document', icon: FileText, color: '#ef4444' };
  }
  return { label: ext ? `${ext.toUpperCase()} File` : 'Binary File', icon: FileText, color: '#6366f1' };
};

// Formats bytes into human-readable string
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes || isNaN(bytes)) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const { token, currentUser } = useAuth();

  const [selectedFile, setSelectedFile] = useState(null);
  const [chunkPreset, setChunkPreset] = useState('1MB'); // '256KB' | '512KB' | '1MB' | '2MB' | '5MB' | 'custom'
  const [customValue, setCustomValue] = useState(1);
  const [customUnit, setCustomUnit] = useState('MB'); // 'KB' | 'MB'
  const [customError, setCustomError] = useState('');

  const [status, setStatus] = useState('idle'); // 'idle' | 'uploading' | 'chunking' | 'processing' | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resultData, setResultData] = useState(null);
  const [selectedChunkIndex, setSelectedChunkIndex] = useState(0);

  const fileInputRef = useRef(null);

  // Compute calculated chunk size in bytes
  const calculatedChunkSizeBytes = useMemo(() => {
    switch (chunkPreset) {
      case '256KB': return 256 * 1024;
      case '512KB': return 512 * 1024;
      case '1MB':   return 1024 * 1024;
      case '2MB':   return 2 * 1024 * 1024;
      case '5MB':   return 5 * 1024 * 1024;
      case 'custom': {
        const num = parseFloat(customValue);
        if (isNaN(num) || num <= 0) return 0;
        const multiplier = customUnit === 'MB' ? 1024 * 1024 : 1024;
        return Math.round(num * multiplier);
      }
      default: return 1024 * 1024;
    }
  }, [chunkPreset, customValue, customUnit]);

  // Validate custom chunk size
  const handleCustomValueChange = (val) => {
    setCustomValue(val);
    const num = parseFloat(val);
    if (!val || isNaN(num) || num <= 0) {
      setCustomError('Chunk size must be greater than 0.');
    } else if (customUnit === 'MB' && num > 50) {
      setCustomError('Custom chunk size cannot exceed 50 MB.');
    } else if (customUnit === 'KB' && num > 50 * 1024) {
      setCustomError('Custom chunk size cannot exceed 50 MB (51,200 KB).');
    } else {
      setCustomError('');
    }
  };

  const handleCustomUnitChange = (unit) => {
    setCustomUnit(unit);
    const num = parseFloat(customValue);
    if (!customValue || isNaN(num) || num <= 0) {
      setCustomError('Chunk size must be greater than 0.');
    } else if (unit === 'MB' && num > 50) {
      setCustomError('Custom chunk size cannot exceed 50 MB.');
    } else if (unit === 'KB' && num > 50 * 1024) {
      setCustomError('Custom chunk size cannot exceed 50 MB (51,200 KB).');
    } else {
      setCustomError('');
    }
  };

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg('');
      setStatus('idle');
      setResultData(null);
      setSelectedChunkIndex(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setErrorMsg('');
      setStatus('idle');
      setResultData(null);
      setSelectedChunkIndex(0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select a file to upload.');
      return;
    }

    if (calculatedChunkSizeBytes <= 0 || customError) {
      setErrorMsg('Please provide a valid chunk size greater than 0.');
      return;
    }

    setStatus('uploading');
    setStatusMessage('Uploading file to backend API...');
    setErrorMsg('');
    setResultData(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('chunkSize', String(calculatedChunkSizeBytes));

    // Staged progress state indicators for staff demonstration clarity
    const timer1 = setTimeout(() => {
      setStatusMessage('Invoking C++ Storage Engine binary...');
    }, 450);

    const timer2 = setTimeout(() => {
      setStatusMessage('C++ Storage Engine splitting file into binary chunks...');
    }, 900);

    try {
      const effectiveToken = token || currentUser?.token || localStorage.getItem('datavault_jwt_token');

      const response = await fetch('/api/files/chunk', {
        method: 'POST',
        headers: {
          ...(effectiveToken ? { 'Authorization': `Bearer ${effectiveToken}` } : {})
        },
        body: formData
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to upload and chunk file with storage engine.');
      }

      setStatus('success');
      setStatusMessage('C++ Storage Engine Chunking Completed!');
      setResultData(data);
      setSelectedChunkIndex(0);

      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      console.error('[Upload Error]:', err);
      setStatus('error');
      setErrorMsg(err.message || 'An error occurred while executing the C++ storage engine.');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setStatus('idle');
    setStatusMessage('');
    setErrorMsg('');
    setResultData(null);
    setSelectedChunkIndex(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileInfo = selectedFile ? getFileTypeInfo(selectedFile.name, selectedFile.type) : null;
  const FileIconComponent = fileInfo ? fileInfo.icon : FileText;

  const isFormValid = !!selectedFile && calculatedChunkSizeBytes > 0 && !customError && status !== 'uploading';

  const selectedChunk = resultData?.chunks?.[selectedChunkIndex] || resultData?.chunks?.[0] || null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(11, 15, 25, 0.72)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          borderRadius: '18px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--border-default, #e2e8f0)',
          border: '1px solid var(--border-default, #e2e8f0)',
          overflowY: 'auto',
          animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-default, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-primary, #f8fafc)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(79, 70, 229, 0.12)',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Cpu size={20} strokeWidth={2.3} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: 0, letterSpacing: '-0.01em' }}>
                Upload & Chunk File
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary, #64748b)', margin: 0, fontWeight: '500' }}>
                Integrated with C++ Distributed Storage Engine
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
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary, #64748b)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {status !== 'success' ? (
            <>
              {/* File Dropzone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: selectedFile ? '2px solid #6366f1' : '2px dashed var(--border-hover, #cbd5e1)',
                  borderRadius: '14px',
                  backgroundColor: selectedFile ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-primary, #f8fafc)',
                  padding: selectedFile ? '20px' : '32px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '20px'
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                {selectedFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        backgroundColor: fileInfo?.color || '#4f46e5',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
                      }}>
                        <FileIconComponent size={24} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: '700',
                          color: 'var(--text-primary, #0f172a)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {selectedFile.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', fontSize: '12px', color: 'var(--text-secondary, #64748b)' }}>
                          <span style={{
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            color: '#4f46e5',
                            padding: '2px 7px',
                            borderRadius: '5px',
                            fontWeight: '600',
                            fontSize: '11px'
                          }}>
                            {fileInfo?.label}
                          </span>
                          <span>•</span>
                          <span style={{ fontWeight: '600' }}>
                            {formatBytes(selectedFile.size)} ({selectedFile.size.toLocaleString()} bytes)
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-default, #cbd5e1)',
                        backgroundColor: 'var(--bg-surface, #ffffff)',
                        color: 'var(--text-secondary, #64748b)',
                        fontSize: '12px',
                        fontWeight: '600',
                        flexShrink: 0
                      }}
                    >
                      Change File
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      color: '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Upload size={22} />
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary, #0f172a)' }}>
                      Choose a file or drag & drop here
                    </span>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-secondary, #64748b)' }}>
                      Supports all files (PDF, DOCX, ZIP, MP4, BIN, images, etc.) up to 200 MB
                    </span>
                  </div>
                )}
              </div>

              {/* Chunk Size Configuration Section */}
              <div style={{
                backgroundColor: 'var(--bg-primary, #f8fafc)',
                borderRadius: '12px',
                border: '1px solid var(--border-default, #e2e8f0)',
                padding: '16px 18px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={16} color="#6366f1" />
                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary, #0f172a)' }}>
                      C++ Storage Engine Chunk Size
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)', fontFamily: 'monospace' }}>
                    {calculatedChunkSizeBytes > 0 ? `${calculatedChunkSizeBytes.toLocaleString()} bytes` : ''}
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))',
                  gap: '8px',
                  marginBottom: chunkPreset === 'custom' ? '12px' : '0'
                }}>
                  {[
                    { id: '256KB', label: '256 KB', sub: '262 KB' },
                    { id: '512KB', label: '512 KB', sub: '524 KB' },
                    { id: '1MB', label: '1 MB', sub: 'Default' },
                    { id: '2MB', label: '2 MB', sub: '2.09 MB' },
                    { id: '5MB', label: '5 MB', sub: '5.24 MB' },
                    { id: 'custom', label: 'Custom', sub: 'Configure' }
                  ].map((preset) => {
                    const isSelected = chunkPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setChunkPreset(preset.id)}
                        disabled={status === 'uploading'}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '9px',
                          border: isSelected ? '1.5px solid #4f46e5' : '1px solid var(--border-default, #e2e8f0)',
                          backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg-surface, #ffffff)',
                          color: isSelected ? '#4f46e5' : 'var(--text-primary, #0f172a)',
                          fontWeight: isSelected ? '700' : '500',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{preset.label}</span>
                        <span style={{ fontSize: '10.5px', color: isSelected ? '#6366f1' : 'var(--text-muted, #94a3b8)' }}>
                          {preset.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Chunk Size Input */}
                {chunkPreset === 'custom' && (
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px dashed var(--border-default, #e2e8f0)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary, #64748b)', whiteSpace: 'nowrap' }}>
                        Enter Custom Size:
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={customValue}
                        onChange={(e) => handleCustomValueChange(e.target.value)}
                        placeholder="e.g. 750"
                        style={{
                          flex: 1,
                          padding: '7px 12px',
                          borderRadius: '8px',
                          border: customError ? '1px solid #ef4444' : '1px solid var(--border-default, #cbd5e1)',
                          backgroundColor: 'var(--bg-surface, #ffffff)',
                          color: 'var(--text-primary, #0f172a)',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      />
                      <select
                        value={customUnit}
                        onChange={(e) => handleCustomUnitChange(e.target.value)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-default, #cbd5e1)',
                          backgroundColor: 'var(--bg-surface, #ffffff)',
                          color: 'var(--text-primary, #0f172a)',
                          fontSize: '13px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="KB">KB</option>
                        <option value="MB">MB</option>
                      </select>
                    </div>

                    {customError && (
                      <div style={{ fontSize: '11.5px', color: '#dc2626', marginTop: '6px', fontWeight: '500' }}>
                        {customError}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Status Banner */}
              {status === 'uploading' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                  borderRadius: '10px',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  marginBottom: '20px'
                }}>
                  <Loader2 size={20} color="#6366f1" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#4f46e5' }}>
                      Processing with C++ Storage Engine...
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#6366f1', marginTop: '2px' }}>
                      {statusMessage}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {errorMsg && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px 16px',
                  backgroundColor: '#fef2f2',
                  borderRadius: '10px',
                  border: '1px solid #fee2e2',
                  marginBottom: '20px',
                  color: '#dc2626'
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>
                    {errorMsg}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={status === 'uploading'}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-default, #cbd5e1)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary, #64748b)',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!isFormValid}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: isFormValid ? '#4f46e5' : '#94a3b8',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    cursor: isFormValid ? 'pointer' : 'not-allowed',
                    boxShadow: isFormValid ? '0 4px 14px rgba(79, 70, 229, 0.35)' : 'none',
                    transition: 'all 0.18s ease'
                  }}
                >
                  {status === 'uploading' ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Chunking with C++...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} strokeWidth={2.4} />
                      <span>Upload & Chunk</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* ==================================================
               STAFF DEMONSTRATION RESULT UI
               ================================================== */
            <div>
              {/* Success Header */}
              <div style={{
                textAlign: 'center',
                padding: '10px 0 16px 0',
                borderBottom: '1px solid var(--border-default, #e2e8f0)'
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px auto'
                }}>
                  <CheckCircle2 size={30} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: '0 0 3px 0' }}>
                  Chunking Completed Successfully!
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary, #64748b)', margin: 0 }}>
                  Processed by <strong>C++ Storage Engine</strong> into configurable binary chunks.
                </p>
              </div>

              {/* File Information Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                margin: '16px 0'
              }}>
                <div style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-primary, #f8fafc)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-default, #e2e8f0)'
                }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #94a3b8)', fontWeight: '700', textTransform: 'uppercase' }}>
                    File Name
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: 'var(--text-primary, #0f172a)',
                    marginTop: '3px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {resultData?.fileName}
                  </div>
                </div>

                <div style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-primary, #f8fafc)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-default, #e2e8f0)'
                }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #94a3b8)', fontWeight: '700', textTransform: 'uppercase' }}>
                    Original Size
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary, #0f172a)', marginTop: '3px' }}>
                    {formatBytes(resultData?.originalSize || resultData?.fileSize || 0)}
                  </div>
                </div>

                <div style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-primary, #f8fafc)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-default, #e2e8f0)'
                }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #94a3b8)', fontWeight: '700', textTransform: 'uppercase' }}>
                    Chunk Size
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#4f46e5', marginTop: '3px' }}>
                    {formatBytes(resultData?.chunkSize || 0)}
                  </div>
                </div>

                <div style={{
                  padding: '10px 12px',
                  backgroundColor: 'rgba(79, 70, 229, 0.08)',
                  borderRadius: '10px',
                  border: '1px solid rgba(79, 70, 229, 0.25)'
                }}>
                  <div style={{ fontSize: '10.5px', color: '#4f46e5', fontWeight: '700', textTransform: 'uppercase' }}>
                    Total Chunks
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#4f46e5', marginTop: '1px' }}>
                    {resultData?.chunkCount}
                  </div>
                </div>
              </div>

              {/* Visual Chunk Partitioning Diagram */}
              <div style={{
                backgroundColor: 'var(--bg-primary, #f8fafc)',
                borderRadius: '12px',
                border: '1px solid var(--border-default, #e2e8f0)',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Cpu size={15} color="#4f46e5" />
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      C++ Storage Engine Chunk Partitioning:
                    </span>
                  </div>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted, #94a3b8)' }}>
                    Click any chunk to view details
                  </span>
                </div>

                {/* Original File Banner */}
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-surface, #ffffff)',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-default, #cbd5e1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '13px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="#6366f1" />
                    <span style={{ fontWeight: '700', color: 'var(--text-primary, #0f172a)' }}>
                      Original File: {resultData?.fileName}
                    </span>
                  </div>
                  <span style={{ fontWeight: '700', color: 'var(--text-secondary, #64748b)', fontFamily: 'monospace' }}>
                    {formatBytes(resultData?.originalSize || resultData?.fileSize || 0)}
                  </span>
                </div>

                {/* Arrow Flow */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  margin: '8px 0',
                  color: '#6366f1',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  <ArrowDown size={16} />
                  <span>Split into {resultData?.chunkCount} binary chunks by C++ storage engine</span>
                  <ArrowDown size={16} />
                </div>

                {/* Chunks Blocks Visualizer */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  maxHeight: '130px',
                  overflowY: 'auto',
                  padding: '4px'
                }}>
                  {resultData?.chunks?.map((chunk, idx) => {
                    const isSelected = selectedChunkIndex === idx;
                    const isLast = idx === resultData.chunks.length - 1;
                    const isPartial = isLast && chunk.size < (resultData.chunkSize || 0);

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedChunkIndex(idx)}
                        style={{
                          flex: '1 1 calc(20% - 6px)',
                          minWidth: '88px',
                          padding: '8px 6px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #4f46e5' : '1px solid var(--border-default, #e2e8f0)',
                          backgroundColor: isSelected
                            ? 'rgba(79, 70, 229, 0.15)'
                            : isPartial
                            ? 'rgba(245, 158, 11, 0.08)'
                            : 'var(--bg-surface, #ffffff)',
                          boxShadow: isSelected ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'none',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{
                          fontSize: '11.5px',
                          fontWeight: '700',
                          color: isSelected ? '#4f46e5' : 'var(--text-primary, #0f172a)'
                        }}>
                          Chunk {chunk.index}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: isSelected ? '#4338ca' : isPartial ? '#d97706' : 'var(--text-secondary, #64748b)',
                          fontFamily: 'monospace',
                          fontWeight: '600',
                          marginTop: '2px'
                        }}>
                          {formatBytes(chunk.size)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chunk Details Card (Selected Chunk) */}
              {selectedChunk && (
                <div style={{
                  backgroundColor: 'var(--bg-surface, #ffffff)',
                  borderRadius: '12px',
                  border: '1px solid #c7d2fe',
                  padding: '14px 16px',
                  marginBottom: '16px',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Info size={15} color="#4f46e5" />
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary, #0f172a)' }}>
                        Chunk Details: #{selectedChunk.index} ({selectedChunk.fileName || selectedChunk.name})
                      </span>
                    </div>
                    <span style={{
                      backgroundColor: '#dcfce7',
                      color: '#16a34a',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '9999px'
                    }}>
                      Status: {selectedChunk.status || 'Created'}
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    fontSize: '12px'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted, #94a3b8)', fontWeight: '500' }}>Chunk File: </span>
                      <strong style={{ color: 'var(--text-primary, #0f172a)', fontFamily: 'monospace' }}>
                        {selectedChunk.fileName || selectedChunk.name}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted, #94a3b8)', fontWeight: '500' }}>Exact Size: </span>
                      <strong style={{ color: 'var(--text-primary, #0f172a)', fontFamily: 'monospace' }}>
                        {formatBytes(selectedChunk.size)} ({selectedChunk.size.toLocaleString()} B)
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted, #94a3b8)', fontWeight: '500' }}>Original File: </span>
                      <strong style={{ color: 'var(--text-primary, #0f172a)' }}>
                        {resultData?.fileName}
                      </strong>
                    </div>
                  </div>

                  {selectedChunk.path && (
                    <div style={{
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border-default, #f1f5f9)',
                      fontSize: '11.5px',
                      color: 'var(--text-secondary, #64748b)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Folder size={13} color="#94a3b8" />
                      <span>Output Path:</span>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-primary, #0f172a)', wordBreak: 'break-all' }}>
                        {selectedChunk.path}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Chunks Table */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: 'var(--text-secondary, #64748b)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>Chunk Index Table:</span>
                  <span>Total {resultData?.chunks?.length || 0} Chunks</span>
                </div>

                <div style={{
                  maxHeight: '140px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-default, #e2e8f0)',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-surface, #ffffff)'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{
                        backgroundColor: 'var(--bg-primary, #f8fafc)',
                        borderBottom: '1px solid var(--border-default, #e2e8f0)',
                        color: 'var(--text-secondary, #64748b)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1
                      }}>
                        <th style={{ padding: '8px 12px', fontWeight: '700', width: '50px' }}>#</th>
                        <th style={{ padding: '8px 12px', fontWeight: '700' }}>Chunk Filename</th>
                        <th style={{ padding: '8px 12px', fontWeight: '700' }}>Size</th>
                        <th style={{ padding: '8px 12px', fontWeight: '700', textAlign: 'right' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultData?.chunks?.map((chunk, idx) => {
                        const isSelected = selectedChunkIndex === idx;
                        return (
                          <tr
                            key={idx}
                            onClick={() => setSelectedChunkIndex(idx)}
                            style={{
                              borderBottom: idx < resultData.chunks.length - 1 ? '1px solid var(--border-default, #f1f5f9)' : 'none',
                              backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                              cursor: 'pointer'
                            }}
                          >
                            <td style={{ padding: '7px 12px', fontWeight: '600', color: 'var(--text-muted, #94a3b8)' }}>
                              {chunk.index}
                            </td>
                            <td style={{ padding: '7px 12px', fontWeight: '600', color: isSelected ? '#4f46e5' : 'var(--text-primary, #0f172a)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Layers size={13} color="#6366f1" />
                                <span>{chunk.fileName || chunk.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '7px 12px', fontFamily: 'monospace', color: 'var(--text-secondary, #64748b)' }}>
                              {formatBytes(chunk.size)}
                            </td>
                            <td style={{ padding: '7px 12px', textAlign: 'right' }}>
                              <span style={{
                                backgroundColor: '#dcfce7',
                                color: '#16a34a',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                {chunk.status || 'Created'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons for Demonstration Flow */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-default, #cbd5e1)',
                    backgroundColor: 'transparent',
                    color: '#4f46e5',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Test Different Chunk Size / File</span>
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: '8px 22px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#4f46e5',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
