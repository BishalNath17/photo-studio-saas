const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subdomain: { type: String, unique: true, sparse: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String },
  address: { type: String },
  gstNumber: { type: String },
  
  branding: {
    logoUrl: { type: String },
    themeColor: { type: String, default: '#10B981' } // Neon green default
  },
  
  subscription: {
    plan: { type: String, enum: ['Free Trial', 'Basic', 'Pro', 'Premium'], default: 'Free Trial' },
    status: { type: String, enum: ['Active', 'Expired', 'Cancelled'], default: 'Active' },
    validUntil: { type: Date }
  },
  
  pricing: {
    stampPhoto: { type: Number, default: 50 },
    passportPhoto: { type: Number, default: 100 },
    printA4: { type: Number, default: 200 },
    customEditLevel1: { type: Number, default: 150 },
    customEditLevel2: { type: Number, default: 300 },
    urgentChargeMultiplier: { type: Number, default: 1.5 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
