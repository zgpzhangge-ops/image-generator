import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import { ApiKeyManager } from './ApiKeyManager';

/** 设置弹窗组件属性 */
interface SettingsModalProps {
  /** 弹窗是否打开 */
  open: boolean;
  /** 弹窗关闭回调 */
  onOpenChange: (open: boolean) => void;
  /** API Key */
  apiKey: string;
  /** API Key 变更回调 */
  onApiKeyChange: (key: string) => void;
  /** API Key 验证状态 */
  apiKeyStatus: 'idle' | 'valid' | 'invalid' | 'empty';
  /** API Key 校验回调 */
  onValidateApiKey: () => boolean;
  /** 清除 API Key 回调 */
  onClearApiKey: () => void;
}

/**
 * @Component SettingsModal
 * @description 设置弹窗，整合 ApiKeyManager 组件
 * @param {boolean} open - 弹窗是否打开
 * @param {Function} onOpenChange - 弹窗状态变更回调
 * @param {string} apiKey - 当前 API Key
 * @param {Function} onApiKeyChange - API Key 变更回调
 * @param {string} apiKeyStatus - API Key 验证状态
 * @param {Function} onValidateApiKey - API Key 校验函数
 * @param {Function} onClearApiKey - 清除 API Key 函数
 */
export function SettingsModal({
  open,
  onOpenChange,
  apiKey,
  onApiKeyChange,
  apiKeyStatus,
  onValidateApiKey,
  onClearApiKey,
}: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            应用设置
          </DialogTitle>
          <DialogDescription>
            管理您的 API Key 和应用偏好设置
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ApiKeyManager
            apiKey={apiKey}
            onApiKeyChange={onApiKeyChange}
            apiKeyStatus={apiKeyStatus}
            onValidate={onValidateApiKey}
            onClear={onClearApiKey}
            showClearCache={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 设置图标按钮组件
 * @param {Function} onClick - 点击回调
 * @param {boolean} hasAlert - 是否显示未配置提醒
 */
interface SettingsButtonProps {
  onClick: () => void;
  hasAlert?: boolean;
}

/**
 * @Component SettingsButton
 * @description 设置图标按钮，可显示未配置提醒
 * @param {Function} onClick - 点击回调
 * @param {boolean} hasAlert - 是否显示红色提醒点
 */
export function SettingsButton({ onClick, hasAlert = false }: SettingsButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative p-2 rounded-lg hover:bg-accent transition-colors"
      aria-label="打开设置"
    >
      <Settings className="h-5 w-5 text-foreground" />
      {hasAlert && (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full" />
      )}
    </button>
  );
}

export default SettingsModal;
