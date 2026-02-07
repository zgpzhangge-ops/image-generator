"""
测试后端模型获取接口
"""
import requests

API_KEY = "sk-d5z3os7YZFWBEROlrQtXExTI2qjLZItRkTqdWTZMCPVpP5pP"
BACKEND_URL = "http://localhost:3000"

print("=" * 60)
print("测试后端接口")
print("=" * 60)

# 测试 1: 健康检查
print("\n[测试1] 健康检查...")
try:
    r = requests.get(f"{BACKEND_URL}/api/health", timeout=10)
    print(f"状态: {r.status_code}")
    print(f"响应: {r.json()}")
except Exception as e:
    print(f"错误: {e}")

# 测试 2: 获取模型列表
print("\n[测试2] 获取模型列表...")
try:
    r = requests.get(f"{BACKEND_URL}/api/models?api_key={API_KEY}", timeout=30)
    print(f"状态: {r.status_code}")
    print(f"响应: {r.json()}")
except Exception as e:
    print(f"错误: {e}")

# 测试 3: 直接调用 Silly Dream API
print("\n[测试3] 直接调用 Silly Dream...")
try:
    r = requests.get("http://152.53.90.90:3000/v1/models",
                     headers={"Authorization": f"Bearer {API_KEY}"}, timeout=30)
    print(f"状态: {r.status_code}")
    data = r.json()
    print(f"模型数量: {len(data.get('data', []))}")
    
    # 筛选 image 模型
    image_models = [m for m in data.get('data', []) if 'image' in m.get('id', '').lower()]
    print(f"图片模型数量: {len(image_models)}")
    print(f"图片模型: {[m.get('id') for m in image_models[:5]]}")
    
except Exception as e:
    print(f"错误: {e}")
