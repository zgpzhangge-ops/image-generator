"""
图生图后端服务 - 支持多图输入和批量生成
"""
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import re
import base64
import os
from datetime import datetime
from typing import List, Optional

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

API_BASE = "http://152.53.90.90:3000"
OUTPUT_DIR = "generated_images"

SYSTEM_INSTRUCTION = """你是一个擅长多图融合的 AI 专家。我已按顺序为你提供了多张标记为[参考图片 X]的图像。请仔细阅读我的用户指令，精准识别指令中提到的图片编号，并分析它们各自需要贡献的元素（如风格、构图、主体等），最后合成一张高质量图像。"""

QUALITY_SUFFIX = ", 4k resolution, UHD, highly detailed, photorealistic, 8k wallpaper, sharp focus, intricate textures, masterpiece, professional photography, cinema lighting, ultra HD, crystal clear"

QUALITY_PROMPTS = [
    "highly detailed",
    "4k resolution",
    "photorealistic",
    "sharp focus",
    "intricate textures",
    "professional photography",
    "cinematic lighting",
    "ultra HD",
    "crystal clear",
    "masterpiece"
]

def extract_base64_from_markdown(text):
    """从 Markdown 格式提取 Base64 图片数据"""
    pattern = r'!\[.*?\]\((data:image/[^;]+;base64,([^)]+))\)'
    match = re.search(pattern, text)
    if match:
        mime = match.group(1).split(';base64,')[0] + ';base64'
        data = match.group(2)
        return f"{mime},{data}"
    return None

def get_image_models(api_key: str) -> List[dict]:
    """获取所有包含 image 的模型"""
    try:
        r = requests.get(
            f"{API_BASE}/v1/models",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=10
        )
        
        if r.status_code != 200:
            return []
        
        data = r.json()
        models = []
        
        for m in data.get('data', []):
            model_id = m.get('id', '')
            if 'image' in model_id.lower():
                models.append({
                    'id': model_id,
                    'name': model_id,
                    'is_flash': 'flash' in model_id.lower(),
                    'speed': 0 if 'flash' in model_id.lower() else 1
                })
        
        models.sort(key=lambda x: (x['speed'], x['id']))
        return models
        
    except Exception as e:
        print(f"获取模型列表失败: {e}")
        return []

def save_image(base64_data: str, prompt: str, index: int = 0) -> Optional[str]:
    """保存图片到本地"""
    try:
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_prompt = "".join(c for c in prompt[:15] if c.isalnum() or c in ' -_').strip()
        safe_prompt = safe_prompt.replace(' ', '_')
        
        filename = f"{timestamp}_{safe_prompt}_{index + 1}.png"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        data = base64_data.split(',', 1)[1] if ',' in base64_data else base64_data
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(data))
        
        print(f"  💾 保存: {filepath}")
        return filepath
    except Exception as e:
        print(f"  ⚠️ 保存失败: {e}")
        return None

def get_latest_images(limit: int = 10):
    """获取最新生成的图片列表"""
    try:
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        files = [f for f in os.listdir(OUTPUT_DIR) if f.endswith('.png')]
        if not files:
            return []
        sorted_files = sorted(files, key=lambda x: os.path.getmtime(os.path.join(OUTPUT_DIR, x)), reverse=True)
        return sorted_files[:limit]
    except Exception as e:
        print(f"获取图片列表失败: {e}")
        return []

def build_contents_parts(images: List[str], user_prompt: str, denoising: float = 0.8, weight: float = 1.0) -> List[dict]:
    """
    构建 Gemini API 的 contents parts 数组
    
    优化结构：
    1. 先放所有图片（带索引标签）
    2. 最后放 Prompt（带强调权重）
    
    权重控制：通过重复文字来强调重要性
    """
    parts = []
    
    for i, img_data in enumerate(images):
        img_index = i + 1
        
        parts.append({
            "type": "text",
            "text": f"[参考图片{img_index}]"
        })
        
        parts.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/png;base64,{img_data}"}
        })
    
    ignore_instruction = "请忽略原图的部分细节，严格执行以下文字要求。"
    
    prompt_text = ignore_instruction + user_prompt
    
    if weight > 1.0:
        for _ in range(int(weight)):
            prompt_text += " " + user_prompt
    elif weight < 1.0:
        weight_text = ""
        if weight >= 0.5:
            weight_text = f"({user_prompt})"
        else:
            weight_text = user_prompt
        prompt_text = ignore_instruction + weight_text
    
    prompt_text += QUALITY_SUFFIX
    
    parts.append({
        "type": "text",
        "text": prompt_text
    })
    
    print(f"  [构建请求] 图片数: {len(images)}, Denoising: {denoising}, 权重: {weight}")
    
    return parts

