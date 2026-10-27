import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  History,
  Search,
  Trash2,
  FileText,
  FileSearch,
  ExternalLink,
  Calendar,
  Layers,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
} from 'lucide-react'
import { useReportHistory } from '../hooks/useReportHistory'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Dialog } from '../components/ui/Dialog'

/**
 * Helper to determine badge variant based on score
 */
function getScoreVariant(score) {
  if (score >= 80) return 'success'
  if (score >= 65) return 'primary'
  if (score >= 50) return 'warning'
  return 'danger'
}

/**
 * Report History Page (PRD Section 12.1 & Phase 12)
 * 
 * Manages client-side persisted reports with search, filtering, and deletion confirmation dialogs.
 */
export function HistoryPage() {
  const navigate = useNavigate()
  const { reports, storageStats, deleteReport, clearAllReports } = useReportHistory()
  const [searchTerm, setSearchTerm] = useState('')
  const [clearModalOpen, setClearModalOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState(null)

  // Chronologically sorted (newest first) and filtered by search
  const sortedAndFilteredReports = useMemo(() => {
    const list = [...(reports || [])].sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    )

    if (!searchTerm.trim()) return list

    const term = searchTerm.toLowerCase().trim()
    return list.filter((r) => {
      const filename = r.summary?.resume_filename?.toLowerCase() || ''
      const role = r.summary?.target_role?.toLowerCase() || ''
      const profile = (
        r.summary?.candidate_profile ||
        r.full_report?.report_metadata?.candidate_profile ||
        ''
      ).toLowerCase()
      return filename.includes(term) || role.includes(term) || profile.includes(term)
    })
  }, [reports, searchTerm])

  const handleClearAllConfirm = () => {
    clearAllReports()
    setClearModalOpen(false)
  }

  const handleDeleteSingleConfirm = () => {
    if (reportToDelete?.report_id) {
      deleteReport(reportToDelete.report_id)
      setReportToDelete(null)
    }
  }

  const reportCount = reports?.length || 0
  const maxItems = storageStats?.maxItems || 15

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 sm:py-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm">
            <History className="h-4 w-4" />
            <span>Local Evaluation Archive</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Analysis Report History
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
            Browse, search, and revisit up to 15 recent resume assessments saved in your browser's private local storage.
          </p>
        </div>

        {/* Counter Badge & Clear Action */}
        <div className="flex items-center gap-3">
          <Badge variant="info" size="md">
            {reportCount} of {maxItems} slots used
          </Badge>
          {reportCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              icon={Trash2}
              onClick={() => setClearModalOpen(true)}
            >
              Clear All History
            </Button>
          )}
        </div>
      </div>

      {/* Live Search Input Bar */}
      {reportCount > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by resume filename or target role..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all placeholder:text-text-secondary/50 shadow-sm"
          />
        </div>
      )}

      {/* Reports List / Grid / Empty State */}
      {reportCount === 0 ? (
        /* Empty State: 0 Reports */
        <Card className="p-12 text-center border-dashed border-2 border-border-subtle bg-bg-surface/50 space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto shadow-sm">
            <FileText className="h-8 w-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-text-primary">
              No Saved Reports in This Browser Yet
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              When you evaluate a resume with auto-save enabled, complete reports and score breakdowns are saved locally for instant access.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/analyze">
              <Button size="md" variant="primary" icon={FileSearch} className="shadow-md shadow-brand-primary/20">
                Run Your First Analysis
              </Button>
            </Link>
          </div>
        </Card>
      ) : sortedAndFilteredReports.length === 0 ? (
        /* Empty State: Search yielded no matches */
        <Card className="p-10 text-center border border-border-subtle bg-bg-surface space-y-3">
          <div className="h-12 w-12 rounded-xl bg-bg-elevated text-text-secondary flex items-center justify-center mx-auto">
            <Search className="h-6 w-6" />
          </div>
          <p className="text-base font-semibold text-text-primary">
            No matching reports found for "{searchTerm}"
          </p>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Try adjusting your search query, or clear the search to view all {reportCount} saved reports.
          </p>
          <div className="pt-2">
            <Button size="sm" variant="outline" onClick={() => setSearchTerm('')}>
              Clear Search
            </Button>
          </div>
        </Card>
      ) : (
        /* List of Reports */
        <div className="grid grid-cols-1 gap-4">
          {sortedAndFilteredReports.map((item) => {
            const summary = item.summary || {}
            const candidateProfile =
              summary.candidate_profile ||
              item.full_report?.report_metadata?.candidate_profile ||
              'General Applicant'

            const qualityScore = summary.resume_quality_score ?? 0
            const readabilityScore = summary.ats_readability_score ?? 0
            const hasJd = Boolean(summary.has_job_description)
            const matchScore = summary.job_match_score

            const formattedDate = item.created_at
              ? new Date(item.created_at).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : 'Recent'

            return (
              <Card
                key={item.report_id}
                className="p-5 sm:p-6 hover:border-brand-primary/30 transition-all hover:shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Left Metadata & Info */}
                  <div className="space-y-3">
                    {/* Header Row: File Icon, Filename, Target Role, Candidate Profile */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                        <FileCheck2 className="h-4.5 w-4.5" />
                      </div>
                      <span className="font-bold text-base text-text-primary">
                        {summary.resume_filename || 'Uploaded Resume'}
                      </span>
                      <Badge
                        variant={summary.target_role ? 'primary' : 'outline'}
                        size="sm"
                      >
                        {summary.target_role || 'General Resume Audit'}
                      </Badge>
                      <Badge variant="outline" size="sm" className="bg-bg-elevated/40">
                        <UserCheck className="h-3 w-3 mr-1 text-brand-primary inline" />
                        {candidateProfile}
                      </Badge>
                    </div>

                    {/* Timestamp & Report ID */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-text-secondary" />
                        {formattedDate}
                      </span>
                      <span className="font-mono text-[11px] opacity-75">
                        ID: {item.report_id}
                      </span>
                    </div>

                    {/* 3 Score Badges: Resume Quality, Job Match / Not Evaluated, ATS-Readability */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {/* Quality Score */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                          qualityScore >= 80
                            ? 'bg-status-excellent/15 text-status-excellent border border-status-excellent/20'
                            : qualityScore >= 65
                            ? 'bg-status-strong/15 text-status-strong border border-status-strong/20'
                            : 'bg-status-warning/15 text-status-warning border border-status-warning/20'
                        }`}
                      >
                        Quality: {qualityScore}/100
                      </span>

                      {/* Job Match Score or Not Evaluated */}
                      {hasJd && matchScore != null ? (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                            matchScore >= 80
                              ? 'bg-status-excellent/15 text-status-excellent border border-status-excellent/20'
                              : matchScore >= 65
                              ? 'bg-status-strong/15 text-status-strong border border-status-strong/20'
                              : 'bg-status-warning/15 text-status-warning border border-status-warning/20'
                          }`}
                        >
                          Job Match: {matchScore}/100
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-bg-elevated text-text-secondary text-xs border border-border-subtle">
                          Job Match: Not Evaluated
                        </span>
                      )}

                      {/* ATS-Readability Score */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                          readabilityScore >= 80
                            ? 'bg-status-excellent/15 text-status-excellent border border-status-excellent/20'
                            : readabilityScore >= 65
                            ? 'bg-status-strong/15 text-status-strong border border-status-strong/20'
                            : 'bg-status-warning/15 text-status-warning border border-status-warning/20'
                        }`}
                      >
                        ATS-Readability: {readabilityScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Right Actions: Open Report & Delete */}
                  <div className="flex items-center gap-3 shrink-0 self-start lg:self-center pt-2 lg:pt-0">
                    <Link to={`/report/${item.report_id}`}>
                      <Button size="sm" variant="outline" icon={ExternalLink}>
                        Open Report
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-status-danger hover:bg-status-danger/10 hover:text-status-danger"
                      icon={Trash2}
                      onClick={() => setReportToDelete(item)}
                      title="Delete this saved report"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Confirmation Dialog: Clear All History */}
      <Dialog
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        onConfirm={handleClearAllConfirm}
        title="Clear All Report History?"
        description="Are you sure you want to permanently delete all saved resume analysis reports from this browser? This action cannot be undone."
        confirmLabel="Yes, Clear All History"
        cancelLabel="Cancel"
        isDestructive={true}
      />

      {/* Confirmation Dialog: Delete Individual Report */}
      <Dialog
        isOpen={Boolean(reportToDelete)}
        onClose={() => setReportToDelete(null)}
        onConfirm={handleDeleteSingleConfirm}
        title="Delete Saved Report?"
        description={`Are you sure you want to delete the saved report for "${
          reportToDelete?.summary?.resume_filename || 'this resume'
        }"? This will permanently remove it from your browser.`}
        confirmLabel="Delete Report"
        cancelLabel="Cancel"
        isDestructive={true}
      />
    </div>
  )
}

export default HistoryPage
