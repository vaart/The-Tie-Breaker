import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  FolderOpen,
} from 'lucide-react';
import { DecisionAnalysis } from '../types.ts';

interface DecisionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedDecisions: DecisionAnalysis[];
  onSelectDecision: (decision: DecisionAnalysis) => void;
  onDeleteDecision: (id: string) => void;
}

export const DecisionHistoryModal: React.FC<DecisionHistoryModalProps> = ({
  isOpen,
  onClose,
  savedDecisions,
  onSelectDecision,
  onDeleteDecision,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'decided' | 'evaluating'>('all');

  if (!isOpen) return null;

  const filtered = savedDecisions.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'decided'
        ? d.status === 'decided' || Boolean(d.selectedOptionId)
        : d.status === 'evaluating' && !d.selectedOptionId;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141414] rounded-lg max-w-2xl w-full shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#181818]">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-[#D4AF37]">История принятых решений</h3>
            <p className="text-xs text-white/40 font-light mt-0.5">
              Ваши ранее проанализированные дилеммы и вердикты
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3.5 border-b border-white/10 flex flex-col sm:flex-row gap-2.5 bg-[#141414]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по названию или теме..."
              className="w-full pl-9 pr-3.5 py-1.5 sm:py-2 rounded-md bg-[#0A0A0A] border border-white/15 text-white text-xs sm:text-sm outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 rounded-md border border-white/10">
            {[
              { id: 'all', label: 'Все' },
              { id: 'evaluating', label: 'В процессе' },
              { id: 'decided', label: 'Решено' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id as any)}
                className={`px-3 py-1 text-xs rounded transition-all ${
                  filterStatus === st.id
                    ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Decision List */}
        <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-white/40 text-xs sm:text-sm font-light">
              <FolderOpen className="w-8 h-8 mx-auto mb-2 text-white/20" />
              В истории пока нет сохраненных решений.
            </div>
          ) : (
            filtered.map((dec) => {
              const isDecided = dec.status === 'decided' || Boolean(dec.selectedOptionId);
              const dateStr = new Date(dec.createdAt).toLocaleDateString('ru-RU', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={dec.id}
                  className="p-3.5 rounded-md border border-white/10 bg-[#0A0A0A] hover:border-[#D4AF37]/50 hover:bg-[#181818] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
                        {dec.category || 'Общее'}
                      </span>
                      {isDecided ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                          <CheckCircle2 className="w-3 h-3" /> Выбор сделан
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                          <Clock className="w-3 h-3" /> Оценка
                        </span>
                      )}
                      <span className="text-[10px] text-white/40 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {dateStr}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-serif text-white line-clamp-1 mb-0.5">
                      {dec.title}
                    </h4>

                    <p className="text-[11px] sm:text-xs text-white/50 line-clamp-1 font-light">
                      Совет: <strong className="text-white/80">{dec.verdict?.recommendedOptionTitle}</strong> ({dec.verdict?.confidenceScore}% уверенность)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => {
                        onSelectDecision(dec);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] text-xs font-bold shadow-sm transition-colors"
                    >
                      Открыть <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDecision(dec.id);
                      }}
                      className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
