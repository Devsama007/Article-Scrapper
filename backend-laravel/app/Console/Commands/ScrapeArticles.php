<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Article;
use GuzzleHttp\Client;
use Symfony\Component\DomCrawler\Crawler;

class ScrapeArticles extends Command
{
    protected $signature = 'scrape:articles';
    protected $description = 'Scrape the 5 oldest articles from BeyondChats blogs';

    public function handle()
    {
        $this->info('Starting BeyondChats blog scraping...');

        $client = new Client([
            'verify' => false,
            'timeout' => 30,
            'headers' => [
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            ]
        ]);

        try {
            // STEP 1: Find the last page number
            $this->info('Fetching blogs page to find last page...');
            $response = $client->get('https://beyondchats.com/blogs');
            $html = $response->getBody()->getContents();
            $crawler = new Crawler($html);

            // Find last page from pagination (look for numeric page links)
            $lastPage = 1;
            $crawler->filter('.wp-pagenavi a, .pagination a')->each(function (Crawler $node) use (&$lastPage) {
                $text = trim($node->text());
                if (is_numeric($text)) {
                    $pageNum = (int) $text;
                    if ($pageNum > $lastPage) {
                        $lastPage = $pageNum;
                    }
                }
            });

            $this->info("Last page detected: {$lastPage}");

            // STEP 2: Fetch the last page
            $lastPageUrl = "https://beyondchats.com/blogs/page/{$lastPage}/";
            $this->info("Fetching articles from: {$lastPageUrl}");
            
            $response = $client->get($lastPageUrl);
            $html = $response->getBody()->getContents();
            $crawler = new Crawler($html);

            // STEP 3: Extract article URLs from the last page
            // The structure shows each article has a link with pattern /blogs/article-slug/
            $articleLinks = [];
            
            $crawler->filter('a')->each(function (Crawler $node) use (&$articleLinks) {
                $href = $node->attr('href');
                
                // Match blog article URLs: /blogs/something-here/
                if (preg_match('#/blogs/([a-z0-9-]+)/#', $href, $matches)) {
                    $slug = $matches[1];
                    
                    // Skip pagination and category pages
                    if (in_array($slug, ['page', 'tag', 'author', 'category'])) {
                        return;
                    }
                    
                    $url = $href;
                    if (!str_starts_with($url, 'http')) {
                        $url = 'https://beyondchats.com' . $url;
                    }
                    
                    // Store unique URLs
                    if (!in_array($url, $articleLinks)) {
                        $articleLinks[] = $url;
                    }
                }
            });

            if (empty($articleLinks)) {
                $this->error('No article links found on the last page.');
                return Command::FAILURE;
            }

            $this->info("Found " . count($articleLinks) . " article links");

            // STEP 4: Take first 5 articles
            $articlesToScrape = array_slice($articleLinks, 0, 5);

            // STEP 5: Scrape each article
            foreach ($articlesToScrape as $index => $url) {
                $this->info("");
                $this->info("[" . ($index + 1) . "/5] Scraping: {$url}");

                // Check if already exists
                if (Article::where('url', $url)->exists()) {
                    $this->warn("  Already exists in database, skipping...");
                    continue;
                }

                try {
                    // Fetch the article page
                    $response = $client->get($url);
                    $articleHtml = $response->getBody()->getContents();
                    $articleCrawler = new Crawler($articleHtml);

                    // Extract title
                    $title = '';
                    $titleSelectors = ['h1.entry-title', 'h1', '.post-title', 'article h1'];
                    foreach ($titleSelectors as $selector) {
                        $titleNode = $articleCrawler->filter($selector);
                        if ($titleNode->count() > 0) {
                            $title = trim($titleNode->first()->text());
                            break;
                        }
                    }

                    if (empty($title)) {
                        $this->warn("  Could not find title, skipping...");
                        continue;
                    }

                    $this->info("  Title: {$title}");

                    // Extract content
                    $content = '';
                    $contentSelectors = [
                        '.entry-content',
                        'article .content',
                        '.post-content',
                        '.article-content',
                        'article',
                    ];

                    foreach ($contentSelectors as $selector) {
                        $contentNode = $articleCrawler->filter($selector);
                        if ($contentNode->count() > 0) {
                            $content = $contentNode->first()->html();
                            break;
                        }
                    }

                    if (empty($content)) {
                        $this->warn("  Could not extract content");
                        $content = "Content not available";
                    }

                    // Extract excerpt
                    $excerpt = '';
                    $excerptNode = $articleCrawler->filter('.entry-content p, article p');
                    if ($excerptNode->count() > 0) {
                        $excerpt = trim($excerptNode->first()->text());
                        // Limit excerpt length
                        if (strlen($excerpt) > 200) {
                            $excerpt = substr($excerpt, 0, 200) . '...';
                        }
                    }

                    // Extract featured image
                    $imageUrl = '';
                    $imageNode = $articleCrawler->filter('.wp-post-image, .featured-image img, article img');
                    if ($imageNode->count() > 0) {
                        $imageUrl = $imageNode->first()->attr('src');
                    }

                    // Save to database
                    Article::create([
                        'title' => $title,
                        'content' => $content,
                        'url' => $url,
                        'excerpt' => $excerpt,
                        'image_url' => $imageUrl,
                        'is_updated' => false,
                    ]);

                    $this->info("  ✓ Successfully saved!");

                    // Be polite - wait between requests
                    sleep(2);

                } catch (\Exception $e) {
                    $this->error("  ✗ Failed: " . $e->getMessage());
                }
            }

            $this->info("");
            $this->info("========================================");
            $this->info("Scraping completed successfully!");
            $this->info("Total articles scraped: " . Article::where('is_updated', false)->count());
            $this->info("========================================");
            
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Fatal Error: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
