import React from 'react';
import Hero from '../components/home/Hero';
import FeaturedBooks from '../components/home/FeaturedBooks';
import HowItWorks from '../components/home/HowItWorks';
import Testimonials from '../components/home/Testimonials';
import CTASection from '../components/home/CTASection';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <FeaturedBooks />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </div>
  );
};

export default HomePage;