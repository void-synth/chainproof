import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTABanner = () => {
  return (
    <section className="py-20 px-4 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
          Stop content theft before it happens.
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of creators who trust ChainProof to protect their intellectual property. 
          Get started today with our free trial.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to="/login">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200"
            >
              Sign In
            </Button>
          </Link>
        </div>
        
        {/* Trust indicators */}
        <div className="mt-12 pt-8 border-t border-blue-500 border-opacity-30">
          <p className="text-blue-200 text-sm mb-4">Trusted by 10,000+ creators</p>
          <div className="flex justify-center items-center space-x-8 opacity-70">
            <div className="text-white text-sm">⭐⭐⭐⭐⭐ 4.9/5 rating</div>
            <div className="text-white text-sm">• 99.9% uptime</div>
            <div className="text-white text-sm">• SOC 2 compliant</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
