import React, { useState } from 'react'
import { CheckCircle2, Sliders, ShieldCheck, FileSearch, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'

/**
 * CriteriaBreakdown component displaying transparent point breakdowns with progress bars (PRD Section 11.4 & 15)
 */
export function CriteriaBreakdown({ scores }) {
  const [activeCategory, setActiveCategory] = useState('quality') // 'quality' | 'job_match' | 'ats'

  const rqCriteria = scores?.resume_quality?.criteria_breakdown || []
  const jmCriteria = scores?.job_match?.criteria_breakdown || []
  const atsCriteria = scores?.ats_readability?.criteria_breakdown || []
  const hasJobMatch = Boolean(scores?.job_match?.is_available && jmCriteria.length > 0)

  const activeItems =
    activeCategory === 'quality'
      ? {
          title: 'Resume Quality Criteria (RQ-1 to RQ-6)',
          description: 'Evaluates document structure, project depth with Student Fairness, and bullet strength.',
          items: rqCriteria,
          totalScore: scores?.resume_quality?.score,
        }
      : activeCategory === 'job_match'
      ? {
          title: 'Job Match Criteria (JM-1 to JM-5)',
          description: 'Evaluates required and preferred technical skill matches, terminology, and role duties.',
          items: jmCriteria,
          totalScore: scores?.job_match?.score,
        }
      : {
          title: 'ATS-Readability Criteria (ATS-1 to ATS-5)',
          description: '100% deterministic checks measuring text extractability, headings, contacts, and layout.',
          items: atsCriteria,
          totalScore: scores?.ats_readability?.score,
        }

  return (
    <Card className="space-y-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Transparent Score Breakdown</CardTitle>
            <CardDescription>
              Inspect the exact sub-criteria points earned across all evaluation rubrics.
            </CardDescription>
          </div>

          {/* Category Toggle Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-bg-elevated border border-border-subtle self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveCategory('quality')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === 'quality'
                  ? 'bg-bg-surface text-brand-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Resume Quality
            </button>

            {hasJobMatch && (
              <button
                type="button"
                onClick={() => setActiveCategory('job_match')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === 'job_match'
                    ? 'bg-bg-surface text-brand-primary shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Job Match
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveCategory('ats')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === 'ats'
                  ? 'bg-bg-surface text-brand-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              ATS-Readability
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-bg-elevated/40 border border-border-subtle text-xs">
          <span className="text-text-secondary font-medium">{activeItems.title}</span>
          <span className="font-mono font-bold text-text-primary">
            Total Earned: {activeItems.totalScore} / 100 pts
          </span>
        </div>

        {/* Sub-Criteria List */}
        <div className="space-y-3.5">
          {activeItems.items.map((crit) => {
            const percentage = Math.min(100, Math.round((crit.earned / (crit.max_points || 1)) * 100))
            const isFullScore = crit.earned === crit.max_points

            return (
              <div
                key={crit.id}
                className="p-4 rounded-xl border border-border-subtle bg-bg-surface hover:border-brand-primary/40 transition-colors space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand-primary px-1.5 py-0.5 rounded bg-brand-primary/10">
                        {crit.id}
                      </span>
                      <h4 className="text-sm font-semibold text-text-primary">
                        {crit.name}
                      </h4>
                    </div>
                  </div>

                  <Badge
                    variant={isFullScore ? 'success' : percentage >= 70 ? 'info' : 'warning'}
                    size="sm"
                    className="font-mono shrink-0"
                  >
                    {crit.earned} / {crit.max_points} pts
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-bg-elevated h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isFullScore
                        ? 'bg-status-excellent'
                        : percentage >= 70
                        ? 'bg-status-strong'
                        : 'bg-status-warning'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Note */}
                <p className="text-xs text-text-secondary leading-relaxed">
                  {crit.note}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
