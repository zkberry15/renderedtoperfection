import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GeneratedImage } from '../types';

interface GeneratedImageCardProps {
  image: GeneratedImage;
  onSave: (url: string) => void;
  onCopy: (url: string) => void;
  onShare: (url: string, filename: string) => Promise<void>; // New prop for sharing
  onEdit: (image: GeneratedImage) => void;
  onImageClick: (url: string) => void;
}

const LONG_PRESS_THRESHOLD = 500; // milliseconds

const GeneratedImageCard: React.FC<GeneratedImageCardProps> = ({ image, onSave, onCopy, onShare, onEdit, onImageClick }) => {
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<number | null>(null);
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const resetLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only start timer if it's not already active and there's a URL
    if (image.url && !longPressTimer.current) {
      longPressTimer.current = window.setTimeout(() => {
        setShowOptions(true);
        // Prevent default click/tap after long press
        e.preventDefault();
      }, LONG_PRESS_THRESHOLD);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // If movement detected, cancel long press
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleImageInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    // If it's a touch event and a long press occurred, the options are already shown
    // and we want to prevent the modal from opening immediately.
    if (isTouchDevice && (e as React.TouchEvent).touches && longPressTimer.current === null && showOptions) {
      e.preventDefault(); // Prevent modal from opening
      return;
    }
    // For regular clicks/taps, open the modal
    if (image.url) {
      onImageClick(image.url);
    }
  };


  const handleToggleOptions = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event from bubbling
    setShowOptions(prev => !prev);
  };

  const handleOptionClick = (action: () => void) => {
    action();
    setShowOptions(false);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside); // For touch devices
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const renderContent = () => {
    if (image.isLoading) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-200">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      );
    }

    if (image.error) {
      return (
        <div className="flex items-center justify-center h-full bg-red-100 text-red-700 p-4 text-center">
          <p className="text-sm font-medium">Error: {image.error}</p>
        </div>
      );
    }

    if (image.url) {
      // Use the image itself as the clickable area for modal,
      // and attach touch event listeners for long-press on mobile.
      return (
        <img
          src={image.url}
          alt="Generated"
          className="w-full h-full object-cover cursor-pointer"
          onClick={handleImageInteraction}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
        />
      );
    }

    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
        No Image
      </div>
    );
  };

  return (
    <div
      className="relative w-full h-64 sm:h-80 bg-white rounded-lg shadow-md overflow-hidden flex items-center justify-center group border border-gray-200"
    >
      {renderContent()}

      {image.url && (
        // Options button for desktop hover, or if options are shown (e.g., from long-press)
        <div
          className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300
            ${isTouchDevice ? (showOptions ? 'opacity-100' : 'opacity-0') : 'opacity-0 group-hover:opacity-100'}`}
          // On touch devices, disable pointer events if options are not shown, to allow image tap.
          style={isTouchDevice && !showOptions ? {pointerEvents: 'none'} : {}}
        >
          <div className="relative">
            {/* The actual button that toggles the options menu.
                On desktop, it appears on hover.
                On mobile, it appears with the overlay if options are shown (via long-press).
                The `onClick` handler is still useful for accessibility or if a tap on the button is desired. */}
            <button
              onClick={handleToggleOptions}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors duration-200"
              title="Options"
              aria-haspopup="true"
              aria-expanded={showOptions}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            {showOptions && (
              <div
                ref={dropdownRef}
                className="absolute top-full mt-2 right-0 bg-white rounded-md shadow-lg py-1 z-10 w-32"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  onClick={() => handleOptionClick(() => onSave(image.url!))}
                >
                  Save Image
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  onClick={() => handleOptionClick(() => onCopy(image.url!))}
                >
                  Copy Image
                </button>
                {navigator.share && ( // Only show share option if Web Share API is supported
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => handleOptionClick(() => onShare(image.url!, `edited_image_${image.id.substring(0, 5)}.png`))}
                  >
                    Share Image
                  </button>
                )}
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  onClick={() => handleOptionClick(() => onEdit(image))}
                >
                  Edit This
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedImageCard;