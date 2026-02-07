"""
添加调试信息的测试
"""
import requests
import base64

API_KEY = "sk-d5z3os7YZFWBEROlrQtXExTI2qjLZItRkTqdWTZMCPVpP5pP"
BACKEND_URL = "http://localhost:3000"

# 测试生成图片
print("=" * 60)
print("测试生成图片流程")
print("=" * 60)

payload = {
    "api_key": API_KEY,
    "image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "prompt": "test",
    "auto": True
}

r = requests.post(f"{BACKEND_URL}/api/gen_image", json=payload, timeout=300)

print(f"状态码: {r.status_code}")

if r.status_code == 200:
    data = r.json()
    print(f"响应代码: {data.get('code')}")
    print(f"响应消息: {data.get('msg')}")
    
    image = data.get('data', {}).get('image', '')
    
    if image:
        print(f"\n图片数据:")
        print(f"  长度: {len(image)} 字符")
        print(f"  前缀: {image[:50]}...")
        print(f"  是否以 data:image 开头: {image.startswith('data:image')}")
        
        # 验证 Base64
        try:
            if ',' in image:
                b64_part = image.split(',', 1)[1]
                decoded = base64.b64decode(b64_part)
                print(f"  Base64 解码成功: {len(decoded)} 字节")
                print(f"  ✅ 图片格式正确!")
        except Exception as e:
            print(f"  ❌ Base64 解码失败: {e}")
    else:
        print(f"  ❌ 没有收到图片数据")
        print(f"  完整响应: {str(data)[:500]}")
else:
    print(f"错误: {r.text[:500]}")