def build_final_prompt(user_prompt: str) -> str:
    """
    构建最终的 prompt：系统引导词 + 用户指令 + 质量后缀
    """
    quality_suffix = QUALITY_SUFFIX
    return f"{SYSTEM_INSTRUCTION}\n\n用户指令: {user_prompt}{quality_suffix}"

def build_generation_config():
    """
    构建高质量生成配置
    """
    return {
        "temperature": 0.4,
        "top_k": 32,
        "top_p": 0.95,
        "max_output_tokens": 2048,
    }

@app.route('/api/models', methods=['GET'])
def list_models():
    """获取所有图片生成模型"""
    api_key = request.args.get('api_key', '')
    
    if not api_key:
        return jsonify({"code": 401, "msg": "API Key 未提供"}), 401
    
    models = get_image_models(api_key)
    
    return jsonify({
        "code": 200,
        "data": models,
        "count": len(models)
    })

@app.route('/api/images', methods=['GET'])
def list_images():
    """获取已生成的图片列表"""
    try:
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        files = sorted(os.listdir(OUTPUT_DIR), reverse=True)
        images = [f for f in files if f.endswith('.png')]
        return jsonify({
            "code": 200, 
            "images": images,
            "count": len(images)
        })
    except Exception as e:
        return jsonify({"code": 500, "msg": str(e)}), 500

