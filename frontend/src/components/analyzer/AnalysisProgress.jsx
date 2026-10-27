import React, { useEffect, useState } from 'react'
import { Sparkles, CheckCircle2, Loader2, ShieldCheck, Cpu, FileSearch } from 'lucide-react'

const STAGES = [
  {
    id: 1,
    title: 'Validating Document In Memory',
    description: 'Enforcing 5 MB cap, verifying magic bytes, checking PDF/DOCX structure.',
    icon: ShieldCheck,
  },
  {
    id: 2,
    title: 'Extracting Text & Calculating Heuristics',
    description: 'Extracting paragraphs/tables, measuring word density, evaluating contact & ATS headings.',
    icon: FileSearch,
  },
  {
    id: 3,
    title: 'Groq AI Semantic Reasoning',
    description: 'Evaluating project depth, skills evidence, student fairness, and qualitative rubrics.',
    icon: Cpu,
  },
]

/**
 * Animated progress card displaying multi-stage evaluation pipeline and elapsed timer (PRD Section 11.3)
 */
export function AnalysisProgress({ hasJobDescription = false }) {
  const [elapsed, setElapsed] = useState(0)
  const [currentStageIndex, setCurrentStageIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (elapsed < 2) {
      setCurrentStageIndex(0)
    } else if (elapsed < 5) {
      setCurrentStageIndex(1)
    } else {
      setCurrentStageIndex(2)
    }
  }, [elapsed])

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-border-subtle bg-bg-surface shadow-xl space-y-6 text-center max-w-lg mx-auto animate-in fade-in-50 duration-300">
      {/* Top Animated Pulse */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-3xl bg-brand-primary/10 text-brand-primary flex items-center justify-center animate-pulse">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-bg-surface border-2 border-brand-primary flex items-center justify-center shadow-sm">
            <Loader2 className="h-3.5 w-3.5 text-brand-primary animate-spin" />
          </div>
        </div>
      </div>

      {/* Main Title & Timer */}
      <div className="space-y-1.5">
        <h3 className="text-xl font-bold text-text-primary tracking-tight">
          Analyzing Your Resume
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary">
          Running hybrid deterministic + Groq AI analysis &bull;{' '}
          <span className="font-mono font-semibold text-brand-primary">
            {elapsed}s elapsed
          </span>
        </p>
      </div>

      {/* Pipeline Stage Indicators */}
      <div className="space-y-3 text-left pt-2">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex
          const isCurrent = idx === currentStageIndex
          const isUpcoming = idx > currentStageIndex
          const StageIcon = stage.icon

          return (
            <div
              key={stage.id}
              className={`
                flex items-start gap-3.5 p-3 rounded-xl border transition-all duration-300
                ${
                  isCurrent
                    ? 'border-brand-primary/50 bg-brand-primary/5 shadow-sm'
                    : isDone
                    ? 'border-border-subtle/50 bg-bg-elevated/40 opacity-80'
                    : 'border-transparent opacity-40'
                }
              `}
            >
              <div
                className={`
                  h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5
                  ${
                    isDone
                      ? 'bg-status-excellent/10 text-status-excellent'
                      : isCurrent
                      ? 'bg-brand-primary text-white'
                      : 'bg-bg-elevated text-text-secondary'
                  }
                `}
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <StageIcon className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0 space-y-0.5">
                <p
                  className={`text-xs sm:text-sm font-semibold ${
                    isCurrent
                      ? 'text-brand-primary'
                      : isDone
                      ? 'text-text-primary'
                      : 'text-text-secondary'
                  }`}
                >
                  {stage.title}
                </p>
                <p className="text-[11px] sm:text-xs text-text-secondary leading-normal">
                  {stage.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress Footer */}
      <div className="pt-2 text-xs text-text-secondary/80 flex items-center justify-center gap-1.5">
        <span>Typical response time is <strong>4 to 12 seconds</strong>.</span>
      </div>
    </div>
  )
}
