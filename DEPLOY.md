# 🚀 图生图应用部署指南

本指南将帮助你将图生图应用免费部署到 Vercel（前端）和 Railway（后端）。

## 📋 部署架构

```
┌─────────────────────────────────────────────────────┐
│                    用户浏览器                         │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│  Vercel (免费托管)                                   │
│  前端页面: https://your-app.vercel.app              │
└─────────────────────┬───────────────────────────────┘
                      │ API 请求
                      ▼
┌─────────────────────────────────────────────────────┐
│  Railway (免费托管)                                  │
│  后端服务: https://your-backend.railway.app         │
│  ↓                                                   │
│  Silly Dream API (外部服务)                         │
└─────────────────────────────────────────────────────┘
```

## 🔧 第一步：部署后端（Railway）

### 1.1 注册 Railway 账号

1. 打开浏览器访问：https://railway.com
2. 点击「Sign Up」使用 GitHub 账号登录
3. 完成邮箱验证

### 1.2 创建后端项目

1. 点击 Railway 仪表板的「New Project」
2. 选择「Deploy from GitHub repo」
3. 选择你的 GitHub 仓库
4. Railway 会自动检测 Python 项目

### 1.3 配置环境变量

在 Railway 项目页面：

1. 点击「Variables」标签
2. 添加环境变量（如果需要）：
   - `API_KEY`: 你的 Silly Dream API Key
3. 点击「Add」保存

### 1.4 部署状态

1. 点击「Deployments」查看部署进度
2. 等待部署完成（通常 2-5 分钟）
3. 复制后端地址，例如：
   ```
   https://your-backend.railway.app
   ```

## 🎨 第二步：部署前端（Vercel）

### 2.1 注册 Vercel 账号

1. 打开浏览器访问：https://vercel.com
2. 点击「Sign Up」使用 GitHub 账号登录

### 2.2 创建前端项目

1. 点击 Vercel 仪表板的「Add New...」
2. 选择「Project」
3. 选择你的 GitHub 仓库
4. Vercel 会自动检测为 Vite 项目

### 2.3 配置环境变量

在 Vercel 配置页面：

1. 找到「Environment Variables」部分
2. 添加以下变量：
   ```
   名称: VITE_API_URL
   值: https://your-backend.railway.app  （替换为你的后端地址）
   环境: Production, Preview, Development (全部勾选)
   ```
3. 点击「Add」保存

### 2.4 部署

1. 点击「Deploy」
2. 等待构建完成（通常 1-2 分钟）
3. 部署成功后，你会看到访问地址，例如：
   ```
   https://your-app.vercel.app
   ```

## ✅ 验证部署

### 测试后端健康检查

访问以下地址确认后端正常运行：
```
https://your-backend.railway.app/api/health
```

应该返回 JSON 响应：
```json
{
  "status": "ok",
  "features": [...]
}
```

### 测试前端页面

1. 打开：https://your-app.vercel.app
2. 尝试上传图片并生成
3. 检查浏览器控制台是否有错误

## 🔧 常见问题

### 问题 1：前端显示「连接后端失败」

**原因**：VITE_API_URL 配置错误或后端未部署

**解决方法**：
1. 确认后端已部署并获取到地址
2. 在 Vercel 的 Environment Variables 中添加 VITE_API_URL
3. 重新部署前端

### 问题 2：CORS 错误

**原因**：后端 CORS 配置问题

**解决方法**：
后端已配置允许所有来源，无需额外操作。如果仍有问题，检查 Railway 的日志。

### 问题 3：生成图片失败

**可能原因**：
1. API Key 无效
2. Silly Dream 服务不可用
3. 超出配额

**解决方法**：
1. 检查 Railway 日志获取详细错误信息
2. 确认 API Key 正确
3. 稍后重试

## 📊 免费额度

| 服务 | 免费额度 | 超出后 |
|------|---------|--------|
| Railway | 500 小时/月 | $0.01/小时 |
| Vercel | 100GB 带宽/月 | $0.02/GB |
| GitHub | 无限制 | - |

**提示**：对于个人使用，免费额度通常足够。

## 🔄 更新部署

### 更新后端

1. 修改代码并推送到 GitHub
2. Railway 会自动重新部署

### 更新前端

1. 修改代码并推送到 GitHub
2. Vercel 会自动重新部署
3. 如果修改了环境变量，需要手动重新部署

## 🛠️ 本地开发

如果你想在本地修改后部署：

```bash
# 克隆仓库
git clone https://your-repo.git
cd your-repo

# 安装依赖
pip install -r requirements.txt

# 启动后端
python app.py

# 新终端：启动前端
npm install
npm run dev
```

## 📞 获取帮助

- **Railway 文档**：https://docs.railway.com
- **Vercel 文档**：https://vercel.com/docs
- **GitHub Issues**：在仓库中提交问题

---

## 🎯 快速检查清单

部署完成后，确认以下事项：

- [ ] 后端健康检查通过
- [ ] 前端页面正常打开
- [ ] 图片上传功能正常
- [ ] 图片生成功能正常
- [ ] 下载功能正常

---

**恭喜！你的图生图应用已成功部署到云端！** 🎉
