const AWS = require('aws-sdk');

// 配置AWS服务
const dynamodb = new AWS.DynamoDB.DocumentClient();

// 环境变量
const ANALYSIS_TABLE = process.env.ANALYSIS_TABLE || 'fake-food-detector-analysis-results';

/**
 * Lambda函数 - 获取分析历史记录
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
        
        // 获取查询参数
        const queryParams = event.queryStringParameters || {};
        const limit = parseInt(queryParams.limit) || 20; // Default return 20 records
        const lastKey = queryParams.lastKey; // Used for pagination
        
        // 扫描DynamoDB表获取历史记录
        const params = {
            TableName: ANALYSIS_TABLE,
            Limit: limit,
            ScanIndexForward: false, // 按创建时间降序排列
        };
        
        // If lastKey exists, add to parameters for pagination
        if (lastKey) {
            params.ExclusiveStartKey = JSON.parse(decodeURIComponent(lastKey));
        }
        
        const result = await dynamodb.scan(params).promise();
        
        // Convert data format
        const historyItems = result.Items.map(item => ({
            id: item.analysis_id,
            restaurantId: item.restaurant_id,
            credibilityScore: item.credibility_score,
            totalReviewsAnalyzed: item.total_reviews_analyzed,
            fakeReviewsDetected: item.fake_reviews_detected,
            suspiciousPatterns: item.suspicious_patterns || [],
            analysisDate: item.created_at,
            reviews: [] // History list doesn't include detailed reviews to save bandwidth
        }));
        
        // Sort by time
        historyItems.sort((a, b) => new Date(b.analysisDate) - new Date(a.analysisDate));
        
        // Prepare response
        const response = {
            success: true,
            data: historyItems,
            hasMore: !!result.LastEvaluatedKey
        };
        
        // If there's more data, add nextKey for pagination
        if (result.LastEvaluatedKey) {
            response.nextKey = encodeURIComponent(JSON.stringify(result.LastEvaluatedKey));
        }
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response)
        };
        
    } catch (error) {
        console.error('Error getting history records:', error);
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
