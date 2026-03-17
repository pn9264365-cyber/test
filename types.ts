export interface TileStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  thumbnailColor: string;
}

export type TileMaterial = 'Ceramic' | 'Porcelain' | 'Marble' | 'Slate' | 'Travertine' | 'Wood Look';

export interface UserPreferences {
  roomType: string;
  designStyle: string;
  colorPalette: string[]; // e.g., ['Beige', 'Grey']
  groutStyle: 'Seamless' | 'Standard' | 'Wide';
  finish: 'Matte' | 'Satin' | 'Glossy' | 'Natural';
  material: TileMaterial;
}

export interface CostConfig {
  areaSqFt: number;
  pricePerSqFt: number;
  wastagePercent: number;
}

export enum AppState {
  ONBOARDING = 'ONBOARDING',
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  READY_TO_GENERATE = 'READY_TO_GENERATE',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
}

// --- New Informational Types ---

export type PageView = 'HOME' | 'COLLECTIONS' | 'JOURNAL' | 'VISUALIZER' | 'CART';

export interface TileGuide {
  id: string;
  name: string;
  category: string;
  description: string;
  bestFor: string[]; // e.g. ["Bathrooms", "High Traffic"]
  colorAdvice: string; // "Lighter shades expand space..."
  properties: string[]; // "Non-porous", "Anti-skid"
}

export interface CartItem extends TileGuide {
  // Keeping cart item for compatibility but functionality will be reduced
  quantity: number; 
}