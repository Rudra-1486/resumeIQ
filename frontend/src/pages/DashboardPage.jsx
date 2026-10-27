import React from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  FileSearch,
  PenTool,
  History,
  TrendingUp,
  FileText,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Award,
  Zap,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useReportHistory } from '../hooks/useReportHistory'
import { useTheme } from '../context/ThemeContext'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

/**
 * Custom Tooltip for Recharts Score Trend (Dark/Light theme compatible)
 */
function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-surface p-3.5 shadow-xl text-xs space-y-1.5 z-50">
        <div className="font-bold text-text-primary text-sm flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-brand-primary" />
          <span>{data.filename || label}</span>
        </div>
        <p className="text-[11px] text-text-secondary">{data.date}</p>
        <div className="space-y-1 pt-1.5 border-t border-border-subtle">
          <div className="flex items-center justify-between gap-4 text-brand-primary font-semibold">
            <span>Resume Quality:</span>
            <span>{data.quality}/100</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-status-excellent font-semibold">
            <span>ATS Readability:</span>
            <span>{data.readability}/100</span>
          </div>
          {data.hasJd && (
            <div className="flex items-center justify-between gap-4 text-status-strong font-semibold">
              <span>Job Match:</span>
              <span>{data.match}/100</span>
            </div>
          )}
        </div>
      </div>
    )
  }
  return null
}

/**
 * Helper to determine tier badge info for Resume Quality Score
 */
function getQualityTier(score) {
  if (score == null) return { label: 'None yet', variant: 'outline' }
  if (score >= 80) return { label: 'Excellent', variant: 'success' }
  if (score >= 65) return { label: 'Strong', variant: 'primary' }
  if (score >= 50) return { label: 'Moderate', variant: 'warning' }
  return { label: 'Needs Improvement', variant: 'danger' }
}

/**
 * Helper to determine tier badge info for ATS-Readability Score
 */
function getReadabilityTier(score) {
  if (score == null) return { label: 'None yet', variant: 'outline' }
  if (score >= 80) return { label: 'Optimal', variant: 'success' }
  if (score >= 65) return { label: 'Good', variant: 'primary' }
  if (score >= 50) return { label: 'Fair', variant: 'warning' }
  return { label: 'Needs Fixes', variant: 'danger' }
}

/**
 * Dashboard Page (PRD Section 12.1 & Phase 12)
 * 
 * Provides metrics overview, Recharts score progression trend, recent reports list, and quick actions.
 */
