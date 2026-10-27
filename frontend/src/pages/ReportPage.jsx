import React, { useMemo, useState } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  FileText,
  FileSearch,
  History,
  Trash2,
  ArrowLeft,
  Calendar,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Target,
  Sliders,
  ShieldCheck,
  PenTool,
  GraduationCap,
  Briefcase,
} from 'lucide-react'
import { useReportHistory } from '../hooks/useReportHistory'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'
import { Dialog } from '../components/ui/Dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs'
import { ScoreGaugeCard } from '../components/report/ScoreGaugeCard'
import { CriteriaBreakdown } from '../components/report/CriteriaBreakdown'
import { SkillsMatrix } from '../components/report/SkillsMatrix'
import { JobMatchTable } from '../components/report/JobMatchTable'
import { RecommendationsList } from '../components/report/RecommendationsList'

export function ReportPage() {
  const { reportId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { getReportById, deleteReport } = useReportHistory()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // 1. Hydrate report from route navigation state or local storage history
  const routeReport = location.state?.report
  const storedReport = useMemo(() => getReportById(reportId), [getReportById, reportId])

  const report = useMemo(() => {
    if (routeReport && (!routeReport.report_id || routeReport.report_id === reportId)) {
      return routeReport
    }
    if (storedReport?.full_report) {
      return storedReport.full_report
    }
    if (storedReport?.scores) {
      return storedReport
    }
    return null
  }, [routeReport, storedReport, reportId])

  // Handle deletion
  const handleDelete = () => {
    deleteReport(reportId)
    setIsDeleteDialogOpen(false)
    navigate('/history')
  }

  // Missing / Evicted report state (PRD Section 11.4)
  if (!report) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center p-8 border-border-subtle shadow-xl space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-status-warning/10 text-status-warning flex items-center justify-center">
              <AlertCircle className="h-8 w-8" />
            </div>
          </div>

          <div className="space-y-2">
            <Badge variant="warning" size="md">
              Report Not Found Locally
            </Badge>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Report ID Not In Local Storage
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Report <code className="px-1.5 py-0.5 rounded bg-bg-elevated font-mono text-text-primary text-xs">{reportId}</code> was not found in your current browser's local history. Reports are stored strictly on individual devices and may have been evicted (maximum 15 reports) or cleared.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/history" className="w-full sm:w-auto">
              <Button variant="outline" size="md" icon={History} className="w-full sm:w-auto">
                View History
              </Button>
            </Link>
            <Link to="/analyze" className="w-full sm:w-auto">
              <Button variant="primary" size="md" icon={FileSearch} className="w-full sm:w-auto">
                Run New Analysis
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const {
    created_at,
    metadata = {},
    executive_summary,
    scores = {},
    skills_analysis = {},
    job_match_details = {},
    strengths = [],
    improvement_areas = [],
    recommendations = [],
    weak_bullets = [],
  } = report

  const isStudent = metadata?.candidate_profile_type === 'student_or_fresh_graduate'
  const hasJobDescription = Boolean(metadata?.has_job_description)
  const isJobMatchAvailable = Boolean(scores?.job_match?.is_available && hasJobDescription)

  const totalSkillsCount =
    (skills_analysis?.technical_skills?.length || 0) +
    (skills_analysis?.tools_and_technologies?.length || 0) +
    (skills_analysis?.soft_skills?.length || 0)

  return (
    <div className="space-y-8 py-4 sm:py-6">
      {/* 1. Report Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 rounded-2xl border border-border-subtle bg-bg-surface shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/history"
              className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>History</span>
            </Link>
            <span className="text-text-secondary/40">•</span>
            <Badge variant="primary" size="sm">
              Analysis Report
            </Badge>
            <span className="font-mono text-xs text-text-secondary bg-bg-elevated px-2 py-0.5 rounded">
              {reportId}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-2.5">
            <FileText className="h-7 w-7 text-brand-primary shrink-0" />
            <span className="truncate">{metadata?.resume_filename || 'Uploaded Resume'}</span>
          </h1>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-text-secondary pt-1">
            {metadata?.target_role ? (
              <Badge variant="info" size="sm" icon={Target}>
                Target: {metadata.target_role}
              </Badge>
            ) : (
              <Badge variant="outline" size="sm" icon={FileSearch}>
                General Resume Audit
              </Badge>
            )}

            {isStudent ? (
              <Badge variant="primary" size="sm" icon={GraduationCap}>
                Student / Fresh Graduate
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm" icon={Briefcase}>
                Experienced Candidate
              </Badge>
            )}

            <span className="inline-flex items-center gap-1.5 text-text-secondary">
              <Calendar className="h-3.5 w-3.5" />
              {created_at ? new Date(created_at).toLocaleString() : 'Recent'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Link to="/analyze">
            <Button size="sm" variant="outline" icon={FileSearch}>
              Analyze Another Resume
            </Button>
          </Link>
          <Button
            size="sm"
            variant="destructive"
            icon={Trash2}
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Delete Report
          </Button>
        </div>
      </div>

      {/* Truncation Notice Banner (if resume exceeded 3000 words) */}
      {metadata?.text_truncated && (
        <Alert
          variant="warning"
          title="Document Text Truncated"
          message="This resume exceeded the 3,000-word processing limit. Only the first 3,000 words were evaluated. Consider condensing earlier experiences to maximize automated and recruiter scannability."
        />
      )}

      {/* 2. Top Executive Score Row (3 Recharts Radial Gauge Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score 1: Resume Quality */}
        <ScoreGaugeCard
          title="Resume Quality"
          score={scores?.resume_quality?.score}
          tier={scores?.resume_quality?.tier}
          explanation={scores?.resume_quality?.explanation}
          icon={Sparkles}
        />

        {/* Score 2: Job Match Score */}
        <ScoreGaugeCard
          title="Job Match Score"
          score={scores?.job_match?.score}
          tier={scores?.job_match?.tier}
          explanation={scores?.job_match?.explanation}
          isAvailable={isJobMatchAvailable}
          icon={Target}
        />

        {/* Score 3: ATS-Readability */}
        <ScoreGaugeCard
          title="ATS-Readability"
          score={scores?.ats_readability?.score}
          tier={scores?.ats_readability?.tier}
          explanation={scores?.ats_readability?.explanation}
          disclaimer={
            scores?.ats_readability?.disclaimer ||
            'General text-extraction and structural readability heuristic. Not an official commercial ATS score.'
          }
          icon={ShieldCheck}
        />
      </div>

      {/* 3. Four-Tab Detailed Breakdown */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
          <TabsTrigger value="overview" icon={Sparkles}>
            Overview &amp; Priorities
          </TabsTrigger>
          <TabsTrigger value="explanations" icon={Sliders}>
            Score Explanations
          </TabsTrigger>
          <TabsTrigger
            value="skills_match"
            icon={Target}
            badge={totalSkillsCount > 0 ? totalSkillsCount : undefined}
          >
            Skills &amp; JD Match
          </TabsTrigger>
          <TabsTrigger
            value="bullet_audit"
            icon={CheckCircle2}
            badge={weak_bullets?.length > 0 ? weak_bullets.length : undefined}
          >
            Bullet-Point Audit &amp; ATS Checks
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview & Priorities */}
        <TabsContent value="overview">
          <RecommendationsList
            executiveSummary={executive_summary}
            strengths={strengths}
            improvementAreas={improvement_areas}
            recommendations={recommendations}
          />
        </TabsContent>

        {/* Tab 2: Score Explanations */}
        <TabsContent value="explanations">
          <CriteriaBreakdown scores={scores} />
        </TabsContent>

        {/* Tab 3: Skills & JD Match */}
        <TabsContent value="skills_match" className="space-y-6">
          <SkillsMatrix skillsAnalysis={skills_analysis} />

          {hasJobDescription ? (
            <JobMatchTable requirements={job_match_details?.requirements || []} />
          ) : (
            <Card className="p-8 text-center border-dashed border-2 border-border-subtle bg-bg-surface/50 space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto">
                <Target className="h-7 w-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="font-bold text-base text-text-primary">
                  No Target Job Description Provided
                </h4>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  This report was generated in General Resume Audit mode. To discover missing keywords, technical requirements, and role-specific match percentages, run an analysis with a target job posting.
                </p>
              </div>
              <div className="pt-2">
                <Link to="/analyze">
                  <Button variant="primary" size="sm" icon={FileSearch}>
                    Run Targeted Job Match Analysis
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Tab 4: Bullet-Point Audit & ATS Checks */}
        <TabsContent value="bullet_audit" className="space-y-8">
          {/* Section A: Weak Bullets Audit */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-brand-primary" />
                  Bullet-Point Quality Audit
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Action-verb and outcome-driven evaluation of your experience and project bullet points.
                </p>
              </div>
              <Badge variant={weak_bullets?.length > 0 ? 'warning' : 'success'} size="md">
                {weak_bullets?.length > 0
                  ? `${weak_bullets.length} Improvement Opportunities`
                  : 'All Bullets Passed'}
              </Badge>
            </div>

            {weak_bullets && weak_bullets.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {weak_bullets.map((bullet, idx) => (
                  <Card
                    key={`weak-bullet-${idx}`}
                    className="border-border-subtle hover:border-brand-primary/40 transition-colors p-5 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" size="sm">
                          {bullet.section || 'Experience / Projects'}
                        </Badge>
                        <span className="text-xs font-semibold text-status-warning flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Needs Stronger Impact / Outcome
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={PenTool}
                        onClick={() =>
                          navigate('/rewriter', {
                            state: {
                              bulletText: bullet.original_text,
                              targetRole: metadata?.target_role || '',
                            },
                          })
                        }
                      >
                        Rewrite This Bullet
                      </Button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-bg-elevated/70 border border-border-subtle text-xs sm:text-sm text-text-primary font-mono leading-relaxed">
                      "{bullet.original_text}"
                    </div>

                    <div className="text-xs text-text-secondary leading-relaxed flex items-start gap-2 pt-1">
                      <span className="font-semibold text-text-primary shrink-0">Issue Detected:</span>
                      <span>{bullet.issue}</span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 border-status-excellent/30 bg-status-excellent/5 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-status-excellent mx-auto" />
                <h4 className="font-bold text-sm text-text-primary">
                  No Critical Weak Bullets Detected
                </h4>
                <p className="text-xs text-text-secondary max-w-md mx-auto">
                  Your scanned experience and project bullet points consistently start with recognized action verbs and present clear descriptions.
                </p>
              </Card>
            )}
          </div>

          {/* Section B: ATS-Readability Diagnostic Checklist */}
          <Card className="space-y-4">
            <CardHeader className="pb-3 border-b border-border-subtle">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-brand-primary" />
                  <div>
                    <CardTitle className="text-lg">ATS-Readability Diagnostic Checklist</CardTitle>
                    <CardDescription>
                      Deterministic verification of text extractability, section headings, contacts, and formatting cleanliness.
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="success" size="md">
                  Score: {scores?.ats_readability?.score ?? 0} / 100
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {(scores?.ats_readability?.criteria_breakdown || []).map((item) => {
                const isFull = item.earned === item.max_points
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-border-subtle bg-bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-bg-elevated/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {isFull ? (
                          <CheckCircle2 className="h-5 w-5 text-status-excellent" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-status-warning" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" size="sm">
                            {item.id}
                          </Badge>
                          <span className="font-semibold text-sm text-text-primary">
                            {item.name}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {item.note}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      <Badge variant={isFull ? 'success' : 'warning'} size="sm">
                        {item.earned} / {item.max_points} pts
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Analysis Report?"
        description={`Are you sure you want to delete the report for "${metadata?.resume_filename || 'this resume'}"? It will be permanently removed from your browser's local storage.`}
        confirmLabel="Delete Report"
        cancelLabel="Cancel"
        isDestructive={true}
      />
    </div>
  )
}

export default ReportPage
