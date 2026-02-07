import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ControlPanelProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  denoising: number;
  onDenoisingChange: (value: number) => void;
  seed?: number;
  onSeedChange?: (seed: number | undefined) => void;
  promptWeight?: number;
  onPromptWeightChange?: (weight: number) => void;
  disabled?: boolean;
}

export function ControlPanel({
  prompt,
  onPromptChange,
  denoising,
  onDenoisingChange,
  seed,
  onSeedChange,
  promptWeight = 1.0,
  onPromptWeightChange,
  disabled = false,
}: ControlPanelProps) {
  const formatDenoising = (value: number): string => {
    return value.toFixed(2);
  };

  const handleSeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (onSeedChange) {
      if (value === '' || value === '-') {
        onSeedChange(undefined);
      } else {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 0) {
          onSeedChange(numValue);
        }
      }
    }
  };

  const handleRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 2147483647);
    if (onSeedChange) {
      onSeedChange(randomSeed);
    }
  };

  const getWeightLabel = (weight: number): string => {
    if (weight <= 0.5) return '弱';
    if (weight <= 1.0) return '正常';
    if (weight <= 1.5) return '较强';
    return '极强';
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-sm font-medium">
          生图提示词
          <span className="text-destructive ml-1">*</span>
        </Label>
        <Textarea
          id="prompt"
          placeholder="描述你想要的图片内容，例如：将这张图片转换为水彩画风格，添加梦幻的光效..."
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          disabled={disabled}
          className="min-h-[100px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          提示词越详细，生成效果越符合预期
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="denoising" className="text-sm font-medium">
            重绘强度 (Denoising)
          </Label>
          <span className="text-sm font-semibold text-primary min-w-[3rem] text-right">
            {formatDenoising(denoising)}
          </span>
        </div>
        <Slider
          id="denoising"
          value={[denoising]}
          onValueChange={(value) => onDenoisingChange(value[0])}
          min={0}
          max={1}
          step={0.05}
          disabled={disabled}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 - 保留原图</span>
          <span>1 - 完全重绘</span>
        </div>
      </div>

      {onPromptWeightChange && (
        <div className="space-y-3 p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <Label htmlFor="weight" className="text-sm font-medium">
              提示词权重
            </Label>
            <span className="text-sm font-semibold text-orange-600 min-w-[3rem] text-right">
              {promptWeight.toFixed(1)}x {getWeightLabel(promptWeight)}
            </span>
          </div>
          <Slider
            id="weight"
            value={[promptWeight]}
            onValueChange={(value) => onPromptWeightChange(value[0])}
            min={0.5}
            max={2.0}
            step={0.1}
            disabled={disabled}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.5x 较弱</span>
            <span>2.0x 极强</span>
          </div>
          <p className="text-xs text-muted-foreground">
            权重越高，模型越严格遵守你的提示词要求
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="seed" className="text-sm font-medium">
          Seed 值
          <span className="text-muted-foreground ml-1">(可选)</span>
        </Label>
        <div className="flex gap-2">
          <input
            type="number"
            id="seed"
            value={seed ?? ''}
            onChange={handleSeedChange}
            disabled={disabled}
            placeholder="留空则随机"
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          />
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={handleRandomSeed}
            disabled={disabled}
          >
            随机
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          相同的 Seed 值和参数可以复现相同的生成结果
        </p>
      </div>
    </div>
  );
}

export default ControlPanel;
