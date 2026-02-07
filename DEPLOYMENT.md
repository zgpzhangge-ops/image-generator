# 插画裂变生成器 - 云端部署指南

## 前置准备

### 1. 安装 Git
访问 https://git-scm.com/download/win 下载并安装

### 2. 注册账号
- GitHub: https://github.com
- Railway: https://railway.app
- Vercel: https://vercel.com

---

## 步骤 1：初始化 Git 并推送到 GitHub

### 1.1 创建 GitHub 仓库
1. 打开 https://github.com/new
2. Repository name: `illustration-generator`
3. Public → Create repository
4. **不要勾选** "Add a README file"
5. 点击 "Create repository"

### 1.2 初始化本地仓库
打开 PowerShell（管理员），运行：

```bash
cd c:\Users\Administrator\Desktop\插画裂变

# 初始化 Git
git init

# 配置用户信息（替换为你的信息）
git config user.name "你的名字"
git config user.email "你的邮箱@example.com"

# 添加所有文件
git add .

# 提交
git commit -m "feat: 初始版本 - Gemini 图生图"

# 关联远程仓库
git remote add origin https://github.com/你的用户名/illustration-generator.git

# 推送到 GitHub
git push -u origin main
```

---

## 步骤 2：部署后端到 Railway

### 2.1 创建 Railway 项目
1. 打开 https://railway.app
2. 用 GitHub 登录
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择 `illustration-generator` 仓库
6. Railway 会自动检测 Python 项目

### 2.2 配置环境变量
在 Railway 项目页面：
1. 点击 "Variables" 标签
2. 添加变量：
   ```
   API_BASE_URL=http://152.53.90.90:3000
   MODEL=「Rim」gemini-3-pro-image-preview
   ```

### 2.3 部署
1. 点击 "Deploy"
2. 等待 2-5 分钟
3. 部署完成后会显示 URL，例如：
   ```
   https://illustration-generator.up.railway.app
   ```

### 2.4 修改 app.py
部署成功后，需要修改 app.py 中的 API 地址为 Railway 的地址。

---

## 步骤 3：部署前端到 Vercel

### 3.1 安装 Vercel CLI
```bash
npm install -g vercel
```

### 3.2 登录 Vercel
```bash
vercel login
```

### 3.3 部署
```bash
cd c:\Users\Administrator\Desktop\插画裂变
vercel --prod
```

按照提示选择：
- Which scope? 选择你的账号
- Link to existing project? N
- Project Name? illustration-generator
- Directory? ./
- Override settings? N

### 3.4 获取链接
部署完成后会显示类似：
```
Production: https://illustration-generator.vercel.app
```

---

## 步骤 4：分享给其他人

访问 https://illustration-generator.vercel.app 即可使用！

---

## 使用说明

1. 打开网页
2. 点击右上角 "设置"
3. 输入 Silly Dream API Key
4. 保存
5. 上传参考图片
6. 输入提示词
7. 选择模型 "「Rim」gemini-3-pro-image-preview"
8. 点击 "开始生成"
9. 等待 2-5 分钟
10. 下载图片

---

## 费用说明

- Vercel 前端: 免费
- Railway 后端: $5/月（或用免费额度）

---

## 故障排除

### Q: Railway 部署失败
A: 检查 Railway 日志，确保所有依赖正确安装。

### Q: 前端显示 "网络错误"
A: 确保后端 API 地址正确，且 Railway 服务正常运行。

### Q: 图片生成失败
A: 检查 Silly Dream 账户是否有足够的余额和权限。
