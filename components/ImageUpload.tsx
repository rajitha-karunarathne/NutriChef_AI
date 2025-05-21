import React, { useRef, useCallback } from 'react';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  previewUrl: string | null;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, previewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
      <div 
        className="w-full h-64 border-2 border-dashed border-borderLight rounded-xl flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-primary transition-colors group"
        onClick={handleButtonClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg" />
        ) : (
          <div className="text-textSecondary group-hover:text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">Click or Drag & Drop to Upload Image</p>
            <p className="text-sm">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
      </div>
      {previewUrl && (
         <button
          onClick={handleButtonClick}
          className="w-full text-sm text-primary hover:text-primaryDarker py-2 px-4 rounded-lg border border-primary hover:bg-primary/10 transition-colors"
        >
          Change Image
        </button>
      )}
    </div>
  );
};