export function DashboardPage() {
  const { reports, storageStats } = useReportHistory()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const latestReport = reports && reports.length > 0 ? reports[0] : null
  const reportCount = reports?.length || 0
  const maxItems = storageStats?.maxItems || 15

  const latestQuality = latestReport?.summary?.resume_quality_score
  const latestReadability = latestReport?.summary?.ats_readability_score
  const qualityTier = getQualityTier(latestQuality)
  const readabilityTier = getReadabilityTier(latestReadability)

  // Prepare trend data for up to the last 5 reports (reversed to chronological oldest -> newest)
  const trendData = React.useMemo(() => {
    if (!reports || reports.length < 2) return []
    const last5 = reports.slice(0, 5)
    return [...last5].reverse().map((r, index) => {
      const summary = r.summary || {}
      const created = r.created_at ? new Date(r.created_at) : null
      const formattedDate = created
        ? created.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : `Report ${index + 1}`

      return {
        id: r.report_id,
        name: `#${index + 1} (${formattedDate})`,
        filename: summary.resume_filename || `Report ${index + 1}`,
        date: created ? created.toLocaleString() : '',
        quality: summary.resume_quality_score ?? 0,
        readability: summary.ats_readability_score ?? 0,
        match: summary.job_match_score ?? 0,
        hasJd: Boolean(summary.has_job_description),
      }
    })
  }, [reports])

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 sm:py-6">
      {/* Quick-Launch Banner */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border-subtle bg-gradient-to-br from-bg-surface via-bg-surface to-brand-primary/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-brand-primary font-semibold text-xs uppercase tracking-wider">
              <LayoutDashboard className="h-4 w-4" />
              <span>Workspace Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Welcome to Your ResumeIQ Dashboard
            </h1>
            <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
              Track your resume improvement progress over time, review recent evaluation scores,
              and refine bullet points with our factual AI rewriter.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link to="/analyze">
              <Button size="md" variant="primary" icon={FileSearch} className="shadow-md shadow-brand-primary/20">
                New Resume Analysis
              </Button>
            </Link>
            <Link to="/rewriter">
              <Button size="md" variant="outline" icon={PenTool}>
                Open Bullet Rewriter
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Metric Cards (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Total Saved Reports */}
        <Card className="hover:border-border-subtle/80 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Total Saved Reports
              </span>
              <Badge variant="info" size="sm">
                Local Storage
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-text-primary">
                {reportCount} / {maxItems}
              </span>
              <span className="text-xs text-text-secondary">slots used</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {reportCount > 0
                ? `${maxItems - reportCount} local slot${maxItems - reportCount === 1 ? '' : 's'} remaining before auto-eviction`
                : 'Zero reports saved. Evaluated resumes persist here.'}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Latest Resume Quality Score */}
        <Card className="hover:border-border-subtle/80 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Latest Resume Quality
              </span>
              <Badge variant={qualityTier.variant} size="sm">
                {qualityTier.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-extrabold ${
                  latestQuality != null ? 'text-brand-primary' : 'text-text-secondary'
                }`}
              >
                {latestQuality != null ? `${latestQuality}` : 'None yet'}
              </span>
              {latestQuality != null && (
                <span className="text-xs text-text-secondary">/ 100</span>
              )}
            </div>
            <p className="text-xs text-text-secondary truncate">
              {latestReport
                ? latestReport.summary?.resume_filename || 'Latest uploaded resume'
                : 'Run an analysis to generate your first score'}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Latest ATS-Readability Score */}
        <Card className="hover:border-border-subtle/80 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Latest ATS-Readability
              </span>
              <Badge variant={readabilityTier.variant} size="sm">
                {readabilityTier.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-extrabold ${
                  latestReadability != null ? 'text-status-excellent' : 'text-text-secondary'
                }`}
              >
                {latestReadability != null ? `${latestReadability}` : 'None yet'}
              </span>
              {latestReadability != null && (
                <span className="text-xs text-text-secondary">/ 100</span>
              )}
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Deterministic parsing, contact info &amp; layout integrity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Score Trend Chart Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-primary" />
              <span>Score Progression Trend</span>
            </CardTitle>
            <CardDescription>
              Progression of Resume Quality and ATS-Readability across your recent evaluations.
            </CardDescription>
          </div>
          {trendData.length >= 2 && (
            <Badge variant="outline" size="sm">
              Last {trendData.length} Evaluations
            </Badge>
          )}
        </div>

        {trendData.length >= 2 ? (
          /* Recharts LineChart */
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#1E293B' : '#E2E8F0'}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke={isDark ? '#94A3B8' : '#64748B'}
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? '#1E293B' : '#E2E8F0' }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke={isDark ? '#94A3B8' : '#64748B'}
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? '#1E293B' : '#E2E8F0' }}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '12px' }}
                  formatter={(value) => (
                    <span className="text-xs text-text-secondary font-medium">{value}</span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="quality"
                  name="Resume Quality"
                  stroke="#6366F1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#6366F1' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="readability"
                  name="ATS Readability"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10B981' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          /* When < 2 reports exist: helpful explanatory card */
          <div className="p-8 rounded-xl border border-dashed border-border-subtle bg-bg-surface/50 text-center space-y-3">
            <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="font-semibold text-sm text-text-primary">
                Score Trend Chart Unlocks with 2+ Reports
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Currently, you have {reportCount} saved report{reportCount === 1 ? '' : 's'}. Running multiple evaluations will automatically plot your Resume Quality and ATS-Readability score progression here.
              </p>
            </div>
            <div className="pt-1">
              <Link to="/analyze">
                <Button size="sm" variant="outline" icon={FileSearch}>
                  Analyze Another Resume
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>

      {/* Recent Activity or Full Empty State */}
      {reportCount === 0 ? (
        /* Starter Empty State: guides user to first resume audit */
        <Card className="p-8 sm:p-10 text-center border-dashed border-2 border-border-subtle bg-bg-surface/50 space-y-5">
          <div className="h-14 w-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto shadow-sm">
            <FileText className="h-7 w-7" />
          </div>
          <div className="space-y-1.5 max-w-lg mx-auto">
            <h3 className="text-xl font-bold text-text-primary">
              Ready to Optimize Your Resume?
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Upload your resume in PDF or DOCX format to receive transparent 100-point quality scoring, keyword gap analysis, and tailored bullet-point rewrites.
            </p>
          </div>

          {/* 3 Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-2 text-left">
            <div className="p-3.5 rounded-xl bg-bg-elevated/40 border border-border-subtle space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                <ShieldCheck className="h-4 w-4 text-brand-primary" />
                <span>Zero Server Storage</span>
              </div>
              <p className="text-[11px] text-text-secondary">
                In-memory parsing protects candidate privacy.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-bg-elevated/40 border border-border-subtle space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                <Award className="h-4 w-4 text-status-excellent" />
                <span>Deterministic Scoring</span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Transparent rubric with student-fair evaluation.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-bg-elevated/40 border border-border-subtle space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Truthful AI Rewriter</span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Enhance accomplishments without fake statistics.
              </p>
            </div>
          </div>

          <div className="pt-3">
            <Link to="/analyze">
              <Button size="md" variant="primary" icon={FileSearch} className="shadow-md shadow-brand-primary/20">
                Run Your First Resume Audit
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* Recent Reports List (up to 3) */
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg">Recent Analysis Reports</CardTitle>
              <CardDescription>
                The 3 most recent evaluations saved on this device.
              </CardDescription>
            </div>
            <Link to="/history">
              <Button variant="ghost" size="sm" icon={History} className="text-xs sm:text-sm text-brand-primary">
                View All History
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-border-subtle">
            {reports.slice(0, 3).map((item) => {
              const summary = item.summary || {}
              const quality = summary.resume_quality_score ?? 0
              const readability = summary.ats_readability_score ?? 0
              const hasJd = Boolean(summary.has_job_description)
              const match = summary.job_match_score

              return (
                <div
                  key={item.report_id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-text-primary">
                        {summary.resume_filename || 'Uploaded Resume'}
                      </span>
                      <Badge
                        variant={summary.target_role ? 'primary' : 'outline'}
                        size="sm"
                      >
                        {summary.target_role || 'General Resume Audit'}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : 'Recent'}
                      </span>
                    </div>

                    {/* Compact Score Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="px-2.5 py-0.5 rounded-md bg-status-excellent/10 text-status-excellent text-xs font-semibold">
                        Quality: {quality}/100
                      </span>
                      {hasJd && match != null && (
                        <span className="px-2.5 py-0.5 rounded-md bg-status-strong/10 text-status-strong text-xs font-semibold">
                          Match: {match}/100
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-md bg-bg-elevated text-text-secondary text-xs">
                        ATS Readability: {readability}/100
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 self-start sm:self-center">
                    <Link to={`/report/${item.report_id}`}>
                      <Button size="sm" variant="outline">
                        View Report
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

export default DashboardPage
