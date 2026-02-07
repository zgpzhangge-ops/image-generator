# 插画裂变生成器 - 项目状态

## ✅ 已完成功能

### 1. 图生图核心功能
- ✅ 支持 Gemini 多模态 API
- ✅ 支持 Markdown 格式响应解析
- ✅ 自动保存生成的图片到本地
- ✅ 图片按时间戳 + 提示词命名

### 2. 前端界面
- ✅ 图片上传
- ✅ 提示词输入
- ✅ 模型选择
- ✅ 去噪强度调节
- ✅ 历史记录展示
- ✅ 调试信息面板

### 3. 后端服务
- ✅ API 代理
- ✅ 错误处理
- ✅ 自动重试机制

---

## 📁 项目文件结构

```
插画裂变/
├── app.py                    # 后端服务（Flask）
├── src/                      # 前端源码
│   ├── App.tsx              # 主应用
│   ├── hooks/
│   │   └── useSillyDream.ts # 核心业务逻辑
│   └── components/           # 组件
├── generated_images/         # 自动保存的图片目录
├── vercel.json              # Vercel 配置
├── DEPLOYMENT.md            # 云端部署指南
└── QUICK_START.md           # 快速启动指南
```

---

## 🔧 配置信息

### API 配置
- **API 服务器**: http://152.53.90.90:3000
- **默认模型**: 「Rim」gemini-3-pro-image-preview
- **图片保存目录**: generated_images/

### 启动命令
```bash
# 启动后端
python app.py

# 启动前端
npm run dev
```

---

## 🚀 本地使用方法

1. **启动后端** (终端1)
   ```bash
   cd c:\Users\Administrator\Desktop\插画裂变
   python app.py
   ```

2. **启动前端** (终端2)
   ```bash
   cd c:\Users\Administrator\Desktop\插画裂变
   npm run dev
   ```

3. **访问页面**
   - 本地: http://localhost:5173
   - 分享: 使用 ngrok (ngrok http 5173)

---

## 🔗 分享给其他人

### 方式1：ngrok 临时分享（免费，每8小时失效）
```bash
ngrok http 5173
```

### 方式2：云端部署（推荐，长期使用）
详见 DEPLOYMENT.md:
- 前端 → Vercel (免费)
- 后端 → Railway ($5/月)

---

## 📝 使用步骤

1. 打开 http://localhost:5173
2. 点击右上角「设置」
3. 输入 Silly Dream API Key
4. 上传参考图片
5. 输入提示词
6. 选择模型: 「Rim」gemini-3-pro-image-preview
7. 点击「开始生成」
8. 等待 2-5 分钟
9. 图片自动保存到 generated_images/

---

## 📊 生成的图片位置

自动保存到: `c:\Users\Administrator\Desktop\插画裂变\generated_images\`

文件名格式: `YYYYMMDD_HHMMSS_提示词.png`

---

## 🔧 故障排除

### Q: 显示"网络错误"
A: 确保后端服务正在运行 (python app.py)

### Q: 图片生成失败
A: 检查 Silly Dream 账户余额和权限

### Q: 想分享给别人用
A: 使用 ngrok 或云端部署

---

## 📅 更新日期
2026-02-07

---

## 🎯 下一步计划（可选）

- [ ] 云端部署（Vercel + Railway）
- [ ] 添加更多模型支持
- [ ] 图片批量处理功能
- [ ] API Key 管理优化
