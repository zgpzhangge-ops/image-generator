import { useState, useCallback } from 'react';
import { useApiKey } from './useApiKey';

const API_BASE = 'http://localhost:3000';

interface ImageItem {
  id: string;
  dataUrl: string;
  filename: string;
}

interface GenerationResult {
  id: string;
  imageUrl: string;
  filename?: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
}

export function useSillyDream() {
  const { apiKey } = useApiKey();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  const [generatedFilename, setGeneratedFilename] = useState('');
  const [currentModelUsed, setCurrentModelUsed] = useState('');
  const [generationError, setGenerationError] = useState<{
    title: string;
    detail: string;
    code?: number;
  } | null>(null);

  const generateImage = useCallback(
    async (
      imageDataUrl: string | null,
      prompt: string,
      denoising: number,
      seed?: number,
      selectedModel = '',
      autoMode = true,
      is4k = true
    ): Promise<GenerationResult | null> => {
      const result: GenerationResult = {
        id: Date.now().toString(),
        imageUrl: '',
        status: 'loading',
      };

      if (!imageDataUrl || !prompt) {
        result.status = 'error';
        result.error = '参数不完整';
        return result;
      }

      if (!apiKey) {
        result.status = 'error';
        result.error = 'API Key 未配置';
        return result;
      }

      setIsGenerating(true);
      setGenerationError(null);
      setGeneratedImage('');

      try {
        const base64Data = imageDataUrl.replace(
          /^data:image\/(png|jpeg|jpg);base64,/,
          ''
        );

        const requestBody = {
          api_key: apiKey,
          image: base64Data,
          prompt: prompt.trim(),
          denoising,
          seed,
          model: autoMode ? '' : selectedModel,
          auto: autoMode,
          is_4k: is4k,
        };

        const response = await fetch(`${API_BASE}/api/gen_image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok || data.code !== 200) {
          const triedList = data.tried_models || [];

          if (data.code === 503 && triedList.length > 1) {
            setGenerationError({
              title: '已尝试所有模型',
              detail: `共尝试 ${triedList.length} 个模型，均返回 503 错误。\n\n已尝试的模型：\n${triedList
                .map((m: string) => `• ${m}`)
                .join('\n')}`,
              code: 503,
            });
          } else {
            setGenerationError({
              title: data.msg || '生成失败',
              detail: data.detail || '未知错误',
              code: data.code,
            });
          }

          result.status = 'error';
          result.error = data.msg || data.detail;
          return result;
        }

        setCurrentModelUsed(data.model_used || '');

        const imageFilename = data.data?.filename;
        const imageUrl = imageFilename
          ? `${API_BASE}/api/image/${encodeURIComponent(imageFilename)}`
          : data.data?.image || '';

        setGeneratedFilename(imageFilename || '');
        setGeneratedImage(imageUrl);

        result.imageUrl = imageUrl;
        result.filename = imageFilename;
        result.status = 'success';

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '无法连接到后端服务';
        setGenerationError({
          title: '网络请求失败',
          detail: errorMessage,
        });

        result.status = 'error';
        result.error = errorMessage;
        return result;
      } finally {
        setIsGenerating(false);
      }
    },
    [apiKey]
  );

  const reset = useCallback(() => {
    setGeneratedImage('');
    setGeneratedFilename('');
    setGenerationError(null);
  }, []);

  return {
    apiKey,
    generateImage,
    reset,
    isGenerating,
    generatedImage,
    generatedFilename,
    currentModelUsed,
    generationError,
  };
}