@app.route('/api/latest_image')
def latest_image():
    """获取最新生成的图片"""
    try:
        files = get_latest_images(1)
        if files:
            filepath = os.path.join(OUTPUT_DIR, files[0])
            if os.path.exists(filepath):
                return send_file(filepath, mimetype='image/png')
        return jsonify({"error": "没有找到图片"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/image/<filename>')
def get_image(filename):
    """获取指定图片"""
    filepath = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(filepath):
        return send_file(filepath, mimetype='image/png')
    return jsonify({"error": "图片不存在"}), 404

@app.route('/api/gen_image', methods=['POST'])
def gen_image():
    data = request.get_json()
    api_key = data.get('api_key', '')
    images = data.get('images', [])
    prompt = data.get('prompt', '')
    selected_model = data.get('model', '')
    auto_mode = data.get('auto', True)
    is_4k = data.get('4k', True)
    denoising = data.get('denoising', 0.8)
    prompt_weight = data.get('prompt_weight', 1.0)
    
    if not api_key:
        return jsonify({"code": 401, "msg": "API Key 未配置"}), 401
    
    if not images or not prompt:
        return jsonify({"code": 400, "msg": "参数不完整"}), 400
    
    headers = {"Authorization": f"Bearer {api_key}"}
    
    models_to_try = []
    
    if auto_mode and not selected_model:
        all_models = get_image_models(api_key)
        models_to_try = [m['id'] for m in all_models]
    elif selected_model:
        models_to_try = [selected_model]
        if auto_mode:
            all_models = get_image_models(api_key)
            other_models = [m['id'] for m in all_models if m['id'] != selected_model]
            models_to_try.extend(other_models)
    
    if not models_to_try:
        return jsonify({
            "code": 404,
            "msg": "未找到可用的图片生成模型"
        }), 404
    
    tried_models = []
    last_error = None
    
    for model in models_to_try:
        tried_models.append(model)
        print(f"\n[尝试] {model} (已试: {len(tried_models)}/{len(models_to_try)})")
        print(f"  图片数量: {len(images)}")
        print(f"  4K模式: {'是' if is_4k else '否'}")
        print(f"  Denoising: {denoising}")
        print(f"  提示词权重: {prompt_weight}")
        print(f"  用户指令: {prompt[:50]}...")
        
        contents_parts = build_contents_parts(images, prompt, denoising, prompt_weight)
        generation_config = build_generation_config()
        
        payload = {
            "model": model,
            "messages": [{
                "role": "user",
                "content": contents_parts
            }],
            "generation_config": generation_config,
            "is_4k": is_4k
        }
        
        url = f"{API_BASE}/v1/chat/completions"
        
        try:
            r = requests.post(url, json=payload, headers=headers, timeout=600)
            
            if r.status_code == 200:
                try:
                    data_resp = r.json()
                    content = data_resp.get('choices', [{}])[0].get('message', {}).get('content', '')
                    
                    img_data = None
                    if '![image](' in content:
                        img_data = extract_base64_from_markdown(content)
                    elif 'data:image' in content:
                        parts = content.split('data:image')
                        if len(parts) > 1:
                            img_data = f"data:image{parts[1]}"
                    
                    if img_data:
                        saved_path = save_image(img_data, prompt)
                        filename = os.path.basename(saved_path) if saved_path else None
                        
                        return jsonify({
                            "code": 200,
                            "msg": f"生成成功 (使用 {model})",
                            "data": {
                                "image": img_data,
                                "filename": filename
                            },
                            "model_used": model,
                            "saved_to": saved_path,
                            "tried_models": tried_models,
                            "is_4k": is_4k
                        })
                        
                except Exception as e:
                    print(f"  解析失败: {e}")
            
            if r.status_code == 503:
                error_text = r.text
                if '无可用渠道' in error_text or 'no available' in error_text.lower():
                    print(f"  503 无渠道，自动切换下一个...")
                    continue
            
            if r.status_code in [400, 413]:
                print(f"  ⚠️ 分辨率不支持，尝试降级...")
                payload["is_4k"] = False
                payload["prompt"] = prompt
                
                r2 = requests.post(url, json=payload, headers=headers, timeout=600)
                
                if r2.status_code == 200:
                    try:
                        data_resp = r2.json()
                        content = data_resp.get('choices', [{}])[0].get('message', {}).get('content', '')
                        
                        img_data = None
                        if '![image](' in content:
                            img_data = extract_base64_from_markdown(content)
                        elif 'data:image' in content:
                            parts = content.split('data:image')
                            if len(parts) > 1:
                                img_data = f"data:image{parts[1]}"
                        
                        if img_data:
                            saved_path = save_image(img_data, prompt)
                            filename = os.path.basename(saved_path) if saved_path else None
                            
                            print(f"  ✅ 降级生成成功 (非4K)")
                            
                            return jsonify({
                                "code": 200,
                                "msg": f"生成成功 (已降级到高清模式)",
                                "data": {
                                    "image": img_data,
                                    "filename": filename
                                },
                                "model_used": model,
                                "saved_to": saved_path,
                                "tried_models": tried_models,
                                "is_4k": False,
                                "downgraded": True
                            })
                    except Exception as e:
                        print(f"  降级解析失败: {e}")
            
            last_error = r.text[:200]
            
        except Exception as e:
            last_error = str(e)
            continue
    
    tried_list = "\n".join(f"  - {m}" for m in tried_models)
    return jsonify({
        "code": 503,
        "msg": "所有模型都不可用",
        "detail": f"已尝试 {len(tried_models)} 个模型:\n{tried_list}",
        "tried_models": tried_models,
        "last_error": last_error
    }), 503

@app.route('/api/health', methods=['GET'])
def health():
    latest_files = get_latest_images(3)
    return jsonify({
        "status": "ok",
        "api": API_BASE,
        "output_dir": OUTPUT_DIR,
        "features": ["multi_image_input", "auto_model_switch", "image_save", "file_serving", "smart_image_indexing", "4k_quality", "quality_prompt_suffix"],
        "latest_images": latest_files
    })

if __name__ == '__main__':
    print("=" * 60)
    print("智能图生图服务 (支持 4K 高清)")
    print(f"API: {API_BASE}")
    print(f"保存目录: {OUTPUT_DIR}/")
    print("4K质量增强: ✅ 已启用")
    print("=" * 60)
    app.run(host='0.0.0.0', port=3000, debug=True)
