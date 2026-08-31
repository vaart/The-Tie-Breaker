import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, ArrowRight, Lightbulb, Compass, Loader2, CheckCircle2 } from 'lucide-react';
import { DECISION_PRESETS } from '../data/presets.ts';
import { DecisionPreset } from '../types.ts';

interface DecisionFormProps {
  onSubmit: (formData: {
    title: string;
    context: string;
    options: { title: string; description: string }[];
    priorities: string;
    urgency: 'Low' | 'Medium' | 'High' | 'Immediate';
  }) => void;
  isLoading: boolean;
}

const PRIORITY_SUGGESTIONS = [
  'Спокойствие и минимум стресса',
  'Деньги и стабильный доход',
  'Карьерный и личный рост',
  'Баланс жизни и работы',
  'Свобода и гибкость',
  'Безопасность и надежность',
  'Семья и отношения',
];

export const DecisionForm: React.FC<DecisionFormProps> = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [options, setOptions] = useState<{ title: string; description: string }[]>([
    { title: '', description: '' },
    { title: '', description: '' },
  ]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([
    'Спокойствие и минимум стресса',
    'Карьерный и личный рост',
  ]);
  const [customPriority, setCustomPriority] = useState('');
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High' | 'Immediate'>('Medium');
  const [isSuggestingOptions, setIsSuggestingOptions] = useState(false);

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, { title: '', description: '' }]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, field: 'title' | 'description', value: string) => {
    const next = [...options];
    next[index][field] = value;
    setOptions(next);
  };

  const togglePriority = (p: string) => {
    if (selectedPriorities.includes(p)) {
      setSelectedPriorities(selectedPriorities.filter((item) => item !== p));
    } else {
      setSelectedPriorities([...selectedPriorities, p]);
    }
  };

  const handleAddCustomPriority = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (customPriority.trim() && !selectedPriorities.includes(customPriority.trim())) {
      setSelectedPriorities([...selectedPriorities, customPriority.trim()]);
      setCustomPriority('');
    }
  };

  const handleLoadPreset = (preset: DecisionPreset) => {
    setTitle(preset.title);
    setContext(preset.context);
    setOptions(preset.options.map(opt => ({ ...opt })));
  };

  const handleSuggestOptions = async () => {
    if (!title.trim()) return;
    setIsSuggestingOptions(true);
    try {
      const res = await fetch('/api/suggest-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, context }),
      });
      const data = await res.json();
      if (data.options && Array.isArray(data.options)) {
        setOptions(data.options);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggestingOptions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const validOptions = options.filter(o => o.title.trim().length > 0);

    onSubmit({
      title: title.trim(),
      context: context.trim(),
      options: validOptions,
      priorities: selectedPriorities.join(', '),
      urgency,
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-4 px-2 sm:px-4">
      {/* Intro Header */}
      <div className="text-center mb-8 space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-medium tracking-wide bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37]">
          <Sparkles className="w-3.5 h-3.5" />
          Умный помощник в принятии решений
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-white font-light tracking-tight">
          Трудный выбор? Разложим все по полочкам
        </h1>
        <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto font-light leading-relaxed">
          Опишите вашу ситуацию или сомнения. ИИ сравнит плюсы и минусы, оценит скрытые риски и даст четкую рекомендацию с планом первых шагов.
        </p>
      </div>

      {/* Quick Presets */}
      <div className="mb-6 p-4 bg-[#141414] rounded-lg border border-white/10 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] mb-3">
          <Lightbulb className="w-3.5 h-3.5 text-[#D4AF37]" />
          Популярные примеры для быстрого старта:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DECISION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleLoadPreset(preset)}
              className="text-left p-3 rounded-md bg-[#0A0A0A] border border-white/10 hover:border-[#D4AF37]/50 hover:bg-white/[0.02] transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
                  {preset.category}
                </span>
                <span className="text-[11px] text-white/40 group-hover:text-[#D4AF37] font-medium flex items-center gap-1">
                  Заполнить <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
              <p className="text-xs text-white/80 font-normal line-clamp-1 group-hover:text-white">
                {preset.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-[#141414] rounded-lg border border-white/10 shadow-sm p-5 sm:p-7 space-y-6">
        {/* Dilemma Title */}
        <div>
          <label htmlFor="dilemma-title" className="block text-xs font-semibold text-[#D4AF37] mb-1.5">
            1. В чем заключается ваше решение? <span className="text-rose-400">*</span>
          </label>
          <input
            id="dilemma-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Уволиться и начать свой проект или остаться в найме?"
            className="w-full px-3.5 py-2.5 sm:py-3 rounded-md bg-[#0A0A0A] border border-white/15 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/40 outline-none text-white text-base sm:text-lg placeholder:text-white/30 transition-all font-light"
          />
        </div>

        {/* Background & Context */}
        <div>
          <label htmlFor="decision-context" className="block text-xs font-semibold text-white/80 mb-1.5">
            2. Контекст и важные детали <span className="text-[11px] text-white/40 font-normal">(необязательно, но улучшит результат)</span>
          </label>
          <textarea
            id="decision-context"
            rows={2}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Укажите цифры, сроки, наличие накоплений, семейные обстоятельства, главные страхи или пожелания..."
            className="w-full px-3.5 py-2.5 rounded-md bg-[#0A0A0A] border border-white/15 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/40 outline-none text-white/90 text-xs sm:text-sm placeholder:text-white/30 transition-all resize-y"
          />
        </div>

        {/* Options to Compare */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-white/80">
              3. Варианты на выбор <span className="text-[11px] text-white/40 font-normal">(между чем выбираем)</span>
            </label>
            {title.trim().length > 3 && (
              <button
                type="button"
                onClick={handleSuggestOptions}
                disabled={isSuggestingOptions}
                className="text-xs font-medium text-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSuggestingOptions ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-[#D4AF37]" />
                    Генерирую...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                    Предложить варианты через ИИ
                  </>
                )}
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {options.map((opt, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#0A0A0A] rounded-md border border-white/10 flex flex-col sm:flex-row gap-2.5 items-start sm:items-center"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded bg-[#D4AF37] text-[#0A0A0A] text-xs font-bold shrink-0">
                  {idx === 0 ? 'А' : idx === 1 ? 'Б' : idx === 2 ? 'В' : idx === 3 ? 'Г' : 'Д'}
                </div>
                <div className="flex-1 w-full space-y-2 sm:space-y-0 sm:flex sm:gap-2">
                  <input
                    type="text"
                    value={opt.title}
                    onChange={(e) => handleOptionChange(idx, 'title', e.target.value)}
                    placeholder={`Название варианта ${idx === 0 ? 'А' : idx === 1 ? 'Б' : idx + 1} (например: Открыть свое дело)`}
                    className="w-full sm:w-1/2 px-3 py-1.5 sm:py-2 rounded bg-[#141414] border border-white/15 text-xs sm:text-sm text-white placeholder:text-white/30 font-medium focus:border-[#D4AF37] outline-none"
                  />
                  <input
                    type="text"
                    value={opt.description}
                    onChange={(e) => handleOptionChange(idx, 'description', e.target.value)}
                    placeholder="Краткое пояснение (необязательно)"
                    className="w-full sm:w-1/2 px-3 py-1.5 sm:py-2 rounded bg-[#141414] border border-white/15 text-xs sm:text-sm text-white/80 placeholder:text-white/30 focus:border-[#D4AF37] outline-none"
                  />
                </div>
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="text-white/40 hover:text-rose-400 p-1.5 rounded hover:bg-rose-950/40 transition-colors shrink-0"
                    title="Удалить вариант"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < 4 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-[#D4AF37] hover:text-white py-1 px-2.5 rounded border border-dashed border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Добавить еще вариант
            </button>
          )}
        </div>

        {/* Priority Values */}
        <div>
          <label className="block text-xs font-semibold text-white/80 mb-2">
            4. Что для вас сейчас в приоритете? <span className="text-[11px] text-white/40 font-normal">(выберите главное)</span>
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2.5">
            {PRIORITY_SUGGESTIONS.map((p) => {
              const isSelected = selectedPriorities.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePriority(p)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-all ${
                    isSelected
                      ? 'bg-[#D4AF37] text-[#0A0A0A] font-semibold shadow-sm'
                      : 'bg-[#0A0A0A] text-white/70 hover:text-white hover:bg-white/5 border border-white/15'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3 h-3 text-[#0A0A0A]" />}
                  {p}
                </button>
              );
            })}
          </div>

          {/* Custom priority input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customPriority}
              onChange={(e) => setCustomPriority(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomPriority(e);
                }
              }}
              placeholder="Свой критерий (например: Удаленная работа, Скорость обучения)..."
              className="flex-1 px-3 py-1.5 rounded bg-[#0A0A0A] border border-white/15 text-xs text-white placeholder:text-white/30 focus:border-[#D4AF37] outline-none"
            />
            <button
              type="button"
              onClick={handleAddCustomPriority}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded border border-white/20 transition-colors"
            >
              Добавить
            </button>
          </div>
        </div>

        {/* Urgency & Submit */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-xs text-white/70">Срочность:</span>
            <div className="inline-flex rounded border border-white/15 p-0.5 bg-[#0A0A0A]">
              {[
                { value: 'Low', label: 'Не к спеху' },
                { value: 'Medium', label: 'Средняя' },
                { value: 'High', label: 'Высокая' },
                { value: 'Immediate', label: 'Срочно' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setUrgency(value as any)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all ${
                    urgency === value
                      ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            id="btn-submit-decision"
            type="submit"
            disabled={isLoading || !title.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-md bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#0A0A0A]" />
                Анализирую все факторы...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Взвесить всё и сделать выбор
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
