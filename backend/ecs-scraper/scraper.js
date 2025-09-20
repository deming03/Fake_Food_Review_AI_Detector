const { chromium } = require('playwright');
const AWS = require('aws-sdk');
const express = require('express');

const app = express();
app.use(express.json());

// Configure AWS
const dynamodb = new AWS.DynamoDB.DocumentClient();

/**
 * Main scraping function for Google Maps restaurant reviews
 */
async function scrapeGoogleMapsReviews(restaurantUrl, maxReviews = 100) {
    console.log(`Starting scrape for: ${restaurantUrl}`);
    
    const browser = await chromium.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    });

    try {
        const page = await browser.newPage();
        
        // Set user agent to avoid detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Navigate to the restaurant page
        await page.goto(restaurantUrl, { waitUntil: 'networkidle' });
        
        // Wait for the page to load
        await page.waitForTimeout(3000);
        
        // Extract restaurant information
        const restaurantInfo = await extractRestaurantInfo(page);
        console.log('Restaurant info extracted:', restaurantInfo.name);
        
        // Click on reviews tab if it exists
        try {
            await page.click('[data-tab-index="1"]', { timeout: 5000 });
            await page.waitForTimeout(2000);
        } catch (error) {
            console.log('Reviews tab not found, continuing...');
        }
        
        // Scrape reviews
        const reviews = await scrapeReviews(page, maxReviews);
        console.log(`Scraped ${reviews.length} reviews`);
        
        return {
            restaurant: restaurantInfo,
            reviews: reviews,
            scrapedAt: new Date().toISOString(),
            url: restaurantUrl
        };
        
    } finally {
        await browser.close();
    }
}

/**
 * Extract restaurant information from the page
 */
async function extractRestaurantInfo(page) {
    try {
        const restaurantInfo = await page.evaluate(() => {
            // Try multiple selectors for restaurant name
            const nameSelectors = [
                'h1[data-attrid="title"]',
                'h1.x3AX1-LfntMc-header-title-title',
                '[data-attrid="title"] span',
                'h1'
            ];
            
            let name = 'Unknown Restaurant';
            for (const selector of nameSelectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent.trim()) {
                    name = element.textContent.trim();
                    break;
                }
            }
            
            // Try to get address
            const addressSelectors = [
                '[data-attrid="kc:/location/location:address"]',
                '.LrzXr',
                '[jsaction*="address"]'
            ];
            
            let address = 'Address not found';
            for (const selector of addressSelectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent.trim()) {
                    address = element.textContent.trim();
                    break;
                }
            }
            
            // Try to get rating
            let rating = null;
            const ratingElement = document.querySelector('[jscontroller="jNLbad"] span[aria-hidden="true"]');
            if (ratingElement) {
                rating = parseFloat(ratingElement.textContent);
            }
            
            return { name, address, rating };
        });
        
        return restaurantInfo;
    } catch (error) {
        console.error('Error extracting restaurant info:', error);
        return { name: 'Unknown Restaurant', address: 'Unknown Address', rating: null };
    }
}

/**
 * Scrape reviews from the current page
 */
async function scrapeReviews(page, maxReviews) {
    const reviews = [];
    let lastReviewCount = 0;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (reviews.length < maxReviews && attempts < maxAttempts) {
        // Scroll to load more reviews
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        
        await page.waitForTimeout(2000);
        
        // Extract reviews from current page
        const newReviews = await page.evaluate(() => {
            const reviewElements = document.querySelectorAll('[data-review-id], .jftiEf, .gws-localreviews__google-review');
            const reviews = [];
            
            reviewElements.forEach((element, index) => {
                try {
                    // Extract review text
                    const textElement = element.querySelector('.wiI7pd, .MyEned, .review-snippet');
                    const text = textElement ? textElement.textContent.trim() : '';
                    
                    if (!text || text.length < 10) return; // Skip empty or very short reviews
                    
                    // Extract author
                    const authorElement = element.querySelector('.d4r55, .LbUacb, .reviewer-name');
                    const author = authorElement ? authorElement.textContent.trim() : `Reviewer ${index + 1}`;
                    
                    // Extract rating
                    let rating = 5; // Default rating
                    const ratingElement = element.querySelector('[aria-label*="star"], .kvMYJc');
                    if (ratingElement) {
                        const ariaLabel = ratingElement.getAttribute('aria-label');
                        if (ariaLabel) {
                            const ratingMatch = ariaLabel.match(/(\d+)/);
                            if (ratingMatch) {
                                rating = parseInt(ratingMatch[1]);
                            }
                        }
                    }
                    
                    // Extract date
                    const dateElement = element.querySelector('.rsqaWe, .p2TkOb, .review-date');
                    let date = new Date().toISOString().split('T')[0]; // Default to today
                    if (dateElement) {
                        const dateText = dateElement.textContent.trim();
                        // Parse relative dates like "2 weeks ago", "1 month ago"
                        if (dateText.includes('day')) {
                            const days = parseInt(dateText) || 1;
                            date = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        } else if (dateText.includes('week')) {
                            const weeks = parseInt(dateText) || 1;
                            date = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        } else if (dateText.includes('month')) {
                            const months = parseInt(dateText) || 1;
                            date = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        }
                    }
                    
                    const review = {
                        id: `review_${Date.now()}_${index}`,
                        author: author,
                        rating: rating,
                        text: text,
                        date: date,
                        helpful_count: 0
                    };
                    
                    reviews.push(review);
                } catch (error) {
                    console.error('Error parsing review:', error);
                }
            });
            
            return reviews;
        });
        
        // Add new unique reviews
        newReviews.forEach(review => {
            if (!reviews.find(r => r.text === review.text)) {
                reviews.push(review);
            }
        });
        
        // Check if we're getting new reviews
        if (reviews.length === lastReviewCount) {
            attempts++;
        } else {
            attempts = 0;
            lastReviewCount = reviews.length;
        }
        
        console.log(`Current review count: ${reviews.length}`);
    }
    
    return reviews.slice(0, maxReviews);
}

/**
 * API endpoint for scraping
 */
app.post('/scrape', async (req, res) => {
    try {
        const { restaurantUrl, maxReviews = 100 } = req.body;
        
        if (!restaurantUrl) {
            return res.status(400).json({ error: 'Restaurant URL is required' });
        }
        
        console.log(`Received scraping request for: ${restaurantUrl}`);
        
        const result = await scrapeGoogleMapsReviews(restaurantUrl, maxReviews);
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('Scraping error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Google Maps scraper service running on port ${PORT}`);
});

module.exports = { scrapeGoogleMapsReviews };
