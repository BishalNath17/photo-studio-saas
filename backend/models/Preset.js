const mongoose = require('mongoose');

const presetSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name: { type: String, required: true }, // e.g. "Passport Standard 300DPI"
  isDefault: { type: Boolean, default: false },
  
  width: { type: Number },
  height: { type: Number },
  unit: { type: String, enum: ['px', 'in', 'cm', 'mm', '%'], default: 'px' },
  dpi: { type: Number, default: 300 },
  
  exportType: { type: String, enum: ['image', 'pdf'], default: 'image' },
  imageFormat: { type: String, enum: ['jpg', 'jpeg', 'png', 'webp'], default: 'jpg' },
  
  resizeMode: { type: String, enum: ['original', 'resize', 'cropAndResize', 'cropOnly', 'autoFit'], default: 'resize' },
  backgroundColor: { type: String, default: 'white' }, // hex code
  
  fileSize: {
    targetKB: { type: Number },
    quality: { type: Number, min: 1, max: 100, default: 80 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Preset', presetSchema);
