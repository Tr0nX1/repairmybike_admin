"use client";

import React, { useCallback, useState } from "react";
import { Upload, X, ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value?: string;
  onChange: (file: File) => void;
  onClear: () => void;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  aspectRatio?: string;
  disabled?: boolean;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onClear,
  label,
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 5,
  aspectRatio = "1:1",
  disabled = false,
  className,
}) => {
  const [dragActive, setRefActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);

  const validateAndProcessFile = useCallback(
    (file: File) => {
      setError(null);

      // Validate Type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError("Only JPG, PNG and WebP are allowed");
        return;
      }

      // Validate Size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File is too large (max ${maxSizeMB}MB)`);
        return;
      }

      // Create local preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onChange(file);
    },
    [maxSizeMB, onChange]
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setRefActive(true);
    } else if (e.type === "dragleave") {
      setRefActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRefActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setError(null);
    onClear();
  };

  // Convert "16:9" to tailwind aspect class or style
  const getAspectRatioStyle = () => {
    const [w, h] = aspectRatio.split(":").map(Number);
    return { aspectRatio: `${w}/${h}` };
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
      )}

      <div
        className={cn(
          "relative group rounded-xl border-2 border-dashed transition-all overflow-hidden bg-slate-50/50",
          dragActive ? "border-[#378ADD] bg-blue-50/50" : "border-slate-200",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-slate-300",
          error ? "border-red-300 bg-red-50/10" : ""
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={getAspectRatioStyle()}
      >
        {preview ? (
          <div className="absolute inset-0 w-full h-full">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
              onLoad={() => {
                // If it was a local blob, we might want to revoke it eventually, 
                // but for React lifecycle we usually leave it until unmount or change.
              }}
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase"
                  onClick={() => document.getElementById("image-upload-input")?.click()}
                >
                  Change
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center"
            onClick={() => !disabled && document.getElementById("image-upload-input")?.click()}
          >
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <Upload className="h-5 w-5 text-slate-400 group-hover:text-[#378ADD]" />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
              Click or drag image
            </p>
            <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest">
              JPG, PNG, WebP (Max {maxSizeMB}MB)
            </p>
          </div>
        )}

        <input
          id="image-upload-input"
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
        />
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-red-600">
          <AlertCircle className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-tight">{error}</span>
        </div>
      )}
    </div>
  );
};
