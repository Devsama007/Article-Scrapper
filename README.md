# BeyondChats Article Management System
A complete full-stack application that scrapes articles from BeyondChats blogs, uses AI to rewrite them with better SEO, and displays them in a modern React interface.

# Table of Contents

*	Prerequisites 
*	Project Structure 
*	Phase 1: Laravel Backend Setup
*	Phase 2: Node.js Article Updater Setup
*	Phase 3: React Frontend Setup
*	Running the Complete Application
*	API Documentation
*	Features


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

*	Open pgAdmin
*	Right-click on "Databases"
*	Select "Create" → "Database"
*	Enter name: beyondchats_db
*	Click "Save"

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

## Step 7: Install API Support

Create the following files with the provided code:

### a. Create Article Model

```text
php artisan make:model Article
```

### b. Create Migration

```text
php artisan make:migration create_articles_table
```

### c. Create Scraper Command

```text
php artisan make:command ScrapeArticles
```

### d. Create API Controller

```text
php artisan make:controller Api/ArticleController --api
```

### e. Configure bootstrap/app.php

## Step 8: Run Migrations

```text
php artisan migrate
```

If you encounter errors, try:
```text
php artisan migrate:fresh
```

## Step 9: Clear Caches

```text
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan optimize:clear
composer dump-autoload
```

## Step 10: Scrape Articles

```text
php artisan scrape:articles
```
This will scrape the 5 oldest articles from BeyondChats blog.

## Step 11: Verify Articles Were Scraped

```text
# Check in database
php artisan tinker

# Inside tinker:
Article::count();
Article::all();
exit
```

## Step 12: Start Laravel Server

```text
php artisan serve
```
The API will be available at: http://127.0.0.1:8000

## Step 13: Test the API
Open a new terminal and run or paste in browser:

```text
# Test health endpoint
curl http://127.0.0.1:8000/api/health

# Test articles endpoint
curl http://127.0.0.1:8000/api/articles

# Or open in browser:
# http://127.0.0.1:8000/api/articles
```


 # Phase 2: Node.js Article Updater Setup

 ## Step 1: Create Project Directory

 ```text
 # Go back to main project folder
cd ..

# Create article-updater folder
mkdir article-updater
cd article-updater
```

## Step 2: Initialize Node.js Project

```text
npm init -y
```

## Step 3: Install Dependencies

```text
npm install axios cheerio puppeteer @google/generative-ai dotenv
```

## Step 4: Get Gemini API Key

*	Go to: https://makersuite.google.com/app/apikey
*	Sign in with your Google account
*	Click "Create API Key"
*	Copy the generated API key

## Step 5: Create .env File

Create .env file in article-updater/:
```text
# Laravel API Configuration
LARAVEL_API_URL=http://localhost:8000/api

# Google Gemini API Key (Get from: https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important: Replace your_gemini_api_key_here with your actual Gemini API key!**

## Step 6: Run the Script
Make sure Laravel server is running, then:

```text
node index.js
```

The script will:

*  Fetch the latest article from Laravel API
*  Search Google for similar articles
*  Scrape top 2 search results
*  Use Gemini AI to rewrite the article
*  Publish updated version back to Laravel API


# Phase 3: React Frontend Setup

## Step 1: Create React Project

```text
# Go back to main project folder
cd ..

# Create React project with Vite
npm create vite@latest frontend-react -- --template react
cd frontend-react
```

## Step 2: Install Dependencies

```text
npm install axios
```

## Step 3: Create Project Structure

```text
# Create directories
mkdir src/components
mkdir src/services
```

## Step 4: Create All React Files

## Step 5: Create .env File

Create .env in frontend-react/:

```text
VITE_API_URL=http://localhost:8000/api
```

## Step 6: Start Development Server

```text
npm run dev
```
The frontend will be available at: http://localhost:3000


# Running the Complete Application

## Terminal 1: Laravel Backend

```text
cd backend-laravel
php artisan serve
```
Keep this running at http://127.0.0.1:8000

## Terminal 2: React Frontend

```text
cd frontend-react
npm run dev
```
Keep this running at http://localhost:3000

## Terminal 3: Run Article Updater (When Needed)

```text
cd article-updater
node index.js
```
This runs once and updates one article. You can run it multiple times.


# API Documentation

## Base URL

```text
http://localhost:8000/api
```

## Endpoints
## 1. Get All Articles

```text
GET /api/articles
```

## 2. Get Single Article

```text
GET /api/articles/{id}
```

## 3. Create Article

```text
POST /api/articles
Content-Type: application/json
```

```json raw body
{
  "title": "New Article",
  "content": "<p>Content here</p>",
  "url": "https://example.com",
  "excerpt": "Summary",
  "image_url": "https://example.com/img.jpg",
  "is_updated": false
}
```

## 4. Update Article

```text
PUT /api/articles/{id}
Content-Type: application/json
```

```json raw body
{
  "title": "Updated Title"
}
```

## 5. Delete Article

```text
DELETE /api/articles/{id}
```

## 6. Health Check

```text
GET /api/health
```


# Features

### Backend (Laravel)

*  Web scraping from BeyondChats blog
*  Store articles in PostgreSQL database
*  RESTful API with full CRUD operations
*  Article relationships (original/updated versions)
*  JSON reference storage
*  Health check endpoint

### Article Updater (Node.js)

*  Automated Google search for similar articles
*  Web scraping of top search results
*  AI-powered content rewriting with Google Gemini
*  Automatic reference citation
*  Seamless API integration

### Frontend (React)

*  Modern, responsive UI
*  Article listing with filters
*  Detailed article view
*  Original and updated article linking
*  Reference display
*  Loading states
*  Error handling
*  Professional design


 # Usage Flow

### Start Laravel Backend

*  Scrapes articles from BeyondChats
*  Stores in database
*  Provides API endpoints


### Run Article Updater

*  Fetches latest article
*  Searches Google for similar content
*  Rewrites with AI
*  Publishes updated version


### View in React Frontend

*  Browse all articles
*  Filter by original/updated
*  Read full articles
*  See references and links

