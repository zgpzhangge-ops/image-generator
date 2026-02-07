"""
简单超时测试
"""
import requests
import json

API_KEY = "sk-d5z3os7YZFWBEROlrQtXExTI2qjLZItRkTqdWTZMCPVpP5pP"

url = "http://152.53.166.72:3000/v1beta/models/%E3%80%8CRim%E3%80%8Dgemini-3-pro-image-preview-4K:generateContent"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

payload = {
    "contents": [{"parts": [{"text": "test"}]}]
}

print("发送请求...")

try:
    r = requests.post(url, json=payload, headers=headers, timeout=15)
    print(f"状态码: {r.status_code}")
    print(f"响应: {r.text[:500]}")
except Exception as e:
    print(f"错误: {e}")
