import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  FileText,
} from 'lucide-react';
import { DecisionAnalysis } from '../types.ts';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  decision: DecisionAnalysis;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  decision,
}) => {
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'markdown' | 'summary'>('markdown');

  if (!isOpen) return null;

  const generateMarkdown = () => {
    let md = `# Отчет по решению: ${decision.title}\n\n`;
    md += `**Категория**: ${decision.category || 'Общее'} | **Срочность**: ${decision.urgency || 'Средняя'} | **Дата**: ${new Date(decision.createdAt).toLocaleDateString('ru-RU')}\n\n`;

    if (decision.context) {
      md += `### Контекст и вводные данные\n${decision.context}\n\n`;
    }

    md += `## 🏆 Главная рекомендация: ${decision.verdict.recommendedOptionTitle}\n`;
    md += `> **Уверенность**: ${decision.verdict.confidenceScore}%\n`;
    md += `> **Суть совета**: «${decision.verdict.verdictHeadline}»\n\n`;
    md += `${decision.verdict.verdictSummary}\n\n`;

    md += `### Почему побеждает этот вариант\n`;
    decision.verdict.keyDifferentiators.forEach((diff) => {
      md += `- ${diff}\n`;
    });
    md += `\n`;

    md += `### Первый шаг прямо сейчас\n`;
    md += `${decision.verdict.immediateActionStep}\n\n`;

    md += `### Правило 10/10/10\n`;
    md += `- **Через 10 минут**: ${decision.verdict.tenTenTenRule.in10Minutes}\n`;
    md += `- **Через 10 месяцев**: ${decision.verdict.tenTenTenRule.in10Months}\n`;
    md += `- **Через 10 лет**: ${decision.verdict.tenTenTenRule.in10Years}\n\n`;

    md += `## ⚖️ Анализ За и Против\n`;
    decision.options.forEach((opt) => {
      md += `### Вариант: ${opt.title}\n`;
      const pros = decision.prosCons.filter((p) => p.optionId === opt.id && p.type === 'pro');
      const cons = decision.prosCons.filter((p) => p.optionId === opt.id && p.type === 'con');

      md += `**Плюсы:**\n`;
      pros.forEach((p) => {
        md += `- [Вес ${p.weight}/5] [${p.category}] **${p.text}**${p.explanation ? `: ${p.explanation}` : ''}\n`;
      });

      md += `\n**Минусы:**\n`;
      cons.forEach((c) => {
        md += `- [Вес ${c.weight}/5] [${c.category}] **${c.text}**${c.explanation ? `: ${c.explanation}` : ''}\n`;
      });
      md += `\n`;
    });

    md += `## 📊 Матрица сравнения\n`;
    md += `| Критерий | Категория | Важность | ` + decision.options.map((o) => o.title).join(' | ') + ` |\n`;
    md += `| --- | --- | --- | ` + decision.options.map(() => '---').join(' | ') + ` |\n`;
    decision.comparisonMatrix.forEach((crit) => {
      const scores = decision.options.map((o) => `${crit.scores[o.id]?.score ?? 5}/10`).join(' | ');
      md += `| ${crit.name} | ${crit.category} | ${crit.weight}x | ${scores} |\n`;
    });
    md += `\n`;

    md += `## 🛡️ Снижение рисков\n`;
    decision.verdict.riskMitigations.forEach((m) => {
      md += `- **Риск**: ${m.risk} → **Решение**: ${m.action}\n`;
    });

    return md;
  };

  const generateSummary = () => {
    return `ОТЧЕТ ПО РЕШЕНИЮ: ${decision.title}
--------------------------------------------------
РЕКОМЕНДУЕМЫЙ ВЫБОР: ${decision.verdict.recommendedOptionTitle} (${decision.verdict.confidenceScore}% уверенность)
СУТЬ: «${decision.verdict.verdictHeadline}»

ОБОСНОВАНИЕ:
${decision.verdict.verdictSummary}

ГЛАВНЫЕ ПРЕИМУЩЕСТВА:
${decision.verdict.keyDifferentiators.map((d, i) => `${i + 1}. ${d}`).join('\n')}

ПЕРВЫЙ ШАГ:
${decision.verdict.immediateActionStep}

Сформировано в приложении The Tie Breaker (Выбор без сомнений)`;
  };

  const contentToDisplay = exportFormat === 'markdown' ? generateMarkdown() : generateSummary();

  const handleCopy = () => {
    navigator.clipboard.writeText(contentToDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([contentToDisplay], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `decision-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141414] rounded-lg max-w-2xl w-full shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#181818]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[#D4AF37]">Экспорт отчета</h3>
              <p className="text-xs text-white/40 font-light mt-0.5">Сохраните структурированный отчет или краткую сводку</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="p-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#141414]">
          <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 rounded-md border border-white/10">
            <button
              onClick={() => setExportFormat('markdown')}
              className={`px-3 py-1 text-xs rounded transition-all ${
                exportFormat === 'markdown'
                  ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Полный Markdown
            </button>
            <button
              onClick={() => setExportFormat('summary')}
              className={`px-3 py-1 text-xs rounded transition-all ${
                exportFormat === 'summary'
                  ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Краткая сводка
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/15 bg-[#0A0A0A] text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Печать
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/15 bg-[#0A0A0A] text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Скачать .md
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] text-xs font-bold shadow-sm transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Скопировано' : 'Скопировать'}
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto bg-[#0A0A0A] text-white/80 font-mono text-xs leading-relaxed border-t border-white/5">
          <pre className="whitespace-pre-wrap">{contentToDisplay}</pre>
        </div>
      </div>
    </div>
  );
};
