const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['SuperAdmin', 'ShopOwner', 'Manager', 'Editor', 'Staff'],
    default: 'Staff'
  },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
