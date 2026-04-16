import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, CreditCard, CheckCircle, Gift, Leaf, Sparkles,
  Shield, Zap, Users, TrendingUp, ArrowRight, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const presetAmounts = [
  { value: 100, label: '₹100', icon: '🌱', impact: 'Provides cleanup tools for 2 volunteers' },
  { value: 500, label: '₹500', icon: '🚛', impact: 'Funds a full neighborhood cleanup drive' },
  { value: 1000, label: '₹1,000', icon: '🎓', impact: 'Supports waste segregation training' },
  { value: 5000, label: '₹5,000', icon: '🏙️', impact: 'Deploys monitoring in a new area' },
];

const impactPoints = [
  { icon: '🌿', stat: '10K+', label: 'Complaints Resolved' },
  { icon: '👥', stat: '500+', label: 'Active Volunteers' },
  { icon: '♻️', stat: '98%', label: 'Clean Rate' },
  { icon: '🏙️', stat: '50+', label: 'Cities Covered' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' } })
};

const Donation = () => {
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState('');
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({ totalDonated: 0, donationCount: 0 });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchDonations();
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (document.querySelector('script[src*="razorpay"]')) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const fetchDonations = async () => {
    try {
      const [donationsRes, statsRes] = await Promise.all([
        api.get('/donate/history'),
        api.get('/donate/stats')
      ]);
      setDonations(donationsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handlePayment = async () => {
    const amount = customAmount ? parseInt(customAmount) : selectedAmount;
    if (!amount || amount < 10) { toast.error('Minimum donation is ₹10'); return; }
    if (amount > 100000) { toast.error('Maximum donation is ₹1,00,000'); return; }

    setLoading(true);
    try {
      const orderData = await api.post('/donate/create-order', { amount: amount * 100 });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
        amount: orderData.data.amount,
        currency: 'INR',
        name: 'Smart Garbage Management System',
        description: 'Donation for Clean India Initiative',
        order_id: orderData.data.orderId,
        handler: async (response) => {
          try {
            await api.post('/donate/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
            setShowSuccess(true);
            setCustomAmount('');
            setSelectedAmount(500);
            fetchDonations();
            setTimeout(() => setShowSuccess(false), 5000);
          } catch { toast.error('Payment verification failed'); }
        },
        prefill: { name: user.name, email: user.email, contact: user.phone || '' },
        theme: { color: '#10B981' },
        modal: { ondismiss: () => setLoading(false) }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => { toast.error('Payment failed. Please try again.'); setLoading(false); });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatAmount = (a) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(a);
  const activeAmount = customAmount ? parseInt(customAmount) : selectedAmount;
  const selectedPreset = presetAmounts.find(p => p.value === selectedAmount);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===== SUCCESS OVERLAY ===== */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white rounded-[32px] p-12 max-w-md w-full mx-4 text-center shadow-2xl"
            >
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: 2 }}
                className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30"
              >
                <Heart size={48} className="text-white fill-white" />
              </motion.div>
              <h2 className="text-3xl font-black text-gray-900 mb-3">Thank You! 🙏</h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                Your generous donation is making India cleaner, one community at a time.
              </p>
              <div className="mt-8 bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <p className="text-emerald-700 font-semibold text-sm">💚 Your contribution has been recorded</p>
              </div>
              <button onClick={() => setShowSuccess(false)} className="mt-6 text-gray-400 text-sm hover:text-gray-600 transition-colors">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== HERO BANNER ===== */}
      <div className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-[150px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-400 rounded-full blur-[100px] opacity-15"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div initial="hidden" animate="show" className="text-center space-y-6">
            <motion.div custom={0} variants={fadeUp} className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-5 py-2">
              <Leaf size={16} className="text-emerald-400" />
              <span className="text-emerald-400 text-sm font-semibold">Clean India Initiative</span>
            </motion.div>

            <motion.h1 custom={1} variants={fadeUp} className="text-4xl md:text-6xl font-black text-white leading-tight">
              Every Rupee You Donate<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">
                Cleans a Street
              </span>
            </motion.h1>

            <motion.p custom={2} variants={fadeUp} className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Your contribution directly funds cleanup drives, equipment for volunteers, and community programs that turn garbage spots into green spaces.
            </motion.p>

            {/* Impact Stats */}
            <motion.div custom={3} variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4">
              {impactPoints.map((point, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <span className="text-2xl">{point.icon}</span>
                  <p className="text-emerald-400 font-black text-xl mt-1">{point.stat}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{point.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Wave */}
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60L1440 60L1440 30C1200 0 960 60 720 30C480 0 240 60 0 30L0 60Z" fill="#f9fafb" />
        </svg>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ===== LEFT: DONATION FORM ===== */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Card header */}
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Heart size={20} className="fill-white text-white" />
                  </div>
                  Make a Donation
                </h2>
                <p className="text-emerald-100 text-sm mt-1">Choose an amount and support a cleaner India</p>
              </div>

              <div className="p-8 space-y-8">
                {/* Preset amounts */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-4">Select Amount</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {presetAmounts.map((preset) => (
                      <motion.button
                        key={preset.value}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setSelectedAmount(preset.value); setCustomAmount(''); }}
                        className={`relative p-5 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer ${
                          selectedAmount === preset.value && !customAmount
                            ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100'
                            : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'
                        }`}
                      >
                        {selectedAmount === preset.value && !customAmount && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle size={14} className="text-emerald-500" />
                          </div>
                        )}
                        <span className="text-2xl mb-2 block">{preset.icon}</span>
                        <span className={`text-lg font-black block ${selectedAmount === preset.value && !customAmount ? 'text-emerald-700' : 'text-gray-900'}`}>
                          {preset.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Custom amount */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Or Enter Custom Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₹</span>
                    <input
                      type="number" min="10" max="100000"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(''); }}
                      className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-gray-900 text-lg font-bold focus:outline-none focus:border-emerald-500 focus:bg-emerald-50/30 transition-all placeholder-gray-300"
                      placeholder="Enter amount..."
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 ml-1">Minimum: ₹10 · Maximum: ₹1,00,000</p>
                </div>

                {/* Impact preview */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedAmount}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl p-6"
                  >
                    <h3 className="font-bold text-emerald-800 flex items-center gap-2 mb-4">
                      <Zap size={18} className="text-emerald-600" /> Your Impact
                    </h3>
                    <div className="space-y-2.5">
                      {presetAmounts.map((p) => (
                        <div key={p.value} className={`flex items-center gap-3 text-sm transition-all ${
                          (customAmount ? parseInt(customAmount) >= p.value : selectedAmount >= p.value)
                            ? 'text-emerald-700 font-semibold opacity-100'
                            : 'text-gray-400 opacity-60'
                        }`}>
                          <CheckCircle size={15} className={
                            (customAmount ? parseInt(customAmount) >= p.value : selectedAmount >= p.value)
                              ? 'text-emerald-500' : 'text-gray-300'
                          } />
                          <span>{p.icon} {p.impact}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Donate button */}
                <motion.button
                  whileHover={{ scale: activeAmount >= 10 ? 1.02 : 1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePayment}
                  disabled={!activeAmount || activeAmount < 10 || loading}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <><div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Processing...</span></>
                  ) : (
                    <>
                      <CreditCard size={22} />
                      <span>Donate {activeAmount >= 10 ? formatAmount(activeAmount) : '—'}</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </motion.button>

                {/* Trust row */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
                  {[
                    { icon: Shield, text: 'Secure Razorpay' },
                    { icon: CheckCircle, text: '100% Transparent' },
                    { icon: Heart, text: 'Goes to Cleanup' }
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold">
                      <t.icon size={14} className="text-emerald-500" /> {t.text}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ===== RIGHT SIDEBAR ===== */}
          <div className="space-y-6">

            {/* Your Contribution */}
            <motion.div initial="hidden" animate="show" custom={1} variants={fadeUp}
              className="bg-gradient-to-br from-emerald-500 to-green-700 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10"><Heart size={100} className="fill-white text-white" /></div>
              <h3 className="text-sm font-bold text-emerald-100 uppercase tracking-wider mb-5 flex items-center gap-2">
                <Star size={14} /> Your Contribution
              </h3>
              <div className="space-y-4 relative z-10">
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wide mb-1">Total Donated</p>
                  <p className="text-3xl font-black text-white">
                    {initialLoading ? '...' : formatAmount(stats.totalDonated)}
                  </p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wide mb-1">Number of Donations</p>
                  <p className="text-3xl font-black text-white">
                    {initialLoading ? '...' : stats.donationCount}
                  </p>
                </div>
              </div>
              {stats.donationCount > 0 && (
                <div className="mt-4 relative z-10 flex items-center gap-2 bg-white/10 rounded-xl p-3">
                  <span className="text-xl">🏅</span>
                  <p className="text-sm font-semibold text-emerald-100">
                    You're a valued contributor!
                  </p>
                </div>
              )}
            </motion.div>

            {/* Recent Donations */}
            <motion.div initial="hidden" animate="show" custom={2} variants={fadeUp}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-50">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <TrendingUp size={14} className="text-emerald-600" />
                  </div>
                  Donation History
                </h3>
              </div>

              <div className="p-4">
                {initialLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                ) : donations.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Gift size={28} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">No donations yet</p>
                    <p className="text-gray-400 text-xs mt-1">Make your first donation today!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {donations.map((donation) => (
                      <motion.div
                        key={donation._id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between bg-gray-50 hover:bg-emerald-50 transition-colors rounded-2xl px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Heart size={15} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-black text-gray-900 text-sm">{formatAmount(donation.amount)}</p>
                            <p className="text-gray-400 text-[11px]">{formatDate(donation.createdAt)}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          donation.status === 'success' || donation.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {donation.status === 'success' || donation.status === 'paid' ? '✓ Paid' : 'Pending'}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Thank You card */}
            <motion.div initial="hidden" animate="show" custom={3} variants={fadeUp}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-5"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(34,197,94,0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
              </div>
              <div className="relative z-10">
                <div className="text-4xl mb-3">🌍</div>
                <h3 className="font-black text-white text-lg mb-2">Together We Can!</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Every single donation brings us closer to a cleaner, greener, and healthier India.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-500 text-xs mt-2">Rated 5/5 by our community</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donation;