import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { ArrowRight, Sparkles, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: (prefs: UserPreferences) => void;
}

const STEPS = [
  {
    id: 'room',
    title: "The Space",
    subtitle: "What type of room are we transforming?",
    options: ["Living Room", "Master Bedroom", "Gourmet Kitchen", "Spa Bathroom", "Home Office", "Showroom"]
  },
  {
    id: 'style',
    title: "The Aesthetic",
    subtitle: "Define the mood of your new interior.",
    options: ["Modern Minimalist", "Warm Luxury", "Rustic Traditional", "Industrial Chic", "Scandinavian"]
  },
  {
    id: 'colors',
    title: "The Palette",
    subtitle: "Select the primary tone for your flooring.",
    options: [] as string[] // Dynamic
  }
];

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

// Helper to map names to hex codes (Duplicate to ensure self-containment for onboarding)
const getColorHex = (name: string) => {
  const map: Record<string, string> = {
    'Cool Grey': '#9ca3af', 'Arctic White': '#f9fafb', 'Matte Black': '#171717', 'Taupe': '#b0a696', 'Slate': '#64748b',
    'Charcoal': '#374151', 'Silver': '#e5e7eb', 'Dove Grey': '#d1d5db', 'Midnight Blue': '#1e3a8a', 'Cement': '#9ca3af',
    'Warm Beige': '#e8dec8', 'Crema Marfil': '#f5f5dc', 'Rich Walnut': '#5d4037', 'Champagne': '#fad6a5', 'Honey Oak': '#d4a017',
    'Gold Vein': '#ffd700', 'Ivory': '#fffff0', 'Espresso': '#4e342e', 'Travertine': '#eecfa1', 'Mocha': '#a0522d',
    'Terracotta': '#e2725b', 'Natural Stone': '#8b8589', 'Warm Oak': '#cd853f', 'Antique Grey': '#78716c', 'Olive': '#808000',
    'Sandstone': '#d2b48c', 'Brick Red': '#cb4154', 'Mahogany': '#c04000', 'Forest Green': '#228b22', 'Amber': '#ffbf00',
    'Polished Concrete': '#b0c4de', 'Raw Steel': '#71797e', 'Weathered Wood': '#deb887',
    'Rust': '#b7410e', 'Gunmetal': '#2a3439', 'Aged Bronze': '#cd7f32', 'Iron': '#434b4d', 'Distressed Leather': '#8b4513',
    'Light Ash': '#f5f5f5', 'Pale Birch': '#f6ead1', 'Soft White': '#f8f8ff', 'Muted Sage': '#9caf88', 'Blush': '#ffb6c1',
    'Mint': '#98ff98', 'Cloud Blue': '#b0e0e6', 'Peach': '#ffdab9', 'Frost': '#e0ffff', 'Light Pine': '#fbf8e6',
    'Beige': '#f5f5dc', 'Grey': '#808080', 'White': '#ffffff', 'Black': '#000000'
  };
  return map[name] || '#ffffff';
};

const getContrastColor = (hex: string) => {
    if (!hex) return 'text-stone-900';
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128 ? 'text-stone-900' : 'text-white';
};

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<Partial<UserPreferences>>({
    groutStyle: 'Seamless',
    finish: 'Matte',
    material: 'Porcelain'
  });

  const handleOptionSelect = (option: string) => {
    const currentStepId = STEPS[step].id;
    let newPrefs = { ...prefs };

    if (currentStepId === 'room') newPrefs.roomType = option;
    if (currentStepId === 'style') newPrefs.designStyle = option;
    if (currentStepId === 'colors') newPrefs.colorPalette = [option];

    setPrefs(newPrefs);

    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(newPrefs as UserPreferences);
    }
  };

  // Dynamically get options
  const currentStepDef = STEPS[step];
  let currentOptions = currentStepDef.options;

  if (currentStepDef.id === 'colors' && prefs.designStyle) {
    currentOptions = STYLE_COLOR_MAP[prefs.designStyle] || ["Beige", "Grey", "White", "Black"];
  }

  const isColorStep = currentStepDef.id === 'colors';

  return (
    <div className="relative w-full max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 opacity-50">
        <Sparkles className="w-12 h-12 text-stone-200" />
      </div>

      <div className="text-center mb-16 space-y-3">
         <span className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase">Step {step + 1} of {STEPS.length}</span>
         <h2 className="text-5xl font-serif text-stone-900 leading-tight">{currentStepDef.title}</h2>
         <p className="text-xl text-stone-500 font-light">{currentStepDef.subtitle}</p>
      </div>

      <div className={`grid gap-6 w-full ${isColorStep ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {currentOptions.map((option, idx) => {
          const bgHex = isColorStep ? getColorHex(option) : '#ffffff';
          const textColor = isColorStep ? getContrastColor(bgHex) : 'text-stone-700';
          const borderColor = isColorStep ? 'border-transparent' : 'border-stone-100';

          return (
            <button
              key={option}
              onClick={() => handleOptionSelect(option)}
              className={`
                group relative p-8 shadow-sm hover:shadow-xl rounded-xl transition-all duration-300 text-left hover:-translate-y-1 overflow-hidden
                ${isColorStep ? 'h-40 flex flex-col justify-end' : 'bg-white border'}
                ${borderColor}
              `}
              style={isColorStep ? { backgroundColor: bgHex } : {}}
            >
              {!isColorStep && (
                <div className="absolute inset-0 bg-gradient-to-br from-white to-stone-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              
              <div className="relative z-10 flex justify-between items-center w-full">
                  <span className={`font-serif text-xl ${textColor} ${!isColorStep && 'group-hover:text-stone-900 group-hover:italic transition-colors'}`}>
                    {option}
                  </span>
                  {!isColorStep && (
                    <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-accent transform group-hover:translate-x-1 transition-all" />
                  )}
                  {isColorStep && (
                    <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${textColor}`}>
                       <Check className="w-5 h-5" />
                    </div>
                  )}
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-12 flex justify-center">
        {step > 0 && (
            <button 
                onClick={() => setStep(step - 1)}
                className="text-stone-400 hover:text-stone-600 text-sm font-medium tracking-wide uppercase transition-colors"
            >
                Back to previous step
            </button>
        )}
      </div>

      {/* Progress Dots */}
      <div className="fixed bottom-10 left-0 right-0 flex justify-center gap-3">
        {STEPS.map((_, idx) => (
          <div 
            key={idx} 
            className={`w-2 h-2 rounded-full transition-all duration-500 ${idx === step ? 'bg-stone-800 scale-125' : 'bg-stone-300'}`} 
          />
        ))}
      </div>
    </div>
  );
};