import React, { useState, useRef, useCallback, useEffect } from 'react';
import { generateImage } from '../services/geminiService';
import { UploadIcon, SparklesIcon, ResetIcon, DownloadIcon, CompareIcon, ExpandIcon, CloseIcon } from './icons';
import { EditMode, FurnitureOptionId, Style, Category, BuildingState, StyleSubCategory } from '../types';
import 'image-comparison-slider';

// Fix for custom element 'image-comparison-slider' not being recognized by TypeScript JSX.
const ImageComparisonSlider = 'image-comparison-slider' as any;

interface ImageEditorProps {
  activeCategory: Category['id'];
  onImageDoubleClick: (url: string) => void;
  selectedStyle: Style | null;
  geometryValue: number;
  selectedFurnitureOption: FurnitureOptionId;
  furniturePrompt: string;
  buildingState: BuildingState;
  editMode: EditMode;
  onSetEditMode?: (mode: EditMode) => void;
  onReset?: () => void;
  styleSubCategory?: StyleSubCategory;
  isMoodboard: boolean;
  contrastValue: number;
  onSetContrastValue: (value: number) => void;
  styleReferenceImage: File | null;
  // External props for AI Render mode
  externalResultUrl?: string | null;
  externalBaseUrl?: string | null;
  externalLoading?: boolean;
  externalError?: string | null;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  activeCategory,
  onImageDoubleClick,
  selectedStyle,
  geometryValue,
  selectedFurnitureOption,
  furniturePrompt,
  buildingState,
  editMode,
  onSetEditMode,
  onReset,
  styleSubCategory,
  isMoodboard,
  contrastValue,
  onSetContrastValue,
  styleReferenceImage,
  externalResultUrl,
  externalBaseUrl,
  externalLoading,
  externalError,
}) => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  // Focus prompt input when switching to prompt mode
  useEffect(() => {
    if (editMode === 'prompt' && promptInputRef.current) {
        promptInputRef.current.focus();
    }
  }, [editMode]);
  
  // Synchronize with external state (e.g., from AI Render mode)
  useEffect(() => {
    if (externalResultUrl) {
        setGeneratedImageUrl(externalResultUrl);
    }
  }, [externalResultUrl]);

  useEffect(() => {
    if (externalBaseUrl) {
        setOriginalImageUrl(externalBaseUrl);
    }
  }, [externalBaseUrl]);

  useEffect(() => {
    if (externalLoading !== undefined) {
        setIsLoading(externalLoading);
    }
  }, [externalLoading]);

  useEffect(() => {
    if (externalError !== undefined) {
        setError(externalError);
    }
  }, [externalError]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLocalImageReset();
      setOriginalImage(file);
      setOriginalImageUrl(URL.createObjectURL(file));
    }
  };
  
  const handleLocalImageReset = () => {
    setOriginalImage(null);
    setOriginalImageUrl(null);
    setGeneratedImageUrl(null);
    setError(null);
    setIsComparing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleFullReset = () => {
      // Clear local state
      handleLocalImageReset();
      setPrompt('');
      // Call parent reset if available
      if (onReset) onReset();
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleLocalImageReset();
      setOriginalImage(file);
      setOriginalImageUrl(URL.createObjectURL(file));
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!originalImage) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);
    setIsComparing(false);
    
    let finalPrompt = '';
    const userInstruction = prompt.trim() ? ` Additional instructions: ${prompt}` : '';

    // Construction state instruction
    let buildingInstruction = '';
    if (buildingState === 'raw') {
      buildingInstruction = "The input image shows a raw construction state (unfinished concrete/brick shell, no paint, no tiles, no cladding, empty/unfinished pools). COMPLETELY FINISH the building: apply high-quality paints, cladding, flooring, and tiles to all surfaces. If a pool structure is present, tile it and fill it with water. Install windows/doors if missing, and landscape the surroundings. Transform this raw shell into a fully finished property. ";
    }

    if (editMode === 'prompt') {
      if (!prompt && !styleReferenceImage) {
          setError('Please enter a prompt or upload a style reference image.');
          setIsLoading(false);
          return;
      }
      finalPrompt = prompt;
    } else if (editMode === 'styles' && styleSubCategory === 'moodboard') {
        if (!styleReferenceImage) {
            setError('Please upload a moodboard image for reference.');
            setIsLoading(false);
            return;
        }
        
        // Note: furniturePrompt is intentionally excluded here to avoid conflicting with the strict moodboard instructions
        // which define their own furniture rules (maintain position, change materials).
        finalPrompt = `
          ${buildingInstruction}

          Use the uploaded base interior or exterior image as the primary reference and the uploaded moodboard image as the strict material and style guide.

          Replace all existing materials, textures, and color palettes in the base image with those shown in the moodboard, including:
          – wall finishes and colors
          – floor materials
          – ceiling materials and details
          – furniture materials and finishes
          – pool finishes and tiles (if present)

          Geometry preservation (critical):
          Keep the architecture, proportions, volumes, structure, openings, and camera angle exactly the same as the original image.
          Do not modify walls, floors, ceilings, roofs, openings, pool shape, or spatial layout.

          Furniture & accessories:
          – Maintain existing furniture positions and scale.
          – Change only materials, upholstery, finishes, and colors to match the moodboard.
          – Accessories (curtains, cushions, decor objects, small loose furniture) may be adjusted, replaced, or simplified only if necessary to align with the moodboard style.
          – Do not overcrowd the scene and do not introduce new dominant elements.

          Moodboard adherence (strict):
          – Use the moodboard as the sole reference for textures, materials, colors, and overall design language.
          – Match surface finishes, gloss/matte levels, wood grain direction, stone veining, fabric texture, and pool tile patterns accurately.
          – Do not invent styles, colors, or materials not present in the moodboard.

          Lighting & realism:
          – Create a high-end, editorial-quality architectural image.
          – Use soft, realistic lighting with natural shadows and balanced contrast.
          – Maintain a refined, luxury atmosphere suitable for an architectural presentation or client pitch.
          – Improve material realism, reflections, depth, and texture fidelity without altering the design.

          Output quality:
          – Ultra-realistic, professional architectural visualization
          – Clean, elegant, and presentation-ready
          – No artistic distortion, no stylization, no geometry changes
          – The final image must clearly read as the original project re-materialized according to the moodboard, at a premium architectural standard.

          ${userInstruction}
        `;
    } else if (selectedStyle) {
      finalPrompt = `${buildingInstruction}${furniturePrompt}in a ${selectedStyle.name} style, ${selectedStyle.prompt}${userInstruction}`;
    } else {
        // Fallback or error if no style selected
        if(userInstruction) {
             finalPrompt = `${buildingInstruction}${furniturePrompt}${userInstruction}`;
        } else {
            setError('Please select a style, upload a moodboard, or enter a prompt.');
            setIsLoading(false);
            return;
        }
    }
    
    try {
      const base64String = await generateImage(originalImage, finalPrompt, geometryValue, contrastValue, styleReferenceImage);
      setGeneratedImageUrl(`data:image/png;base64,${base64String}`);
    } catch (e: any) {
      console.error(e);
      let errorMsg = e.message || 'An error occurred during image generation.';
      if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        errorMsg = 'API Quota Exceeded. Please try again later or check your API plan.';
      } else if (errorMsg.includes('503')) {
        errorMsg = 'Service is temporarily unavailable. Please try again shortly.';
      }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, editMode, prompt, selectedStyle, furniturePrompt, geometryValue, contrastValue, styleReferenceImage, buildingState, styleSubCategory]);
  
  const handleDownload = () => {
    const url = generatedImageUrl || externalResultUrl;
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `render-master-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const renderImageContainer = (isOutput: boolean) => {
    const imageUrl = isOutput ? (generatedImageUrl || externalResultUrl) : (originalImageUrl || externalBaseUrl);
    const title = isOutput ? "Generated Image" : "Original Image";

    if (isLoading && isOutput) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-lg shimmer-bg">
                <p className="mt-4 text-gray-800 font-bold text-lg z-10">Generating your vision...</p>
                <p className="text-gray-600 mt-1 z-10">This may take a moment.</p>
            </div>
        )
    }

    if (!imageUrl) {
        return (
            <div className={`w-full h-full flex items-center justify-center rounded-lg ${!isOutput ? 'bg-white border-2 border-dashed border-gray-300' : 'bg-gray-100'}`}>
                <div className="text-center text-gray-500 p-4">
                    {isOutput ? 'Your generated image will appear here.' : 'Upload an image to get started.'}
                </div>
            </div>
        )
    }

    return (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-contain"
          onDoubleClick={() => onImageDoubleClick(imageUrl)}
          referrerPolicy="no-referrer"
        />
    )
  }

  const comparisonSlider = (
    <ImageComparisonSlider className="slider-with-custom-handle">
        <img slot="first" src={(originalImageUrl || externalBaseUrl)!} alt="Original" referrerPolicy="no-referrer" />
        <img slot="second" src={(generatedImageUrl || externalResultUrl)!} alt="Generated" referrerPolicy="no-referrer" />
        <div slot="handle" className="custom-handle">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/><path d="M12 20l-1.41-1.41L5.83 13H20v-2H5.83l5.58-5.59L12 4l-8 8z"/></svg>
        </div>
    </ImageComparisonSlider>
  );

  const isAIRenderMode = activeCategory === 'AI Render';
  const showSplitControls = !isAIRenderMode; 

  const getPlaceholderText = () => {
    if (editMode === 'prompt') return "Describe your exact vision. This will override selected styles.";
    if (editMode === 'styles' && styleSubCategory === 'moodboard') return "Add specific instructions (e.g. 'add a red chair', 'make it sunnier')...";
    return "Add instructions to refine the selected style (e.g. 'change floor to wood')...";
  };

  return (
    <main className="flex-1 p-4 md:p-6 flex flex-col bg-gray-50 overflow-auto">
      <div className={`flex-1 ${isAIRenderMode ? 'flex' : 'grid grid-cols-1 md:grid-cols-2'} gap-4 md:gap-6 min-h-0`}>
        {/* Left Column: Image Upload & Original (Hidden in AI Render mode) */}
        {!isAIRenderMode && (
          <div
            className="relative w-full h-full flex items-center justify-center rounded-lg group"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {!(originalImageUrl || externalBaseUrl) ? (
               <div className="text-center p-6 cursor-pointer border-2 border-dashed border-gray-400 rounded-xl hover:bg-gray-100 transition-colors w-full h-full flex flex-col justify-center items-center" onClick={() => fileInputRef.current?.click()}>
                  <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4 breathing-icon" />
                  <h3 className="text-lg font-semibold text-gray-700">Drop your image here</h3>
                  <p className="text-gray-500">or click to browse</p>
                </div>
            ) : (
              <>
                <div className="absolute top-0 left-0 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-br-lg z-10">BEFORE</div>
                {renderImageContainer(false)}
                {!externalBaseUrl && (
                  <button onClick={handleLocalImageReset} className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title="Clear Image">
                      <CloseIcon className="w-5 h-5" />
                  </button>
                )}
              </>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
        )}

        {/* Output Area (Generated Image) */}
        <div className="relative w-full h-full rounded-lg overflow-hidden flex-1">
            {externalResultUrl && <div className="absolute top-0 left-0 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-br-lg z-10 uppercase">AI Render Result</div>}
            {isComparing && (originalImageUrl || externalBaseUrl) && (generatedImageUrl || externalResultUrl) ? comparisonSlider : renderImageContainer(true)}
        </div>
      </div>

      {error && <div className="text-center text-red-500 font-semibold mt-4 px-4 py-2 bg-red-50 rounded-lg border border-red-200">{error}</div>}

      {/* Bottom controls - only show if not in external control mode like AI Render */}
      {showSplitControls && (
        <div className="shrink-0 pt-4 mt-4 border-t border-gray-200">
            {/* Contrast Slider */}
            <div className="mb-4">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Contrast</label>
            <input
                type="range"
                min="-50"
                max="50"
                value={contrastValue}
                onChange={(e) => onSetContrastValue(parseInt(e.target.value, 10))}
                className="w-full contrast-slider"
                style={{ '--progress': `${((contrastValue + 50) / 100) * 100}%` } as React.CSSProperties}
                disabled={isLoading}
            />
            </div>
            
            {/* Primary Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <button
                    onClick={handleGenerate}
                    disabled={!originalImage || isLoading || isMoodboard}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 text-base"
                >
                    <SparklesIcon className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Generating...' : `Generate`}
                </button>
                
                <button 
                    onClick={handleFullReset} 
                    className="px-6 py-3 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                    disabled={isLoading}
                >
                    Reset All
                </button>

                <div className="flex items-center gap-2 ml-auto">
                    <button onClick={() => setIsComparing(!isComparing)} title="Compare" disabled={!(originalImageUrl || externalBaseUrl) || !(generatedImageUrl || externalResultUrl)} className="p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><CompareIcon className="w-5 h-5"/></button>
                    <button onClick={handleDownload} title="Download" disabled={!(generatedImageUrl || externalResultUrl)} className="p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><DownloadIcon className="w-5 h-5"/></button>
                    <button onClick={() => (generatedImageUrl || externalResultUrl) && onImageDoubleClick((generatedImageUrl || externalResultUrl)!)} title="Expand" disabled={!(generatedImageUrl || externalResultUrl)} className="p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><ExpandIcon className="w-5 h-5"/></button>
                </div>
            </div>

            {/* Prompt Input Area */}
            <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                        {editMode === 'prompt' ? 'Custom Prompt' : 'Additional Instructions'}
                    </label>
                    {onSetEditMode && (
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 select-none hover:text-indigo-600 transition-colors">
                            <input
                                type="checkbox"
                                checked={editMode === 'prompt'}
                                onChange={(e) => onSetEditMode(e.target.checked ? 'prompt' : 'conceptual')}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                            />
                            Override Style (Custom Prompt Only)
                        </label>
                    )}
                </div>
                <div className="relative">
                    <textarea
                        ref={promptInputRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={getPlaceholderText()}
                        disabled={isLoading}
                        rows={2}
                        className="w-full px-4 py-3 text-gray-800 bg-white rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                    />
                </div>
            </div>
        </div>
      )}

      {isAIRenderMode && (generatedImageUrl || externalResultUrl) && (
        <div className="shrink-0 pt-4 mt-4 flex justify-center gap-4">
             <button onClick={() => setIsComparing(!isComparing)} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all hover:shadow-md active:scale-95">
                <CompareIcon className="w-5 h-5" />
                Compare Before/After
             </button>
             <button onClick={handleDownload} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all hover:shadow-md active:scale-95">
                <DownloadIcon className="w-5 h-5" />
                Download Render
             </button>
             <button onClick={() => onImageDoubleClick((generatedImageUrl || externalResultUrl)!)} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all hover:shadow-md active:scale-95">
                <ExpandIcon className="w-5 h-5" />
                Full Screen
             </button>
        </div>
      )}
    </main>
  );
};