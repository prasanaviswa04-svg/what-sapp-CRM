const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const Property = require('../models/Property');
const Lead = require('../models/Lead');
const ActivityLog = require('../models/ActivityLog');
const { triggerAutomations } = require('../services/automationEngine');

// @desc    Get all appointments / site visits
// @route   GET /api/appointments
const getAppointments = async (req, res, next) => {
  try {
    const { status, brokerId, propertyId, startDate, endDate } = req.query;
    const query = { companyId: req.companyId };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (brokerId) {
      query.assignedBrokerId = brokerId;
    }

    if (propertyId) {
      query.propertyId = propertyId;
    }

    if (startDate || endDate) {
      query.visitDate = {};
      if (startDate) query.visitDate.$gte = new Date(startDate);
      if (endDate) query.visitDate.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(query)
      .populate('customerId', 'fullName phone email requirements')
      .populate('propertyId', 'propertyCode title address totalPrice images')
      .populate('assignedBrokerId', 'firstName lastName email phone')
      .sort({ visitDate: 1 })
      .lean();

    res.status(200).json({
      success: true,
      total: appointments.length,
      appointments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Schedule a property visit
// @route   POST /api/appointments
const createAppointment = async (req, res, next) => {
  try {
    const {
      customerId,
      propertyId,
      assignedBrokerId,
      visitDate,
      visitTime,
      meetingLocation,
      notes
    } = req.body;

    if (!customerId || !propertyId || !visitDate || !visitTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customerId, propertyId, visitDate, and visitTime.'
      });
    }

    const broker = assignedBrokerId || req.user.id;

    // Check conflict: Same broker with another appointment at same date & time
    const startOfDay = new Date(visitDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(visitDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflict = await Appointment.findOne({
      companyId: req.companyId,
      assignedBrokerId: broker,
      visitDate: { $gte: startOfDay, $lte: endOfDay },
      visitTime,
      status: { $in: ['Scheduled', 'Confirmed'] }
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Conflict detected: Assigned broker already has an active visit scheduled at ${visitTime} on this date.`
      });
    }

    const appointment = await Appointment.create({
      companyId: req.companyId,
      customerId,
      propertyId,
      assignedBrokerId: broker,
      visitDate: new Date(visitDate),
      visitTime,
      meetingLocation: meetingLocation || 'At Property Site',
      status: 'Confirmed',
      notes
    });

    // Update customer lead stage to 'Site Visit Scheduled'
    await Lead.findOneAndUpdate(
      { customerId, companyId: req.companyId },
      { stage: 'Site Visit Scheduled', lastContactDate: new Date() }
    );

    // Populate for response
    await appointment.populate('customerId propertyId assignedBrokerId');

    // Trigger visit scheduled automation
    triggerAutomations('visit_scheduled', customerId, req.companyId, {
      propertyTitle: appointment.propertyId?.title || 'the selected property',
      visitTime: `${new Date(visitDate).toLocaleDateString()} at ${visitTime}`
    });

    await ActivityLog.create({
      companyId: req.companyId,
      userId: req.user.id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      action: 'SITE_VISIT_SCHEDULED',
      entityType: 'Appointment',
      entityId: appointment._id,
      details: { visitDate, visitTime }
    });

    res.status(201).json({
      success: true,
      message: 'Property site visit confirmed and scheduled.',
      appointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
const updateAppointment = async (req, res, next) => {
  try {
    const { status, visitDate, visitTime, meetingLocation, notes, feedback } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (status) appointment.status = status;
    if (visitDate) appointment.visitDate = new Date(visitDate);
    if (visitTime) appointment.visitTime = visitTime;
    if (meetingLocation) appointment.meetingLocation = meetingLocation;
    if (notes !== undefined) appointment.notes = notes;
    if (feedback) appointment.feedback = feedback;

    await appointment.save();

    if (status === 'Completed') {
      triggerAutomations('visit_completed', appointment.customerId, req.companyId);
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
const deleteAppointment = async (req, res, next) => {
  try {
    await Appointment.findOneAndDelete({ _id: req.params.id, companyId: req.companyId });
    res.status(200).json({ success: true, message: 'Appointment removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
};
