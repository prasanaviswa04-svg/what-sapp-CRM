const Company = require('../models/Company');
const MarketplaceUser = require('../models/MarketplaceUser');
const MarketplaceSubmission = require('../models/MarketplaceSubmission');
const MarketplaceActivity = require('../models/MarketplaceActivity');
const User = require('../models/User');
const {
  generateSubmissionId,
  detectDuplicates,
  sendMarketplaceNotification,
  syncApprovedSubmissionToCRM,
  findOpportunityMatches
} = require('../services/marketplaceService');
const { emitCompanyEvent } = require('../services/socketService');

// Helper to resolve companyId
const getCompanyId = async (req) => {
  if (req.companyId) return req.companyId;
  const company = await Company.findOne();
  return company ? company._id : null;
};

// ==========================================
// 1. EXTERNAL AUTHENTICATION
// ==========================================

// @desc    Register a new Direct Property Owner
// @route   POST /api/marketplace/auth/register-owner
const registerOwner = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, currentCity, idProofType, idProofNumber, ownershipType } = req.body;
    const companyId = await getCompanyId(req);

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide first name, last name, email, phone, and password.' });
    }

    const existing = await MarketplaceUser.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists in the marketplace.' });
    }

    const user = await MarketplaceUser.create({
      companyId,
      userType: 'Owner',
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      email: email.toLowerCase(),
      phone,
      whatsappNumber: phone,
      password,
      status: 'Active',
      isVerified: true,
      ownerProfile: {
        currentCity: currentCity || '',
        idProofType: idProofType || 'Aadhaar / National ID',
        idProofNumber: idProofNumber || '',
        ownershipType: ownershipType || 'Individual'
      }
    });

    const token = user.getSignedJwtToken();

    // Send automated WhatsApp notification
    await sendMarketplaceNotification({
      recipientPhone: phone,
      recipientName: user.fullName,
      eventType: 'OWNER_REGISTERED',
      companyId
    });

    await MarketplaceActivity.create({
      companyId,
      action: 'OWNER_REGISTERED',
      actorType: 'Owner',
      actorId: user._id,
      actorName: user.fullName,
      details: { email, phone, currentCity }
    });

    res.status(201).json({
      success: true,
      message: 'Owner registration successful! Welcome to EstateFlow Marketplace.',
      token,
      user: {
        id: user._id,
        userType: user.userType,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        ownerProfile: user.ownerProfile
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register a Real Estate Broker / Agent
// @route   POST /api/marketplace/auth/register-broker
const registerBroker = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      companyName,
      operatingLocations,
      serviceAreas,
      propertyCategories,
      yearsExperience,
      licenseNumber,
      reraNumber,
      businessAddress
    } = req.body;

    const companyId = await getCompanyId(req);

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide required broker personal and contact information.' });
    }

    const existing = await MarketplaceUser.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A broker account with this email already exists.' });
    }

    const locations = Array.isArray(operatingLocations)
      ? operatingLocations
      : operatingLocations ? operatingLocations.split(',').map(s => s.trim()) : ['Gurugram'];

    const user = await MarketplaceUser.create({
      companyId,
      userType: 'Broker',
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      email: email.toLowerCase(),
      phone,
      whatsappNumber: phone,
      password,
      status: 'Active',
      isVerified: true,
      brokerProfile: {
        companyName: companyName || `${firstName}'s Realty`,
        operatingLocations: locations,
        serviceAreas: Array.isArray(serviceAreas) ? serviceAreas : [],
        propertyCategories: Array.isArray(propertyCategories) ? propertyCategories : ['Residential', 'Commercial'],
        yearsExperience: Number(yearsExperience) || 2,
        licenseNumber: licenseNumber || '',
        reraNumber: reraNumber || '',
        businessAddress: businessAddress || ''
      }
    });

    const token = user.getSignedJwtToken();

    // Send automated WhatsApp notification
    await sendMarketplaceNotification({
      recipientPhone: phone,
      recipientName: user.fullName,
      eventType: 'BROKER_REGISTERED',
      companyId
    });

    await MarketplaceActivity.create({
      companyId,
      action: 'BROKER_REGISTERED',
      actorType: 'Broker',
      actorId: user._id,
      actorName: user.fullName,
      details: { email, phone, companyName }
    });

    res.status(201).json({
      success: true,
      message: 'Broker network partner registration successful!',
      token,
      user: {
        id: user._id,
        userType: user.userType,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        brokerProfile: user.brokerProfile
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Marketplace Login (for Owners & Brokers)
// @route   POST /api/marketplace/auth/login
const marketplaceLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await MarketplaceUser.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or user not registered in marketplace.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ success: false, message: 'Your marketplace account is suspended. Please contact agency desk.' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        userType: user.userType,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
        brokerProfile: user.brokerProfile,
        ownerProfile: user.ownerProfile
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Current Marketplace Profile
// @route   GET /api/marketplace/auth/me
const getMarketplaceMe = async (req, res, next) => {
  try {
    const user = await MarketplaceUser.findById(req.marketplaceUser._id);
    const submissionsCount = await MarketplaceSubmission.countDocuments({ marketplaceUserId: user._id });
    const approvedCount = await MarketplaceSubmission.countDocuments({ marketplaceUserId: user._id, status: { $in: ['Approved', 'Published'] } });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        userType: user.userType,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        brokerProfile: user.brokerProfile,
        ownerProfile: user.ownerProfile,
        totalSubmissions: submissionsCount,
        approvedSubmissions: approvedCount
      }
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 2. SUBMISSIONS ENGINE (FOR OWNERS & BROKERS)
// ==========================================

// @desc    Create a Property or Requirement Submission
// @route   POST /api/marketplace/submissions
const createSubmission = async (req, res, next) => {
  try {
    const companyId = await getCompanyId(req);
    const mUser = req.marketplaceUser; // present if logged in

    const {
      submitterType = mUser?.userType || 'Owner',
      submitterName = mUser?.fullName || req.body.submitterName || 'Valued Partner',
      submitterPhone = mUser?.phone || req.body.submitterPhone,
      organization = mUser?.brokerProfile?.companyName || req.body.organization || '',
      submissionCategory = 'Property',
      submissionType = 'Property for Sale',
      title,
      description = '',
      propertyDetails = {},
      requirementDetails = {}
    } = req.body;

    const submitterPhoneClean = submitterPhone || '+919876543210';
    const submitterEmail = mUser?.email || req.body.submitterEmail || `${submitterPhoneClean.replace(/\D/g, '') || 'client'}@marketplace.estateflow.io`;
    const submitterWhatsApp = mUser?.whatsappNumber || req.body.submitterWhatsApp || submitterPhoneClean;

    if (!title || !submitterPhoneClean) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Title and Submitter Phone number.'
      });
    }

    // Generate unique submission ID (e.g. SUB-2026-0005)
    const submissionId = await generateSubmissionId(companyId);

    // Determine source
    let source = 'Website Submission';
    if (submitterType === 'Broker') source = 'Real Estate Broker';
    else if (submitterType === 'Owner') source = 'Direct Property Owner';

    // Duplicate detection check
    const dupCheck = await detectDuplicates({
      submissionCategory,
      propertyDetails,
      requirementDetails,
      submitterPhone
    }, companyId);

    const newSubmission = await MarketplaceSubmission.create({
      companyId,
      submissionId,
      marketplaceUserId: mUser ? mUser._id : null,
      submitterType,
      submitterName,
      submitterEmail,
      submitterPhone,
      submitterWhatsApp,
      organization,
      submissionCategory,
      submissionType,
      status: 'New Submission',
      source,
      title,
      description,
      propertyDetails,
      requirementDetails,
      duplicateDetection: {
        isDuplicate: dupCheck.isDuplicate,
        confidenceScore: dupCheck.confidenceScore,
        matchedSubmissionId: dupCheck.matchedSubmissionId,
        flaggedReason: dupCheck.flaggedReason,
        reviewStatus: dupCheck.isDuplicate ? 'Flagged' : 'Clean'
      },
      statusHistory: [
        {
          status: 'New Submission',
          changedBy: submitterName,
          note: `Initial submission received via ${source}. ${dupCheck.isDuplicate ? 'Flagged by Duplicate Engine.' : ''}`,
          timestamp: new Date()
        }
      ]
    });

    // Increment user's total submissions count
    if (mUser) {
      await MarketplaceUser.findByIdAndUpdate(mUser._id, { $inc: { totalSubmissions: 1 } });
    }

    // Automated WhatsApp Acknowledgement
    await sendMarketplaceNotification({
      submission: newSubmission,
      eventType: 'SUBMISSION_RECEIVED',
      companyId
    });

    // Log Activity
    await MarketplaceActivity.create({
      companyId,
      action: submissionCategory === 'Property' ? 'PROPERTY_SUBMITTED' : 'REQUIREMENT_SUBMITTED',
      actorType: submitterType,
      actorId: mUser ? mUser._id : null,
      actorName: submitterName,
      submissionId: newSubmission._id,
      submissionCode: submissionId,
      details: { title, submissionType, duplicateFlagged: dupCheck.isDuplicate }
    });

    // Notify real-time connected CRM clients
    emitCompanyEvent(companyId.toString(), 'marketplace_new_submission', newSubmission);

    res.status(201).json({
      success: true,
      message: `Submission ${submissionId} received successfully! Verification is in progress.`,
      submission: newSubmission
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Submissions of Logged-in Marketplace User
// @route   GET /api/marketplace/my-submissions
const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await MarketplaceSubmission.find({
      marketplaceUserId: req.marketplaceUser._id
    }).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Public Submission Tracking Lookup
// @route   GET /api/marketplace/track/:submissionId
const trackSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const submission = await MarketplaceSubmission.findOne({
      submissionId: submissionId.toUpperCase().trim()
    })
      .select('submissionId title submitterName submissionCategory submissionType status statusHistory createdAt verification')
      .lean();

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission ID not found in system.' });
    }

    res.status(200).json({
      success: true,
      submission
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Public Verified Listings from Marketplace
// @route   GET /api/marketplace/public/listings
const getPublicListings = async (req, res, next) => {
  try {
    const { category, city, minPrice, maxPrice, search } = req.query;
    const query = {
      submissionCategory: 'Property',
      status: { $in: ['Approved', 'Published'] }
    };

    if (category && category !== 'All') {
      query['propertyDetails.category'] = category;
    }
    if (city && city !== 'All') {
      query['propertyDetails.address.city'] = new RegExp(city, 'i');
    }
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { 'propertyDetails.address.locality': new RegExp(search, 'i') }
      ];
    }

    const listings = await MarketplaceSubmission.find(query)
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    res.status(200).json({
      success: true,
      count: listings.length,
      listings
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 3. INTERNAL CRM MANAGEMENT (FOR EMPLOYEES/ADMINS)
// ==========================================

// @desc    Admin Marketplace Dashboard KPIs & Statistics
// @route   GET /api/marketplace/admin/dashboard
const getAdminMarketplaceDashboard = async (req, res, next) => {
  try {
    const companyId = req.companyId;

    const [
      totalOwners,
      totalBrokers,
      totalSubmissions,
      pendingVerification,
      approvedListings,
      rejectedListings,
      activeRequirements,
      duplicateFlagged,
      recentSubmissions,
      recentActivities
    ] = await Promise.all([
      MarketplaceUser.countDocuments({ companyId, userType: 'Owner' }),
      MarketplaceUser.countDocuments({ companyId, userType: 'Broker' }),
      MarketplaceSubmission.countDocuments({ companyId }),
      MarketplaceSubmission.countDocuments({ companyId, status: { $in: ['New Submission', 'Under Review', 'Information Required'] } }),
      MarketplaceSubmission.countDocuments({ companyId, status: { $in: ['Approved', 'Published'] } }),
      MarketplaceSubmission.countDocuments({ companyId, status: 'Rejected' }),
      MarketplaceSubmission.countDocuments({ companyId, submissionCategory: 'Requirement' }),
      MarketplaceSubmission.countDocuments({ companyId, 'duplicateDetection.isDuplicate': true }),
      MarketplaceSubmission.find({ companyId }).sort({ createdAt: -1 }).limit(8).lean(),
      MarketplaceActivity.find({ companyId }).sort({ createdAt: -1 }).limit(10).lean()
    ]);

    const totalProperties = await MarketplaceSubmission.countDocuments({ companyId, submissionCategory: 'Property' });

    const statsObj = {
      totalOwners,
      totalBrokers,
      totalSubmissions,
      pendingVerification,
      approvedListings,
      rejectedListings,
      activeRequirements,
      duplicateSubmissions: duplicateFlagged,
      totalProperties,
      verificationRate: totalSubmissions > 0 ? `${((approvedListings / totalSubmissions) * 100).toFixed(1)}%` : '100%'
    };

    const submissionsByStatus = await MarketplaceSubmission.aggregate([
      { $match: { companyId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const submissionsByType = await MarketplaceSubmission.aggregate([
      { $match: { companyId } },
      { $group: { _id: '$submissionType', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      stats: statsObj,
      kpis: statsObj,
      submissionsByStatus,
      submissionsByType,
      recentSubmissions,
      recentActivities
    });
  } catch (err) {
    next(err);
  }
};

// @desc    List All Marketplace Submissions for Internal Review
// @route   GET /api/marketplace/admin/submissions
const getAdminSubmissions = async (req, res, next) => {
  try {
    const { category, submissionCategory, status, source, duplicate, isDuplicate, search, page = 1, limit = 20 } = req.query;
    const query = { companyId: req.companyId };

    const cat = category || submissionCategory;
    if (cat && cat !== 'All') query.submissionCategory = cat;
    if (status && status !== 'All') query.status = status;
    if (source && source !== 'All') query.source = source;
    if (duplicate === 'true' || isDuplicate === 'true') query['duplicateDetection.isDuplicate'] = true;
    if (duplicate === 'false' || isDuplicate === 'false') query['duplicateDetection.isDuplicate'] = false;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { submissionId: new RegExp(search, 'i') },
        { submitterName: new RegExp(search, 'i') },
        { submitterPhone: new RegExp(search, 'i') }
      ];
    }

    const total = await MarketplaceSubmission.countDocuments(query);
    const submissions = await MarketplaceSubmission.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('assignedTo', 'firstName lastName email')
      .lean();

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      submissions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Detailed Submission View with Verification Data
// @route   GET /api/marketplace/admin/submissions/:id
const getAdminSubmissionDetail = async (req, res, next) => {
  try {
    const submission = await MarketplaceSubmission.findOne({
      _id: req.params.id,
      companyId: req.companyId
    })
      .populate('marketplaceUserId')
      .populate('assignedTo', 'firstName lastName email phone')
      .populate('crmMapping.propertyId')
      .populate('crmMapping.customerId')
      .populate('crmMapping.leadId');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Opportunity matches check
    const matches = await findOpportunityMatches(submission._id, req.companyId);

    res.status(200).json({
      success: true,
      submission,
      matches
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Submission Workflow Status (Verify, Approve, Request Info, Reject)
// @route   PUT /api/marketplace/admin/submissions/:id/status
const updateSubmissionStatus = async (req, res, next) => {
  try {
    const { action, status, notes = '', note = '', informationRequested = '', rejectionReason = '', notifySubmitter = true, syncToCRM = true } = req.body;
    const submission = await MarketplaceSubmission.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const employeeName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'CRM Officer';
    const effectiveNote = notes || note || '';

    // Determine target status
    let targetStatus = status;
    if (!targetStatus) {
      if (action === 'Approve') targetStatus = 'Approved';
      else if (action === 'Verify') targetStatus = 'Verified';
      else if (action === 'RequestInfo') targetStatus = 'Information Required';
      else if (action === 'Reject') targetStatus = 'Rejected';
      else if (action === 'Archive') targetStatus = 'Archived';
      else targetStatus = submission.status;
    }

    let notificationType = null;

    if (targetStatus === 'Approved' || targetStatus === 'Published') {
      if (syncToCRM) {
        await syncApprovedSubmissionToCRM(submission._id, req.user._id, req.companyId);
      }
      submission.status = targetStatus;
      submission.verification.verifiedBy = req.user._id;
      submission.verification.verifiedByName = employeeName;
      submission.verification.verifiedAt = new Date();
      submission.verification.notes = effectiveNote || 'Approved and synced to CRM inventory.';
      submission.statusHistory.push({
        status: targetStatus,
        changedBy: employeeName,
        changedById: req.user._id,
        note: effectiveNote || 'Approved and verified for CRM distribution',
        timestamp: new Date()
      });
      await submission.save();
      notificationType = 'SUBMISSION_APPROVED';
    } else if (targetStatus === 'Information Required') {
      submission.status = 'Information Required';
      submission.verification.informationRequested = informationRequested || effectiveNote;
      submission.verification.notes = effectiveNote;
      submission.statusHistory.push({
        status: 'Information Required',
        changedBy: employeeName,
        changedById: req.user._id,
        note: `Additional info requested: ${informationRequested || effectiveNote}`,
        timestamp: new Date()
      });
      await submission.save();
      notificationType = 'INFO_REQUIRED';
    } else if (targetStatus === 'Rejected') {
      submission.status = 'Rejected';
      submission.verification.rejectionReason = rejectionReason || effectiveNote;
      submission.verification.notes = effectiveNote;
      submission.statusHistory.push({
        status: 'Rejected',
        changedBy: employeeName,
        changedById: req.user._id,
        note: `Submission rejected: ${rejectionReason || effectiveNote}`,
        timestamp: new Date()
      });
      await submission.save();
      notificationType = 'SUBMISSION_REJECTED';
    } else if (targetStatus === 'Verified') {
      submission.status = 'Verified';
      submission.verification.verifiedBy = req.user._id;
      submission.verification.verifiedByName = employeeName;
      submission.verification.verifiedAt = new Date();
      submission.verification.notes = effectiveNote;
      submission.statusHistory.push({
        status: 'Verified',
        changedBy: employeeName,
        changedById: req.user._id,
        note: effectiveNote || 'Property parameters and legal details verified.',
        timestamp: new Date()
      });
      await submission.save();
    } else {
      submission.status = targetStatus;
      if (effectiveNote) submission.verification.notes = effectiveNote;
      submission.statusHistory.push({
        status: targetStatus,
        changedBy: employeeName,
        changedById: req.user._id,
        note: effectiveNote || `Status changed to ${targetStatus}`,
        timestamp: new Date()
      });
      await submission.save();
    }

    // Send WhatsApp update to submitter
    if (notificationType && notifySubmitter) {
      await sendMarketplaceNotification({
        submission,
        eventType: notificationType,
        companyId: req.companyId,
        customNote: informationRequested || rejectionReason || effectiveNote
      });
    }

    await MarketplaceActivity.create({
      companyId: req.companyId,
      action: targetStatus === 'Approved' ? 'SUBMISSION_APPROVED' : targetStatus === 'Rejected' ? 'SUBMISSION_REJECTED' : 'INFO_REQUESTED',
      actorType: 'Internal Employee',
      actorId: req.user._id,
      actorName: employeeName,
      submissionId: submission._id,
      submissionCode: submission.submissionId,
      details: { newStatus: targetStatus, note: effectiveNote }
    });

    const updatedSubmission = await MarketplaceSubmission.findById(submission._id).lean();

    res.status(200).json({
      success: true,
      message: `Submission ${submission.submissionId} updated to status "${targetStatus}".`,
      submission: updatedSubmission
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign Submission to Internal Employee / Broker
// @route   PUT /api/marketplace/admin/submissions/:id/assign
const assignSubmission = async (req, res, next) => {
  try {
    const { assignedToUserId, assignedTo } = req.body;
    const targetUserId = assignedToUserId || assignedTo;
    const employee = await User.findOne({ _id: targetUserId, companyId: req.companyId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Selected internal employee not found.' });
    }

    const submission = await MarketplaceSubmission.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      {
        assignedTo: employee._id,
        assignedToName: `${employee.firstName} ${employee.lastName}`
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Opportunity assigned to ${employee.firstName} ${employee.lastName}`,
      submission
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Matching Opportunities for Submission
// @route   GET /api/marketplace/admin/submissions/:id/matches
const getSubmissionMatches = async (req, res, next) => {
  try {
    const matches = await findOpportunityMatches(req.params.id, req.companyId);
    res.status(200).json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Broker Network Directory
// @route   GET /api/marketplace/admin/directory/brokers
const getBrokerDirectory = async (req, res, next) => {
  try {
    const brokers = await MarketplaceUser.find({
      companyId: req.companyId,
      userType: 'Broker'
    }).sort({ createdAt: -1 }).lean();

    const enriched = await Promise.all(
      brokers.map(async (b) => {
        const [totalProps, totalReqs, approvedProps] = await Promise.all([
          MarketplaceSubmission.countDocuments({ marketplaceUserId: b._id, submissionCategory: 'Property' }),
          MarketplaceSubmission.countDocuments({ marketplaceUserId: b._id, submissionCategory: 'Requirement' }),
          MarketplaceSubmission.countDocuments({ marketplaceUserId: b._id, status: { $in: ['Approved', 'Published'] } })
        ]);
        return {
          ...b,
          totalListings: totalProps,
          totalRequirements: totalReqs,
          approvedCount: approvedProps
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enriched.length,
      brokers: enriched
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Direct Property Owner Directory
// @route   GET /api/marketplace/admin/directory/owners
const getOwnerDirectory = async (req, res, next) => {
  try {
    const owners = await MarketplaceUser.find({
      companyId: req.companyId,
      userType: 'Owner'
    }).sort({ createdAt: -1 }).lean();

    const enriched = await Promise.all(
      owners.map(async (o) => {
        const [totalProps, approvedProps] = await Promise.all([
          MarketplaceSubmission.countDocuments({ marketplaceUserId: o._id, submissionCategory: 'Property' }),
          MarketplaceSubmission.countDocuments({ marketplaceUserId: o._id, status: { $in: ['Approved', 'Published'] } })
        ]);
        return {
          ...o,
          totalListings: totalProps,
          approvedCount: approvedProps
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enriched.length,
      owners: enriched
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify / Activate / Suspend External User Account
// @route   PUT /api/marketplace/admin/directory/users/:id/status
const updateUserDirectoryStatus = async (req, res, next) => {
  try {
    const { status, isVerified } = req.body;
    const user = await MarketplaceUser.findOne({ _id: req.params.id, companyId: req.companyId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (status) user.status = status;
    if (isVerified !== undefined) user.isVerified = isVerified;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Account status for ${user.fullName} updated to ${user.status}.`,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Marketplace Analytics
// @route   GET /api/marketplace/admin/analytics
const getMarketplaceAnalytics = async (req, res, next) => {
  try {
    const companyId = req.companyId;

    const [categoryAgg, locationAgg, statusAgg, recentLogs] = await Promise.all([
      MarketplaceSubmission.aggregate([
        { $match: { companyId } },
        { $group: { _id: '$submissionType', count: { $sum: 1 } } }
      ]),
      MarketplaceSubmission.aggregate([
        { $match: { companyId, 'propertyDetails.address.city': { $exists: true, $ne: '' } } },
        { $group: { _id: '$propertyDetails.address.city', count: { $sum: 1 } } }
      ]),
      MarketplaceSubmission.aggregate([
        { $match: { companyId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      MarketplaceActivity.find({ companyId }).sort({ createdAt: -1 }).limit(15).lean()
    ]);

    res.status(200).json({
      success: true,
      categoryDistribution: categoryAgg,
      locationDistribution: locationAgg,
      statusDistribution: statusAgg,
      recentLogs
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};
