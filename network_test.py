"""
网络连通性测试
"""
import requests

API_KEY = "sk-d5z3os7YZFWBEROlrQtXExTI2qjLZItRkTqdWTZMCPVpP5pP"

print("测试 1: 检查服务器是否可达...")
try:
    r = requests.get("http://152.53.166.72:3000/v1/models", 
                      headers={"Authorization": f"Bearer {API_KEY}"}, 
                      timeout=10)
    print(f"✓ 服务器可达，状态码: {r.status_code}")
    print(f"响应: {r.text[:300]}")
except Exception as e:
    print(f"✗ 服务器不可达: {e}")

print("\n测试 2: 测试最简单的请求...")
try:
    r = requests.get("http://152.53.166.72:3000/", timeout=10)
    print(f"✓ 根路径可访问，状态码: {r.status_code}")
except Exception as e:
    print(f"✗ 根路径不可达: {e}")
