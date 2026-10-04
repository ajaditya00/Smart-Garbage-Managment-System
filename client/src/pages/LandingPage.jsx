import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Trash2, MapPin, Users, BarChart3, CheckCircle, ArrowRight,
  Camera, Bell, Leaf, ShieldCheck, Award, Globe,
  Star, Heart, Recycle, Building2, PhoneCall, TrendingUp,
  Clock, AlertCircle, Sparkles, Shield, ArrowUpRight
} from 'lucide-react';
import StatsCounter from '../components/StatsCounter';
import Button from '../components/Button';
import Card from '../components/Card';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

const features = [
  { icon: Camera, title: 'Photo Reporting Logs', description: 'Snap and upload a picture of any local waste spot. The platform automatically tags GPS location parameters in under 30 seconds.', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  { icon: MapPin, title: 'Geographic Hotspot Tracking', description: 'Interactive Leaflet density maps displaying pending, assigned, and cleared spots across the city.', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
  { icon: Users, title: 'Role-Based Collaboration', description: 'Citizens, administrators, municipal officers, and NGOs operating together in a unified workspace portal.', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20' },
  { icon: Bell, title: 'Notification Channels', description: 'Real-time notifications keeping citizens updated at every phase from dispatch to cleanup approval.', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/20' },
  { icon: BarChart3, title: 'Executive SaaS Analytics', description: 'Admin overview metrics and Recharts reporting metrics measuring response times and resolution rate percentages.', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/20' },
  { icon: ShieldCheck, title: 'Mandatory Completion Proof', description: 'Crews must upload photo confirmation of the resolved site before it can be closed and verified by citizens.', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/20' }
];

const steps = [
  { step: '01', title: 'Citizen Reports', desc: 'Identify a waste spot, snap a photo, and submit. The platform records coordinates instantly.', icon: PhoneCall },
  { step: '02', title: 'Admin Dispatches', desc: 'System operators review the reported spot and assign the cleanup crew or volunteer NGO.', icon: Building2 },
  { step: '03', title: 'Crew Actioned', desc: 'Assigned municipal employees or NGO members head to the site, resolve the issue, and submit proof.', icon: Recycle },
  { step: '04', title: 'Verified & Rated', desc: 'Citizens verify the cleanup and submit feedback ratings to finalize and lock the log record.', icon: Star }
];

const partners = [
  { name: 'Swachh Bharat Mission', logo: 'SBM' },
  { name: 'National Green Tribunal', logo: 'NGT' },
  { name: 'Eco Earth Foundation', logo: 'EcoEarth' },
  { name: 'Urban Development Cell', logo: 'UDC' },
  { name: 'Clean Green Volunteers', logo: 'CGV' }
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Citizen Reporter, Pune', text: 'I reported a garbage dump near my local park and it was cleaned and resolved in 24 hours. The photo verification works beautifully!', avatar: 'PS' },
  { name: 'Rajesh Kumar', role: 'Municipal Officer, Ward 4', text: 'The executive dashboard has completely modernized our operations. Response rates and crew dispatch speed increased by 65%.', avatar: 'RK' },
  { name: 'Green Earth NGO', role: 'Community Partner Group', text: 'Having access to coordinates and live priority levels allows our volunteers to coordinate cleaning drives with precision.', avatar: 'GE' }
];

const LandingPage = () => {
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

  const statMetrics = [
    { label: 'Incidents Resolved', value: publicStats?.completedComplaints ?? 142, icon: CheckCircle, color: 'text-emerald-500' },
    { label: 'Active Citizens', value: publicStats?.totalUsers ?? 512, icon: Users, color: 'text-blue-500' },
    { label: 'Reports Logged', value: publicStats?.totalComplaints ?? 196, icon: AlertCircle, color: 'text-purple-500' },
    { label: 'Resolution Rate %', value: publicStats?.resolutionRate ?? 92, icon: TrendingUp, color: 'text-brand-500', suffix: '%' }
  ];

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 min-h-screen selection:bg-brand-500 selection:text-white transition-colors duration-300">
      
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 border-b border-neutral-200/50 dark:border-neutral-800/50">
        
        {/* Subtle grid visual background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
        
        {/* Decorative backdrop glow colors */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-[120px] opacity-70 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 py-12 relative z-10 text-center space-y-8">
          
          {/* Top Pill Alert */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-brand-50 dark:bg-brand-950/20 border border-brand-200/30 dark:border-brand-800/30 rounded-full px-4.5 py-1.5 shadow-sm"
          >
            <Sparkles size={14} className="text-brand-600 dark:text-brand-400" />
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-700 dark:text-brand-400">
              Next-Gen Municipal Operations platform
            </span>
          </motion.div>

          {/* Hero Main Header */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto text-neutral-900 dark:text-neutral-100"
          >
            Modernizing Waste Management With{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-400">
              AI Diagnostics.
            </span>
          </motion.h1>

          {/* Hero Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed"
          >
            Swachh AI connects citizens, municipal crews, and NGO volunteers to report, coordinate, and verify garbage hotspots automatically. 
          </motion.p>

          {/* Hero CTA buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <Link to="/register">
              <Button 
                variant="primary" 
                className="px-8 py-3.5 rounded-xl font-black text-sm shadow-md"
                icon={<ArrowRight size={16} />}
              >
                Launch Workspace
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                variant="secondary" 
                className="px-8 py-3.5 rounded-xl font-bold text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200"
              >
                Sign In
              </Button>
            </Link>
          </motion.div>
          
        </div>
      </section>

      {/* ===== PLATFORM REALTIME STATS COUNTERS ===== */}
      <section className="py-12 border-b border-neutral-200/50 dark:border-neutral-800/50 bg-white/50 dark:bg-neutral-900/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {statMetrics.map((m, idx) => (
              <div key={idx} className="text-center space-y-2 border-r last:border-r-0 border-neutral-200 dark:border-neutral-800/60 pr-4 last:pr-0">
                <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest leading-none">
                  {m.label}
                </p>
                <div className="text-2xl sm:text-3xl font-black text-neutral-800 dark:text-neutral-100 flex items-center justify-center gap-1.5">
                  <m.icon size={18} className={m.color} />
                  {statsLoading ? (
                    <span className="text-sm font-medium text-neutral-400">Loading...</span>
                  ) : (
                    <StatsCounter end={m.value} duration={1.5} suffix={m.suffix} color="text-neutral-800 dark:text-neutral-100" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURE CARDS SHOWCASE ===== */}
      <section className="py-24 max-w-6xl mx-auto px-6 space-y-16">
        <div className="text-center space-y-3">
          <span className="text-xs font-black text-brand-600 uppercase tracking-widest">Enterprise Core Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
            Engineered For Maximum Civic Efficiency
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
            Every component is fine-tuned to coordinate, audit, and log cleanups smoothly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <Card key={index} padding="p-6" className="border border-neutral-200/50 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${feat.bg} border border-neutral-100 dark:border-neutral-800`}>
                  <Icon size={20} className={feat.color} />
                </div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-brand-600 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-2.5 leading-relaxed">
                  {feat.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ===== HOW IT WORKS TIMELINE ===== */}
      <section className="py-24 border-t border-b border-neutral-200/50 dark:border-neutral-800/50 bg-white/40 dark:bg-neutral-900/10">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs font-black text-brand-600 uppercase tracking-widest">Workflow Operations</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
              The 4-Step Resolution Cycle
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
              Transparent cleanup execution workflows from complaint registration to verified closing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-neutral-200 dark:text-neutral-850 select-none">
                      {s.step}
                    </span>
                    <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-850 text-neutral-500">
                      <Icon size={16} />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {s.title}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="py-24 max-w-6xl mx-auto px-6 space-y-16">
        <div className="text-center space-y-3">
          <span className="text-xs font-black text-brand-600 uppercase tracking-widest">Community Voice</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
            Trusted By City Administrators & Citizens
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <Card key={idx} padding="p-6" className="border border-neutral-200/50 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm flex flex-col justify-between h-full">
              <p className="text-xs text-neutral-500 leading-relaxed italic">
                "{t.text}"
              </p>
              <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center font-bold text-brand-700 text-xs shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-200">{t.name}</h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{t.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== CIVIC PARTNERS LOGOS ===== */}
      <section className="py-16 border-t border-neutral-200/50 dark:border-neutral-800/50 bg-white/30 dark:bg-neutral-900/10">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-8">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Integrated with prominent frameworks</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50 dark:opacity-40">
            {partners.map((p, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Globe size={18} className="text-neutral-500" />
                <span className="text-xs font-black tracking-wider uppercase text-neutral-700 dark:text-neutral-300">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA END SECTION ===== */}
      <section className="py-24 max-w-4xl mx-auto px-6 text-center space-y-8">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-neutral-900 dark:text-neutral-50">
          Ready To Build A Cleaner Neighborhood?
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-lg mx-auto">
          Create your free citizen workspace profile today, log your first garbage spot, and coordinate cleanups with municipal crews and volunteers instantly.
        </p>
        <div className="flex justify-center pt-2">
          <Link to="/register">
            <Button 
              variant="primary" 
              className="px-8 py-3.5 rounded-xl font-black text-sm shadow-md"
              icon={<Sparkles size={16} />}
            >
              Sign Up Workspace
            </Button>
          </Link>
        </div>
      </section>

      {/* ===== PREMIUM FOOTER ===== */}
      <footer className="border-t border-neutral-200/50 dark:border-neutral-800/50 py-12 bg-white dark:bg-neutral-900/40">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-neutral-400">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-black">
              S
            </div>
            <div>
              <p className="font-bold text-neutral-700 dark:text-neutral-300 leading-none">Swachh AI</p>
              <p className="text-[9px] text-neutral-400 mt-0.5 uppercase tracking-widest">Inc. © {new Date().getFullYear()}</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 font-semibold text-neutral-500 dark:text-neutral-400">
            <Link to="/register" className="hover:text-brand-600 transition-colors">Workspace</Link>
            <Link to="/login" className="hover:text-brand-600 transition-colors">Sign In</Link>
            <a href="#" className="hover:text-brand-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-600 transition-colors">API Docs</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;