import React, { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

interface UploadZoneProps {
  onFilesSelected: (files: File[] | File) => void;
  disabled: boolean;
  accept?: string;
  label?: string;
}

export function UploadZone({
  onFilesSelected,
  disabled,
  accept,
  label = "Klik atau seret file ke sini",
}: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        onFilesSelected(files);
        e.dataTransfer.clearData();
      }
    },
    [onFilesSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      dropZoneRef.current &&
      !dropZoneRef.current.contains(e.relatedTarget as Node)
    ) {
      setIsDragging(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div
      ref={dropZoneRef}
      onClick={() => fileInputRef.current?.click()}
      className="flex w-[90%] mx-auto cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-12 text-center transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800/50 relative md:w-[85%] lg:w-[90%]"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-lg pointer-events-none rounded-xl">
          <div className="rounded-lg border-2 border-dashed border-white p-16 text-center text-white">
            <h2 className="text-2xl font-bold">Lepaskan file untuk diunggah</h2>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
        multiple={accept ? accept.includes("json") : true}
      />
      <UploadCloud className="mb-4 h-16 w-16 text-slate-400" />
      <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
        Klik atau seret file ke sini
      </p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
