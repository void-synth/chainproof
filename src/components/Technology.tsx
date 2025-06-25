import { Database, Network, Cpu, Lock } from "lucide-react";

const technologies = [
  {
    icon: Network,
    title: "Blockchain Infrastructure",
    description: "Built on Ethereum and IPFS for decentralized, immutable content protection.",
    features: [
      "Smart contract-based ownership records",
      "IPFS content addressing",
      "Proof of existence timestamps",
      "Decentralized storage",
    ],
  },
  {
    icon: Cpu,
    title: "AI & Machine Learning",
    description: "Advanced algorithms for content recognition and infringement detection.",
    features: [
      "Neural network image matching",
      "Natural language processing",
      "Pattern recognition",
      "Similarity analysis",
    ],
  },
  {
    icon: Database,
    title: "Data Processing",
    description: "High-performance content processing and real-time monitoring systems.",
    features: [
      "Distributed processing",
      "Real-time data streams",
      "Content fingerprinting",
      "Scalable architecture",
    ],
  },
  {
    icon: Lock,
    title: "Security & Privacy",
    description: "Enterprise-grade security measures to protect your intellectual property.",
    features: [
      "End-to-end encryption",
      "SOC 2 compliance",
      "GDPR compliance",
      "Regular security audits",
    ],
  },
];

const Technology = () => {
  return (
    <section className="py-20 px-4 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100" id="technology">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Powered by{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Advanced Technology
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Our cutting-edge technology stack ensures the highest level of content protection
            and infringement detection.
          </p>
        </div>

        {/* Technology Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {technologies.map((tech, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-lg">
                  <tech.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{tech.title}</h3>
                  <p className="text-gray-600">{tech.description}</p>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-3">
                {tech.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-2">
            Want to learn more about our technology?
          </p>
          <a
            href="#"
            className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            Read our Technical Whitepaper →
          </a>
        </div>
      </div>
    </section>
  );
};

export default Technology;
