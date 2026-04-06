import express from 'express';
import {
  createAssignment,
  getAssignments,
  updateAssignment
} from '../controllers/assignmentController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { complaintUpload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAssignments)
  .post(restrictTo('admin'), createAssignment);

router.put('/:id', complaintUpload.single('proofImage'), updateAssignment);

export default router;