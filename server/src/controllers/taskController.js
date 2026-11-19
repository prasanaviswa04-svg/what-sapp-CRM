const Task = require('../models/Task');

// @desc    Get all tasks
// @route   GET /api/tasks
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, assignedTo } = req.query;
    const query = { companyId: req.companyId };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'firstName lastName email')
      .populate('customerId', 'fullName phone')
      .populate('propertyId', 'propertyCode title')
      .sort({ dueDate: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, customerId, propertyId, priority = 'Medium', dueDate } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ success: false, message: 'title and dueDate are required.' });
    }

    const task = await Task.create({
      companyId: req.companyId,
      title,
      description,
      assignedTo: assignedTo || req.user.id,
      customerId: customerId || null,
      propertyId: propertyId || null,
      priority,
      dueDate: new Date(dueDate),
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const { status, priority, dueDate, title, description } = req.body;
    const task = await Task.findOne({ _id: req.params.id, companyId: req.companyId });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (status) {
      task.status = status;
      if (status === 'Completed') task.completedAt = new Date();
    }
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = new Date(dueDate);
    if (title) task.title = title;
    if (description !== undefined) task.description = description;

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated',
      task
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, companyId: req.companyId });
    res.status(200).json({ success: true, message: 'Task removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
