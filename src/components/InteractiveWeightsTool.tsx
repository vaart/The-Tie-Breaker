import React, { useState } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Coins, 
  Eye, 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DecisionAnalysis } from '../types.ts';

interface InteractiveWeightsToolProps {
  decision: DecisionAnalysis;
}

export const InteractiveWeightsTool: React.FC<InteractiveWeightsToolProps> = ({ decision }) => {
  const { options, comparisonMatrix } = decision;

  // Custom priority sliders (1 to 5 scale)
  const [dimensionWeights, setDimensionWeights] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    comparisonMatrix.forEach((c) => {
      initial[c.id] = c.weight;
    });
    return initial;
  });

  // Coin Toss State
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState<string | null>(null);
  const [coinDegree, setCoinDegree] = useState(0);

  const handleSliderChange = (critId: string, value: number) => {
    setDimensionWeights((prev) => ({
      ...prev,
      [critId]: value,
    }));
  };

  const handleResetSliders = () => {
    const initial: Record<string, number> = {};
    comparisonMatrix.forEach((c) => {
      initial[c.id] = c.weight;
    });
    setDimensionWeights(initial);
  };

  // Compute live scores based on user sliders
  const totalSliderWeight = (Object.values(dimensionWeights) as number[]).reduce((a: number, b: number) => a + b, 0);

  const liveOptionScores = options.map((opt) => {
    let totalScore = 0;
    comparisonMatrix.forEach((crit) => {
      const weight = dimensionWeights[crit.id] ?? crit.weight;
      const score = crit.scores[opt.id]?.score ?? 5;
      totalScore += score * weight;
    });

    const normalized = totalSliderWeight > 0 ? (totalScore / totalSliderWeight).toFixed(2) : '0.00';
    return {
      option: opt,
      score: parseFloat(normalized),
    };
  });

  const maxLiveScore = Math.max(...liveOptionScores.map((o) => o.score));

  const handleFlipCoin = () => {
    if (isFlipping || options.length < 2) return;
    setIsFlipping(true);
    setCoinResult(null);

    const randomChoiceIndex = Math.random() < 0.5 ? 0 : 1;
    const spins = 5 + Math.floor(Math.random() * 4); // 5 to 8 rotations
    const finalAngle = spins * 360 + (randomChoiceIndex === 0 ? 0 : 180);

    setCoinDegree(finalAngle);

    setTimeout(() => {
      setIsFlipping(false);
      setCoinResult(options[randomChoiceIndex].title);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }, 1800);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Section 1: Live Value Balancer */}
      <div className="bg-[#141414] rounded-lg border border-white/10 shadow-sm p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">
                Интерактивный симулятор приоритетов
              </h3>
              <p className="text-[11px] text-white/40 font-light mt-0.5">
                Двигайте ползунки важности, чтобы в реальном времени видеть, какой вариант побеждает
              </p>
            </div>
          </div>

          <button
            onClick={handleResetSliders}
            className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white px-2.5 py-1.5 rounded-md border border-white/15 bg-[#0A0A0A] hover:bg-white/5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Сбросить
          </button>
        </div>

        {/* Live Standings Bar */}
        <div className="mb-5 p-3.5 rounded-md bg-[#0A0A0A] border border-white/10">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[#D4AF37] mb-2.5">
            Текущие результаты при ваших весах:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {liveOptionScores.map(({ option, score }, i) => {
              const isWinner = score === maxLiveScore;
              return (
                <div
                  key={option.id}
                  className={`p-3 rounded-md border flex items-center justify-between transition-all ${
                    isWinner
                      ? 'bg-[#181818] text-white border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                      : 'bg-[#141414] text-white/80 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold ${
                        isWinner ? 'bg-[#D4AF37] text-[#0A0A0A]' : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {i === 0 ? 'А' : i === 1 ? 'Б' : i === 2 ? 'В' : i + 1}
                    </span>
                    <span className="text-xs font-medium line-clamp-1">{option.title}</span>
                  </div>
                  <div className="text-sm font-serif text-white font-bold">
                    {score} <span className="text-[10px] font-mono text-white/40">/10</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {comparisonMatrix.map((crit) => {
            const currentVal = dimensionWeights[crit.id] ?? crit.weight;
            return (
              <div
                key={crit.id}
                className="p-3.5 rounded-md bg-[#0A0A0A] border border-white/10 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs text-white font-medium block">{crit.name}</span>
                    <span className="text-[10px] text-white/40">{crit.category}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2 py-0.5 rounded">
                    Вес: {currentVal}x
                  </span>
                </div>

                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={currentVal}
                  onChange={(e) => handleSliderChange(crit.id, Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                />

                <div className="flex justify-between text-[10px] text-white/40 mt-1">
                  <span>Неважно (1x)</span>
                  <span>Критически важно (5x)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Subconscious Tie-Breaker Coin Toss */}
      <div className="bg-[#141414] rounded-lg p-5 sm:p-6 text-white shadow-sm border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center font-bold">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">
                Психологический тест с монеткой
              </h3>
              <p className="text-[11px] text-white/40 font-light mt-0.5">
                Техника для проверки вашего настоящего подсознательного желания
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20">
            <Eye className="w-3.5 h-3.5" />
            Эффект интуитивного озарения
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          <div>
            <div className="p-3.5 rounded-md bg-[#0A0A0A] border border-white/10 text-xs text-white/80 leading-relaxed space-y-2 mb-4 font-light">
              <p>
                <strong className="text-white font-medium">Как это работает:</strong> Когда монетка подбрасывается в воздух, ваш мозг испытывает внезапное ожидание.
              </p>
              <p className="text-[#D4AF37] italic font-serif">
                «В ту секунду, пока монетка летит, вы внезапно понимаете, какой стороной вы втайне надеетесь увидеть её упавшей».
              </p>
            </div>

            <button
              onClick={handleFlipCoin}
              disabled={isFlipping}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-bold text-xs shadow-sm transition-all disabled:opacity-50"
            >
              <Coins className={`w-4 h-4 ${isFlipping ? 'animate-spin' : ''}`} />
              {isFlipping ? 'Монетка летит...' : 'Подбросить монетку судьбы'}
            </button>
          </div>

          {/* Animated Coin Presentation */}
          <div className="flex flex-col items-center justify-center p-5 bg-[#0A0A0A] rounded-md border border-white/10 min-h-[160px]">
            <div
              className={`w-20 h-20 rounded-full border-2 border-[#D4AF37] bg-gradient-to-tr from-[#B38F22] via-[#D4AF37] to-[#F5E296] shadow-[0_0_20px_rgba(212,175,55,0.2)] flex items-center justify-center text-[#0A0A0A] font-serif font-black text-xs text-center p-2 transform transition-transform duration-1000 ${
                isFlipping ? 'animate-bounce' : ''
              }`}
              style={{
                transform: `rotateY(${coinDegree}deg)`,
              }}
            >
              {coinResult ? (
                <span className="line-clamp-2">{coinResult}</span>
              ) : (
                <span className="text-[10px]">ВЫБОР</span>
              )}
            </div>

            {coinResult && (
              <div className="mt-3 text-center">
                <div className="text-[10px] text-[#D4AF37] font-mono uppercase">
                  Выпало:
                </div>
                <div className="text-sm sm:text-base font-serif text-white font-medium mt-0.5">
                  «{coinResult}»
                </div>
                <p className="text-[11px] text-white/50 mt-1.5 max-w-xs mx-auto font-light">
                  Почувствовали облегчение или легкое разочарование? Это чувство и есть ваш настоящий внутренний компас.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
