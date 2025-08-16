import React from 'react';
import { motion } from 'framer-motion';

const NarrativeSteps = () => {
  const steps = [
    {
      title: "Wake up to Today's Tech",
      subtitle: "(auto-curated)",
      description: "Start your morning with fresh, AI-curated summaries of the most important tech developments. No more hunting through dozens of news sources.",
      side: "right",
      mockContent: (
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">📱</div>
          <div className="text-xs text-blue-300">Morning Summary</div>
          <div className="text-sm text-white mt-1">3 New AI Articles</div>
        </div>
      )
    },
    {
      title: "Read faster, stay consistent",
      subtitle: "",
      description: "Bite-sized summaries designed for busy schedules. Build a daily reading habit that sticks without overwhelming your routine.",
      side: "left",
      mockContent: (
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">⚡</div>
          <div className="text-xs text-blue-300">Reading Time</div>
          <div className="text-sm text-white mt-1">2 min average</div>
        </div>
      )
    },
    {
      title: "See your progress",
      subtitle: "",
      description: "Track your learning journey with detailed analytics. Visualize your reading patterns and discover your favorite topics.",
      side: "right",
      mockContent: (
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-xs text-blue-300">This Week</div>
          <div className="text-sm text-white mt-1">15 Articles Read</div>
        </div>
      )
    },
    {
      title: "Ask Newt",
      subtitle: "(your AI copilot)",
      description: "Get personalized insights about your reading habits, ask questions about summaries, or explore new topics through natural conversation.",
      side: "left",
      mockContent: (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">N</div>
            <span className="text-xs text-blue-300">Newt AI</span>
          </div>
          <div className="text-xs text-white">"What's trending in AI this week?"</div>
          <div className="flex space-x-1 mt-2">
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your Daily Tech Journey
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            See how newt transforms your relationship with tech news
          </p>
        </motion.div>

        <div className="space-y-20">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className="grid lg:grid-cols-2 gap-12 items-center"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {/* Text Content */}
              <div className={step.side === 'left' ? 'lg:order-2' : 'lg:order-1'}>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {step.title}
                  {step.subtitle && (
                    <span className="block text-lg text-blue-400 font-normal mt-1">
                      {step.subtitle}
                    </span>
                  )}
                </h3>
                <p className="text-blue-100 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Mock Content */}
              <motion.div 
                className={`${step.side === 'left' ? 'lg:order-1' : 'lg:order-2'} flex justify-center`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {step.mockContent}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NarrativeSteps;
