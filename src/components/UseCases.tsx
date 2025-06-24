
import { Palette, Code, Music, GraduationCap } from "lucide-react";

const useCases = [
  {
    icon: Palette,
    title: "Artist protecting illustrations",
    description: "Digital artists can instantly register their artwork and get alerted when someone uses their designs without permission.",
    example: "Sarah, a freelance illustrator, protected 50+ designs and caught 3 unauthorized uses in her first month."
  },
  {
    icon: Code,
    title: "Developer securing code snippets",
    description: "Developers can protect their original algorithms, libraries, and code implementations from unauthorized copying.",
    example: "Mark secured his open-source library and now tracks its legitimate vs. unauthorized usage across GitHub."
  },
  {
    icon: Music,
    title: "Musician publishing original tracks",
    description: "Musicians can register their compositions and lyrics before release to establish clear ownership rights.",
    example: "Indie band 'Echo Valley' protected their debut album and identified unauthorized sampling within 24 hours."
  },
  {
    icon: GraduationCap,
    title: "Course creators securing content",
    description: "Educators can protect their lesson plans, course materials, and educational videos from piracy.",
    example: "Online educator Lisa prevented unauthorized redistribution of her $2,000 course across 5 different platforms."
  }
];

const UseCases = () => {
  return (
    <section className="py-20 px-4 lg:px-8 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Use Cases
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how creators across different industries are protecting their work with ChainProof.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <div key={index} className="group">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-blue-200">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors duration-200">
                    <useCase.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {useCase.title}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {useCase.description}
                </p>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm text-blue-800 font-medium">
                    Real Example: {useCase.example}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
