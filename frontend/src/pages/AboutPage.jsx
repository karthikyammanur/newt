import React from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '../components/PublicLayout';

const AboutPage = () => {
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
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Mission</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            We're building a better way to stay informed in an age of information overload.
          </p>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="py-10 px-4 max-w-4xl mx-auto">
        <motion.div 
          className="bg-gray-800/30 backdrop-blur-sm p-8 rounded-xl mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-6 text-white">Our Story</h2>
          <div className="space-y-4 text-blue-100">
            <p>
              newt was born out of a simple frustration: keeping up with the rapidly evolving tech landscape 
              is incredibly time-consuming. Despite the importance of staying informed, many of us struggle 
              to find the time to read dozens of articles every day.
            </p>
            <p>
              We started with a question: What if you could get the essential information from tech news in 
              just minutes, rather than hours? That's when we decided to build newt.
            </p>
            <p>
              Our AI-powered platform scans thousands of articles daily, extracts the most important information, 
              and delivers concise, easy-to-read summaries. The result? You can stay informed about the tech world 
              in just minutes a day.
            </p>
            <p>
              We added gamification elements like points, streaks, and badges to make the reading experience 
              more engaging and to help users build a consistent reading habit that keeps them informed over time.
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="bg-gray-800/30 backdrop-blur-sm p-8 rounded-xl mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-white">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Efficiency",
                description: "We believe your time is precious. Our platform is designed to give you maximum insight with minimal time investment."
              },
              {
                title: "Accuracy",
                description: "Our AI is trained to extract the most important information while maintaining factual accuracy."
              },
              {
                title: "Accessibility",
                description: "Complex tech information should be digestible and accessible to everyone, regardless of their technical background."
              },
              {
                title: "Engagement",
                description: "Learning should be enjoyable. We incorporate elements that make staying informed feel rewarding and fun."
              }
            ].map((value, index) => (
              <div key={index} className="flex flex-col">
                <h3 className="text-xl font-semibold mb-2 text-blue-300">{value.title}</h3>
                <p className="text-blue-100">{value.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="bg-gray-800/30 backdrop-blur-sm p-8 rounded-xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-white">Why "newt"?</h2>
          <div className="space-y-4 text-blue-100">
            <p>
              We chose the name "newt" because, like the amphibian, our platform is:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Adaptive - evolving to meet the changing needs of the tech landscape</li>
              <li>Efficient - making the most of limited resources</li>
              <li>Transformative - helping you transform raw information into valuable knowledge</li>
            </ul>
            <p className="mt-4">
              Plus, it's a play on "news" and "tech" - the perfect combination for what we deliver!
            </p>
          </div>
        </motion.div>
      </section>


    </PublicLayout>
  );
};

export default AboutPage;
