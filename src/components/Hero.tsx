import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative px-4 pt-32 pb-20 sm:pt-40 sm:pb-32 lg:px-8 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-left space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">AI-Powered Protection</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900">
              Protect Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Digital Assets
              </span>{" "}
              with Blockchain
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl">
              ChainProof combines AI and blockchain technology to provide unbreakable protection for your digital content. 
              Detect and prevent unauthorized use in real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-200 hover:scale-105 w-full sm:w-auto">
                  Start Protecting Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <img src="https://randomuser.me/api/portraits/men/1.jpg" className="w-8 h-8 rounded-full border-2 border-white" alt="User" />
                  <img src="https://randomuser.me/api/portraits/women/2.jpg" className="w-8 h-8 rounded-full border-2 border-white" alt="User" />
                  <img src="https://randomuser.me/api/portraits/men/3.jpg" className="w-8 h-8 rounded-full border-2 border-white" alt="User" />
                </div>
                <p className="text-sm text-gray-600">
                  Joined by <span className="font-semibold">10,000+</span> creators
                </p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">99.9%</div>
                  <div className="text-sm text-gray-600">Protection Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">Monitoring</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">1M+</div>
                  <div className="text-sm text-gray-600">Assets Protected</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            {/* Main Dashboard Preview */}
            <div className="relative rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-2 shadow-2xl">
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-500">ChainProof Dashboard</div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Dashboard Content */}
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                    <div className="h-4 bg-blue-100 rounded-full w-1/2"></div>
                    <div className="h-4 bg-gray-100 rounded-full w-5/6"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                      <div className="h-3 bg-blue-200 rounded w-1/2 mb-2"></div>
                      <div className="h-6 bg-blue-300 rounded w-1/3"></div>
                    </div>
                    <div className="h-24 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                      <div className="h-3 bg-purple-200 rounded w-1/2 mb-2"></div>
                      <div className="h-6 bg-purple-300 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -right-4 -bottom-4 bg-white rounded-lg shadow-lg p-4 w-48 animate-bounce">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <div className="text-sm font-medium">Content Protected!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
