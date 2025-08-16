import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FeatureGallery = () => {
  const scrollToAgentPreview = () => {
    const agentElement = document.getElementById('agent-preview');
    if (agentElement) {
      agentElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      title: "AI-Generated Summaries",
      description: "Our advanced AI analyzes multiple news sources to create concise, accurate summaries of the day's most important tech developments.",
      icon: "🤖",
      color: "bg-gradient-to-br from-blue-500 to-blue-700"
    },
    {
      title: "Daily Updates", 
      description: "Fresh summaries delivered every day, keeping you consistently informed about the fast-moving tech landscape.",
      icon: "📅",
      color: "bg-gradient-to-br from-purple-500 to-purple-700"
    },
    {
      title: "Personalized AI Agent",
      description: "Ask app-related questions, clarify summaries, and explore topics—right inside Newt.",
      icon: "🧠",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-700",
      cta: {
        text: "See how it works",
        action: scrollToAgentPreview
      }
    },
    {
      title: "Points & Gamification",
      description: "Earn points for every summary you read. Build your score and compare with friends or colleagues.",
      icon: "🏆", 
      color: "bg-gradient-to-br from-green-500 to-green-700"
    },
    {
      title: "Reading Streaks",
      description: "Maintain your reading streak by checking in daily. Track your consistency and build a knowledge habit.",
      icon: "🔥",
      color: "bg-gradient-to-br from-orange-500 to-orange-700"
    },
    {
      title: "Social Features",
      description: "Follow other users, see what they're reading, and build your tech knowledge network.",
      icon: "👥",
      color: "bg-gradient-to-br from-teal-500 to-teal-700"
    }
  ];

  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Powerful Features to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Stay Informed</span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Discover how newt helps you efficiently stay on top of the tech world with 
            these innovative features designed for busy professionals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className={`h-24 flex items-center justify-center ${feature.color}`}>
                <span className="text-5xl">{feature.icon}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-blue-200 mb-4">{feature.description}</p>
                
                {feature.cta && (
                  <button
                    onClick={feature.cta.action}
                    className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors group-hover:underline"
                  >
                    {feature.cta.text} →
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGallery;
