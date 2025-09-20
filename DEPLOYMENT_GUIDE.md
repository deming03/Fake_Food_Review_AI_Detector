# 🚀 虚假餐厅评论AI检测器 - 完整部署指南

## 📋 项目概述

这是一个基于React Native + AWS的虚假餐厅评论检测系统，能够：
- 分析Google Maps餐厅评论的真实性
- 提供AI驱动的虚假评论检测
- 显示可信度评分和可疑评论高亮
- 支持iOS和Android双平台

## 🏗️ 技术架构

### 前端 (React Native)
- **框架**: React Native 0.81.4
- **导航**: React Navigation v6
- **HTTP客户端**: Axios
- **状态管理**: React Hooks + Context API

### 后端 (AWS)
- **API Gateway**: REST API端点
- **Lambda函数**: 3个核心函数
- **DynamoDB**: 3个数据表
- **CloudFormation**: 基础设施即代码
- **区域**: ap-southeast-1

## 📁 项目结构

```
Fake_Food_Review_AI_Detector/
├── FakeFoodDetector/          # React Native应用
│   ├── src/
│   │   ├── screens/           # 页面组件
│   │   ├── services/          # API服务
│   │   ├── utils/            # 工具函数
│   │   ├── types/            # TypeScript类型
│   │   └── App.tsx           # 主应用
│   └── package.json
├── backend/                   # AWS后端
│   ├── lambda/               # Lambda函数
│   │   ├── restaurant-analyzer/  # 主分析函数
│   │   ├── get-analysis/         # 获取结果函数
│   │   └── get-history/          # 历史记录函数
│   ├── dynamodb/             # 数据表配置
│   ├── scripts/              # 部署和管理脚本
│   └── cloudformation-template.yaml  # 基础设施模板
└── docs/                     # 项目文档
```

## 🛠️ 部署步骤

### 第一步：环境准备

1. **Node.js环境** (✅ 已完成)
   ```bash
   node --version  # v24.8.0
   npm --version   # 11.6.0
   ```

2. **AWS CLI安装** (✅ 已完成)
   ```bash
   winget install Amazon.AWSCLI
   ```

3. **React Native开发环境**
   - Android Studio (用于Android开发)
   - Xcode (用于iOS开发 - 仅Mac)

### 第二步：获取新的AWS凭证

⚠️ **重要**: 当前AWS会话令牌已过期，需要获取新凭证

1. 访问AWS沙箱环境获取新的临时凭证
2. 设置环境变量：
   ```powershell
   # 在PowerShell中运行
   $env:AWS_ACCESS_KEY_ID="新的访问密钥"
   $env:AWS_SECRET_ACCESS_KEY="新的秘密访问密钥"
   $env:AWS_SESSION_TOKEN="新的会话令牌"
   $env:AWS_DEFAULT_REGION="ap-southeast-1"
   ```

### 第三步：部署AWS后端

1. **部署基础设施**
   ```bash
   cd backend
   
   # 方式1: 使用自动化部署脚本 (推荐)
   node scripts/deploy-backend.js
   
   # 方式2: 手动部署
   # 创建CloudFormation stack
   aws cloudformation create-stack \
     --stack-name fake-food-detector-stack \
     --template-body file://cloudformation-template.yaml \
     --parameters ParameterKey=ProjectName,ParameterValue=fake-food-detector \
                  ParameterKey=Environment,ParameterValue=development \
     --capabilities CAPABILITY_NAMED_IAM
   ```

2. **部署Lambda函数**
   ```bash
   # 进入每个Lambda函数目录并部署
   cd lambda/restaurant-analyzer
   npm install
   powershell Compress-Archive -Path * -DestinationPath function.zip -Force
   aws lambda update-function-code --function-name fake-food-detector-restaurant-analyzer --zip-file fileb://function.zip
   
   # 重复上述步骤部署其他函数
   ```

3. **获取API Gateway URL**
   ```bash
   aws cloudformation describe-stacks \
     --stack-name fake-food-detector-stack \
     --query "Stacks[0].Outputs[?OutputKey=='APIGatewayURL'].OutputValue" \
     --output text
   ```

