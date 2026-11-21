const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const MarketplaceUser = require('../models/MarketplaceUser');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact your company administrator.'
      });
    }

    req.user = user;
    req.companyId = user.companyId;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or has expired.',
      error: err.message
    });
  }
};

const protectMarketplace = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please log in to your owner or broker portal.'
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const mUser = await MarketplaceUser.findById(decoded.id).select('-password');

    if (!mUser) {
      return res.status(401).json({
        success: false,
        message: 'Marketplace account not found.'
      });
    }

    if (mUser.status === 'Suspended' || mUser.status === 'Rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your marketplace account has been suspended or rejected. Please contact administrator.'
      });
    }

    req.marketplaceUser = mUser;
    req.companyId = mUser.companyId;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Marketplace session expired or invalid. Please sign in again.'
    });
  }
};

module.exports = { protect, protectMarketplace };
