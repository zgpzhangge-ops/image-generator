"""
完整 API 测试脚本
"""
import requests
import json
import sys

API_BASE_URL = "http://152.53.166.72:3000"
API_KEY = "sk-d5z3os7YZFWBEROlrQtXExTI2qjLZItRkTqdWTZMCPVpP5pP"

def test_api():
    """测试 API"""
    
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
    
    # 输出到文件
    with open("api_test_result.txt", "w", encoding="utf-8") as f:
        f.write("=" * 60 + "\n")
        f.write("API 详细测试\n")
        f.write("=" * 60 + "\n\n")
        
        f.write(f"URL: {url}\n\n")
        f.write(f"Headers: {json.dumps(headers, indent=2)}\n\n")
        f.write(f"Payload: {json.dumps(payload, indent=2)}\n\n")
        f.write("-" * 60 + "\n")
        f.write("发送请求中...\n")
        f.flush()
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=90)
            
            f.write(f"\n状态码: {response.status_code}\n")
            f.write(f"响应头: {json.dumps(dict(response.headers), indent=2)}\n\n")
            f.write(f"响应体:\n{response.text}\n")
            
            print(f"状态码: {response.status_code}")
            print(f"结果已保存到 api_test_result.txt")
            
        except Exception as e:
            f.write(f"\n错误: {e}\n")
            print(f"错误: {e}")
    
    print("\n测试完成！")
    print("请查看 api_test_result.txt 文件获取完整结果")

if __name__ == "__main__":
    test_api()
