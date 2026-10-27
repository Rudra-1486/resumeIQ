import React, { useState, useMemo } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'

/**
 * RecommendationsList component for Executive Summary, Strengths, Improvements, and Action Steps (PRD Section 11.4)
 */
export function RecommendationsList({
  executiveSummary,
  strengths = [],
  improvementAreas = [],
  recommendations = [],
}) {
  const [priorityFilter, setPriorityFilter] = useState('all') // 'all' | 'high' | 'medium' | 'low'

  const filteredRecs = useMemo(() => {
    if (priorityFilter === 'all') return recommendations
    return recommendations.filter((r) => r.priority === priorityFilter)
  }, [recommendations, priorityFilter])

  return (
    <div className="space-y-6">
      {/* 1. Executive Summary Card */}
      {executiveSummary && (
        <Card className="border-brand-primary/30 bg-gradient-to-r from-brand-primary/5 via-bg-surface to-bg-surface">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Executive Synthesis</span>
            </div>
            <CardTitle className="text-lg">Candidate Profile Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-primary leading-relaxed">
              {executiveSummary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 2. Side-by-Side Strengths and Improvement Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Strengths */}
        <Card className="border-status-excellent/30 bg-status-excellent/5">
          <CardHeader className="pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2 text-status-excellent">
              <CheckCircle2 className="h-5 w-5" />
              <CardTitle className="text-base font-bold text-text-primary">
                Standout Strengths ({strengths.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="py-4 space-y-3">
            {strengths.length === 0 ? (
              <p className="text-xs text-text-secondary italic">No specific strengths recorded.</p>
            ) : (
              strengths.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-border-subtle bg-bg-surface shadow-xs space-y-1"
                >
                  <h4 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-status-excellent shrink-0" />
                    <span>{item.title}</span>
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed pl-5">
                    {item.description}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Priority Improvement Areas */}
        <Card className="border-status-warning/30 bg-status-warning/5">
          <CardHeader className="pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2 text-status-warning">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle className="text-base font-bold text-text-primary">
                Areas for Improvement ({improvementAreas.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="py-4 space-y-3">
            {improvementAreas.length === 0 ? (
              <p className="text-xs text-text-secondary italic">No critical improvement areas identified.</p>
            ) : (
              improvementAreas.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-border-subtle bg-bg-surface shadow-xs space-y-1"
                >
                  <h4 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-status-warning shrink-0" />
                    <span>{item.title}</span>
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed pl-5">
                    {item.description}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. Prioritized Recommendations */}
      <Card className="space-y-4">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-brand-primary" />
                <CardTitle className="text-xl">Actionable Recommendations</CardTitle>
              </div>
              <CardDescription className="pt-1">
                Concrete steps ordered by priority to maximize recruiter scannability and impact.
              </CardDescription>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-bg-elevated border border-border-subtle">
              <button
                type="button"
                onClick={() => setPriorityFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  priorityFilter === 'all'
                    ? 'bg-bg-surface text-brand-primary shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                All ({recommendations.length})
              </button>
              <button
                type="button"
                onClick={() => setPriorityFilter('high')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  priorityFilter === 'high'
                    ? 'bg-bg-surface text-status-danger shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                High
              </button>
              <button
                type="button"
                onClick={() => setPriorityFilter('medium')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  priorityFilter === 'medium'
                    ? 'bg-bg-surface text-status-warning shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Medium
              </button>
              <button
                type="button"
                onClick={() => setPriorityFilter('low')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  priorityFilter === 'low'
                    ? 'bg-bg-surface text-status-strong shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Low
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {filteredRecs.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-secondary italic bg-bg-elevated/20 rounded-xl border border-dashed border-border-subtle">
              No recommendations found for the selected priority.
            </div>
          ) : (
            filteredRecs.map((rec) => {
              const isHigh = rec.priority === 'high'
              const isMed = rec.priority === 'medium'

              return (
                <div
                  key={rec.id}
                  className="p-5 rounded-xl border border-border-subtle bg-bg-surface hover:border-brand-primary/40 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={isHigh ? 'danger' : isMed ? 'warning' : 'info'}
                        size="sm"
                      >
                        {rec.priority.toUpperCase()} PRIORITY
                      </Badge>
                      <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                        {rec.category}
                      </Badge>
                      <h4 className="text-sm font-bold text-text-primary">
                        {rec.title}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-text-secondary">
                    <p className="leading-relaxed">
                      <strong className="text-text-primary font-medium">Why This Matters: </strong>
                      {rec.rationale}
                    </p>
                    <div className="p-3 rounded-lg bg-bg-elevated/50 border border-border-subtle/60 text-text-primary font-medium">
                      <strong className="text-brand-primary">Action Steps: </strong>
                      {rec.action_steps}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
