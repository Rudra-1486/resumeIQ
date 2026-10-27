import React, { useState, useMemo } from 'react'
import { CheckCircle2, AlertCircle, ArrowRight, Filter, Target, Quote } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'

/**
 * JobMatchTable component displaying requirement alignment against job description (PRD Section 11.4 & 18.3)
 */
export function JobMatchTable({ requirements = [] }) {
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'explicitly_found' | 'related_or_equivalent' | 'not_found_in_resume'

  const counts = useMemo(() => {
    return {
      all: requirements.length,
      explicit: requirements.filter((r) => r.match_status === 'explicitly_found').length,
      related: requirements.filter((r) => r.match_status === 'related_or_equivalent').length,
      missing: requirements.filter((r) => r.match_status === 'not_found_in_resume').length,
    }
  }, [requirements])

  const filteredRequirements = useMemo(() => {
    if (statusFilter === 'all') return requirements
    return requirements.filter((r) => r.match_status === statusFilter)
  }, [requirements, statusFilter])

  return (
    <Card className="space-y-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-brand-primary" />
              <CardTitle className="text-xl">Job Description Alignment Details</CardTitle>
            </div>
            <CardDescription className="pt-1">
              Evaluates target job requirements against evidence extracted from your resume.
            </CardDescription>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-bg-elevated border border-border-subtle flex-wrap">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-bg-surface text-brand-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('explicitly_found')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'explicitly_found'
                  ? 'bg-bg-surface text-status-excellent shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Explicit ({counts.explicit})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('related_or_equivalent')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'related_or_equivalent'
                  ? 'bg-bg-surface text-status-strong shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Related ({counts.related})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('not_found_in_resume')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'not_found_in_resume'
                  ? 'bg-bg-surface text-status-danger shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Not Found ({counts.missing})
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {filteredRequirements.length === 0 ? (
          <div className="p-8 text-center text-xs text-text-secondary italic bg-bg-elevated/20 rounded-xl border border-dashed border-border-subtle">
            No requirements match the selected filter.
          </div>
        ) : (
          filteredRequirements.map((req, idx) => {
            const isExplicit = req.match_status === 'explicitly_found'
            const isRelated = req.match_status === 'related_or_equivalent'
            const isMissing = req.match_status === 'not_found_in_resume'

            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border-subtle bg-bg-surface hover:border-brand-primary/40 transition-colors space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-text-primary">
                      {req.requirement_name}
                    </span>
                    <Badge
                      variant={req.importance === 'required' ? 'primary' : 'outline'}
                      size="sm"
                    >
                      {req.importance}
                    </Badge>
                  </div>

                  {/* Status Badge */}
                  <Badge
                    variant={isExplicit ? 'success' : isRelated ? 'info' : 'danger'}
                    size="sm"
                    className="self-start sm:self-auto"
                  >
                    {isExplicit
                      ? 'Explicit Match (1.0)'
                      : isRelated
                      ? 'Related / Equivalent (0.6)'
                      : 'Not Found In Resume (0.0)'}
                  </Badge>
                </div>

                {/* Resume Evidence */}
                <div className="flex items-start gap-2 text-xs text-text-secondary bg-bg-elevated/40 p-2.5 rounded-lg border border-border-subtle/60">
                  <Quote className="h-3.5 w-3.5 shrink-0 text-text-secondary/50 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-text-primary font-medium">Evidence / Gap: </strong>
                    {req.resume_evidence}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
