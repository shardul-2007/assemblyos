'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, Sparkles, AlertTriangle } from 'lucide-react';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { useProductAssemblyStore } from '@/store/productAssemblyStore';
import { processAssemblyAssistantQuery } from '@/lib/ai/assemblyCopilotService';

const SUGGESTIONS = [
  'Show me the motors',
  'Explode the drone',
  'What happens if I remove the battery?',
  'Hide all propellers',
  'Show how it works',
  'Collapse assembly',
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ProductAssemblyCopilot() {
  const { parts, selectPart, hidePart, removePart, setExplodedProgress, setMode } = useProductAssemblyStore();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I'm your **Assembly Copilot**. I have full structural understanding of **Drone-X1** (13 core components).\n\nAsk me to explode the assembly, remove components, analyze power dependencies, or show functional pathways.",
      timestamp: new Date(),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = async (queryText?: string) => {
    const text = (queryText || input).trim();
    if (!text || isThinking) return;

    setInput('');
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const res = await processAssemblyAssistantQuery(text, parts);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Execute structured operations against assembly store
      res.actions.forEach((act) => {
        switch (act.type) {
          case 'selectPart':
            if (act.partId) selectPart(act.partId);
            break;
          case 'hidePart':
            if (act.partId) hidePart(act.partId);
            break;
          case 'removePart':
            if (act.partId) removePart(act.partId);
            break;
          case 'explodeAssembly':
            setExplodedProgress(1);
            break;
          case 'collapseAssembly':
            setExplodedProgress(0);
            break;
          case 'setMode':
            if (act.mode) setMode(act.mode);
            break;
        }
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Error communicating with assembly engine. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080b0f]/80 backdrop-blur-xl border-l border-[rgba(255,255,255,0.06)] select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[rgba(139,233,255,0.1)] border border-[rgba(139,233,255,0.25)] flex items-center justify-center">
            <Bot size={15} className="text-[#8BE9FF]" />
          </div>
          <div>
            <TechnicalLabel variant="accent">ASSEMBLY COPILOT</TechnicalLabel>
            <p className="text-[12px] font-semibold text-[#F5F7FA] leading-none mt-0.5">Physical Intelligence</p>
          </div>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-wider text-[#7DFFB2] px-2 py-0.5 rounded bg-[rgba(125,255,178,0.1)] border border-[rgba(125,255,178,0.2)]">
          LOCAL MODEL
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[88%] rounded-2xl p-3 text-[12px] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[#8BE9FF] text-[#050607] font-medium'
                  : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#F5F7FA]'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
            <span className="font-mono text-[8px] text-[rgba(245,247,250,0.3)] mt-1 px-1">
              {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isThinking && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8BE9FF] animate-pulse" />
            <span className="font-mono text-[10px] text-[rgba(245,247,250,0.6)]">
              Reasoning over assembly dependencies...
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-3 py-2 border-t border-[rgba(255,255,255,0.04)] overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
        {SUGGESTIONS.map((sug) => (
          <button
            key={sug}
            onClick={() => handleSend(sug)}
            className="font-mono text-[9px] text-[rgba(245,247,250,0.6)] hover:text-[#8BE9FF] px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(139,233,255,0.08)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(139,233,255,0.2)] transition-colors flex-shrink-0"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about parts, motors, explode..."
            className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] focus:border-[#8BE9FF] rounded-xl px-3 py-2 text-xs text-[#F5F7FA] placeholder-[rgba(245,247,250,0.3)] outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="h-8 w-8 rounded-xl bg-[#8BE9FF] text-[#050607] flex items-center justify-center disabled:opacity-40 hover:bg-white transition-colors"
          >
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
}
