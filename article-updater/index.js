const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const LARAVEL_API = process.env.LARAVEL_API_URL || 'http://localhost:8000/api';

/**
 * Fetch latest original article from Laravel API
 */
async function fetchLatestArticle() {
  try {
    console.log('Fetching articles from Laravel API...');
    const response = await axios.get(`${LARAVEL_API}/articles`);
    
    if (!response.data.success) {
      throw new Error('Failed to fetch articles');
    }
    
    const articles = response.data.data;
    
    // Get the latest original article (not updated)
    const originalArticles = articles.filter(a => !a.is_updated);
    
    if (originalArticles.length === 0) {
      throw new Error('No original articles found');
    }
    
    return originalArticles[0];
  } catch (error) {
    console.error('Error fetching articles:', error.message);
    throw error;
  }
}

/**
 * Search Google for article title and return top 2 blog URLs
 */
async function searchGoogle(query) {
  console.log('Searching Google for:', query);
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for search results to load
    await page.waitForSelector('div.g', { timeout: 10000 });
    
    // Extract search result links
    const links = await page.evaluate(() => {
      const results = [];
      const searchResults = document.querySelectorAll('div.g a');
      
      searchResults.forEach(link => {
        const href = link.href;
        // Filter out Google's own links and ensure it's a valid URL
        if (href && 
            href.startsWith('http') && 
            !href.includes('google.com') &&
            !href.includes('youtube.com') &&
            !href.includes('facebook.com')) {
          results.push(href);
        }
      });
      
      return results;
    });
    
    await browser.close();
    
    // Return first 2 unique links
    const uniqueLinks = [...new Set(links)].slice(0, 2);
    console.log(`Found ${uniqueLinks.length} relevant articles`);
    
    return uniqueLinks;
  } catch (error) {
    await browser.close();
    console.error('Error during Google search:', error.message);
    throw error;
  }
}

/**
 * Scrape article content from a given URL
 */
async function scrapeArticleContent(url) {
  console.log('Scraping:', url);
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    
    // Remove unwanted elements
    $('script, style, nav, header, footer, iframe, .ad, .advertisement, .cookie-notice').remove();
    
    // Try common article content selectors
    const selectors = [
      'article',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.content-area',
      'main article',
      '[role="main"]',
      '.blog-post-content'
    ];
    
    let content = '';
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length) {
        content = element.text();
        break;
      }
    }
    
    // Fallback to body if no specific article content found
    if (!content || content.length < 100) {
      content = $('body').text();
    }
    
    // Clean up whitespace and trim
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
    
    // Limit content length for API processing
    content = content.substring(0, 5000);
    
    console.log(`Scraped ${content.length} characters from ${url}`);
    
    return content;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return '';
  }
}

/**
 * Use Google Gemini to rewrite article based on reference articles
 */
async function rewriteArticle(originalTitle, originalContent, referenceArticles) {
  console.log('Rewriting article using Gemini AI...');
  
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `
You are a professional content writer and SEO expert. Your task is to rewrite the following article to match the style, tone, and formatting of the reference articles provided.

ORIGINAL ARTICLE:
Title: ${originalTitle}
Content: ${originalContent.substring(0, 3000)}

REFERENCE ARTICLE 1:
${referenceArticles[0].content.substring(0, 2000)}

REFERENCE ARTICLE 2:
${referenceArticles[1].content.substring(0, 2000)}

INSTRUCTIONS:
1. Maintain the core message and key points of the original article
2. Match the writing style, tone, and formatting of the reference articles
3. Make it SEO-friendly with proper headings, subheadings, and structure
4. Use engaging and professional language
5. Format the output in clean HTML with proper tags (h2, h3, p, ul, li, strong, em)
6. Keep the article between 800-1200 words
7. Make it more comprehensive and informative than the original
8. DO NOT include any meta-commentary or explanations
9. Return ONLY the rewritten article content in HTML format

REWRITTEN ARTICLE (HTML format):
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let rewrittenContent = response.text();
    
    // Clean up any markdown code blocks if present
    rewrittenContent = rewrittenContent
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    console.log('Article successfully rewritten');
    
    return rewrittenContent;
  } catch (error) {
    console.error('Error calling Gemini API:', error.message);
    throw error;
  }
}

/**
 * Publish updated article to Laravel API
 */
async function publishArticle(originalArticleId, title, content, references) {
  console.log('Publishing updated article...');
  
  // Add references section at the bottom
  const referencesHtml = `
    <div class="references" style="margin-top: 40px; padding: 20px; background: #f5f5f5; border-left: 4px solid #007bff;">
      <h3 style="margin-bottom: 15px; color: #333;">References</h3>
      <ul style="list-style: none; padding: 0;">
        ${references.map((ref, idx) => `
          <li style="margin-bottom: 10px;">
            <strong>[${idx + 1}]</strong> 
            <a href="${ref}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none;">
              ${ref}
            </a>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
  
  const fullContent = content + referencesHtml;
  
  try {
    const response = await axios.post(`${LARAVEL_API}/articles`, {
      title: `${title} (Updated Version)`,
      content: fullContent,
      is_updated: true,
      original_article_id: originalArticleId,
      references: JSON.stringify(references)
    });
    
    if (response.data.success) {
      console.log('Article published successfully!');
      return response.data.data;
    } else {
      throw new Error('Failed to publish article');
    }
  } catch (error) {
    console.error('Error publishing article:', error.message);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Article Update Script Started');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Fetch latest article
    console.log('\n[STEP 1] Fetching latest article from API...');
    const article = await fetchLatestArticle();
    console.log(`✓ Found article: "${article.title}"`);
    console.log(`  ID: ${article.id}`);
    
    // Step 2: Search Google
    console.log('\n[STEP 2] Searching Google for similar articles...');
    const searchResults = await searchGoogle(article.title);
    
    if (searchResults.length < 2) {
      throw new Error('Not enough search results found');
    }
    
    console.log(`✓ Found ${searchResults.length} relevant articles`);
    searchResults.forEach((url, idx) => {
      console.log(`  [${idx + 1}] ${url}`);
    });
    
    // Step 3: Scrape reference articles
    console.log('\n[STEP 3] Scraping reference articles...');
    const referenceArticles = [];
    
    for (const url of searchResults) {
      const content = await scrapeArticleContent(url);
      if (content && content.length > 200) {
        referenceArticles.push({ url, content });
        console.log(`✓ Successfully scraped article`);
      } else {
        console.log(`✗ Failed to scrape sufficient content`);
      }
      
      // Be polite - wait between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    if (referenceArticles.length < 2) {
      throw new Error('Not enough reference articles scraped successfully');
    }
    
    // Step 4: Rewrite article with Gemini
    console.log('\n[STEP 4] Rewriting article with Gemini AI...');
    const rewrittenContent = await rewriteArticle(
      article.title,
      article.content,
      referenceArticles
    );
    console.log(`✓ Article rewritten (${rewrittenContent.length} characters)`);
    
    // Step 5: Publish updated article
    console.log('\n[STEP 5] Publishing updated article to API...');
    const published = await publishArticle(
      article.id,
      article.title,
      rewrittenContent,
      referenceArticles.map(ref => ref.url)
    );
    console.log(`✓ Published with ID: ${published.id}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS! Article update completed successfully');
    console.log('='.repeat(60));
    console.log(`\nOriginal Article ID: ${article.id}`);
    console.log(`Updated Article ID: ${published.id}`);
    console.log(`Title: ${published.title}`);
    
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.error('❌ ERROR:', error.message);
    console.log('='.repeat(60));
    process.exit(1);
  }
}

// Run the script
main();