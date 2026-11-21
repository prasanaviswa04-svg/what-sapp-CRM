const MarketplaceSubmission = require('../models/MarketplaceSubmission');
const MarketplaceUser = require('../models/MarketplaceUser');
const MarketplaceActivity = require('../models/MarketplaceActivity');
const Property = require('../models/Property');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Notification = require('../models/Notification');
const { sendTextMessage } = require('./whatsappService');
const { emitCompanyEvent, emitConversationEvent } = require('./socketService');

/**
 * Generate a sequential unique submission code: e.g. SUB-2026-0042
 */
async function generateSubmissionId(companyId) {
  const count = await MarketplaceSubmission.countDocuments({ companyId });
  const year = new Date().getFullYear();
  const seq = String(count + 1).padStart(4, '0');
  return `SUB-${year}-${seq}`;
}

/**
 * Intelligent Duplicate Detection System
 * Checks for existing properties or requirements by phone, title, locality, and price
 */
async function detectDuplicates(submissionData, companyId) {
  try {
    const { submissionCategory, propertyDetails, requirementDetails, submitterPhone } = submissionData;

    if (submissionCategory === 'Property' && propertyDetails) {
      const { title, address, price, bedrooms } = propertyDetails;
      const locality = address?.locality || '';
      const city = address?.city || '';

      // Check existing marketplace submissions
      const existingSub = await MarketplaceSubmission.findOne({
        companyId,
        submissionCategory: 'Property',
        $or: [
          { 'propertyDetails.address.locality': new RegExp(locality, 'i'), 'propertyDetails.price': price },
          { title: new RegExp(title, 'i') },
          { submitterPhone, title: new RegExp(title, 'i') }
        ]
      }).sort({ createdAt: -1 });

      if (existingSub) {
        return {
          isDuplicate: true,
          confidenceScore: 85,
          matchedSubmissionId: existingSub._id,
          flaggedReason: `Similar property listing detected in submission ${existingSub.submissionId} ("${existingSub.title}") with matching locality or pricing.`
        };
      }

      // Check existing CRM properties
      const existingProp = await Property.findOne({
        companyId,
        $or: [
          { title: new RegExp(title, 'i') },
          { 'address.locality': new RegExp(locality, 'i'), totalPrice: price, bedrooms }
        ]
      });

      if (existingProp) {
        return {
          isDuplicate: true,
          confidenceScore: 90,
          matchedSubmissionId: null,
          flaggedReason: `Matches existing inventory listing in CRM: "${existingProp.title}" (${existingProp.propertyCode}).`
        };
      }
    } else if (submissionCategory === 'Requirement' && requirementDetails) {
      const { clientPhone, clientName } = requirementDetails;
      if (clientPhone) {
        const cleanPhone = clientPhone.replace(/[^\d]/g, '');

        // Check if customer already exists in CRM
        const existingCust = await Customer.findOne({
          companyId,
          phone: new RegExp(cleanPhone.slice(-10))
        });

        if (existingCust) {
          return {
            isDuplicate: true,
            confidenceScore: 95,
            matchedSubmissionId: null,
            flaggedReason: `Customer with contact ${clientPhone} already exists in CRM database as "${existingCust.fullName}".`
          };
        }
      }
    }

    return {
      isDuplicate: false,
      confidenceScore: 0,
      matchedSubmissionId: null,
      flaggedReason: ''
    };
  } catch (err) {
    console.error('Duplicate detection error:', err);
    return { isDuplicate: false, confidenceScore: 0, matchedSubmissionId: null, flaggedReason: '' };
  }
}

/**
 * Automated WhatsApp Contact and Notification Engine
 */
