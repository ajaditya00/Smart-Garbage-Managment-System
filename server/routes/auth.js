import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['citizen']).withMessage('Invalid role'),
  body('phone').isMobilePhone().withMessage('Please include a valid phone number')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required')
];

const profileValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('phone').optional({ checkFalsy: true }).matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please enter a valid phone number')
];

router.post('/register', registerLimiter, registerValidation, register);
router.post('/login', loginLimiter, loginValidation, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, profileValidation, updateProfile);

export default router;