// routes/matchRoutes.js
const express = require('express');
const { suggestMatches, sendMatch, getCustomerMatches, updateMatchStatus, getAIStatus } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/ai-status', getAIStatus);        // ← Gemini on/off check
router.get('/suggest/:customerId', suggestMatches);
router.post('/send', sendMatch);
router.get('/:customerId', getCustomerMatches);
router.put('/:matchId/status', updateMatchStatus);

module.exports = router;