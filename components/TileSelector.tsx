import React from 'react';
import { TileStyle } from '../types';
import { Check } from './Icons';

interface TileSelectorProps {
  selectedId: string | null;
  onSelect: (style: TileStyle) => void;
}

const TILE_STYLES: TileStyle[] = [
  {
    id: 'marble-white',
    name: 'Carrara Marble',
    description: 'Luxurious white marble with soft grey veining.',
    prompt: 'Change the flooring to high-gloss white Carrara marble tiles with subtle grey veins.',
    thumbnailColor: 'bg-slate-100',
  },
  {
    id: 'wood-herringbone',
    name: 'Oak Herringbone',
    description: 'Classic warm oak wood arranged in a herringbone pattern.',
    prompt: 'Change the floor to warm oak wood flooring laid in a classic herringbone pattern.',
    thumbnailColor: 'bg-amber-700',
  },
  {
    id: 'slate-grey',
    name: 'Dark Slate',
    description: 'Modern, large-format dark grey slate tiles.',
    prompt: 'Replace the floor with large-format dark grey slate tiles with a matte finish.',
    thumbnailColor: 'bg-slate-700',
  },
  {
    id: 'terracotta',
    name: 'Rustic Terracotta',
    description: 'Warm, earthy reddish-brown clay tiles.',
    prompt: 'Change the flooring to rustic, square terracotta tiles with wide grout lines.',
    thumbnailColor: 'bg-orange-700',
  },
  {
    id: 'checkerboard',
    name: 'Checkerboard',
    description: 'Classic black and white vinyl or ceramic tile.',
    prompt: 'Change the floor to a classic black and white checkerboard tile pattern.',
    thumbnailColor: 'bg-slate-900', // CSS gradient technically better but keeping simple for this prop
  },
  {
    id: 'geometric-blue',
    name: 'Blue Geometric',
    description: 'Artistic Moroccan-style blue and white geometric tiles.',
    prompt: 'Change the floor to intricate blue and white Moroccan geometric patterned tiles.',
    thumbnailColor: 'bg-blue-600',
  },
];

export const TileSelector: React.FC<TileSelectorProps> = ({ selectedId, onSelect }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
        Choose a Style Preset
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {TILE_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style)}
            className={`
              relative group flex flex-col items-start p-3 rounded-xl border-2 transition-all duration-200
              hover:shadow-md text-left
              ${selectedId === style.id 
                ? 'border-accent bg-blue-50/50' 
                : 'border-slate-200 bg-white hover:border-slate-300'}
            `}
          >
            <div className={`w-full h-12 rounded-lg mb-3 ${style.thumbnailColor} shadow-inner opacity-90`} />
            
            <span className="font-semibold text-slate-900 text-sm">
              {style.name}
            </span>
            <span className="text-xs text-slate-500 mt-1 line-clamp-2">
              {style.description}
            </span>

            {selectedId === style.id && (
              <div className="absolute top-2 right-2 bg-accent text-white rounded-full p-1 shadow-sm">
                <Check className="w-3 h-3" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};