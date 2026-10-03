'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssemblyStore } from '@/store/assemblyStore';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlowButton } from '@/components/ui/GlowButton';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { StatusDot } from '@/components/ui/StatusDot';
import type { AIAction, ChatMessage } from '@/types/assembly';
import { parseAIActions } from '@/lib/ai/schemas';
import { Send, Bot, User, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Quick suggestion chips
const SUGGESTIONS = [
  'Which screw do I use?',
  'Where does the motor go?',
  'Show me the next step',
  'Explain this component',
  'Explode the model',
];

let msgCounter = 0;
function makeId() { return `msg-${++msgCounter}`; }

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isUser ? 'bg-[rgba(139,233,255,0.15)] border border-[rgba(139,233,255,0.3)]' : 'bg-[rgba(125,255,178,0.1)] border border-[rgba(125,255,178,0.2)]'
      }`}>
        {isUser ? <User size={13} className="text-[#8BE9FF]" /> : <Bot size={13} className="text-[#7DFFB2]" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed ${
        isUser
          ? 'bg-[rgba(139,233,255,0.1)] border border-[rgba(139,233,255,0.2)] text-[rgba(245,247,250,0.9)] rounded-tr-sm'
          : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[rgba(245,247,250,0.8)] rounded-tl-sm'
      }`}>
        <div className="prose prose-invert prose-sm max-w-none [&_strong]:text-[#F5F7FA] [&_p]:my-0.5">
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
        {msg.actions && msg.actions.length > 0 && (
          <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.06)]">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(245,247,250,0.3)]">
              {msg.actions.length} action{msg.actions.length > 1 ? 's' : ''} triggered
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 items-end">
      <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-[rgba(125,255,178,0.1)] border border-[rgba(125,255,178,0.2)]">
        <Bot size={13} className="text-[#7DFFB2]" />
      </div>
      <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center">
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[rgba(245,247,250,0.4)]" />
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[rgba(245,247,250,0.4)]" />
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[rgba(245,247,250,0.4)]" />
        </div>
      </div>
    </div>
  );
}

export function Copilot() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: makeId(),
    role: 'assistant',
    content: "Hello! I'm your **AssemblyOS Copilot**. I can help you with the DRONE-X1 assembly — ask me about any component, tool, or step. You can also say **\"Show Me\"** to trigger an assembly animation.",
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { currentStep, selectedComponentId, highlightComponent, setExploded, setStep, triggerShowMe, startVerification } = useAssemblyStore();

  // Execute AI actions on the 3D scene
  const executeActions = useCallback((actions: AIAction[]) => {
    for (const action of actions) {
      switch (action.type) {
        case 'highlightComponent':
          if (action.componentId) highlightComponent(action.componentId);
          break;
        case 'focusComponent':
          if (action.componentId) highlightComponent(action.componentId);
          break;
        case 'setExplodedView':
          setExploded(Boolean(action.value));
          break;
        case 'setAssemblyStep':
          if (typeof action.stepIndex === 'number') setStep(action.stepIndex);
          break;
        case 'showAssemblyAnimation':
          triggerShowMe();
          break;
        case 'verifyAssembly':
          startVerification();
          break;
        case 'resetScene':
          setExploded(false);
          break;
      }
    }
  }, [highlightComponent, setExploded, setStep, triggerShowMe, startVerification]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMsg: ChatMessage = { id: makeId(), role: 'user', content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          currentStep,
          selectedComponent: selectedComponentId,
          product: 'drone-x1',
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      const aiActions = parseAIActions(data.actions ?? []);
      executeActions(aiActions);

      const aiMsg: ChatMessage = {
        id: makeId(),
        role: 'assistant',
        content: data.message ?? 'Sorry, I could not generate a response.',
        actions: aiActions,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [...prev, {
        id: makeId(),
        role: 'assistant',
        content: 'AI Copilot encountered an error. Demo guidance is still available — try asking about a specific component or step.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, currentStep, selectedComponentId, executeActions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[rgba(125,255,178,0.1)] border border-[rgba(125,255,178,0.2)] flex items-center justify-center">
            <Bot size={13} className="text-[#7DFFB2]" />
          </div>
          <div>
            <TechnicalLabel>Assembly Copilot</TechnicalLabel>
            <div className="text-[11px] font-medium text-[rgba(245,247,250,0.6)] mt-0.5">AI-guided assistance</div>
          </div>
        </div>
        <StatusDot status={isLoading ? 'processing' : 'online'} label={isLoading ? 'THINKING' : 'ONLINE'} size="sm" />
      </div>

      {/* Context bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)]">
        <span className="font-mono text-[10px] text-[rgba(245,247,250,0.3)] uppercase tracking-widest">DRONE-X1</span>
        <span className="w-px h-3 bg-[rgba(255,255,255,0.1)]" />
        <span className="font-mono text-[10px] text-[#8BE9FF] uppercase tracking-widest">STEP {String(currentStep).padStart(2,'0')} / 18</span>
        {selectedComponentId && (
          <>
            <span className="w-px h-3 bg-[rgba(255,255,255,0.1)]" />
            <span className="font-mono text-[10px] text-[rgba(245,247,250,0.3)] uppercase tracking-widest truncate">{selectedComponentId}</span>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips */}
      <div className="px-3 py-2 border-t border-[rgba(255,255,255,0.04)]">
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-mono text-[rgba(245,247,250,0.5)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(139,233,255,0.4)] hover:text-[#8BE9FF] transition-all duration-150"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.06)]">
        <div className="flex gap-2 items-end">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about any component or step..."
            disabled={isLoading}
            className="flex-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-3.5 py-2.5 text-[12px] text-[rgba(245,247,250,0.85)] placeholder:text-[rgba(245,247,250,0.25)] focus:outline-none focus:border-[rgba(139,233,255,0.4)] transition-colors disabled:opacity-50"
            aria-label="Chat input"
          />
          <GlowButton
            variant="primary"
            size="sm"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            icon={<Send size={13} />}
          >
            Send
          </GlowButton>
        </div>
      </div>
    </div>
  );
}
