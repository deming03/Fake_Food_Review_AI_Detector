#!/usr/bin/env node
/**
 * 创建DynamoDB表的Node.js脚本
 * 使用AWS凭证环境变量来连接AWS
 */

const fs = require('fs');
const path = require('path');

// 检查环境变量
const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.log(`❌ 缺少AWS凭证环境变量: ${missingVars.join(', ')}`);
    console.log('请先设置AWS环境变量:');
    console.log('$env:AWS_ACCESS_KEY_ID="your_access_key"');
    console.log('$env:AWS_SECRET_ACCESS_KEY="your_secret_key"');
    console.log('$env:AWS_SESSION_TOKEN="your_session_token"');
    process.exit(1);
}

// 动态导入AWS SDK
async function createTables() {
    try {
        console.log('🚀 开始创建DynamoDB表...');
        
        // 尝试导入AWS SDK
        let AWS;
        try {
            AWS = require('aws-sdk');
        } catch (error) {
            console.log('❌ AWS SDK未安装，正在安装...');
            console.log('请运行: npm install aws-sdk');
            
            // 创建临时的package.json和安装脚本
            createInstallScript();
            return;
        }

        // 配置AWS
        const region = process.env.AWS_DEFAULT_REGION || 'ap-southeast-1';
        AWS.config.update({ region });

        const dynamodb = new AWS.DynamoDB();

        console.log(`🔗 连接AWS DynamoDB (区域: ${region})`);
        
        // 测试连接
        try {
            await dynamodb.listTables().promise();
            console.log('✅ AWS连接成功');
        } catch (error) {
            console.log(`❌ AWS连接失败: ${error.message}`);
            console.log('请检查AWS凭证和网络连接');
            process.exit(1);
        }

        // 加载表配置
        const schemasPath = path.join(__dirname, '..', 'dynamodb', 'table-schemas.json');
        const schemas = JSON.parse(fs.readFileSync(schemasPath, 'utf8'));
        const tables = schemas.tables || [];

        if (tables.length === 0) {
            console.log('❌ 没有找到表配置');
            process.exit(1);
        }

        // 创建所有表
        let successCount = 0;
        const totalCount = tables.length;

        for (const tableConfig of tables) {
            const success = await createTable(dynamodb, tableConfig);
            if (success) successCount++;
        }

        // 总结结果
        console.log(`\n📊 创建结果: ${successCount}/${totalCount} 个表创建成功`);

        if (successCount === totalCount) {
            console.log('🎉 所有DynamoDB表创建完成！');
            console.log('\n📋 已创建的表:');
            tables.forEach(table => {
                console.log(`  • ${table.TableName}`);
            });
        } else {
            console.log('⚠️  部分表创建失败，请检查错误信息');
            process.exit(1);
        }

    } catch (error) {
        console.log(`❌ 脚本执行失败: ${error.message}`);
        process.exit(1);
    }
}

async function createTable(dynamodb, tableConfig) {
    const tableName = tableConfig.TableName;
    
    try {
        // 检查表是否已存在
        try {
            await dynamodb.describeTable({ TableName: tableName }).promise();
            console.log(`✓ 表 ${tableName} 已存在`);
            return true;
        } catch (error) {
            if (error.code !== 'ResourceNotFoundException') {
                throw error;
            }
        }

        // 创建表
        console.log(`📋 正在创建表: ${tableName}`);
        
        await dynamodb.createTable(tableConfig).promise();
        
        // 等待表创建完成
        console.log(`⏳ 等待表 ${tableName} 创建完成...`);
        await dynamodb.waitFor('tableExists', { TableName: tableName }).promise();
        
        console.log(`✅ 表 ${tableName} 创建成功`);
        return true;
        
    } catch (error) {
        console.log(`❌ 创建表 ${tableName} 失败: ${error.message}`);
        return false;
    }
}

function createInstallScript() {
    const packageJson = {
        "name": "fake-food-detector-backend",
        "version": "1.0.0",
        "description": "Backend scripts for Fake Food Detector",
        "scripts": {
            "create-tables": "node scripts/create-dynamodb-tables.js"
        },
        "dependencies": {
            "aws-sdk": "^2.1691.0"
        }
    };

    const backendPath = path.join(__dirname, '..');
    fs.writeFileSync(
        path.join(backendPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
    );

    console.log('📦 已创建 backend/package.json');
    console.log('请运行以下命令安装依赖:');
    console.log('cd backend');
    console.log('npm install');
    console.log('然后重新运行此脚本');
}

// 运行脚本
createTables();
