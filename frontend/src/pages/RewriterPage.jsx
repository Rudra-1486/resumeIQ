import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  PenTool,
  Sparkles,
  Copy,
  Check,
  Lightbulb,
  ArrowRight,
  Info,
  AlertCircle,
  RefreshCw,
  FileText,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'
import { rewriteBullet, extractErrorMessage } from '../api/client'

/**
 * AI Bullet-Point Rewriter Page (PRD Section 11 & Section 18.4)
 * 
 * Enforces strict anti-hallucination and fact preservation rules (FR-046 & EC-20).
 */
export function RewriterPage() {
  const location = useLocation()
  const initialBullet = location.state?.bulletText || ''
  const initialRole = location.state?.targetRole || ''

  const [originalBullet, setOriginalBullet] = useState(initialBullet)
  const [targetRole, setTargetRole] = useState(initialRole)
  const [rewriteStyle, setRewriteStyle] = useState('action_oriented')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [resultData, setResultData] = useState(null)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [clipboardError, setClipboardError] = useState(null)

  // Pre-fill input when navigated from a weak bullet in ReportPage (PRD Section 11.6)
  useEffect(() => {
    if (location.state?.bulletText) {
      setOriginalBullet(location.state.bulletText)
    }
    if (location.state?.targetRole) {
      setTargetRole(location.state.targetRole)
    }
  }, [location.state])

  const sampleWeakBullet =
    'Worked on creating backend APIs for college portal using Python.'

  const handleLoadSample = () => {
    setOriginalBullet(sampleWeakBullet)
    if (!targetRole) {
      setTargetRole('Python Backend Developer')
    }
    setError(null)
    setClipboardError(null)
  }

  const handleGenerate = async () => {
    const trimmed = originalBullet.trim()
    if (trimmed.length < 15 || trimmed.length > 600) return

    setLoading(true)
    setError(null)
    setClipboardError(null)

    try {
      const response = await rewriteBullet({
        originalBullet: trimmed,
        targetRole: targetRole.trim(),
        rewriteStyle,
      })

      if (response?.data) {
        setResultData(response.data)
      } else {
        throw new Error('Unexpected response format from server.')
      }
    } catch (err) {
      const extracted = extractErrorMessage(err)
      setError(extracted.message)
    } finally {
      setLoading(false)
    }
  }

  // Robust clipboard copy with fallback (PRD EC-20)
  const handleCopy = async (text, index) => {
    setClipboardError(null)
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
        return
      }
      throw new Error('Standard clipboard API unavailable')
    } catch (primaryErr) {
      // Fallback via hidden textarea
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)

        if (successful) {
          setCopiedIndex(index)
          setTimeout(() => setCopiedIndex(null), 2000)
          return
        }
      } catch (fallbackErr) {
        console.warn('Fallback clipboard copy failed:', fallbackErr)
      }

      // If both copy mechanisms fail, notify user with manual prompt (EC-20)
      setClipboardError(
        'Automatic copy was blocked by your browser—press Ctrl+C (or Cmd+C) to copy the selected text.'
      )
      window.prompt(
        'Automatic copy was blocked by your browser—press Ctrl+C (or Cmd+C) to copy:',
        text
      )
    }
  }

  const bulletCharCount = originalBullet.trim().length
  const isCharCountValid = bulletCharCount >= 15 && bulletCharCount <= 600

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 sm:py-6">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm">
          <PenTool className="h-4 w-4" />
          <span>Factual Achievement Refinement</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          AI Bullet-Point Rewriter
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
          Transform passive or vague resume bullet points into high-impact accomplishment statements.
          The AI strictly preserves your provided facts and does not fabricate metrics or technologies.
        </p>
      </div>

      {/* Mandatory Fact-Verification Banner (PRD Section 10.I FR-046) */}
      <Alert variant="warning" title="Strict Fact-Preservation Commitment">
        AI-generated suggestions preserve your supplied facts. Always verify that every phrasing
        accurately reflects your real work before adding it to your resume.
      </Alert>

      {/* Clipboard Warning Banner (EC-20) */}
      {clipboardError && (
        <Alert variant="info" title="Manual Copy Required">
          {clipboardError}
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" title="Generation Failed">
          {error}
        </Alert>
      )}

      {/* Main Grid: Input Form vs Results Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">Input Bullet Point</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Lightbulb}
                  onClick={handleLoadSample}
                  className="text-xs text-brand-primary hover:text-brand-primary/80 p-1"
                >
                  Load Sample Weak Bullet
                </Button>
              </div>
              <CardDescription>
                Paste a single responsibility or project bullet point (15 to 600 characters).
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Textarea for Original Bullet */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="bullet-input"
                    className="text-xs font-semibold uppercase tracking-wider text-text-primary"
                  >
                    Original Bullet Point <span className="text-status-danger">*</span>
                  </label>
                  <span
                    className={`text-xs font-mono font-medium ${
                      originalBullet.length > 600
                        ? 'text-status-danger'
                        : originalBullet.length > 0 && originalBullet.length < 15
                        ? 'text-status-warning'
                        : 'text-text-secondary'
                    }`}
                  >
                    {originalBullet.length} / 600 chars
                  </span>
                </div>

                <textarea
                  id="bullet-input"
                  rows={4}
                  value={originalBullet}
                  onChange={(e) => setOriginalBullet(e.target.value)}
                  placeholder="e.g. Worked on creating backend APIs for college portal using Python."
                  className="w-full p-3.5 rounded-xl border border-border-subtle bg-bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all placeholder:text-text-secondary/50 resize-y"
                />

                {originalBullet.length > 0 && originalBullet.length < 15 && (
                  <p className="text-xs text-status-warning flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    Bullet must be at least 15 characters long ({15 - originalBullet.length} more needed).
                  </p>
                )}
                {originalBullet.length > 600 && (
                  <p className="text-xs text-status-danger flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    Bullet exceeds the 600-character maximum by {originalBullet.length - 600} characters.
                  </p>
                )}
              </div>

              {/* Input for Optional Target Role Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="target-role-input"
                    className="text-xs font-semibold uppercase tracking-wider text-text-primary"
                  >
                    Target Role Title <span className="text-text-secondary font-normal">(Optional)</span>
                  </label>
                  <span className="text-xs font-mono text-text-secondary">
                    {targetRole.length} / 100
                  </span>
                </div>
                <input
                  id="target-role-input"
                  type="text"
                  maxLength={100}
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Junior Python Backend Developer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all placeholder:text-text-secondary/50"
                />
              </div>

              {/* Segmented Style Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-primary block">
                  Rewrite Style
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'action_oriented',
                      title: 'Action-Oriented & Impactful',
                      description: 'Emphasizes strong action verbs, initiative, and outcomes',
                    },
                    {
                      id: 'concise',
                      title: 'Concise & Direct',
                      description: 'Eliminates filler words to maximize brevity and resume space',
                    },
                    {
                      id: 'technical_detail',
                      title: 'Technical Clarity Focus',
                      description: 'Highlights technical stack, tooling, and engineering architecture',
                    },
                  ].map((style) => (
                    <label
                      key={style.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        rewriteStyle === style.id
                          ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-medium'
                          : 'border-border-subtle bg-bg-elevated/40 text-text-secondary hover:bg-bg-elevated'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rewrite_style"
                        value={style.id}
                        checked={rewriteStyle === style.id}
                        onChange={(e) => setRewriteStyle(e.target.value)}
                        className="mt-0.5 accent-brand-primary"
                      />
                      <div className="text-xs space-y-0.5">
                        <span className="font-semibold block text-text-primary">
                          {style.title}
                        </span>
                        <span className="text-text-secondary text-[11px] block">
                          {style.description}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  size="md"
                  variant="primary"
                  icon={loading ? RefreshCw : Sparkles}
                  loading={loading}
                  disabled={!isCharCountValid || loading}
                  onClick={handleGenerate}
                  className="w-full justify-center shadow-md shadow-brand-primary/20"
                >
                  Generate 3 Variations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Loading State: 3 Animated Skeleton Cards */}
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center justify-between pb-2">
                <div className="h-5 w-48 bg-bg-elevated rounded-lg" />
                <div className="h-5 w-24 bg-bg-elevated rounded-lg" />
              </div>

              {[1, 2, 3].map((skeletonIdx) => (
                <div
                  key={`skeleton-${skeletonIdx}`}
                  className="p-5 rounded-2xl border border-border-subtle bg-bg-surface space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-36 bg-bg-elevated rounded" />
                    <div className="h-7 w-20 bg-bg-elevated rounded-lg" />
                  </div>
                  <div className="p-3.5 rounded-lg bg-bg-elevated/50 space-y-2">
                    <div className="h-3 w-full bg-bg-elevated rounded" />
                    <div className="h-3 w-4/5 bg-bg-elevated rounded" />
                  </div>
                  <div className="h-3 w-2/3 bg-bg-elevated rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State: Before Generation */}
          {!loading && !resultData && (
            <Card className="p-6 sm:p-8 space-y-6 border border-border-subtle bg-bg-surface">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-text-primary">
                    How the Factual Rewriter Works
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary">
                    Industry standard STAR / XYZ methodology for compelling resume bullets.
                  </p>
                </div>
              </div>

              {/* Educational Before / After Student Project Example */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-text-primary uppercase tracking-wider block">
                  Example Before &amp; After (Student Project)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before */}
                  <div className="p-4 rounded-xl border border-status-danger/30 bg-status-danger/5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-status-danger uppercase tracking-wider">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Before (Passive &amp; Vague)
                    </div>
                    <p className="text-xs text-text-primary font-mono leading-relaxed">
                      "Worked on creating backend APIs for college portal using Python."
                    </p>
                    <p className="text-[11px] text-text-secondary pt-1">
                      <em>Issue:</em> Passive phrase ("worked on"), missing architectural scope, no outcome.
                    </p>
                  </div>

                  {/* After */}
                  <div className="p-4 rounded-xl border border-status-excellent/30 bg-status-excellent/5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-status-excellent uppercase tracking-wider">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      After (Action &amp; Clarity)
                    </div>
                    <p className="text-xs text-text-primary font-mono leading-relaxed">
                      "Engineered 12 RESTful API endpoints for the university student portal using FastAPI and PostgreSQL, enabling automated course registrations for 2,500+ active students."
                    </p>
                    <p className="text-[11px] text-text-secondary pt-1">
                      <em>Why it works:</em> Active verb ("Engineered"), clear deliverables, accurate tech stack.
                    </p>
                  </div>
                </div>
              </div>

              {/* Guidelines list */}
              <div className="p-4 rounded-xl bg-bg-elevated/40 border border-border-subtle space-y-2 text-xs text-text-secondary">
                <span className="font-semibold text-text-primary flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-brand-primary" />
                  Anti-Hallucination Guardrails:
                </span>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Zero invented metrics, percentages, or revenue figures.</li>
                  <li>No fabricated tools or frameworks not mentioned by you.</li>
                  <li>Generates 3 distinct tone variations for different job applications.</li>
                </ul>
              </div>
            </Card>
          )}

          {/* Success State: Results Display */}
          {!loading && resultData && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-primary" />
                  <h3 className="font-bold text-base sm:text-lg text-text-primary">
                    Rewritten Variations
                  </h3>
                </div>
                <Badge variant="primary" size="sm">
                  {resultData.variations?.length || 3} Variations Generated
                </Badge>
              </div>

              {/* Original Bullet Reference Comparison Box */}
              <div className="p-4 rounded-xl border border-border-subtle bg-bg-elevated/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                    Original Bullet Reference
                  </span>
                  {resultData.target_role && (
                    <Badge variant="outline" size="sm">
                      Target Role: {resultData.target_role}
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-text-primary font-mono italic">
                  "{resultData.original_bullet || originalBullet}"
                </p>
              </div>

              {/* 3 Variation Cards */}
              <div className="space-y-4">
                {resultData.variations?.map((item, idx) => (
                  <Card
                    key={item.id || `var-${idx}`}
                    className="p-5 space-y-3 hover:border-brand-primary/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-text-primary">
                          Variation {idx + 1}: {item.style_label}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant={copiedIndex === idx ? 'secondary' : 'outline'}
                        icon={copiedIndex === idx ? Check : Copy}
                        onClick={() => handleCopy(item.rewritten_text, idx)}
                      >
                        {copiedIndex === idx ? 'Copied!' : 'Copy Bullet'}
                      </Button>
                    </div>

                    {/* Rewritten Bullet Text */}
                    <div className="p-3.5 rounded-xl bg-bg-elevated/70 border border-border-subtle font-mono text-xs sm:text-sm text-text-primary leading-relaxed">
                      &bull; {item.rewritten_text}
                    </div>

                    {/* Why This Works Explanation */}
                    <div className="flex items-start gap-2 text-xs text-text-secondary pt-1">
                      <Info className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Why This Works:</strong>{' '}
                        {item.improvements_made}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Optional Metric Suggestion Box */}
              {resultData.missing_metrics_hint && (
                <Card className="p-4 border border-dashed border-status-warning/40 bg-status-warning/5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-status-warning">
                    <Lightbulb className="h-4 w-4" />
                    <span>Real Metric Suggestions (Self-Measured)</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {resultData.missing_metrics_hint}
                  </p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RewriterPage
