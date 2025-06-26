import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, TrendingUp, Users, Zap, Lock, Eye, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { label: "Content Protected", value: "10K+", icon: Shield, color: "text-blue-600" },
    { label: "Success Rate", value: "99.9%", icon: TrendingUp, color: "text-green-600" },
    { label: "Active Users", value: "5K+", icon: Users, color: "text-purple-600" },
    { label: "Fast Scans", value: "<30s", icon: Zap, color: "text-yellow-600" },
  ];

  // Cycle through stats every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 overflow-hidden">
      {/* Floating Background Orbs - Responsive */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 sm:w-64 lg:w-96 h-32 sm:h-64 lg:h-96 bg-gradient-to-r from-blue-300/20 to-purple-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-24 sm:w-48 lg:w-72 h-24 sm:h-48 lg:h-72 bg-gradient-to-r from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-20 sm:w-40 lg:w-60 h-20 sm:h-40 lg:h-60 bg-gradient-to-r from-indigo-300/20 to-blue-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 lg:pb-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Left Column - Content */}
          <div className={`space-y-6 sm:space-y-8 text-center lg:text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Main Heading - Responsive */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
              Protect Your{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-x bg-300%">
                  Digital Assets
                </span>
                <svg className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-2 sm:h-3" viewBox="0 0 300 12" fill="none">
                  <path d="M0 6 Q150 0 300 6" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>{" "}
              with Blockchain
            </h1>

            {/* Description - Responsive */}
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              ChainProof combines cutting-edge AI and blockchain technology to provide{" "}
              <span className="font-semibold text-gray-900">unbreakable protection</span> for your digital content. 
              Detect and prevent unauthorized use in real-time with military-grade security.
            </p>

            {/* Responsive Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4 justify-center lg:justify-start">
              <Link to="/signup" className="group">
                <Button 
                  size={isMobile ? "lg" : "lg"}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold group-hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-200/50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Start Protecting Now
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Button 
                size={isMobile ? "lg" : "lg"}
                variant="outline"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold hover:bg-gray-50 border-2"
              >
                Watch Demo
              </Button>
            </div>

            {/* Responsive Social Proof */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-2 justify-center lg:justify-start">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex -space-x-2 sm:-space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 sm:border-3 border-white bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Trusted by <span className="font-bold text-gray-900">10,000+</span> creators worldwide
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs sm:text-sm text-gray-600 ml-1">4.9/5 rating</span>
              </div>
            </div>

            {/* Responsive Animated Stats */}
            <div className="pt-6 sm:pt-8 border-t border-gray-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  const isActive = currentStat === index;
                  
                  return (
                    <div 
                      key={stat.label}
                      className={`text-center transition-all duration-500 ${
                        isActive ? 'scale-105 sm:scale-110 transform' : 'scale-100'
                      }`}
                    >
                      <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full mb-2 transition-all duration-300 ${
                        isActive ? 'bg-gradient-to-r from-blue-100 to-purple-100' : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? stat.color : 'text-gray-500'}`} />
                      </div>
                      <div className={`text-lg sm:text-2xl font-bold transition-colors duration-300 ${
                        isActive ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Responsive Enhanced Visual */}
          <div className={`relative order-first lg:order-last transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            {/* Responsive Main Dashboard Preview */}
            <div className="relative group">
              <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-xl sm:rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-all duration-300"></div>
              
              <div className="relative rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-0.5 sm:p-1 shadow-2xl transform group-hover:scale-105 transition-all duration-500">
                <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden">
                  {/* Responsive Browser Header */}
                  <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gray-50">
                    <div className="flex space-x-1.5 sm:space-x-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 font-medium hidden sm:block">ChainProof Dashboard</div>
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600">Live</span>
                    </div>
                  </div>
                  
                  {/* Responsive Dashboard Content */}
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-white to-gray-50">
                    {/* Header Section */}
                    <div className="space-y-2 sm:space-y-3">
                      <div className="h-4 sm:h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-3/4 animate-pulse"></div>
                      <div className="h-3 sm:h-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg w-1/2 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    
                    {/* Responsive Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="h-20 sm:h-28 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200 transform hover:scale-105 transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="h-2 sm:h-3 bg-blue-300 rounded w-1/2 animate-pulse"></div>
                          <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        </div>
                        <div className="h-6 sm:h-8 bg-blue-400 rounded w-1/3 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      
                      <div className="h-20 sm:h-28 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-200 transform hover:scale-105 transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="h-2 sm:h-3 bg-purple-300 rounded w-1/2 animate-pulse"></div>
                          <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                        </div>
                        <div className="h-6 sm:h-8 bg-purple-400 rounded w-1/3 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                      </div>
                    </div>

                    {/* Responsive Chart Placeholder */}
                    <div className="h-16 sm:h-24 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border">
                      <div className="flex items-end space-x-1 sm:space-x-2 h-full">
                        {[...Array(isMobile ? 6 : 8)].map((_, i) => (
                          <div 
                            key={i}
                            className="bg-gradient-to-t from-blue-400 to-purple-400 rounded-t flex-1 animate-pulse"
                            style={{ 
                              height: `${Math.random() * 60 + 20}%`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Responsive Floating Notification Cards */}
            <div className="absolute -right-4 sm:-right-6 top-8 sm:top-12 bg-white rounded-lg sm:rounded-xl shadow-xl p-3 sm:p-4 w-44 sm:w-56 border animate-bounce">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">Content Protected!</div>
                  <div className="text-xs text-gray-500">Blockchain verified</div>
                </div>
              </div>
            </div>

            <div className="absolute -left-4 sm:-left-6 bottom-12 sm:bottom-16 bg-white rounded-lg sm:rounded-xl shadow-xl p-3 sm:p-4 w-40 sm:w-52 border animate-bounce" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">Scan Complete</div>
                  <div className="text-xs text-gray-500">No violations found</div>
                </div>
              </div>
            </div>

            <div className="absolute -right-2 sm:-right-4 bottom-4 sm:bottom-8 bg-white rounded-lg sm:rounded-xl shadow-xl p-3 sm:p-4 w-36 sm:w-48 border animate-bounce" style={{ animationDelay: '2s' }}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">Certificate Ready</div>
                  <div className="text-xs text-gray-500">Download available</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive CTA Banner */}
        <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
          <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full text-xs sm:text-sm text-blue-700 font-medium">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-600" />
            Free tier available - No credit card required
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
