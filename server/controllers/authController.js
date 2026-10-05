import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { recordAuditLog } from '../utils/auditLogger.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'citizen',
      phone
    });

    if (user) {
      // Audit Log: CREATE User
      recordAuditLog({
        req,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        action: 'CREATE',
        resource: 'User',
        resourceId: user._id,
        target: { name: user.name, email: user.email, identifier: user._id.toString() },
        description: `New user account created: "${user.name}" (${user.email}) registered as ${user.role.toUpperCase()}`,
        details: {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      // Audit Log: LOGIN
      recordAuditLog({
        req,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        action: 'LOGIN',
        resource: 'Auth',
        resourceId: user._id,
        target: { name: user.name, email: user.email, identifier: user._id.toString() },
        description: `User "${user.name}" (${user.role.toUpperCase()}) authenticated successfully`,
        details: {
          email: user.email,
          role: user.role
        }
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        token: generateToken(user._id)
      });
    } else {
      // Audit Log failed login attempt
      recordAuditLog({
        req,
        action: 'LOGIN',
        resource: 'Auth',
        target: { email },
        description: `Failed login attempt for email: "${email}"`,
        details: { attemptedEmail: email },
        status: 'failed'
      });

      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    phone: req.user.phone
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array(), 
        message: errors.array()[0].msg 
      });
    }

    const { name, phone } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow updating permitted profile fields
    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();

    // Audit Log: UPDATE User Profile
    recordAuditLog({
      req,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      action: 'UPDATE',
      resource: 'User',
      resourceId: user._id,
      target: { name: user.name, email: user.email, identifier: user._id.toString() },
      description: `User "${user.name}" updated their profile`,
      details: {
        name: user.name,
        phone: user.phone
      }
    });

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { register, login, getMe, updateProfile };