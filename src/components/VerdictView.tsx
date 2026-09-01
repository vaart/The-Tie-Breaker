import React from 'react';
import { 
  Trophy, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  HelpCircle, 
  Sparkles, 
  Scale, 
  Flame,
  CheckCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DecisionAnalysis } from '../types.ts';

interface VerdictViewProps {
  decision: DecisionAnalysis;
  onSelectOption: (optionId: string) => void;
}

export const VerdictView: React.FC<VerdictViewProps> = ({ decision, onSelectOption }) => {
  const { verdict, options, selectedOptionId, status } = decision;
  const isFinalized = status === 'decided' || Boolean(selectedOptionId);

  // Local state for active option inspection (defaults to AI recommended option or selected option)
  const [inspectedOptionId, setInspectedOptionId] = React.useState<string>(
    selectedOptionId || verdict.recommendedOptionId || options[0]?.id || ''
  );

  const activeOption = options.find((o) => o.id === inspectedOptionId) || options[0];
  const isInspectedRecommended = activeOption?.id === verdict.recommendedOptionId;
  const isInspectedSelected = selectedOptionId === activeOption?.id;

  const handleCelebrate = (optId: string) => {
    setInspectedOptionId(optId);
    onSelectOption(optId);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#FFFFFF', '#10b981', '#E5C158'],
    });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Banner: The Final Recommendation & Interactive Option Switcher */}
      <div className="relative overflow-hidden rounded-lg bg-[#141414] border border-[#D4AF37]/35 text-white p-5 sm:p-7 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-medium tracking-wide bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
                <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
                {isInspectedRecommended ? 'Главная рекомендация ИИ' : 'Альтернативный сценарий'}
              </div>
              {isInspectedSelected && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Ваш зафиксированный выбор
                </div>
              )}
            </div>

            {/* Confidence Score */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0A0A0A] border border-white/10 text-xs">
              <span className="text-white/50 text-[11px]">Уверенность ИИ:</span>
              <span className="text-[#D4AF37] font-bold font-mono">{verdict.confidenceScore}%</span>
              <div className="w-14 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#D4AF37] rounded-full transition-all duration-1000"
                  style={{ width: `${verdict.confidenceScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Interactive Option Tabs */}
          <div className="pt-1">
            <div className="text-[11px] text-white/50 mb-2 font-light">
              Переключение вариантов для просмотра деталей и фиксации решения:
            </div>
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#0A0A0A] border border-white/10 rounded-lg">
              {options.map((opt, idx) => {
                const isInspected = opt.id === activeOption?.id;
                const isRec = opt.id === verdict.recommendedOptionId;
                const isChosen = selectedOptionId === opt.id;

                return (
                  <button
                    key={opt.id}
                    onClick={() => setInspectedOptionId(opt.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs transition-all ${
                      isInspected
                        ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                        : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-mono font-bold ${
                      isInspected ? 'bg-[#0A0A0A] text-[#D4AF37]' : 'bg-white/10 text-white/70'
                    }`}>
                      {idx === 0 ? 'А' : idx === 1 ? 'Б' : idx === 2 ? 'В' : idx + 1}
                    </span>
                    <span>{opt.title}</span>
                    {isRec && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isInspected ? 'bg-[#0A0A0A]/20 text-[#0A0A0A]' : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                      }`}>
                        Рекомендация
                      </span>
                    )}
                    {isChosen && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500 text-[#0A0A0A] font-mono font-bold">
                        Выбран
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Option Detail Card */}
          <div className="p-4 sm:p-5 rounded-md bg-[#0A0A0A] border border-white/10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif text-white font-light tracking-tight">
                {activeOption?.title}
              </h2>
              {activeOption?.tagline && (
                <span className="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 font-medium">
                  {activeOption.tagline}
                </span>
              )}
            </div>

            {/* Dynamic Description of the currently inspected option */}
            <div className="text-sm sm:text-base text-white/90 font-light leading-relaxed">
              {activeOption?.description || 'Подробный сценарий для оценки всех рисков и перспектив.'}
            </div>

            {/* Verdict summary context if inspected option is recommended */}
            {isInspectedRecommended ? (
              <div className="pt-2 border-t border-white/10 space-y-1">
                <p className="text-xs sm:text-sm font-serif italic text-[#D4AF37]">
                  «{verdict.verdictHeadline}»
                </p>
                <p className="text-xs text-white/70 font-light leading-relaxed">
                  {verdict.verdictSummary}
                </p>
              </div>
            ) : (
              <div className="pt-2 border-t border-white/10 text-xs text-white/60 font-light leading-relaxed">
                Вы просматриваете альтернативный сценарий. Вы можете зафиксировать его в качестве итогового решения ниже.
              </div>
            )}
          </div>

          {/* Action CTA: Accept / Finalize this decision */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-white/10">
            <div className="text-xs text-white/60">
              {isFinalized ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCheck className="w-4 h-4 text-emerald-400" /> Выбор зафиксирован в истории решений.
                </span>
              ) : (
                <span className="font-light">Готовы принять решение? Зафиксируйте текущий вариант:</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleCelebrate(activeOption.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold tracking-wide transition-all ${
                  selectedOptionId === activeOption.id
                    ? 'bg-emerald-500 text-[#0A0A0A] shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : isInspectedRecommended
                    ? 'bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0A] shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {selectedOptionId === activeOption.id
                  ? 'Выбранный вариант (зафиксирован)'
                  : `Выбрать «${activeOption.title}»`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Key Differentiators & Immediate Next Step */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Key Differentiators */}
        <div className="md:col-span-2 bg-[#141414] rounded-lg border border-white/10 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3.5">
            <div className="w-6 h-6 rounded bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center font-bold">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">Почему побеждает этот вариант</h3>
              <p className="text-[11px] text-white/40 font-light">Ключевые преимущества и обоснование</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {verdict.keyDifferentiators.map((diff, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded bg-[#0A0A0A] border border-white/10">
                <div className="w-4 h-4 rounded bg-[#D4AF37] text-[#0A0A0A] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-xs sm:text-sm text-white/90 font-light leading-relaxed">
                  {diff}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Immediate Next Action */}
        <div className="bg-[#141414] rounded-lg border border-white/10 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-emerald-400">Первый шаг прямо сейчас</h3>
                <p className="text-[11px] text-white/40 font-light">Переходим от сомнений к действиям</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/90 font-light leading-relaxed bg-[#0A0A0A] p-3.5 rounded border border-white/10 mb-3">
              {verdict.immediateActionStep}
            </p>
          </div>

          <div className="text-[11px] text-white/40 flex items-center gap-1.5 font-light">
            <Sparkles className="w-3 h-3 text-[#D4AF37] shrink-0" />
            Совет: Сделав даже маленький шаг в первые 24 часа, вы снимаете тревогу и запускаете движение.
          </div>
        </div>
      </div>

      {/* 10-10-10 Rule (Temporal perspective analysis) */}
      <div className="bg-[#141414] rounded-lg border border-white/10 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3.5">
          <div className="w-6 h-6 rounded bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center font-bold">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">Правило 10 / 10 / 10</h3>
            <p className="text-[11px] text-white/40 font-light">Как это решение повлияет на вас в разной перспективе</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-md bg-[#0A0A0A] border border-white/10">
            <div className="text-[11px] font-semibold text-[#D4AF37] mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span> Через 10 минут
            </div>
            <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed">
              {verdict.tenTenTenRule.in10Minutes}
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-[#0A0A0A] border border-white/10">
            <div className="text-[11px] font-semibold text-emerald-400 mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Через 10 месяцев
            </div>
            <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed">
              {verdict.tenTenTenRule.in10Months}
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-[#0A0A0A] border border-white/10">
            <div className="text-[11px] font-semibold text-sky-400 mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> Через 10 лет
            </div>
            <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed">
              {verdict.tenTenTenRule.in10Years}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Proactive Risk Mitigation & Intuitive Gut Check */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Risk Mitigations */}
        <div className="bg-[#141414] rounded-lg border border-white/10 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3.5">
            <div className="w-6 h-6 rounded bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-rose-400">Как подстраховаться от рисков</h3>
              <p className="text-[11px] text-white/40 font-light">Простые меры безопасности для выбранного пути</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {verdict.riskMitigations.map((item, idx) => (
              <div key={idx} className="p-3 rounded bg-[#0A0A0A] border border-rose-500/20">
                <div className="text-xs text-rose-300 font-medium mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  Риск: {item.risk}
                </div>
                <div className="text-xs sm:text-sm text-white/80 font-light pl-2.5 border-l border-rose-500/40">
                  <span className="font-normal text-white/95">Решение: </span>
                  {item.action}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gut Check Questions */}
        <div className="bg-[#141414] rounded-lg border border-white/10 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              <div className="w-6 h-6 rounded bg-amber-500/10 text-[#D4AF37] flex items-center justify-center font-bold">
                <HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">Проверка интуиции</h3>
                <p className="text-[11px] text-white/40 font-light">Прислушайтесь к своим истинным ощущениям</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {verdict.gutCheckQuestions.map((q, idx) => (
                <div key={idx} className="p-3 rounded bg-[#0A0A0A] border border-white/10">
                  <p className="text-xs sm:text-sm text-[#D4AF37] font-serif italic">
                    «{q}»
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3.5 p-2.5 rounded bg-[#0A0A0A] text-[11px] text-white/50 border border-white/10 font-light">
            <span className="font-medium text-[#D4AF37]">Психологическая подсказка: </span>
            Если при виде вердикта вы почувствовали легкое разочарование, значит подсознательно вы на самом деле хотите выбрать другой вариант.
          </div>
        </div>
      </div>
    </div>
  );
};
