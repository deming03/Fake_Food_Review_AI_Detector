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
 * 使用AI分析评论真实性
 */
async function analyzeReviews(reviews, restaurantId) {
    // 为演示目的，使用基于规则的分析
    // 在实际部署中会调用Amazon Bedrock
    
    const fakeReviews = [];
    const fakeScores = {};
    const suspiciousPatterns = [];
    
    reviews.forEach(review => {
        let fakeScore = 0;
        
        // 简单的虚假检测规则
        const text = review.text.toLowerCase();
        
        // 1. 过于简单的评论
        if (review.text.length < 20) {
            fakeScore += 0.3;
            suspiciousPatterns.push('发现过于简单的评论');
        }
        
        // 2. 过度使用感叹号
        const exclamationCount = (review.text.match(/！|!/g) || []).length;
        if (exclamationCount > 3) {
            fakeScore += 0.4;
            suspiciousPatterns.push('发现过度使用感叹号的评论');
        }
        
        // 3. 重复词汇
        if (text.includes('好吃') && text.includes('推荐') && text.includes('棒')) {
            fakeScore += 0.2;
        }
        
        // 4. 5星评论但缺乏具体细节
        if (review.rating === 5 && review.text.length < 30) {
            fakeScore += 0.3;
            suspiciousPatterns.push('发现高评分但缺乏细节的评论');
        }
        
        fakeScores[review.id] = Math.min(fakeScore, 1.0);
        
        if (fakeScore > 0.6) {
            fakeReviews.push(review.id);
        }
    });
    
    // 去重可疑模式
    const uniquePatterns = [...new Set(suspiciousPatterns)];
    
    // 计算总体可信度
    const totalReviews = reviews.length;
    const fakeCount = fakeReviews.length;
    const credibilityScore = Math.round((1 - (fakeCount / totalReviews)) * 100);
    
    return {
        credibilityScore: Math.max(credibilityScore, 30), // 最低30分
        fakeReviews,
        fakeScores,
        suspiciousPatterns: uniquePatterns
    };
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
