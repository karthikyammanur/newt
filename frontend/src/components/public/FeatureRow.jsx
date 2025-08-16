import React from 'react';
import { motion } from 'framer-motion';

const FeatureRow = ({ 
  title, 
  description, 
  mediaUrl, 
  mediaType = 'image', 
  reverse = false,
  className = ''
}) => {
  return (
    <div className={`py-20 px-4 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${reverse ? 'lg:grid-flow-col-dense' : ''}`}>
          {/* Text Content */}
          <motion.div 
            className={reverse ? 'lg:col-start-2' : 'lg:col-start-1'}
            initial={{ opacity: 0, x: reverse ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              {title}
            </h2>
            <p className="text-lg text-blue-100 leading-relaxed">
              {description}
            </p>
          </motion.div>

          {/* Media Content */}
          <motion.div 
            className={`${reverse ? 'lg:col-start-1' : 'lg:col-start-2'} relative`}
            initial={{ opacity: 0, x: reverse ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl">
              {mediaType === 'video' ? (
                <video
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  loading="lazy"
                  className="w-full h-auto"
                  width="800"
                  height="500"
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt={title}
                  loading="lazy"
                  className="w-full h-auto object-cover"
                  width="800"
                  height="500"
                  style={{ aspectRatio: '16/10' }}
                />
              )}
              
              {/* Subtle parallax overlay */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FeatureRow;
