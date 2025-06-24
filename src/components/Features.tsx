
import { Zap, Bell, Shield, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant proof of originality",
    description: "Get immediate blockchain-based proof of your content's creation date and authenticity."
  },
  {
    icon: Bell,
    title: "Real-time piracy alerts",
    description: "Receive instant notifications when our AI detects unauthorized use of your content across the web."
  },
  {
    icon: Shield,
    title: "Legally verifiable ownership certificate",
    description: "Download court-admissible certificates that prove your intellectual property rights."
  },
  {
    icon: BarChart3,
    title: "Dashboard with registration & alerts history",
    description: "Track all your protected content and monitor infringement alerts in one centralized dashboard."
  }
];

const Features = () => {
  return (
    <section className="py-20 px-4 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Key Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to protect your intellectual property and catch infringers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-6">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
