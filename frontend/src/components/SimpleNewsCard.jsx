import React from 'react';

const SimpleNewsCard = ({ topic, summary, title }) => {
  return (
    <>
      {/* Regular Card */}
      <div
        className="bg-gradient-to-br from-slate-800 to-blue-900 text-white p-6 rounded-lg hover:shadow-xl transition-all"
      >
        <div className="mb-4">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
            {topic}
          </span>
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>        <p className="text-slate-200 text-sm line-clamp-4">
          {summary.substring(0, 200)}...
        </p>
      </div>
    </>
  );
};

export default SimpleNewsCard;
