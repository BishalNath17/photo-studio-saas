import React, { useState } from 'react';
import Step1Files from '../components/WorkflowSteps/Step1Files';
import Step2Settings from '../components/WorkflowSteps/Step2Settings';
import Step3Edit from '../components/WorkflowSteps/Step3Edit';
import Step4Generate from '../components/WorkflowSteps/Step4Generate';

const STEPS = ['Files', 'Settings', 'Edit', 'Generate'];

const StudioPage = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [editedImage, setEditedImage] = useState(null);
  const [settings, setSettings] = useState({
    exportType: 'image',
    resolutionMode: 'original',
    width: '', height: '', unit: 'px',
    sizeLimitType: 'default',
    sizeLimitValue: '', sizeLimitUnit: 'kb',
    imageFormat: 'jpg',
    compression: 100,
    dpi: 300,
    backgroundColor: '#FFFFFF',
  });

  const presets = [
    { id: 'passport', name: 'Passport (35x45mm)', width: 35, height: 45, unit: 'mm', dpi: 300 },
    { id: 'aadhaar', name: 'Aadhaar (CR80)', width: 54, height: 86, unit: 'mm', dpi: 300 },
    { id: 'pan', name: 'PAN Card', width: 54, height: 86, unit: 'mm', dpi: 300 },
    { id: 'visa', name: 'Visa (2x2in)', width: 2, height: 2, unit: 'in', dpi: 300 },
    { id: 'print4x6', name: '4x6 Print', width: 4, height: 6, unit: 'in', dpi: 300 },
    { id: 'print5x7', name: '5x7 Print', width: 5, height: 7, unit: 'in', dpi: 300 },
  ];

  const renderStep = () => {
    switch (activeStep) {
      case 1: return <Step1Files files={files} setFiles={setFiles} />;
      case 2: return <Step2Settings settings={settings} setSettings={setSettings} presets={presets} />;
      case 3: return <Step3Edit files={files} setEditedImage={setEditedImage} onNext={() => setActiveStep(4)} />;
      case 4: return <Step4Generate files={files} settings={settings} editedImage={editedImage} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Step Tracker */}
      <div className="bg-saas-card border-b border-saas-border px-4 py-4">
        <div className="flex items-center justify-center gap-1 sm:gap-2 max-w-3xl mx-auto overflow-x-auto">
          {STEPS.map((step, idx) => {
            const num = idx + 1;
            const isActive = num === activeStep;
            const isDone = num < activeStep;
            return (
              <React.Fragment key={step}>
                <button
                  onClick={() => setActiveStep(num)}
                  className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                    isActive ? 'scale-105' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    isActive ? 'bg-saas-neon/20 border-saas-neon text-saas-neon' :
                    isDone ? 'bg-saas-neon border-saas-neon text-white' :
                    'bg-saas-bg border-saas-border text-saas-muted'
                  }`}>
                    {isDone ? '✓' : num}
                  </div>
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${
                    isActive ? 'text-saas-neon' : isDone ? 'text-white' : 'text-saas-muted'
                  }`}>{step}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`w-6 sm:w-12 h-0.5 mb-4 rounded ${isDone ? 'bg-saas-neon' : 'bg-saas-border'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Active Step Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto bg-saas-card rounded-xl border border-saas-border shadow-lg flex flex-col min-h-[500px]">
          <div className="p-5 border-b border-saas-border">
            <h2 className="text-2xl font-bebas text-white tracking-wide">
              Step {activeStep}: {STEPS[activeStep - 1]}
            </h2>
          </div>
          <div className="flex-1 p-5 sm:p-6">
            {renderStep()}
          </div>
          <div className="p-4 border-t border-saas-border flex justify-between">
            <button
              className="btn-secondary"
              disabled={activeStep === 1}
              onClick={() => setActiveStep((s) => s - 1)}
            >
              ← Previous
            </button>
            <button
              className="btn-primary"
              disabled={activeStep === 4}
              onClick={() => setActiveStep((s) => s + 1)}
            >
              Next Step →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioPage;
