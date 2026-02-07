import { useState } from 'react';
import { History, Trash2, Download, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface HistoryItem {
  id: string;
  sourceImages: string[];
  resultImages: string[];
  prompt: string;
  denoising: number;
  seed?: number;
  createdAt: number;
}

interface GalleryProps {
  history: HistoryItem[];
  onClearHistory: () => void;
}

function getImageUrl(filename: string): string {
  const timestamp = Date.now();
  return `${API_BASE_URL}/api/image/${encodeURIComponent(filename)}?t=${timestamp}`;
}

export function Gallery({ history, onClearHistory }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated_${index}_${Date.now()}.png`;
    link.target = '_blank';
    link.click();
  };

  const handleOpenNewTab = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  const truncatePrompt = (prompt: string, maxLength: number = 50): string => {
    if (prompt.length <= maxLength) return prompt;
    return prompt.substring(0, maxLength) + '...';
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <History className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground mb-1">暂无生成记录</h3>
        <p className="text-sm text-muted-foreground">
          开始生成图片后，这里将显示您的创作历史
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5" />
          生成历史
          <span className="text-sm font-normal text-muted-foreground">
            ({history.length})
          </span>
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearHistory}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          清除记录
        </Button>
      </div>

      <div className="masonry-grid">
        {history.map((item, index) => (
          <div key={item.id} className="masonry-item">
            <Card className="overflow-hidden group hover:shadow-lg transition-shadow card-hover">
              <div className="relative aspect-square bg-muted overflow-hidden">
                {item.resultImages && item.resultImages.length > 0 && (
                  <img
                    src={getImageUrl(item.resultImages[0].split('/').pop() || '')}
                    alt={`生成结果 ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                    onError={() => {
                      console.error('历史图片加载失败');
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownload(item.resultImages[0], index)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenNewTab(item.resultImages[0])}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-3">
                <p className="text-sm line-clamp-2" title={item.prompt}>
                  {truncatePrompt(item.prompt)}
                </p>
              </CardContent>

              <CardFooter className="p-3 pt-0 flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatTime(item.createdAt)}</span>
                <span>D: {item.denoising.toFixed(2)}</span>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={`${selectedImage}&t=${Date.now()}`}
            alt="预览"
            className="max-w-full max-h-[90vh] object-contain"
            onError={() => {
              console.error('预览图片加载失败:', selectedImage);
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </Button>
        </div>
      )}
    </div>
  );
}

export function EmptyGallery() {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 mb-4">
        <ImageIcon className="h-10 w-10 text-primary/60" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        还没有生成记录
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        上传一张图片，输入提示词，点击「开始生成」即可创建您的第一张作品
      </p>
    </div>
  );
}

export default Gallery;
