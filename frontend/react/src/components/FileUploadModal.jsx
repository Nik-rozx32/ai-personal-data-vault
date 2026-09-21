import React, { useState, useRef } from 'react';
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
  Sparkles,
  ArrowRight,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const FileUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const { token, currentUser } = useAuth();

  const [selectedFile, setSelectedFile] = useState(null);
  const [chunkSizeMB, setChunkSizeMB] = useState(1);
  const [status, setStatus] = useState('idle'); // 'idle' | 'uploading' | 'processing' | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resultData, setResultData] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg('');
      setStatus('idle');
      setResultData(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setErrorMsg('');
      setStatus('idle');
      setResultData(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select a file to upload.');
      return;
    }

    setStatus('uploading');
    setStatusMessage('Uploading file to Node.js backend...');
    setErrorMsg('');
    setResultData(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('chunkSize', String(chunkSizeMB * 1024 * 1024));

    try {
      // Small simulated status step for UI clarity
      setTimeout(() => {
        setStatusMessage('Executing C++ Storage Engine chunking...');
      }, 500);

      const effectiveToken = token || currentUser?.token || localStorage.getItem('datavault_jwt_token');

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          ...(effectiveToken ? { 'Authorization': `Bearer ${effectiveToken}` } : {})
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to upload and chunk file');
      }

      setStatus('success');
      setStatusMessage('Upload and C++ Chunking Complete!');
      setResultData(data);

      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (err) {
      console.error('[Upload Error]:', err);
      setStatus('error');
      setErrorMsg(err.message || 'An error occurred during file chunking.');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setStatus('idle');
    setStatusMessage('');
    setErrorMsg('');
    setResultData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(6px)',
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
          maxWidth: '560px',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--border-default, #e2e8f0)',
          overflow: 'hidden',
          animation: 'modalSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(79, 70, 229, 0.12)',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Upload size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary, #0f172a)', margin: 0 }}>
                Upload & Chunk File
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary, #64748b)', margin: 0 }}>
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
                  border: '2px dashed var(--border-focus, #6366f1)',
                  borderRadius: '14px',
                  backgroundColor: selectedFile ? 'rgba(99, 102, 241, 0.04)' : 'var(--bg-primary, #f8fafc)',
                  padding: '32px 20px',
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
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#4f46e5',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                    }}>
                      <FileText size={24} />
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary, #0f172a)' }}>
                      {selectedFile.name}
                    </span>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-secondary, #64748b)' }}>
                      {formatBytes(selectedFile.size)} • Click or drop another file to replace
                    </span>
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
                    <span style={{ fontSize: '14.5px', fontWeight: '600', color: 'var(--text-primary, #0f172a)' }}>
                      Choose a file or drag & drop here
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)' }}>
                      Supports PDF, DOCX, ZIP, MP4, and binaries up to 200 MB
                    </span>
                  </div>
                )}
              </div>

              {/* Chunk Size Configuration */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-primary, #f8fafc)',
                borderRadius: '10px',
                border: '1px solid var(--border-default, #e2e8f0)',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={16} color="#6366f1" />
                  <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary, #0f172a)' }}>
                    C++ Storage Engine Chunk Size:
                  </span>
                </div>
                <select
                  value={chunkSizeMB}
                  onChange={(e) => setChunkSizeMB(Number(e.target.value))}
                  disabled={status === 'uploading'}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-default, #cbd5e1)',
                    backgroundColor: 'var(--bg-surface, #ffffff)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <option value={0.5}>512 KB per chunk</option>
                  <option value={1}>1 MB per chunk (Default)</option>
                  <option value={2}>2 MB per chunk</option>
                  <option value={5}>5 MB per chunk</option>
                </select>
              </div>

              {/* Status or Error Banner */}
              {status === 'uploading' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                  borderRadius: '10px',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  marginBottom: '20px'
                }}>
                  <Loader2 size={18} className="animate-spin" color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#4f46e5' }}>
                      Processing file...
                    </div>
                    <div style={{ fontSize: '12px', color: '#6366f1' }}>
                      {statusMessage}
                    </div>
                  </div>
                </div>
              )}

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
                  disabled={!selectedFile || status === 'uploading'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: selectedFile && status !== 'uploading' ? '#4f46e5' : '#94a3b8',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    cursor: selectedFile && status !== 'uploading' ? 'pointer' : 'not-allowed',
                    boxShadow: selectedFile && status !== 'uploading' ? '0 4px 12px rgba(79, 70, 229, 0.35)' : 'none'
                  }}
                >
                  {status === 'uploading' ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Creating chunks...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Upload & Chunk</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Success View with Chunk Details */
            <div>
              <div style={{
                textAlign: 'center',
                padding: '16px 0 20px 0',
                borderBottom: '1px solid var(--border-default, #e2e8f0)'
              }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto'
                }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary, #0f172a)', margin: '0 0 4px 0' }}>
                  Upload Successful!
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary, #64748b)', margin: 0 }}>
                  File processed by C++ Storage Engine and split into chunks.
                </p>
              </div>

              {/* Summary Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                margin: '18px 0'
              }}>
                <div style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-primary, #f8fafc)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-default, #e2e8f0)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)', fontWeight: '600', textTransform: 'uppercase' }}>
                    Original File
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary, #0f172a)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {resultData?.fileName}
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-primary, #f8fafc)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-default, #e2e8f0)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)', fontWeight: '600', textTransform: 'uppercase' }}>
                    File Size
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary, #0f172a)', marginTop: '4px' }}>
                    {formatBytes(resultData?.fileSize || 0)}
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  backgroundColor: 'rgba(79, 70, 229, 0.08)',
                  borderRadius: '10px',
                  border: '1px solid rgba(79, 70, 229, 0.2)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: '#4f46e5', fontWeight: '600', textTransform: 'uppercase' }}>
                    Chunks Created
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#4f46e5', marginTop: '2px' }}>
                    {resultData?.chunkCount}
                  </div>
                </div>
              </div>

              {/* Chunks List */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: 'var(--text-secondary, #64748b)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '8px'
                }}>
                  Generated Chunks:
                </div>
                <div style={{
                  maxHeight: '140px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-default, #e2e8f0)',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-surface, #ffffff)'
                }}>
                  {resultData?.chunks?.map((chunk, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 14px',
                        borderBottom: idx < resultData.chunks.length - 1 ? '1px solid var(--border-default, #f1f5f9)' : 'none',
                        fontSize: '12.5px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layers size={14} color="#6366f1" />
                        <span style={{ fontWeight: '600', color: 'var(--text-primary, #0f172a)' }}>
                          {chunk.name}
                        </span>
                      </div>
                      <span style={{ color: 'var(--text-secondary, #64748b)', fontFamily: 'monospace' }}>
                        {formatBytes(chunk.size)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Done Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-default, #cbd5e1)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary, #64748b)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Upload Another File
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
