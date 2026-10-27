import React, { useRef, useState } from 'react'
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  FileCode,
  ArrowUpRight,
} from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatFileSize, validateResumeFile } from '../../utils/fileValidation'

/**
 * FileDropzone component for selecting and validating PDF/DOCX resumes (PRD Section 11.3)
 */
export function FileDropzone({
  file,
  onFileSelect,
  onFileRemove,
  onError,
  disabled = false,
}) {
  const fileInputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFile = (selectedFile) => {
    if (!selectedFile) return
    const validation = validateResumeFile(selectedFile)

    if (!validation.valid) {
      if (onError) onError(validation.error)
      return
    }

    if (onError) onError(null)
    onFileSelect(selectedFile, validation.fileType)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (disabled) return

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      handleFile(droppedFile)
    }
  }

  const handleKeyDown = (e) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      fileInputRef.current?.click()
    }
  }

  const isPdf = file?.name?.toLowerCase().endsWith('.pdf')
  const isDocx = file?.name?.toLowerCase().endsWith('.docx')

  return (
    <div className="space-y-4">
      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        id="resume-file-input"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0])
          }
          // Reset value so re-selecting same file triggers change
          e.target.value = ''
        }}
      />

      {file ? (
        /* Selected File Card */
        <div className="p-5 rounded-2xl border-2 border-brand-primary/40 bg-bg-surface shadow-sm space-y-4 transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5 min-w-0">
              <div
                className={`
                  h-12 w-12 rounded-xl flex items-center justify-center shrink-0
                  ${
                    isPdf
                      ? 'bg-status-danger/10 text-status-danger'
                      : 'bg-status-strong/10 text-status-strong'
                  }
                `}
              >
                {isPdf ? <FileText className="h-6 w-6" /> : <FileCode className="h-6 w-6" />}
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-sm font-bold text-text-primary truncate max-w-[260px] sm:max-w-xs"
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  <Badge variant={isPdf ? 'danger' : 'info'} size="sm">
                    {isPdf ? 'PDF' : 'DOCX'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <span>{formatFileSize(file.size)}</span>
                  <span>&bull;</span>
                  <span className="inline-flex items-center gap-1 text-status-excellent font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Valid format &amp; size
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={X}
              onClick={onFileRemove}
              disabled={disabled}
              className="text-text-secondary hover:text-status-danger hover:border-status-danger/40"
              title="Remove or replace file"
            >
              <span className="hidden sm:inline">Change</span>
            </Button>
          </div>

          <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs text-text-secondary">
            <span>Volatile memory parsing only</span>
            <span className="text-text-secondary/60">Zero server retention</span>
          </div>
        </div>
      ) : (
        /* Interactive Dropzone */
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Upload resume in PDF or DOCX format"
          onClick={() => !disabled && fileInputRef.current?.click()}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center
            flex flex-col items-center justify-center gap-4 transition-all duration-200 outline-none
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${
              isDragOver
                ? 'border-brand-primary bg-brand-primary/10 scale-[1.01]'
                : 'border-border-subtle hover:border-brand-primary/60 bg-bg-surface hover:bg-bg-elevated/40'
            }
          `}
        >
          <div
            className={`
              h-14 w-14 rounded-2xl flex items-center justify-center transition-transform duration-200
              ${
                isDragOver
                  ? 'bg-brand-primary text-white scale-110'
                  : 'bg-brand-primary/10 text-brand-primary'
              }
            `}
          >
            <Upload className="h-7 w-7" />
          </div>

          <div className="space-y-1.5 max-w-sm">
            <p className="text-sm sm:text-base font-semibold text-text-primary">
              <span className="text-brand-primary underline underline-offset-2">Click to select</span> or drag &amp; drop
            </p>
            <p className="text-xs text-text-secondary">
              Accepts <strong>.pdf</strong> or <strong>.docx</strong> files up to <strong>5 MB</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" size="sm">
              Single-column text recommended
            </Badge>
            <Badge variant="outline" size="sm">
              No OCR (scans unsupported)
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}
