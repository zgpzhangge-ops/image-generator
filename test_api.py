"""API 路径测试工具"""
import requests

API_BASE_URL = "http://152.53.166.72:3000"
MODEL_NAME = "nano-banana"

API_PATHS = [
    "/v1/images/generations",
    "/v1/images/edits",
    "/v1/responses",
    f"/v1beta/models/{MODEL_NAME}:predict",
    f"/v1/images/{MODEL_NAME}",
    "/v1/images",
]

headers = {
    "Authorization": "Bearer test_api_key",
    "Content-Type": "application/json"
}

payload = {
    "prompt": "test image",
    "image": "data:image/png;base64,dGVzdA=="
}

print("=" * 60)
print("测试 Silly Dream API 路径")
print("=" * 60)

for path in API_PATHS:
    url = f"{API_BASE_URL}{path}"
    print(f"\n测试: {path}")
    print(f"URL: {url}")
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text[:200]}")
    except Exception as e:
        print(f"错误: {str(e)}")
    print("-" * 40)
