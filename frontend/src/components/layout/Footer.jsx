import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Shield, Cpu, BookOpen, ExternalLink } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border-subtle bg-bg-surface/60 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-brand-primary flex items-center justify-center text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold text-base text-text-primary">
                Resume<span className="text-brand-primary">IQ</span> AI
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed max-w-md">
              Intelligent resume analysis combining deterministic text-structure verification with Groq-powered semantic reasoning. Designed to bridge the feedback gap for students, freshers, and job seekers.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-elevated border border-border-subtle">
                <BookOpen className="h-3 w-3 text-brand-primary" />
                BCA Minor Project
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-elevated border border-border-subtle">
                <Cpu className="h-3 w-3 text-status-strong" />
                Groq Llama 3.3 70B
              </span>
            </div>
          </div>

          {/* Core Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link to="/analyze" className="hover:text-brand-primary transition-colors">
                  Resume Analyzer
                </Link>
              </li>
              <li>
                <Link to="/rewriter" className="hover:text-brand-primary transition-colors">
                  Bullet Rewriter
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-primary transition-colors">
                  Overview Dashboard
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-brand-primary transition-colors">
                  Local History
                </Link>
              </li>
            </ul>
          </div>

          {/* Project & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Project & Policies
            </h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link to="/about" className="hover:text-brand-primary transition-colors">
                  About Architecture
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-brand-primary transition-colors">
                  Privacy Disclosures
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-brand-primary transition-colors">
                  Local Storage & Preferences
                </Link>
              </li>
              <li>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-brand-primary transition-colors"
                >
                  FastAPI OpenAPI Docs
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Heuristic Disclaimer & Academic Attribution (FR-005) */}
        <div className="pt-6 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
          <p className="leading-relaxed text-center md:text-left max-w-3xl">
            <strong className="text-text-primary">Educational Heuristic Notice:</strong> ResumeIQ AI is an academic undergraduate minor project. All scores, readability metrics, and match percentages are algorithmic heuristic estimates intended for interview preparation and learning. They do not constitute official ATS certifications or guaranteed hiring outcomes. Resumes are processed in volatile memory without server databases.
          </p>
          <div className="shrink-0 text-center md:text-right">
            <span>&copy; {currentYear} ResumeIQ AI &bull; BCA Minor Project</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
