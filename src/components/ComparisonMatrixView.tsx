import React from 'react';
import { 
  Sliders, 
  Crown, 
} from 'lucide-react';
import { DecisionAnalysis, ComparisonCriterion } from '../types.ts';

interface ComparisonMatrixViewProps {
  decision: DecisionAnalysis;
  onUpdateMatrix: (newMatrix: ComparisonCriterion[]) => void;
}

export const ComparisonMatrixView: React.FC<ComparisonMatrixViewProps> = ({
  decision,
  onUpdateMatrix,
}) => {
  const { options, comparisonMatrix } = decision;

  // Calculate weighted total score for each option
  const totalWeight = comparisonMatrix.reduce((acc, c) => acc + c.weight, 0);

  const optionTotals = options.map((opt) => {
    let rawWeightedScore = 0;
    comparisonMatrix.forEach((crit) => {
      const scoreObj = crit.scores[opt.id] || { score: 5, note: '' };
      rawWeightedScore += scoreObj.score * crit.weight;
    });

    const averageNormalizedScore = totalWeight > 0 ? (rawWeightedScore / totalWeight).toFixed(1) : '0.0';

    return {
      option: opt,
      rawWeightedScore,
      averageNormalizedScore: parseFloat(averageNormalizedScore),
    };
  });

  // Find max score
  const highestScore = Math.max(...optionTotals.map((o) => o.averageNormalizedScore));

  const handleWeightChange = (critId: string, delta: number) => {
    const updated = comparisonMatrix.map((crit) => {
      if (crit.id === critId) {
        const next = Math.max(1, Math.min(5, crit.weight + delta));
        return { ...crit, weight: next };
      }
      return crit;
    });
    onUpdateMatrix(updated);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 6) return 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/30';
    if (score >= 4) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Weighted Score Leaderboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {optionTotals.map(({ option, averageNormalizedScore }, idx) => {
          const isLeader = averageNormalizedScore === highestScore && highestScore > 0;
          return (
            <div
              key={option.id}
              className={`p-4 rounded-lg border transition-all ${
                isLeader
                  ? 'bg-[#181818] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                  : 'bg-[#141414] border-white/10 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-bold text-[#D4AF37]">
                  Вариант {idx === 0 ? 'А' : idx === 1 ? 'Б' : idx === 2 ? 'В' : idx + 1}
                </span>
                {isLeader && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#D4AF37] text-[#0A0A0A] font-bold">
                    <Crown className="w-3 h-3 text-[#0A0A0A]" /> Лидирует
                  </span>
                )}
              </div>

              <h4 className="text-sm sm:text-base font-serif text-white line-clamp-1 mb-2">
                {option.title}
              </h4>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
                    {averageNormalizedScore}
                    <span className="text-xs font-mono text-white/40"> / 10</span>
                  </div>
                  <div className="text-[10px] text-white/50 mt-0.5">
                    Взвешенная средняя оценка
                  </div>
                </div>

                <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-[#D4AF37] rounded-full transition-all duration-300"
                    style={{ width: `${(averageNormalizedScore / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Table Container */}
      <div className="bg-[#141414] rounded-lg border border-white/10 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-[#181818] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">Матрица сравнения по критериям</h3>
            <p className="text-xs text-white/50 font-light mt-0.5">
              Меняйте важность критериев (1-5), чтобы увидеть, как это влияет на общий результат.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-white/60 bg-[#0A0A0A] border border-white/15 px-2.5 py-1 rounded-md">
            <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Интерактивная настройка</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-white/10 bg-[#0A0A0A]">
                <th className="py-3 px-4 text-xs font-semibold text-white/70 uppercase tracking-wider w-1/3">
                  Критерий и важность
                </th>
                {options.map((opt, i) => (
                  <th
                    key={opt.id}
                    className="py-3 px-4 text-xs font-medium text-white"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center font-bold text-[10px]">
                        {i === 0 ? 'А' : i === 1 ? 'Б' : i === 2 ? 'В' : i + 1}
                      </span>
                      <span className="line-clamp-1 text-white/90">{opt.title}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {comparisonMatrix.map((crit) => (
                <tr key={crit.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Criterion column */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="text-xs sm:text-sm text-white font-medium mb-1.5">
                      {crit.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/20">
                        {crit.category}
                      </span>

                      {/* Weight Controller */}
                      <div className="inline-flex items-center gap-1.5 bg-[#0A0A0A] border border-white/15 px-2 py-0.5 rounded text-[11px]">
                        <span className="text-white/40">Вес:</span>
                        <span className="font-bold text-[#D4AF37]">{crit.weight}x</span>
                        <button
                          type="button"
                          onClick={() => handleWeightChange(crit.id, -1)}
                          disabled={crit.weight <= 1}
                          className="w-3.5 h-3.5 rounded text-white/40 hover:text-[#D4AF37] disabled:opacity-20 font-bold flex items-center justify-center hover:bg-white/10"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWeightChange(crit.id, 1)}
                          disabled={crit.weight >= 5}
                          className="w-3.5 h-3.5 rounded text-white/40 hover:text-[#D4AF37] disabled:opacity-20 font-bold flex items-center justify-center hover:bg-white/10"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Option score columns */}
                  {options.map((opt) => {
                    const scoreData = crit.scores[opt.id] || { score: 5, note: 'Нейтральная оценка' };
                    const isWinningCell = scoreData.score >= 8;

                    return (
                      <td key={opt.id} className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${getScoreColor(
                              scoreData.score
                            )}`}
                          >
                            {scoreData.score} / 10
                          </span>
                          {isWinningCell && (
                            <span className="text-[9px] font-mono uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/25">
                              Лидер
                            </span>
                          )}
                        </div>

                        {/* Visual score bar */}
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-1.5">
                          <div
                            className={`h-full rounded-full ${
                              scoreData.score >= 8
                                ? 'bg-emerald-400'
                                : scoreData.score >= 6
                                ? 'bg-[#D4AF37]'
                                : scoreData.score >= 4
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                            }`}
                            style={{ width: `${(scoreData.score / 10) * 100}%` }}
                          />
                        </div>

                        <p className="text-[11px] sm:text-xs text-white/60 font-light leading-relaxed">
                          {scoreData.note}
                        </p>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
