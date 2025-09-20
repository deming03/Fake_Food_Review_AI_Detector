const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// 配置AWS服务
const dynamodb = new AWS.DynamoDB.DocumentClient();
const bedrock = new AWS.BedrockRuntime();

// 环境变量
const RESTAURANTS_TABLE = process.env.RESTAURANTS_TABLE || 'fake-food-detector-restaurants';
const REVIEWS_TABLE = process.env.REVIEWS_TABLE || 'fake-food-detector-reviews';
const ANALYSIS_TABLE = process.env.ANALYSIS_TABLE || 'fake-food-detector-analysis-results';

/**
 * 主Lambda函数 - 分析餐厅评论
 */
exports.handler = async (event) => {
    console.log('收到事件:', JSON.stringify(event, null, 2));
    
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    };
    
    try {
        // 处理CORS预检请求
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'CORS preflight successful' })
            };
        }
        
        // 解析请求体
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        const { googleMapsUrl } = body;
        
        if (!googleMapsUrl) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Missing googleMapsUrl parameter'
                })
            };
        }
        
        // 解析Google Maps URL
        const restaurantInfo = parseGoogleMapsUrl(googleMapsUrl);
        if (!restaurantInfo.isValid) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Invalid Google Maps URL'
                })
            };
        }
        
        // 生成分析ID
        const analysisId = uuidv4();
        const restaurantId = uuidv4();
        
        // 1. 保存餐厅信息
        await saveRestaurantInfo(restaurantId, restaurantInfo);
        
        // 2. 爬取评论 (模拟数据)
        const reviews = await scrapeReviews(googleMapsUrl);
        
        // 3. AI分析评论真实性
        const analysisResult = await analyzeReviews(reviews, restaurantId);
        
        // 4. 保存分析结果
        const finalResult = {
            id: analysisId,
            restaurantId,
            credibilityScore: analysisResult.credibilityScore,
            totalReviewsAnalyzed: reviews.length,
            fakeReviewsDetected: analysisResult.fakeReviews.length,
            suspiciousPatterns: analysisResult.suspiciousPatterns,
            analysisDate: new Date().toISOString(),
            reviews: reviews.map(review => ({
                ...review,
                isDetectedAsFake: analysisResult.fakeReviews.includes(review.id),
                fakeScore: analysisResult.fakeScores[review.id] || 0
            }))
        };
        
        await saveAnalysisResult(analysisId, finalResult);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: finalResult
            })
        };
        
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Internal server error'
            })
        };
    }
};

/**
 * 解析Google Maps URL
 */
function parseGoogleMapsUrl(url) {
    try {
        if (!url.includes('maps.google') && !url.includes('goo.gl')) {
            return { isValid: false };
        }
        
        // 尝试提取place_id
        const placeIdMatch = url.match(/place_id:([a-zA-Z0-9_-]+)/);
        if (placeIdMatch) {
            return {
                isValid: true,
                placeId: placeIdMatch[1],
                name: 'Restaurant Name', // Should be obtained via Google Places API
                address: 'Restaurant Address'
            };
        }
        
        // 尝试提取地点名称
        const placeNameMatch = url.match(/place\/([^/]+)/);
        if (placeNameMatch) {
            const name = decodeURIComponent(placeNameMatch[1].replace(/\+/g, ' '));
            return {
                isValid: true,
                placeName: name,
                name,
                address: 'Address to be obtained'
            };
        }
        
        return { 
            isValid: true,
            name: 'Unknown Restaurant',
            address: 'Address Unknown'
        };
    } catch (error) {
        return { isValid: false };
    }
}

/**
 * 保存餐厅信息到DynamoDB
 */
