import React, { useState, useCallback, useEffect } from 'react';
import { Eye, EyeOff, Key, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

/** API Key 管理器组件属性 */
interface ApiKeyManagerProps {
  /** 当前 API Key */
  apiKey: string;
  /** API Key 变更回调 */
  onApiKeyChange: (key: string) => void;
  /** API Key 验证状态 */
  apiKeyStatus: 'idle' | 'valid' | 'invalid' | 'empty';
  /** API Key 验证回调 */
  onValidate: () => boolean;
  /** 清除 API Key 回调 */
  onClear: () => void;
  /** 显示清除缓存按钮 */
  showClearCache?: boolean;
}

/**
 * @Component ApiKeyManager
 * @description API Key 管理组件，负责输入、加密显示、校验和持久化
 * @param {string} apiKey - 当前 API Key
 * @param {Function} onApiKeyChange - API Key 变更回调
 * @param {string} apiKeyStatus - API Key 验证状态
 * @param {Function} onValidate - API Key 校验函数
 * @param {Function} onClear - 清除 API Key 函数
 * @param {boolean} showClearCache - 是否显示清除缓存按钮
 */
export function ApiKeyManager({
  apiKey,
  onApiKeyChange,
  apiKeyStatus,
  onValidate,
  onClear,
  showClearCache = true,
}: ApiKeyManagerProps) {
  const [showKey, setShowKey] = useState(false);
  const [inputValue, setInputValue] = useState(apiKey);
  const [error, setError] = useState<string>('');

  /** 同步输入框值 */
  useEffect(() => {
    setInputValue(apiKey);
  }, [apiKey]);

  /**
   * 处理输入变化
   * @param {React.ChangeEvent<HTMLInputElement>} e - 输入事件
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      setError('');
      onApiKeyChange(value);
    },
    [onApiKeyChange]
  );

  /**
   * 验证 API Key
   */
  const handleValidate = useCallback(() => {
    setError('');
    if (!inputValue || inputValue.trim() === '') {
      setError('请输入 API Key');
      return false;
    }
    const isValid = onValidate();
    if (!isValid) {
      setError('API Key 格式无效，请检查后重新输入');
    }
    return isValid;
  }, [inputValue, onValidate]);

  /**
   * 失去焦点时验证
   */
  const handleBlur = useCallback(() => {
    if (inputValue && inputValue.trim() !== '') {
      handleValidate();
    }
  }, [inputValue, handleValidate]);

  /** 获取状态图标 */
  const getStatusIcon = () => {
    switch (apiKeyStatus) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Key className="h-4 w-4 text-muted-foreground" />;
    }
  };

  /** 获取状态提示 */
  const getStatusMessage = () => {
    switch (apiKeyStatus) {
      case 'valid':
        return 'API Key 已配置';
      case 'invalid':
        return 'API Key 格式无效';
      case 'empty':
        return '请输入 API Key';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="apiKey" className="text-sm font-medium">
          Silly Dream API Key
        </Label>
        <div className="relative">
          <Input
            id="apiKey"
            type={showKey ? 'text' : 'password'}
            placeholder="请输入 Silly Dream API Key"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {getStatusIcon()}
          <span
            className={
              apiKeyStatus === 'valid'
                ? 'text-green-600'
                : apiKeyStatus === 'invalid'
                  ? 'text-red-600'
                  : 'text-muted-foreground'
            }
          >
            {getStatusMessage()}
          </span>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 帮助信息 */}
      <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
        <p className="font-medium mb-1">如何获取 API Key？</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>访问 Silly Dream 官网 (wish.sillydream.top)</li>
          <li>登录后进入 API 管理页面</li>
          <li>复制您的 API Key 并粘贴到上方输入框</li>
        </ol>
      </div>

      {/* 清除缓存按钮 */}
      {showClearCache && apiKey && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          清除缓存
        </Button>
      )}
    </div>
  );
}

export default ApiKeyManager;
