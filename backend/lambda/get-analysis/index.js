const AWS = require('aws-sdk');

// 配置AWS服务
const dynamodb = new AWS.DynamoDB.DocumentClient();

// 环境变量
const ANALYSIS_TABLE = process.env.ANALYSIS_TABLE || 'fake-food-detector-analysis-results';

/**
 * Lambda函数 - 获取分析结果
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
        
        // 获取分析ID
        const analysisId = event.pathParameters?.analysisId;
        
        if (!analysisId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Missing analysisId parameter'
                })
            };
        }
        
        // 从DynamoDB获取分析结果
        const params = {
            TableName: ANALYSIS_TABLE,
            Key: {
                analysis_id: analysisId
            }
        };
        
        const result = await dynamodb.get(params).promise();
        
        if (!result.Item) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Analysis result not found'
                })
            };
        }
        
        // 返回分析数据
        const analysisData = result.Item.analysis_data;
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: analysisData
            })
        };
        
    } catch (error) {
        console.error('Error getting analysis result:', error);
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
