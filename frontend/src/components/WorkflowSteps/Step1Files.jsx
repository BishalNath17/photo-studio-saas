import React, { useCallback } from 'react';
import { Upload, X, FileImage, FileText } from 'lucide-react';

const Step1Files = ({ files, setFiles }) => {
  const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  const handleFiles = useCallback((newFiles) => {
    const valid = Array.from(newFiles).filter((f) => acceptedTypes.includes(f.type));
    setFiles((prev) => [...prev, ...valid]);
  }, [setFiles]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = (e) => e.preventDefault();

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="w-full max-w-xl border-2 border-dashed border-saas-border rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-saas-neon/50 hover:bg-saas-neon/[0.02] transition-all duration-300 group"
        onClick={() => document.getElementById('file-input').click()}
      >
        <div className="w-16 h-16 rounded-2xl bg-saas-neon/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Upload className="text-saas-neon" size={28} />
        </div>
        <p className="text-white font-medium text-lg mb-1">Drop your photos here</p>
        <p className="text-saas-muted text-sm">or click to browse · JPG, PNG, WEBP, PDF</p>
        <input
          id="file-input"
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="w-full max-w-xl mt-6">
          <h4 className="text-white font-medium mb-3 flex items-center justify-between">
            <span>Selected Files ({files.length})</span>
            <button onClick={() => setFiles([])} className="text-xs text-red-400 hover:text-red-300 transition-colors">Clear All</button>
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-saas-bg border border-saas-border rounded-lg px-4 py-3 group">
                {file.type === 'application/pdf'
                  ? <FileText size={18} className="text-red-400 shrink-0" />
                  : <FileImage size={18} className="text-blue-400 shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-saas-text truncate">{file.name}</p>
                  <p className="text-xs text-saas-muted">{formatSize(file.size)}</p>
                </div>
                <button onClick={() => removeFile(idx)} className="p-1 text-saas-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1Files;
