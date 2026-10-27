import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  FileSearch,
  PenTool,
  Upload,
  FileText,
  Cpu,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Target,
  Layers,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

export function LandingPage() {
  const [activePreviewTab, setActivePreviewTab] = useState('scores')

  return (
    <div className="space-y-16 sm:space-y-24 py-4 sm:py-8">
      {/* 1. Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs sm:text-sm font-medium animate-in fade-in duration-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI-Assisted Resume &amp; Job Match Analyzer</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.15]">
          Analyze Your Resume.{' '}
          <span className="bg-gradient-to-r from-brand-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Discover Your Potential.
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto">
          Bridge the feedback gap with instantaneous, explainable resume evaluations. 
          Combines deterministic document layout checks with Groq-powered semantic reasoning—built specifically for students and early-career candidates.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/analyze" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" icon={FileSearch} className="w-full sm:w-auto shadow-lg shadow-brand-primary/25">
              Analyze My Resume
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <Link to="/rewriter" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" icon={PenTool} className="w-full sm:w-auto">
              Try Bullet Rewriter
            </Button>
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-status-excellent" /> No Server Database (In-Memory)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-status-excellent" /> PDF &amp; DOCX Support (Up to 5 MB)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-status-excellent" /> Zero Account Required
          </span>
        </div>
      </section>

      {/* 2. Interactive Static Score Preview Showcase */}
      <section className="max-w-4xl mx-auto">
        <Card className="border-border-subtle bg-bg-surface shadow-xl overflow-hidden">
          <div className="border-b border-border-subtle bg-bg-elevated/50 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-status-excellent animate-pulse" />
              <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                Sample Report Preview: Junior Full-Stack Developer
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActivePreviewTab('scores')}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activePreviewTab === 'scores'
                    ? 'bg-brand-primary text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Score Gauges
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('details')}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activePreviewTab === 'details'
                    ? 'bg-brand-primary text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Sample Findings
              </button>
            </div>
          </div>

          <CardContent className="p-6">
            {activePreviewTab === 'scores' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Score 1 */}
                <div className="p-4 rounded-xl border border-border-subtle bg-bg-elevated/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Resume Quality
                    </span>
                    <Badge variant="success">Strong</Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-status-excellent">84</span>
                    <span className="text-xs text-text-secondary">/ 100</span>
                  </div>
                  <div className="w-full bg-border-subtle rounded-full h-2 overflow-hidden">
                    <div className="bg-status-excellent h-2 rounded-full w-[84%]" />
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Evaluates completeness, contact info, experiential project evidence, and action verbs.
                  </p>
                </div>

                {/* Score 2 */}
                <div className="p-4 rounded-xl border border-border-subtle bg-bg-elevated/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Job Match
                    </span>
                    <Badge variant="info">Target Matched</Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-status-strong">78</span>
                    <span className="text-xs text-text-secondary">/ 100</span>
                  </div>
                  <div className="w-full bg-border-subtle rounded-full h-2 overflow-hidden">
                    <div className="bg-status-strong h-2 rounded-full w-[78%]" />
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Compares skills against target JD; 11 required skills explicitly or conceptually verified.
                  </p>
                </div>

                {/* Score 3 */}
                <div className="p-4 rounded-xl border border-border-subtle bg-bg-elevated/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      ATS Readability
                    </span>
                    <Badge variant="success">High Heuristic</Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-status-excellent">92</span>
                    <span className="text-xs text-text-secondary">/ 100</span>
                  </div>
                  <div className="w-full bg-border-subtle rounded-full h-2 overflow-hidden">
                    <div className="bg-status-excellent h-2 rounded-full w-[92%]" />
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Deterministic checks for standard headings, email regex, single-column parsing, and text density.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-status-excellent/30 bg-status-excellent/5 space-y-2">
                  <div className="flex items-center gap-2 text-status-excellent font-semibold text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Identified Key Strengths</span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary">
                    Demonstrates strong academic project ownership with clear technical tools (React, Node.js, PostgreSQL). Contact email and GitHub portfolio links are cleanly parsed.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-status-warning/30 bg-status-warning/5 space-y-2">
                  <div className="flex items-center gap-2 text-status-warning font-semibold text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>Priority Recommendation</span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary">
                    Transform 3 passive project bullets into outcome-driven statements using the built-in AI Bullet Rewriter. Add concrete test coverage or latency details if known.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 3. How It Works (4-Step Horizontal Strip) */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            How ResumeIQ Evaluates Your Resume
          </h2>
          <p className="text-sm sm:text-base text-text-secondary">
            A transparent 4-stage pipeline that runs in seconds without keeping your documents on a server.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="relative p-6 rounded-2xl border border-border-subtle bg-bg-surface space-y-3 group hover:border-brand-primary/50 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-semibold text-base text-text-primary">Upload Document</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Upload your resume in <code>.pdf</code> or <code>.docx</code> format (up to 5 MB). Dual validation checks file integrity and text extractability.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative p-6 rounded-2xl border border-border-subtle bg-bg-surface space-y-3 group hover:border-brand-primary/50 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-status-strong/10 text-status-strong flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-semibold text-base text-text-primary">Add Job Target</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Optionally paste a target job description. When provided, ResumeIQ cross-references requirements to detect matching and missing skills.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative p-6 rounded-2xl border border-border-subtle bg-bg-surface space-y-3 group hover:border-brand-primary/50 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-semibold text-base text-text-primary">Hybrid Analysis</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Deterministic Python rules inspect section structure and contact regex, while Groq LLM performs deep semantic and contextual reasoning.
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative p-6 rounded-2xl border border-border-subtle bg-bg-surface space-y-3 group hover:border-brand-primary/50 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-status-excellent/10 text-status-excellent flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="font-semibold text-base text-text-primary">Actionable Feedback</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Review structured score breakdowns, categorized skill badges, and send weak bullet points directly to the factual rewriter tool.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Capabilities Grid (6 Cards) */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Engineered Capabilities
          </h2>
          <p className="text-sm sm:text-base text-text-secondary">
            Built from first principles with zero superficial metrics and complete algorithmic explainability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:border-border-subtle/80 transition-colors">
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-2">
                <FileSearch className="h-5 w-5" />
              </div>
              <CardTitle>Resume Quality Audit</CardTitle>
              <CardDescription>
                Evaluates section completeness, contact presence, experiential depth, and bullet clarity. Respects student project portfolios equally with corporate experience.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-border-subtle/80 transition-colors">
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-status-strong/10 text-status-strong flex items-center justify-center mb-2">
                <Target className="h-5 w-5" />
              </div>
              <CardTitle>Job Description Matching</CardTitle>
              <CardDescription>
                Classifies job requirements into explicitly found, related/equivalent, or missing. Provides evidence citations for every detected requirement.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-border-subtle/80 transition-colors">
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-status-excellent/10 text-status-excellent flex items-center justify-center mb-2">
                <Sliders className="h-5 w-5" />
              </div>
              <CardTitle>ATS-Readability Heuristics</CardTitle>
              <CardDescription>
                Checks text extractability, standard headings, email regex, and single-column formatting balance—measuring machine readability objectively.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-border-subtle/80 transition-colors">
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2">
                <PenTool className="h-5 w-5" />
              </div>
              <CardTitle>Truthful Bullet Rewriter</CardTitle>
              <CardDescription>
                Generates 3 distinct variations (Action-Oriented, Concise, Technical). Strictly preserves your real facts without inventing fake metrics or employers.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-border-subtle/80 transition-colors">
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                <Layers className="h-5 w-5" />
              </div>
              <CardTitle>Skill Evidence Extraction</CardTitle>
              <CardDescription>
                Categorizes skills into Technical, Tools, and Soft Skills. Each skill includes a confidence tier and section reference where evidence was identified.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-border-subtle/80 transition-colors">
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-2">
                <Database className="h-5 w-5" />
              </div>
              <CardTitle>Browser-Local History</CardTitle>
              <CardDescription>
                Stores up to 15 recent reports safely in browser <code>localStorage</code>. No server database, no user accounts, and zero cloud document storage.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* 5. Transparency Callout Banner (FR-004 & FR-005) */}
      <section className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-text-primary">
                Commitment to Transparency &amp; Data Privacy
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary">
                Designed with strict academic integrity and privacy-first architecture.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs sm:text-sm text-text-secondary">
            <div className="flex items-start gap-2.5">
              <Lock className="h-4 w-4 text-status-excellent shrink-0 mt-0.5" />
              <span>
                <strong>In-Memory Processing:</strong> Resumes are processed in volatile RAM on the backend and discarded immediately after response generation.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-status-excellent shrink-0 mt-0.5" />
              <span>
                <strong>Honest Heuristics:</strong> We do not claim official ATS partnership or guaranteed hiring outcomes. All scores are educational guideposts.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Bottom Call to Action */}
      <section className="text-center max-w-xl mx-auto space-y-4 pt-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Ready to Strengthen Your Resume?
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          Upload your document today to receive instant feedback, structural insights, and actionable bullet improvements.
        </p>
        <div className="pt-2">
          <Link to="/analyze">
            <Button size="lg" variant="primary" icon={FileSearch} className="shadow-lg shadow-brand-primary/20">
              Start Free Analysis
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
