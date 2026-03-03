import React from 'react';
import { CloseIcon } from './icons';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen || !imageUrl) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-[95vw] max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="Generated image full screen"
          className="block max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl"
        />
      </div>
      
      <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/20 p-2 rounded-full text-white hover:bg-white/40 transition-colors"
          title="Close"
      >
          <CloseIcon className="w-6 h-6" />
      </button>
    </div>
  );
};
