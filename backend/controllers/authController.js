const User = require('../models/User');
const Shop = require('../models/Shop');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id, role, shopId) => {
  return jwt.sign({ id, role, shopId }, process.env.JWT_SECRET || 'fallback_secret_key_12345', {
    expiresIn: '30d',
  });
};

// In-memory fallback database
const memoryDB = {
  users: [],
  shops: [],
  idCounter: 1
};

// @desc    Register new shop and owner
// @route   POST /api/auth/register
// @access  Public
exports.registerShop = async (req, res) => {
  const { email, password } = req.body;
  const shopName = req.body.shopName || `${email.split('@')[0]}'s Studio`;

  try {
    if (!global.isDbConnected || !global.isDbConnected()) {
      // In-memory fallback logic
      const userExists = memoryDB.users.find(u => u.email === email);
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const shopId = 'shop_' + memoryDB.idCounter++;
      const userId = 'user_' + memoryDB.idCounter++;
      
      const shop = {
        _id: shopId,
        name: shopName,
        contactEmail: email,
        branding: { themeColor: '#10B981' }
      };
      memoryDB.shops.push(shop);

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = {
        _id: userId,
        shopId: shopId,
        name: 'Shop Owner',
        email,
        password: hashedPassword,
        role: 'ShopOwner',
        isActive: true
      };
      memoryDB.users.push(user);

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shopId: user.shopId,
        shopName: shop.name,
        token: generateToken(user._id, user.role, user.shopId),
      });
    }

    // Original MongoDB logic
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 1. Create the Shop
    const shop = await Shop.create({
      name: shopName,
      contactEmail: email,
    });

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the Shop Owner User
    const user = await User.create({
      shopId: shop._id,
      name: 'Shop Owner', // Default name
      email,
      password: hashedPassword,
      role: 'ShopOwner'
    });

    if (user && shop) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shopId: user.shopId,
        shopName: shop.name,
        token: generateToken(user._id, user.role, user.shopId),
      });
    } else {
      res.status(400).json({ message: 'Invalid user or shop data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!global.isDbConnected || !global.isDbConnected()) {
      // In-memory fallback
      const user = memoryDB.users.find(u => u.email === email);
      if (user && (await bcrypt.compare(password, user.password))) {
        if (!user.isActive) return res.status(401).json({ message: 'Account disabled' });
        
        const shop = memoryDB.shops.find(s => s._id === user.shopId);
        
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          shopId: user.shopId,
          shopName: shop ? shop.name : 'Fallback Shop',
          shopTheme: shop ? shop.branding.themeColor : '#3B82F6',
          token: generateToken(user._id, user.role, user.shopId),
        });
      } else {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }

    // Original MongoDB logic
    const user = await User.findOne({ email }).populate('shopId');

    if (user && (await bcrypt.compare(password, user.password))) {
      
      if (!user.isActive) {
         return res.status(401).json({ message: 'Account disabled' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shopId: user.shopId._id,
        shopName: user.shopId.name,
        shopTheme: user.shopId.branding.themeColor,
        token: generateToken(user._id, user.role, user.shopId._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Authenticate with Google
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res) => {
  const { email, name, googleId } = req.body;
  try {
    let user, shop;
    if (!global.isDbConnected || !global.isDbConnected()) {
      user = memoryDB.users.find(u => u.email === email);
      if (!user) {
        // Register new Google User in fallback
        const shopId = 'shop_' + memoryDB.idCounter++;
        const userId = 'user_' + memoryDB.idCounter++;
        shop = { _id: shopId, name: `${name}'s Studio`, contactEmail: email, branding: { themeColor: '#3B82F6' } };
        memoryDB.shops.push(shop);
        user = { _id: userId, shopId, name, email, password: '', provider: 'google', googleId, role: 'ShopOwner', isActive: true, createdAt: new Date() };
        memoryDB.users.push(user);
      } else {
        shop = memoryDB.shops.find(s => s._id === user.shopId);
      }
      return res.json({
        _id: user._id, name: user.name, email: user.email, role: user.role, shopId: user.shopId,
        shopName: shop ? shop.name : name, provider: 'google', token: generateToken(user._id, user.role, user.shopId)
      });
    }

    user = await User.findOne({ email }).populate('shopId');
    if (!user) {
      shop = await Shop.create({ name: `${name}'s Studio`, contactEmail: email });
      user = await User.create({ shopId: shop._id, name, email, password: '', provider: 'google', googleId, role: 'ShopOwner' });
    } else if (user.provider !== 'google') {
      user.provider = 'google'; user.googleId = googleId; await user.save();
      shop = user.shopId;
    } else { shop = user.shopId; }

    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role, shopId: user.shopId._id || user.shopId,
      shopName: shop.name, provider: 'google', token: generateToken(user._id, user.role, user.shopId._id || user.shopId)
    });
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

// @desc    Admin: get Google Users
// @route   GET /api/auth/google-users
// @access  Private/Admin
exports.getGoogleUsers = async (req, res) => {
  if (req.userRole !== 'Admin' && req.userRole !== 'SuperAdmin') return res.status(403).json({ message: 'Access denied' });
  try {
    if (!global.isDbConnected || !global.isDbConnected()) {
      const gUsers = memoryDB.users.filter(u => u.provider === 'google').map(u => ({ email: u.email, provider: u.provider, createdAt: u.createdAt || new Date() }));
      return res.json(gUsers);
    }
    const gUsers = await User.find({ provider: 'google' }).select('email provider createdAt');
    res.json(gUsers);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};
