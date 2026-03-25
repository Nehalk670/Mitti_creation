import FestiveBanner from '../components/FestiveBanner';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ProductShowcase from '../components/ProductShowcase';
import AboutSection from '../components/AboutSection';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className="bg-[#0d0d0d]">
      <FestiveBanner />
      <Navbar />
      <HeroSection />
      <ProductShowcase />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default HomePage;
