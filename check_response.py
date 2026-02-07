"""
测试脚本：检查 API 响应格式
"""
import requests

API_KEY = "sk-d5z3os7YZFWBEROlrQtXExTI2qjLZItRkTqdWTZMCPVpP5pP"
MODEL = "「Rim」gemini-3-pro-image-preview"
URL = "http://152.53.90.90:3000/v1/chat/completions"

test_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

payload = {
    "model": MODEL,
    "messages": [{
        "role": "user",
        "content": [
            {"type": "text", "text": "动漫风格"},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{test_image}"}}
        ]
    }]
}

headers = {"Authorization": f"Bearer {API_KEY}"}

print("发送请求...")

try:
    r = requests.post(URL, json=payload, headers=headers, timeout=180)
    
    print(f"\n状态码: {r.status_code}")
    print(f"Content-Type: {r.headers.get('Content-Type')}")
    print(f"响应长度: {len(r.text)}")
    
    print(f"\n响应前200字符:")
    print(r.text[:200])
    
    print(f"\n响应后200字符:")
    print(r.text[-200:])
    
    # 检查是否看起来像 Base64
    text = r.text.strip()
    is_b64 = all(c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=' for c in text)
    print(f"\n看起来像 Base64: {is_b64}")
    
    # 保存到文件
    with open("response_raw.txt", "w", encoding="utf-8") as f:
        f.write(r.text)
    print(f"\n响应已保存到 response_raw.txt")
    
except Exception as e:
    print(f"错误: {e}")
