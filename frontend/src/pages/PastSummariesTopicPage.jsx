import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import NewsCard from '../components/NewsCard';
import { mockPastSummaries } from '../data/mockSummaries';

const PastSummariesTopicPage = () => {
  const { topic } = useParams();
  const [summaries, setSummaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/past_summaries?topic=${encodeURIComponent(topic)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch past summaries');
        return res.json();
      })
      .then(data => setSummaries(data))
      .catch(err => {
        console.log('Using cached mock data for past summaries due to fetch error:', err);
        // Use mock data when API fails
        if (mockPastSummaries[topic]) {
          setSummaries(mockPastSummaries[topic]);
          setError(null);
        } else {
          setError(err);
        }
      })
      .finally(() => setIsLoading(false));
  }, [topic]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold mb-6 text-blue-100 lowercase text-center">
          Past summaries for {topic}
        </h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-32 text-blue-200">Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error.message}</div>
        ) : !summaries.length ? (
          <div className="text-blue-300 text-center">No past summaries found for this topic.</div>
        ) : (
          <div className="flex flex-col gap-8">
            {summaries.map((summary, idx) => (
              <NewsCard
                key={summary._id || idx}
                topic={summary.topic}
                summary={summary.summary}
                timestamp={summary.timestamp}
                title={summary.title}
                sources={summary.sources}
                hideSummary={false}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PastSummariesTopicPage;
