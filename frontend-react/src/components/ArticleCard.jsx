import React from 'react';

function ArticleCard({ article, onClick }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getExcerpt = () => {
    if (article.excerpt) {
      return article.excerpt;
    }
    const plainText = stripHtml(article.content);
    return plainText.substring(0, 150) + '...';
  };

  return (
    <article className="article-card" onClick={onClick}>
      {article.image_url && (
        <div className="article-image">
          <img src={article.image_url} alt={article.title} />
        </div>
      )}
      
      <div className="article-card-content">
        <div className="article-meta">
          <span className={`badge ${article.is_updated ? 'badge-updated' : 'badge-original'}`}>
            {article.is_updated ? '🔄 Updated' : '📄 Original'}
          </span>
          <span className="date">{formatDate(article.created_at)}</span>
        </div>
        
        <h2 className="article-title">{article.title}</h2>
        
        <p className="article-excerpt">{getExcerpt()}</p>
        
        <div className="article-footer">
          <button className="read-more">
            Read More
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2"/>
              <polyline points="12 5 19 12 12 19" strokeWidth="2"/>
            </svg>
          </button>
          
          {article.is_updated && article.original_article_id && (
            <span className="link-indicator" title="Linked to original article">
              🔗
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default ArticleCard;