import { Sparkles } from 'lucide-react';
import { SettingsButton } from './SettingsModal';

/** 头部组件属性 */
interface HeaderProps {
  /** 设置按钮点击回调 */
  onSettingsClick: () => void;
  /** API Key 是否已配置 */
  hasApiKey?: boolean;
}

/**
 * @Component Header
 * @description 应用头部栏，包含 Logo 和设置按钮
 * @param {Function} onSettingsClick - 设置按钮点击回调
 * @param {boolean} hasApiKey - API Key 是否已配置
 */
export function Header({ onSettingsClick, hasApiKey = true }: HeaderProps) {
  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo 和标题 */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Nano Banana
              </h1>
              <p className="text-xs text-muted-foreground">
                图生图生成器
              </p>
            </div>
          </div>

          {/* 设置按钮 */}
          <SettingsButton
            onClick={onSettingsClick}
            hasAlert={!hasApiKey}
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
