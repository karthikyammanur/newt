import React from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '../components/PublicLayout';

const FeaturesPage = () => {
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
      title: "Daily Updates",
      description: "Fresh summaries delivered every day, keeping you consistently informed about the fast-moving tech landscape.",
      icon: "📅",
      color: "bg-gradient-to-br from-purple-500 to-purple-700"
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
      title: "Achievement Badges",
      description: "Unlock special badges for milestones like reading streaks, early morning reads, or topic mastery.",
      icon: "🎖️",
      color: "bg-gradient-to-br from-yellow-500 to-yellow-700"
    },
    {
      title: "Personalized Dashboard",
      description: "Visualize your reading habits with custom charts and analytics showing your most-read topics and activity patterns.",
      icon: "📊",
      color: "bg-gradient-to-br from-red-500 to-red-700"
    },
    {
      title: "Social Features",
      description: "Follow other users, see what they're reading, and build your tech knowledge network.",
      icon: "👥",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-700"
    },
    {
      title: "Topic Exploration",
      description: "Browse past summaries by topic to deep-dive into subjects that matter most to you.",
      icon: "🔍",
      color: "bg-gradient-to-br from-teal-500 to-teal-700"
    }
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <motion.div 
          className="max-w-6xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Powerful Features to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Stay Informed</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Discover how newt helps you efficiently stay on top of the tech world with 
            these innovative features designed for busy professionals.
          </p>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-10 px-4 mb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
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

      {/* AI Agent Preview Section */}
      <section id="agent-preview" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 text-center shadow-2xl border border-gray-700/50"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-6xl mb-4">🧠</div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ask Newt, your AI copilot
              </h2>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                Get instant answers about your reading habits, clarify complex topics, 
                or discover trending subjects—all through natural conversation.
              </p>
            </motion.div>

            {/* Chat Preview Mock */}
            <motion.div 
              className="bg-gray-900/50 rounded-xl p-6 mb-8 text-left max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  N
                </div>
                <span className="text-blue-100 text-sm">Newt AI</span>
              </div>
              
              <div className="space-y-3">
                <div className="bg-gray-800 rounded-lg p-3 text-sm text-blue-100">
                  What are the trending topics this week?
                </div>
                
                <div className="bg-blue-600 rounded-lg p-3 text-sm text-white ml-4">
                  Based on your reading, AI and quantum computing are trending...
                  
                  {/* Typing animation */}
                  <motion.div 
                    className="flex space-x-1 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <motion.div 
                      className="w-1 h-1 bg-blue-200 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div 
                      className="w-1 h-1 bg-blue-200 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                    />
                    <motion.div 
                      className="w-1 h-1 bg-blue-200 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <a 
                href="/coming-soon"
                className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Try it soon
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default FeaturesPage;
