import React, { useEffect } from 'react';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose} // Close modal when clicking outside the image
    >
      <div
        className="relative max-w-full max-h-full bg-white rounded-lg overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside the image container
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors duration-200 z-10"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          src={imageUrl}
          alt="Full size generated"
          className="max-w-full max-h-screen object-contain" // object-contain ensures true ratio
        />
      </div>
    </div>
  );
};

export default ImageModal;