import React from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

interface GeometrySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export const GeometrySlider: React.FC<GeometrySliderProps> = ({ value, onChange }) => {
  const isMobile = useIsMobile();

  const getLabel = (val: number): string => {
    if (val <= 33) return 'Creative';
    if (val <= 66) return 'Balanced';
    return 'Precise';
  };
  
  const label = getLabel(value);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
         <h2 className="text-lg font-semibold text-gray-900">Geometry</h2>
         <span className="text-indigo-600 font-bold">{label}</span>
      </div>
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
           {!isMobile && (
              <div className="w-12 h-10 flex-shrink-0 flex items-center justify-center bg-gray-100 text-gray-800 font-semibold rounded-md border border-gray-300">
                {value}
              </div>
           )}
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="w-full geometry-slider"
            style={{ '--progress': `${value}%` } as React.CSSProperties}
            aria-label={`Geometry precision: ${label}`}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
          <span className="font-medium text-gray-700">Creative</span>
          <span className="font-medium text-gray-700 text-center">Balanced</span>
          <span className="font-medium text-gray-700">Precise</span>
        </div>
      </div>
    </div>
  );
};