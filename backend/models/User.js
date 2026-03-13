const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // shopId is optional so Google-only users without a shop still work
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // password is NOT required — Google OAuth users have no password
  password: { type: String, default: '' },
  role: {
    type: String,
    enum: ['SuperAdmin', 'ShopOwner', 'Manager', 'Editor', 'Staff'],
    default: 'ShopOwner',
  },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
