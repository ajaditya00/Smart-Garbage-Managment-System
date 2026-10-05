import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, CreditCard, CheckCircle, Gift, Leaf, Sparkles,
  Shield, Zap, Users, TrendingUp, ArrowRight, Star, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import StatsCounter from '../components/StatsCounter';

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
        theme: { color: '#10b981' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Razorpay payment error:', err);
      toast.error('Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);
  const formatDate = (ds) => new Date(ds).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const activeAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount;
  const currentImpact = presetAmounts.find(p => p.value === selectedAmount)?.impact || 'Supports cleanup operational drives';

  return (
    <div className="space-y-6 text-left">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Sparkles className="text-brand-500" size={20} /> Capital Support Registry
        </h1>
        <p className="text-xs text-neutral-500">
          Support municipal cleanups, volunteer drives, and tools sourcing through transparent fund contributions.
        </p>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 rounded-2xl flex items-center space-x-3 text-xs text-emerald-700 dark:text-emerald-400 font-bold"
          >
            <CheckCircle size={16} />
            <span>Thank you! Your transaction completed successfully and has been cataloged.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column - Select Amount & Donate */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-6 space-y-6">
            
            {/* Presets amounts layout */}
            <div className="space-y-3">
              <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest">
                Select Predefined Support Tier
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {presetAmounts.map((preset) => {
                  const isSelected = selectedAmount === preset.value && !customAmount;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => { setSelectedAmount(preset.value); setCustomAmount(''); }}
                      className={`p-4 rounded-xl border-2 transition-all text-center flex flex-col justify-between cursor-pointer ${
                        isSelected 
                          ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/10' 
                          : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
                      }`}
                    >
                      <span className="text-xl mb-1 select-none">{preset.icon}</span>
                      <span className={`text-sm font-black ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-800 dark:text-neutral-100'}`}>
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-1.5">
              <label htmlFor="customAmount" className="block text-xs font-black text-neutral-500 uppercase tracking-widest">
                Or Specify Custom Capital
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 font-bold text-sm">
                  ₹
                </div>
                <input
                  id="customAmount"
                  type="number"
                  min="10"
                  max="100000"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(0); }}
                  className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                  placeholder="Enter custom amount"
                />
              </div>
            </div>

            {/* Impact Projection */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800 text-xs">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Impact projection</p>
              <p className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Leaf size={14} className="text-brand-500 shrink-0" />
                {customAmount ? `Provides clean supplies and equipment based on ₹${customAmount}` : currentImpact}
              </p>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-3 rounded-xl font-black text-xs bg-brand-500 text-white shadow-sm"
              icon={<CreditCard size={14} />}
            >
              {loading ? 'Processing order...' : `Donate ${activeAmount >= 10 ? formatAmount(activeAmount) : ''}`}
            </Button>

            {/* Secure Badges */}
            <div className="flex flex-wrap justify-center gap-6 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-black tracking-wider">
              {[
                { icon: Shield, text: 'Secure Gateway' },
                { icon: CheckCircle, text: '100% Tax Deductible' },
                { icon: Heart, text: 'Direct Clean Allocations' }
              ].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <badge.icon size={12} className="text-brand-500" />
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>

          </Card>
        </div>

        {/* Right Sidebar - Contribution metrics & History */}
        <div className="space-y-6">
          
          {/* User Stats summary */}
          <Card className="bg-brand-500 dark:bg-brand-950/20 text-white dark:text-brand-400 border border-brand-600 dark:border-brand-900/30 p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/80 dark:text-brand-400">
                Your Contribution Overview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 dark:bg-neutral-900/30 rounded-xl p-3.5 border border-white/5">
                  <p className="text-[9px] font-black text-white/70 dark:text-brand-500 uppercase tracking-widest mb-1 leading-none">Total Contributed</p>
                  <p className="text-xl font-black text-white dark:text-neutral-100">
                    {initialLoading ? '...' : formatAmount(stats.totalDonated)}
                  </p>
                </div>
                
                <div className="bg-white/10 dark:bg-neutral-900/30 rounded-xl p-3.5 border border-white/5">
                  <p className="text-[9px] font-black text-white/70 dark:text-brand-500 uppercase tracking-widest mb-1 leading-none">Transaction Count</p>
                  <p className="text-xl font-black text-white dark:text-neutral-100">
                    {initialLoading ? '...' : stats.donationCount}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Citizen history table */}
          <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm overflow-hidden p-0">
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
                Supporters History Log
              </h3>
            </div>
            
            <div className="p-3">
              {initialLoading ? (
                <div className="space-y-2">
                  {[1, 2].map(i => <div key={i} className="h-12 bg-neutral-50 dark:bg-neutral-950 rounded-xl animate-pulse" />)}
                </div>
              ) : donations.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs">
                  <Gift size={20} className="mx-auto mb-2 opacity-50" />
                  <span>No donations cataloged yet.</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {donations.map((d) => (
                    <div key={d._id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-brand-50/10 transition-colors">
                      <div className="text-xs">
                        <p className="font-bold text-neutral-800 dark:text-neutral-200">{formatAmount(d.amount)}</p>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">{formatDate(d.createdAt)}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                        Paid
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};

export default Donation;