"""
API 调试测试脚本 - 手动输入 Key
"""
import requests

API_BASE_URL = "http://152.53.166.72:3000"
MODEL_NAME = "nano-banana"

def test_models_endpoint(api_key):
    """测试 /v1/models 接口"""
    print("\n" + "=" * 60)
    print("测试 1: 获取模型列表 /v1/models")
    print("=" * 60)
    
    try:
        response = requests.get(
            f"{API_BASE_URL}/v1/models",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=10
        )
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text[:1000]}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("data"):
                print(f"\n✅ 发现 {len(data['data'])} 个模型:")
                for m in data["data"]:
                    print(f"  - {m.get('id', 'unknown')}")
            else:
                print("\n响应中没有 'data' 字段")
        else:
            print(f"❌ 错误响应")
    except Exception as e:
        print(f"❌ 请求失败: {e}")

def test_image_generation(api_key):
    """测试图片生成"""
    print("\n" + "=" * 60)
    print("测试 2: 图片生成测试")
    print("=" * 60)
    
    test_image = "data:image/png;base64,dGVzdA=="
    
    payload = {
        "api_key": api_key,
        "image": test_image,
        "prompt": "test",
        "model": MODEL_NAME
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/gen_image",
            json=payload,
            timeout=30
        )
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text[:1500]}")
    except Exception as e:
        print(f"❌ 请求失败: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("Silly Dream API 调试测试")
    print("=" * 60)
    print("\n请复制以下命令到终端运行（替换 YOUR_API_KEY 为你的真实 key）：\n")
    print(f'$env:API_KEY="YOUR_API_KEY"; python -c "import requests; r=requests.get(\'{API_BASE_URL}/v1/models\', headers={{\'Authorization\': \'Bearer $env:API_KEY\'}}); print(r.status_code); print(r.text[:500])"')
    print("\n" + "=" * 60)
