'use client';

import dynamic from 'next/dynamic';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';

const PainPoints = dynamic(() => import('./components/PainPoints'));
const HowItWorks = dynamic(() => import('./components/HowItWorks'));
const ROICalculator = dynamic(() => import('./components/ROICalculator'));
const FeatureGrid = dynamic(() => import('./components/FeatureGrid'));
const Pricing = dynamic(() => import('./components/Pricing'));
const Testimonials = dynamic(() => import('./components/Testimonials'));
const FAQ = dynamic(() => import('./components/FAQ'));
const CTAFooter = dynamic(() => import('./components/CTAFooter'));

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#08090a] font-body">
      <Navbar />
      <HeroSection />
      <PainPoints />
      <HowItWorks />
      <ROICalculator />
      <FeatureGrid />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTAFooter />
    </main>
  );
}
