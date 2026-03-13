import React, { useState } from 'react';
import { Save, Store, Globe, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [shopName, setShopName] = useState('FaceSeek Studio');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('studio@faceseek.com');
  const [address, setAddress] = useState('123 Market Road, Mumbai');

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <h2 className="text-3xl font-bebas text-white tracking-wide mb-2">Shop Settings</h2>
      <p className="text-saas-muted text-sm mb-8">Manage your studio profile and preferences.</p>

      <div className="space-y-6">
        {/* Shop Info */}
        <div className="bg-saas-card border border-saas-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Store size={20} className="text-saas-neon" />
            <h3 className="font-semibold text-white">Shop Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-saas-muted mb-1.5">Shop Name</label>
              <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-saas-muted mb-1.5">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-saas-muted mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-saas-muted mb-1.5">Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-saas-card border border-saas-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Bell size={20} className="text-saas-neon" />
            <h3 className="font-semibold text-white">Notifications</h3>
          </div>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-500 rounded" />
            <span className="text-sm text-saas-text">Send WhatsApp notification when order is ready</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
            <input type="checkbox" className="w-4 h-4 accent-emerald-500 rounded" />
            <span className="text-sm text-saas-text">Daily revenue summary via email</span>
          </label>
        </div>

        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Save size={18} /> Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
