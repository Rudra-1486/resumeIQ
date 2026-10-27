import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileSearch,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Info,
} from 'lucide-react'

import { useTheme } from '../context/ThemeContext'
import { useReportHistory } from '../hooks/useReportHistory'
import { analyzeResume, extractErrorMessage } from '../api/client'
import { validateResumeFile, validateJobDescription } from '../utils/fileValidation'

import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'

import { FileDropzone } from '../components/analyzer/FileDropzone'
import { JobDescriptionInput } from '../components/analyzer/JobDescriptionInput'
import { AnalysisProgress } from '../components/analyzer/AnalysisProgress'

/**
 * Main Resume Analyzer upload and configuration page (PRD Section 11.3)
 */
export function AnalyzerPage() {
  const navigate = useNavigate()
  const { autoSaveReports } = useTheme()
  const { saveReport } = useReportHistory()

  // Form state
  const [file, setFile] = useState(null)
  const [targetRole, setTargetRole] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  // UI state
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [errorInfo, setErrorInfo] = useState(null) // { message, code, details }

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setErrorInfo(null)
  }

  const handleFileRemove = () => {
    setFile(null)
    setErrorInfo(null)
  }

  const handleResetForm = () => {
    setFile(null)
    setTargetRole('')
    setJobDescription('')
    setErrorInfo(null)
  }

  const handleAnalyze = async () => {
    setErrorInfo(null)

    // 1. Client-side file validation
    const fileValidation = validateResumeFile(file)
    if (!fileValidation.valid) {
      setErrorInfo(fileValidation.error)
      return
    }

    // 2. Client-side job description validation
    const jdValidation = validateJobDescription(jobDescription)
    if (!jdValidation.valid) {
      setErrorInfo(jdValidation.error)
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await analyzeResume(file, jobDescription, targetRole)
      const reportData = response.data

      // Persist to local storage if auto_save_reports preference is enabled (PRD Section 19.3)
      if (autoSaveReports && reportData) {
        const historyItem = {
          report_id: reportData.report_id,
          created_at: reportData.created_at,
          summary: {
            resume_filename: reportData.metadata.resume_filename,
            target_role: reportData.metadata.target_role || '',
            has_job_description: reportData.metadata.has_job_description,
            resume_quality_score: reportData.scores.resume_quality.score,
            job_match_score: reportData.scores.job_match?.score ?? null,
            ats_readability_score: reportData.scores.ats_readability.score,
          },
          full_report: reportData,
        }
        saveReport(historyItem)
      }

      // Navigate immediately with state payload so it renders even if auto-save was disabled
      navigate(`/report/${reportData.report_id}`, {
        state: { report: reportData },
      })
    } catch (err) {
      console.error('[ResumeIQ Analyzer] Analysis request failed:', err)
      const parsedError = extractErrorMessage(err)
      setErrorInfo(parsedError)
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 sm:py-6">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm">
          <FileSearch className="h-4 w-4" />
          <span>Resume Diagnostic Pipeline</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Resume Analyzer
        </h1>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-3xl">
          Upload your resume in PDF or DOCX format for an instant hybrid evaluation. Optionally provide a target job posting to measure technical alignment and discover missing requirements.
        </p>
      </div>

      {/* Main Analysis Form or In-Flight Loading Progress */}
      {isAnalyzing ? (
        <div className="py-12">
          <AnalysisProgress hasJobDescription={Boolean(jobDescription?.trim())} />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Error Banner */}
          {errorInfo && (
            <Alert
              variant="danger"
              title={errorInfo.code ? `Error (${errorInfo.code})` : 'Analysis Failed'}
              icon={AlertCircle}
              className="animate-in fade-in-50 duration-200"
            >
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
                  {errorInfo.message}
                </p>

                {errorInfo.details && (
                  <div className="p-2.5 rounded-lg bg-bg-surface/60 border border-status-danger/20 text-xs font-mono text-text-secondary">
                    {JSON.stringify(errorInfo.details, null, 2)}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    icon={Sparkles}
                    onClick={handleAnalyze}
                  >
                    Retry Analysis
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setErrorInfo(null)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </Alert>
          )}

          {/* Two-Column Form Layout (PRD Section 11.3) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left Column: Step 1 Upload Resume */}
            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Step 1: Upload Your Resume</CardTitle>
                  <Badge variant="primary" size="sm">Required</Badge>
                </div>
                <CardDescription>
                  Selectable text documents in <code>.pdf</code> or <code>.docx</code> format (up to 5 MB).
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                <FileDropzone
                  file={file}
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  onError={(err) => setErrorInfo(err)}
                  disabled={isAnalyzing}
                />

                <div className="p-3.5 rounded-xl border border-border-subtle bg-bg-elevated/30 flex items-start gap-2.5 text-xs text-text-secondary">
                  <Info className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Text Quality Reminder:</strong> Use standard single-column text resumes. Scanned photocopies or image-only documents cannot be read because OCR is not supported in the MVP.
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Right Column: Step 2 Job Target */}
            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Step 2: Target Role &amp; Job Posting</CardTitle>
                  <Badge variant="outline" size="sm">Optional</Badge>
                </div>
                <CardDescription>
                  Paste a target job posting to unlock semantic keyword matching and role alignment scores.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <JobDescriptionInput
                  targetRole={targetRole}
                  onTargetRoleChange={setTargetRole}
                  jobDescription={jobDescription}
                  onJobDescriptionChange={setJobDescription}
                  disabled={isAnalyzing}
                />

                <div className="p-3.5 rounded-xl border border-border-subtle bg-bg-elevated/30 flex items-start gap-2.5 text-xs text-text-secondary">
                  <ShieldCheck className="h-4 w-4 text-status-excellent shrink-0 mt-0.5" />
                  <span>
                    <strong>Student Fairness Applied:</strong> Evaluates your strongest combination of projects, capstones, and internships with full credit.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Action Bar */}
          <div className="p-5 sm:p-6 rounded-2xl border border-border-subtle bg-bg-surface shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Privacy notice */}
            <div className="flex items-center gap-2 text-xs text-text-secondary text-center sm:text-left">
              <ShieldCheck className="h-4 w-4 text-brand-primary shrink-0" />
              <span>
                Processed in volatile memory &amp; sent to Groq API. Resumes are never stored on any server database.{' '}
                <Link
                  to="/privacy"
                  className="text-brand-primary underline hover:text-brand-primary/80 inline-flex items-center gap-0.5"
                >
                  Privacy Details <ExternalLink className="h-3 w-3" />
                </Link>
              </span>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {(file || jobDescription || targetRole) && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  icon={RotateCcw}
                  onClick={handleResetForm}
                  disabled={isAnalyzing}
                >
                  Reset
                </Button>
              )}

              <Button
                type="button"
                variant="primary"
                size="lg"
                icon={Sparkles}
                disabled={!file || isAnalyzing}
                onClick={handleAnalyze}
                className="w-full sm:w-auto shadow-md shadow-brand-primary/20"
              >
                Analyze Resume
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalyzerPage
