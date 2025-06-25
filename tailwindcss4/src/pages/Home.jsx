import { useState } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import CarouselSlide from "../ui/CarouselSlide";
import FeatureCard from "../ui/FeatureCard";
import Footer from "../common/Footer";
import { Link } from "react-router-dom";
import IgImage from "../images/Ig.JPEG";
import ImImage from "../images/Im.JPEG";
import IvImage from "../images/Iv.JPEG";
import IxImage from "../images/Ix.JPEG";


const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => setCurrentSlide((prev) => (prev + 1) % 4);
  const handlePrev = () => setCurrentSlide((prev) => (prev === 0 ? 3 : prev - 1));

  return (
    <div className="flex flex-col items-center bg-blue-100 text-gray-900 p-6">
      <h1 className="text-4xl font-bold mb-6 text-center">Compassion International!</h1>

      <div className="relative w-full  ">
        {/* Carousel */}
        <Carousel 
          selectedItem={currentSlide}
          onChange={setCurrentSlide}
          showThumbs={false}
          showStatus={false}
          showIndicators={false}
          infiniteLoop
          autoPlay
          className="rounded-lg shadow-lg"
        >
          <CarouselSlide imgSrc={ IgImage} alt="Issue Tracking" primaryText="📌 Issue Tracking" secondaryText="Report and resolve any concerns you may be having quickly and efficiently." /> 

          <CarouselSlide imgSrc={ImImage} alt="Notifications" primaryText="🔔 Notifications" secondaryText="Get real-time updates on issue resolutions and  progress." /> 

          <CarouselSlide imgSrc={IvImage} alt="Reports & Insights" primaryText="📊 Reports & Insights" secondaryText="View  data and issue tracking reports in one place from fellow staff" />

          <CarouselSlide imgSrc={IxImage } alt="User Roles" primaryText="👤 User Roles" secondaryText="Custom dashboards for various staff at Compassion International" />
        </Carousel>

        {/* Navigation Buttons */}
        <button onClick={handlePrev} className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-md hover:bg-gray-700 transition">◀</button>
        <button onClick={handleNext} className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-md hover:bg-gray-700 transition">▶</button>
      </div>

      {/* Call-to-Action */}
      <div className="mt-10 text-center">
        <h2 className="text-2xl font-semibold">Communicate With Other Staff Of Compassion International</h2>
        <p className="mt-2 text-gray-700">Sign up today and enjoy communication seamlessly and efficiently.</p>
        <Link to="/account/signup">
          <button className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-500 transition">Get Started</button>
        </Link>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
        <FeatureCard title="Fast Issue Reporting" description="Easily report a concerns in a few clicks." icon="📝" />
        <FeatureCard title="Automated Notifications" description="Stay updated on issue resolutions instantly." icon="📢" />
        <FeatureCard title="Role-Based Dashboards" description="Personalized views for the staff Compassion International" icon="👥" />
      </div>

    

      <Footer />
    </div>
  );
};

export default HomePage; 