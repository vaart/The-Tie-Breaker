import React from 'react';
import { History, Plus, FileDown } from 'lucide-react';
import { DecisionAnalysis } from '../types.ts';

interface HeaderProps {
  currentDecision: DecisionAnalysis | null;
  savedCount: number;
  onNewDecision: () => void;
  onOpenHistory: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDecision,
  savedCount,
  onNewDecision,
  onOpenHistory,
  onOpenExport,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <div 
            id="brand-logo"
            onClick={onNewDecision}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#D4AF37] rounded-sm flex items-center justify-center relative shadow-[0_0_15px_rgba(212,175,55,0.25)] group-hover:scale-105 transition-transform duration-200">
              <div className="w-4 sm:w-5 h-[2px] bg-[#0A0A0A] rotate-45 absolute" />
              <div className="w-4 sm:w-5 h-[2px] bg-[#0A0A0A] -rotate-45 absolute" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-2xl font-serif italic tracking-tight text-[#D4AF37]">
                  The Tie Breaker
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-white/10 text-white/70 border border-white/10">
                  Выбор без сомнений
                </span>
              </div>
              <p className="text-[11px] text-white/45 font-light hidden sm:block tracking-wide">
                Взвешенные за и против • Сравнение вариантов • Четкий совет
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentDecision && (
              <>
                <button
                  id="btn-export-decision"
                  onClick={onOpenExport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold uppercase tracking-wider rounded-md border border-white/20 text-white/80 hover:text-white hover:bg-white/5 hover:border-white/40 transition-colors"
                  title="Экспорт отчета о решении"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="hidden sm:inline">Экспорт</span>
                </button>
                <button
                  id="btn-new-decision"
                  onClick={onNewDecision}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold uppercase tracking-wider rounded-md text-[#0A0A0A] bg-[#D4AF37] hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Новый выбор</span>
                </button>
              </>
            )}

            <button
              id="btn-open-history"
              onClick={onOpenHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold uppercase tracking-wider rounded-md text-white/80 hover:text-[#D4AF37] hover:bg-white/5 border border-white/15 hover:border-[#D4AF37]/40 transition-colors relative"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">История</span>
              {savedCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold font-mono text-[#0A0A0A] bg-[#D4AF37] rounded-full">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

