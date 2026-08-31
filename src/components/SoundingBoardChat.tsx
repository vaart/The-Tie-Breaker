import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import { DecisionAnalysis, ChatMessage } from '../types.ts';

interface SoundingBoardChatProps {
  decision: DecisionAnalysis;
}

const SAMPLE_QUESTIONS = [
  'В чем главный скрытый риск рекомендуемого пути?',
  'Как подстраховаться финансово в первые 3 месяца?',
  'Что посоветовал бы опытный наставник в такой ситуации?',
  'Как мягко отменить решение, если всё пойдет не так?',
];

export const SoundingBoardChat: React.FC<SoundingBoardChatProps> = ({ decision }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'ai',
      text: `Я внимательно изучил все детали по теме «${decision.title}». Задайте любой вопрос, выскажите свои опасения или спросите совет по конкретным шагам.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionContext: {
            title: decision.title,
            context: decision.context,
            options: decision.options,
            verdict: decision.verdict,
          },
          userQuestion: textToSend.trim(),
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();
      if (data.reply) {
        const aiMsg: ChatMessage = {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Не удалось получить ответ');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'ai',
        text: 'К сожалению, возникла заминка при генерации ответа. Пожалуйста, попробуйте спросить еще раз.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#141414] rounded-lg border border-white/10 shadow-sm overflow-hidden flex flex-col h-[540px]">
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-white/10 bg-[#181818] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-sm bg-[#D4AF37] text-[#0A0A0A] flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">Диалог с ИИ-советником</h3>
            <p className="text-[11px] text-white/40 font-light">Задавайте уточняющие вопросы и проверяйте сценарии</p>
          </div>
        </div>

        <span className="text-[10px] uppercase font-mono tracking-wider text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/25 px-2 py-0.5 rounded flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
          Онлайн
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-3.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37]'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-md p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-[#D4AF37] text-[#0A0A0A] font-medium shadow-sm'
                  : 'bg-[#0A0A0A] text-white/90 border border-white/10 font-light'
              }`}
            >
              {msg.text}
              <div
                className={`text-[9px] font-mono mt-1 ${
                  msg.sender === 'user' ? 'text-[#0A0A0A]/60' : 'text-white/40'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-sm bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center text-xs shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-[#0A0A0A] border border-white/10 rounded-md p-3 text-xs text-white/60 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
              Формулирую взвешенный ответ...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested Query Chips */}
      <div className="px-3 py-2 bg-[#0A0A0A] border-t border-white/10 overflow-x-auto flex items-center gap-2">
        <span className="text-[10px] text-white/40 shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-[#D4AF37]" /> Примеры:
        </span>
        {SAMPLE_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="text-xs text-white/70 bg-[#141414] hover:bg-[#181818] hover:text-[#D4AF37] hover:border-[#D4AF37]/40 border border-white/10 px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2.5 sm:p-3 bg-[#141414] border-t border-white/10 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Спросите что угодно о вашем решении..."
          className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-md bg-[#0A0A0A] border border-white/15 text-white placeholder:text-white/30 focus:border-[#D4AF37] outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 rounded-md bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-30 text-[#0A0A0A] font-bold transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
