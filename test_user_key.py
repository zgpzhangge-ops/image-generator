"""
API 详细调试脚本 - 使用用户提供的 Key
"""
import requests
import json

API_BASE_URL = "http://152.53.166.72:3000"
API_KEY = "sk-d5z3os7YZFWBEROlrQtXExTI2qjLZItRkTqdWTZMCPVpP5pP"

def test_api():
    """测试 API 请求"""
    
    # 测试模型
    models = [
        "「Rim」gemini-3-pro-image-preview-4K",
        "gemini-3-pro-image-preview",
    ]
    
    # 测试路径
    paths = [
        "/v1beta/models/{model}:generateContent",
        "/v1beta/models/{model}:predict",
    ]
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": "test"},
                    {
                        "inline_data": {
                            "mime_type": "image/png",
                            "data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                        }
                    }
                ]
            }
        ],
        "generation_config": {
            "response_modalities": ["IMAGE"]
        }
    }
    
    for model in models:
        for path_template in paths:
            path = path_template.replace("{model}", model)
            url = f"{API_BASE_URL}{path}"
            
            print("\n" + "=" * 60)
            print(f"模型: {model}")
            print(f"路径: {path}")
            print("=" * 60)
            
            try:
                response = requests.post(url, json=payload, headers=headers, timeout=30)
                
                print(f"\n状态码: {response.status_code}")
                print(f"响应: {response.text[:1500]}")
                
                if response.status_code == 200:
                    print("\n" + "🎉" * 20)
                    print("成功啦！")
                    print("🎉" * 20)
                    return
                    
            except Exception as e:
                print(f"\n错误: {e}")
    
    print("\n" + "❌" * 20)
    print("所有测试都失败了")
    print("请把上面的结果发给开发者分析")
    print("❌" * 20)

if __name__ == "__main__":
    print("=" * 60)
    print("Gemini API 详细调试")
    print("=" * 60)
    test_api()
