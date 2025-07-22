import React from 'react';

const SimpleNewsCard = ({ topic, summary, title, urlToImage = '' }) => {
  return (
    <>
      {/* Regular Card */}
      <div
        className="bg-gradient-to-br from-slate-800 to-blue-900 text-white p-6 rounded-lg hover:shadow-xl transition-all"
      >        <div className="mb-4">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
            {topic}
          </span>
        </div>

        {/* Article Image */}
        {urlToImage && (
          <div className="mb-4 overflow-hidden rounded-lg">
            <img 
              src={urlToImage}
              alt={title || topic}
              className="w-full h-32 object-cover rounded-lg transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}        {!urlToImage && (
          <div className="mb-4 overflow-hidden rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 shadow-lg">
            <div className="w-full h-32 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-slate-300">No image available</p>
                <p className="text-xs text-slate-500 mt-1">{topic.toUpperCase()}</p>
              </div>
            </div>
          </div>
        )}
        <h3 className="text-xl font-bold mb-3">{title}</h3>        <p className="text-slate-200 text-sm line-clamp-4">
          {summary.substring(0, 200)}...
        </p>
      </div>
    </>
  );
};

export default SimpleNewsCard;
