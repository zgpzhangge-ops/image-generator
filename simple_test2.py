"""
简单测试 - 检查 API 返回什么
"""
import requests
import json

API_KEY = "sk-d5z3os7YZFWBEROlrQtXExTI2qjLZItRkTqdWTZMCPVpP5pP"
MODEL = "「Rim」gemini-3-pro-image-preview"
URL = "http://152.53.90.90:3000/v1/chat/completions"

test_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

payload = {
    "model": MODEL,
    "messages": [{
        "role": "user",
        "content": [
            {"type": "text", "text": "test"},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{test_image}"}}
        ]
    }]
}

headers = {"Authorization": f"Bearer {API_KEY}"}

print("发送请求...")
r = requests.post(URL, json=payload, headers=headers, timeout=180)

print(f"\n状态码: {r.status_code}")
print(f"Content-Type: {r.headers.get('Content-Type')}")
print(f"响应长度: {len(r.text)}")

# 保存完整响应
with open("api_response.txt", "w", encoding="utf-8") as f:
    f.write(r.text)
print(f"\n响应已保存到 api_response.txt")

# 检查前100个字符
print(f"\n响应前100字符:")
print(r.text[:100])

# 检查是否是 HTML
if r.text.startswith("<"):
    print("\n⚠️ 返回的是 HTML，不是图片或 JSON！")
elif r.text.startswith("{"):
    print("\n✅ 返回的是 JSON")
    try:
        data = json.loads(r.text)
        print(f"JSON 键: {list(data.keys())}")
    except:
        pass
else:
    print("\n✅ 返回的可能是 Base64 图片数据")
    # 尝试解码
    import base64
    try:
        decoded = base64.b64decode(r.text)
        print(f"Base64 解码成功: {len(decoded)} 字节")
        with open("test_image.png", "wb") as f:
            f.write(decoded)
        print("图片已保存到 test_image.png")
    except Exception as e:
        print(f"Base64 解码失败: {e}")
