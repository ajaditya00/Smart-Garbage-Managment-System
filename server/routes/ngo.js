const express = require('express');
const { getTasks, acceptTask } = require('../controllers/ngoController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/tasks', protect, authorize('ngo'), getTasks);
router.put('/accept/:complaintId', protect, authorize('ngo'), acceptTask);

module.exports = router;