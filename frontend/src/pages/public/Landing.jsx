import React from 'react';
import PublicLayout from '../../components/PublicLayout';
import Hero from '../../components/public/Hero';
import FeatureRow from '../../components/public/FeatureRow';
import FeatureGallery from '../../components/public/FeatureGallery';
import AgentPreview from '../../components/public/AgentPreview';
import NarrativeSteps from '../../components/public/NarrativeSteps';
import FinalCTA from '../../components/public/FinalCTA';

const Landing = () => {
  return (
    <PublicLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <Hero />
        
        {/* Feature Rows */}
        <FeatureRow 
          title="Intelligence That Adapts"
          description="Our AI learns from thousands of tech publications to surface the most relevant stories. Get personalized summaries that match your interests and expertise level."
          mediaUrl="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1032&auto=format&fit=crop"
          className="backdrop-blur-sm bg-gray-900/30"
        />
        
        <FeatureRow 
          title="Built for Busy Professionals"
          description="Skip the information overload. Our bite-sized summaries are designed for your morning coffee routine, commute, or quick break between meetings."
          mediaUrl="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1032&auto=format&fit=crop"
          reverse={true}
        />
        
        {/* Feature Gallery */}
        <FeatureGallery />
        
        {/* Agent Preview */}
        <AgentPreview />
        
        {/* Narrative Steps */}
        <NarrativeSteps />
        
        {/* Final CTA */}
        <FinalCTA />
      </div>
    </PublicLayout>
  );
};

export default Landing;
