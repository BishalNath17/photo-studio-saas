const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  
  invoiceNumber: { type: String, required: true, unique: true },
  
  lineItems: [{
    description: { type: String, required: true }, // e.g., "Passport Photo x 8", "Background Removal"
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 }, // e.g. 0.18 for 18% GST
  taxAmount: { type: Number, default: 0 },
  urgentCharge: { type: Number, default: 0 },
  deliveryCharge: { type: Number, default: 0 },
  
  grandTotal: { type: Number, required: true },
  
  paymentStatus: { 
    type: String, 
    enum: ['Unpaid', 'Partial', 'Paid', 'Refunded'],
    default: 'Unpaid' 
  },
  amountPaid: { type: Number, default: 0 },
  balanceDue: { type: Number, required: true },
  
  paymentMode: { type: String, enum: ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Pending'], default: 'Pending' },
  
  pdfUrl: { type: String } // Path to generated PDF invoice
  
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
