import React, { useCallback, useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  imageDataUrl?: string;
  onImageChange: (imageDataUrl: string | null) => void;
  disabled?: boolean;
}

export function ImageUploader({
  imageDataUrl,
  onImageChange,
  disabled = false,
}: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(
    (file: File) => {
      setError(null);

      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('仅支持 PNG、JPG、WebP 格式');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('图片大小不能超过 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const mimeType = file.type.split('/')[1];
          const base64 = result.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
          const fullDataUrl = `data:image/${mimeType};base64,${base64}`;
          setFileName(file.name);
          onImageChange(fullDataUrl);
        }
      };
      reader.readAsDataURL(file);
    },
    [onImageChange]
  );

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [disabled, handleFileUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileUpload(e.target.files[0]);
      }
    },
    [handleFileUpload]
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setFileName('');
      setError(null);
      onImageChange(null);
    },
    [onImageChange]
  );

  if (imageDataUrl) {
    return (
      <div className="relative group">
        <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-muted">
          <img
            src={imageDataUrl}
            alt="底图预览"
            className="w-full h-64 object-contain bg-muted"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {fileName || '底图'}
          </div>
        </div>
      </div>
    );
  }

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
      onClick={() => document.getElementById('image-upload')?.click()}
    >
      <input
        id="image-upload"
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
            支持 PNG、JPG、WebP 格式，大小不超过 10MB
          </p>
        </div>
      </div>
    </div>
  );
}

export default ImageUploader;