async function sendMarketplaceNotification({
  submission,
  recipientPhone,
  recipientName,
  eventType,
  companyId,
  customNote = ''
}) {
  try {
    let message = '';
    const name = recipientName || submission?.submitterName || 'Partner';
    const subId = submission?.submissionId || 'SUB-2026';
    const title = submission?.title || 'Property Listing';

    switch (eventType) {
      case 'OWNER_REGISTERED':
        message = `Hello ${name}! 🏡 Welcome to EstateFlow Realty. Your Property Owner account is registered. You can now submit properties directly for verified brokerage sale or rental.`;
        break;

      case 'BROKER_REGISTERED':
        message = `Hello ${name}! 🤝 Welcome to the EstateFlow Broker Network. Your partner profile is active. You can now submit listings, register buyer requirements, and co-broker transactions with us.`;
        break;

      case 'SUBMISSION_RECEIVED':
        message = `Hello ${name}! ✅ We have received your submission ${subId} ("${title}"). Our internal verification team is reviewing details. You can track progress anytime.`;
        break;

      case 'INFO_REQUIRED':
        message = `Hello ${name}. Regarding your submission ${subId} ("${title}"), our team requires additional details: ${customNote || 'Please verify property ownership document and floor details'}. Please update via your dashboard.`;
        break;

      case 'SUBMISSION_APPROVED':
        message = `Congratulations ${name}! 🎉 Your submission ${subId} ("${title}") has been verified, approved, and published to our centralized CRM inventory. Active buyers will now be matched!`;
        break;

      case 'SUBMISSION_REJECTED':
        message = `Hello ${name}. Regarding your submission ${subId} ("${title}"), your submission could not be approved at this time: ${customNote || 'Incomplete property details or mismatch in pricing.'}`;
        break;

      case 'REQUIREMENT_MATCHED':
        message = `Hello ${name}! 🎯 Opportunity Match: An approved property matching your submitted requirements has arrived in the system. Our desk will contact you with details.`;
        break;

      default:
        message = `Update regarding your submission ${subId}: Status is now ${submission?.status || 'Updated'}.`;
    }

    const phone = recipientPhone || submission?.submitterWhatsApp || submission?.submitterPhone;
    if (phone) {
      const sendResult = await sendTextMessage(phone, message, companyId);

      // Record in submission communication log if submission is present
      if (submission && submission.communicationHistory) {
        submission.communicationHistory.push({
          channel: 'WhatsApp',
          template: eventType,
          message,
          status: sendResult.live ? 'sent' : 'delivered',
          recipientPhone: phone,
          whatsappMessageId: sendResult.messageId,
          timestamp: new Date()
        });
        await submission.save();
      }
    }

    // Trigger internal CRM notification
    await Notification.create({
      companyId,
      recipientRole: 'Company Admin',
      title: `Marketplace: ${eventType.replace(/_/g, ' ')}`,
      message: `${name}: ${eventType} for ${title} (${subId})`,
      category: 'Marketplace',
      referenceId: submission?._id,
      referenceType: 'MarketplaceSubmission',
      actionUrl: `/marketplace-manager`
    });

    // Record activity log
    await MarketplaceActivity.create({
      companyId,
      action: 'WHATSAPP_NOTIFICATION_SENT',
      actorType: 'System Automation',
      submissionId: submission?._id,
      submissionCode: subId,
      details: { eventType, recipientPhone: phone, preview: message.slice(0, 80) }
    });

    return { success: true, message };
  } catch (err) {
    console.error('Error sending marketplace WhatsApp notification:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sync Approved Marketplace Submission directly into existing CRM records
 */
async function syncApprovedSubmissionToCRM(submissionId, approvedByUserId, companyId) {
  const submission = await MarketplaceSubmission.findOne({ _id: submissionId, companyId });
  if (!submission) throw new Error('Submission not found');

  if (submission.submissionCategory === 'Property') {
    const p = submission.propertyDetails;

    // Check if property record already created
    let property;
    if (submission.crmMapping?.propertyId) {
      property = await Property.findById(submission.crmMapping.propertyId);
    }

    const propCode = `EF-MKT-${Math.floor(100 + Math.random() * 900)}`;

    const validCategories = ['Residential', 'Commercial', 'Land', 'Plot', 'Apartment', 'Villa', 'Independent House', 'Office Space', 'Rental'];
    let targetCat = p.category;
    if (!validCategories.includes(targetCat)) {
      if (targetCat === 'Industrial' || targetCat === 'Office') targetCat = 'Commercial';
      else targetCat = 'Residential';
    }

    const effectivePrice = p.price || p.rentalPrice || 100000;
    const effectiveArea = p.builtUpArea || p.plotArea || 1000;

    if (!property) {
      property = await Property.create({
        companyId,
        propertyCode: propCode,
        title: submission.title,
        description: submission.description || `Verified submission from ${submission.submitterName} (${submission.source})`,
        category: targetCat,
        purpose: p.purpose || 'Sale',
        propertyType: p.propertyType || 'Apartment',
        totalPrice: effectivePrice,
        rentalPrice: p.rentalPrice || 0,
        builtUpArea: effectiveArea,
        builtUpAreaSqft: effectiveArea,
        plotAreaSqyd: p.plotArea || 0,
        bedrooms: p.bedrooms || 3,
        bathrooms: p.bathrooms || 2,
        furnishingStatus: p.furnishing || 'Semi-Furnished',
        address: {
          street: p.address?.street || '',
          locality: p.address?.locality || 'Golf Course Extension',
          city: p.address?.city || 'Gurugram',
          state: p.address?.state || 'Haryana',
          country: p.address?.country || 'India',
          postalCode: p.address?.postalCode || '122001'
        },
        amenities: p.amenities?.length ? p.amenities : ['24/7 Security', 'Power Backup', 'Clubhouse', 'Car Parking'],
        images: p.images?.length ? p.images : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
        videos: p.videos || [],
        status: 'Available',
        sourceType: submission.source,
        marketplaceSubmissionId: submission._id,
        externalOwnerId: submission.submitterType === 'Owner' ? submission.marketplaceUserId : null,
        externalBrokerId: submission.submitterType === 'Broker' ? submission.marketplaceUserId : null,
        assignedBrokerId: submission.assignedTo || null
      });

      submission.crmMapping.propertyId = property._id;
    } else {
      property.totalPrice = effectivePrice;
      property.rentalPrice = p.rentalPrice || property.rentalPrice;
      property.status = 'Available';
      await property.save();
    }

    submission.crmMapping.syncStatus = 'Synced';
    submission.crmMapping.syncedAt = new Date();

    emitCompanyEvent(companyId.toString(), 'property_created', property);
  } else if (submission.submissionCategory === 'Requirement') {
    const r = submission.requirementDetails;

    const normalizeTimeline = (tl) => {
      if (!tl) return 'Near term (1-3 months)';
      const lower = tl.toLowerCase();
      if (lower.includes('immediate') || lower.includes('15') || lower.includes('0-1')) return 'Immediate (0-1 month)';
      if (lower.includes('near') || lower.includes('1-3') || lower.includes('month')) return 'Near term (1-3 months)';
      if (lower.includes('medium') || lower.includes('3-6')) return 'Medium term (3-6 months)';
      return 'Exploring (>6 months)';
    };

    const validCustomerTypes = ['Buyer', 'Investor', 'Tenant', 'Channel Partner'];
    const targetCustType = validCustomerTypes.includes(r.customerType) ? r.customerType : 'Buyer';

    // Check if customer already exists or create new
    let customer = await Customer.findOne({
      companyId,
      phone: r.clientPhone || submission.submitterPhone
    });

    if (!customer) {
      customer = await Customer.create({
        companyId,
        fullName: r.clientName || `${submission.submitterName}'s Client`,
        phone: r.clientPhone || submission.submitterPhone,
        email: r.clientEmail || '',
        customerType: targetCustType,
        preferredLocation: r.preferredLocations?.join(', ') || 'Gurugram',
        requirements: {
          propertyCategory: r.propertyCategories?.[0] || 'Apartment',
          minBudget: r.budgetMin || 0,
          maxBudget: r.budgetMax || 0,
          bedrooms: r.preferredBedrooms?.[0] || 3,
          purchaseTimeline: normalizeTimeline(r.possessionTimeline)
        },
        source: submission.source,
        marketplaceSubmissionId: submission._id,
        assignedBrokerId: submission.assignedTo || null,
        leadStatus: 'Qualified'
      });
    }

    submission.crmMapping.customerId = customer._id;

    // Create or link Lead
    let lead = await Lead.findOne({
      companyId,
      customerId: customer._id,
      marketplaceSubmissionId: submission._id
    });

    if (!lead) {
      lead = await Lead.create({
        companyId,
        customerId: customer._id,
        title: submission.title || `Requirement: ${r.propertyCategories?.join(', ')} in ${r.preferredLocations?.join(', ')}`,
        source: submission.source,
        budget: r.budgetMax || r.budgetMin || 0,
        preferredLocation: r.preferredLocations?.join(', ') || 'Gurugram',
        assignedBrokerId: submission.assignedTo || null,
        stage: 'Requirements Collected',
        marketplaceSubmissionId: submission._id,
        score: 75
      });
    }

    submission.crmMapping.leadId = lead._id;
    submission.crmMapping.syncStatus = 'Synced';
    submission.crmMapping.syncedAt = new Date();
    emitCompanyEvent(companyId.toString(), 'lead_created', lead);
  }

  // Update marketplace submission verification and publish date
  submission.status = 'Approved';
  submission.verification.verifiedBy = approvedByUserId;
  submission.verification.verifiedAt = new Date();
  submission.verification.publishedAt = new Date();
  submission.statusHistory.push({
    status: 'Approved',
    changedBy: 'Admin / Manager',
    changedById: approvedByUserId,
    note: 'Submission verified and published into CRM ecosystem.',
    timestamp: new Date()
  });

  await submission.save();

  // If submitter is a registered MarketplaceUser, increment approved count
  if (submission.marketplaceUserId) {
    await MarketplaceUser.findByIdAndUpdate(submission.marketplaceUserId, {
      $inc: { approvedSubmissions: 1 }
    });
  }

  // Record activity
  await MarketplaceActivity.create({
    companyId,
    action: 'CRM_RECORD_SYNCED',
    actorType: 'Internal Employee',
    actorId: approvedByUserId,
    submissionId: submission._id,
    submissionCode: submission.submissionId,
    details: {
      category: submission.submissionCategory,
      propertyId: submission.crmMapping.propertyId,
      customerId: submission.crmMapping.customerId,
      leadId: submission.crmMapping.leadId
    }
  });

  return submission;
}

/**
 * Intelligent Opportunity Matcher
 * Compares property listings against buyer requirements and vice-versa
 */
async function findOpportunityMatches(submissionId, companyId) {
  const sub = await MarketplaceSubmission.findOne({ _id: submissionId, companyId });
  if (!sub) return [];

  const matches = [];

  if (sub.submissionCategory === 'Property') {
    const p = sub.propertyDetails;
    const price = p.price || p.rentalPrice || 0;
    const locality = p.address?.locality || '';
    const city = p.address?.city || '';
    const category = p.category || 'Residential';

    // Find CRM Customers whose budget and location match this property
    const potentialCustomers = await Customer.find({
      companyId,
      $or: [
        { 'requirements.maxBudget': { $gte: price * 0.85, $lte: price * 1.25 } },
        { preferredLocation: new RegExp(locality || city, 'i') }
      ]
    }).limit(6).lean();

    for (const cust of potentialCustomers) {
      let score = 50;
      const reasons = [];

      if (cust.requirements?.maxBudget && price <= cust.requirements.maxBudget) {
        score += 25;
        reasons.push('Property is within customer budget limit');
      }
      if (cust.preferredLocation && (locality.includes(cust.preferredLocation) || cust.preferredLocation.includes(locality) || cust.preferredLocation.includes(city))) {
        score += 20;
        reasons.push('Matched preferred location');
      }
      if (cust.requirements?.bedrooms && cust.requirements.bedrooms === p.bedrooms) {
        score += 5;
        reasons.push(`${p.bedrooms} BHK matches preferred bedroom count`);
      }

      matches.push({
        matchId: cust._id,
        matchType: 'Customer Requirement',
        title: `${cust.fullName} (${cust.customerType})`,
        contact: cust.phone,
        budget: `₹${((cust.requirements?.maxBudget || 0) / 10000000).toFixed(2)} Cr`,
        location: cust.preferredLocation || 'Any',
        matchPercentage: Math.min(score, 98),
        reasons,
        sourceInfo: `CRM Active Lead (${cust.leadStatus})`,
        actionRecommended: 'Send WhatsApp Brochure & Schedule Inspection'
      });
    }
  } else if (sub.submissionCategory === 'Requirement') {
    const r = sub.requirementDetails;
    const budgetMax = r.budgetMax || (r.budgetMin ? r.budgetMin * 1.3 : 100000000);
    const locations = r.preferredLocations || [];

    // Find CRM properties matching budget and locations
    const locRegexes = locations.map(l => new RegExp(l, 'i'));
    const potentialProperties = await Property.find({
      companyId,
      status: 'Available',
      totalPrice: { $lte: budgetMax * 1.15 }
    }).limit(6).lean();

    for (const prop of potentialProperties) {
      let score = 55;
      const reasons = [];

      if (prop.totalPrice <= budgetMax) {
        score += 25;
        reasons.push('Property price is within requirement budget');
      }
      const propLoc = `${prop.address?.locality || ''} ${prop.address?.city || ''}`;
      if (locations.some(l => propLoc.toLowerCase().includes(l.toLowerCase()))) {
        score += 15;
        reasons.push('Location matches buyer requirement');
      }
      if (r.preferredBedrooms?.includes(prop.bedrooms)) {
        score += 5;
        reasons.push(`${prop.bedrooms} BHK matches requirement`);
      }

      matches.push({
        matchId: prop._id,
        matchType: 'Property Listing',
        title: prop.title,
        contact: prop.propertyCode,
        price: `₹${(prop.totalPrice / 10000000).toFixed(2)} Cr`,
        location: `${prop.address?.locality}, ${prop.address?.city}`,
        matchPercentage: Math.min(score, 99),
        reasons,
        sourceInfo: `CRM Inventory (${prop.status})`,
        actionRecommended: 'Share Listing on WhatsApp with Broker / Client'
      });
    }
  }

  return matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

module.exports = {
  generateSubmissionId,
  detectDuplicates,
  sendMarketplaceNotification,
  syncApprovedSubmissionToCRM,
  findOpportunityMatches
};
