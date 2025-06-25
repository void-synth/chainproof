import { Upload, Shield, Search, AlertTriangle } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Content",
    description: "Simply upload your digital content - images, videos, text, or any digital asset you want to protect.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    number: "01",
  },
  {
    icon: Shield,
    title: "Secure on Blockchain",
    description: "Your content is automatically fingerprinted and secured with a unique hash on the blockchain.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    number: "02",
  },
  {
    icon: Search,
    title: "AI Monitoring",
    description: "Our AI continuously scans the internet for any unauthorized use of your protected content.",
    color: "text-green-600",
    bgColor: "bg-green-50",
    number: "03",
  },
  {
    icon: AlertTriangle,
    title: "Instant Action",
    description: "Receive alerts and take immediate action with automated DMCA takedown requests when violations are found.",
    color: "text-red-600",
    bgColor: "bg-red-50",
    number: "04",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-4 lg:px-8 relative overflow-hidden" id="how-it-works">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            How{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ChainProof
            </span>{" "}
            Works
          </h2>
          <p className="text-lg text-gray-600">
            Protect your content in four simple steps with our advanced AI and blockchain technology.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center font-bold text-sm text-gray-500 border border-gray-100">
                {step.number}
              </div>

              {/* Step Content */}
              <div className={`${step.bgColor} p-6 rounded-2xl h-full group-hover:scale-105 transition-transform duration-300`}>
                <div className={`${step.color} mb-4`}>
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>

              {/* Connector Line (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-[1px] bg-gray-200"></div>
              )}
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Get started in minutes. No technical knowledge required.{" "}
            <span className="font-semibold text-blue-600">
              Try it free for 14 days.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
