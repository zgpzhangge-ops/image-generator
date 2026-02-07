"""
检查模型列表，筛选可能支持图片生成的模型
"""

API_BASE_URL = "http://152.53.166.72:3000"

def check_models(api_key):
    """获取并筛选图片模型"""
    import requests
    
    response = requests.get(
        f"{API_BASE_URL}/v1/models",
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=10
    )
    
    if response.status_code != 200:
        print(f"错误: {response.status_code}")
        print(response.text[:500])
        return
    
    data = response.json()
    models = data.get("data", [])
    
    print(f"\n共 {len(models)} 个模型\n")
    
    # 图片生成模型关键词
    image_keywords = [
        'nano', 'banana', 'sd ', 'sd-', 'flux', 'image', 
        'vision', 'dalle', 'stable', 'midjourney', 'mj',
        '绘画', '图片', '图像', '生成', 'art', 'photo'
    ]
    
    # 文本模型关键词（排除）
    text_keywords = [
        'gemini', 'gpt', 'claude', 'llama', 'deepseek',
        'chat', 'text', 'completion', 'embedding'
    ]
    
    print("=" * 60)
    print("🔍 可能的图生图模型：")
    print("=" * 60)
    
    image_models = []
    text_models = []
    other_models = []
    
    for m in models:
        model_id = m.get('id', '').lower()
        
        is_image = any(kw in model_id for kw in image_keywords)
        is_text = any(kw in model_id for kw in text_keywords)
        
        if is_image and not is_text:
            image_models.append(m)
        elif is_text:
            text_models.append(m)
        else:
            other_models.append(m)
    
    if image_models:
        for m in image_models:
            print(f"  ✅ {m.get('id')}")
    else:
        print("  ❌ 未找到明确的图生图模型")
    
    print("\n" + "=" * 60)
    print("📝 文本模型数量：", len(text_models))
    print("❓ 其他模型数量：", len(other_models))
    print("=" * 60)
    
    if other_models:
        print("\n其他模型列表（前 20 个）：")
        for m in other_models[:20]:
            print(f"  - {m.get('id')}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        api_key = sys.argv[1]
    else:
        api_key = input("请输入 API Key: ").strip()
    
    check_models(api_key)
