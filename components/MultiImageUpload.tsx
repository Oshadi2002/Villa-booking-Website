'use client';

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, CheckCircle2, X, RefreshCw, Link as LinkIcon, 
  Image as ImageIcon, Star, Trash2, Plus, Sparkles
} from 'lucide-react';

interface MultiImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  hint?: string;
  coverImage?: string;
  onSetCover?: (url: string) => void;
}

export default function MultiImageUpload({
  images,
  onChange,
  label = 'Gallery Photos (Upload Multiple Photos from Device)',
  hint = 'Select or drop multiple JPG, PNG, WEBP files at once',
  coverImage,
  onSetCover
}: MultiImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read a file to base64 Data URL fallback
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFilesUpload = async (fileList: FileList | File[]) => {
    const validFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (f.type.startsWith('image/')) {
        validFiles.push(f);
      }
    }

    if (validFiles.length === 0) {
      setUploadError('Please select valid image files (JPG, PNG, WEBP).');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('files', file);
      });

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.urls) && data.urls.length > 0) {
        onChange([...images, ...data.urls]);
      } else {
        // Fallback to base64 Data URLs
        const dataUrls = await Promise.all(validFiles.map(f => readFileAsDataUrl(f)));
        onChange([...images, ...dataUrls]);
      }
    } catch {
      // Direct client fallback
      const dataUrls = await Promise.all(validFiles.map(f => readFileAsDataUrl(f)));
      onChange([...images, ...dataUrls]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    const urls = customUrl
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0 && (u.startsWith('http') || u.startsWith('/')));

    if (urls.length > 0) {
      onChange([...images, ...urls]);
      setCustomUrl('');
      setShowUrlInput(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const newImages = images.filter((_, idx) => idx !== indexToRemove);
    onChange(newImages);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-2">
      {/* Label and Actions */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
          {label} ({images.length} photos)
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer font-medium"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showUrlInput ? 'Hide URL input' : 'Paste Image URLs'}</span>
          </button>
          {images.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] text-red-600 hover:text-red-800 cursor-pointer font-medium ml-1"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Paste URL Collapsible Input */}
      {showUrlInput && (
        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 space-y-2">
          <textarea
            rows={2}
            placeholder="Paste image URLs (one per line):&#10;https://images.unsplash.com/photo-1...&#10;https://..."
            value={customUrl}
            onChange={e => setCustomUrl(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-200 rounded-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-xs cursor-pointer"
            >
              Add URLs to Gallery
            </button>
          </div>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
            : 'border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-slate-100/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={e => {
            if (e.target.files && e.target.files.length > 0) {
              handleFilesUpload(e.target.files);
            }
          }}
          className="hidden"
        />

        {isUploading ? (
          <div className="py-2 flex items-center gap-2 text-xs font-semibold text-blue-600">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Uploading & Processing Multiple Images...</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-700">
                Drag & Drop <span className="text-blue-600 underline">Multiple Photos</span> here, or Browse
              </p>
              <p className="text-[11px] text-slate-400">{hint}</p>
            </div>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-xs text-red-600 mt-1 font-medium">{uploadError}</p>
      )}

      {/* Uploaded Gallery Thumbnails Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-2">
          {images.map((url, idx) => {
            const isCover = coverImage ? coverImage === url : idx === 0;

            return (
              <div 
                key={idx} 
                className={`relative group rounded-xl overflow-hidden border bg-slate-100 aspect-square shadow-xs ${
                  isCover ? 'border-amber-500 ring-2 ring-amber-400/50' : 'border-slate-200'
                }`}
              >
                <img 
                  src={url} 
                  alt={`Photo ${idx + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                />

                {/* Number Badge */}
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] text-white font-mono font-medium">
                  #{idx + 1}
                </span>

                {/* Cover Badge */}
                {isCover && (
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-amber-500 text-[10px] text-black font-bold uppercase tracking-wider flex items-center gap-0.5 shadow-sm">
                    <Star className="w-2.5 h-2.5 fill-black" />
                    Cover
                  </span>
                )}

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                  {onSetCover && !isCover && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetCover(url);
                      }}
                      title="Set as Main Cover"
                      className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-bold cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 fill-black" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(idx);
                    }}
                    title="Remove photo"
                    className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
