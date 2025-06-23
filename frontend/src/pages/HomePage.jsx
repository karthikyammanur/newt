import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';

const fetchNews = async () => {
  const response = await fetch('http://localhost:8000/api/news');
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }
  return response.json();
};

const SummariesPage = () => {
  const { data: news, isLoading, error } = useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
  });

  const handleLike = async (articleId) => {
    // TODO: Implement like functionality
    console.log('Liked article:', articleId);
  };

  if (isLoading) return (
    <Layout>
      <LoadingSpinner />
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="text-red-600">Error: {error.message}</div>
    </Layout>
  );

  return (
    <Layout>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {news?.map((article) => (
          <NewsCard
            key={article.id}
            article={article}
            onLike={handleLike}
            isLiked={false} // TODO: Implement liked state
          />
        ))}
      </div>
    </Layout>
  );
};

export default SummariesPage;
