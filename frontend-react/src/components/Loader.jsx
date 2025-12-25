import React from 'react';

function Loader() {
  return (
    <div className="loader-container">
      <div className="loader">
        <div className="spinner"></div>
        <p>Loading articles...</p>
      </div>
    </div>
  );
}

export default Loader;