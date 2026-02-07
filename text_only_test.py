"""
测试纯文本请求（不使用图片）
"""
import requests
import threading
import time

API_KEY = "sk-d5z3os7YZFWBEROlrQtXExTI2qjLZItRkTqdWTZMCPVpP5pP"
MODEL = "「Rim」gemini-3-pro-image-preview"
URL = "http://152.53.90.90:3000/v1/chat/completions"

# 纯文本请求（不使用图片）
payload = {
    "model": MODEL,
    "messages": [{"role": "user", "content": "hello"}],
    "max_tokens": 10
}

headers = {"Authorization": f"Bearer {API_KEY}"}

def make_request():
    print("发送纯文本请求...")
    start = time.time()
    try:
        r = requests.post(URL, json=payload, headers=headers, timeout=30)
        elapsed = time.time() - start
        print(f"\n状态码: {r.status_code}")
        print(f"耗时: {elapsed:.1f}秒")
        print(f"响应: {r.text[:200]}")
    except Exception as e:
        elapsed = time.time() - start
        print(f"\n错误: {e}")
        print(f"耗时: {elapsed:.1f}秒")

# 30秒后自动停止
timer = threading.Timer(35.0, lambda: print("\n⏰ 请求超时（35秒）"))
timer.start()

make_request()
timer.cancel()
