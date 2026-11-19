const express = require('express');
const router = express.Router();
const { getTeam, createMember, toggleMemberStatus } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getTeam);
router.post('/', createMember);
router.put('/:id/status', toggleMemberStatus);

module.exports = router;
