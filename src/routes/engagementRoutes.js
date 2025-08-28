const express = require('express');
const router = express.Router();
const engagementController = require('../controllers/engagementController');

// Log a new engagement event
router.post('/engagement', engagementController.logEngagement);

// Fetch engagement logs (by session, user, or both)
router.get('/engagement', engagementController.getEngagementLogs);

module.exports = router;
