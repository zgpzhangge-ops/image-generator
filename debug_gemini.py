"""
API 详细调试脚本 - 测试 Gemini 多模态接口
"""
import requests
import json

API_BASE_URL = "http://152.53.166.72:3000"

def test_api(api_key, model, path):
    """测试 API 请求"""
    print("\n" + "=" * 60)
    print(f"测试模型: {model}")
    print(f"测试路径: {path}")
    print("=" * 60)
    
    url = f"{API_BASE_URL}{path.replace('{model}', model)}"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": "将这张图片变成动漫风格"},
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
    
    print(f"\nURL: {url}")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        print(f"\n状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        print(f"响应体: {response.text[:2000]}")
        
        return response
        
    except Exception as e:
        print(f"\n请求异常: {e}")
        return None

if __name__ == "__main__":
    print("=" * 60)
    print("Gemini 多模态 API 详细调试")
    print("=" * 60)
    
    api_key = input("请输入 API Key: ").strip()
    
    if not api_key:
        print("API Key 不能为空！")
        exit(1)
    
    # 测试模型
    models = [
        "「Rim」gemini-3-pro-image-preview-4K",
        "gemini-3-pro-image-preview",
    ]
    
    # 测试路径
    paths = [
        "/v1beta/models/{model}:generateContent",
        "/v1beta/models/{model}:predict",
        "/v1/images/generations",
    ]
    
    for model in models:
        for path in paths:
            result = test_api(api_key, model, path)
            if result and result.status_code == 200:
                print("\n" + "🎉" * 20)
                print("成功啦！")
                print("🎉" * 20)
                exit(0)
    
    print("\n" + "❌" * 20)
    print("所有测试都失败了")
    print("请把上面的响应体发给开发者分析")
    print("❌" * 20)
