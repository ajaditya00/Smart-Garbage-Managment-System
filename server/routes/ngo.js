import express from 'express';
import { getTasks, acceptTask } from '../controllers/ngoController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/tasks', protect, authorize('ngo'), getTasks);
router.put('/accept/:complaintId', protect, authorize('ngo'), acceptTask);

export default router;