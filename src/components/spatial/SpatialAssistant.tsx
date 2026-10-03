'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, MessageSquare, Bot, AlertTriangle, Layers } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { useSpatialStore } from '@/store/spatialStore';
import { demoSpatialAssistant } from '@/lib/ai/spatialAssistant';

const SUGGESTIONS = [
  'Show me all machines',
  'Where is the CNC machine?',
  'Which objects need inspection?',
  'Show CNC machine photos',
  'Which objects could obstruct movement?',
  'Show me all furniture',
  'Reset scene',
];

export function SpatialAssistant() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    assistantMessages,
    addAssistantMessage,
    isAssistantThinking,
    setAssistantThinking,
    executeAction,
    objects,
    space,
  } = useSpatialStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [assistantMessages, isAssistantThinking]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isAssistantThinking) return;

    setInput('');

    // 1. Add user message
    addAssistantMessage({
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    });

    setAssistantThinking(true);

    try {
      // 2. Call local spatial demo assistant
      const response = await demoSpatialAssistant(text, {
        objects,
        spaceName: space.name,
      });

      // 3. Add assistant response
      addAssistantMessage({
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: response.message,
        actions: response.actions,
        timestamp: new Date(),
      });

      // 4. Trigger spatial actions
      if (response.actions && response.actions.length > 0) {
        response.actions.forEach((act) => executeAction(act));
      }
    } catch (err) {
      console.error('Assistant error:', err);
      addAssistantMessage({
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: 'I encountered an error processing your spatial request. Please try again.',
        timestamp: new Date(),
      });
    } finally {
      setAssistantThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080b0f]/80 backdrop-blur-xl border-l border-[rgba(255,255,255,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[rgba(139,233,255,0.1)] border border-[rgba(139,233,255,0.25)] flex items-center justify-center">
            <Bot size={15} className="text-[#8BE9FF]" />
          </div>
          <div>
            <TechnicalLabel variant="accent">SPATIAL COPILOT</TechnicalLabel>
            <p className="text-[12px] font-semibold text-[#F5F7FA] leading-none mt-0.5">Spatial Assistant</p>
          </div>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-wider text-[#7DFFB2] px-2 py-0.5 rounded bg-[rgba(125,255,178,0.1)] border border-[rgba(125,255,178,0.2)]">
          LIVE DEMO
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {assistantMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3.5 text-[13px] leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[#8BE9FF] text-[#050607] font-medium'
                  : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#F5F7FA]'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Render actions badge if present */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                  {msg.actions.map((act, i) => (
                    <span
                      key={i}
                      className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-[rgba(139,233,255,0.12)] border border-[rgba(139,233,255,0.25)] text-[#8BE9FF]"
                    >
                      ⚡ {act.type}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="font-mono text-[9px] text-[rgba(245,247,250,0.3)] mt-1 px-1">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isAssistantThinking && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8BE9FF] animate-pulse" />
            <span className="font-mono text-[11px] text-[rgba(245,247,250,0.6)]">
              Querying spatial digital twin...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-3 py-2 border-t border-[rgba(255,255,255,0.04)] overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
        {SUGGESTIONS.map((sug) => (
          <button
            key={sug}
            onClick={() => handleSend(sug)}
            className="font-mono text-[10px] text-[rgba(245,247,250,0.6)] hover:text-[#8BE9FF] px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(139,233,255,0.08)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(139,233,255,0.2)] transition-colors flex-shrink-0"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input */}
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
            placeholder="Ask about machines, objects, safety..."
            className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] focus:border-[#8BE9FF] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F7FA] placeholder-[rgba(245,247,250,0.3)] outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isAssistantThinking}
            className="h-9 w-9 rounded-xl bg-[#8BE9FF] text-[#050607] flex items-center justify-center disabled:opacity-40 transition-opacity flex-shrink-0 hover:bg-white"
            aria-label="Send query"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
