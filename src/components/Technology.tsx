
import { Cpu, Database, Shield } from "lucide-react";

const technologies = [
  {
    icon: Cpu,
    title: "GPT API + Google Search API",
    description: "Advanced AI algorithms for content matching and similarity detection across the entire web."
  },
  {
    icon: Database,
    title: "Blockchain (Polygon) and IPFS",
    description: "Immutable storage and timestamping using cutting-edge blockchain technology for legal proof."
  },
  {
    icon: Shield,
    title: "Node.js and React",
    description: "Built on modern, scalable technology stack ensuring fast performance and reliability."
  }
];

const Technology = () => {
  return (
    <section className="py-20 px-4 lg:px-8 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Technology Behind ChainProof
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built with enterprise-grade technology for maximum security and reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {technologies.map((tech, index) => (
            <div key={index} className="text-center group">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <tech.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {tech.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {tech.description}
              </p>
            </div>
          ))}
        </div>

        {/* Tech Stack Visual */}
        <div className="mt-16 bg-gradient-to-r from-gray-900 to-blue-900 rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Powered by Leading Technologies</h3>
            <p className="text-blue-200">Trusted by enterprises worldwide</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center opacity-80">
            <div className="text-center">
              <div className="text-lg font-semibold">OpenAI</div>
              <div className="text-sm text-blue-200">GPT-4 API</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">Polygon</div>
              <div className="text-sm text-blue-200">Blockchain</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">IPFS</div>
              <div className="text-sm text-blue-200">Storage</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">Google</div>
              <div className="text-sm text-blue-200">Search API</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Technology;
