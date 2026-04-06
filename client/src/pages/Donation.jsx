import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, CreditCard, Gift, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import AnimatedCard from '../components/AnimatedCard';
import StatsCounter from '../components/StatsCounter';

const Donation = () => {
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonated: 0,
    donationCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const presetAmounts = [100, 500, 1000, 5000];

  useEffect(() => {
    fetchDonations();
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchDonations = async () => {
    try {
      const [donationsRes, statsRes] = await Promise.all([
        api.get('/donate/history'),
        api.get('/donate/stats')
      ]);

      setDonations(donationsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const createOrder = async (amount) => {
    try {
      const response = await api.post('/donate/create-order', {
        amount: amount * 100 // Convert to paisa
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  };

  const handlePayment = async () => {
    const amount = selectedAmount || customAmount;
    
    if (!amount || amount < 10) {
      toast.error('Minimum donation amount is ₹10');
      return;
    }

    if (amount > 100000) {
      toast.error('Maximum donation amount is ₹1,00,000');
      return;
    }

    setLoading(true);

    try {
      const orderData = await createOrder(amount);
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
        amount: orderData.amount,
        currency: 'INR',
        name: 'Swachh AI',
        description: 'Donation for Clean India Initiative',
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            // Verify payment
            await api.post('/donate/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            toast.success('Thank you for your donation! 🙏');
            setSelectedAmount('');
            setCustomAmount('');
            fetchDonations();
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || ''
        },
        theme: {
          color: '#10B981'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error('Payment failed. Please try again.');
        setLoading(false);
      });
      
      rzp.open();
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Support Clean India Initiative
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your donation helps fund cleanup drives, equipment, and technology 
              to make India cleaner and greener for future generations.
            </p>
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <Heart className="text-red-500" size={24} />
                <span className="text-lg font-medium text-gray-700">Make a difference</span>
              </div>
              <div className="flex items-center space-x-2">
                <Gift className="text-primary-500" size={24} />
                <span className="text-lg font-medium text-gray-700">Every rupee counts</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <AnimatedCard>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Donation</h2>
                
                {/* Preset Amounts */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choose Amount
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {presetAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount('');
                        }}
                        className={`p-4 border rounded-lg font-medium transition-colors ${
                          selectedAmount === amount
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        ₹{amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Enter Custom Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="10"
                      max="100000"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount('');
                      }}
                      className="pl-8 input-field"
                      placeholder="Enter amount"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum: ₹10 | Maximum: ₹1,00,000
                  </p>
                </div>

                {/* Donation Info */}
                <div className="bg-primary-50 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-primary-800 mb-2">Your Impact</h3>
                  <div className="text-sm text-primary-700 space-y-1">
                    <p>• ₹100 can provide cleanup tools for 2 volunteers</p>
                    <p>• ₹500 can fund a neighborhood cleanup drive</p>
                    <p>• ₹1000 can support waste segregation training</p>
                    <p>• ₹5000 can help deploy AI monitoring in a new area</p>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={(!selectedAmount && !customAmount) || loading}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white py-4 px-6 rounded-lg font-medium text-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      <span>
                        Donate {formatAmount(selectedAmount || customAmount || 0)}
                      </span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Secure payment powered by Razorpay • All donations are safe and encrypted
                </p>
              </div>
            </AnimatedCard>
          </div>

          {/* Stats & History Sidebar */}
          <div className="space-y-6">
            {/* Personal Stats */}
            <AnimatedCard delay={0.2}>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Your Contribution</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Donated</p>
                    <p className="text-2xl font-bold text-primary-600">
                      <StatsCounter 
                        end={stats.totalDonated} 
                        duration={2}
                        prefix="₹"
                      />
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Number of Donations</p>
                    <p className="text-2xl font-bold text-primary-600">
                      <StatsCounter 
                        end={stats.donationCount} 
                        duration={1.5}
                      />
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Recent Donations */}
            <AnimatedCard delay={0.4}>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Donations</h3>
                {initialLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : donations.length === 0 ? (
                  <div className="text-center py-6">
                    <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No donations yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {donations.map((donation) => (
                      <div
                        key={donation._id}
                        className="flex justify-between items-start border-b border-gray-100 pb-3"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatAmount(donation.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(donation.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {donation.status === 'success' ? (
                            <CheckCircle className="text-green-500" size={16} />
                          ) : (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          )}
                          <span className={`text-xs ${
                            donation.status === 'success' 
                              ? 'text-green-600' 
                              : 'text-yellow-600'
                          }`}>
                            {donation.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AnimatedCard>

            {/* Thank You Message */}
            <AnimatedCard delay={0.6}>
              <div className="p-6 text-center">
                <Heart className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-sm text-gray-600">
                  Every donation brings us closer to a cleaner, greener India. 
                  Your support makes a real difference in communities across the country.
                </p>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donation;