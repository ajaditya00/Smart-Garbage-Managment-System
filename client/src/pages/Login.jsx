import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, LogIn, Trash2, CheckCircle, ArrowRight, Mail, Lock, Users, MapPin, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' } })
};

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liveActivity, setLiveActivity] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);

  useEffect(() => {
    const baseURL = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/api`
      : '/api';
    axios.get(`${baseURL}/public/stats`)
      .then(r => {
        setPlatformStats(r.data);
        setLiveActivity(r.data.recentComplaints || []);
      })
      .catch(() => {});
  }, []);

  const statusMap = {
    pending: { label: 'Pending', color: 'text-yellow-400' },
    assigned: { label: 'Assigned', color: 'text-blue-400' },
    'in-progress': { label: 'In Progress', color: 'text-orange-400' },
    completed: { label: 'Resolved', color: 'text-emerald-400' },
    verified: { label: 'Verified', color: 'text-green-400' }
  };

  function timeAgo(d) {
    const diff = Math.floor((Date.now() - new Date(d)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  }

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) { toast.success('Welcome back! 👋'); navigate('/dashboard'); }
      else { toast.error(result.message); }
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  const quickFill = (email, password) => {
    setFormData({ email, password });
  };

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

        {/* Center content */}
        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight">
              Welcome back<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">
                to clean India. 🇮🇳
              </span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
              Your reports matter. Sign in and continue making a difference in your community.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { val: platformStats ? `${platformStats.resolutionRate}%` : '...', lab: 'Resolved', icon: CheckCircle, color: 'text-emerald-400' },
              { val: platformStats ? platformStats.totalUsers.toLocaleString('en-IN') : '...', lab: 'Members', icon: Users, color: 'text-blue-400' },
              { val: platformStats ? platformStats.totalComplaints.toLocaleString('en-IN') : '...', lab: 'Total', icon: BarChart3, color: 'text-yellow-400' }
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.15 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center"
              >
                <s.icon size={20} className={`${s.color} mx-auto mb-2`} />
                <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
                <p className="text-gray-500 text-xs mt-0.5">{s.lab}</p>
              </motion.div>
            ))}
          </div>

          {/* Real live activity */}
          <div className="space-y-3">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Live Activity</p>
            {liveActivity.length > 0 ? liveActivity.slice(0, 3).map((a, i) => {
              const st = statusMap[a.status] || { label: a.status, color: 'text-gray-400' };
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.15 }}
                  className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/5"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-700 flex items-center justify-center">
                      <MapPin size={12} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold truncate max-w-[130px]">{a.address}</p>
                      <p className="text-gray-500 text-[11px]">{timeAgo(a.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold ${st.color}`}>{st.label}</span>
                </motion.div>
              );
            }) : [
              { loc: 'Platform loading...', time: 'just now', st: 'Live', color: 'text-emerald-400' }
            ].map((a, i) => (
              <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center">
          <p className="text-gray-600 text-xs">© 2025 SGMS · Building Cleaner Communities 🌿</p>
        </div>
      </div>

      {/* ===== RIGHT PANEL (Form) ===== */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 sm:px-8 lg:px-12">
        <motion.div
          initial="hidden"
          animate="show"
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center space-x-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Trash2 size={18} className="text-white" />
            </div>
            <p className="text-gray-900 font-black text-sm">Smart Garbage Management System</p>
          </div>

          {/* Header */}
          <motion.div custom={0} variants={fadeUp} className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900">Sign in to your account</h1>
            <p className="text-gray-500">Don't have an account?{' '}
              <Link to="/register" className="text-emerald-600 font-bold hover:text-emerald-500 transition-colors">Register →</Link>
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <motion.div custom={1} variants={fadeUp}>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <input
                  id="email" name="email" type="email" required
                  value={formData.email} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="you@example.com"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div custom={2} variants={fadeUp}>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  id="password" name="password" type={showPassword ? 'text' : 'password'} required
                  value={formData.password} onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                  {showPassword ? <EyeOff size={16} className="text-gray-400 hover:text-gray-600" /> : <Eye size={16} className="text-gray-400 hover:text-gray-600" />}
                </button>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div custom={3} variants={fadeUp}>
              <button
                type="submit"
                disabled={loading}
                className="group w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl text-base transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Signing In...</span></>
                ) : (
                  <><LogIn size={18} /><span>Sign In</span><ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </motion.div>
          </form>

          {/* Demo Accounts */}
          <motion.div custom={4} variants={fadeUp}>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center"><span className="bg-gray-50 px-4 text-xs text-gray-400 font-semibold uppercase tracking-wide">Demo Accounts</span></div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: '👮 Admin', email: 'admin@swachhai.com', pass: 'admin123', color: 'border-red-200 hover:border-red-300 hover:bg-red-50' },
                { label: '🧑‍🔧 Employee', email: 'employee@swachhai.com', pass: 'employee123', color: 'border-orange-200 hover:border-orange-300 hover:bg-orange-50' },
                { label: '💚 NGO', email: 'ngo@swachhai.com', pass: 'ngo123', color: 'border-purple-200 hover:border-purple-300 hover:bg-purple-50' },
                { label: '🏠 Citizen', email: 'citizen@swachhai.com', pass: 'citizen123', color: 'border-blue-200 hover:border-blue-300 hover:bg-blue-50' }
              ].map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => quickFill(d.email, d.pass)}
                  className={`text-left p-3 bg-white border-2 rounded-xl transition-all duration-200 cursor-pointer ${d.color}`}
                >
                  <p className="text-xs font-bold text-gray-700">{d.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">{d.email}</p>
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">Click any card to auto-fill credentials</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;