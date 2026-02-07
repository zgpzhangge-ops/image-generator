"""
测试脚本：生成图片并保存到文件
"""
import requests
import base64

API_KEY = "sk-d5z3os7YZFWBEROlrQtXExTI2qjLZItRkTqdWTZMCPVpP5pP"
MODEL = "「Rim」gemini-3-pro-image-preview"
URL = "http://152.53.90.90:3000/v1/chat/completions"

# 测试图片（极小的 PNG）
test_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

payload = {
    "model": MODEL,
    "messages": [{
        "role": "user",
        "content": [
            {"type": "text", "text": "将这张图片变成动漫风格"},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{test_image}"}}
        ]
    }]
}

headers = {"Authorization": f"Bearer {API_KEY}"}

print("发送请求...")
print(f"URL: {URL}")
print(f"模型: {MODEL}")

r = requests.post(URL, json=payload, headers=headers, timeout=180)

print(f"\n状态码: {r.status_code}")
print(f"Content-Type: {r.headers.get('Content-Type')}")
print(f"响应长度: {len(r.text)}")

if r.status_code == 200:
    content = r.text.strip()
    
    # 保存原始响应
    with open("raw_response.txt", "w", encoding="utf-8") as f:
        f.write(content)
    print(f"\n原始响应已保存到 raw_response.txt")
    
    # 检查是否是 Base64
    try:
        decoded = base64.b64decode(content)
        print(f"\n✅ 成功解码 Base64，长度: {len(decoded)} 字节")
        
        # 保存图片
        with open("generated_image.png", "wb") as f:
            f.write(decoded)
        print(f"✅ 图片已保存到 generated_image.png")
        
        # 检查文件头
        with open("generated_image.png", "rb") as f:
            header = f.read(16)
            print(f"文件头: {header.hex()}")
        
    except Exception as e:
        print(f"\n❌ Base64 解码失败: {e}")
        print(f"内容前100字符: {content[:100]}")
else:
    print(f"\n❌ 请求失败: {r.text[:500]}")
