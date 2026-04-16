import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Trash2, MapPin, Users, BarChart3, CheckCircle, ArrowRight,
  Camera, Bell, Leaf, ShieldCheck, Award, Globe,
  Star, Heart, Recycle, Building2, PhoneCall, TrendingUp,
  Clock, AlertCircle
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } } };

const features = [
  { icon: Camera, title: 'Photo Reporting', description: 'Snap a picture of any garbage spot and submit instantly with GPS location auto-detection.', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
  { icon: MapPin, title: 'Live Location Tracking', description: 'Real-time GPS mapping of every reported complaint for precise, fast dispatch of cleanup crews.', color: 'from-orange-500 to-red-500', bg: 'bg-orange-50' },
  { icon: Users, title: 'Multi-Role Ecosystem', description: 'Citizens, administrators, municipal employees, and NGOs — all on one unified platform.', color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50' },
  { icon: Bell, title: 'Instant Notifications', description: 'Stay informed at every step — from complaint submission to final resolution and verification.', color: 'from-yellow-500 to-orange-400', bg: 'bg-yellow-50' },
  { icon: BarChart3, title: 'Analytics & Insights', description: 'Powerful dashboards giving administrators full visibility into city-wide waste management KPIs.', color: 'from-green-500 to-emerald-600', bg: 'bg-green-50' },
  { icon: ShieldCheck, title: 'Verified Resolutions', description: 'No work goes unverified. Photo proof of cleanup is mandatory before marking any task complete.', color: 'from-teal-500 to-cyan-600', bg: 'bg-teal-50' }
];

const steps = [
  { step: '01', title: 'Citizens Report', desc: 'Spot a problem? Capture it, confirm your location, and submit in under 30 seconds.', icon: PhoneCall },
  { step: '02', title: 'Admin Reviews', desc: 'Administrators instantly receive, verify, and assign the complaint to the right team.', icon: Building2 },
  { step: '03', title: 'Teams Act', desc: 'Municipal employees or NGO volunteers head to the site and resolve the issue.', icon: Recycle },
  { step: '04', title: 'Community Confirms', desc: 'Citizens verify the cleanup and rate the quality of work, closing the loop.', icon: Star }
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Citizen, Pune', text: 'I reported a garbage dump near my school and it was cleaned within 48 hours. Amazing!', avatar: 'PS' },
  { name: 'Rajesh Kumar', role: 'Municipal Officer, Delhi', text: 'The dashboard gives me complete control over all city complaints. Efficiency went up 60%.', avatar: 'RK' },
  { name: 'Green Earth NGO', role: 'Partner Organization', text: 'SGMS helped us coordinate cleanup drives across 12 locations simultaneously.', avatar: 'GE' }
];

const statusColors = {
  pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  assigned: { label: 'Assigned', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  'in-progress': { label: 'In Progress', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  completed: { label: 'Resolved', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  verified: { label: 'Verified', color: 'text-green-400', bg: 'bg-green-400/10' }
};

function timeAgo(dateString) {
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Animated number counter
function AnimCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target || target === 0) { setCount(0); return; }
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 24);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count.toLocaleString('en-IN')}{suffix}</span>;
}

const LandingPage = () => {
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);

  const featuresInView = useInView(featuresRef, { once: true, margin: '-80px' });
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: '-80px' });
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' });
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: '-80px' });

  const [publicStats, setPublicStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const baseURL = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/api`
      : '/api';
    axios.get(`${baseURL}/public/stats`)
      .then(r => setPublicStats(r.data))
      .catch(() => setPublicStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  // Dynamic stats from DB
  const dynamicStats = [
    {
      number: publicStats?.completedComplaints ?? 0,
      label: 'Complaints Resolved',
      icon: CheckCircle,
      suffix: '+'
    },
    {
      number: publicStats?.totalUsers ?? 0,
      label: 'Active Community Members',
      icon: Users,
      suffix: '+'
    },
    {
      number: publicStats?.totalComplaints ?? 0,
      label: 'Total Complaints Filed',
      icon: AlertCircle,
      suffix: '+'
    },
    {
      number: publicStats?.resolutionRate ?? 0,
      label: 'Resolution Rate',
      icon: TrendingUp,
      suffix: '%'
    }
  ];

  const recentActivity = publicStats?.recentComplaints ?? [];

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
        </div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[150px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-green-400 rounded-full blur-[120px] opacity-15"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-8">
              <motion.div variants={fadeUp} className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-5 py-2">
                <Leaf size={16} className="text-emerald-400" />
                <span className="text-emerald-400 text-sm font-semibold tracking-wide">Cleaner Cities Initiative 2025</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter">
                Smarter Waste,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">
                  Cleaner India.
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg">
                The <strong className="text-white">Smart Garbage Management System</strong> empowers every citizen to report, track, and verify waste disposal — creating accountability at every level of your community.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link to="/register" className="group inline-flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105">
                  <span>Get Started Free</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-lg border border-white/20 transition-all duration-300 hover:scale-105">
                  <span>Sign In</span>
                </Link>
              </motion.div>

              {/* Real user count */}
              <motion.div variants={fadeUp} className="flex items-center space-x-4 pt-2">
                <div className="flex -space-x-3">
                  {['👮', '🧑‍🌾', '👩‍💼', '🧑‍🔧'].map((emoji, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-sm">{emoji}</div>
                  ))}
                </div>
                <p className="text-gray-400 text-sm">
                  <span className="text-white font-bold">
                    {statsLoading ? '...' : (publicStats?.totalUsers ?? 0).toLocaleString('en-IN')}
                  </span>
                  {' '}active members on platform
                </p>
              </motion.div>
            </motion.div>

            {/* Right: Live Dashboard Card */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 space-y-6 shadow-2xl">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                        <Trash2 size={20} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">SGMS Live Dashboard</p>
                        <p className="text-gray-400 text-xs">Real-time data</p>
                      </div>
                    </div>
                    <span className="flex items-center space-x-1.5 bg-emerald-500/20 px-3 py-1 rounded-full">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                      <span className="text-emerald-400 text-xs font-semibold">Live</span>
                    </span>
                  </div>

                  {/* Recent complaints from DB */}
                  <div className="space-y-3">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                      <Clock size={12} /> Recent Activity
                    </p>
                    {statsLoading ? (
                      [...Array(3)].map((_, i) => (
                        <div key={i} className="h-14 bg-white/5 rounded-2xl animate-pulse"></div>
                      ))
                    ) : recentActivity.length > 0 ? recentActivity.slice(0, 3).map((item, i) => {
                      const st = statusColors[item.status] || { label: item.status, color: 'text-gray-400', bg: 'bg-gray-400/10' };
                      return (
                        <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.12 }}
                          className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors rounded-2xl px-5 py-3 border border-white/5"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                              <MapPin size={13} className="text-gray-400" />
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium truncate max-w-[160px]">{item.address}</p>
                              <p className="text-gray-500 text-xs">{timeAgo(item.createdAt)}</p>
                            </div>
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${st.color} ${st.bg} flex-shrink-0`}>{st.label}</span>
                        </motion.div>
                      );
                    }) : (
                      <p className="text-gray-500 text-sm text-center py-4">No recent activity yet</p>
                    )}
                  </div>

                  {/* Mini stats */}
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    {[
                      { val: statsLoading ? '...' : `${publicStats?.resolutionRate ?? 0}%`, lab: 'Resolution Rate' },
                      { val: statsLoading ? '...' : (publicStats?.completedComplaints ?? 0).toLocaleString('en-IN'), lab: 'Resolved' },
                      { val: statsLoading ? '...' : (publicStats?.totalUsers ?? 0).toLocaleString('en-IN'), lab: 'Members' }
                    ].map((s, i) => (
                      <div key={i} className="text-center bg-white/5 rounded-2xl py-4 px-2">
                        <p className="text-emerald-400 text-xl font-black">{s.val}</p>
                        <p className="text-gray-400 text-xs mt-1">{s.lab}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl px-5 py-3 flex items-center space-x-3 border border-gray-100"
                >
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="text-gray-900 font-bold text-sm">
                      {statsLoading ? '...' : `${publicStats?.totalComplaints ?? 0} Reports Filed`}
                    </p>
                    <p className="text-gray-500 text-xs">and counting!</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1200 0 960 80 720 40C480 0 240 80 0 40L0 80Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section ref={featuresRef} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate={featuresInView ? 'show' : 'hidden'} variants={stagger} className="text-center mb-20">
            <motion.span variants={fadeUp} className="inline-block bg-emerald-50 text-emerald-600 text-sm font-bold px-4 py-2 rounded-full mb-4 border border-emerald-100">✨ Platform Features</motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
              Everything you need for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-600">clean communities</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-gray-500 max-w-2xl mx-auto">
              A complete toolkit built for citizens, municipalities, and community organizations to collaborate effectively.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" animate={featuresInView ? 'show' : 'hidden'} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeUp} whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:border-gray-200 transition-all duration-300 cursor-default"
              >
                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6`}>
                  <div className={`w-8 h-8 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center`}>
                    <feature.icon size={18} className="text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section ref={howItWorksRef} className="py-24 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(34,197,94,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
        <div className="absolute top-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L1440 0L1440 40C1200 80 960 0 720 40C480 80 240 0 0 40L0 0Z" fill="white" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <motion.div initial="hidden" animate={howItWorksInView ? 'show' : 'hidden'} variants={stagger} className="text-center mb-20">
            <motion.span variants={fadeUp} className="inline-block bg-emerald-500/10 text-emerald-400 text-sm font-bold px-4 py-2 rounded-full mb-4 border border-emerald-500/20">📋 How It Works</motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
              Simple, transparent, <span className="text-emerald-400">accountable</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-gray-400 max-w-2xl mx-auto">
              From the moment a citizen spots a problem to the final verification — every step is tracked.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" animate={howItWorksInView ? 'show' : 'hidden'} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>
            {steps.map((step, index) => (
              <motion.div key={index} variants={fadeUp} className="relative text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                    <step.icon size={36} className="text-white" />
                  </div>
                  <span className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 border-2 border-emerald-500 text-emerald-400 text-xs font-black rounded-full flex items-center justify-center">{index + 1}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1200 0 960 80 720 40C480 0 240 80 0 40L0 80Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* ===== REAL STATS FROM DB ===== */}
      <section ref={statsRef} className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate={statsInView ? 'show' : 'hidden'} variants={stagger} className="text-center mb-16">
            <motion.span variants={fadeUp} className="inline-block bg-emerald-50 text-emerald-600 text-sm font-bold px-4 py-2 rounded-full mb-4 border border-emerald-100">📊 Live Platform Stats</motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
              Numbers that <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-600">tell the story</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-gray-500 mt-4 max-w-xl mx-auto">
              Real, live data from our platform — updated every time you load this page.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" animate={statsInView ? 'show' : 'hidden'} variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {dynamicStats.map((stat, index) => (
              <motion.div key={index} variants={scaleIn}
                className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon size={24} className="text-emerald-600" />
                </div>
                <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                  {statsLoading ? (
                    <div className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse mx-auto"></div>
                  ) : (
                    statsInView ? <AnimCounter target={stat.number} suffix={stat.suffix} /> : '0'
                  )}
                </div>
                <div className="text-gray-500 font-medium text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Total Donations */}
          {!statsLoading && publicStats?.totalDonations > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
            >
              <div className="text-center md:text-left">
                <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider mb-1">💚 Community Donations Received</p>
                <p className="text-white text-4xl font-black">
                  ₹{publicStats.totalDonations.toLocaleString('en-IN')}
                </p>
                <p className="text-emerald-100 text-sm mt-1">from generous citizens powering this initiative</p>
              </div>
              <Link to="/register" className="bg-white text-emerald-700 font-bold px-8 py-3 rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-2 flex-shrink-0">
                <Heart size={18} /> Donate & Support
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section ref={testimonialsRef} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate={testimonialsInView ? 'show' : 'hidden'} variants={stagger} className="text-center mb-16">
            <motion.span variants={fadeUp} className="inline-block bg-yellow-50 text-yellow-600 text-sm font-bold px-4 py-2 rounded-full mb-4 border border-yellow-100">⭐ Community Voices</motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
              Loved by communities<br /> across India
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" animate={testimonialsInView ? 'show' : 'hidden'} variants={stagger} className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -6 }}
                className="bg-gray-50 border border-gray-100 rounded-3xl p-8 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-8 text-[15px]">"{t.text}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">{t.avatar}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white/20 border border-white/30 rounded-full px-5 py-2">
              <Globe size={16} className="text-white" />
              <span className="text-white text-sm font-semibold">Join the Clean India Movement</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
              Ready to make your<br /> city cleaner?
            </h2>

            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              {statsLoading ? 'Join thousands of citizens...' : `Join ${publicStats?.totalUsers ?? 0} citizens`} taking responsibility for their communities. Every report matters. Every cleanup counts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/register" className="group inline-flex items-center justify-center space-x-2 bg-white text-emerald-700 font-black px-10 py-5 rounded-2xl text-lg hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-xl shadow-black/20">
                <span>Start Reporting Today</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center space-x-2 bg-white/10 border border-white/30 text-white font-bold px-10 py-5 rounded-2xl text-lg hover:bg-white/20 hover:scale-105 transition-all duration-300">
                <span>Already a Member? Login</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
              {['🏛️ Government Recognized', '🔒 100% Secure', '📱 Mobile Friendly', '🌿 Eco-Focused'].map((badge, i) => (
                <span key={i} className="text-emerald-100 text-sm font-semibold">{badge}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Trash2 size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Smart Garbage Management System</p>
                <p className="text-gray-500 text-xs">Building Cleaner Communities</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">© 2025 SGMS. Dedicated to a cleaner India. 🇮🇳</p>
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/register" className="hover:text-emerald-400 transition-colors">Register</Link>
              <Link to="/login" className="hover:text-emerald-400 transition-colors">Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;