"""
API 详细调试脚本 - 显示完整输出
"""
import requests
import json
import sys

API_BASE_URL = "http://152.53.166.72:3000"
API_KEY = "sk-d5z3os7YZFWBEROlrQtXExTI2qjLZItRkTqdWTZMCPVpP5pP"

def test_single_request():
    """测试单个请求"""
    
    model = "「Rim」gemini-3-pro-image-preview-4K"
    path = f"/v1beta/models/{model}:generateContent"
    url = f"{API_BASE_URL}{path}"
    
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
    
    print("=" * 60)
    print("API 详细测试")
    print("=" * 60)
    print(f"URL: {url}")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print("-" * 60)
    sys.stdout.flush()
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        
        print(f"\n状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        print(f"响应体:\n{response.text}")
        
    except Exception as e:
        print(f"\n错误: {e}")

if __name__ == "__main__":
    test_single_request()
