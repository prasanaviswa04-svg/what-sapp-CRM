const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Appointment = require('../models/Appointment');

// @desc    Universal Global Search
// @route   GET /api/search
const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(200).json({ success: true, results: { customers: [], properties: [], leads: [], bookings: [] } });
    }

    const query = q.trim();
    const regex = new RegExp(query, 'i');
    const companyId = req.companyId;

    const [customers, properties, leads, bookings] = await Promise.all([
      Customer.find({
        companyId,
        $or: [{ fullName: regex }, { phone: regex }, { email: regex }, { preferredLocation: regex }]
      }).limit(5).select('fullName phone email preferredLocation leadStatus').lean(),

      Property.find({
        companyId,
        $or: [{ title: regex }, { propertyCode: regex }, { 'address.locality': regex }, { 'address.city': regex }, { category: regex }]
      }).limit(5).select('propertyCode title totalPrice address status category').lean(),

      Lead.find({
        companyId,
        $or: [{ title: regex }, { preferredLocation: regex }]
      }).limit(5).populate('customerId', 'fullName phone').lean(),

      Booking.find({
        companyId,
        bookingCode: regex
      }).limit(5).populate('customerId', 'fullName').populate('propertyId', 'title propertyCode').lean()
    ]);

    res.status(200).json({
      success: true,
      query,
      results: {
        customers,
        properties,
        leads,
        bookings
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { globalSearch };
