import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, UserPlus, User, Briefcase, Heart, Trash2, CheckCircle, ArrowRight, Phone, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Card from '../components/Card';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' } })
};

const roles = [
  {
    value: 'citizen',
    label: 'Citizen',
    description: 'File reports & track',
    icon: User,
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-900',
    activeText: 'text-blue-600 dark:text-blue-400'
  },
  {
    value: 'employee',
    label: 'Employee',
    description: 'Dispatch & clean spots',
    icon: Briefcase,
    gradient: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    border: 'border-orange-200 dark:border-orange-900',
    activeText: 'text-orange-600 dark:text-orange-400'
  },
  {
    value: 'ngo',
    label: 'NGO Partner',
    description: 'Volunteer clean drives',
    icon: Heart,
    gradient: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-900',
    activeText: 'text-purple-600 dark:text-purple-400'
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

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-neutral-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score, label: 'Medium', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { 
      toast.error('Passwords do not match'); 
      return; 
    }
    if (formData.password.length < 6) { 
      toast.error('Password must be at least 6 characters'); 
      return; 
    }
    setLoading(true);
    try {
      const result = await register({ 
        name: formData.name, 
        email: formData.email, 
        password: formData.password, 
        role: formData.role, 
        phone: formData.phone 
      });
      if (result.success) { 
        toast.success('Welcome aboard! 🎉'); 
        navigate('/dashboard'); 
      } else { 
        toast.error(result.message); 
      }
    } catch { 
      toast.error('Something went wrong'); 
    } finally { 
      setLoading(false); 
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
      
      {/* ===== LEFT PANEL (Saas Branding & Benefits) ===== */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-neutral-950 via-neutral-900 to-emerald-950 relative overflow-hidden flex-col justify-between p-12">
        {/* Grid visual background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-emerald-500 rounded-full blur-[140px] opacity-10"></div>

        {/* Brand Logo */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Trash2 size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-black text-sm leading-tight tracking-tight">Swachh AI</p>
            <p className="text-brand-400 text-[10px] font-black tracking-widest uppercase mt-0.5">SaaS workspace</p>
          </div>
        </div>

        {/* Content & benefits */}
        <div className="relative z-10 space-y-10 my-auto max-w-md">
          <div className="space-y-4">
            <span className="inline-flex items-center space-x-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-1">
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
              <span className="text-brand-400 text-[10px] uppercase font-bold tracking-wider">Join Cleaner Cities Mission</span>
            </span>
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] tracking-tight">
              Be the change<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-300">
                your neighborhood needs.
              </span>
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
              Create an account and start managing municipal waste logs, mapping spots, or coordinating NGO volunteering drives.
            </p>
          </div>

          {/* Staggered lists */}
          <div className="space-y-4">
            {[
              'Report local garbage spots in under 30 seconds',
              'Track cleanup coordinates and progress in real-time',
              'Collaborate directly with municipal officers & NGOs',
              'Access auto-generated waste category AI analysis logs'
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center space-x-3 text-left">
                <div className="w-5.5 h-5.5 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center shrink-0 text-brand-400">
                  <CheckCircle size={12} />
                </div>
                <span className="text-xs text-neutral-300 leading-none">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer recognized block */}
        <div className="relative z-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center space-x-3.5 max-w-sm backdrop-blur-sm">
            <div className="text-2xl select-none">🏆</div>
            <div>
              <p className="text-white font-bold text-xs">Recognized Initiative</p>
              <p className="text-neutral-400 text-[10px] tracking-wide mt-0.5">Supporting Swachh Bharat Mission operations</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL (Forms) ===== */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto py-12 px-6 sm:px-12 lg:px-16">
        <div className="w-full max-w-lg space-y-7 my-auto">
          
          {/* Header titles */}
          <div className="space-y-2.5 text-left">
            <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
              Create Account
            </h1>
            <p className="text-xs text-neutral-500">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 font-bold hover:text-brand-700 transition-colors">
                Sign In →
              </Link>
            </p>
          </div>

          {/* Form container */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Roles selector radio buttons grid */}
            <div>
              <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-2.5">
                Workspace Role Category
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = formData.role === role.value;
                  return (
                    <label key={role.value} className="cursor-pointer">
                      <input 
                        type="radio" 
                        name="role" 
                        value={role.value} 
                        checked={isSelected} 
                        onChange={handleChange} 
                        className="sr-only" 
                      />
                      <div className={`p-4 rounded-2xl border-2 transition-all text-center h-full flex flex-col justify-between ${
                        isSelected 
                          ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/10' 
                          : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-350 dark:hover:border-neutral-700'
                      }`}>
                        <div className={`w-9 h-9 rounded-lg mx-auto mb-2 flex items-center justify-center ${
                          isSelected ? 'bg-brand-500 text-white' : role.bg + ' ' + role.activeText
                        }`}>
                          <Icon size={16} />
                        </div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
                          {role.label}
                        </p>
                        <p className="text-[9px] text-neutral-400 mt-1 leading-normal hidden sm:block">
                          {role.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Grid Name / Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <User size={14} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                    placeholder="Aditya Raj"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Phone size={14} />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                    placeholder="+91-9999999999"
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Mail size={14} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                  placeholder="you@swachh.ai"
                />
              </div>
            </div>

            {/* Passwords grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Lock size={14} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                    placeholder="Min. 6 chars"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {/* Strength Meter Bar */}
                {formData.password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-black text-neutral-400">
                      <span>STRENGTH: {passwordStrength.label}</span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: `${(passwordStrength.score / 4) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Lock size={14} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                    placeholder="Repeat password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-black text-xs shadow-sm bg-brand-500 hover:bg-brand-600 text-white"
            >
              {loading ? 'Creating workspace profile...' : 'Join Workspace'}
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Register;