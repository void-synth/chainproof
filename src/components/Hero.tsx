
import { Button } from "@/components/ui/button";
import { Shield, Play } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative px-4 py-20 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center mb-8">
          <Shield className="w-8 h-8 text-blue-600 mr-2" />
          <span className="text-2xl font-bold text-gray-900">ChainProof</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl mb-6">
          Create. Protect.{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Prove.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto max-w-2xl text-xl text-gray-600 mb-8 leading-relaxed">
          AI + Blockchain copyright protection in one click.
        </p>

        {/* Supporting Text */}
        <p className="mx-auto max-w-3xl text-lg text-gray-500 mb-12">
          Instantly secure your original content through copyright protection and real-time piracy detection. 
          Built for creators who value their intellectual property.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 hover:scale-105">
            Try Free
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 hover:scale-105 flex items-center"
          >
            <Play className="w-5 h-5 mr-2" />
            Watch Demo
          </Button>
        </div>

        {/* Hero Visual Placeholder */}
        <div className="mx-auto max-w-4xl">
          <div className="relative rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-8 shadow-2xl">
            <div className="bg-white rounded-lg p-6 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-500">ChainProof Dashboard</span>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-blue-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg"></div>
                  <div className="h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg"></div>
                  <div className="h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
