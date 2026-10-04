import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, LogIn, Trash2, CheckCircle, ArrowRight, Mail, Lock, Users, MapPin, BarChart3, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import StatsCounter from '../components/StatsCounter';
import Button from '../components/Button';
import Card from '../components/Card';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' } })
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
    pending: { label: 'Pending', color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' },
    assigned: { label: 'Assigned', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    'in-progress': { label: 'In Progress', color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20' },
    completed: { label: 'Resolved', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    verified: { label: 'Verified', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' }
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
      if (result.success) { 
        toast.success('Welcome back! 👋'); 
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

  const quickFill = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
      
      {/* ===== LEFT PANEL (Saas Branding & Live Feed) ===== */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-neutral-950 via-neutral-900 to-emerald-950 relative overflow-hidden flex-col justify-between p-12">
        {/* Subtle grid layer */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-brand-500 rounded-full blur-[140px] opacity-10"></div>
        
        {/* Brand Header */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Trash2 size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-black text-sm leading-tight tracking-tight">Swachh AI</p>
            <p className="text-brand-400 text-[10px] font-black tracking-widest uppercase mt-0.5">SaaS workspace</p>
          </div>
        </div>

        {/* Center narrative & stats */}
        <div className="relative z-10 space-y-10 my-auto max-w-md">
          <div className="space-y-4">
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] tracking-tight">
              Empowering communities via{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-300">
                AI verification.
              </span>
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
              Log in to access reports mapping, dispatch tools, and NGO coordination parameters.
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { val: platformStats ? `${platformStats.resolutionRate}%` : '92%', lab: 'Resolved', icon: CheckCircle, color: 'text-emerald-400' },
              { val: platformStats ? platformStats.totalUsers : 512, lab: 'Members', icon: Users, color: 'text-blue-400' },
              { val: platformStats ? platformStats.totalComplaints : 196, lab: 'Complaints', icon: BarChart3, color: 'text-brand-400' }
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <s.icon size={18} className={`${s.color} mx-auto mb-2`} />
                <p className="text-base sm:text-lg font-black text-white">{s.val}</p>
                <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider mt-1">{s.lab}</p>
              </div>
            ))}
          </div>

          {/* Live Activity logs */}
          <div className="space-y-3.5">
            <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <Clock size={12} /> Live Incident Feed
            </p>
            {liveActivity.length > 0 ? liveActivity.slice(0, 2).map((a, i) => {
              const st = statusMap[a.status] || { label: a.status, color: 'text-neutral-400 bg-neutral-900' };
              return (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <MapPin size={12} className="text-neutral-400" />
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-white text-xs font-bold truncate max-w-[150px]">{a.address || 'Report Local Spot'}</p>
                      <p className="text-neutral-500 text-[10px] mt-0.5">{timeAgo(a.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${st.color}`}>
                    {st.label}
                  </span>
                </div>
              );
            }) : (
              <div className="h-14 bg-white/5 rounded-xl animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10">
          <p className="text-neutral-600 text-[10px] uppercase font-bold tracking-widest">© Swachh AI operations platform</p>
        </div>
      </div>

      {/* ===== RIGHT PANEL (Clean SaaS Form) ===== */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16">
        <div className="w-full max-w-sm space-y-8">
          
          {/* Header titles */}
          <div className="space-y-2.5 text-left">
            <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
              Sign In
            </h1>
            <p className="text-xs text-neutral-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-600 font-bold hover:text-brand-700 transition-colors">
                Create free workspace
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Mail size={16} />
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

            <div>
              <label htmlFor="password" className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5">
                Password Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-10 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-black text-xs shadow-sm bg-brand-500 hover:bg-brand-600 text-white"
            >
              {loading ? 'Authenticating credentials...' : 'Enter Workspace'}
            </Button>
          </form>

          {/* Quick Demo Cards */}
          <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest text-center">
              Quick Fill Demo Roles
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '👮 Admin', email: 'admin@swachhai.com', pass: 'admin123', style: 'hover:border-red-200 dark:hover:border-red-950/20 hover:bg-red-50/20' },
                { label: '🧑‍🔧 Employee', email: 'employee@swachhai.com', pass: 'employee123', style: 'hover:border-orange-200 dark:hover:border-orange-950/20 hover:bg-orange-50/20' },
                { label: '💚 NGO Group', email: 'ngo@swachhai.com', pass: 'ngo123', style: 'hover:border-purple-200 dark:hover:border-purple-950/20 hover:bg-purple-50/20' },
                { label: '🏠 Citizen', email: 'citizen@swachhai.com', pass: 'citizen123', style: 'hover:border-blue-200 dark:hover:border-blue-950/20 hover:bg-blue-50/20' }
              ].map((demo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => quickFill(demo.email, demo.pass)}
                  className={`text-left p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl transition-all cursor-pointer ${demo.style}`}
                >
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{demo.label}</p>
                  <p className="text-[9px] text-neutral-400 mt-0.5 truncate leading-none">{demo.email}</p>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-neutral-400 text-center italic">Click role cards to fill values automatically</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;