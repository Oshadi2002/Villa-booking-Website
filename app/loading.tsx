'use client';

import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#14231B] text-[#F5F2EB] select-none">
      {/* Background radial gold glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm">
        {/* Animated Gold Crest */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37]/40 flex items-center justify-center animate-spin [animation-duration:8s]">
            <div className="w-16 h-16 rounded-full border border-[#D4AF37]/60 border-dashed" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-[#D4AF37]">
            <Compass className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        {/* Brand Title */}
        <span className="text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-[#D4AF37] mb-1.5 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
          <span>The Sinharaja Collection</span>
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
        </span>

        <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#F5F2EB] mb-2">
          Lankagama Sanctuary
        </h2>

        <p className="text-xs text-[#C2BCB0] font-light mb-6 tracking-wide">
          දත්ත සූදානම් වෙමින් පවතී • Loading sanctuary stays...
        </p>

        {/* Elegant Gold Shimmer Progress Line */}
        <div className="w-48 h-1 rounded-full bg-[#1E2A22] overflow-hidden border border-[#3B5244]/80">
          <div className="h-full w-full bg-gradient-to-r from-[#2C3E33] via-[#D4AF37] to-[#2C3E33] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
