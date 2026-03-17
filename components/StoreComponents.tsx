import React, { useState } from 'react';
import { ArrowRight, Info, CheckCircle2, Palette, ChevronDown, ChevronUp } from 'lucide-react';
import { TileGuide, PageView } from '../types';

export const Navbar: React.FC<{ 
  onNavigate: (page: PageView) => void; 
  activePage: PageView; 
}> = ({ onNavigate, activePage }) => (
  <nav className="sticky top-0 z-50 bg-[#F5F2EB]/90 backdrop-blur-md border-b border-stone-200">
    <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
      
      {/* Logo */}
      <button onClick={() => onNavigate('HOME')} className="text-2xl font-serif font-bold tracking-tight text-stone-900">
        TileVision<span className="text-accent">.</span>
      </button>

      {/* Links */}
      <div className="hidden md:flex items-center gap-10">
        <button onClick={() => onNavigate('HOME')} className={`text-sm tracking-wide font-medium transition-colors ${activePage === 'HOME' ? 'text-stone-900' : 'text-stone-500 hover:text-stone-800'}`}>Home</button>
        <button onClick={() => onNavigate('COLLECTIONS')} className={`text-sm tracking-wide font-medium transition-colors ${activePage === 'COLLECTIONS' ? 'text-stone-900' : 'text-stone-500 hover:text-stone-800'}`}>Tile Guide</button>
        <button onClick={() => onNavigate('VISUALIZER')} className={`text-sm tracking-wide font-medium transition-colors ${activePage === 'VISUALIZER' ? 'text-stone-900' : 'text-stone-500 hover:text-stone-800'}`}>AI Studio</button>
        <button onClick={() => onNavigate('JOURNAL')} className={`text-sm tracking-wide font-medium transition-colors ${activePage === 'JOURNAL' ? 'text-stone-900' : 'text-stone-500 hover:text-stone-800'}`}>Notes</button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button onClick={() => onNavigate('VISUALIZER')} className="text-xs font-bold uppercase tracking-widest border border-stone-300 px-4 py-2 rounded-full hover:bg-stone-900 hover:text-white transition-colors">
            Try AI
        </button>
      </div>
    </div>
  </nav>
);

export const Hero: React.FC<{ onCta: () => void }> = ({ onCta }) => (
  <div className="relative w-full h-[600px] flex items-center overflow-hidden">
    <div className="absolute inset-0 z-0">
        {/* Subtle pattern background instead of photo */}
        <div className="absolute inset-0 bg-[#F5F2EB]"></div>
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#2C2A26 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
    </div>
    <div className="relative z-10 max-w-[1600px] mx-auto px-6 w-full text-center md:text-left">
        <div className="max-w-3xl space-y-8 animate-slide-up">
            <span className="text-stone-600 font-medium tracking-widest text-xs uppercase">Intelligent Surfaces</span>
            <h1 className="text-6xl md:text-8xl font-serif text-stone-900 leading-[0.9]">
                The Science<br/> 
                <span className="italic font-light text-stone-700">of Flooring.</span>
            </h1>
            <p className="text-xl text-stone-600 max-w-lg leading-relaxed">
                A definitive guide to materials, colors, and spatial dynamics. 
                Understand what goes under your feet before you buy.
            </p>
            <div className="flex gap-4 pt-4 justify-center md:justify-start">
                <button onClick={onCta} className="bg-stone-900 text-stone-50 px-8 py-4 rounded-full font-medium tracking-wide hover:bg-black transition-all hover:px-10 flex items-center gap-2">
                    Start Visualization <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
  </div>
);

