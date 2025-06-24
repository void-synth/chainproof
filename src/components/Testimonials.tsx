
const testimonials = [
  {
    quote: "ChainProof saved my business. I caught someone selling my course on three different platforms within hours of them posting it.",
    author: "Jessica Chen",
    role: "Online Course Creator",
    avatar: "JC"
  },
  {
    quote: "As a freelance developer, protecting my code snippets used to be impossible. Now I have instant proof of ownership for everything I create.",
    author: "Alex Rodriguez",
    role: "Full-Stack Developer",
    avatar: "AR"
  },
  {
    quote: "The real-time alerts are game-changing. I've prevented multiple copyright infringements before they could spread.",
    author: "Maya Thompson",
    role: "Digital Artist",
    avatar: "MT"
  },
  {
    quote: "Finally, a solution that understands creators. The blockchain proof gives me legal standing I never had before.",
    author: "David Kim",
    role: "Indie Musician",
    avatar: "DK"
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 px-4 lg:px-8 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            What Creators Are Saying
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of creators who trust ChainProof to protect their intellectual property.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200">
              <div className="mb-6">
                <svg className="w-8 h-8 text-blue-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-700 leading-relaxed italic text-lg">
                  "{testimonial.quote}"
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
