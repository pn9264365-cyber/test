import React, { useState, useRef, useEffect } from 'react';
import { fileToBase64, generateTilePreview, estimateFloorArea } from '../services/geminiService';
import { Onboarding } from './Onboarding';
import { ComparisonSlider } from './ComparisonSlider';
import { CostEstimator } from './CostEstimator';
import { AppState, UserPreferences } from '../types';
import { 
  Upload, 
  Wand2, 
  Download, 
  RefreshCw, 
  Scan,
  Maximize2,
  Check,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

// 1. Define the Style Map to determine "Recommended" colors
const STYLE_COLOR_MAP: Record<string, string[]> = {
  "Modern Minimalist": [
    "Cool Grey", "Arctic White", "Matte Black", "Taupe", "Slate",
    "Charcoal", "Silver", "Dove Grey", "Midnight Blue", "Cement"
  ],
  "Warm Luxury": [
    "Warm Beige", "Crema Marfil", "Rich Walnut", "Champagne", "Honey Oak",
    "Gold Vein", "Ivory", "Espresso", "Travertine", "Mocha"
  ],
  "Rustic Traditional": [
    "Terracotta", "Natural Stone", "Warm Oak", "Antique Grey", "Olive",
    "Sandstone", "Brick Red", "Mahogany", "Forest Green", "Amber"
  ],
  "Industrial Chic": [
    "Polished Concrete", "Charcoal", "Raw Steel", "Brick Red", "Weathered Wood",
    "Rust", "Gunmetal", "Aged Bronze", "Iron", "Distressed Leather"
  ],
  "Scandinavian": [
    "Light Ash", "Pale Birch", "Soft White", "Muted Sage", "Blush",
    "Mint", "Cloud Blue", "Peach", "Frost", "Light Pine"
  ]
};

// 2. Derive a Master Palette of ALL unique colors to determine "All Others"
const MASTER_PALETTE = Array.from(new Set(
  Object.values(STYLE_COLOR_MAP).flat()
));

// Helper to map fancy color names to hex codes for UI previews
const getColorHex = (name: string) => {
  const map: Record<string, string> = {
    // Greys / Blacks
    'Cool Grey': '#9ca3af', 'Arctic White': '#f9fafb', 'Matte Black': '#171717', 'Taupe': '#b0a696', 'Slate': '#64748b',
    'Charcoal': '#374151', 'Silver': '#e5e7eb', 'Dove Grey': '#d1d5db', 'Midnight Blue': '#1e3a8a', 'Cement': '#9ca3af',
    'Gunmetal': '#2a3439', 'Iron': '#434b4d', 'Antique Grey': '#78716c',
    
    // Warms / Browns
    'Warm Beige': '#e8dec8', 'Crema Marfil': '#f5f5dc', 'Rich Walnut': '#5d4037', 'Champagne': '#fad6a5', 'Honey Oak': '#d4a017',
    'Ivory': '#fffff0', 'Espresso': '#4e342e', 'Travertine': '#eecfa1', 'Mocha': '#a0522d', 'Terracotta': '#e2725b',
    'Natural Stone': '#8b8589', 'Warm Oak': '#cd853f', 'Sandstone': '#d2b48c', 'Brick Red': '#cb4154', 'Mahogany': '#c04000',
    'Amber': '#ffbf00', 'Rust': '#b7410e', 'Distressed Leather': '#8b4513', 'Light Pine': '#fbf8e6', 'Pale Birch': '#f6ead1',
    'Light Ash': '#f5f5f5', 'Weathered Wood': '#deb887',

    // Accents / Metals
    'Gold Vein': '#ffd700', 'Olive': '#808000', 'Forest Green': '#228b22', 'Polished Concrete': '#b0c4de', 
    'Raw Steel': '#71797e', 'Aged Bronze': '#cd7f32', 'Muted Sage': '#9caf88', 'Blush': '#ffb6c1',
    'Mint': '#98ff98', 'Cloud Blue': '#b0e0e6', 'Peach': '#ffdab9', 'Frost': '#e0ffff', 'Soft White': '#f8f8ff',
    
    // Fallbacks
    'Beige': '#f5f5dc', 'Grey': '#808080', 'White': '#ffffff', 'Black': '#000000'
  };
  return map[name] || '#e5e5e5';
};

// Helper to determine text color (black or white) based on background hex
const getContrastColor = (hex: string) => {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128 ? 'text-stone-900' : 'text-white';
};

export const VisualizerTool = ({ onConnectApiKey }: { onConnectApiKey?: () => void }) => {
  const [appState, setAppState] = useState<AppState>(AppState.ONBOARDING);
  const [userPrefs, setUserPrefs] = useState<UserPreferences | null>(null);
  
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Quick settings in visualizer
  const [activeColor, setActiveColor] = useState<string>('');
  const [aiEstimatedArea, setAiEstimatedArea] = useState<number | undefined>(undefined);

  // New State for the 2-Category Logic
  const [activeCategory, setActiveCategory] = useState<'Recommended' | 'All Others'>('Recommended');
  const [dynamicPalette, setDynamicPalette] = useState<{
    'Recommended': string[],
    'All Others': string[]
  }>({ 'Recommended': [], 'All Others': [] });

  const handleOnboardingComplete = (prefs: UserPreferences) => {
    setUserPrefs(prefs);
    const selectedColor = prefs.colorPalette[0];
    setActiveColor(selectedColor);
    
    // Logic: Categorize colors based on the chosen Design Style
    const style = prefs.designStyle;
    const recommendedColors = STYLE_COLOR_MAP[style] || [];
    
    // "All Others" is the Master Palette MINUS the Recommended colors
    const otherColors = MASTER_PALETTE.filter(c => !recommendedColors.includes(c));

    setDynamicPalette({
        'Recommended': recommendedColors,
        'All Others': otherColors
    });

    // If the user's selected color is somehow not in recommended (rare), ensure we show the right tab
    if (recommendedColors.includes(selectedColor)) {
        setActiveCategory('Recommended');
    } else {
        setActiveCategory('All Others');
    }

    setAppState(AppState.IDLE); 
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (JPG, PNG).');
        return;
      }

      setAppState(AppState.UPLOADING);
      setError(null);
      setGeneratedImage(null);
      
      try {
        const base64 = await fileToBase64(file);
        const mimeType = 'image/jpeg';
        const fullDataUrl = `data:${mimeType};base64,${base64}`;
        
        setOriginalImage(fullDataUrl);
        setAppState(AppState.READY_TO_GENERATE);

        estimateFloorArea(base64).then(area => {
          setAiEstimatedArea(area);
        });

      } catch (err) {
        console.error("File processing error", err);
        setError('Failed to process image. Please try again.');
        setAppState(AppState.IDLE);
      }
    }
  };

  const generateWithPrefs = async (img: string, prefs: UserPreferences, colorOverride: string) => {
    if (!img || !prefs) return;
    setAppState(AppState.GENERATING);
    setGeneratedImage(null); // Clear previous result to avoid stale/blank screens
    setError(null);

    const materialDescriptions: Record<string, string> = {
      'Ceramic': 'smooth, consistent ceramic texture',
      'Porcelain': 'dense, high-quality porcelain surface',
      'Marble': 'natural stone with distinct, elegant veining',
      'Slate': 'layered, natural stone texture with cleft surface',
      'Travertine': 'porous limestone texture with natural pits',
      'Wood Look': 'realistic wood grain texture on tile planks'
    };

    const materialDesc = materialDescriptions[prefs.material] || prefs.material;

    const prompt = `
      Replace the flooring in this ${prefs.roomType} with high-end ${colorOverride} ${prefs.material} flooring.
      Style: ${prefs.designStyle}.
      Material: ${prefs.material} (${materialDesc}).
      Finish: ${prefs.finish || 'Matte'}.
      Texture: Photorealistic, believable ${prefs.material} material suitable for interiors with a ${prefs.finish} look.
      Details: ${prefs.groutStyle} grout lines where appropriate.
      Maintain exact lighting, shadows, and perspective of the original room.
      Keep furniture and walls unchanged. High trust, architectural visualization quality.
    `;

    try {
      const base64Data = img.split(',')[1];
      const mimeType = img.split(';')[0].split(':')[1];
      const resultImage = await generateTilePreview(base64Data, prompt.trim(), mimeType);
      
      setGeneratedImage(resultImage);
      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      console.error(err);
      const errorString = err.message || String(err);
      let errorMessage = "AI is busy refining your design. Please try again.";
      
      if (errorString.includes("403") || errorString.includes("PERMISSION_DENIED")) {
         errorMessage = "Access Denied: The high-quality model requires a paid Google Cloud project key. We tried falling back to the standard model, but that also failed. Please ensure your API key has 'Generative AI' permissions enabled in the Google Cloud Console or try connecting a different key.";
      } else if (errorString.includes("500") || errorString.includes("XHR") || errorString.includes("Rpc") || errorString.includes("503")) {
          errorMessage = "Service Unavailable: The AI model is currently overloaded or the image is too large. Please try again in a moment.";
      }
      setError(errorMessage);
      setAppState(AppState.READY_TO_GENERATE);
    }
  };

  const handleColorSwitch = (color: string) => {
    setActiveColor(color);
    if (originalImage && userPrefs && generatedImage) {
      generateWithPrefs(originalImage, userPrefs, color);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `tilevision-design-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const scrollPalette = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
        const scrollAmount = 300; // Approx 3 items
        scrollContainerRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setAppState(AppState.ONBOARDING);
    setUserPrefs(null);
    setAiEstimatedArea(undefined);
  };

  if (appState === AppState.ONBOARDING) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="flex flex-col font-sans w-full max-w-[1600px] mx-auto animate-fade-in">
      
      <div className="flex justify-between items-center mb-6 px-4 md:px-8">
        <h2 className="font-serif text-3xl text-stone-900">AI Design Studio</h2>
        <button onClick={handleReset} className="text-sm uppercase tracking-widest font-semibold text-stone-500 hover:text-stone-900 transition-colors">
            Start New Project
        </button>
      </div>

      <div className="p-4 md:p-8 w-full bg-white rounded-3xl shadow-sm border border-stone-200">
        
        {/* Error Toast */}
        {error && (
          <div className="fixed top-24 right-8 bg-white text-red-900 px-6 py-4 rounded-lg border border-red-100 shadow-xl animate-fade-in flex items-center gap-3 z-50">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            <span className="font-medium">{error}</span>
            {error.includes("Access Denied") && onConnectApiKey && (
              <button
                onClick={onConnectApiKey}
                className="ml-4 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm font-medium transition-colors border border-red-200"
              >
                Update Key
              </button>
            )}
          </div>
        )}

        {!originalImage ? (
          // Premium Upload Area
          <div className="max-w-2xl mx-auto py-20 text-center animate-slide-up">
             <div className="mb-12 space-y-4">
               <h1 className="text-4xl md:text-5xl font-serif text-stone-900 leading-tight">
                 Your space, reimagined.<br/>
                 <span className="italic text-stone-500 text-3xl block mt-2">in {userPrefs?.designStyle} style</span>
               </h1>
             </div>

             <div 
               onClick={() => fileInputRef.current?.click()}
               className="relative overflow-hidden bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer hover:border-stone-400 hover:bg-white transition-all duration-500 group"
             >
               <div className="relative z-10">
                 <div className="w-20 h-20 bg-white border border-stone-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 text-stone-400 group-hover:text-stone-900 shadow-sm">
                   <Upload className="w-8 h-8" />
                 </div>
                 <span className="font-serif text-xl text-stone-900 block mb-2">Upload Room Photo</span>
                 <span className="text-stone-400 text-sm uppercase tracking-wider">High Resolution JPG or PNG</span>
               </div>
             </div>
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
          </div>
        ) : (
          // Main Workspace
          // Updated: flex-col-reverse for Mobile (Image top, Controls bottom), Grid for Desktop
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8 lg:h-[800px] h-auto">
            
            {/* Left Panel: Controls */}
            <div className="lg:col-span-3 space-y-6 lg:overflow-y-auto pr-4 custom-scrollbar">
              
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px bg-stone-200 flex-1" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">Tools</span>
                <div className="h-px bg-stone-200 flex-1" />
              </div>

              {/* Verified Badge */}
              {aiEstimatedArea && (
                  <div className="bg-stone-50 border border-stone-200 p-3 rounded-lg flex items-center gap-3">
                    <Scan className="w-4 h-4 text-stone-500" />
                    <span className="text-xs font-medium text-stone-600 uppercase tracking-wide">AI Scale: {aiEstimatedArea} sq ft</span>
                  </div>
               )}

              {/* Material Selection Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h3 className="font-serif text-lg text-stone-900">Palette</h3>
                    <div className="flex gap-2">
                        <button onClick={() => scrollPalette('left')} className="p-1 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-900 transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => scrollPalette('right')} className="p-1 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-900 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Categories Tabs - Strictly 2 Options */}
                <div className="flex bg-stone-100 p-1 rounded-lg">
                    {(['Recommended', 'All Others'] as const).map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`
                                flex-1 py-2 text-xs font-medium rounded-md transition-all duration-300
                                ${activeCategory === category 
                                    ? 'bg-white text-stone-900 shadow-sm' 
                                    : 'text-stone-500 hover:text-stone-700'}
                            `}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                
                {/* Horizontal Scroll Container (Filtered by Category) */}
                <div 
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-3 pb-4 pt-2 snap-x px-1 scrollbar-hide" 
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                   {dynamicPalette[activeCategory].map((color) => {
                     const bgHex = getColorHex(color);
                     const textColor = getContrastColor(bgHex);
                     return (
                       <button
                         key={color}
                         onClick={() => handleColorSwitch(color)}
                         disabled={appState === AppState.GENERATING}
                         className={`
                           flex-shrink-0 relative w-24 h-24 rounded-2xl transition-all duration-300 snap-start
                           flex flex-col items-center justify-center p-2 text-center shadow-sm group
                           ${activeColor === color 
                             ? 'ring-4 ring-stone-900 ring-offset-2 scale-105 z-10' 
                             : 'hover:scale-105 hover:shadow-md ring-1 ring-black/5'}
                         `}
                         style={{ backgroundColor: bgHex }}
                       >
                         <span className={`font-medium text-xs leading-tight ${textColor} break-words w-full line-clamp-2`}>
                            {color}
                         </span>
                         
                         {activeColor === color && (
                            <div className={`absolute top-2 right-2 ${textColor}`}>
                                <Check className="w-3 h-3" />
                            </div>
                         )}
                       </button>
                     );
                   })}
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">
                        {dynamicPalette[activeCategory].length} Shades Available
                    </p>
                </div>
              </div>

              <div className="h-px bg-stone-100 w-full" />

              {/* Material Selection */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg text-stone-900">Material</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Ceramic', 'Porcelain', 'Marble', 'Slate', 'Travertine', 'Wood Look'].map((m) => (
                      <button 
                        key={m} 
                        onClick={() => {
                          if(userPrefs) {
                            const newPrefs = {...userPrefs, material: m as any};
                            setUserPrefs(newPrefs);
                            if(generatedImage) generateWithPrefs(originalImage, newPrefs, activeColor);
                          }
                        }}
                        className={`text-xs py-3 px-2 rounded-lg border transition-all duration-300 font-medium uppercase tracking-wide ${userPrefs?.material === m ? 'border-stone-800 text-stone-900 bg-white shadow-sm' : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50'}`}
                      >
                        {m}
                      </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-stone-100 w-full" />

              {/* Finishes */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg text-stone-900">Finish</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Matte', 'Satin', 'Glossy', 'Natural'].map((f) => (
                      <button 
                        key={f} 
                        onClick={() => {
                          if(userPrefs) {
                            const newPrefs = {...userPrefs, finish: f as any};
                            setUserPrefs(newPrefs);
                            if(generatedImage) generateWithPrefs(originalImage, newPrefs, activeColor);
                          }
                        }}
                        className={`text-xs py-3 px-2 rounded-lg border transition-all duration-300 font-medium uppercase tracking-wide ${userPrefs?.finish === f ? 'border-stone-800 text-stone-900 bg-white shadow-sm' : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50'}`}
                      >
                        {f}
                      </button>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <CostEstimator estimatedArea={aiEstimatedArea} />
              </div>
              
            </div>

            {/* Main Preview Area */}
            <div className="lg:col-span-9 lg:h-full flex flex-col gap-6">
               {/* Updated: Added min-h-[400px] to ensure visibility on mobile where flex-grow might collapse */}
               <div className="relative flex-grow bg-stone-100 rounded-xl overflow-hidden shadow-inner group min-h-[400px] lg:min-h-0">
                 {appState === AppState.GENERATING && (
                   <div className="absolute inset-0 z-30 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center text-stone-900">
                     <div className="w-16 h-16 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mb-6" />
                     <p className="font-serif text-2xl animate-pulse">Designing your space...</p>
                   </div>
                 )}
                 
                 {/* Generate Button Overlay */}
                 {!generatedImage && appState !== AppState.GENERATING && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-stone-900/5 backdrop-blur-[1px]">
                         <button 
                            onClick={() => generateWithPrefs(originalImage, userPrefs!, activeColor)}
                            className="bg-stone-900 text-white px-10 py-4 rounded-full font-medium tracking-wide shadow-xl hover:bg-black transition-all transform hover:scale-105 flex items-center gap-3"
                         >
                            <Wand2 className="w-5 h-5" />
                            Render Visualization
                         </button>
                    </div>
                 )}

                 {generatedImage ? (
                   <ComparisonSlider beforeImage={originalImage} afterImage={generatedImage} />
                 ) : (
                   <img src={originalImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                 )}

                 {/* Action Overlay */}
                 {generatedImage && (
                    <div className="absolute bottom-6 right-6 flex gap-3 z-20">
                      <button 
                        onClick={handleDownload}
                        className="bg-white text-stone-900 p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
                        title="Download Design"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button className="bg-stone-900 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110">
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>
                 )}
               </div>

               <div className="flex justify-between items-center text-stone-400 text-sm font-medium uppercase tracking-widest px-1">
                  <div>TileVision AI 2.5</div>
                  {generatedImage && (
                    <button 
                      onClick={() => generateWithPrefs(originalImage, userPrefs!, activeColor)}
                      className="text-stone-900 hover:text-accent transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Regenerate
                    </button>
                  )}
               </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};