"""
测试后端图片 API
"""
import requests
import os

API_KEY = "sk-d5z3os7YZFWBEROlrQtXExTI2qjLZItRkTqdWTZMCPVpP5pP"
BACKEND_URL = "http://localhost:3000"
OUTPUT_DIR = "generated_images"

print("=" * 60)
print("测试后端图片 API")
print("=" * 60)

# 1. 检查生成的图片列表
print("\n[1] 获取图片列表...")
try:
    r = requests.get(f"{BACKEND_URL}/api/images", timeout=10)
    print(f"状态码: {r.status_code}")
    data = r.json()
    print(f"响应: {data}")
    
    if data.get('count', 0) > 0:
        images = data.get('images', [])
        latest_image = images[0] if images else None
        print(f"\n最新图片: {latest_image}")
    else:
        latest_image = None
        print("没有找到图片")
except Exception as e:
    print(f"错误: {e}")
    latest_image = None

# 2. 测试直接访问图片文件
print("\n[2] 测试访问图片文件...")
if latest_image:
    try:
        r = requests.get(f"{BACKEND_URL}/api/image/{latest_image}", timeout=10)
        print(f"状态码: {r.status_code}")
        print(f"Content-Type: {r.headers.get('Content-Type')}")
        print(f"内容长度: {len(r.content)} 字节")
        
        if r.status_code == 200:
            # 保存测试
            test_path = os.path.join(OUTPUT_DIR, "test_download.png")
            with open(test_path, "wb") as f:
                f.write(r.content)
            print(f"✅ 图片下载成功: {test_path}")
        else:
            print(f"❌ 访问失败: {r.text[:200]}")
    except Exception as e:
        print(f"错误: {e}")
else:
    print("没有最新图片可测试")

# 3. 检查文件是否存在
print("\n[3] 检查文件是否存在...")
if latest_image:
    filepath = os.path.join(OUTPUT_DIR, latest_image)
    exists = os.path.exists(filepath)
    print(f"文件路径: {filepath}")
    print(f"文件存在: {exists}")
    
    if exists:
        size = os.path.getsize(filepath)
        print(f"文件大小: {size / 1024 / 1024:.2f} MB")
else:
    print("没有图片文件")

# 4. 健康检查
print("\n[4] 健康检查...")
try:
    r = requests.get(f"{BACKEND_URL}/api/health", timeout=10)
    print(f"状态码: {r.status_code}")
    print(f"响应: {r.json()}")
except Exception as e:
    print(f"错误: {e}")
