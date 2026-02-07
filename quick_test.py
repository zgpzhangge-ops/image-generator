"""
快速测试 - 检查 API 连通性
"""
import requests
import time

API_KEY = "sk-d5z3os7YZFWBEROlrQtXExTI2qjLZItRkTqdWTZMCPVpP5pP"

# 测试 1: 检查服务器是否可达
print("测试 1: 检查服务器连通性...")
try:
    r = requests.get("http://152.53.90.90:3000/", timeout=10)
    print(f"  ✅ 服务器可达，状态: {r.status_code}")
except Exception as e:
    print(f"  ❌ 服务器不可达: {e}")

# 测试 2: 检查 /v1/models
print("\n测试 2: 获取模型列表...")
try:
    r = requests.get("http://152.53.90.90:3000/v1/models", 
                     headers={"Authorization": f"Bearer {API_KEY}"}, timeout=10)
    print(f"  状态: {r.status_code}")
    print(f"  响应: {r.text[:200]}")
except Exception as e:
    print(f"  ❌ 错误: {e}")
