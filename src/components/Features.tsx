import {
  Shield,
  Brain,
  Search,
  Bell,
  BarChart,
  Lock,
  Fingerprint,
  Zap
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Detection",
    description:
      "Advanced machine learning algorithms detect potential copyright infringement in real-time across the web.",
    color: "text-blue-600",
    gradient: "from-blue-50 to-blue-100",
  },
  {
    icon: Shield,
    title: "Blockchain Protection",
    description:
      "Immutable proof of ownership secured on the blockchain, providing undeniable evidence of your content rights.",
    color: "text-purple-600",
    gradient: "from-purple-50 to-purple-100",
  },
  {
    icon: Search,
    title: "Global Monitoring",
    description:
      "24/7 scanning across websites, social media, and marketplaces to find unauthorized use of your content.",
    color: "text-green-600",
    gradient: "from-green-50 to-green-100",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description:
      "Real-time notifications when potential infringement is detected, allowing for immediate action.",
    color: "text-red-600",
    gradient: "from-red-50 to-red-100",
  },
  {
    icon: BarChart,
    title: "Analytics Dashboard",
    description:
      "Comprehensive insights into your content protection status and potential threats.",
    color: "text-indigo-600",
    gradient: "from-indigo-50 to-indigo-100",
  },
  {
    icon: Lock,
    title: "DMCA Automation",
    description:
      "Automated DMCA takedown requests and legal documentation generation for swift content removal.",
    color: "text-yellow-600",
    gradient: "from-yellow-50 to-yellow-100",
  },
  {
    icon: Fingerprint,
    title: "Content Fingerprinting",
    description:
      "Unique digital signatures for your content that make it instantly recognizable across the internet.",
    color: "text-teal-600",
    gradient: "from-teal-50 to-teal-100",
  },
  {
    icon: Zap,
    title: "Quick Integration",
    description:
      "Easy-to-use API and plugins for seamless integration with your existing content management system.",
    color: "text-orange-600",
    gradient: "from-orange-50 to-orange-100",
  },
];

const Features = () => {
  return (
    <section className="py-20 px-4 lg:px-8" id="features">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Advanced Protection for Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Digital Content
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Comprehensive content protection powered by AI and blockchain technology,
            designed for creators and businesses of all sizes.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${feature.gradient} p-6 rounded-2xl hover:scale-105 transition-transform duration-300`}
            >
              <div className={`${feature.color} mb-4`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
