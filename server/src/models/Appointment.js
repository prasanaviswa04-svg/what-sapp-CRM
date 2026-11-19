const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
    index: true
  },
  assignedBrokerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  visitDate: {
    type: Date,
    required: true,
    index: true
  },
  visitTime: {
    type: String,
    required: true // e.g. "11:30 AM"
  },
  meetingLocation: {
    type: String,
    default: 'At Property Site'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'Rescheduled', 'Completed', 'Cancelled', 'No Show'],
    default: 'Scheduled',
    index: true
  },
  notes: {
    type: String,
    default: ''
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: {
    type: Date
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
