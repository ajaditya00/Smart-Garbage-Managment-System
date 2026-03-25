import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Trash2, 
  MapPin, 
  Users, 
  BarChart3, 
  CheckCircle, 
  ArrowRight,
  Smartphone,
  Camera,
  Bell
} from 'lucide-react';
import { 
  heroTextVariants, 
  scrollRevealVariants, 
  staggerContainer,
  floatingVariants,
  pulseVariants 
} from '../utils/animations';
import Button from '../components/Button';

const LandingPage = () => {
  const featuresRef = React.useRef(null);
  const howItWorksRef = React.useRef(null);
  const statsRef = React.useRef(null);
  
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" });
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Camera,
      title: "Smart Reporting",
      description: "Upload photos and location details to report garbage instantly"
    },
    {
      icon: MapPin,
      title: "Location Tracking",
      description: "Real-time GPS tracking for accurate complaint mapping"
    },
    {
      icon: Users,
      title: "Multi-Role System",
      description: "Citizens, admins, employees, and NGOs working together"
    },
    {
      icon: Bell,
      title: "Real-time Updates",
      description: "Get notified about complaint status and cleanup progress"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive insights and performance metrics"
    },
    {
      icon: CheckCircle,
      title: "Verified Cleanup",
      description: "Photo verification of completed cleanup tasks"
    }
  ];

  const howItWorksSteps = [
    {
      step: "1",
      title: "Report Garbage",
      description: "Citizens capture photos and submit location-based complaints",
      icon: Smartphone
    },
    {
      step: "2",
      title: "Admin Assignment",
      description: "Administrators assign cleanup tasks to employees or NGOs",
      icon: Users
    },
    {
      step: "3", 
      title: "Task Completion",
      description: "Workers complete cleanup and upload verification photos",
      icon: CheckCircle
    },
    {
      step: "4",
      title: "Feedback & Rating",
      description: "Citizens provide feedback and ratings on completed work",
      icon: BarChart3
    }
  ];

  const stats = [
    { number: "10K+", label: "Complaints Resolved" },
    { number: "500+", label: "Active Users" },
    { number: "50+", label: "Partner NGOs" },
    { number: "98%", label: "Resolution Rate" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-100 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2322c55e" fill-opacity="0.05"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="initial"
              animate="animate" 
              variants={staggerContainer}
              className="space-y-6"
            >
              <motion.h1 
                variants={heroTextVariants}
                className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight"
              >
                Clean Cities,{" "}
                <span className="text-primary-600">Smart Solutions</span>
              </motion.h1>
              
              <motion.p 
                variants={heroTextVariants}
                className="text-lg md:text-xl text-gray-600 leading-relaxed"
              >
                AI-powered garbage monitoring system that connects citizens, administrators, 
                and cleanup teams for a cleaner, smarter city management experience.
              </motion.p>
              
              <motion.div 
                variants={heroTextVariants}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  as={Link}
                  to="/register"
                  size="lg"
                  icon={<ArrowRight size={20} />}
                >
                  Get Started Today
                </Button>
                
                <Button
                  as={Link}
                  to="/login"
                  variant="outline"
                  size="lg"
                >
                  Sign In
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div
              variants={floatingVariants}
              animate="animate"
              className="relative"
            >
              <div className="relative w-full h-96 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    variants={pulseVariants}
                    animate="animate"
                    className="text-white text-center"
                  >
                    <Trash2 size={80} className="mx-auto mb-4" />
                    <p className="text-xl font-semibold">Swachh AI Platform</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            animate={featuresInView ? "animate" : "initial"}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={scrollRevealVariants}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Powerful Features for Clean Cities
            </motion.h2>
            <motion.p 
              variants={scrollRevealVariants}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Our comprehensive platform brings together technology and community 
              action to tackle urban waste management challenges.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            animate={featuresInView ? "animate" : "initial"}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={scrollRevealVariants}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            animate={howItWorksInView ? "animate" : "initial"}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={scrollRevealVariants}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              How It Works
            </motion.h2>
            <motion.p 
              variants={scrollRevealVariants}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Simple, efficient process from complaint to completion
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            animate={howItWorksInView ? "animate" : "initial"}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={index}
                variants={scrollRevealVariants}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                    {step.step}
                  </div>
                  <step.icon className="w-8 h-8 text-primary-600 mx-auto" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            animate={statsInView ? "animate" : "initial"}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={scrollRevealVariants}
                className="text-center text-white"
              >
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-100 text-lg">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of citizens, administrators, and organizations 
              working together for cleaner, smarter cities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                as={Link}
                to="/register"
                size="lg"
                icon={<ArrowRight size={20} />}
              >
                Start Reporting Today
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;