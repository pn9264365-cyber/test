import React, { useState, useEffect } from 'react';
import { VisualizerTool } from './components/VisualizerTool';
import { Navbar, Hero, TileInfoGrid, Journal } from './components/StoreComponents';
import { PageView, TileGuide } from './types';
import { Lock, ArrowRight } from 'lucide-react';

// Knowledge Base Data (No Images, No Prices)
const TILE_GUIDES: TileGuide[] = [
  { 
    id: '1', 
    name: 'Porcelain Tiles', 
    category: 'Vitrified', 
    description: 'Denser and less porous than ceramic, porcelain is the gold standard for durability.',
    bestFor: ['High Traffic Areas', 'Bathrooms', 'Outdoors'],
    colorAdvice: 'Opt for neutral Greys or Charcoals to hide dust in busy areas. White porcelain creates a sterile, spa-like bathroom look.',
    properties: ['Water Resistant', 'Scratch Proof', 'Frost Resistant']
  },
  { 
    id: '2', 
    name: 'Ceramic Tiles', 
    category: 'Clay Based', 
    description: 'A cost-effective option available in endless patterns. Softer than porcelain, making it easier to cut.',
    bestFor: ['Kitchen Backsplashes', 'Low Traffic Walls', 'Guest Bathrooms'],
    colorAdvice: 'Terracotta and warm Beiges bring a rustic, earthy feel. Bright glazed colors work best as accents.',
    properties: ['Cost Effective', 'Easy Installation', 'Wide Variety']
  },
  { 
    id: '3', 
    name: 'Italian Marble', 
    category: 'Natural Stone', 
    description: 'The epitome of luxury. Requires maintenance but offers unmatched natural beauty and cooling properties.',
    bestFor: ['Living Rooms', 'Master Bedrooms', 'Hotel Lobbies'],
    colorAdvice: 'Carrara (White/Grey) reflects light, making rooms feel massive. Botticino (Beige) adds warmth to large halls.',
    properties: ['High Gloss', 'Unique Veining', 'Porous (Needs Sealing)']
  },
  { 
    id: '4', 
    name: 'Mosaic Tiles', 
    category: 'Decorative', 
    description: 'Small tile pieces on a mesh backing, perfect for curved surfaces and intricate designs.',
    bestFor: ['Shower Floors', 'Pools', 'Feature Walls'],
    colorAdvice: 'Mix metallic golds with deep Blues for a luxury pool look. Monochromatic white mosaics add texture without noise.',
    properties: ['Anti-Slip (Grout lines)', 'Flexible Application', 'Decorative']
  },
  { 
    id: '5', 
    name: 'Wooden Planks (GVT)', 
    category: 'Vitrified', 
    description: 'Glazed Vitrified Tiles printed with high-def wood grains. The warmth of wood with the durability of stone.',
    bestFor: ['Bedrooms', 'Balconies', 'Wet Areas'],
    colorAdvice: 'Light Oak opens up small bedrooms. Dark Walnut adds richness but requires good lighting.',
    properties: ['Termite Proof', 'Waterproof', 'No Maintenance']
  },
  { 
    id: '6', 
    name: 'Granite', 
    category: 'Natural Stone', 
    description: 'An igneous rock that is incredibly hard and resistant to heat and scratches.',
    bestFor: ['Kitchen Countertops', 'Staircases', 'Exterior Cladding'],
    colorAdvice: 'Black Galaxy offers a premium, starry look. Tan Brown is excellent for hiding stains in kitchens.',
    properties: ['Heat Resistant', 'Hardest Stone', 'Bacteria Resistant']
  },
  { 
    id: '7', 
    name: 'Travertine', 
    category: 'Limestone', 
    description: 'A form of limestone deposited by mineral springs, characterized by pitted holes and troughs.',
    bestFor: ['Patios', 'Pool Decks', 'Rustic Living Rooms'],
    colorAdvice: 'Cream and Beige tones blend seamlessly with outdoor landscaping.',
    properties: ['Cool to Touch', 'Non-Slip Texture', 'Rustic Aesthetic']
  },
  { 
    id: '8', 
    name: 'Onyx', 
    category: 'Exotic Stone', 
    description: 'A translucent, semi-precious stone often backlit for dramatic effect.',
    bestFor: ['Bar Counters', 'Feature Walls', 'Powder Rooms'],
    colorAdvice: 'Honey and Green Onyx are translucent; lighting them from behind creates a glowing, amber effect.',
    properties: ['Translucent', 'Fragile', 'Ultra Luxury']
  },
];

