const express = require('express');
const router = express.Router();
const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMatchingCustomersForProperty,
  broadcastPropertyToMatches
} = require('../controllers/propertyController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getProperties);
router.post('/', createProperty);
router.get('/:id', getPropertyById);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);
router.get('/:id/matching-customers', getMatchingCustomersForProperty);
router.post('/:id/broadcast-matches', broadcastPropertyToMatches);

module.exports = router;
