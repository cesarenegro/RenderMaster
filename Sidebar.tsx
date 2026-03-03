import React, { useRef } from 'react';
import { CATEGORIES, FURNITURE_OPTIONS, CONCEPTUAL_STYLES, ART_STYLES, EXTERIOR_RENDER_STYLES, FLOORPLAN_STYLES } from '../constants';
import { Category, Style, FurnitureOptionId, EditMode, StyleSubCategory, AIRenderMode, User, BuildingState } from '../types';
import { CnjImages } from './CnjImages';
import { GeometrySlider } from './GeometrySlider';
import { UploadIcon, CloseIcon, SparklesIcon } from './icons';

interface SidebarProps {
  activeCategory: Category['id'];
  onCategoryClick: (id: Category['id']) => void;
  selectedStyleId: Style['id'] | null;
  onApplyStyle: (style: Style | null) => void;
  geometryValue: number;
  onSetGeometryValue: (value: number) => void;
  selectedFurnitureOption: FurnitureOptionId;
  onSetFurnitureOption: (option: FurnitureOptionId) => void;
  buildingState?: BuildingState;
  onSetBuildingState?: (state: BuildingState) => void;
  editMode: EditMode;
  onSetEditMode: (mode: EditMode) => void;
  styleSubCategory: StyleSubCategory;
  onSetStyleSubCategory: (category: StyleSubCategory) => void;
  styleReferenceImageUrl: string | null;
  onStyleReferenceImageChange: (file: File | null) => void;
  aiRenderBaseImageUrl: string | null;
  onAiRenderBaseImageChange: (file: File | null) => void;
  aiRenderMode: AIRenderMode;
  onSetAiRenderMode: (mode: AIRenderMode) => void;
  aiRenderCreativity: number;
  onSetAiRenderCreativity: (value: number) => void;
  onAIRenderGenerate: () => void;
  isAiRenderLoading: boolean;
  user: User | null;
  // Floorplan specific props
  floorplanBaseImageUrl?: string | null;
  onFloorplanBaseImageChange?: (file: File | null) => void;
  onFloorplanGenerate?: () => void;
  isFloorplanLoading?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeCategory, 
  onCategoryClick,
  selectedStyleId, 
  onApplyStyle,
  geometryValue,
  onSetGeometryValue,
  selectedFurnitureOption,
  onSetFurnitureOption,
  buildingState = 'ready',
  onSetBuildingState,
  editMode,
  onSetEditMode,
  styleSubCategory,
  onSetStyleSubCategory,
  styleReferenceImageUrl,
  onStyleReferenceImageChange,
  aiRenderBaseImageUrl,
  onAiRenderBaseImageChange,
  aiRenderMode,
  onSetAiRenderMode,
  aiRenderCreativity,
  onSetAiRenderCreativity,
  onAIRenderGenerate,
  isAiRenderLoading,
  user,
  floorplanBaseImageUrl,
  onFloorplanBaseImageChange,
  onFloorplanGenerate,
  isFloorplanLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiRenderFileInputRef = useRef<HTMLInputElement>(null);
  const floorplanFileInputRef = useRef<HTMLInputElement>(null);
  const exteriorConceptualStyles = CONCEPTUAL_STYLES.filter(style => style.id !== 'conceptual-night');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        onStyleReferenceImageChange(e.target.files[0]);
    }
  };

  const handleAiRenderFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        onAiRenderBaseImageChange(e.target.files[0]);
    }
  };

  const handleFloorplanFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && onFloorplanBaseImageChange) {
        onFloorplanBaseImageChange(e.target.files[0]);
    }
  };

  const renderMoodboardUpload = () => (
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Reference Moodboard</h3>
        <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors h-48 group overflow-hidden"
        >
            {styleReferenceImageUrl ? (
                <>
                    <img src={styleReferenceImageUrl} alt="Moodboard Reference" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-indigo-600 px-3 py-1.5 rounded-full">Change Image</span>
                    </div>
                </>
            ) : (
                <>
                    <UploadIcon className="w-10 h-10 text-gray-400 mb-2 breathing-icon" />
                    <span className="text-xs text-gray-500 font-medium">Upload Moodboard</span>
                </>
            )}
        </div>
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
        />
        <p className="text-xs text-gray-500 mt-2">Upload an image to copy its style, colors, and materials.</p>
    </div>
  );

  return (
    <aside className="w-full md:w-96 bg-gray-100 p-6 flex flex-col space-y-8 overflow-y-auto shrink-0 border-r border-gray-200 no-scrollbar">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Scene</h2>
        <div className="flex flex-wrap items-center bg-white rounded-lg p-1 border border-gray-200 gap-1">
          {CATEGORIES.map(({ id, Icon, isPro }) => (
            <button
              key={id}
              onClick={() => onCategoryClick(id)}
              className={`relative flex-1 flex items-center justify-center gap-2 p-2 rounded-md text-[10px] md:text-xs font-medium transition-colors ${
                activeCategory === id ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {id}
              {isPro && user?.plan === 'free' && (
                <span className="absolute -top-1.5 -right-1 bg-yellow-400 text-indigo-950 text-[8px] px-1 rounded-sm font-bold shadow-sm">PRO</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeCategory === 'Floorplan' ? (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Base Floorplan / Sketch</h3>
                <div 
                    onClick={() => floorplanFileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors h-48 group overflow-hidden"
                >
                    {floorplanBaseImageUrl ? (
                        <>
                            <img src={floorplanBaseImageUrl} alt="Base floorplan" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-bold bg-indigo-600 px-3 py-1.5 rounded-full">Change Image</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <UploadIcon className="w-10 h-10 text-gray-400 mb-2 breathing-icon" />
                            <span className="text-xs text-gray-500 font-medium">Upload Floorplan or Sketch</span>
                        </>
                    )}
                </div>
                <input 
                    type="file" 
                    ref={floorplanFileInputRef} 
                    onChange={handleFloorplanFileChange} 
                    className="hidden" 
                    accept="image/*"
                />
            </div>

            <GeometrySlider value={geometryValue} onChange={onSetGeometryValue} />

            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Floorplan Styles</h3>
                <div className="grid grid-cols-2 gap-4">
                  {FLOORPLAN_STYLES.map((style) => (
                    <CnjImages
                      key={style.id}
                      src={style.image}
                      alt={style.name}
                      isSelected={selectedStyleId === style.id}
                      onClick={() => onApplyStyle(style)}
                    />
                  ))}
                </div>
            </div>

            <button
                onClick={onFloorplanGenerate}
                disabled={!floorplanBaseImageUrl || !selectedStyleId || isFloorplanLoading}
                className="w-full flex items-center justify-center px-6 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
            >
                {isFloorplanLoading ? (
                    <SparklesIcon className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                    <SparklesIcon className="w-5 h-5 mr-2" />
                )}
                {isFloorplanLoading ? 'Generating Plan...' : 'Generate Floorplan'}
            </button>
            {user?.plan === 'free' && (
              <p className="text-center text-[10px] text-gray-500">
                You have {user.credits} credits remaining this month.
              </p>
            )}
        </div>
      ) : activeCategory === 'AI Render' ? (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Base Image / Sketch</h3>
                <div 
                    onClick={() => aiRenderFileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors h-48 group overflow-hidden"
                >
                    {aiRenderBaseImageUrl ? (
                        <>
                            <img src={aiRenderBaseImageUrl} alt="Base image" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-bold bg-indigo-600 px-3 py-1.5 rounded-full">Change Image</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <UploadIcon className="w-10 h-10 text-gray-400 mb-2 breathing-icon" />
                            <span className="text-xs text-gray-500 font-medium">Upload Image or Sketch</span>
                        </>
                    )}
                </div>
                <input 
                    type="file" 
                    ref={aiRenderFileInputRef} 
                    onChange={handleAiRenderFileChange} 
                    className="hidden" 
                    accept="image/*"
                />
            </div>

            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Render Mode</h3>
                <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                    <button
                        onClick={() => onSetAiRenderMode('keep-texture')}
                        className={`flex-1 p-2 rounded-md text-xs font-medium transition-colors ${
                            aiRenderMode === 'keep-texture' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Keep texture
                    </button>
                    <button
                        onClick={() => onSetAiRenderMode('creative')}
                        className={`flex-1 p-2 rounded-md text-xs font-medium transition-colors ${
                            aiRenderMode === 'creative' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Creative
                    </button>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Creativity Level</h3>
                    <span className="text-indigo-600 font-bold text-sm">{aiRenderCreativity}</span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={aiRenderCreativity}
                        onChange={(e) => onSetAiRenderCreativity(parseInt(e.target.value, 10))}
                        className="w-full contrast-slider"
                        style={{ '--progress': `${((aiRenderCreativity - 1) / 9) * 100}%` } as React.CSSProperties}
                        disabled={isAiRenderLoading}
                    />
                </div>
            </div>

            <button
                onClick={onAIRenderGenerate}
                disabled={!aiRenderBaseImageUrl || isAiRenderLoading}
                className="w-full flex items-center justify-center px-6 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
            >
                {isAiRenderLoading ? (
                    <SparklesIcon className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                    <SparklesIcon className="w-5 h-5 mr-2" />
                )}
                {isAiRenderLoading ? 'Rendering...' : 'Generate Render'}
            </button>
            {user?.plan === 'free' && (
              <p className="text-center text-[10px] text-gray-500">
                You have {user.credits} credits remaining this month.
              </p>
            )}
        </div>
      ) : activeCategory !== 'Moodboard' ? (
        <>
          <GeometrySlider value={geometryValue} onChange={onSetGeometryValue} />
          
          {/* Raw vs Ready Building Toggle */}
          {onSetBuildingState && (
             <div className="mb-2">
                <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                    <button
                        onClick={() => onSetBuildingState('raw')}
                        className={`flex-1 p-2 rounded-md text-xs font-medium transition-colors ${
                            buildingState === 'raw' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Raw Building
                    </button>
                    <button
                        onClick={() => onSetBuildingState('ready')}
                        className={`flex-1 p-2 rounded-md text-xs font-medium transition-colors ${
                            buildingState === 'ready' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Ready Building
                    </button>
                </div>
             </div>
          )}

          {/* ... Rest of Sidebar content ... */}
          {activeCategory === 'Interiors' ? (
            <>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Furniture</h2>
                <div className="space-y-2">
                  {FURNITURE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => onSetFurnitureOption(option.id)}
                      className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors border ${
                        selectedFurnitureOption === option.id
                          ? 'bg-indigo-100 border-indigo-300 ring-1 ring-indigo-300'
                          : 'bg-white hover:bg-gray-200/60 border-gray-200'
                      }`}
                    >
                      <option.Icon className={`w-5 h-5 flex-shrink-0 ${selectedFurnitureOption === option.id ? 'text-indigo-600' : 'text-indigo-400'}`} />
                      <span className={`text-sm ${selectedFurnitureOption === option.id ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200 mb-4">
                  <button
                    onClick={() => onSetEditMode('conceptual')}
                    className={`w-full p-2 rounded-md text-sm font-medium transition-colors uppercase tracking-wider ${
                      editMode === 'conceptual' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Conceptual
                  </button>
                  <button
                    onClick={() => onSetEditMode('styles')}
                    className={`w-full p-2 rounded-md text-sm font-medium transition-colors uppercase tracking-wider ${
                      editMode === 'styles' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Styles
                  </button>
                  <button
                    onClick={() => onSetEditMode('prompt')}
                    className={`w-full p-2 rounded-md text-sm font-medium transition-colors uppercase tracking-wider ${
                      editMode === 'prompt' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Prompt
                  </button>
                </div>
                
                {editMode === 'conceptual' && (
                  <div className="grid grid-cols-2 gap-4">
                    {CONCEPTUAL_STYLES.map((style) => (
                      <CnjImages
                        key={style.id}
                        src={style.image}
                        alt={style.name}
                        isSelected={selectedStyleId === style.id}
                        onClick={() => onApplyStyle(style)}
                      />
                    ))}
                  </div>
                )}

                {editMode === 'styles' && (
                  <div>
                    {/* Interior Sub-category toggle */}
                    <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200 mb-4">
                        <button
                            onClick={() => { onSetStyleSubCategory('preset'); onApplyStyle(null); }}
                            className={`w-full p-2 rounded-md text-sm font-medium transition-colors ${
                                styleSubCategory === 'preset' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            PRE-SET
                        </button>
                        <button
                            onClick={() => { onSetStyleSubCategory('moodboard'); onApplyStyle(null); }}
                            className={`w-full p-2 rounded-md text-sm font-medium transition-colors ${
                                styleSubCategory === 'moodboard' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            MOODBOARD
                        </button>
                    </div>

                    {styleSubCategory === 'preset' && (
                        <div className="grid grid-cols-2 gap-4">
                            {ART_STYLES.map((style) => (
                            <CnjImages
                                key={style.id}
                                src={style.image}
                                alt={style.name}
                                isSelected={selectedStyleId === style.id}
                                onClick={() => onApplyStyle(style)}
                            />
                            ))}
                        </div>
                    )}
                    
                    {styleSubCategory === 'moodboard' && renderMoodboardUpload()}
                  </div>
                )}
              </div>
            </>
          ) : ( // Exteriors logic
            <div>
               <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200 mb-4">
                <button
                  onClick={() => onSetEditMode('conceptual')}
                  className={`w-full p-2 rounded-md text-sm font-medium transition-colors uppercase tracking-wider ${
                    editMode === 'conceptual' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Render
                </button>
                <button
                  onClick={() => onSetEditMode('styles')}
                  className={`w-full p-2 rounded-md text-sm font-medium transition-colors uppercase tracking-wider ${
                    editMode === 'styles' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Styles
                </button>
                <button
                  onClick={() => onSetEditMode('prompt')}
                  className={`w-full p-2 rounded-md text-sm font-medium transition-colors uppercase tracking-wider ${
                    editMode === 'prompt' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Prompt
                </button>
              </div>
              
              {editMode === 'conceptual' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Render Modes</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {EXTERIOR_RENDER_STYLES.map((style) => (
                      <CnjImages
                        key={style.id}
                        src={style.image}
                        alt={style.name}
                        isSelected={selectedStyleId === style.id}
                        onClick={() => onApplyStyle(style)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {editMode === 'styles' && (
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Styles</h2>
                    <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200 mb-4 overflow-x-auto no-scrollbar">
                      <button
                        onClick={() => { onSetStyleSubCategory('preset'); onApplyStyle(null); }}
                        className={`flex-1 min-w-[70px] p-2 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                          styleSubCategory === 'preset' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        PRE-SET
                      </button>
                      <button
                        onClick={() => { onSetStyleSubCategory('conceptual'); onApplyStyle(null); }}
                        className={`flex-1 min-w-[70px] p-2 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                          styleSubCategory === 'conceptual' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        CONCEPTUAL
                      </button>
                      <button
                        onClick={() => { onSetStyleSubCategory('moodboard'); onApplyStyle(null); }}
                        className={`flex-1 min-w-[70px] p-2 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                          styleSubCategory === 'moodboard' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        MOODBOARD
                      </button>
                    </div>
                    
                    {styleSubCategory === 'preset' && (
                      <div className="grid grid-cols-2 gap-4">
                        {ART_STYLES.map((style) => (
                          <CnjImages
                            key={style.id}
                            src={style.image}
                            alt={style.name}
                            isSelected={selectedStyleId === style.id}
                            onClick={() => onApplyStyle(style)}
                          />
                        ))}
                      </div>
                    )}
                    {styleSubCategory === 'conceptual' && (
                      <div className="grid grid-cols-2 gap-4">
                        {exteriorConceptualStyles.map((style) => (
                          <CnjImages
                            key={style.id}
                            src={style.image}
                            alt={style.name}
                            isSelected={selectedStyleId === style.id}
                            onClick={() => onApplyStyle(style)}
                          />
                        ))}
                      </div>
                    )}
                    {styleSubCategory === 'moodboard' && renderMoodboardUpload()}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 font-medium">Moodboard Mode</p>
        </div>
      )}
    </aside>
  );
};