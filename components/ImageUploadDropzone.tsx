'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, X, RefreshCw, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { compressImageFile } from '@/lib/imageCompressor';

interface ImageUploadDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

export default function ImageUploadDropzone({
  value,
  onChange,
  label = 'Upload Image (Drag & Drop or Select File)',
  hint = 'Supports JPG, PNG, WEBP from your computer or phone'
}: ImageUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      const compressedDataUrl = await compressImageFile(file, 1200, 0.75);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
      } else {
        onChange(compressedDataUrl);
      }
    } catch {
      try {
        const compressedDataUrl = await compressImageFile(file, 1200, 0.75);
        onChange(compressedDataUrl);
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            onChange(reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    } finally {
      setIsUploading(false);
    }
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
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer font-medium"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Use File Upload' : 'Paste Image URL instead'}</span>
        </button>
      </div>

      {showUrlInput ? (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={value}
            onChange={e => onChange(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono bg-white"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-2.5 py-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      ) : (
        <div>
          {value ? (
            /* Image Preview Card */
            <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2 flex items-center gap-3">
              <div className="w-20 h-16 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Image Loaded</span>
                </span>
                <p className="text-[11px] text-slate-400 font-mono truncate">{value}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 cursor-pointer"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Drag & Drop Zone */
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-slate-100/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={e => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {isUploading ? (
                <div className="py-2 flex items-center gap-2 text-xs font-semibold text-blue-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Uploading Image...</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      Drag & Drop photo here, or <span className="text-blue-600 underline">Browse Computer</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {uploadError && (
            <p className="text-xs text-red-600 mt-1 font-medium">{uploadError}</p>
          )}
        </div>
      )}
    </div>
  );
}
