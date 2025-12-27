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

# Phase 1: Laravel Backend Setup

## Step 1: Create Project Directory

```text
# Create main project folder
mkdir beyondchats-assignment or any name
cd beyondchats-assignment

# Create Laravel project
composer create-project laravel/laravel backend-laravel
cd backend-laravel
```

## Step 2: Install Required PHP Packages

```text
composer require guzzlehttp/guzzle
composer require symfony/dom-crawler
composer require symfony/css-selector
composer require laravel/sanctum
```

## Step 3: Setup PostgreSQL Database

### Option A: Using psql (Command Line)

```text
# Login to PostgreSQL
psql -U postgres

# Inside psql:
CREATE DATABASE beyondchats_db;

# Create a user (optional)
CREATE USER beyondchats_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE beyondchats_db TO beyondchats_user;

# Exit psql
\q
```

### Option B: Using pgAdmin (GUI)

•	Open pgAdmin
•	Right-click on "Databases"
•	Select "Create" → "Database"
•	Enter name: beyondchats_db
•	Click "Save"

## Step 4: Configure Environment Variables

Create/Edit .env file in backend-laravel/:
```text
APP_NAME="BeyondChats API"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# PostgreSQL Database Configuration
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=beyondchats_db
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
```

## Step 5: Generate Application Key

```text
php artisan key:generate
```

## Step 6: Install API Support

```text
# Install Sanctum for API authentication
php artisan install:api

# This will:
# - Create routes/api.php
# - Install Sanctum
# - Publish Sanctum migrations
```

