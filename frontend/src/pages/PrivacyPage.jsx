import React from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Lock,
  Cpu,
  Database,
  EyeOff,
  Trash2,
  AlertCircle,
  FileCheck,
  Server,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

export function PrivacyPage() {
  const lastUpdated = 'October 22, 2026'

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4 sm:py-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-brand-primary font-semibold text-sm">
          <ShieldCheck className="h-4 w-4" />
          <span>Privacy &amp; Data Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Privacy Policy &amp; Disclosures
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          Last updated: <strong>{lastUpdated}</strong> &bull; ResumeIQ AI is architected with a privacy-by-design model featuring zero server-side databases.
        </p>
      </div>

      {/* Summary Highlight Card */}
      <Card className="border-brand-primary/30 bg-brand-primary/5 p-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary shrink-0">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-1 text-sm text-text-secondary leading-relaxed">
            <h3 className="font-bold text-text-primary text-base">
              Privacy-by-Design at a Glance
            </h3>
            <p>
              ResumeIQ does <strong>not</strong> require an account, does <strong>not</strong> track you with third-party advertising cookies, does <strong>not</strong> archive your resume files to a database, and gives you complete authority to clear all browser-stored report summaries at any time.
            </p>
          </div>
        </div>
      </Card>

      {/* 6 Structured Disclosures (PRD Section 10.M & 11.9) */}
      <div className="space-y-6">
        {/* 1. In-Memory Processing */}
        <Card id="processing">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-status-strong/10 text-status-strong flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <CardTitle>1. How Uploaded Resumes Are Processed</CardTitle>
                <span className="text-xs text-text-secondary">Volatile RAM processing with zero disk retention</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-text-secondary leading-relaxed space-y-2">
            <p>
              When you submit a <code>.pdf</code> or <code>.docx</code> document for evaluation, the file byte stream is read directly into volatile memory (RAM) by the FastAPI application. We use <code>PyMuPDF</code> (for PDFs) and <code>python-docx</code> (for Word files) to parse text strictly in-memory.
            </p>
            <p>
              Uploaded binary files are <strong>never written to a server hard disk</strong>, never copied to cloud storage buckets (such as Amazon S3 or Google Cloud Storage), and are immediately released from memory when the HTTP request completes.
            </p>
          </CardContent>
        </Card>

        {/* 2. Third-Party AI Processing */}
        <Card id="ai-processing">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <CardTitle>2. Third-Party AI Processing (Groq Cloud API)</CardTitle>
                <span className="text-xs text-text-secondary">Low-latency LLM inference via secure HTTPS</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-text-secondary leading-relaxed space-y-2">
            <p>
              To provide semantic resume evaluations and truthful bullet point rewrites, normalized resume text and any job description you enter are transmitted securely via TLS 1.3 HTTPS to the <strong>Groq Cloud API</strong> (running open-weights models like <code>llama-3.3-70b-versatile</code>).
            </p>
            <p>
              Groq processes inference requests in accordance with their commercial API privacy policies. <em>(Note: Gemini is utilized solely by developers as an offline coding assistant and is never called or accessed by the running ResumeIQ application).</em>
            </p>
          </CardContent>
        </Card>

        {/* 3. Browser Local Storage Usage */}
        <Card id="local-storage">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <CardTitle>3. Browser Local Storage Usage</CardTitle>
                <span className="text-xs text-text-secondary">Client-side persistence under user control</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-text-secondary leading-relaxed space-y-2">
            <p>
              ResumeIQ uses your web browser's built-in <code>localStorage</code> mechanism to store two specific items:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>
                <code>resumeiq_ui_preferences_v1</code>: Stores your selected color theme (Light, Dark, System) and whether report history auto-saving is enabled (~200 bytes).
              </li>
              <li>
                <code>resumeiq_report_history_v1</code>: Stores up to 15 structured JSON report summaries (scores, detected skills, improvement notes) so you can review recent audits without re-analyzing (~150–300 KB total).
              </li>
            </ul>
            <p>
              We do <strong>not</strong> store raw PDF or Word binary files or complete raw document text in your browser. Note that browser <code>localStorage</code> is unencrypted by default; if you use a shared public workstation, please clear your history before closing the browser.
            </p>
          </CardContent>
        </Card>

        {/* 4. No Server Database or User Accounts */}
        <Card id="no-accounts">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-status-excellent/10 text-status-excellent flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <CardTitle>4. No Server Database or User Accounts</CardTitle>
                <span className="text-xs text-text-secondary">Zero central data collection footprint</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-text-secondary leading-relaxed space-y-2">
            <p>
              Unlike traditional SaaS platforms, ResumeIQ AI maintains <strong>no user account database</strong>. There are no registration screens, no password hashes, no session tokens, and no user profiles.
            </p>
            <p>
              We do not track you across other websites, do not employ third-party advertising cookies, and do not sell or monetize candidate data under any circumstances.
            </p>
          </CardContent>
        </Card>

        {/* 5. Server Logging Restrictions */}
        <Card id="logging">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm">
                5
              </div>
              <div>
                <CardTitle>5. Server Logging Restrictions</CardTitle>
                <span className="text-xs text-text-secondary">Strict sanitization of backend diagnostic logs</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-text-secondary leading-relaxed space-y-2">
            <p>
              Our backend logging configuration records strictly operational diagnostics: HTTP request method, endpoint path, HTTP status codes, processing latency, and standard error codes.
            </p>
            <p>
              Backend logs <strong>never record candidate personal data</strong>, email addresses, phone numbers, raw resume excerpts, or confidential API keys.
            </p>
          </CardContent>
        </Card>

        {/* 6. Your Control Over Local Data */}
        <Card id="user-control">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-status-danger/10 text-status-danger flex items-center justify-center font-bold text-sm">
                6
              </div>
              <div>
                <CardTitle>6. Your Control Over Local Data</CardTitle>
                <span className="text-xs text-text-secondary">One-click data wiping and JSON export</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-text-secondary leading-relaxed space-y-4">
            <p>
              You maintain total control over every piece of data created while using ResumeIQ AI. You can:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>Export your entire local analysis history as a portable JSON document.</li>
              <li>Delete individual report cards from your history list.</li>
              <li>Permanently purge all saved reports with one click in the Settings tab.</li>
              <li>Disable automatic report saving entirely by turning off the Auto-Save switch.</li>
            </ul>

            <div className="pt-2">
              <Link to="/settings">
                <Button size="sm" variant="outline" icon={Trash2}>
                  Manage or Clear Stored Data in Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PrivacyPage
