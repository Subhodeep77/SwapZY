import HowItWorksSection from "../components/HowItWorksSection";
import HeroSection from "../components/HeroSection";
import FeatureSection from "../components/FeatureSection";
import ProductHighlights from "../components/ProductHighlights";
import TestimonialSection from "../components/TestimonialSection";
import FAQSection from "../components/FAQSection";

const Home = () => {
  return (
    <>
      <HeroSection />
      <FeatureSection />
      <HowItWorksSection /> {/* ✅ Add it here */}
      <ProductHighlights />
      <TestimonialSection />
      <FAQSection/>
      <Footer/>
      {/* CTA or FAQ next */}
    </>
  );
};

export default Home;
