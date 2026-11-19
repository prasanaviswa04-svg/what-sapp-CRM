const Customer = require('../models/Customer');
const { matchPropertiesForCustomer } = require('../services/matchingService');

// @desc    Match properties for a specific customer
// @route   GET /api/matching/customer/:customerId
const getMatchesForCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.customerId,
      companyId: req.companyId
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const matches = await matchPropertiesForCustomer(customer, 15);

    res.status(200).json({
      success: true,
      customerId: customer._id,
      customerName: customer.fullName,
      requirements: customer.requirements,
      totalMatches: matches.length,
      matches
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Calculate matches for custom ad-hoc criteria
// @route   POST /api/matching/test
const matchCustomCriteria = async (req, res, next) => {
  try {
    const mockCustomer = {
      companyId: req.companyId,
      fullName: 'Test Prospect',
      preferredLocation: req.body.preferredLocation || '',
      requirements: {
        minBudget: Number(req.body.minBudget) || 0,
        maxBudget: Number(req.body.maxBudget) || 0,
        bedrooms: Number(req.body.bedrooms) || 0,
        propertyCategory: req.body.propertyCategory || 'Any',
        preferredAmenities: req.body.preferredAmenities || []
      }
    };

    const matches = await matchPropertiesForCustomer(mockCustomer, 15);

    res.status(200).json({
      success: true,
      totalMatches: matches.length,
      matches
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMatchesForCustomer,
  matchCustomCriteria
};
