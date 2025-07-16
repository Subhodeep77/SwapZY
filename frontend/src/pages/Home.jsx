import PageHelmet from "../components/PageHelmet";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import FeatureSection from "../components/FeatureSection";
import HowItWorksSection from "../components/HowItWorksSection";
import ProductHighlights from "../components/ProductHighlights";
import TestimonialSection from "../components/TestimonialSection";
import FAQSection from "../components/FAQSection";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <>
      <PageHelmet
        title="Home"
        description="Explore SwapZY – your campus marketplace for buying, selling, and swapping products easily. Discover how it works and what makes it awesome."
      />

      <Header />
      <HeroSection />
      <FeatureSection />
      <HowItWorksSection />
      <ProductHighlights />
      <TestimonialSection />
      {/* Add ID here for anchor navigation */}
      <section id="faqs">
        <FAQSection />
      </section>
      <Footer />
    </>
  );
};

export default Home;
