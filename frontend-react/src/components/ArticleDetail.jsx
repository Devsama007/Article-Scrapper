import React from 'react';

function ArticleDetail({ article, onClose, allArticles, onArticleClick }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Find related articles
  const relatedArticles = article.is_updated && article.original_article_id
    ? allArticles.filter(a => a.id === article.original_article_id)
    : allArticles.filter(a => a.original_article_id === article.id);

  const references = article.references ? JSON.parse(article.references) : [];

  return (
    <div className="article-detail-overlay" onClick={onClose}>
      <div className="article-detail" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2"/>
            <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2"/>
          </svg>
        </button>

        <div className="article-detail-content">
          <header className="article-header">
            <div className="article-meta-detail">
              <span className={`badge ${article.is_updated ? 'badge-updated' : 'badge-original'}`}>
                {article.is_updated ? '🔄 Updated Version' : '📄 Original Article'}
              </span>
              <span className="date">{formatDate(article.created_at)}</span>
            </div>
            
            <h1 className="article-title-detail">{article.title}</h1>
            
            {article.url && (
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="source-link"
              >
                View Original Source →
              </a>
            )}
          </header>

          {article.image_url && (
            <div className="article-image-detail">
              <img src={article.image_url} alt={article.title} />
            </div>
          )}

          <div 
            className="article-body" 
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {references.length > 0 && (
            <div className="references-section">
              <h3>References</h3>
              <ul className="references-list">
                {references.map((ref, index) => (
                  <li key={index}>
                    <a href={ref} target="_blank" rel="noopener noreferrer">
                      [{index + 1}] {ref}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {relatedArticles.length > 0 && (
            <div className="related-articles">
              <h3>
                {article.is_updated ? 'Original Article' : 'Updated Versions'}
              </h3>
              <div className="related-articles-grid">
                {relatedArticles.map((relatedArticle) => (
                  <div 
                    key={relatedArticle.id} 
                    className="related-article-card"
                    onClick={() => onArticleClick(relatedArticle)}
                  >
                    <span className={`badge ${relatedArticle.is_updated ? 'badge-updated' : 'badge-original'}`}>
                      {relatedArticle.is_updated ? 'Updated' : 'Original'}
                    </span>
                    <h4>{relatedArticle.title}</h4>
                    <p className="date">{formatDate(relatedArticle.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArticleDetail;