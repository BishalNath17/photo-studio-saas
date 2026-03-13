import React, { useEffect, useState, useRef } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { 
  Crop, RotateCw, RotateCcw, ZoomIn, ZoomOut, 
  FlipHorizontal, FlipVertical, SlidersHorizontal, Check, RefreshCw, Sun, Droplet, Contrast as ContrastIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Step3Edit = ({ files, setEditedImage, onNext }) => {
  const cropperRef = useRef(null);
  const [activeTab, setActiveTab] = useState('crop');
  
  const [imageSrc, setImageSrc] = useState(null);

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  useEffect(() => {
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(files[0]);
    }
  }, [files]);

  const handleZoom = (ratio) => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) cropper.zoom(ratio);
  };

  const handleRotate = (degree) => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) cropper.rotate(degree);
  };

  const handleFlipHorizontal = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const currentScaleX = cropper.getData().scaleX || 1;
      cropper.scaleX(-currentScaleX);
    }
  };

  const handleFlipVertical = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const currentScaleY = cropper.getData().scaleY || 1;
      cropper.scaleY(-currentScaleY);
    }
  };

  const resetAll = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.reset();
    }
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    toast('Image reset to original', { icon: '🔄' });
  };

  const applyCropAndFinish = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return toast.error("Editor not initialized.");

    try {
      // Safely extract the cropped rectangle
      const croppedCanvas = cropper.getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      if (!croppedCanvas) {
        return toast.error("Failed to crop. Please adjust the selection box.");
      }

      // Draw onto a new Canvas context to bake CSS filters in
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = croppedCanvas.width;
      finalCanvas.height = croppedCanvas.height;
      const ctx = finalCanvas.getContext('2d');

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.drawImage(croppedCanvas, 0, 0);

      // Force high quality jpeg export to prevent silent mobile memory crashes
      const dataUrl = finalCanvas.toDataURL('image/jpeg', 0.95);
      setEditedImage(dataUrl);
      toast.success("Crop applied!");
      if (onNext) onNext();
      
    } catch (e) {
      console.error(e);
      toast.error("Failed to process image data.");
    }
  };

  if (!imageSrc) {
    return <div className="text-saas-muted text-center py-20">Loading image...</div>;
  }

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 h-full min-h-[500px] md:h-[650px] overflow-hidden">
      
      {/* Sidebar Toolset */}
      <div className="w-full md:w-72 bg-saas-card flex flex-col gap-4 p-4 md:p-5 border border-saas-border rounded-xl shrink-0 overflow-y-auto z-10">
        <h3 className="text-white font-medium text-sm md:text-xs uppercase tracking-wider hidden md:block">Editor Tools</h3>
        
        {/* Main Tabs */}
        <div className="flex gap-2 bg-saas-bg p-1.5 rounded-lg border border-saas-border shrink-0">
          <button 
            onClick={() => setActiveTab('crop')} 
            className={`flex-1 py-2.5 px-3 text-xs md:text-sm font-semibold rounded flex items-center justify-center gap-2 transition-colors ${activeTab === 'crop' ? 'bg-saas-neon text-white shadow' : 'text-saas-muted hover:text-white'}`}
          >
            <Crop size={16} /> Transform
          </button>
          <button 
            onClick={() => setActiveTab('adjust')} 
            className={`flex-1 py-2.5 px-3 text-xs md:text-sm font-semibold rounded flex items-center justify-center gap-2 transition-colors ${activeTab === 'adjust' ? 'bg-saas-neon text-white shadow' : 'text-saas-muted hover:text-white'}`}
          >
            <SlidersHorizontal size={16} /> Adjust
          </button>
        </div>

        {/* Tab Content: CROP & TRANSFORM */}
        {activeTab === 'crop' && (
          <div className="space-y-5 animate-in fade-in flex-1">
            {/* Rotate & Flip */}
            <div>
               <h4 className="text-[11px] font-bold text-saas-muted uppercase tracking-wider mb-2">Rotate & Flip</h4>
               <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => handleRotate(-90)} className="btn-secondary py-3 text-xs flex justify-center items-center gap-2"><RotateCcw size={16}/> -90°</button>
                 <button onClick={() => handleRotate(90)} className="btn-secondary py-3 text-xs flex justify-center items-center gap-2"><RotateCw size={16}/> +90°</button>
                 <button onClick={handleFlipHorizontal} className="btn-secondary py-3 text-xs flex justify-center items-center gap-2"><FlipHorizontal size={16}/> Flip H</button>
                 <button onClick={handleFlipVertical} className="btn-secondary py-3 text-xs flex justify-center items-center gap-2"><FlipVertical size={16}/> Flip V</button>
               </div>
            </div>
            
            {/* Zoom */}
            <div>
               <h4 className="text-[11px] font-bold text-saas-muted uppercase tracking-wider mb-2">Zoom</h4>
               <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => handleZoom(0.1)} className="btn-secondary py-3 text-xs flex justify-center items-center gap-2"><ZoomIn size={16}/> Zoom In</button>
                 <button onClick={() => handleZoom(-0.1)} className="btn-secondary py-3 text-xs flex justify-center items-center gap-2"><ZoomOut size={16}/> Zoom Out</button>
               </div>
            </div>
            
            <p className="text-xs text-saas-muted leading-relaxed bg-saas-bg p-3 rounded-lg border border-saas-border hidden md:block mt-auto">
              <b>Tip:</b> Drag outside the crop box to pan the entire image smoothly.
            </p>
          </div>
        )}

        {/* Tab Content: COLOR ADJUSTMENTS */}
        {activeTab === 'adjust' && (
          <div className="space-y-6 animate-in fade-in flex-1">
             <div>
                <div className="flex justify-between items-center mb-3 text-xs font-semibold text-saas-muted uppercase">
                  <span className="flex items-center gap-2"><Sun size={14}/> Brightness</span>
                  <span className="text-white bg-saas-bg px-2 py-0.5 rounded">{brightness}%</span>
                </div>
                <input type="range" min="0" max="200" step="5" value={brightness} onChange={e => setBrightness(Number(e.target.value))} className="w-full accent-saas-neon h-2 rounded-lg appearance-none bg-saas-bg outline-none" />
             </div>
             <div>
                <div className="flex justify-between items-center mb-3 text-xs font-semibold text-saas-muted uppercase">
                  <span className="flex items-center gap-2"><ContrastIcon size={14}/> Contrast</span>
                  <span className="text-white bg-saas-bg px-2 py-0.5 rounded">{contrast}%</span>
                </div>
                <input type="range" min="0" max="200" step="5" value={contrast} onChange={e => setContrast(Number(e.target.value))} className="w-full accent-saas-neon h-2 rounded-lg appearance-none bg-saas-bg outline-none" />
             </div>
             <div>
                <div className="flex justify-between items-center mb-3 text-xs font-semibold text-saas-muted uppercase">
                  <span className="flex items-center gap-2"><Droplet size={14}/> Saturation</span>
                  <span className="text-white bg-saas-bg px-2 py-0.5 rounded">{saturation}%</span>
                </div>
                <input type="range" min="0" max="200" step="5" value={saturation} onChange={e => setSaturation(Number(e.target.value))} className="w-full accent-saas-neon h-2 rounded-lg appearance-none bg-saas-bg outline-none" />
             </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto pt-4 grid grid-cols-2 gap-3 shrink-0">
           <button onClick={resetAll} className="btn-secondary py-3 text-sm text-saas-text hover:text-white flex items-center justify-center gap-2 transition-all">
             <RefreshCw size={18} /> Reset
           </button>
           <button onClick={applyCropAndFinish} className="btn-primary py-3 flex items-center justify-center gap-2 text-sm font-bold shadow-xl shadow-saas-neon/20 hover:scale-105 active:scale-95 transition-all outline outline-4 outline-black/20">
             <Check size={18} /> Done
           </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 relative h-[400px] md:h-auto border border-saas-border rounded-xl overflow-hidden shadow-inner bg-black">
        <Cropper
          src={imageSrc}
          ref={cropperRef}
          style={{ 
            height: '100%', 
            width: '100%',
            filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
          }}
          initialAspectRatio={NaN}
          guides={true}
          viewMode={1}
          dragMode="move"
          background={false}
          responsive={true}
          autoCropArea={1}
          checkOrientation={true}
          minCropBoxHeight={50}
          minCropBoxWidth={50}
        />
        
        {/* Mobile Help Text overlay */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur text-white/90 font-medium text-[10px] px-3 py-1.5 rounded-md md:hidden pointer-events-none tracking-wide">
          Drag image to pan • Drag box to crop
        </div>
      </div>
    </div>
  );
};

export default Step3Edit;
