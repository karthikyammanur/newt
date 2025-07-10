import React from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '../components/PublicLayout';

const FaqPage = () => {
  const faqs = [
    {
      question: "What is newt?",
      answer: "newt is an AI-powered platform that provides concise summaries of the latest tech news. We help busy professionals stay informed without spending hours reading full articles."
    },
    {
      question: "How does newt work?",
      answer: "Our AI algorithms scan thousands of tech news articles daily, extract the most important information, and generate concise, easy-to-read summaries that capture the essential points. These summaries are categorized by topic and delivered to your personalized dashboard."
    },
    {
      question: "How often are new summaries added?",
      answer: "We add fresh summaries daily, focusing on the most significant tech developments from the past 24 hours. You'll always have new content to read when you check in."
    },
    {
      question: "What are points and streaks?",
      answer: "Points are earned each time you read a summary. Streaks track your consecutive days of reading - the longer you maintain your streak, the more points you earn as a bonus. Both features are designed to make staying informed more engaging and habit-forming."
    },
    {
      question: "Are the summaries biased?",
      answer: "We strive for objectivity in our summaries. Our AI is designed to extract factual information without adding opinion. We present multiple perspectives when a topic is controversial."
    },
    {
      question: "What topics do you cover?",
      answer: "We cover a wide range of tech topics including AI, software development, hardware, startups, cybersecurity, data science, web development, cloud computing, and more. You can explore past summaries by topic."
    },
    {
      question: "Is newt free to use?",
      answer: "Yes, newt is currently free to use. We may introduce premium features in the future, but our core summarization service will always have a free tier."
    },
    {
      question: "Can I save summaries for later?",
      answer: "Yes, you can bookmark summaries to read later or to keep as reference. Your bookmarks are organized by topic for easy access."
    },
    {
      question: "Is there a mobile app?",
      answer: "Our web application is fully responsive and works great on mobile devices. We're currently developing native mobile apps for iOS and Android to provide an even better experience on the go."
    },
    {
      question: "How accurate are the summaries?",
      answer: "Our AI is trained to maintain accuracy while condensing information. We're constantly improving our algorithms, and users can report any inaccuracies they spot to help us refine the system."
    }
  ];

  return (
    <PublicLayout>
      <div className="py-20 px-4">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center text-white">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Questions</span>
          </h1>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                className="bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer p-6 text-white">
                    <span>{faq.question}</span>
                    <span className="transition group-open:rotate-180">
                      <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24">
                        <path d="M6 9l6 6 6-6"></path>
                      </svg>
                    </span>
                  </summary>
                  <div className="text-blue-100 px-6 pb-6">
                    {faq.answer}
                  </div>
                </details>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl">
            <h3 className="text-2xl font-semibold mb-4 text-white">Still have questions?</h3>
            <p className="text-blue-100 mb-6">
              We're here to help! Reach out to our team for any additional questions or feedback.
            </p>
            <a 
              href="mailto:support@newtapp.com"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium transition-colors"
            >
              Contact Us
            </a>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
};

export default FaqPage;
