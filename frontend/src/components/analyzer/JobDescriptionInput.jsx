import React from 'react'
import { Briefcase, FileText, X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

/**
 * JobDescriptionInput component for optional job description and target role (PRD Section 11.3)
 */
export function JobDescriptionInput({
  targetRole,
  onTargetRoleChange,
  jobDescription,
  onJobDescriptionChange,
  disabled = false,
}) {
  const jdLength = (jobDescription || '').trim().length
  const isTooShort = jdLength > 0 && jdLength < 50
  const isOptimal = jdLength >= 50 && jdLength <= 10_000
  const isOverLimit = jdLength > 10_000

  return (
    <div className="space-y-4">
      {/* Target Role Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="target-role"
            className="text-xs font-semibold uppercase tracking-wider text-text-primary flex items-center gap-1.5"
          >
            <Briefcase className="h-3.5 w-3.5 text-brand-primary" />
            <span>Target Role Title</span>
          </label>
          <span className="text-[11px] text-text-secondary/80">
            {(targetRole || '').length} / 100
          </span>
        </div>

        <input
          id="target-role"
          type="text"
          maxLength={100}
          disabled={disabled}
          value={targetRole}
          onChange={(e) => onTargetRoleChange(e.target.value)}
          placeholder="e.g. Junior Python Backend Developer"
          className="w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all placeholder:text-text-secondary/50 disabled:opacity-50"
        />
      </div>

      {/* Job Description Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label
            htmlFor="job-description"
            className="text-xs font-semibold uppercase tracking-wider text-text-primary flex items-center gap-1.5"
          >
            <FileText className="h-3.5 w-3.5 text-brand-primary" />
            <span>Target Job Description (Optional)</span>
          </label>

          <div className="flex items-center gap-2">
            {jdLength > 0 && (
              <button
                type="button"
                onClick={() => onJobDescriptionChange('')}
                disabled={disabled}
                className="text-xs text-text-secondary hover:text-status-danger inline-flex items-center gap-1 transition-colors"
              >
                <X className="h-3 w-3" />
                <span>Clear</span>
              </button>
            )}

            <Badge
              variant={
                jdLength === 0
                  ? 'outline'
                  : isTooShort
                  ? 'warning'
                  : isOverLimit
                  ? 'danger'
                  : 'success'
              }
              size="sm"
            >
              {jdLength === 0
                ? 'General Audit Mode'
                : `${jdLength.toLocaleString()} / 10,000 chars`}
            </Badge>
          </div>
        </div>

        <div className="relative">
          <textarea
            id="job-description"
            rows={7}
            disabled={disabled}
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            placeholder="Paste target job description here (e.g. responsibilities, required skills, degree qualifications). Leave blank for a General Resume Audit."
            className={`
              w-full px-4 py-3 rounded-2xl border bg-bg-surface text-text-primary text-sm
              focus:outline-none focus:ring-2 transition-all placeholder:text-text-secondary/50 resize-y min-h-[160px]
              disabled:opacity-50
              ${
                isTooShort
                  ? 'border-status-warning focus:ring-status-warning'
                  : isOverLimit
                  ? 'border-status-danger focus:ring-status-danger'
                  : 'border-border-subtle focus:ring-brand-primary'
              }
            `}
          />
        </div>

        {/* Dynamic Status / Guidance Helper */}
        {isTooShort ? (
          <p className="text-xs text-status-warning flex items-center gap-1.5 mt-1">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>
              Job descriptions need at least <strong>50 characters</strong> (currently {jdLength}) for semantic skill matching. Clear the text for a general audit.
            </span>
          </p>
        ) : isOverLimit ? (
          <p className="text-xs text-status-danger flex items-center gap-1.5 mt-1">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Job description exceeds the maximum limit of 10,000 characters.</span>
          </p>
        ) : isOptimal ? (
          <p className="text-xs text-status-excellent flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>Targeted Job Match mode active: required and preferred skills will be evaluated against this posting.</span>
          </p>
        ) : (
          <p className="text-xs text-text-secondary flex items-start gap-1.5 mt-1">
            <Info className="h-3.5 w-3.5 shrink-0 text-text-secondary/70 mt-0.5" />
            <span>
              If omitted, ResumeIQ AI performs a comprehensive <strong>General Audit</strong> evaluating quality and ATS readability without a job match score.
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
