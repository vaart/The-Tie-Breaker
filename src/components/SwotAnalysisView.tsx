import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Zap, 
  Compass,
  CheckCircle2
} from 'lucide-react';
import { DecisionAnalysis } from '../types.ts';

interface SwotAnalysisViewProps {
  decision: DecisionAnalysis;
}

export const SwotAnalysisView: React.FC<SwotAnalysisViewProps> = ({ decision }) => {
  const { options, swotAnalyses } = decision;
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    swotAnalyses[0]?.optionId || options[0]?.id || ''
  );

  const currentSwot = swotAnalyses.find((s) => s.optionId === selectedOptionId) || swotAnalyses[0];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Option Selector Tabs */}
      <div className="bg-[#141414] rounded-lg border border-white/10 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-sm bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">SWOT-анализ вариантов</h3>
            <p className="text-[11px] text-white/40 font-light">Сильные и слабые стороны, возможности и угрозы</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#0A0A0A] border border-white/10 rounded-md overflow-x-auto">
          {options.map((opt, i) => (
            <button
              key={opt.id}
              onClick={() => setSelectedOptionId(opt.id)}
              className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all ${
                selectedOptionId === opt.id
                  ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {i === 0 ? 'Вариант А' : i === 1 ? 'Вариант Б' : i === 2 ? 'Вариант В' : `Вариант ${i + 1}`}: {opt.title}
            </button>
          ))}
        </div>
      </div>

      {currentSwot ? (
        <div className="space-y-5">
          {/* 2x2 SWOT Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Strengths */}
            <div className="bg-[#141414] rounded-lg border border-emerald-500/25 shadow-sm overflow-hidden flex flex-col">
              <div className="p-3.5 bg-[#181818] border-b border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Сильные стороны (Strengths)</h4>
                    <p className="text-[10px] text-white/40 font-light">Внутренние преимущества и ваши козыри</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  {currentSwot.swot.strengths.length}
                </span>
              </div>

              <div className="p-3.5 sm:p-4 space-y-2 flex-1">
                {currentSwot.swot.strengths.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-md bg-[#0A0A0A] border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-white/90 font-light leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="bg-[#141414] rounded-lg border border-rose-500/25 shadow-sm overflow-hidden flex flex-col">
              <div className="p-3.5 bg-[#181818] border-b border-rose-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-sm bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400">Слабые стороны (Weaknesses)</h4>
                    <p className="text-[10px] text-white/40 font-light">Внутренние уязвимости и ограничения</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400">
                  {currentSwot.swot.weaknesses.length}
                </span>
              </div>

              <div className="p-3.5 sm:p-4 space-y-2 flex-1">
                {currentSwot.swot.weaknesses.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-md bg-[#0A0A0A] border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-2" />
                    <p className="text-xs sm:text-sm text-white/90 font-light leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <div className="bg-[#141414] rounded-lg border border-[#D4AF37]/25 shadow-sm overflow-hidden flex flex-col">
              <div className="p-3.5 bg-[#181818] border-b border-[#D4AF37]/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-sm bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center font-bold">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">Возможности (Opportunities)</h4>
                    <p className="text-[10px] text-white/40 font-light">Внешние перспективы, рост и удачный момент</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]">
                  {currentSwot.swot.opportunities.length}
                </span>
              </div>

              <div className="p-3.5 sm:p-4 space-y-2 flex-1">
                {currentSwot.swot.opportunities.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-md bg-[#0A0A0A] border border-white/10">
                    <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-white/90 font-light leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Threats */}
            <div className="bg-[#141414] rounded-lg border border-amber-500/25 shadow-sm overflow-hidden flex flex-col">
              <div className="p-3.5 bg-[#181818] border-b border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-sm bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">Угрозы (Threats)</h4>
                    <p className="text-[10px] text-white/40 font-light">Внешние риски, неопределенность и барьеры</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  {currentSwot.swot.threats.length}
                </span>
              </div>

              <div className="p-3.5 sm:p-4 space-y-2 flex-1">
                {currentSwot.swot.threats.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-md bg-[#0A0A0A] border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-2" />
                    <p className="text-xs sm:text-sm text-white/90 font-light leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#141414] rounded-lg border border-white/10 p-8 text-center text-white/40 text-xs font-light">
          SWOT-анализ для данного варианта пока не сформирован.
        </div>
      )}
    </div>
  );
};
