const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  
  // Customer Details
  customerName: { type: String, required: true },
  customerPhone: { type: String },
  customerEmail: { type: String },
  notes: { type: String },
  
  // Job Meta
  status: { 
    type: String, 
    enum: ['Draft', 'In Progress', 'Ready', 'Delivered', 'Cancelled', 'Archived'],
    default: 'Draft' 
  },
  priority: { type: String, enum: ['Normal', 'Urgent'], default: 'Normal' },
  eventType: { type: String }, // e.g., 'Wedding', 'Visa', 'Gift'
  
  // Workflow Progress Tracker
  currentStep: { type: Number, default: 1 }, 
  
  assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expectedDelivery: { type: Date },
  
  // File References (Abstracted for local/S3)
  files: [{
    originalName: String,
    storagePath: String,
    sizeKB: Number,
    mimeType: String,
    uploadedAt: { type: Date, default: Date.now },
    isProcessed: { type: Boolean, default: false },
    processedStoragePath: String
  }],
  
  // Financial info snapshot (Linked to Invoice)
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }
  
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
