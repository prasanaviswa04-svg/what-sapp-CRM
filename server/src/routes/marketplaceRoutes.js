const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const MarketplaceUser = require('../models/MarketplaceUser');
const { protect, protectMarketplace } = require('../middleware/authMiddleware');
const {
  registerOwner,
  registerBroker,
  marketplaceLogin,
  getMarketplaceMe,
  createSubmission,
  getMySubmissions,
  trackSubmission,
  getPublicListings,
  getAdminMarketplaceDashboard,
  getAdminSubmissions,
  getAdminSubmissionDetail,
  updateSubmissionStatus,
  assignSubmission,
  getSubmissionMatches,
  getBrokerDirectory,
  getOwnerDirectory,
  updateUserDirectoryStatus,
  getMarketplaceAnalytics
} = require('../controllers/marketplaceController');

// Optional Marketplace User middleware for submissions
const optionalMarketplaceAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const mUser = await MarketplaceUser.findById(decoded.id);
      if (mUser) {
        req.marketplaceUser = mUser;
        req.companyId = mUser.companyId;
      }
    } catch (err) {
      // Proceed as unauthenticated guest submission
    }
  }
  next();
};

// ==========================================
// Public & External Marketplace Endpoints
// ==========================================
router.post('/auth/register-owner', registerOwner);
router.post('/auth/register-broker', registerBroker);
router.post('/auth/login', marketplaceLogin);
router.get('/auth/me', protectMarketplace, getMarketplaceMe);

// Submissions
router.post('/submissions', optionalMarketplaceAuth, createSubmission);
router.get('/my-submissions', protectMarketplace, getMySubmissions);
router.get('/track/:submissionId', trackSubmission);
router.get('/public/listings', getPublicListings);

// ==========================================
// Internal CRM Management Endpoints (Protected by Internal User Auth)
// ==========================================
router.get('/admin/dashboard', protect, getAdminMarketplaceDashboard);
router.get('/admin/submissions', protect, getAdminSubmissions);
router.get('/admin/submissions/:id', protect, getAdminSubmissionDetail);
router.put('/admin/submissions/:id/status', protect, updateSubmissionStatus);
router.put('/admin/submissions/:id/assign', protect, assignSubmission);
router.get('/admin/submissions/:id/matches', protect, getSubmissionMatches);
router.get('/admin/directory/brokers', protect, getBrokerDirectory);
router.get('/admin/directory/owners', protect, getOwnerDirectory);
router.put('/admin/directory/users/:id/status', protect, updateUserDirectoryStatus);
router.get('/admin/analytics', protect, getMarketplaceAnalytics);

module.exports = router;
