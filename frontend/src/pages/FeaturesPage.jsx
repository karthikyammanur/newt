import React from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '../components/PublicLayout';

const FeaturesPage = () => {
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
                  <p className="text-blue-200">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 px-4 bg-gray-900/40 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 
            className="text-3xl font-bold mb-12 text-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            What Our Users Say
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                quote: "newt has become my go-to morning read. In just 5 minutes, I get caught up on everything I need to know about tech.",
                name: "Alex K.",
                role: "Software Engineer"
              },
              {
                quote: "The badges and streaks make staying informed actually fun. I've built a 60-day reading streak and learned so much.",
                name: "Mira J.",
                role: "Product Manager"
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-gray-800/30 p-6 rounded-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <p className="text-blue-100 italic mb-4">"{testimonial.quote}"</p>
                <p className="font-semibold text-white">{testimonial.name}</p>
                <p className="text-sm text-blue-300">{testimonial.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default FeaturesPage;
