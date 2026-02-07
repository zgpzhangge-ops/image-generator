"""
最快测试 - 10秒超时
"""
import requests

API_KEY = "sk-d5z3os7YZFWBEROlrQtXExTI2qjLZItRkTqdWTZMCPVpP5pP"
URL = "http://152.53.90.90:3000/v1/chat/completions"

print("测试 1: 检查服务器...")
try:
    r = requests.get("http://152.53.90.90:3000/", timeout=10)
    print(f"服务器状态: {r.status_code}")
except Exception as e:
    print(f"错误: {e}")

print("\n测试 2: 检查模型...")
try:
    r = requests.get("http://152.53.90.90:3000/v1/models",
                     headers={"Authorization": f"Bearer {API_KEY}"}, timeout=10)
    print(f"模型列表: {r.status_code}")
    print(f"内容: {r.text[:100]}")
except Exception as e:
    print(f"错误: {e}")

print("\n测试完成")
