import React from 'react';
import ArticleCard from './ArticleCard';

function ArticleList({ articles, onArticleClick }) {
  if (articles.length === 0) {
    return (
      <div className="empty-state">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2"/>
          <polyline points="14 2 14 8 20 8" strokeWidth="2"/>
          <line x1="16" y1="13" x2="8" y2="13" strokeWidth="2"/>
          <line x1="16" y1="17" x2="8" y2="17" strokeWidth="2"/>
          <polyline points="10 9 9 9 8 9" strokeWidth="2"/>
        </svg>
        <h2>No Articles Found</h2>
        <p>There are no articles matching your filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="article-list-container">
      <div className="article-grid">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onClick={() => onArticleClick(article)}
          />
        ))}
      </div>
    </div>
  );
}

export default ArticleList;