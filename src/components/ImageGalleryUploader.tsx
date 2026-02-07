import { useCallback, useState, useRef } from 'react';
import { X, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageItem {
  id: string;
  dataUrl: string;
  filename: string;
}

interface ImageGalleryUploaderProps {
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
  disabled?: boolean;
  maxImages?: number;
  maxSizeMB?: number;
}

export function ImageGalleryUploader({
  images,
  onImagesChange,
  disabled = false,
  maxImages = 5,
  maxSizeMB = 10,
}: ImageGalleryUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return '仅支持 PNG、JPG、WebP 格式';
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return `图片大小不能超过 ${maxSizeMB}MB`;
    }

    return null;
  }, [maxSizeMB]);

  const processFile = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setError(error);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        const mimeType = file.type.split('/')[1];
        const base64 = result.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
        const fullDataUrl = `data:image/${mimeType};base64,${base64}`;

        const newImage: ImageItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          dataUrl: fullDataUrl,
          filename: file.name,
        };

        if (images.length >= maxImages) {
          setError(`最多只能上传 ${maxImages} 张图片`);
          return;
        }

        onImagesChange([...images, newImage]);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  }, [images, maxImages, onImagesChange, validateFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
      e.target.value = '';
    }
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      processFile(file);
    }
  }, [disabled, processFile]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleRemove = useCallback((id: string) => {
    const newImages = images.filter(img => img.id !== id);
    onImagesChange(newImages);
    setError(null);
  }, [images, onImagesChange]);

  const handleClearAll = useCallback(() => {
    onImagesChange([]);
    setError(null);
  }, [onImagesChange]);

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  if (images.length === 0) {
    return (
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer',
          'hover:border-primary hover:bg-primary/5',
          isDragOver && 'border-primary bg-primary/10',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-full bg-primary/10">
            <ImageIcon className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">
              点击或拖拽图片到这里上传
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              支持 PNG、JPG、WebP 格式，最多 {maxImages} 张，单张不超过 {maxSizeMB}MB
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          已上传 {images.length} 张图片 ({maxImages} 张上限)
        </p>
        {images.length > 1 && (
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            清除全部
          </Button>
        )}
      </div>

      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer',
          'hover:border-primary hover:bg-primary/5',
          isDragOver && 'border-primary bg-primary/10',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Plus className="h-4 w-4" />
          <span className="text-sm">添加更多图片</span>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative group aspect-square rounded-lg overflow-hidden bg-muted"
          >
            <img
              src={image.dataUrl}
              alt={image.filename}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(image.id);
              }}
              disabled={disabled}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/80"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageGalleryUploader;
