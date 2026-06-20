# 别白跑 — AI 线下办事教练

> TRAE AI 创造力大赛参赛项目 · 纯前端 Mock Demo
> 
> 🔗 **在线体验：https://lihao505.github.io/biebaipao**

帮助用户在出门办事前确认材料、排查缺失、查看流程，减少线下办事白跑率。

## 场景覆盖

| 🎓 学校盖章 | 🏥 医院复诊 | 🏦 银行业务 | 📱 手机卡补办 | 🏛️ 政务办理 | 🏠 租房相关 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 盖章/开证明 | 复诊/挂号 | 办卡/解冻 | 补办手机卡 | 办证/证件 | 签约/退租 |

## 项目目录结构

```
biebaipao/
├── index.html                  # HTML 入口
├── package.json                # 依赖与脚本
├── vite.config.ts              # Vite 配置（base: './' 支持 GitHub Pages）
├── tsconfig.json               # TypeScript 配置
├── tsconfig.node.json          # Node 环境 TS 配置
├── tailwind.config.js          # Tailwind CSS 配置
├── postcss.config.js           # PostCSS 配置
├── src/
│   ├── main.tsx                # 应用入口，挂载 Router + Context
│   ├── App.tsx                 # 路由定义（8 个页面）
│   ├── index.css               # Tailwind 指令 + 全局样式
│   ├── types/
│   │   └── index.ts            # 所有 TypeScript 类型定义
│   ├── data/
│   │   └── scenarios.ts        # 6 个场景的 Mock 数据
│   ├── context/
│   │   └── AppContext.tsx      # 全局状态管理（选中场景、材料勾选）
│   ├── utils/
│   │   └── riskCalculator.ts   # 白跑风险计算引擎
│   ├── components/
│   │   ├── Header.tsx          # 顶部导航栏（含返回按钮）
│   │   ├── Layout.tsx          # 页面布局容器
│   │   ├── ScenarioCard.tsx    # 场景选择卡片
│   │   ├── RiskBadge.tsx       # 风险等级标签
│   │   ├── MaterialItem.tsx    # 材料清单项（含勾选 + 补全入口）
│   │   ├── StepCard.tsx        # 流程步骤卡片
│   │   └── SummaryCard.tsx     # 结果总结卡（完整度 + 缺失项）
│   └── pages/
│       ├── HomePage.tsx        # 首页：标题 + 开始按钮
│       ├── ScenarioSelectPage.tsx  # 场景选择页：6 个场景
│       ├── BeginnerGuidePage.tsx   # 新手说明页：是什么/流程/出错点
│       ├── MaterialListPage.tsx    # 材料清单页：勾选 + 风险计算
│       ├── MaterialGuidePage.tsx   # 材料补全教程页：7 维度详解
│       ├── ProcessFlowPage.tsx     # 流程页：步骤卡片 + 话术
│       ├── OfficialInfoPage.tsx    # 官方信息页：链接 + 电话 + 12345
│       └── OnsiteAskPage.tsx       # 现场提问页：Mock 关键词匹配
```

## 每个文件作用说明

| 文件 | 作用 |
|------|------|
| `types/index.ts` | 定义 Scenario、Material、ProcessStep 等全部类型 |
| `data/scenarios.ts` | 6 个办事场景的完整 Mock 数据（材料、流程、话术等） |
| `context/AppContext.tsx` | React Context 管理选中场景 ID 和材料勾选状态 |
| `utils/riskCalculator.ts` | 根据勾选状态计算白跑风险（低/中/高）和完整度 |
| `components/*` | 7 个可复用 UI 组件 |
| `pages/*` | 8 个页面组件，对应 8 个路由 |

## 如何运行

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 打开浏览器访问
# http://localhost:5173
```

## 如何构建

```bash
# 类型检查 + 生产构建
npm run build

# 预览构建结果
npm run preview
```

构建产物输出到 `dist/` 目录。

## 如何部署到 GitHub Pages

```bash
# 1. 修改 vite.config.ts 中的 base 为你的仓库名
# base: '/your-repo-name/'

# 2. 构建
npm run build

# 3. 部署到 GitHub Pages（使用 gh-pages 工具）
npm install -D gh-pages
npx gh-pages -d dist

# 或者手动将 dist/ 目录内容推送到 gh-pages 分支
```

## 哪些部分是 Mock 数据

| 部分 | 说明 |
|------|------|
| 场景数据 | `src/data/scenarios.ts` 中 6 个场景的全部信息 |
| 官方链接 | 所有 URL 为示例地址（example.com） |
| 咨询电话 | 所有电话号码为 Mock 号码（0571-XXXX） |
| 现场提问 | 基于关键词匹配返回预设回答，非真实 AI |
| 材料补全教程 | 预设的补全步骤和官方提示 |

## 如何后续升级为真实数据系统

### 1. 接入真实政务 API
- 替换 `src/data/scenarios.ts` 为 API 调用
- 对接各地政务服务网 API（如浙里办、粤省事）
- 添加数据缓存和更新机制

### 2. RAG 知识库
- 将政务文档、办事指南构建为向量索引
- 用户提问时通过 RAG 检索相关文档
- 替换 `OnsiteAskPage` 中的关键词匹配为 LLM + RAG

### 3. OCR 材料识别
- 用户拍照上传已有材料
- OCR 识别材料类型，自动勾选
- 对比清单，智能推荐缺失项补全方案

### 4. 实时数据更新
- 接入官方数据源，定期同步办事要求变更
- 添加版本号和更新时间戳
- 用户反馈机制，社区共建材料清单

### 5. 后端架构升级路径
```
当前: 纯前端 Mock
  ↓
阶段1: + Serverless API (获取场景数据)
  ↓
阶段2: + RAG 知识库 (现场问答)
  ↓
阶段3: + OCR 服务 (材料识别)
  ↓
阶段4: + 用户系统 + 数据持久化
```

## 技术栈

- **React 18** — UI 框架
- **Vite 5** — 构建工具
- **TypeScript 5** — 类型安全
- **Tailwind CSS 3** — 样式系统
- **React Router 6** — 路由管理

## 交互流程

```
首页 → 选择场景 → 新手说明 → 材料清单（勾选 + 风险计算）
                                    ↓
                              补全教程（每个材料）
                                    ↓
                              办事流程（步骤卡片）
                                    ↓
                              官方信息（链接 + 电话）
                                    ↓
                              现场提问（Mock 问答）
```

## License

MIT
