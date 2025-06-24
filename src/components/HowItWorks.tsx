
import { Upload, Link, Search, Shield } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload content",
    description: "Drag & drop your files or paste your content into ChainProof"
  },
  {
    icon: Link,
    title: "Get blockchain timestamp & IPFS record",
    description: "Instant immutable proof of creation stored on blockchain"
  },
  {
    icon: Search,
    title: "AI checks the web for similar content",
    description: "Our AI scans the internet to detect potential copyright infringement"
  },
  {
    icon: Shield,
    title: "Receive ownership certificate & alerts",
    description: "Get legally verifiable proof and real-time piracy notifications"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-4 lg:px-8 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Protect your content in 4 simple steps. No technical expertise required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                {index + 1}
              </div>
              
              {/* Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-200 h-full">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <step.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-300 rotate-45 translate-x-1"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
