#!/usr/bin/env node
/**
 * 部署AWS后端基础设施和Lambda函数的脚本
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
    projectName: 'fake-food-detector',
    environment: 'development',
    region: process.env.AWS_DEFAULT_REGION || 'ap-southeast-1',
    stackName: 'fake-food-detector-stack'
};

console.log('🚀 开始部署Fake Food Detector后端...');
console.log(`📋 配置信息:`);
console.log(`   项目名称: ${CONFIG.projectName}`);
console.log(`   环境: ${CONFIG.environment}`);
console.log(`   区域: ${CONFIG.region}`);
console.log(`   CloudFormation Stack: ${CONFIG.stackName}`);

async function main() {
    try {
        // 1. 检查AWS凭证
        checkAWSCredentials();
        
        // 2. 部署CloudFormation stack
        await deployCloudFormation();
        
        // 3. 获取API Gateway URL
        const apiUrl = await getAPIGatewayURL();
        
        // 4. 打包和部署Lambda函数
        await deployLambdaFunctions();
        
        // 5. 更新React Native配置
        await updateReactNativeConfig(apiUrl);
        
        console.log('\n🎉 后端部署完成！');
        console.log(`\n📡 API Gateway URL: ${apiUrl}`);
        console.log(`\n📱 请更新React Native应用中的API URL配置`);
        
    } catch (error) {
        console.error('❌ 部署失败:', error.message);
        process.exit(1);
    }
}

function checkAWSCredentials() {
    console.log('\n🔐 检查AWS凭证...');
    
    const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        throw new Error(`缺少AWS凭证环境变量: ${missingVars.join(', ')}`);
    }
    
    try {
        // 测试AWS连接
        execSync('aws sts get-caller-identity', { stdio: 'pipe' });
        console.log('✅ AWS凭证验证成功');
    } catch (error) {
        throw new Error('AWS凭证验证失败，请检查凭证是否正确');
    }
}

async function deployCloudFormation() {
    console.log('\n☁️  部署CloudFormation基础设施...');
    
    const templatePath = path.join(__dirname, '..', 'cloudformation-template.yaml');
    
    if (!fs.existsSync(templatePath)) {
        throw new Error('CloudFormation模板文件不存在');
    }
    
    try {
        // 检查stack是否已存在
        let stackExists = false;
        try {
            execSync(`aws cloudformation describe-stacks --stack-name ${CONFIG.stackName}`, { stdio: 'pipe' });
            stackExists = true;
        } catch (error) {
            // Stack不存在，这是正常的
        }
        
        const command = stackExists ? 'update-stack' : 'create-stack';
        const actionText = stackExists ? '更新' : '创建';
        
        console.log(`📦 ${actionText}CloudFormation stack...`);
        
        const deployCmd = `aws cloudformation ${command} \\
            --stack-name ${CONFIG.stackName} \\
            --template-body file://${templatePath} \\
            --parameters ParameterKey=ProjectName,ParameterValue=${CONFIG.projectName} ParameterKey=Environment,ParameterValue=${CONFIG.environment} \\
            --capabilities CAPABILITY_NAMED_IAM \\
            --region ${CONFIG.region}`;
        
        execSync(deployCmd, { stdio: 'inherit' });
        
        // 等待stack部署完成
        console.log('⏳ 等待CloudFormation部署完成...');
        const waitCmd = `aws cloudformation wait stack-${command === 'create-stack' ? 'create' : 'update'}-complete --stack-name ${CONFIG.stackName}`;
        execSync(waitCmd, { stdio: 'inherit' });
        
        console.log(`✅ CloudFormation ${actionText}成功`);
        
    } catch (error) {
        if (error.message.includes('No updates are to be performed')) {
            console.log('✅ CloudFormation stack无需更新');
        } else {
            throw new Error(`CloudFormation部署失败: ${error.message}`);
        }
    }
}

async function getAPIGatewayURL() {
    console.log('\n🔗 获取API Gateway URL...');
    
    try {
        const cmd = `aws cloudformation describe-stacks --stack-name ${CONFIG.stackName} --query "Stacks[0].Outputs[?OutputKey=='APIGatewayURL'].OutputValue" --output text`;
        const apiUrl = execSync(cmd, { encoding: 'utf-8' }).trim();
        
        if (!apiUrl || apiUrl === 'None') {
            throw new Error('无法获取API Gateway URL');
        }
        
        console.log(`✅ API Gateway URL: ${apiUrl}`);
        return apiUrl;
        
    } catch (error) {
        throw new Error(`获取API Gateway URL失败: ${error.message}`);
    }
}

async function deployLambdaFunctions() {
    console.log('\n⚡ 部署Lambda函数...');
    
    const lambdaFunctions = [
        {
            name: 'restaurant-analyzer',
            functionName: `${CONFIG.projectName}-restaurant-analyzer`,
            path: path.join(__dirname, '..', 'lambda', 'restaurant-analyzer')
        },
        {
            name: 'get-analysis',
            functionName: `${CONFIG.projectName}-get-analysis`,
            path: path.join(__dirname, '..', 'lambda', 'get-analysis')
        },
        {
            name: 'get-history',
            functionName: `${CONFIG.projectName}-get-history`,
            path: path.join(__dirname, '..', 'lambda', 'get-history')
        }
    ];
    
    for (const func of lambdaFunctions) {
        console.log(`📦 部署 ${func.name} 函数...`);
        
        try {
            // 切换到函数目录
            process.chdir(func.path);
            
            // 安装依赖（如果package.json存在）
            if (fs.existsSync('package.json')) {
                console.log(`   📥 安装依赖...`);
                execSync('npm install', { stdio: 'pipe' });
            }
            
            // 创建部署包
            console.log(`   📄 创建部署包...`);
            if (fs.existsSync('function.zip')) {
                fs.unlinkSync('function.zip');
            }
            
            // 使用PowerShell的Compress-Archive命令（Windows兼容）
            execSync('powershell Compress-Archive -Path * -DestinationPath function.zip -Force', { stdio: 'pipe' });
            
            // 更新Lambda函数代码
            console.log(`   🔄 更新函数代码...`);
            const updateCmd = `aws lambda update-function-code --function-name ${func.functionName} --zip-file fileb://function.zip`;
            execSync(updateCmd, { stdio: 'pipe' });
            
            console.log(`   ✅ ${func.name} 部署成功`);
            
        } catch (error) {
            console.error(`   ❌ ${func.name} 部署失败: ${error.message}`);
        }
    }
    
    // 回到脚本目录
    process.chdir(__dirname);
}

async function updateReactNativeConfig(apiUrl) {
    console.log('\n📱 更新React Native配置...');
    
    try {
        const apiServicePath = path.join(__dirname, '..', '..', 'FakeFoodDetector', 'src', 'services', 'api.ts');
        
        if (!fs.existsSync(apiServicePath)) {
            console.log('⚠️  React Native API配置文件不存在，跳过更新');
            return;
        }
        
        let apiServiceContent = fs.readFileSync(apiServicePath, 'utf-8');
        
        // 替换API基础URL
        const newApiBaseUrl = `const API_BASE_URL = '${apiUrl}';`;
        apiServiceContent = apiServiceContent.replace(
            /const API_BASE_URL = [^;]+;/,
            newApiBaseUrl
        );
        
        fs.writeFileSync(apiServicePath, apiServiceContent);
        
        console.log('✅ React Native API配置已更新');
        
    } catch (error) {
        console.log('⚠️  更新React Native配置失败:', error.message);
    }
}

// 主函数错误处理
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ 未处理的异步错误:', reason);
    process.exit(1);
});

// 运行部署
main();
