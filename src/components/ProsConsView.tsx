import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Tag
} from 'lucide-react';
import { DecisionAnalysis, FactorCategory, ProConItem } from '../types.ts';

interface ProsConsViewProps {
  decision: DecisionAnalysis;
  onUpdateProsCons: (newProsCons: ProConItem[]) => void;
}

const CATEGORIES: FactorCategory[] = [
  'Финансы',
  'Карьера и рост',
  'Время и силы',
  'Эмоции и комфорт',
  'Риски и безопасность',
  'Свобода и гибкость',
  'Отношения',
  'Общее',
];

const WEIGHT_LABELS: Record<number, string> = {
  1: '1 (Слабый)',
  2: '2 (Умеренный)',
  3: '3 (Важный)',
  4: '4 (Сильный)',
  5: '5 (Решающий)',
};

export const ProsConsView: React.FC<ProsConsViewProps> = ({ decision, onUpdateProsCons }) => {
  const { options, prosCons } = decision;
  const [activeOptionId, setActiveOptionId] = useState<string>(options[0]?.id || '');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form state for adding custom pro/con
  const [showAddModal, setShowAddModal] = useState(false);
  const [newType, setNewType] = useState<'pro' | 'con'>('pro');
  const [newText, setNewText] = useState('');
  const [newWeight, setNewWeight] = useState<number>(3);
  const [newCategory, setNewCategory] = useState<FactorCategory>('Общее');
  const [targetOptionId, setTargetOptionId] = useState<string>(options[0]?.id || '');

  // Calculate scores per option
  const optionScores = options.map((opt) => {
    const optItems = prosCons.filter((item) => item.optionId === opt.id);
    const pros = optItems.filter((i) => i.type === 'pro');
    const cons = optItems.filter((i) => i.type === 'con');
    const totalProWeight = pros.reduce((acc, curr) => acc + curr.weight, 0);
    const totalConWeight = cons.reduce((acc, curr) => acc + curr.weight, 0);
    const netScore = totalProWeight - totalConWeight;

    return {
      option: opt,
      pros,
      cons,
      totalProWeight,
      totalConWeight,
      netScore,
    };
  });

  const handleAddProCon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newItem: ProConItem = {
      id: 'pc_custom_' + Date.now(),
      optionId: targetOptionId,
      type: newType,
      text: newText.trim(),
      weight: newWeight,
      category: newCategory,
    };

    onUpdateProsCons([...prosCons, newItem]);
    setNewText('');
    setShowAddModal(false);
  };

  const handleDeleteItem = (id: string) => {
    onUpdateProsCons(prosCons.filter((item) => item.id !== id));
  };

  const handleWeightChange = (id: string, weight: number) => {
    onUpdateProsCons(
      prosCons.map((item) => (item.id === id ? { ...item, weight } : item))
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Overview Score Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {optionScores.map(({ option, totalProWeight, totalConWeight, netScore }, idx) => (
          <div
            key={option.id}
            onClick={() => setActiveOptionId(option.id)}
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              activeOptionId === option.id
                ? 'bg-[#181818] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                : 'bg-[#141414] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-bold text-[#D4AF37]">
                Вариант {idx === 0 ? 'А' : idx === 1 ? 'Б' : idx === 2 ? 'В' : idx + 1}
              </span>
              <span
                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                  netScore > 0
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    : netScore < 0
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                    : 'bg-white/5 text-white/60 border-white/10'
                }`}
              >
                Баланс: {netScore > 0 ? `+${netScore}` : netScore}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-serif text-white line-clamp-1 mb-2">
              {option.title}
            </h4>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" /> +{totalProWeight} плюсы
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <TrendingDown className="w-3.5 h-3.5" /> -{totalConWeight} минусы
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Action Header: Tabs & Add Button */}
      <div className="bg-[#141414] rounded-lg border border-white/10 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Option Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0A0A0A] border border-white/10 rounded-md overflow-x-auto">
          {options.map((opt, i) => (
            <button
              key={opt.id}
              onClick={() => setActiveOptionId(opt.id)}
              className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all ${
                activeOptionId === opt.id
                  ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {i === 0 ? 'Вариант А' : i === 1 ? 'Вариант Б' : i === 2 ? 'Вариант В' : `Вариант ${i + 1}`}: {opt.title}
            </button>
          ))}
        </div>

        {/* Add Pro / Con Button */}
        <button
          onClick={() => {
            setTargetOptionId(activeOptionId || options[0]?.id);
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-md bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Добавить фактор
        </button>
      </div>

      {/* Pros & Cons Columns for Active Option */}
      {(() => {
        const currentData = optionScores.find((os) => os.option.id === activeOptionId) || optionScores[0];
        if (!currentData) return null;

        const filteredPros = currentData.pros.filter(
          (p) => filterCategory === 'all' || p.category === filterCategory
        );
        const filteredCons = currentData.cons.filter(
          (c) => filterCategory === 'all' || c.category === filterCategory
        );

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Pros Column */}
            <div className="bg-[#141414] rounded-lg border border-emerald-500/20 shadow-sm overflow-hidden flex flex-col">
              <div className="p-3.5 sm:p-4 bg-[#181818] border-b border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-sm bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-emerald-400">Плюсы и выгоды</h3>
                    <p className="text-[11px] text-white/40 font-light">
                      {filteredPros.length} факторов • Суммарный вес: +{currentData.totalProWeight}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 space-y-2.5 flex-1">
                {filteredPros.length === 0 ? (
                  <div className="text-center py-6 text-xs text-white/40 font-light">
                    Нет добавленных плюсов для этого варианта.
                  </div>
                ) : (
                  filteredPros.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-md bg-[#0A0A0A] border border-white/10 hover:border-emerald-500/40 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
                          <Tag className="w-2.5 h-2.5" />
                          {item.category}
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Weight selector */}
                          <div className="flex items-center gap-1 bg-[#141414] border border-white/15 px-2 py-0.5 rounded text-[11px]">
                            <span className="text-white/40 text-[10px]">Вес:</span>
                            <select
                              value={item.weight}
                              onChange={(e) => handleWeightChange(item.id, Number(e.target.value))}
                              className="font-bold text-emerald-400 bg-transparent outline-none cursor-pointer text-xs"
                            >
                              <option value={1} className="bg-[#141414] text-white">1 (Слабый)</option>
                              <option value={2} className="bg-[#141414] text-white">2 (Умеренный)</option>
                              <option value={3} className="bg-[#141414] text-white">3 (Важный)</option>
                              <option value={4} className="bg-[#141414] text-white">4 (Сильный)</option>
                              <option value={5} className="bg-[#141414] text-white">5 (Решающий)</option>
                            </select>
                          </div>

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-white/30 hover:text-rose-400 p-1 rounded hover:bg-rose-950/40 transition-colors"
                            title="Удалить"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm font-normal text-white/90 leading-snug">
                        {item.text}
                      </p>
                      {item.explanation && (
                        <p className="text-[11px] sm:text-xs text-white/50 mt-1 font-light leading-relaxed">
                          {item.explanation}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cons Column */}
            <div className="bg-[#141414] rounded-lg border border-rose-500/20 shadow-sm overflow-hidden flex flex-col">
              <div className="p-3.5 sm:p-4 bg-[#181818] border-b border-rose-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-sm bg-rose-500/10 border border-rose-500/30 flex items-center justify-center font-bold">
                    <X className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-rose-400">Минусы и риски</h3>
                    <p className="text-[11px] text-white/40 font-light">
                      {filteredCons.length} факторов • Суммарный вес: -{currentData.totalConWeight}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 space-y-2.5 flex-1">
                {filteredCons.length === 0 ? (
                  <div className="text-center py-6 text-xs text-white/40 font-light">
                    Нет добавленных минусов для этого варианта.
                  </div>
                ) : (
                  filteredCons.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-md bg-[#0A0A0A] border border-white/10 hover:border-rose-500/40 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
                          <Tag className="w-2.5 h-2.5" />
                          {item.category}
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Weight selector */}
                          <div className="flex items-center gap-1 bg-[#141414] border border-white/15 px-2 py-0.5 rounded text-[11px]">
                            <span className="text-white/40 text-[10px]">Вес:</span>
                            <select
                              value={item.weight}
                              onChange={(e) => handleWeightChange(item.id, Number(e.target.value))}
                              className="font-bold text-rose-400 bg-transparent outline-none cursor-pointer text-xs"
                            >
                              <option value={1} className="bg-[#141414] text-white">1 (Слабый)</option>
                              <option value={2} className="bg-[#141414] text-white">2 (Умеренный)</option>
                              <option value={3} className="bg-[#141414] text-white">3 (Важный)</option>
                              <option value={4} className="bg-[#141414] text-white">4 (Сильный)</option>
                              <option value={5} className="bg-[#141414] text-white">5 (Решающий)</option>
                            </select>
                          </div>

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-white/30 hover:text-rose-400 p-1 rounded hover:bg-rose-950/40 transition-colors"
                            title="Удалить"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm font-normal text-white/90 leading-snug">
                        {item.text}
                      </p>
                      {item.explanation && (
                        <p className="text-[11px] sm:text-xs text-white/50 mt-1 font-light leading-relaxed">
                          {item.explanation}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add Factor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] rounded-lg p-5 sm:p-6 max-w-md w-full shadow-2xl border border-white/15 space-y-4">
            <h3 className="text-sm sm:text-base font-semibold text-[#D4AF37]">Добавить фактор к сравнению</h3>
            <form onSubmit={handleAddProCon} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">К какому варианту относится</label>
                <select
                  value={targetOptionId}
                  onChange={(e) => setTargetOptionId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md bg-[#0A0A0A] border border-white/15 text-white"
                >
                  {options.map((opt, i) => (
                    <option key={opt.id} value={opt.id}>
                      {i === 0 ? 'Вариант А' : i === 1 ? 'Вариант Б' : i === 2 ? 'Вариант В' : `Вариант ${i + 1}`}: {opt.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Тип фактора</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('pro')}
                    className={`py-2 rounded-md text-xs font-bold transition-colors ${
                      newType === 'pro'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                        : 'bg-[#0A0A0A] text-white/60 border border-white/10'
                    }`}
                  >
                    + Плюс (Преимущество)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('con')}
                    className={`py-2 rounded-md text-xs font-bold transition-colors ${
                      newType === 'con'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                        : 'bg-[#0A0A0A] text-white/60 border border-white/10'
                    }`}
                  >
                    - Минус (Недостаток)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Формулировка</label>
                <input
                  type="text"
                  required
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Например: Выше зарплата на 30%, долгая дорога..."
                  className="w-full px-3 py-2 text-xs rounded-md bg-[#0A0A0A] border border-white/15 text-white focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Категория</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as FactorCategory)}
                    className="w-full px-3 py-2 text-xs rounded-md bg-[#0A0A0A] border border-white/15 text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Значимость (1-5)</label>
                  <select
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold rounded-md bg-[#0A0A0A] border border-white/15 text-white"
                  >
                    <option value={1}>1 — Незначительно</option>
                    <option value={2}>2 — Умеренно</option>
                    <option value={3}>3 — Важно</option>
                    <option value={4}>4 — Сильно влияет</option>
                    <option value={5}>5 — Решающий фактор</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-md text-xs font-medium text-white/60 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md text-xs font-bold bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] shadow-sm"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
