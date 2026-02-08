import { useState, useCallback, useEffect } from 'react';
import {
  STORAGE_KEY_API_KEY,
  GenerateParams,
  ApiResponse,
  GenerateResponseData,
  GenerationStatus,
  ApiKeyStatus,
  HistoryItem,
  STORAGE_KEY_HISTORY,
  ModelInfo,
  ModelDetectionStatus,
} from '@/types';
import { useLocalStorageString } from './useLocalStorage';

interface ExtendedModelInfo extends ModelInfo {
  isFlash?: boolean;
  speed?: number;
}

export function useSillyDream() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/proxy';
  const SILLY_DREAM_API = import.meta.env.VITE_SILLY_DREAM_API || 'http://152.53.90.90:3000';

  console.log("[API Config] VITE_API_BASE_URL:", API_BASE_URL);
  console.log("[API Config] VITE_SILLY_DREAM_API:", SILLY_DREAM_API);
  console.log("Current API Key exists:", !!import.meta.env.VITE_API_KEY);
  console.log("Current API Key (first 10 chars):", import.meta.env.VITE_API_KEY ? import.meta.env.VITE_API_KEY.substring(0, 10) + '...' : 'NOT SET');

  const [apiKey, setApiKey] = useLocalStorageString(
    STORAGE_KEY_API_KEY,
    import.meta.env.VITE_API_KEY || ''
  );

  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>('idle');
  const [generationStatus, setGenerationStatus] =
    useState<GenerationStatus>('idle');

  const [generationError, setGenerationError] = useState<{
    title: string;
    detail: string;
    code?: number;
    modelUsed?: string;
    triedModels?: string[];
  } | null>(null);

  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [generatedFilename, setGeneratedFilename] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [availableModels, setAvailableModels] = useState<ExtendedModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [autoMode, setAutoMode] = useState<boolean>(true);
  const [modelDetectionStatus, setModelDetectionStatus] =
    useState<ModelDetectionStatus>('idle');
  const [currentModelUsed, setCurrentModelUsed] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  const updateDebug = (info: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo((prev) => `[${timestamp}] ${info}\n${prev}`.slice(0, 3000));
    console.log(`[Debug] ${info}`);
  };

  const fetchAvailableModels = useCallback(
    async (key: string): Promise<ExtendedModelInfo[]> => {
      if (!key || key.trim() === '') {
        return [];
      }

      setModelDetectionStatus('loading');
      updateDebug('正在获取图片模型列表...');
      console.log("🚀 Requesting with Key:", apiKey.trim().substring(0, 10) + "...");

      try {
        const response = await fetch(`${API_BASE_URL}/api/models`, {
          headers: {
            Authorization: `Bearer ${apiKey.trim()}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          updateDebug(`获取模型失败: ${response.status}`);
          setModelDetectionStatus('error');
          return [];
        }

        const data = await response.json();
        updateDebug(`发现 ${data.count || 0} 个图片模型`);

        const models: ExtendedModelInfo[] = (data.data || []).map(
          (m: ExtendedModelInfo) => ({
            ...m,
            type: 'image',
            status: 'available',
            supportsImageToImage: true,
          })
        );

        setAvailableModels(models);
        setModelDetectionStatus(models.length > 0 ? 'success' : 'error');

        if (models.length > 0) {
          updateDebug(`已选择最快模型: ${models[0].name}`);
        }

        return models;
      } catch (error) {
        updateDebug(`获取模型失败: ${String(error)}`);
        setModelDetectionStatus('error');
        return [];
      }
    },
    [API_BASE_URL, apiKey]
  );

  useEffect(() => {
    if (apiKey && apiKey.length >= 10) {
      fetchAvailableModels(apiKey);
    }
  }, [apiKey, fetchAvailableModels]);

  const validateApiKeyFormat = useCallback((): boolean => {
    if (!apiKey || apiKey.trim() === '') {
      setApiKeyStatus('empty');
      return false;
    }
    return true;
  }, [apiKey]);

  const clearApiKey = useCallback(() => {
    setApiKey('');
    setApiKeyStatus('idle');
    setAvailableModels([]);
    setSelectedModel('');
    setAutoMode(true);
    setCurrentModelUsed('');
    setGeneratedImage('');
    setGeneratedFilename('');
    setDebugInfo('');
  }, [setApiKey]);

  const fetchLatestImage = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/latest_image?t=${Date.now()}`, {
        cache: 'no-cache',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setGeneratedImage(url);
        updateDebug('已加载最新图片');
      }
    } catch (error) {
      updateDebug(`加载最新图片失败: ${String(error)}`);
    }
  }, [API_BASE_URL]);

  const generateImage = useCallback(
    async (params: GenerateParams): Promise<void> => {
      setGenerationStatus('generating');
      setGenerationError(null);
      setGeneratedImage('');

      const modelDisplay = autoMode ? '自动最快' : selectedModel;
      updateDebug(`开始生成，模式: ${modelDisplay}`);
      console.log("🚀 Requesting with Key:", apiKey.trim().substring(0, 10) + "...");

      if (!validateApiKeyFormat()) {
        setGenerationStatus('error');
        setGenerationError({
          title: 'API Key 未配置',
          detail: '请先在设置中输入 Silly Dream API Key',
        });
        return;
      }

      try {
        const requestBody = {
          api_key: apiKey,
          image: params.image,
          prompt: params.prompt,
          denoising: params.denoising,
          seed: params.seed,
          model: autoMode ? '' : selectedModel,
          auto: autoMode,
        };

        updateDebug(`发送请求到后端...`);

        const response = await fetch(`${API_BASE_URL}/api/gen_image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify(requestBody),
        });

        const result: ApiResponse<{image: string, filename: string}> =
          await response.json();

        updateDebug(`响应: ${result.code} - ${result.msg}`);

        if (!response.ok || result.code !== 200) {
          const triedList = result.tried_models || [];

          if (result.code === 503 && triedList.length > 1) {
            const lastModel = triedList[triedList.length - 1];
            setGenerationError({
              title: '已尝试所有模型',
              detail: `共尝试 ${triedList.length} 个模型，均返回 503 错误。\n\n已尝试的模型：\n${triedList.map((m: string) => `• ${m}`).join('\n')}`,
              code: 503,
              modelUsed: lastModel,
              triedModels: triedList,
            });
          } else {
            setGenerationError({
              title: result.msg || '生成失败',
              detail: result.detail || '未知错误',
              code: result.code,
            });
          }

          setGenerationStatus('error');
          return;
        }

        setGenerationStatus('success');
        setCurrentModelUsed(result.model_used || '');
        updateDebug(`✅ 生成成功，使用模型: ${result.model_used}`);

        if (result.data?.filename) {
          setGeneratedFilename(result.data.filename);
          await fetchLatestImage();
        } else if (result.data?.image) {
          setGeneratedImage(result.data.image);
        }

        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          sourceImage: params.image,
          resultImage: result.data?.image || '',
          prompt: params.prompt,
          denoising: params.denoising,
          seed: params.seed,
          createdAt: Date.now(),
        };
        setHistory((prev) => [newHistoryItem, ...prev].slice(0, 50));
      } catch (error) {
        setGenerationStatus('error');
        setGenerationError({
          title: '网络请求失败',
          detail:
            error instanceof Error
              ? error.message
              : '无法连接到后端服务',
        });
        updateDebug(`网络错误: ${String(error)}`);
      }
    },
    [apiKey, validateApiKeyFormat, autoMode, selectedModel, API_BASE_URL, fetchLatestImage]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const refreshModels = useCallback(async () => {
    if (apiKey) {
      await fetchAvailableModels(apiKey);
    }
  }, [apiKey, fetchAvailableModels]);

  const changeModel = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    setAutoMode(false);
    setGenerationError(null);
    updateDebug(`手动选择模型: ${modelId}`);
  }, []);

  const enableAutoMode = useCallback(() => {
    setAutoMode(true);
    setSelectedModel('');
    setGenerationError(null);
    updateDebug('切换到自动模式');
  }, []);

  return {
    apiKey,
    setApiKey,
    apiKeyStatus,
    validateApiKeyFormat,
    clearApiKey,

    generateImage,
    generationStatus,
    generationError,
    generatedImage,
    generatedFilename,
    isGenerating: generationStatus === 'generating',

    history,
    clearHistory,

    availableModels,
    selectedModel,
    autoMode,
    modelDetectionStatus,
    fetchAvailableModels,
    changeModel,
    enableAutoMode,
    refreshModels,
    currentModelUsed,
    fetchLatestImage,
    debugInfo,
  };
}
