'use client';
import { useAssemblyStore } from '@/store/assemblyStore';
import { ASSEMBLY_STEPS } from '@/data/demoProduct';
import { GlowButton } from '@/components/ui/GlowButton';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function AssemblyTimeline() {
  const { currentStep, completedSteps, setStep, nextStep, previousStep, totalSteps, triggerShowMe } = useAssemblyStore();
  const progress = Math.round((completedSteps.length / totalSteps) * 100);
  const step = ASSEMBLY_STEPS.find((s) => s.order === currentStep);

  return (
    <div className="flex flex-col h-full border-t border-[rgba(255,255,255,0.06)] bg-[rgba(5,6,7,0.8)] backdrop-blur-xl px-4 py-3">
      <div className="flex items-center gap-4 md:gap-6 h-full overflow-hidden">
        {/* Progress ring */}
        <ProgressRing progress={progress} size={52} strokeWidth={3} label={`${progress}%`} />

        {/* Step info */}
        <div className="flex-shrink-0 min-w-[140px] hidden sm:block">
          <TechnicalLabel>Current Step</TechnicalLabel>
          <div className="text-[15px] font-bold text-[#F5F7FA] mt-0.5">
            STEP {String(currentStep).padStart(2, '0')} / {totalSteps}
          </div>
          {step && (
            <div className="text-[11px] text-[rgba(245,247,250,0.5)] mt-0.5 truncate max-w-[140px]">
              {step.title}
            </div>
          )}
        </div>

        {/* Timeline dots — scrollable */}
        <div className="flex-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="flex items-center gap-1.5 min-w-max py-1">
            {ASSEMBLY_STEPS.map((s) => {
              const isCompleted = completedSteps.includes(s.order);
              const isActive = s.order === currentStep;
              return (
                <button
                  key={s.id}
                  onClick={() => setStep(s.order)}
                  title={`Step ${s.order}: ${s.title}`}
                  aria-label={`Go to step ${s.order}: ${s.title}`}
                  aria-current={isActive ? 'step' : undefined}
                  className={cn(
                    'flex flex-col items-center gap-1 transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8BE9FF] rounded'
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-200',
                    isActive && 'bg-[#8BE9FF] text-[#050607] shadow-[0_0_10px_rgba(139,233,255,0.5)]',
                    isCompleted && !isActive && 'bg-[rgba(125,255,178,0.15)] text-[#7DFFB2] border border-[rgba(125,255,178,0.3)]',
                    !isCompleted && !isActive && 'bg-[rgba(255,255,255,0.05)] text-[rgba(245,247,250,0.3)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]'
                  )}>
                    {isCompleted && !isActive ? '✓' : String(s.order).padStart(2, '0')}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={previousStep}
            disabled={currentStep <= 1}
            aria-label="Previous step"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[rgba(245,247,250,0.45)] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          <GlowButton variant="primary" size="sm" icon={<Zap size={12} />} onClick={triggerShowMe}>
            Show Me
          </GlowButton>

          <button
            onClick={nextStep}
            disabled={currentStep >= totalSteps}
            aria-label="Next step"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[rgba(245,247,250,0.45)] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Step difficulty */}
        {step && (
          <div className="flex-shrink-0 hidden xl:flex flex-col items-end">
            <TechnicalLabel>Difficulty</TechnicalLabel>
            <span className={cn('font-mono text-[11px] mt-0.5 uppercase tracking-widest', {
              'text-[#7DFFB2]': step.difficulty === 'easy',
              'text-[#FFD36A]': step.difficulty === 'medium',
              'text-[#FF7F8A]': step.difficulty === 'hard',
            })}>
              {step.difficulty}
            </span>
            <span className="font-mono text-[10px] text-[rgba(245,247,250,0.3)] mt-0.5">{step.duration}</span>
          </div>
        )}
      </div>
    </div>
  );
}
