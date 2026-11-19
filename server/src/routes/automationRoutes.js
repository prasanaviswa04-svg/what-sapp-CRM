const express = require('express');
const router = express.Router();
const {
  getAutomations,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  testExecuteAutomation
} = require('../controllers/automationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAutomations);
router.post('/', createAutomation);
router.put('/:id', updateAutomation);
router.delete('/:id', deleteAutomation);
router.post('/:id/execute', testExecuteAutomation);

module.exports = router;
