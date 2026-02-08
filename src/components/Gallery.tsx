import { useState } from 'react';
import { History, Trash2, Download, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE_URL = 'http://localhost:3000';

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

function getImageUrl(urlOrFilename: string): string {
  if (!urlOrFilename) return '';
  
  if (urlOrFilename.startsWith('http')) {
    const separator = urlOrFilename.includes('?') ? '&' : '?';
    return `${urlOrFilename}${separator}t=${Date.now()}`;
  }
  
  return `${API_BASE_URL}/api/image/${encodeURIComponent(urlOrFilename)}?t=${Date.now()}`;
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

  const truncatePrompt = (prompt: string, maxLength: number = 40): string => {
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

  const allResults: Array<{ item: HistoryItem; resultIdx: number; imageUrl: string }> = [];
  history.forEach((item, groupIndex) => {
    item.resultImages.forEach((resultImg, resultIdx) => {
      allResults.push({
        item,
        resultIdx,
        imageUrl: getImageUrl(resultImg),
      });
    });
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5" />
          生成历史
          <span className="text-sm font-normal text-muted-foreground">
            ({allResults.length} 张)
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

      <div className="grid grid-cols-2 gap-4">
        {allResults.map((entry, index) => (
          <div key={`${entry.item.id}-${entry.resultIdx}`} className="space-y-2">
            <div className="relative rounded-xl overflow-hidden bg-muted cursor-pointer group">
              <img
                src={entry.imageUrl}
                alt={`生成结果 ${index + 1}`}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  console.error('历史图片加载失败:', entry.imageUrl);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                onLoad={(e) => {
                  (e.target as HTMLImageElement).style.display = 'block';
                }}
                onClick={() => setSelectedImage(entry.imageUrl)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(entry.imageUrl, index);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenNewTab(entry.imageUrl);
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="px-1">
              <p className="text-xs text-muted-foreground line-clamp-2" title={entry.item.prompt}>
                {truncatePrompt(entry.item.prompt)}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatTime(entry.item.createdAt)}
                </span>
                <span className="text-xs text-muted-foreground">
                  D:{entry.item.denoising.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="预览"
            className="max-w-full max-h-[90vh] object-contain"
            onError={(e) => {
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
