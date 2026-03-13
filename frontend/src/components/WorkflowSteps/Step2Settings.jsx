import React from 'react';
import { Settings2, Image as ImageIcon, FileText, Maximize, Crop, FileDown, Settings } from 'lucide-react';

const Step2Settings = ({ settings, setSettings, presets }) => {
  const update = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const applyPreset = (preset) => {
    setSettings((prev) => ({
      ...prev,
      resolutionMode: 'resize', // Or whatever makes sense for a preset
      width: preset.width,
      height: preset.height,
      unit: preset.unit,
      dpi: preset.dpi,
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      
      {/* Quick Presets for Government & Standard Prints */}
      <div className="bg-saas-card/50 rounded-xl p-5 border border-saas-neon/30">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
          <Settings2 size={18} className="text-saas-neon" /> Standard Presets
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {presets.map((p) => (
            <button key={p.id} onClick={() => applyPreset(p)} className="btn-secondary text-sm py-2 px-4 shadow-md hover:bg-saas-neon/20 hover:text-saas-neon hover:border-saas-neon transition-all">
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Output Settings */}
        <div className="space-y-6">
          
          {/* Export Type */}
          <div className="bg-saas-bg rounded-lg p-5 border border-saas-border shadow-sm">
            <h4 className="text-saas-muted text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileDown size={14} /> Export Type
            </h4>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${settings.exportType === 'image' ? 'bg-saas-neon/15 border-saas-neon text-white' : 'border-saas-border text-saas-muted hover:bg-white/5'}`}>
                <input type="radio" name="exportType" value="image" checked={settings.exportType === 'image'} onChange={(e) => update('exportType', e.target.value)} className="hidden" />
                <ImageIcon size={18} /> Image
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${settings.exportType === 'pdf' ? 'bg-saas-neon/15 border-saas-neon text-white' : 'border-saas-border text-saas-muted hover:bg-white/5'}`}>
                <input type="radio" name="exportType" value="pdf" checked={settings.exportType === 'pdf'} onChange={(e) => update('exportType', e.target.value)} className="hidden" />
                <FileText size={18} /> PDF Document
              </label>
            </div>
          </div>

          {/* Format & Compression */}
          <div className="bg-saas-bg rounded-lg p-5 border border-saas-border shadow-sm">
            <h4 className="text-saas-muted text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings size={14} /> Quality & Format
            </h4>
            <div className="space-y-5">
              <div>
                <label className="block text-xs text-saas-muted mb-2 font-medium">File Format</label>
                <div className="flex gap-2">
                  {['jpg', 'jpeg', 'png'].map(fmt => (
                     <button
                       key={fmt}
                       onClick={() => update('imageFormat', fmt)}
                       className={`flex-1 py-2 rounded text-sm uppercase font-medium transition-colors border ${settings.imageFormat === fmt ? 'bg-saas-card border-saas-neon text-white' : 'bg-transparent border-saas-border text-saas-muted hover:text-white'}`}
                     >
                       {fmt}
                     </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-saas-muted font-medium">Compression Control</label>
                  <span className="text-xs font-bold text-saas-neon">{settings.compression}% Quality</span>
                </div>
                <input type="range" min="10" max="100" step="5" value={settings.compression} onChange={(e) => update('compression', Number(e.target.value))} className="w-full accent-saas-neon h-1.5 bg-saas-border rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
          </div>
          
          {/* File Size Limitation */}
          <div className="bg-saas-bg rounded-lg p-5 border border-saas-border shadow-sm">
            <h4 className="text-saas-muted text-xs font-semibold uppercase tracking-wider mb-4">File Size Limit</h4>
            <div className="flex items-center gap-4 mb-3">
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input type="radio" checked={settings.sizeLimitType === 'default'} onChange={() => update('sizeLimitType', 'default')} className="accent-saas-neon" /> Default
              </label>
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input type="radio" checked={settings.sizeLimitType === 'limit'} onChange={() => update('sizeLimitType', 'limit')} className="accent-saas-neon" /> Target Size
              </label>
            </div>
            
            {settings.sizeLimitType === 'limit' && (
              <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-2">
                <input type="number" value={settings.sizeLimitValue} onChange={(e) => update('sizeLimitValue', e.target.value)} placeholder="e.g. 500" className="input-field flex-1" />
                <select value={settings.sizeLimitUnit} onChange={(e) => update('sizeLimitUnit', e.target.value)} className="input-field w-24">
                  <option value="kb">KB</option>
                  <option value="mb">MB</option>
                </select>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Resolution & Layout */}
        <div className="space-y-6">
          
          {/* Resolution Engine */}
          <div className="bg-saas-bg rounded-lg p-5 border border-saas-border shadow-sm">
            <h4 className="text-saas-muted text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Crop size={14} /> Resolution Engine
            </h4>
            
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { id: 'original', label: 'Original Size' },
                { id: 'resize', label: 'Resize' },
                { id: 'crop_resize', label: 'Crop & Resize' },
                { id: 'crop_only', label: 'Crop Only' }
              ].map(mode => (
                <button
                   key={mode.id}
                   onClick={() => update('resolutionMode', mode.id)}
                   className={`p-2.5 rounded-lg text-sm transition-all border ${settings.resolutionMode === mode.id ? 'bg-saas-card border-emerald-500 text-white shadow-md' : 'border-saas-border text-saas-muted hover:border-saas-muted hover:text-white'}`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {settings.resolutionMode !== 'original' && (
              <div className="grid grid-cols-3 gap-3 animate-in fade-in">
                <div>
                  <label className="block text-xs text-saas-muted mb-1 font-medium">Width</label>
                  <input type="number" value={settings.width} onChange={(e) => update('width', e.target.value)} className="input-field py-1.5" placeholder="W" />
                </div>
                <div>
                  <label className="block text-xs text-saas-muted mb-1 font-medium">Height</label>
                  <input type="number" value={settings.height} onChange={(e) => update('height', e.target.value)} className="input-field py-1.5" placeholder="H" />
                </div>
                <div>
                  <label className="block text-xs text-saas-muted mb-1 font-medium">Unit</label>
                  <select value={settings.unit} onChange={(e) => update('unit', e.target.value)} className="input-field py-1.5 px-2">
                    <option value="px">px</option>
                    <option value="in">in</option>
                    <option value="cm">cm</option>
                    <option value="mm">mm</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* DPI Print Resolution */}
          <div className="bg-saas-bg rounded-lg p-5 border border-saas-border shadow-sm">
            <h4 className="text-saas-muted text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Maximize size={14} /> Print DPI Options
            </h4>
            <div className="flex gap-3">
              {[
                { val: 72, label: '72 (Web)' },
                { val: 150, label: '150 (Draft)' },
                { val: 300, label: '300 (Pro)' }
              ].map(d => (
                <button
                  key={d.val}
                  onClick={() => update('dpi', d.val)}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${settings.dpi === d.val ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-transparent border-saas-border text-saas-muted hover:text-white'}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            {settings.dpi < 150 && (
              <p className="text-[10px] text-amber-500 mt-2 italic">*72 DPI may print blurry. Use 300 DPI for standard photo prints.</p>
            )}
          </div>

          {/* Generic Background */}
          <div className="bg-saas-bg rounded-lg p-5 border border-saas-border shadow-sm flex items-center justify-between">
            <div>
              <h4 className="text-white text-sm font-medium">Fallback Background</h4>
              <p className="text-xs text-saas-muted mt-0.5">Used if image is transparent</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="color" value={settings.backgroundColor} onChange={(e) => update('backgroundColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-saas-border bg-transparent p-0 overflow-hidden" />
              <div className="px-3 py-1.5 bg-saas-card border border-saas-border rounded text-xs font-mono text-white">
                {settings.backgroundColor.toUpperCase()}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Step2Settings;