// Purely Informational Grid - No Images, No Prices
export const TileInfoGrid: React.FC<{ guides: TileGuide[] }> = ({ guides }) => (
  <section className="py-12 px-6 max-w-[1600px] mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {guides.map((guide) => (
            <div key={guide.id} className="bg-white border border-stone-200 p-8 rounded-xl hover:shadow-md transition-shadow flex flex-col gap-6">
                
                {/* Header */}
                <div className="border-b border-stone-100 pb-4">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block">{guide.category}</span>
                    <h3 className="text-3xl font-serif text-stone-900">{guide.name}</h3>
                </div>

                {/* Description */}
                <p className="text-stone-600 leading-relaxed text-lg font-light">
                    {guide.description}
                </p>

                {/* Properties Tags */}
                <div className="flex flex-wrap gap-2">
                    {guide.properties.map((prop, i) => (
                        <span key={i} className="bg-stone-50 text-stone-600 px-3 py-1 rounded-full text-xs font-medium border border-stone-100">
                            {prop}
                        </span>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-auto bg-stone-50 rounded-lg p-5">
                    
                    {/* Color Advice */}
                    <div className="flex gap-3">
                        <div className="mt-1"><Palette className="w-5 h-5 text-accent" /></div>
                        <div>
                            <h4 className="font-bold text-stone-900 text-sm mb-1 uppercase tracking-wide">Color Strategy</h4>
                            <p className="text-sm text-stone-500 leading-relaxed">{guide.colorAdvice}</p>
                        </div>
                    </div>

                    {/* Application */}
                    <div className="flex gap-3">
                        <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-stone-800" /></div>
                        <div>
                            <h4 className="font-bold text-stone-900 text-sm mb-1 uppercase tracking-wide">Ideal For</h4>
                            <ul className="text-sm text-stone-500">
                                {guide.bestFor.map((item, i) => <li key={i}>• {item}</li>)}
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        ))}
    </div>
  </section>
);

export const Journal: React.FC = () => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const ARTICLES = [
        { 
            title: "Ceramic vs. Vitrified", 
            cat: "Comparative Analysis", 
            desc: "Understanding porosity levels and why absorption rates matter for longevity.",
            brief: "Ceramic tiles are made of clay and kiln-fired. They remain slightly porous (3-4% water absorption), making them suitable for low-traffic indoor areas but prone to cracking under heavy loads. Vitrified tiles undergo a process called vitrification (melting silica and clay), creating a glass-like element inside the tile. This results in near-zero porosity (<0.05% absorption). For living rooms and commercial spaces, Vitrified is the superior choice due to its strength, stain resistance, and inability to harbor bacteria."
        },
        { 
            title: "Grout Selection Guide", 
            cat: "Installation", 
            desc: "Epoxy vs. Cement grout. Why Epoxy is essential for wet areas despite the cost.",
            brief: "Cement grout is porous and absorbs dirt, oils, and water, leading to discoloration over time. It requires sealing every year. Epoxy grout is made from epoxy resins and a filler powder. It is chemically resistant, completely waterproof, and stain-proof. While it costs 3x more and is harder to apply, it is essential for bathrooms and kitchens where hygiene is paramount. It ensures your tile joints remain pristine white (or colored) for decades."
        },
        { 
            title: "Rectified vs. Non-Rectified", 
            cat: "Specifications", 
            desc: "How edge finishing affects the final look and grout line width.",
            brief: "Non-rectified (pressed) tiles have slightly uneven, natural edges that require wider grout lines (3-5mm) to hide imperfections. Rectified tiles are mechanically cut after firing to exact dimensions with sharp, 90-degree edges. This allows for 'seamless' installation with minimal 1.5mm or 2mm grout joints. If you want a continuous, slab-like floor appearance, always specify rectified tiles."
        }
    ];

    return (
        <section className="py-24 px-6 max-w-[1600px] mx-auto bg-white my-12 rounded-3xl">
            <div className="text-center mb-16 max-w-2xl mx-auto">
                <span className="text-stone-500 uppercase tracking-widest text-xs font-bold mb-4 block">Knowledge Base</span>
                <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6">Technical Notes</h2>
                <p className="text-stone-600 leading-relaxed">Deep dives into material science and installation dynamics.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {ARTICLES.map((article, i) => (
                    <div key={i} className={`group bg-stone-50 p-8 rounded-xl border border-stone-100 transition-all duration-300 ${expandedIndex === i ? 'shadow-md ring-1 ring-stone-200' : 'hover:bg-stone-100'}`}>
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 block">{article.cat}</span>
                        <h3 className="text-2xl font-serif text-stone-900 mb-4">{article.title}</h3>
                        <p className="text-stone-500 text-sm leading-relaxed mb-6">{article.desc}</p>
                        
                        {expandedIndex === i && (
                            <div className="animate-fade-in border-t border-stone-200 pt-6 mb-6">
                                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wide mb-2">Technical Brief</h4>
                                <p className="text-stone-600 text-sm leading-relaxed">{article.brief}</p>
                            </div>
                        )}

                        <button 
                            onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                            className="flex items-center gap-2 text-stone-900 font-medium text-sm hover:text-accent transition-colors"
                        >
                            {expandedIndex === i ? (
                                <>Close Analysis <ChevronUp className="w-4 h-4" /></>
                            ) : (
                                <>Read Analysis <ChevronDown className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};