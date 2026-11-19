const User = require('../models/User');
const Lead = require('../models/Lead');
const Property = require('../models/Property');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all team members
// @route   GET /api/team
const getTeam = async (req, res, next) => {
  try {
    const users = await User.find({ companyId: req.companyId })
      .select('-password')
      .sort({ createdAt: 1 })
      .lean();

    const team = await Promise.all(
      users.map(async u => {
        const [activeLeads, assignedProperties] = await Promise.all([
          Lead.countDocuments({ companyId: req.companyId, assignedBrokerId: u._id, stage: { $ne: 'Lost' } }),
          Property.countDocuments({ companyId: req.companyId, assignedBrokerId: u._id })
        ]);

        return {
          ...u,
          name: `${u.firstName} ${u.lastName}`,
          activeLeadsCount: activeLeads,
          assignedPropertiesCount: assignedProperties
        };
      })
    );

    res.status(200).json({
      success: true,
      count: team.length,
      team
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a team member
// @route   POST /api/team
const createMember = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, role = 'Property Broker', password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide firstName, lastName, email, password' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    const user = await User.create({
      companyId: req.companyId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || '',
      role,
      password
    });

    await ActivityLog.create({
      companyId: req.companyId,
      userId: req.user.id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      action: 'TEAM_MEMBER_ADDED',
      entityType: 'User',
      entityId: user._id,
      details: { name: `${firstName} ${lastName}`, role, email }
    });

    res.status(201).json({
      success: true,
      message: 'Team member added successfully',
      member: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle member active status
// @route   PUT /api/team/:id/status
const toggleMemberStatus = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, companyId: req.companyId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Member ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTeam,
  createMember,
  toggleMemberStatus
};
