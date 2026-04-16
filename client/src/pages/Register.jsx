import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, UserPlus, User, Briefcase, Heart, Trash2, CheckCircle, ArrowRight, Phone, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' } })
};

const roles = [
  {
    value: 'citizen',
    label: 'Citizen',
    description: 'Report garbage & track resolutions',
    icon: User,
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    activeBg: 'bg-blue-500'
  },
  {
    value: 'employee',
    label: 'Municipal Employee',
    description: 'Manage & complete cleanup tasks',
    icon: Briefcase,
    gradient: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50',
    border: 'border-orange-400',
    activeBg: 'bg-orange-500'
  },
  {
    value: 'ngo',
    label: 'NGO Partner',
    description: 'Volunteer for community cleanup',
    icon: Heart,
    gradient: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-50',
    border: 'border-purple-400',
    activeBg: 'bg-purple-500'
  }
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'citizen', phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const result = await register({ name: formData.name, email: formData.email, password: formData.password, role: formData.role, phone: formData.phone });
      if (result.success) { toast.success('Welcome aboard! 🎉'); navigate('/dashboard'); }
      else { toast.error(result.message); }
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  const selectedRole = roles.find(r => r.value === formData.role);

  return (
    <div className="min-h-screen flex">
      {/* ===== LEFT PANEL ===== */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 relative overflow-hidden flex-col justify-between p-12">
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
        </div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-emerald-500 rounded-full blur-[150px] opacity-20"></div>
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-green-400 rounded-full blur-[120px] opacity-10"></div>

        {/* Logo */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Trash2 size={22} className="text-white" />
          </div>
          <div>
            <p className="text-white font-black text-base leading-tight">Smart Garbage</p>
            <p className="text-emerald-400 text-xs font-semibold tracking-wider">MANAGEMENT SYSTEM</p>
          </div>
        </div>

        {/* Centered content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-emerald-400 text-xs font-semibold">Join 500+ active members</span>
            </span>
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight">
              Be the change<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">your city needs.</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
              Join thousands of citizens building cleaner, healthier communities across India.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            {[
              'Report garbage issues in seconds',
              'Track resolution progress live',
              'Connect with municipal teams & NGOs',
              'Build a cleaner community together'
            ].map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className="w-6 h-6 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={13} className="text-emerald-400" />
                </div>
                <span className="text-gray-300 text-sm">{b}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative z-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center space-x-4">
            <div className="text-3xl">🏆</div>
            <div>
              <p className="text-white font-bold text-sm">Recognized Initiative</p>
              <p className="text-gray-400 text-xs">Supporting Clean India Mission 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL (Form) ===== */}
      <div className="flex-1 flex items-start justify-center bg-gray-50 overflow-y-auto py-10 px-4 sm:px-8 lg:px-12">
        <motion.div
          initial="hidden"
          animate="show"
          className="w-full max-w-lg space-y-7"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center space-x-3 mb-2">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Trash2 size={18} className="text-white" />
            </div>
            <p className="text-gray-900 font-black text-sm">Smart Garbage Management System</p>
          </div>

          {/* Header */}
          <motion.div custom={0} variants={fadeUp} className="space-y-1">
            <h1 className="text-3xl font-black text-gray-900">Create your account</h1>
            <p className="text-gray-500">Help make India cleaner — one report at a time.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selector */}
            <motion.div custom={1} variants={fadeUp}>
              <label className="block text-sm font-bold text-gray-700 mb-3">Choose your role</label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = formData.role === role.value;
                  return (
                    <label key={role.value} className="cursor-pointer">
                      <input type="radio" name="role" value={role.value} checked={isSelected} onChange={handleChange} className="sr-only" />
                      <div className={`relative p-4 rounded-2xl border-2 transition-all duration-300 text-center
                        ${isSelected
                          ? `border-transparent bg-gradient-to-br ${role.gradient} shadow-lg`
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center
                          ${isSelected ? 'bg-white/20' : role.bg}`}>
                          <Icon size={20} className={isSelected ? 'text-white' : 'text-gray-500'} />
                        </div>
                        <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-gray-700'}`}>{role.label}</p>
                        <p className={`text-[10px] mt-1 leading-tight hidden sm:block ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>{role.description}</p>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </motion.div>

            {/* Name + Phone */}
            <motion.div custom={2} variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Aditya Raj" />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone size={16} className="text-gray-400" />
                  </div>
                  <input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="+91-9999999999" />
                </div>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div custom={3} variants={fadeUp}>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="you@example.com" />
              </div>
            </motion.div>

            {/* Passwords */}
            <motion.div custom={4} variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-400" />
                  </div>
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Min. 6 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                    {showPassword ? <EyeOff size={16} className="text-gray-400 hover:text-gray-600" /> : <Eye size={16} className="text-gray-400 hover:text-gray-600" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-400" />
                  </div>
                  <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Repeat password" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                    {showConfirmPassword ? <EyeOff size={16} className="text-gray-400 hover:text-gray-600" /> : <Eye size={16} className="text-gray-400 hover:text-gray-600" />}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div custom={5} variants={fadeUp}>
              <button
                type="submit"
                disabled={loading}
                className="group w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl text-base transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Creating Account...</span></>
                ) : (
                  <><UserPlus size={18} /><span>Create Account</span><ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </motion.div>

            <motion.p custom={6} variants={fadeUp} className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-500 transition-colors">Sign In →</Link>
            </motion.p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;