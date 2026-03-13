import React, { useState } from 'react';
import { Download, FileText, Share2, Printer, LayoutGrid, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Step4Generate = ({ files, settings, editedImage }) => {
  const [layoutMode, setLayoutMode] = useState('single');
  const [isGenerating, setIsGenerating] = useState(false);
  const [cutMarks, setCutMarks] = useState(true);
  const [watermark, setWatermark] = useState(false);
  
  const safeFiles = files || [];
  const safeSettings = settings || { imageFormat: 'jpg', compression: 100, dpi: 300, backgroundColor: '#FFFFFF', exportType: 'image' };

  const getSourceImage = () => {
    if (editedImage) return editedImage;
    if (safeFiles.length > 0) return URL.createObjectURL(safeFiles[0]);
    return null;
  };

  const activeImageSource = getSourceImage();

  // Utility to generate a compiled canvas based on settings BEFORE downloading
  const generateFinalCanvas = async () => {
    return new Promise((resolve, reject) => {
      if (!activeImageSource) return reject("No image");
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let targetWidth = img.width;
        let targetHeight = img.height;
        
        // Resolution Settings Handling
        if (safeSettings.resolutionMode === 'resize' || safeSettings.resolutionMode === 'crop_resize') {
            if (safeSettings.width) targetWidth = Number(safeSettings.width);
            if (safeSettings.height) targetHeight = Number(safeSettings.height);
        }
        
        // Layout grid multiplier
        const cols = layoutMode === 'grid' ? 4 : 1;
        const rows = layoutMode === 'grid' ? 2 : 1;
        
        canvas.width = targetWidth * cols;
        canvas.height = targetHeight * rows;
        
        // Apply Background
        ctx.fillStyle = safeSettings.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Print Watermark / Cut Marks
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = c * targetWidth;
                const y = r * targetHeight;
                ctx.drawImage(img, x, y, targetWidth, targetHeight);
                
                if (cutMarks && layoutMode === 'grid') {
                    ctx.strokeStyle = '#999';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, targetWidth, targetHeight);
                }
            }
        }
        
        if (watermark) {
          ctx.font = `${Math.floor(canvas.height * 0.1)}px Arial`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.textAlign = "center";
          ctx.fillText("PhotoStudio Proof", canvas.width/2, canvas.height/2);
        }
        
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = activeImageSource;
    });
  };

  const handleDownload = async () => {
    if (!activeImageSource) return toast.error("No image available to download.");
    
    setIsGenerating(true);
    
    if (safeSettings.exportType === 'pdf') {
      toast.success("For PDF export, use the Print dialog and select 'Save to PDF'");
      handlePrint();
      setIsGenerating(false);
      return;
    }

    try {
      const canvas = await generateFinalCanvas();
      
      // Handle compression
      const mimeType = safeSettings.imageFormat === 'png' ? 'image/png' : 'image/jpeg';
      const quality = safeSettings.compression / 100;
      const dataUri = canvas.toDataURL(mimeType, quality);
      
      const link = document.createElement("a");
      link.href = dataUri;
      link.download = `photo-studio-edited-${Date.now()}.${safeSettings.imageFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloaded ${safeSettings.imageFormat.toUpperCase()} successfully!`);
    } catch (e) {
      toast.error('Download failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    if (!activeImageSource) return toast.error("No image available to print.");
    setIsGenerating(true);
    
    try {
      const canvas = await generateFinalCanvas();
      const printUrl = canvas.toDataURL('image/jpeg', 1.0);
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
         toast.error("Please allow pop-ups to use the print feature.");
         return;
      }
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Document - Photo Studio</title>
            <style>
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
              img { max-width: 100%; max-height: 100vh; object-fit: contain; }
              @media print {
                @page { margin: 0; }
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <img src="${printUrl}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch {
      toast.error('Print generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!activeImageSource) return toast.error("No image available to share.");

    try {
      if (navigator.share) {
        const canvas = await generateFinalCanvas();
        const mimeType = safeSettings.imageFormat === 'png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(async (blob) => {
          if(!blob) return toast.error("Blob gen failed");
          const file = new File([blob], `photo-${Date.now()}.${safeSettings.imageFormat}`, { type: blob.type });
          
          await navigator.share({
            title: 'My Photo Studio Output',
            text: 'Here is my edited photo!',
            files: [file]
          });
        }, mimeType, safeSettings.compression / 100);
      } else {
        toast('Native sharing not supported on this browser. Downloading instead.', { icon: 'ℹ️' });
        handleDownload();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share Error:', err);
        toast.error('Sharing failed.');
      }
    }
  };

  const layouts = [
    { id: 'single', icon: FileText, name: 'Single Image' },
    { id: 'grid', icon: LayoutGrid, name: 'Grid (Passport)' },
    { id: 'a4', icon: FileText, name: 'A4 Photo Sheet' },
  ];

  return (
    <div className="w-full flex flex-col md:flex-row gap-6">
      {/* Sidebar Controls */}
      <div className="w-full md:w-56 space-y-5 shrink-0 z-10">
        <div className="bg-saas-card border border-saas-border rounded-xl p-4">
          <h3 className="text-white font-medium text-xs uppercase tracking-wider mb-4">Print Layout</h3>
          <div className="space-y-2">
            {layouts.map((l) => {
              const Icon = l.icon;
              return (
                <button
                  key={l.id}
                  onClick={() => setLayoutMode(l.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    layoutMode === l.id
                      ? 'bg-saas-neon/15 text-saas-neon border border-saas-neon/40 shadow-sm'
                      : 'text-saas-muted hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon size={16} /> {l.name}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="bg-saas-card border border-saas-border rounded-xl p-4">
          <h3 className="text-white font-medium text-xs uppercase tracking-wider mb-4">Options</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-saas-muted hover:text-white cursor-pointer transition-colors">
              <input type="checkbox" checked={cutMarks} onChange={() => setCutMarks(!cutMarks)} className="accent-saas-neon w-4 h-4" /> 
              Print Cut Marks
            </label>
            <label className="flex items-center gap-3 text-sm text-saas-muted hover:text-white cursor-pointer transition-colors">
              <input type="checkbox" checked={watermark} onChange={() => setWatermark(!watermark)} className="accent-saas-neon w-4 h-4" /> 
              Draft Watermark
            </label>
          </div>
        </div>
      </div>

      {/* Preview Map */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className={`bg-gray-200 shadow-2xl rounded-sm flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
          layoutMode === 'a4' ? 'w-[210px] h-[297px] md:w-[360px] md:h-[508px]' :
          layoutMode === 'grid' ? 'w-[300px] h-[200px] md:w-[420px] md:h-[280px] bg-white' :
          'w-[280px] h-[280px] md:w-[360px] md:h-[360px]'
        }`} style={{ backgroundColor: safeSettings.backgroundColor }}>
          {activeImageSource ? (
            <img 
              src={activeImageSource} 
              alt="Generated Preview" 
              className={`w-full h-full object-contain ${layoutMode === 'grid' ? 'grid grid-cols-4 grid-rows-2 opacity-0' : 'p-2'}`}
              style={layoutMode === 'grid' ? { opacity: 0 } : {}}
            />
          ) : (
            <div className="text-gray-400 text-sm flex flex-col items-center">
              <AlertTriangle className="text-amber-500 mb-2" size={28} />
              No configured image
            </div>
          )}
          
          {layoutMode === 'grid' && activeImageSource && (
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 p-3 gap-0.5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`flex items-center justify-center ${cutMarks ? 'border border-dashed border-gray-400' : ''}`}>
                  <img src={activeImageSource} alt="" className="w-full h-full object-contain" />
                  {watermark && <span className="absolute text-[8px] text-black/30 font-bold rotate-45 transform">PROOF</span>}
                </div>
              ))}
            </div>
          )}
          
          {watermark && layoutMode !== 'grid' && activeImageSource && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <span className="text-4xl text-black/20 font-bold rotate-45 transform">PROOF</span>
             </div>
          )}
        </div>

        {/* Global Action Engine */}
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          <button onClick={handleDownload} disabled={isGenerating || !activeImageSource} className="btn-primary btn-hover-glow flex items-center gap-2 min-w-[200px] justify-center py-3 text-sm shadow-xl shadow-saas-neon/20">
            {isGenerating ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Compiling...</>
            ) : (
              <><Download size={18} /> Download {safeSettings.exportType === 'pdf' ? 'PDF' : safeSettings.imageFormat.toUpperCase()}</>
            )}
          </button>
          <button onClick={handlePrint} disabled={!activeImageSource} className="btn-secondary btn-hover-glow flex items-center gap-2 px-6 py-3"><Printer size={18} /> Print Sheet</button>
          <button onClick={handleShare} disabled={!activeImageSource} className="btn-secondary btn-hover-glow flex items-center gap-2 px-6 py-3"><Share2 size={18} /> Share</button>
        </div>

        {safeSettings.dpi < 150 && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-lg flex items-start gap-3 max-w-lg text-sm mt-2">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Web Output Selected</p>
              <p className="text-[11px] opacity-80 mt-0.5">{safeSettings.dpi} DPI is active. Switch to 300 DPI in Settings for physical prints to ensure sharpness.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step4Generate;
