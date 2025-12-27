import React from 'react';

function Header({ filter, onFilterChange, articleCount }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-top">
          <h1 className="logo">
            <span className="logo-icon"></span>
            BeyondChats Articles
          </h1>
          <div className="article-count">
            {articleCount} {articleCount === 1 ? 'Article' : 'Articles'}
          </div>
        </div>
        
        <nav className="filter-nav">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange('all')}
          >
            All Articles
          </button>
          {/* <button
            className={`filter-btn ${filter === 'original' ? 'active' : ''}`}
            onClick={() => onFilterChange('original')}
          >
            Original
          </button>
          <button
            className={`filter-btn ${filter === 'updated' ? 'active' : ''}`}
            onClick={() => onFilterChange('updated')}
          >
            Updated Versions
          </button> */}
        </nav>
      </div>
    </header>
  );
}

export default Header;