
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import UseCases from "@/components/UseCases";
import Testimonials from "@/components/Testimonials";
import Technology from "@/components/Technology";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Hero />
      <HowItWorks />
      <Features />
      <UseCases />
      <Testimonials />
      <Technology />
      <CTABanner />
      <Footer />
    </div>
  );
};

export default Index;
