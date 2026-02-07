# 插画裂变生成器 - 快速启动指南

## 本地运行（临时分享）

### 1. 启动后端（保持此窗口运行）
```bash
python app.py
```
后端地址：http://localhost:3000

### 2. 暴露后端（让外网可以访问）

安装 ngrok：
```bash
npm install -g ngrok
```

启动隧道：
```bash
ngrok http 3000
```

会显示类似：
```
Forwarding https://abc123.ngrok.io -> http://localhost:3000
```

### 3. 访问地址

告诉其他人访问：
- **前端**：http://localhost:5173（你电脑上）
- **或使用 Vercel 部署的前端**

---

## Vercel 部署前端（免费）

### 1. 登录 Vercel
```bash
vercel login
```

### 2. 部署
```bash
vercel --prod
```

### 3. 分享链接
生成的链接就是前端地址

---

## 注意
- 使用 ngrok 时，免费版每次重启会更换地址
- 正式分享建议使用云端部署方案
