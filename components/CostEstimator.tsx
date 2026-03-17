import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { CostConfig } from '../types';

interface CostEstimatorProps {
  estimatedArea?: number;
}

export const CostEstimator: React.FC<CostEstimatorProps> = ({ estimatedArea }) => {
  const [config, setConfig] = useState<CostConfig>({
    areaSqFt: 250,
    pricePerSqFt: 145, // Updated default for INR
    wastagePercent: 10
  });

  // Update config when AI estimation comes in
  useEffect(() => {
    if (estimatedArea) {
      setConfig(prev => ({ ...prev, areaSqFt: estimatedArea }));
    }
  }, [estimatedArea]);

  const totalCost = (config.areaSqFt * config.pricePerSqFt) * (1 + config.wastagePercent / 100);

  // Formatter for Indian Rupee
  const formatRupee = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-3 text-stone-800 border-b border-stone-100 pb-4">
        <div className="p-2 bg-stone-50 rounded-lg">
           <Calculator className="w-4 h-4 text-stone-600" />
        </div>
        <h3 className="font-serif text-lg tracking-tight">Cost Estimation</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center group">
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Area (sq ft)</label>
          <input 
            type="number" 
            value={config.areaSqFt}
            onChange={(e) => setConfig({...config, areaSqFt: Number(e.target.value)})}
            className="w-24 text-right bg-transparent border-b border-stone-200 focus:border-stone-800 outline-none font-medium text-stone-800 transition-colors"
          />
        </div>
        
        <div className="flex justify-between items-center group">
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Price / sq ft</label>
            <div className="flex items-center justify-end w-28 border-b border-stone-200 focus-within:border-stone-800 transition-colors">
                <span className="text-stone-400 mr-1">₹</span>
                <input 
                type="number" 
                value={config.pricePerSqFt}
                onChange={(e) => setConfig({...config, pricePerSqFt: Number(e.target.value)})}
                className="w-full text-right bg-transparent outline-none font-medium text-stone-800"
                />
            </div>
        </div>
      </div>

      <div className="pt-4 mt-2 border-t border-stone-50 flex items-end justify-between">
        <div className="flex flex-col">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Estimated Total</span>
            <span className="text-xs text-stone-400">Incl. {config.wastagePercent}% wastage</span>
        </div>
        <span className="font-serif text-3xl text-stone-900">{formatRupee(totalCost)}</span>
      </div>
    </div>
  );
};