import React from 'react'
import {
  Sparkles,
  Cpu,
  Code2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Layers,
  Terminal,
  Zap,
  Info,
  Sliders,
  Scale,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

export function AboutPage() {
  const techStack = [
    { name: 'React 18', role: 'Component-driven Single Page Application', category: 'Frontend' },
    { name: 'Vite 6', role: 'Ultra-fast ESM bundler & build toolchain', category: 'Frontend' },
    { name: 'Tailwind CSS', role: 'Utility-first semantic design token system', category: 'Frontend' },
    { name: 'FastAPI', role: 'High-performance asynchronous Python REST API', category: 'Backend' },
    { name: 'PyMuPDF', role: 'In-memory digital PDF text extraction engine', category: 'Backend' },
    { name: 'python-docx', role: 'In-memory DOCX paragraph and table parsing', category: 'Backend' },
    { name: 'Pydantic v2', role: 'Strict runtime data validation & error schemas', category: 'Backend' },
    { name: 'Groq Cloud API', role: 'Llama 3.3 70B Versatile low-latency LLM inference', category: 'AI Inference' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4 sm:py-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-brand-primary font-semibold text-sm">
          <BookOpen className="h-4 w-4" />
          <span>Undergraduate Academic Project</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          About ResumeIQ AI
        </h1>
        <p className="text-base text-text-secondary leading-relaxed max-w-3xl">
          An explainable, privacy-first resume intelligence platform built to eliminate the silent rejection cycle for students and early-career job seekers.
        </p>
      </div>

      {/* 1. Project Mission & Background */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-primary" />
          Our Mission &amp; Purpose
        </h2>
        <Card className="leading-relaxed text-sm text-text-secondary space-y-3 p-6">
          <p>
            When students and fresh graduates apply for competitive internships or junior software engineering positions, their resumes frequently encounter automated Applicant Tracking Systems (ATS) and time-constrained hiring managers. Most rejections happen without any constructive feedback, leaving candidates unsure whether their failure stemmed from poor document formatting, missing domain keywords, or vaguely worded project statements.
          </p>
          <p>
            <strong>ResumeIQ AI</strong> solves this by offering an objective, instantaneous diagnostic audit before a candidate hits "Submit". It evaluates document structure, benchmarks candidate skills against specific target job postings, and provides actionable, step-by-step guidance on how to strengthen weak bullet points.
          </p>
          <p>
            Developed as an <strong>Undergraduate Minor Project</strong> by a collaborative team of two <strong>Bachelor of Computer Applications (BCA)</strong> students, the platform emphasizes architectural rigor, complete data privacy, and ethical AI utilization.
          </p>
        </Card>
      </section>

      {/* 2. Hybrid Architecture Comparison */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <Layers className="h-5 w-5 text-status-strong" />
            Hybrid Evaluation Pipeline
          </h2>
          <p className="text-sm text-text-secondary">
            Why ResumeIQ pairs deterministic Python rules with large language models instead of relying on AI alone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deterministic Rules */}
          <Card className="border-border-subtle bg-bg-surface space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-status-strong/10 text-status-strong flex items-center justify-center font-bold">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-text-primary">
                  Deterministic Python Engine
                </h3>
                <span className="text-xs text-text-secondary">Objective Structure &amp; Layout Checks</span>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-status-strong shrink-0 mt-0.5" />
                <span>Binary magic byte verification (<code>%PDF-</code> and ZIP PK headers).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-status-strong shrink-0 mt-0.5" />
                <span>Standard heading detection (Education, Skills, Experience, Projects).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-status-strong shrink-0 mt-0.5" />
                <span>Strict regex matching for emails, phone numbers, and profile links.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-status-strong shrink-0 mt-0.5" />
                <span>Word count density bounds (200 to 1,200 words) and ASCII integrity.</span>
              </li>
            </ul>
          </Card>

          {/* Groq LLM Semantic Engine */}
          <Card className="border-border-subtle bg-bg-surface space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-text-primary">
                  Groq LLM Semantic Engine
                </h3>
                <span className="text-xs text-text-secondary">Contextual Reasoning &amp; Fact-Preserved Rewriting</span>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                <span>Semantic skill alignment understanding conceptual equivalents (e.g. Postgres for SQL).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                <span>Fairness for students: credits strong academic projects equally with work history.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                <span>Identifies passive phrasing and weak action verbs in accomplishments.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                <span>Fact-preserving bullet rewrites without fabricating metrics, awards, or companies.</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* 3. Technology Stack */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Terminal className="h-5 w-5 text-brand-primary" />
          Technical Stack
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="p-3.5 rounded-xl border border-border-subtle bg-bg-surface flex items-start justify-between gap-3"
            >
              <div className="space-y-0.5">
                <span className="font-semibold text-sm text-text-primary">{tech.name}</span>
                <p className="text-xs text-text-secondary">{tech.role}</p>
              </div>
              <Badge variant="outline" size="sm">
                {tech.category}
              </Badge>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Responsible AI & MVP Limitations */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Scale className="h-5 w-5 text-status-warning" />
          Ethical AI Commitments &amp; Known Scope Limits
        </h2>
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-text-secondary leading-relaxed">
            <div className="space-y-2">
              <strong className="text-text-primary flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-brand-primary" />
                Zero Hallucinated Metrics
              </strong>
              <p>
                The AI bullet rewriter is programmatically restricted from creating unverified statistics, team headcounts, or revenue figures. If your bullet point lacks metrics, it provides strong qualitative alternatives and actionable suggestions for real metrics you can measure yourself.
              </p>
            </div>

            <div className="space-y-2">
              <strong className="text-text-primary flex items-center gap-1.5">
                <Info className="h-4 w-4 text-status-warning" />
                Heuristic Scores (Not ATS Endorsements)
              </strong>
              <p>
                Our scores reflect general document cleanliness and keyword alignment. Because commercial ATS products (like Workday or Taleo) operate on proprietary closed algorithms, no software can guarantee an official ATS score.
              </p>
            </div>

            <div className="space-y-2">
              <strong className="text-text-primary flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-text-secondary" />
                No OCR in Initial MVP
              </strong>
              <p>
                The current release requires digital, selectable text in PDFs and DOCX files. Image-based scanned documents without text layers are detected and cleanly rejected with an informative advisory.
              </p>
            </div>

            <div className="space-y-2">
              <strong className="text-text-primary flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-status-excellent" />
                In-Memory Ephemeral Storage
              </strong>
              <p>
                Your resume is never stored on backend hard drives or in a central cloud database. Once the analysis finishes and returns to your browser, backend memory buffers are cleared immediately.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}

export default AboutPage
