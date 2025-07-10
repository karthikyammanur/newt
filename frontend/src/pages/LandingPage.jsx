import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';

const LandingPage = () => {
  return (
    <PublicLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden z-0">
            <div className="absolute w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob top-1/4 left-1/4"></div>
            <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 top-1/3 right-1/4"></div>
            <div className="absolute w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 bottom-1/3 right-1/3"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 max-w-5xl mx-auto">
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-6 text-white"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                newt
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Stay informed with AI-powered summaries of the latest tech news, 
              curated and delivered daily. Save time without missing out.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap justify-center gap-4 mt-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <Link 
                to="/join" 
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Started
              </Link>
              <Link 
                to="/features" 
                className="px-8 py-4 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800 rounded-full text-white font-medium text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Learn More
              </Link>
            </motion.div>
          </div>
          
          {/* Scroll down indicator */}
          <motion.div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-20 px-4 backdrop-blur-sm bg-gray-900/30">
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-center mb-16 text-white"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              How It Works
            </motion.h2>
            
            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  icon: "🤖",
                  title: "AI-Powered Summaries",
                  description: "Our algorithms scan the latest tech news and generate concise, readable summaries."
                },
                {
                  icon: "🏆",
                  title: "Earn Points & Badges",
                  description: "Build your reading streak, collect badges, and track your reading habits."
                },
                {
                  icon: "📊",
                  title: "Personalized Dashboard",
                  description: "Get insights into your reading patterns and discover topics you love."
                }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl text-center"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-blue-100">{item.title}</h3>
                  <p className="text-blue-200">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-6 text-white"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Ready to stay updated in just minutes a day?
            </motion.h2>
            
            <motion.p 
              className="text-xl text-blue-100 mb-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Join thousands of tech professionals who use newt to stay informed without information overload.
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link 
                to="/join" 
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Sign Up Free
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default LandingPage;
