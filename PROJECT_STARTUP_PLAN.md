# 🚀 伪造餐厅评论AI检测器 - 项目启动计划

## 📋 项目概览

### 现有文档分析
- **PLANNING.md**: 详细的项目架构和功能规划，包含iOS应用和AWS后端设计
- **Sandbox_on_AWS.md**: AWS沙箱环境访问凭证和配置信息

### 项目核心目标
创建一个iOS应用，能够：
- 分析Google Maps餐厅评论的真实性
- 提供AI驱动的虚假评论检测
- 集成iOS快捷指令实现无缝用户体验
- 显示可信度评分和可疑评论高亮

## 🏗️ 技术架构

### AWS后端服务 (6个核心服务)
1. **ECS + Fargate**: 运行Playwright爬虫，收集餐厅评论
2. **Lambda**: API编排，触发爬虫任务，调用Bedrock
3. **DynamoDB**: 存储餐厅信息、评论数据和分析结果
4. **Bedrock**: AI推理服务 (LLaMA2/Mistral)，检测虚假评论
5. **API Gateway**: 为iOS应用提供REST API
6. **Amplify**: 可选的Web仪表板

### React Native移动端
- React Native开发 (iOS + Android双平台)
- Google Maps URL解析
- iOS快捷指令集成 (iOS)
- 结果展示界面
- 跨平台代码复用

## 🎯 开发路线图

### Phase 1: AWS后端核心 (优先级：🔥 极高)
**预计时间**: 2-3天

#### 1.1 环境设置
- [ ] 配置AWS CLI使用沙箱凭证
- [ ] 设置开发环境 (Python/Node.js)
- [ ] 创建项目Git仓库

#### 1.2 核心AWS服务部署
- [ ] **DynamoDB设计**
  - 餐厅表: `restaurants`
  - 评论表: `reviews` 
  - 分析结果表: `analysis_results`
- [ ] **Lambda函数开发**
  - API处理函数
  - 爬虫触发函数
  - Bedrock调用函数
- [ ] **API Gateway配置**
  - REST API端点
  - CORS设置
  - 认证配置

#### 1.3 爬虫服务 (ECS)
- [ ] Playwright Docker容器
- [ ] Google Maps评论爬取逻辑
- [ ] ECS任务定义和服务配置

#### 1.4 AI分析服务 (Bedrock)
- [ ] 虚假评论检测提示工程
- [ ] 评分算法设计
- [ ] Bedrock模型集成

### Phase 2: React Native应用核心 (优先级：🔥 高)
**预计时间**: 3-4天

#### 2.1 项目设置
- [ ] 创建React Native项目
- [ ] 配置依赖管理 (npm/yarn)
- [ ] 设置开发环境 (Metro、Flipper)
- [ ] 设计应用架构 (Redux/Context API)

#### 2.2 核心功能开发
- [ ] 餐厅URL输入界面 (React Native组件)
- [ ] API客户端实现 (axios/fetch)
- [ ] 结果展示界面 (FlatList、Charts)
- [ ] 可信度评分可视化 (react-native-svg)
- [ ] 跨平台导航设置 (@react-navigation)

#### 2.3 用户体验优化
- [ ] 加载状态处理
- [ ] 错误处理和反馈
- [ ] 结果历史记录

### Phase 3: iOS快捷指令 + Android深度链接集成 (优先级：🔶 中)
**预计时间**: 1-2天

#### 3.1 深度链接支持
- [ ] React Native深度链接配置 (@react-native-async-storage/linking)
- [ ] iOS快捷指令支持 (URL Scheme)
- [ ] Android Intent处理
- [ ] Google Maps链接解析 (通用函数)

#### 3.2 用户体验流程
- [ ] 后台处理优化
- [ ] 通知推送集成
- [ ] 结果缓存机制

### Phase 4: 优化和演示准备 (优先级：🔶 中)
**预计时间**: 1-2天

#### 4.1 性能优化
- [ ] API响应时间优化
- [ ] 缓存策略实施
- [ ] 错误处理完善

#### 4.2 演示准备
- [ ] 演示数据准备
- [ ] UI/UX完善
- [ ] 演示脚本准备

## 🛠️ 立即开始的步骤

### 第一步: 开发环境配置 (今天就可以开始！)

1. **配置AWS凭证**
   ```bash
   # Windows PowerShell
   $env:AWS_ACCESS_KEY_ID="ASIAQRR5A2CQBNZQGMRY"
   $env:AWS_SECRET_ACCESS_KEY="Bif9K1g1KSB2UqaLODcgbZjTsnWkEwdd20t9iZXb"
   $env:AWS_SESSION_TOKEN="IQoJb3JpZ2luX2VjEGsaDmFwLXNvdXRoZWFzdC0x..."
   ```

2. **React Native环境配置**
   ```bash
   # 安装React Native CLI
   npm install -g @react-native-community/cli
   
   # 验证环境 (需要Node.js, Android Studio, Xcode)
   npx react-native doctor
   ```

2. **验证AWS访问**
   ```bash
   aws sts get-caller-identity --region ap-southeast-1
   ```

3. **创建项目结构**
   ```
   fake-food-review-detector/
   ├── backend/
   │   ├── lambda/
   │   ├── ecs-scraper/
   │   └── infrastructure/
   ├── mobile-app/
   │   ├── src/
   │   │   ├── components/
   │   │   ├── screens/
   │   │   ├── services/
   │   │   └── utils/
   │   ├── android/
   │   ├── ios/
   │   └── package.json
   └── docs/
   ```

### 第二步: 核心服务快速原型

1. **DynamoDB表创建**
2. **简单Lambda函数部署**
3. **基础API Gateway设置**
4. **React Native项目初始化**
   ```bash
   npx react-native init FakeFoodDetector
   cd FakeFoodDetector
   npm install @react-navigation/native @react-navigation/stack
   ```

## 📊 风险评估和缓解策略

### 高风险项
1. **Google Maps爬虫反爬机制** 
   - 缓解: 使用代理轮换、请求限流
2. **Bedrock API限制**
   - 缓解: 实施请求缓存、批量处理
3. **iOS快捷指令限制**
   - 缓解: 简化用户流程、Android备选方案
4. **React Native跨平台兼容性**
   - 缓解: 使用成熟的第三方库、平台特定代码

### 中等风险项
1. **AWS成本控制**
   - 缓解: 设置预算警告、优化资源使用
2. **API响应时间**
   - 缓解: 异步处理、结果缓存

## 🎯 MVP (最小可行产品) 定义

### 核心功能
- [ ] 接受Google Maps餐厅URL
- [ ] 爬取基础评论数据
- [ ] 提供AI分析结果
- [ ] 显示可信度评分
- [ ] 跨平台运行 (iOS + Android)

### 成功标准
- 分析准确率 > 70%
- 响应时间 < 30秒
- React Native应用稳定运行
- 演示流程顺畅
- 双平台兼容性良好

## 📅 时间线建议

- **第1-3天**: AWS后端核心开发
- **第4-7天**: React Native应用开发
- **第8-9天**: 集成测试和深度链接
- **第10天**: 双平台优化和演示准备

## 💡 立即行动建议

1. **今天**: 配置AWS环境，创建DynamoDB表
2. **明天**: 部署第一个Lambda函数，测试API Gateway
3. **后天**: 开始爬虫开发，集成Bedrock

---

## 📝 开发注意事项

- 使用ap-southeast-1区域进行所有AWS资源
- 保持代码模块化便于演示
- 文档化所有API接口
- 准备演示用的示例数据
- 定期备份和版本控制

**下一步行动**: 开始AWS环境配置和DynamoDB表设计！
