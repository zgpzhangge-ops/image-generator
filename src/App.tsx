import { AlertCircle, Download, Sparkles, RotateCw, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Header } from '@/components/Header';
import { ImageGalleryUploader } from '@/components/ImageGalleryUploader';
import { ControlPanel } from '@/components/ControlPanel';
import { ModelSelector } from '@/components/ModelSelector';
import { Gallery, EmptyGallery } from '@/components/Gallery';
import { SettingsModal } from '@/components/SettingsModal';
import { GenerateButton } from '@/components/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState, useCallback, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
  modelUsed?: string;
}

interface HistoryItem {
  id: string;
  sourceImages: string[];
  resultImages: string[];
  prompt: string;
  denoising: number;
  seed?: number;
  createdAt: number;
}

function App() {
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('sillydream_api_key') || '';
    } catch {
      return '';
    }
  });

  const [apiKeyStatus, setApiKeyStatus] = useState<'idle' | 'valid' | 'invalid' | 'empty'>('idle');
  const [generationError, setGenerationError] = useState<{ title: string; detail: string; code?: number } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [autoMode, setAutoMode] = useState<boolean>(true);
  const [modelDetectionStatus, setModelDetectionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [currentModelUsed, setCurrentModelUsed] = useState<string>('');

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<ImageItem[]>([]);
  const [prompt, setPrompt] = useState('');
  const [denoising, setDenoising] = useState(0.8);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [promptWeight, setPromptWeight] = useState(1.0);
  const [generationCount, setGenerationCount] = useState<number>(1);
  const [generationResults, setGenerationResults] = useState<GenerationResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [is4KMode, setIs4KMode] = useState(true);

  const saveApiKey = useCallback((key: string) => {
    setApiKey(key);
    try {
      localStorage.setItem('sillydream_api_key', key);
    } catch (e) {
      console.warn('无法保存 API Key:', e);
    }
  }, []);

  const fetchAvailableModels = useCallback(async (key: string) => {
    if (!key || key.trim() === '') {
      setAvailableModels([]);
      return;
    }

    setModelDetectionStatus('loading');

    try {
      const response = await fetch(`${API_BASE_URL}/api/models?api_key=${encodeURIComponent(key)}`);

      if (!response.ok) {
        setModelDetectionStatus('error');
        return;
      }

      const data = await response.json();

      const models = (data.data || []).map((m: any) => ({
        ...m,
        type: 'image',
        status: 'available',
        supportsImageToImage: true,
      }));

      setAvailableModels(models);
      setModelDetectionStatus(models.length > 0 ? 'success' : 'error');
    } catch (error) {
      setModelDetectionStatus('error');
    }
  }, []);

  useEffect(() => {
    if (apiKey && apiKey.length >= 10) {
      fetchAvailableModels(apiKey);
    }
  }, [apiKey, fetchAvailableModels]);

  const clearApiKey = useCallback(() => {
    setApiKey('');
    try {
      localStorage.removeItem('sillydream_api_key');
    } catch (e) {}
    setApiKeyStatus('idle');
    setAvailableModels([]);
    setSelectedModel('');
    setAutoMode(true);
  }, []);

  const generateSingleImage = useCallback(async (index: number): Promise<GenerationResult> => {
    const resultItem: GenerationResult = {
      id: `result-${Date.now()}-${index}`,
      imageUrl: '',
      status: 'loading',
    };

    try {
      const base64Images = uploadedImages.map(img => img.dataUrl.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, ''));

      const requestBody = {
        api_key: apiKey,
        images: base64Images,
        prompt: prompt.trim(),
        denoising,
        seed,
        model: autoMode ? '' : selectedModel,
        auto: autoMode,
        is_4k: is4KMode,
        prompt_weight: promptWeight,
      };

      const response = await fetch(`${API_BASE_URL}/api/gen_image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || result.code !== 200) {
        resultItem.status = 'error';
        resultItem.error = result.msg || result.detail || '生成失败';
        return resultItem;
      }

      const imageFilename = result.data?.filename;
      let imageUrl = '';
      if (imageFilename) {
        imageUrl = `${API_BASE_URL}/api/image/${encodeURIComponent(imageFilename)}`;
      } else if (result.data?.image) {
        imageUrl = result.data.image;
      }

      resultItem.imageUrl = imageUrl;
      resultItem.filename = imageFilename;
      resultItem.status = 'success';
      resultItem.modelUsed = result.model_used;

      return resultItem;
    } catch (error) {
      resultItem.status = 'error';
      resultItem.error = error instanceof Error ? error.message : '网络请求失败';
      return resultItem;
    }
  }, [apiKey, uploadedImages, prompt, denoising, seed, autoMode, selectedModel, is4KMode, promptWeight]);

  const handleGenerate = useCallback(async () => {
    if (uploadedImages.length === 0 || !prompt.trim()) return;

    setIsGenerating(true);
    setGenerationError(null);

    if (!apiKey || apiKey.trim() === '') {
      setIsGenerating(false);
      setGenerationError({
        title: 'API Key 未配置',
        detail: '请先在设置中输入 Silly Dream API Key',
      });
      return;
    }

    const newResults: GenerationResult[] = Array.from({ length: generationCount }, (_, i) => ({
      id: `result-${Date.now()}-${i}`,
      imageUrl: '',
      status: 'pending' as const,
    }));

    setGenerationResults(newResults);

    try {
      const promises = Array.from({ length: generationCount }, (_, i) => generateSingleImage(i));
      const results = await Promise.all(promises);

      setGenerationResults(results);

      const successResults = results.filter(r => r.status === 'success');
      if (successResults.length > 0) {
        setCurrentModelUsed(successResults[0]?.modelUsed || '');

        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          sourceImages: uploadedImages.map(img => img.dataUrl),
          resultImages: successResults.map(r => r.imageUrl),
          prompt: prompt.trim(),
          denoising,
          seed,
          createdAt: Date.now(),
        };
        setHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
      }

      const failedCount = results.filter(r => r.status === 'error').length;
      if (failedCount === results.length) {
        setGenerationError({
          title: '所有请求都失败了',
          detail: `共 ${generationCount} 个请求，全部失败。请检查网络或 API Key。`,
        });
      }
    } catch (error) {
      setGenerationError({
        title: '生成失败',
        detail: error instanceof Error ? error.message : '未知错误',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey, uploadedImages, prompt, denoising, seed, generationCount, generateSingleImage]);

  const handleRetry = useCallback(async (index: number) => {
    const newResults = [...generationResults];
    newResults[index] = { ...newResults[index], status: 'loading', error: undefined };
    setGenerationResults(newResults);

    const result = await generateSingleImage(index);

    const finalResults = [...generationResults];
    finalResults[index] = result;
    setGenerationResults(finalResults);
  }, [generationResults, generateSingleImage]);

  const handleDownload = useCallback((result: GenerationResult) => {
    if (!result.imageUrl) return;
    const link = document.createElement('a');
    link.href = result.imageUrl;
    link.download = result.filename || `generated_${Date.now()}.png`;
    link.target = '_blank';
    link.click();
  }, []);

  const handleOpenNewTab = useCallback((result: GenerationResult) => {
    if (!result.imageUrl) return;
    window.open(result.imageUrl, '_blank');
  }, []);

  const handleClearResults = useCallback(() => {
    setGenerationResults([]);
    setGenerationError(null);
  }, []);

  const is503Error = generationError?.code === 503;
  const isNoModelsAvailable = availableModels.length === 0 && modelDetectionStatus === 'error';
  const successCount = generationResults.filter(r => r.status === 'success').length;

  return (
    <div className="min-h-screen gradient-bg">
      <Header onSettingsClick={() => setSettingsOpen(true)} hasApiKey={!!apiKey} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="text-lg">上传参考图</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageGalleryUploader
                    images={uploadedImages}
                    onImagesChange={setUploadedImages}
                    disabled={isGenerating}
                    maxImages={5}
                    maxSizeMB={10}
                  />
                </CardContent>
              </Card>

              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="text-lg">生成参数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <ModelSelector
                      availableModels={availableModels}
                      selectedModel={selectedModel}
                      autoMode={autoMode}
                      detectionStatus={modelDetectionStatus}
                      currentModelUsed={currentModelUsed}
                      onModelChange={(modelId) => {
                        setSelectedModel(modelId);
                        setAutoMode(false);
                      }}
                      onAutoModeChange={() => {
                        setAutoMode(true);
                        setSelectedModel('');
                      }}
                      onRefresh={() => fetchAvailableModels(apiKey)}
                      disabled={isGenerating}
                    />

                    <ControlPanel
                      prompt={prompt}
                      onPromptChange={setPrompt}
                      denoising={denoising}
                      onDenoisingChange={setDenoising}
                      seed={seed}
                      onSeedChange={setSeed}
                      promptWeight={promptWeight}
                      onPromptWeightChange={setPromptWeight}
                      disabled={isGenerating}
                    />

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">生成数量</Label>
                      <Select
                        value={generationCount.toString()}
                        onValueChange={(v) => setGenerationCount(parseInt(v))}
                        disabled={isGenerating}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 张</SelectItem>
                          <SelectItem value="2">2 张</SelectItem>
                          <SelectItem value="4">4 张</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                            <path d="M8.5 15h-2V9h2v6zm4 0h-2V9h2v6zm4 0h-2V9h2v6z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium">4K 高清模式</div>
                          <div className="text-xs text-muted-foreground">
                            {is4KMode ? '已启用 - 自动优化细节' : '已关闭'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIs4KMode(!is4KMode)}
                        disabled={isGenerating}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          is4KMode ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            is4KMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {isNoModelsAvailable && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>未检测到可用模型</AlertTitle>
                  <AlertDescription>
                    <p className="mt-1">无法从您的账户获取到任何可用的图生图模型。</p>
                    <p className="mt-2 text-sm">请检查 API Key 是否正确。</p>
                  </AlertDescription>
                </Alert>
              )}

              {generationError && (
                <Alert variant={is503Error ? 'default' : 'destructive'} className={is503Error ? 'border-amber-500 bg-amber-50 dark:bg-amber-950' : ''}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{generationError.title}</AlertTitle>
                  <AlertDescription>
                    <p className="mt-1 whitespace-pre-line">{generationError.detail}</p>
                  </AlertDescription>
                </Alert>
              )}

              <GenerateButton
                loading={isGenerating}
                disabled={uploadedImages.length === 0 || !prompt.trim() || !apiKey || isGenerating}
                hasApiKey={!!apiKey}
                onClick={handleGenerate}
                onSettingsClick={() => setSettingsOpen(true)}
              />
            </div>

            <div className="space-y-6">
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    生成结果
                    {successCount > 0 && (
                      <span className="text-xs font-normal text-muted-foreground ml-auto">
                        {successCount}/{generationCount} 成功
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generationResults.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" onClick={handleClearResults}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          清除结果
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {generationResults.map((result, index) => (
                          <div key={result.id} className="relative rounded-xl overflow-hidden bg-muted">
                            {result.status === 'pending' && (
                              <div className="aspect-square flex items-center justify-center">
                                <div className="text-center text-muted-foreground">
                                  <p className="text-sm">等待生成...</p>
                                </div>
                              </div>
                            )}

                            {result.status === 'loading' && (
                              <div className="aspect-square flex items-center justify-center">
                                <div className="text-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                  <p className="text-sm text-muted-foreground">生成中 {index + 1}/{generationCount}...</p>
                                </div>
                              </div>
                            )}

                            {result.status === 'error' && (
                              <div className="aspect-square flex items-center justify-center">
                                <div className="text-center p-4">
                                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                                  <p className="text-sm text-red-500 mb-2">生成失败</p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRetry(index)}
                                  >
                                    <RotateCw className="h-3 w-3 mr-2" />
                                    重试
                                  </Button>
                                </div>
                              </div>
                            )}

                            {result.status === 'success' && result.imageUrl && (
                              <>
                                <img
                                  src={result.imageUrl}
                                  alt={`生成结果 ${index + 1}`}
                                  className="w-full h-auto object-contain"
                                  style={{ display: 'block' }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDownload(result)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleOpenNewTab(result)}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>

                      {currentModelUsed && successCount > 0 && (
                        <p className="text-xs text-muted-foreground text-center">
                          使用模型: {currentModelUsed}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>上传参考图并设置参数后，将在这里显示生成结果</p>
                      <p className="text-sm mt-2">支持生成多张图片</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="card-premium">
                <CardContent className="pt-6">
                  {history.length > 0 ? (
                    <Gallery history={history} onClearHistory={() => setHistory([])} />
                  ) : (
                    <EmptyGallery />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        apiKey={apiKey}
        onApiKeyChange={saveApiKey}
        apiKeyStatus={apiKeyStatus}
        onValidateApiKey={() => apiKey.length >= 10}
        onClearApiKey={clearApiKey}
      />

      <footer className="border-t bg-card/50 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Powered by Gemini • 基于 Silly Dream API
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
