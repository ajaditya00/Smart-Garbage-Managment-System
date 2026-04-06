import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Camera, 
  MapPin, 
  Users, 
  Award, 
  Recycle, 
  TrendingUp,
  ArrowRight 
} from 'lucide-react';
import AnimatedCard from '../components/AnimatedCard';
import StatsCounter from '../components/StatsCounter';

const Landing = () => {
  const features = [
    {
      icon: Camera,
      title: 'Report Issues',
      description: 'Easily report garbage issues with photo evidence and location data',
    },
    {
      icon: MapPin,
      title: 'Real-time Tracking',
      description: 'Track the status of your complaints from reporting to resolution',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Connect citizens, NGOs, and municipal workers for effective cleanup',
    },
    {
      icon: Award,
      title: 'AI Powered',
      description: 'Smart categorization and priority assignment using AI technology',
    },
  ];

  const stats = [
    { label: 'Complaints Resolved', value: 15420, suffix: '+' },
    { label: 'Active Users', value: 5680, suffix: '+' },
    { label: 'NGOs Registered', value: 234, suffix: '+' },
    { label: 'Cities Covered', value: 45, suffix: '+' },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Report',
      description: 'Citizens report garbage issues with photos and location',
      icon: Camera,
    },
    {
      step: 2,
      title: 'Assign',
      description: 'Admin assigns tasks to employees or NGOs volunteer',
      icon: Users,
    },
    {
      step: 3,
      title: 'Clean',
      description: 'Assigned team cleans up and provides completion proof',
      icon: Recycle,
    },
    {
      step: 4,
      title: 'Verify',
      description: 'Citizens provide feedback and rate the cleanup quality',
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-primary min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
                Make India{' '}
                <span className="text-yellow-300">Swachh</span>{' '}
                with AI
              </h1>
              <p className="text-xl text-green-100 mb-8">
                AI-Powered Garbage Monitoring and Collection System that connects 
                citizens, NGOs, and municipal workers for a cleaner tomorrow.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/register"
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Get Started</span>
                  <ArrowRight size={20} />
                </Link>
                <Link
                  to="/register"
                  className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="w-full h-96 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <TrendingUp size={120} className="text-white/50" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <StatsCounter
                  end={stat.value}
                  suffix={stat.suffix}
                  duration={2}
                />
                <p className="text-gray-600 font-medium mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Swachh AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform makes garbage monitoring and collection 
              efficient, transparent, and community-driven.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <AnimatedCard
                  key={index}
                  delay={index * 0.1}
                  className="p-6 text-center"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </AnimatedCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple 4-step process to make your neighborhood cleaner
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative text-center"
                >
                  <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                  
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full">
                      <ArrowRight className="text-gray-300 mx-auto" size={24} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of citizens, NGOs, and municipal workers making India cleaner
            </p>
            <Link
              to="/register"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
            >
              <span>Start Your Journey</span>
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;