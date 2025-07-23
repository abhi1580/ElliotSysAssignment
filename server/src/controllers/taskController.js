const Task = require('../models/Task');

// Create a new task
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority } = req.body;
    if (!title || !dueDate || !priority) {
      return res.status(400).json({ message: 'Title, due date, and priority are required.' });
    }
    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      user: req.user.userId,
    });
    const io = req.app.get('io');
    io.emit('taskCreated', task);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

// Get all tasks (with pagination, filtering, search)
exports.getTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, priority, search } = req.query;
    const query = { user: req.user.userId };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const tasks = await Task.find(query)
      .sort({ dueDate: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Task.countDocuments(query);
    res.json({ tasks, total });
  } catch (err) {
    next(err);
  }
};

// Get a single task by ID
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

// Update a task
exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { title, description, dueDate, priority, status },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const io = req.app.get('io');
    io.emit('taskUpdated', task);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

// Delete a task
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const io = req.app.get('io');
    io.emit('taskDeleted', req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

// Toggle task status (complete/incomplete)
exports.toggleTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.status = task.status === 'complete' ? 'incomplete' : 'complete';
    await task.save();
    const io = req.app.get('io');
    io.emit('taskToggled', task);
    res.json(task);
  } catch (err) {
    next(err);
  }
}; 