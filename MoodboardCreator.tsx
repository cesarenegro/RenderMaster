import React, { useState, useRef } from 'react';
import { generateMoodboard } from '../services/geminiService';
import { UploadIcon, SparklesIcon, ResetIcon, DownloadIcon, CloseIcon } from './icons';

const MAX_IMAGES = 6;

interface MoodboardCreatorProps {
  onImageDoubleClick: (url: string) => void;
}

export const MoodboardCreator: React.FC<MoodboardCreatorProps> = ({ onImageDoubleClick }) => {
  const [sourceImages, setSourceImages] = useState<File[]>([]);
  const [sourceImageUrls, setSourceImageUrls] = useState<string[]>([]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = (Array.from(e.target.files || []) as File[]).slice(0, MAX_IMAGES - sourceImages.length);
    if (files.length > 0) {
      setSourceImages(prev => [...prev, ...files]);
      const newUrls = files.map(file => URL.createObjectURL(file));
      setSourceImageUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(sourceImageUrls[index]);
    setSourceImages(prev => prev.filter((_, i) => i !== index));
    setSourceImageUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleGenerate = async () => {
    if (sourceImages.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const base64String = await generateMoodboard(sourceImages);
      setGeneratedImageUrl(`data:image/png;base64,${base64String}`);
    } catch (e: any) {
      console.error(e);
      let errorMsg = e.message || 'An error occurred during moodboard generation.';
      if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        errorMsg = 'API Quota Exceeded. Please try again later or check your API plan.';
      } else if (errorMsg.includes('503')) {
        errorMsg = 'Service is temporarily unavailable. Please try again shortly.';
      }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    sourceImageUrls.forEach(url => URL.revokeObjectURL(url));
    setSourceImages([]);
    setSourceImageUrls([]);
    setGeneratedImageUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const handleDownload = () => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = 'moodboard.png';
    link.click();
  };

  return (
    <main className="flex-1 p-6 flex flex-col items-center justify-center bg-white overflow-auto">
        <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Moodboard Generator</h1>
            <p className="text-lg text-gray-600 mt-1">Upload 1 to 6 images to create a visual theme.</p>
        </div>
        <div className="w-full max-w-6xl flex-1 md:grid md:grid-cols-2 md:gap-8 space-y-6 md:space-y-0">
            {/* Left side */}
            <div className="flex flex-col h-full">
                <div className="grid grid-cols-3 gap-4 mb-4">
                    {sourceImageUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square">
                            <img src={url} alt={`source ${index + 1}`} className="w-full h-full object-cover rounded-lg"/>
                            <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/80">
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {sourceImages.length < MAX_IMAGES && (
                        <div 
                            className="flex items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="text-center text-gray-500">
                                <UploadIcon className="w-8 h-8 mx-auto"/>
                                <span className="text-xs mt-1 block">Add Image</span>
                            </div>
                        </div>
                    )}
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    multiple 
                    accept="image/*" 
                    className="hidden"
                    disabled={sourceImages.length >= MAX_IMAGES}
                />
                
                <div className="flex items-center gap-4 mt-auto">
                    <button
                        onClick={handleGenerate}
                        disabled={sourceImages.length === 0 || isLoading}
                        className="flex-1 flex items-center justify-center px-6 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 text-lg"
                    >
                        <SparklesIcon className={`w-6 h-6 mr-3 ${isLoading ? 'animate-spin' : ''}`} />
                         {isLoading ? 'Generating...' : `Generate`}
                    </button>
                    <button onClick={handleReset} className="p-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors" title="Reset">
                        <ResetIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Right side */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-white relative h-full min-h-[300px] md:min-h-0">
                {isLoading ? (
                    <div className="text-center text-gray-500">
                        <SparklesIcon className="w-12 h-12 mx-auto mb-4 animate-spin"/>
                        <p>Generating moodboard...</p>
                    </div>
                ) : generatedImageUrl ? (
                    <>
                        <img onDoubleClick={() => onImageDoubleClick(generatedImageUrl)} src={generatedImageUrl} alt="Generated Moodboard" className="max-w-full max-h-full object-contain rounded-lg p-2 cursor-pointer" />
                        <button onClick={handleDownload} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors" title="Download Image">
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                    </>
                ) : (
                    <p className="text-gray-400">Your generated moodboard will appear here.</p>
                )}
            </div>
        </div>
        {error && <p className="text-red-600 text-sm mt-4 text-center px-4 py-2 bg-red-50 rounded-lg border border-red-200">{error}</p>}
    </main>
  );
};