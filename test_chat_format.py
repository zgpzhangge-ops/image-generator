"""
直接测试 /v1/chat/completions 格式
"""
import requests
import json

API_KEY = "sk-d5z3os7YZFWBEROlrQtXExTI2qjLZItRkTqdWTZMCPVpP5pP"
BASE_URL = "http://152.53.90.90:3000"

# 测试图片（极小的 PNG）
test_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

print("=" * 60)
print("测试 /v1/chat/completions 格式")
print("=" * 60)

# 格式1：chat/completions + image_url
url1 = f"{BASE_URL}/v1/chat/completions"
payload1 = {
    "model": "「Rim」gemini-3-pro-image-preview",
    "messages": [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "将这张图片变成动漫风格"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/png;base64,{test_image}"
                    }
                }
            ]
        }
    ],
    "max_tokens": 1000
}

print(f"\n格式1: chat/completions + image_url")
print(f"URL: {url1}")
print(f"Payload keys: {list(payload1.keys())}")

try:
    r = requests.post(url1, json=payload1, headers={"Authorization": f"Bearer {API_KEY}"}, timeout=60)
    print(f"状态码: {r.status_code}")
    print(f"响应: {r.text[:500]}")
except Exception as e:
    print(f"错误: {e}")

# 格式2：chat/completions + 直接图片（无 text）
print("\n" + "-" * 60)
print("格式2: chat/completions + only image")

payload2 = {
    "model": "「Rim」gemini-3-pro-image-preview",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/png;base64,{test_image}"
                    }
                }
            ]
        }
    ]
}

try:
    r = requests.post(url1, json=payload2, headers={"Authorization": f"Bearer {API_KEY}"}, timeout=60)
    print(f"状态码: {r.status_code}")
    print(f"响应: {r.text[:500]}")
except Exception as e:
    print(f"错误: {e}")

# 格式3：images/generations
print("\n" + "=" * 60)
print("测试 /v1/images/generations 格式")
print("=" * 60)

url3 = f"{BASE_URL}/v1/images/generations"
payload3 = {
    "model": "「Rim」gemini-3-pro-image-preview",
    "prompt": "动漫风格图片",
    "image": f"data:image/png;base64,{test_image}",
    "n": 1,
    "size": "1024x1024"
}

print(f"\nURL: {url3}")
print(f"Payload keys: {list(payload3.keys())}")

try:
    r = requests.post(url3, json=payload3, headers={"Authorization": f"Bearer {API_KEY}"}, timeout=60)
    print(f"状态码: {r.status_code}")
    print(f"响应: {r.text[:500]}")
except Exception as e:
    print(f"错误: {e}")