const ApiKeyGate: React.FC<{ onConnect: () => void }> = ({ onConnect }) => (
  <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 font-sans text-stone-900">
    <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl p-10 shadow-xl text-center">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-stone-800" />
        </div>
        <h1 className="font-serif text-3xl text-stone-900 mb-4">Access Required</h1>
        <p className="text-stone-500 mb-8 leading-relaxed">
            To generate high-fidelity 3D visualisations using Gemini 3 Pro, please connect your API key.
        </p>
        
        <button 
            onClick={onConnect}
            className="w-full bg-stone-900 text-white py-4 rounded-xl font-medium tracking-wide hover:bg-black transition-all flex items-center justify-center gap-2 mb-6"
        >
            Connect Google API Key <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-xs text-stone-400">
            A paid project is required. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-600">View billing documentation</a>.
        </p>
    </div>
  </div>
);

export default function App() {
  const [activePage, setActivePage] = useState<PageView>('HOME');
  const [hasAccess, setHasAccess] = useState(false);

  // Check for API key on mount
  useEffect(() => {
    const checkAccess = async () => {
        // 1. Check if the environment variable is already present (Standard deployment)
        // Ensure it's not the literal string "undefined" or empty
        const envKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
        if (envKey && envKey !== "undefined" && envKey !== "") {
            setHasAccess(true);
            return;
        }

        // 2. Check if running in a Google AI Studio environment (IDX, Cloud Shell)
        if ((window as any).aistudio && typeof (window as any).aistudio.hasSelectedApiKey === 'function') {
            const selected = await (window as any).aistudio.hasSelectedApiKey();
            if (selected) {
                setHasAccess(true);
            }
        }
    };
    checkAccess();
  }, []);

  const handleConnect = async () => {
      // 1. If key is missing, try the UI method
      if ((window as any).aistudio) {
          try {
            await (window as any).aistudio.openSelectKey();
            // Re-check after selection attempt
            if (await (window as any).aistudio.hasSelectedApiKey()) {
                setHasAccess(true);
            }
          } catch (e) {
             console.error("API Key selection cancelled or failed", e);
          }
      } else {
        // Fallback for when window.aistudio isn't available but user thinks they clicked connect
        // This alerts them to configuration issues
        console.warn("Google AI Studio environment not detected. Please ensure process.env.API_KEY is configured in your deployment settings.");
      }
  };

  if (!hasAccess) {
      return <ApiKeyGate onConnect={handleConnect} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-200">
      
      <Navbar 
        activePage={activePage} 
        onNavigate={setActivePage} 
      />

      <main>
        {activePage === 'HOME' && (
          <div className="animate-fade-in">
            <Hero onCta={() => setActivePage('VISUALIZER')} />
            <div className="pt-20">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-serif text-stone-900 mb-4">Material Intelligence</h2>
                    <p className="text-stone-500 max-w-xl mx-auto">Expert guidance on selecting the perfect surface for your needs.</p>
                </div>
                <TileInfoGrid guides={TILE_GUIDES.slice(0, 4)} />
            </div>
            <Journal />
          </div>
        )}

        {activePage === 'COLLECTIONS' && (
          <div className="animate-fade-in pt-12">
            <div className="text-center mb-12 px-6">
                <h1 className="text-5xl font-serif text-stone-900 mb-4">The Material Guide</h1>
                <p className="text-stone-500 max-w-xl mx-auto">A comprehensive encyclopedia of flooring types, properties, and aesthetic applications. No images, just pure design intelligence.</p>
            </div>
            <TileInfoGrid guides={TILE_GUIDES} />
          </div>
        )}

        {activePage === 'VISUALIZER' && (
          <div className="py-12 animate-fade-in">
             <VisualizerTool onConnectApiKey={handleConnect} />
          </div>
        )}

        {activePage === 'JOURNAL' && (
          <div className="animate-fade-in pt-12">
              <Journal />
          </div>
        )}
      </main>

      <footer className="bg-stone-50 border-t border-stone-200 py-12 text-center text-stone-400 text-sm">
        <p>&copy; 2024 TileVision Interiors. All rights reserved.</p>
      </footer>
    </div>
  );
}