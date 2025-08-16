import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AgentPreview = () => {
  return (
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
            <Link 
              to="/coming-soon"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Try it soon
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AgentPreview;
