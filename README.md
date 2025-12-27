# BeyondChats Article Management System
A complete full-stack application that scrapes articles from BeyondChats blogs, uses AI to rewrite them with better SEO, and displays them in a modern React interface.

# Table of Contents

•	Prerequisites 
•	Project Structure 
•	Phase 1: Laravel Backend Setup
•	Phase 2: Node.js Article Updater Setup
•	Phase 3: React Frontend Setup
•	Running the Complete Application
•	API Documentation
•	Troubleshooting
•	Features


# Prerequisites
Before you begin, ensure you have the following installed on your system:

**Required Software**

### 1: PHP 8.2 or higher

```text
# Check PHP version
   php -v
   
   # Required PHP extensions:
   # - OpenSSL
   # - PDO
   # - Mbstring
   # - Tokenizer
   # - XML
   # - Ctype
   # - JSON
   # - BCMath
   # - pgsql (for PostgreSQL)
```

### 2: Composer (PHP Dependency Manager)

```text
# Check Composer version
   composer --version
   
   # Download from: https://getcomposer.org/download/
```

### 3: Node.js 18+ and npm

```text
# Check Node.js version
   node -v
   
   # Check npm version
   npm -v
   
   # Download from: https://nodejs.org/
```

### 4: PostgreSQL 13+

```text
# Check PostgreSQL version
   psql --version
   
   # Download from: https://www.postgresql.org/download/
```

### 5: Git (for cloning/managing code)

```text
git --version
```

# Project Structure

```text
beyondchats-assignment/
│
├── backend-laravel/              # Laravel Backend API
│   ├── app/
│   │   ├── Console/Commands/
│   │   │   └── ScrapeArticles.php
│   │   ├── Http/Controllers/Api/
│   │   │   └── ArticleController.php
│   │   └── Models/
│   │       └── Article.php
│   ├── database/migrations/
│   ├── routes/
│   │   └── api.php
│   ├── .env
│   └── composer.json
│
├── article-updater/              # Node.js AI Article Updater
│   ├── index.js
│   ├── package.json
│   └── .env
│
└── frontend-react/               # React Frontend
    ├── src/
    │   ├── components/
    │   ├── services/
    │   └── App.jsx
    ├── .env
    └── package.json
```