### 第四步：配置React Native应用

1. **更新API配置**
   编辑 `FakeFoodDetector/src/services/api.ts`：
   ```typescript
   // 将获取到的API Gateway URL替换到这里
   const API_BASE_URL = 'https://your-api-id.execute-api.ap-southeast-1.amazonaws.com/development';
   ```

2. **安装React Native依赖**
   ```bash
   cd FakeFoodDetector
   npm install
   ```

3. **运行应用**
   ```bash
   # 启动Metro服务器
   npm start
   
   # 在另一个终端窗口运行Android/iOS
   npx react-native run-android  # Android
   npx react-native run-ios      # iOS (仅Mac)
   ```

## 🧪 测试应用

### 1. 启动React Native应用
Metro服务器已经在后台运行，确保能够看到主界面

### 2. 测试功能流程
1. **主页面**: 输入Google Maps餐厅链接
2. **分析页面**: 观察AI分析进度
3. **结果页面**: 查看可信度评分和虚假评论检测
4. **历史记录**: 查看之前的分析结果

### 3. 测试用例
```
测试URL示例:
https://maps.google.com/place/Test+Restaurant/@1.3521,103.8198
https://maps.app.goo.gl/example
```

## 🔧 故障排除

### AWS相关问题

1. **会话令牌过期**
   ```bash
   # 重新获取并设置新的AWS凭证
   $env:AWS_SESSION_TOKEN="新令牌"
   ```

2. **API Gateway连接失败**
   - 确认API Gateway URL正确
   - 检查CORS配置
   - 验证Lambda函数权限

3. **DynamoDB权限错误**
   - 检查Lambda执行角色权限
   - 确认表名配置正确

### React Native相关问题

1. **Metro服务器无法启动**
   ```bash
   npx react-native start --reset-cache
   ```

2. **依赖安装问题**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Android构建失败**
   - 确保Android Studio已安装
   - 检查Java/Android SDK配置

## 📊 系统监控

### CloudWatch日志
```bash
# 查看Lambda函数日志
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/fake-food-detector"
```

### DynamoDB监控
```bash
# 检查表状态
aws dynamodb describe-table --table-name fake-food-detector-restaurants
```

### API Gateway监控
通过AWS控制台查看API Gateway的请求统计和错误率

## 🚀 生产部署建议

1. **安全性**
   - 实施API密钥认证
   - 设置WAF规则
   - 启用CloudTrail日志

2. **性能优化**
   - 配置DynamoDB自动扩展
   - 启用API Gateway缓存
   - 优化Lambda函数内存配置

3. **监控告警**
   - 设置CloudWatch告警
   - 配置SNS通知
   - 实施健康检查

## 📝 API文档

### POST /analyze
分析餐厅评论
```json
{
  "googleMapsUrl": "https://maps.google.com/place/..."
}
```

### GET /analysis/{analysisId}
获取分析结果
```json
{
  "success": true,
  "data": {
    "id": "analysis_id",
    "credibilityScore": 78,
    "totalReviewsAnalyzed": 156,
    "fakeReviewsDetected": 12,
    ...
  }
}
```

### GET /history
获取分析历史
```json
{
  "success": true,
  "data": [...],
  "hasMore": false
}
```

## 🎯 下一步开发计划

1. **增强功能**
   - 集成真实的Google Places API
   - 实施ECS爬虫服务
   - 集成Amazon Bedrock AI分析

2. **用户体验**
   - 添加用户认证
   - 实施推送通知
   - 优化界面设计

3. **iOS快捷指令**
   - 配置URL Scheme
   - 创建快捷指令自动化

---

## 🆘 需要帮助？

如果在部署过程中遇到问题：
1. 检查AWS凭证是否有效
2. 确认所有依赖已正确安装
3. 查看CloudWatch日志获取详细错误信息
4. 参考AWS文档或联系技术支持

**项目状态**: ✅ 基础架构完成 | ⏳ 等待AWS凭证更新以完成部署
