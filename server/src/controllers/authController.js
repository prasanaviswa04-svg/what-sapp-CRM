const User = require('../models/User');
const Company = require('../models/Company');
const ActivityLog = require('../models/ActivityLog');

// @desc    Register a new company and admin user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { companyName, firstName, lastName, email, phone, password, role } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: firstName, lastName, email, password'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    // Create Company
    const company = await Company.create({
      name: companyName || `${firstName}'s Realty Group`,
      email: email.toLowerCase(),
      phone: phone || ''
    });

    // Create User (defaults to Company Admin for first user)
    const userRole = role || 'Company Admin';
    const user = await User.create({
      companyId: company._id,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      password,
      role: userRole,
      lastLogin: new Date()
    });

    const token = user.getSignedJwtToken();
    const refreshToken = user.getSignedRefreshToken();

    await ActivityLog.create({
      companyId: company._id,
      userId: user._id,
      userName: `${firstName} ${lastName}`,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user._id,
      details: { role: userRole }
    });

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar || '',
        companyId: company._id,
        companyName: company.name
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('companyId', 'name currency timeZone whatsappConfig aiConfig');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact your company administrator.'
      });
    }

    // Update login history
    user.lastLogin = new Date();
    user.loginHistory.unshift({
      ip: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
      device: 'Desktop/Web',
      timestamp: new Date()
    });
    if (user.loginHistory.length > 20) user.loginHistory.pop();
    await user.save();

    const token = user.getSignedJwtToken();
    const refreshToken = user.getSignedRefreshToken();

    res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar || '',
        companyId: user.companyId?._id || user.companyId,
        companyName: user.companyId?.name || 'EstateFlow Realty',
        currency: user.companyId?.currency || { code: 'INR', symbol: '₹' }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('companyId', 'name email phone currency timeZone logo whatsappConfig.status');

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        company: user.companyId,
        lastLogin: user.lastLogin,
        loginHistory: user.loginHistory?.slice(0, 5) || []
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile & password
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, avatar, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatar !== undefined) user.avatar = avatar;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to change password' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: newPassword ? 'Profile and password updated successfully' : 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
        loginHistory: user.loginHistory?.slice(0, 5) || []
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateProfile };
