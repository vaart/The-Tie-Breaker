import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Scale, 
  Table, 
  Compass, 
  Sliders, 
  Bot, 
  AlertCircle, 
  ArrowLeft,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { Header } from './components/Header.tsx';
import { DecisionForm } from './components/DecisionForm.tsx';
import { VerdictView } from './components/VerdictView.tsx';
import { ProsConsView } from './components/ProsConsView.tsx';
import { ComparisonMatrixView } from './components/ComparisonMatrixView.tsx';
import { SwotAnalysisView } from './components/SwotAnalysisView.tsx';
import { InteractiveWeightsTool } from './components/InteractiveWeightsTool.tsx';
import { SoundingBoardChat } from './components/SoundingBoardChat.tsx';
import { DecisionHistoryModal } from './components/DecisionHistoryModal.tsx';
import { ExportModal } from './components/ExportModal.tsx';
import { DecisionAnalysis, ProConItem, ComparisonCriterion } from './types.ts';

const LOCAL_STORAGE_KEY = 'tiebreaker_saved_decisions_v1';

export default function App() {
  const [currentDecision, setCurrentDecision] = useState<DecisionAnalysis | null>(null);
  const [savedDecisions, setSavedDecisions] = useState<DecisionAnalysis[]>([]);
  const [activeTab, setActiveTab] = useState<'verdict' | 'proscons' | 'matrix' | 'swot' | 'weights' | 'chat'>('verdict');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFormData, setLastFormData] = useState<{
    title: string;
    context: string;
    options: { title: string; description: string }[];
    priorities: string;
    urgency: 'Low' | 'Medium' | 'High' | 'Immediate';
  } | null>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Load saved decisions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedDecisions(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load saved decisions:', e);
    }
  }, []);

  // Save decisions to localStorage helper
  const persistDecisions = (updatedList: DecisionAnalysis[]) => {
    setSavedDecisions(updatedList);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  const handleFormSubmit = async (formData: {
    title: string;
    context: string;
    options: { title: string; description: string }[];
    priorities: string;
    urgency: 'Low' | 'Medium' | 'High' | 'Immediate';
  }) => {
    setIsLoading(true);
    setError(null);
    setLastFormData(formData);

    try {
      const res = await fetch('/api/analyze-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Не удалось провести анализ решения.');
      }

      const analyzedDecision: DecisionAnalysis = await res.json();
      setCurrentDecision(analyzedDecision);
      setActiveTab('verdict');

      // Auto-save to history
      const existingIdx = savedDecisions.findIndex((d) => d.id === analyzedDecision.id);
      let nextList = [...savedDecisions];
      if (existingIdx >= 0) {
        nextList[existingIdx] = analyzedDecision;
      } else {
        nextList = [analyzedDecision, ...savedDecisions];
      }
      persistDecisions(nextList);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Произошла непредвиденная ошибка при анализе. Пожалуйста, повторите попытку.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProsCons = (newProsCons: ProConItem[]) => {
    if (!currentDecision) return;
    const updated: DecisionAnalysis = {
      ...currentDecision,
      prosCons: newProsCons,
    };
    setCurrentDecision(updated);
    updateInSaved(updated);
  };

  const handleUpdateMatrix = (newMatrix: ComparisonCriterion[]) => {
    if (!currentDecision) return;
    const updated: DecisionAnalysis = {
      ...currentDecision,
      comparisonMatrix: newMatrix,
    };
    setCurrentDecision(updated);
    updateInSaved(updated);
  };

  const handleSelectFinalOption = (optionId: string) => {
    if (!currentDecision) return;
    const updated: DecisionAnalysis = {
      ...currentDecision,
      selectedOptionId: optionId,
      status: 'decided',
      decidedAt: new Date().toISOString(),
    };
    setCurrentDecision(updated);
    updateInSaved(updated);
  };

  const updateInSaved = (decision: DecisionAnalysis) => {
    const updatedList = savedDecisions.map((d) => (d.id === decision.id ? decision : d));
    persistDecisions(updatedList);
  };

  const handleDeleteDecision = (id: string) => {
    const nextList = savedDecisions.filter((d) => d.id !== id);
    persistDecisions(nextList);
    if (currentDecision?.id === id) {
      setCurrentDecision(null);
    }
  };

  const handleNewDecision = () => {
    setCurrentDecision(null);
    setError(null);
  };

  const getUrgencyLabel = (u?: string) => {
    switch (u) {
      case 'Immediate': return 'Срочно';
      case 'High': return 'Высокая';
      case 'Low': return 'Низкая';
      case 'Medium':
      default: return 'Обычная';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-[#E0E0E0]">
      {/* Header */}
      <Header
        currentDecision={currentDecision}
        savedCount={savedDecisions.length}
        onNewDecision={handleNewDecision}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error notification banner */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <div className="flex items-center gap-2">
              {lastFormData && (
                <button
                  onClick={() => handleFormSubmit(lastFormData)}
                  disabled={isLoading}
                  className="text-xs font-bold text-[#0A0A0A] bg-[#D4AF37] hover:bg-[#E5C158] px-3 py-1 rounded transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Повторяем...' : 'Повторить попытку'}
                </button>
              )}
              <button
                onClick={() => setError(null)}
                className="text-xs text-rose-300 hover:text-rose-100 px-2 py-1"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}

        {/* View 1: Decision Input Form */}
        {!currentDecision ? (
          <DecisionForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        ) : (
          /* View 2: Active Decision Dashboard with Russian Tabs */
          <div className="space-y-5 sm:space-y-6">
            {/* Top Dilemma Banner */}
            <div className="bg-[#141414] rounded-lg border border-white/10 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-4xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/25 px-2 py-0.5 rounded">
                    {currentDecision.category || 'Анализ решения'}
                  </span>
                  <span className="text-[11px] text-white/40">
                    Срочность: <span className="text-white/70">{getUrgencyLabel(currentDecision.urgency)}</span>
                  </span>
                  {currentDecision.status === 'decided' && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" /> Решение принято
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif text-white tracking-tight leading-snug">
                  {currentDecision.title}
                </h1>
                {currentDecision.context && (
                  <p className="text-xs sm:text-sm text-white/50 line-clamp-2 max-w-3xl font-light">
                    {currentDecision.context}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
                <button
                  onClick={handleNewDecision}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/20 text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Назад
                </button>
                <button
                  onClick={() => setIsExportOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] text-xs font-bold shadow-sm transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" /> Экспорт отчета
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#141414] border border-white/10 rounded-lg overflow-x-auto">
              <button
                onClick={() => setActiveTab('verdict')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs whitespace-nowrap transition-all ${
                  activeTab === 'verdict'
                    ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                Вердикт ИИ
              </button>

              <button
                onClick={() => setActiveTab('proscons')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs whitespace-nowrap transition-all ${
                  activeTab === 'proscons'
                    ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                Плюсы и минусы
              </button>

              <button
                onClick={() => setActiveTab('matrix')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs whitespace-nowrap transition-all ${
                  activeTab === 'matrix'
                    ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                Матрица сравнения
              </button>

              <button
                onClick={() => setActiveTab('swot')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs whitespace-nowrap transition-all ${
                  activeTab === 'swot'
                    ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                SWOT-анализ
              </button>

              <button
                onClick={() => setActiveTab('weights')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs whitespace-nowrap transition-all ${
                  activeTab === 'weights'
                    ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Тест и монетка
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs whitespace-nowrap transition-all ${
                  activeTab === 'chat'
                    ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                Чат с советником
              </button>
            </div>

            {/* Tab View Render */}
            <div className="transition-opacity duration-200">
              {activeTab === 'verdict' && (
                <VerdictView
                  decision={currentDecision}
                  onSelectOption={handleSelectFinalOption}
                />
              )}

              {activeTab === 'proscons' && (
                <ProsConsView
                  decision={currentDecision}
                  onUpdateProsCons={handleUpdateProsCons}
                />
              )}

              {activeTab === 'matrix' && (
                <ComparisonMatrixView
                  decision={currentDecision}
                  onUpdateMatrix={handleUpdateMatrix}
                />
              )}

              {activeTab === 'swot' && (
                <SwotAnalysisView decision={currentDecision} />
              )}

              {activeTab === 'weights' && (
                <InteractiveWeightsTool decision={currentDecision} />
              )}

              {activeTab === 'chat' && (
                <SoundingBoardChat decision={currentDecision} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-[#0A0A0A] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <span className="font-serif text-[#D4AF37]">The Tie Breaker</span>
            <span>•</span>
            <span>Помощник в принятии взвешенных решений</span>
          </div>
          <div className="text-[11px] text-white/30">
            ИИ-анализ на базе модели Gemini
          </div>
        </div>
      </footer>

      {/* Saved Decisions Modal */}
      <DecisionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedDecisions={savedDecisions}
        onSelectDecision={(dec) => {
          setCurrentDecision(dec);
          setActiveTab('verdict');
        }}
        onDeleteDecision={handleDeleteDecision}
      />

      {/* Export Modal */}
      {currentDecision && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          decision={currentDecision}
        />
      )}
    </div>
  );
}
