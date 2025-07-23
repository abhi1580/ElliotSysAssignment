const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes
router.use(authMiddleware);

// Create a new task
router.post('/', taskController.createTask);

// Get all tasks (with filtering, search, pagination)
router.get('/', taskController.getTasks);

// Get a single task by ID
router.get('/:id', taskController.getTaskById);

// Update a task
router.put('/:id', taskController.updateTask);

// Delete a task
router.delete('/:id', taskController.deleteTask);

// Toggle task status (complete/incomplete)
router.patch('/:id/toggle', taskController.toggleTaskStatus);

module.exports = router; 