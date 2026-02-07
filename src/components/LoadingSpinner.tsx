import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** 加载状态组件属性 */
interface LoadingSpinnerProps {
  /** 是否显示 */
  show: boolean;
  /** 加载状态文本 */
  text?: string;
}

/**
 * @Component LoadingSpinner
 * @description 统一的加载状态组件
 * @param {boolean} show - 是否显示
 * @param {string} text - 加载提示文本
 */
export function LoadingSpinner({ show, text = '正在处理...' }: LoadingSpinnerProps) {
  if (!show) return null;

  return (
    <div className="flex items-center justify-center gap-2 text-primary">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

/**
 * 生成按钮组件属性
 */
interface GenerateButtonProps {
  /** 是否正在生成 */
  loading: boolean;
  /** 是否禁用 */
  disabled: boolean;
  /** API Key 是否已配置 */
  hasApiKey: boolean;
  /** 点击回调 */
  onClick: () => void;
  /** 设置点击回调 */
  onSettingsClick: () => void;
}

/**
 * @Component GenerateButton
 * @description 智能生成按钮，根据状态显示不同交互
 * @param {boolean} loading - 是否正在加载
 * @param {boolean} disabled - 是否禁用
 * @param {boolean} hasApiKey - API Key 是否已配置
 * @param {Function} onClick - 点击回调
 * @param {Function} onSettingsClick - 设置点击回调
 */
export function GenerateButton({
  loading,
  disabled,
  hasApiKey,
  onClick,
  onSettingsClick,
}: GenerateButtonProps) {
  /** 获取按钮内容 */
  const getButtonContent = (): React.ReactNode => {
    if (loading) {
      return (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Nano banana 正在发挥创意...
        </>
      );
    }

    if (!hasApiKey) {
      return (
        <>
          <Sparkles className="mr-2 h-5 w-5" />
          请先配置 API Key
        </>
      );
    }

    return (
      <>
        <Sparkles className="mr-2 h-5 w-5" />
        开始生成
      </>
    );
  };

  /**
   * 处理点击事件
   * 如果没有 API Key，跳转到设置
   */
  const handleClick = () => {
    if (!hasApiKey && !loading) {
      onSettingsClick();
    } else {
      onClick();
    }
  };

  return (
    <Button
      type="button"
      size="lg"
      className={cn(
        'w-full h-12 text-base font-semibold transition-all',
        !hasApiKey &&
          !loading &&
          'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
      )}
      disabled={disabled && hasApiKey}
      onClick={handleClick}
    >
      {getButtonContent()}
    </Button>
  );
}

/**
 * 进度条组件属性
 */
interface ProgressBarProps {
  /** 当前进度 (0-100) */
  value: number;
  /** 是否显示 */
  show: boolean;
}

/**
 * @Component ProgressBar
 * @description 简单的进度条组件
 * @param {number} value - 进度值 0-100
 * @param {boolean} show - 是否显示
 */
export function ProgressBar({ value, show }: ProgressBarProps) {
  if (!show) return null;

  return (
    <div className="w-full">
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1 text-center">
        已完成 {Math.round(value)}%
      </p>
    </div>
  );
}

export { LoadingSpinner as default };
