# Nano Banana 图生图生成器

一个基于 React + Shadcn UI 构建的现代化图生图 Web 应用，通过调用 Silly Dream API 对接 Nano Banana 模型，支持用户自主输入 API Key，实现上传底图并根据提示词生成新图的功能。

## 功能特性

### 核心功能
- **图片上传**：支持点击上传或拖拽上传，实时预览底图
- **智能生成**：输入提示词调节重绘强度，一键生成新图
- **API Key 管理**：用户自主输入并持久化存储 API Key
- **历史记录**：瀑布流展示生成历史，支持查看和下载
- **错误提示**：详细的错误信息反馈，友好的引导提示

### 技术特性
- **前后端分离**：API Key 仅存储在前端本地，不暴露给第三方
- **响应式设计**：完美适配桌面端和移动端
- **现代化 UI**：基于 Shadcn UI + Tailwind CSS 的极简设计
- **持久化存储**：API Key 和历史记录自动保存到 localStorage
- **TypeScript 支持**：完整的类型定义，提升代码可维护性

## 技术栈

| 层级 | 技术选型 |
|------|---------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| UI 组件库 | Shadcn UI + Radix UI |
| 样式方案 | Tailwind CSS |
| 状态管理 | React Hooks |
| 图标库 | Lucide React |
| 后端服务 | Python Flask（已有） |

## 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn
- Python 3.8+（用于运行后端服务）

### 1. 安装依赖

```bash
# 进入项目目录
cd 插画裂变

# 安装前端依赖
npm install

# 安装后端依赖（如果尚未安装）
pip install flask requests flask-cors
```

### 2. 启动后端服务

```bash
# 终端 1：启动后端服务
python app.py

# 后端服务运行在 http://localhost:3000
```

### 3. 启动前端开发服务器

```bash
# 终端 2：启动前端
npm run dev

# 前端服务运行在 http://localhost:5173
```

### 4. 访问应用

打开浏览器访问 http://localhost:5173

## 使用指南

### 第一步：配置 API Key

1. 点击页面右上角的「设置」图标
2. 在弹窗中输入您的 Silly Dream API Key
3. 点击保存，Key 会自动保存在浏览器中

**如何获取 API Key？**
- 访问 Silly Dream 官网：https://wish.sillydream.top
- 登录后进入 API 管理页面
- 复制您的 API Key 并粘贴到输入框

### 第二步：上传底图

1. 点击或拖拽一张图片到上传区域
2. 支持 PNG、JPG 格式，建议 512x512 像素
3. 图片上传后会显示预览

### 第三步：设置参数

- **提示词**：描述您想要的图片内容，越详细效果越好
- **重绘强度**：0-1 之间，值越大变化越大
- **Seed 值**：可选，留空则随机生成

### 第四步：生成图片

1. 点击「开始生成」按钮
2. 等待 Nano Banana 模型创作
3. 生成完成后可下载图片或继续生成

## API 配置说明

本应用需要配置 Silly Dream API Key 才能正常使用。API Key 仅存储在您的浏览器本地，不会发送到任何第三方服务器。

### 重要提醒

- **本地部署**：API Key 存储在 localStorage 中，适合个人使用
- **公网部署**：如需公网访问，建议删除 localStorage 相关代码，改由服务端代理
- **清除缓存**：在设置页面可一键清除 API Key 和历史记录

### 后端接口

本应用使用已有的 Flask 后端服务，接口地址：`http://localhost:3000/api/gen_image`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| image | string | 是 | 图片 Base64 编码（无 data:image 前缀） |
| prompt | string | 是 | 生图提示词 |
| denoising | number | 否 | 重绘强度，默认 0.75 |

## 项目结构

```
插画裂变/
├── src/
│   ├── main.tsx           # 应用入口
│   ├── App.tsx            # 主应用组件
│   ├── index.css          # 全局样式
│   ├── components/        # React 组件
│   │   ├── Header.tsx            # 头部导航
│   │   ├── ImageUploader.tsx     # 图片上传
│   │   ├── ControlPanel.tsx      # 参数控制
│   │   ├── ApiKeyManager.tsx     # API Key 管理
│   │   ├── SettingsModal.tsx      # 设置弹窗
│   │   ├── Gallery.tsx           # 历史记录
│   │   └── LoadingSpinner.tsx    # 加载组件
│   ├── hooks/             # 自定义 Hook
│   │   ├── useLocalStorage.ts    # localStorage 封装
│   │   └── useSillyDream.ts      # 核心业务逻辑
│   ├── types/            # TypeScript 类型定义
│   │   └── index.ts
│   └── lib/              # 工具函数
│       └── utils.ts
├── index.html            # HTML 入口
├── package.json          # 项目配置
├── vite.config.ts        # Vite 配置
├── tailwind.config.js    # Tailwind 配置
└── app.py               # 后端服务（已有）
```

## 常见问题

### 1. 前端无法连接后端

**问题表现**：点击生成后无响应或显示网络错误

**解决方法**：
1. 确认后端服务已启动：`python app.py`
2. 检查后端端口是否为 3000
3. 关闭防火墙或添加端口例外

### 2. API Key 无效

**问题表现**：返回 401 错误码

**解决方法**：
1. 检查 API Key 是否正确复制（不要有空格）
2. 登录 Silly Dream 官网确认 Key 是否过期
3. 重新获取新的 API Key

### 3. 生成失败

**问题表现**：返回 422 或 500 错误码

**解决方法**：
1. 检查提示词是否为空
2. 确认重绘强度在 0-1 范围内
3. 检查账户余额和 API 调用限额

## 调试排查

如遇到问题，请按以下步骤排查：

1. **检查后端进程**
   ```bash
   netstat -ano | findstr :3000
   ```

2. **测试后端连通性**
   ```bash
   curl http://localhost:3000/api/gen_image -X POST -H "Content-Type: application/json" -d "{}"
   ```

3. **查看浏览器控制台**
   - 按 F12 打开开发者工具
   - 查看 Network 标签页中的请求响应
   - 查看 Console 标签页中的错误信息

## 后续优化方向

- [ ] 添加批量生成功能
- [ ] 支持更多图片尺寸选择
- [ ] 添加生成进度实时显示
- [ ] 支持图片对比功能
- [ ] 添加收藏夹功能
- [ ] 移动端优化

## 许可证

本项目仅供学习和个人使用。

## 致谢

- [Silly Dream](https://wish.sillydream.top) - 提供图生图 API
- [Shadcn UI](https://ui.shadcn.com) - 提供精美的 React 组件
- [Tailwind CSS](https://tailwindcss.com) - 提供高效的样式方案