async function saveRestaurantInfo(restaurantId, restaurantInfo) {
    const params = {
        TableName: RESTAURANTS_TABLE,
        Item: {
            restaurant_id: restaurantId,
            name: restaurantInfo.name,
            address: restaurantInfo.address,
            place_id: restaurantInfo.placeId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    };
    
    await dynamodb.put(params).promise();
}

/**
 * 爬取评论 (当前返回模拟数据)
 * 在实际部署中，这里会调用ECS任务来运行Playwright爬虫
 */
async function scrapeReviews(googleMapsUrl) {
    // TODO: 实际的爬虫逻辑会在这里
    // 现在返回模拟数据
    return [
        {
            id: 'review_1',
            author: '张**',
            rating: 5,
            text: '非常好吃，服务态度也很好，推荐大家来试试！强烈推荐！',
            date: '2024-01-15',
            helpful_count: 3
        },
        {
            id: 'review_2',
            author: '李**',
            rating: 4,
            text: '菜品味道不错，环境也很舒适，就是人有点多，需要等位。价格合理，分量足够，服务员态度很好，会再来的。推荐他们的招牌菜。',
            date: '2024-01-14',
            helpful_count: 8
        },
        {
            id: 'review_3',
            author: '王**',
            rating: 5,
            text: '好吃好吃好吃！！！太棒了！！！',
            date: '2024-01-13',
            helpful_count: 1
        },
        {
            id: 'review_4',
            author: '刘**',
            rating: 3,
            text: '整体还可以，但是性价比不是特别高。装修比较新，服务还行。菜品质量有些不稳定，有的好吃有的一般。',
            date: '2024-01-12',
            helpful_count: 5
        }
    ];
}

/**
 * 使用Amazon Bedrock AI分析评论真实性
 */
async function analyzeReviews(reviews, restaurantId) {
    console.log('Starting AI analysis with Bedrock for', reviews.length, 'reviews');
    
    const fakeReviews = [];
    const fakeScores = {};
    const suspiciousPatterns = [];
    
    try {
        // Prepare reviews for AI analysis
        const reviewsText = reviews.map(r => `Review ${r.id}: ${r.text} (Rating: ${r.rating})`).join('\n');
        
        // Amazon Bedrock AI Analysis
        const aiAnalysis = await callBedrockAI(reviewsText);
        
        // Process AI results
        if (aiAnalysis && aiAnalysis.fakeReviews) {
            aiAnalysis.fakeReviews.forEach(fakeReview => {
                fakeReviews.push(fakeReview.id);
                fakeScores[fakeReview.id] = fakeReview.score;
            });
            
            if (aiAnalysis.patterns) {
                suspiciousPatterns.push(...aiAnalysis.patterns);
            }
        }
    } catch (error) {
        console.error('Bedrock AI analysis failed, falling back to rule-based:', error);
        
        // Fallback to enhanced rule-based analysis
        reviews.forEach(review => {
            let fakeScore = 0;
            const text = review.text.toLowerCase();
            
            // Enhanced detection rules
            if (review.text.length < 20) {
                fakeScore += 0.3;
                suspiciousPatterns.push('Detected overly simple reviews');
            }
            
            const exclamationCount = (review.text.match(/！|!/g) || []).length;
            if (exclamationCount > 3) {
                fakeScore += 0.4;
                suspiciousPatterns.push('Found reviews with excessive exclamation marks');
            }
            
            // Generic promotional language detection
            const promoWords = ['best', 'amazing', 'perfect', 'must try', 'definitely', 'absolutely'];
            const promoCount = promoWords.filter(word => text.includes(word)).length;
            if (promoCount > 2) {
                fakeScore += 0.3;
                suspiciousPatterns.push('Identified potential promotional language');
            }
            
            // Short high-rating reviews
            if (review.rating === 5 && review.text.length < 30) {
                fakeScore += 0.3;
                suspiciousPatterns.push('Found high ratings with insufficient details');
            }
            
            // Repetitive patterns
            if (text.includes('good') && text.includes('recommend') && text.includes('great')) {
                fakeScore += 0.2;
                suspiciousPatterns.push('Detected repetitive promotional patterns');
            }
            
            fakeScores[review.id] = Math.min(fakeScore, 1.0);
            
            if (fakeScore > 0.6) {
                fakeReviews.push(review.id);
            }
        });
    }
    
    // Remove duplicate patterns
    const uniquePatterns = [...new Set(suspiciousPatterns)];
    
    // Calculate overall credibility
    const totalReviews = reviews.length;
    const fakeCount = fakeReviews.length;
    const credibilityScore = Math.round((1 - (fakeCount / totalReviews)) * 100);
    
    console.log(`Analysis complete: ${fakeCount}/${totalReviews} fake reviews detected, credibility: ${credibilityScore}%`);
    
    return {
        credibilityScore: Math.max(credibilityScore, 30),
        fakeReviews,
        fakeScores,
        suspiciousPatterns: uniquePatterns
    };
}

/**
 * 调用Amazon Bedrock AI进行分析
 */
async function callBedrockAI(reviewsText) {
    try {
        const prompt = `
You are an expert at detecting fake restaurant reviews. Analyze the following reviews and identify which ones are likely fake.

Reviews to analyze:
${reviewsText}

Please respond with a JSON object containing:
1. "fakeReviews": array of objects with "id" and "score" (0-1) for detected fake reviews
2. "patterns": array of strings describing suspicious patterns found
3. "reasoning": brief explanation of your analysis

Focus on detecting:
- Overly promotional language
- Lack of specific details
- Unnatural writing patterns
- Extreme positive sentiment without substance
- Reviews that seem bot-generated

Response format:
{
  "fakeReviews": [{"id": "review_1", "score": 0.8}],
  "patterns": ["Excessive promotional language", "Lack of specific details"],
  "reasoning": "Analysis explanation"
}`;

        const params = {
            modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                anthropic_version: 'bedrock-2023-05-31',
                max_tokens: 2000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        };

        const command = {
            ...params,
            body: params.body
        };

        const response = await bedrock.invokeModel(command).promise();
        const responseBody = JSON.parse(Buffer.from(response.body).toString());
        
        if (responseBody.content && responseBody.content[0]) {
            const aiResponse = JSON.parse(responseBody.content[0].text);
            console.log('Bedrock AI analysis successful:', aiResponse.reasoning);
            return aiResponse;
        }
        
        throw new Error('Invalid Bedrock response format');
        
    } catch (error) {
        console.error('Bedrock AI call failed:', error.message);
        throw error;
    }
}

/**
 * 保存分析结果
 */
async function saveAnalysisResult(analysisId, result) {
    const params = {
        TableName: ANALYSIS_TABLE,
        Item: {
            analysis_id: analysisId,
            restaurant_id: result.restaurantId,
            credibility_score: result.credibilityScore,
            total_reviews_analyzed: result.totalReviewsAnalyzed,
            fake_reviews_detected: result.fakeReviewsDetected,
            suspicious_patterns: result.suspiciousPatterns,
            created_at: result.analysisDate,
            analysis_data: result
        }
    };
    
    await dynamodb.put(params).promise();
    
    // 同时保存评论数据
    for (const review of result.reviews) {
        const reviewParams = {
            TableName: REVIEWS_TABLE,
            Item: {
                review_id: review.id,
                restaurant_id: result.restaurantId,
                analysis_id: analysisId,
                author: review.author,
                rating: review.rating,
                text: review.text,
                date: review.date,
                is_detected_as_fake: review.isDetectedAsFake,
                fake_score: review.fakeScore,
                created_at: new Date().toISOString()
            }
        };
        await dynamodb.put(reviewParams).promise();
    }
}
