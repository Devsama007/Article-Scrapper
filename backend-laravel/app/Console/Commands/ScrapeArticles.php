<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Article;
use GuzzleHttp\Client;
use Symfony\Component\DomCrawler\Crawler;

class ScrapeArticles extends Command
{
    protected $signature = 'scrape:articles';
    protected $description = 'Scrape articles from BeyondChats blogs';

    public function handle()
    {
        $this->info('Starting to scrape BeyondChats articles...');
        
        $client = new Client([
            'verify' => false,
            'headers' => [
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            ]
        ]);
        
        try {
            // Fetch the blogs page
            $response = $client->get('https://beyondchats.com/blogs/');
            $html = $response->getBody()->getContents();
            
            $crawler = new Crawler($html);
            $articles = [];
            
            // Adjust these selectors based on actual HTML structure
            // You may need to inspect the page and update selectors
            $crawler->filter('article, .blog-item, .post-item, .card')->each(function (Crawler $node) use (&$articles) {
                try {
                    // Try different possible selectors
                    $titleNode = $node->filter('h1, h2, h3, .title, .post-title')->first();
                    $linkNode = $node->filter('a')->first();
                    $excerptNode = $node->filter('p, .excerpt, .description')->first();
                    $imageNode = $node->filter('img')->first();
                    
                    if ($titleNode->count() > 0 && $linkNode->count() > 0) {
                        $url = $linkNode->attr('href');
                        
                        // Make URL absolute if it's relative
                        if (!str_starts_with($url, 'http')) {
                            $url = 'https://beyondchats.com' . $url;
                        }
                        
                        $articles[] = [
                            'title' => trim($titleNode->text()),
                            'url' => $url,
                            'excerpt' => $excerptNode->count() > 0 ? trim($excerptNode->text()) : '',
                            'image_url' => $imageNode->count() > 0 ? $imageNode->attr('src') : '',
                        ];
                    }
                } catch (\Exception $e) {
                    // Skip if elements not found
                }
            });
            
            if (empty($articles)) {
                $this->error('No articles found. Please check the HTML structure and update selectors.');
                return;
            }
            
            $this->info("Found " . count($articles) . " articles");
            
            // Get the last 5 (oldest) articles
            $oldestArticles = array_slice($articles, -5);
            
            foreach ($oldestArticles as $articleData) {
                // Fetch full content from article URL
                try {
                    $this->info("Scraping: {$articleData['url']}");
                    
                    $response = $client->get($articleData['url']);
                    $articleHtml = $response->getBody()->getContents();
                    $articleCrawler = new Crawler($articleHtml);
                    
                    // Try common article content selectors
                    $contentNode = null;
                    $selectors = ['.article-content', '.post-content', '.entry-content', 'article .content', 'main article'];
                    
                    foreach ($selectors as $selector) {
                        $node = $articleCrawler->filter($selector);
                        if ($node->count() > 0) {
                            $contentNode = $node->first();
                            break;
                        }
                    }
                    
                    $content = $contentNode ? $contentNode->html() : 'Content not available';
                    
                    // Check if article already exists
                    $existingArticle = Article::where('url', $articleData['url'])->first();
                    
                    if (!$existingArticle) {
                        Article::create([
                            'title' => $articleData['title'],
                            'content' => $content,
                            'url' => $articleData['url'],
                            'excerpt' => $articleData['excerpt'],
                            'image_url' => $articleData['image_url'],
                        ]);
                        
                        $this->info("✓ Scraped: {$articleData['title']}");
                    } else {
                        $this->warn("- Already exists: {$articleData['title']}");
                    }
                    
                    // Be polite - wait between requests
                    sleep(2);
                    
                } catch (\Exception $e) {
                    $this->error("✗ Failed to scrape: {$articleData['url']} - " . $e->getMessage());
                }
            }
            
            $this->info('Scraping completed!');
            
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
        }
    }
}