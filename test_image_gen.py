"""
测试图片生成和保存
"""
import requests
import base64

API_KEY = "sk-d5z3os7YZFWBEROlrQtXExTI2qjLZItRkTqdWTZMCPVpP5pP"
MODEL = "「Rim」gemini-2.5-flash-image"
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
r = requests.post(URL, json=payload, headers=headers, timeout=300)

print(f"状态码: {r.status_code}")

if r.status_code == 200:
    data = r.json()
    content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
    
    # 提取 Base64
    if '![image](' in content:
        import re
        match = re.search(r'!\[.*?\]\((data:image/[^;]+;base64,([^)]+))\)', content)
        if match:
            base64_data = match.group(1)
            print(f"Base64 长度: {len(base64_data)}")
            
            # 解码测试
            decoded = base64.b64decode(base64_data)
            print(f"解码后大小: {len(decoded)} 字节")
            
            # 保存测试
            with open("test_output.png", "wb") as f:
                f.write(decoded)
            print("测试图片已保存到 test_output.png")
            print("✅ 图片格式正确！")
        else:
            print("无法提取 Base64 数据")
    else:
        print(f"响应内容: {content[:200]}")
else:
    print(f"错误: {r.text[:500]}")
