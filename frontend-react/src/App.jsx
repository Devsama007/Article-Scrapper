import { useState, useEffect } from 'react';
import Header from './components/Header';
import ArticleList from './components/ArticleList';
import ArticleDetail from './components/ArticleDetail';
import Loader from './components/Loader';
import articleService from './services/api';
import './App.css';

function App() {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'original', 'updated'

  // Fetch articles on component mount
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await articleService.getAllArticles();
      
      if (response.success) {
        setArticles(response.data);
      } else {
        setError('Failed to fetch articles');
      }
    } catch (err) {
      setError('Error connecting to the server. Please make sure the Laravel API is running.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
  };

  const handleCloseDetail = () => {
    setSelectedArticle(null);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setSelectedArticle(null);
  };

  // Filter articles based on selected filter
  const filteredArticles = articles.filter(article => {
    if (filter === 'original') return !article.is_updated;
    if (filter === 'updated') return article.is_updated;
    return true; // 'all'
  });

  return (
    <div className="app">
      <Header 
        filter={filter} 
        onFilterChange={handleFilterChange}
        articleCount={filteredArticles.length}
      />
      
      <main className="main-content">
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="error-container">
            <div className="error-message">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/>
              </svg>
              <h2>Oops! Something went wrong</h2>
              <p>{error}</p>
              <button onClick={fetchArticles} className="retry-button">
                Try Again
              </button>
            </div>
          </div>
        ) : selectedArticle ? (
          <ArticleDetail 
            article={selectedArticle} 
            onClose={handleCloseDetail}
            allArticles={articles}
            onArticleClick={handleArticleClick}
          />
        ) : (
          <ArticleList 
            articles={filteredArticles} 
            onArticleClick={handleArticleClick}
          />
        )}
      </main>
    </div>
  );
}

export default App;