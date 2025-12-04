import React, { useState } from 'react';

interface ImageUploadProps {
  onImageSelect: (base64Image: string, fileName: string) => void;
  uploadedImagePreview: string | null;
  label: string;
  onDelete?: () => void; // Optional prop to allow deleting the image
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, uploadedImagePreview, label, onDelete }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string, file.name);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid image file.');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Fix: Change DragEvent<HTMLDivElement> to DragEvent<HTMLLabelElement>
  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  // Fix: Change DragEvent<HTMLDivElement> to DragEvent<HTMLLabelElement>
  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  // Fix: Change DragEvent<HTMLDivElement> to DragEvent<HTMLLabelElement>
  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent label click from bubbling
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{label}</h3>
      <label
        htmlFor={`image-upload-${label.replace(/\s/g, '-')}`}
        className={`relative cursor-pointer block
          ${isDragOver ? 'border-blue-600 ring-4 ring-blue-200' : 'border-gray-300 hover:border-blue-400'}
          w-48 h-48 sm:w-64 sm:h-64 rounded-lg border-2 border-dashed transition-all duration-200 flex items-center justify-center text-gray-400 text-center p-4 bg-white`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploadedImagePreview ? (
          <>
            <img src={uploadedImagePreview} alt="Uploaded preview" className="object-cover w-full h-full rounded-md" />
            {onDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 z-10"
                aria-label="Delete image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </>
        ) : (
          <span className="text-xl">+ Click or Drag Image Here</span>
        )}
        <input
          id={`image-upload-${label.replace(/\s/g, '-')}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
      {uploadedImagePreview && (
        <p className="mt-2 text-sm text-gray-600">Image selected. Click/Drag to upload new or delete.</p>
      )}
    </div>
  );
};

export default ImageUpload;