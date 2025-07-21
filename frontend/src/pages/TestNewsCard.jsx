import React from 'react';
import Layout from '../components/Layout';
import NewsCard from '../components/NewsCard';
import NewsCardNew from '../components/NewsCardNew';
import SimpleNewsCard from '../components/SimpleNewsCard';

const TestNewsCard = () => {
  const dummySummary = {
    topic: "AI/ML",
    title: "Revolutionary AI Breakthrough Transforms Industry",
    summary: "A groundbreaking artificial intelligence development has emerged that could revolutionize multiple industries. The new AI system demonstrates unprecedented capabilities in understanding and generating human-like responses while maintaining ethical guidelines. This breakthrough represents years of research and development in machine learning algorithms and neural network architectures.\n\nThe implications of this advancement extend far beyond traditional AI applications, potentially transforming healthcare, education, finance, and countless other sectors. Researchers have focused on creating systems that not only perform tasks efficiently but also understand context and nuance in ways previously thought impossible.\n\nIndustry experts are calling this development a watershed moment in artificial intelligence, comparing its potential impact to the introduction of the internet itself.",
    timestamp: new Date().toISOString(),
    sources: [
      {
        title: "TechCrunch - AI Breakthrough Report",
        url: "https://techcrunch.com/ai-breakthrough",
        description: "Comprehensive coverage of the latest AI developments and their industry implications.",
        type: "News Article",
        domain: "techcrunch.com"
      }
    ],
    summaryId: "test-summary-1"
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-blue-100 mb-4">
              NewsCard Component Test
            </h1>
            <p className="text-blue-300 mb-4">
              Testing different NewsCard component variants and their functionality
            </p>
          </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Simple NewsCard */}
            <div>
              <h2 className="text-xl font-bold text-blue-100 mb-4">Simple NewsCard</h2>
              <SimpleNewsCard
                topic={dummySummary.topic}
                summary={dummySummary.summary}
                title={dummySummary.title}
              />
            </div>
            
            {/* New Clean NewsCard */}
            <div>
              <h2 className="text-xl font-bold text-blue-100 mb-4">New Clean NewsCard</h2>
              <NewsCardNew
                topic={dummySummary.topic}
                summary={dummySummary.summary}
                timestamp={dummySummary.timestamp}
                title={dummySummary.title}
                sources={dummySummary.sources}
                summaryId={dummySummary.summaryId}
              />
            </div>
            
            {/* Original Complex NewsCard */}
            <div>
              <h2 className="text-xl font-bold text-blue-100 mb-4">Original NewsCard</h2>
              <NewsCard
                topic={dummySummary.topic}
                summary={dummySummary.summary}
                timestamp={dummySummary.timestamp}
                title={dummySummary.title}
                sources={dummySummary.sources}
                summaryId={dummySummary.summaryId}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TestNewsCard;
