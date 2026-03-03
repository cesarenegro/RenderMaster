
import React from 'react';

interface CnjImagesProps {
  src: string;
  alt: string;
  isSelected: boolean;
  onClick: () => void;
}

export const CnjImages: React.FC<CnjImagesProps> = ({ src, alt, isSelected, onClick }) => {
  return (
    <div
      className={`relative rounded-lg overflow-hidden cursor-pointer group transition-all duration-300 ${isSelected ? 'ring-2 ring-yellow-400' : 'ring-1 ring-gray-300 hover:ring-indigo-500/50'}`}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-24 object-cover"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
      {isSelected && (
        <div className="absolute inset-0 bg-yellow-400/30" />
      )}
      <p className="absolute bottom-2 left-2 text-white text-xs font-semibold">{alt}</p>
    </div>
  );
};
