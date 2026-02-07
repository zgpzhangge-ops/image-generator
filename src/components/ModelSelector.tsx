import { useState } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Loader2, Zap, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ModelInfo, ModelDetectionStatus } from '@/types';

interface ExtendedModelInfo extends ModelInfo {
  isFlash?: boolean;
  speed?: number;
}

interface ModelSelectorProps {
  availableModels: ExtendedModelInfo[];
  selectedModel: string;
  autoMode: boolean;
  detectionStatus: ModelDetectionStatus;
  currentModelUsed?: string;
  onModelChange: (modelId: string) => void;
  onAutoModeChange: (enabled: boolean) => void;
  onRefresh: () => void;
  disabled?: boolean;
}

export function ModelSelector({
  availableModels,
  selectedModel,
  autoMode,
  detectionStatus,
  currentModelUsed,
  onModelChange,
  onAutoModeChange,
  onRefresh,
  disabled = false,
}: ModelSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (detectionStatus) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Settings2 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (detectionStatus) {
      case 'loading':
        return '正在获取模型...';
      case 'success':
        return availableModels.length > 0
          ? `${availableModels.length} 个模型`
          : '暂无可用模型';
      case 'error':
        return '获取失败';
      default:
        return '点击刷新获取模型';
    }
  };

  const isFlash = (modelId: string) => {
    return modelId.toLowerCase().includes('flash');
  };

  const handleValueChange = (value: string) => {
    if (value === '__auto__') {
      onAutoModeChange(true);
    } else {
      onModelChange(value);
      setIsExpanded(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="model-select" className="text-sm font-medium">
          生成模型
        </Label>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-xs text-muted-foreground">
            {getStatusText()}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Select
          value={autoMode ? '__auto__' : selectedModel}
          onValueChange={handleValueChange}
          open={isExpanded}
          onOpenChange={setIsExpanded}
          disabled={disabled || detectionStatus === 'loading'}
        >
          <SelectTrigger id="model-select" className="w-full">
            <SelectValue placeholder="选择模型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__auto__">
              <div className="flex items-center gap-2 py-1">
                <Zap className="h-4 w-4 text-yellow-500" />
                <div className="flex flex-col">
                  <span className="font-medium">自动选择</span>
                  <span className="text-xs text-muted-foreground">
                    智能匹配最快可用模型
                  </span>
                </div>
              </div>
            </SelectItem>

            {availableModels.length > 0 && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground border-t">
                已检测到的模型
              </div>
            )}

            {availableModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex items-center gap-2 py-1 w-full">
                  {isFlash(model.id) ? (
                    <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  ) : (
                    <div className="w-4" />
                  )}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="truncate font-medium">{model.id}</span>
                    {isFlash(model.id) && (
                      <span className="text-xs text-yellow-600">⚡ 高速模型</span>
                    )}
                  </div>
                  {isFlash(model.id) && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded flex-shrink-0">
                      快速
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}

            {availableModels.length === 0 && detectionStatus !== 'loading' && (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                <div className="text-center">
                  <p className="mb-2">暂未检测到模型</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={disabled}
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    刷新获取
                  </Button>
                </div>
              </div>
            )}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onRefresh}
            disabled={disabled || detectionStatus === 'loading'}
          >
            <RefreshCw className={`h-3 w-3 mr-2 ${detectionStatus === 'loading' ? 'animate-spin' : ''}`} />
            刷新模型
          </Button>
        </div>
      </div>

      <div className={`p-3 rounded-lg transition-colors ${
        autoMode
          ? 'bg-yellow-500/10 border border-yellow-500/20'
          : 'bg-muted/50 border border-transparent'
      }`}>
        <div className="flex items-center gap-2">
          {autoMode ? (
            <>
              <Zap className="h-4 w-4 text-yellow-500" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">自动模式</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    推荐
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  系统自动选择最快的可用模型
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAutoModeChange(false)}
                disabled={disabled || availableModels.length === 0}
                className="text-xs"
              >
                手动选择
              </Button>
            </>
          ) : (
            <>
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">手动选择</span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                    当前: {selectedModel}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {availableModels.length > 0
                    ? `已选择: ${selectedModel}`
                    : '请从下拉菜单中选择模型'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAutoModeChange(true)}
                disabled={disabled}
                className="text-xs"
              >
                切换自动
              </Button>
            </>
          )}
        </div>
      </div>

      {currentModelUsed && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>上次成功使用:</span>
          <span className="font-medium">{currentModelUsed}</span>
        </div>
      )}
    </div>
  );
}

export default ModelSelector;
