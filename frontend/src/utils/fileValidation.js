/**
 * Client-side file and input validation utilities for ResumeIQ AI (PRD Section 3, 10.B, 18.3, 22)
 */

export const MAX_FILE_SIZE_BYTES = 5_242_880 // 5 MB
export const ALLOWED_EXTENSIONS = ['.pdf', '.docx']

/**
 * Format bytes to human-readable string (e.g., "245.1 KB" or "1.8 MB")
 * @param {number} bytes 
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) return '0 B'
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Validate an uploaded resume file before network dispatch (PRD Section 22 EC-01, EC-02, EC-04, EC-07)
 * @param {File} file 
 * @returns {{ valid: boolean, fileType?: 'pdf' | 'docx', error: { code: string, message: string } | null }}
 */
export function validateResumeFile(file) {
  if (!file) {
    return {
      valid: false,
      error: {
        code: 'NO_FILE_SELECTED',
        message: 'Please select a PDF or DOCX resume file to analyze.',
      },
    }
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: {
        code: 'EMPTY_DOCUMENT',
        message: 'The selected document appears to be empty (0 bytes). Please upload a file containing readable text.',
      },
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: `File size (${formatFileSize(file.size)}) exceeds the 5 MB limit. Please upload a smaller PDF or DOCX file.`,
      },
    }
  }

  const filename = file.name || ''
  const dotIndex = filename.lastIndexOf('.')
  if (dotIndex === -1) {
    return {
      valid: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'Unsupported file format. Please upload a .pdf or .docx file.',
      },
    }
  }

  const ext = filename.slice(dotIndex).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: `Unsupported file format "${ext}". Please upload a .pdf or .docx file.`,
      },
    }
  }

  return {
    valid: true,
    fileType: ext === '.pdf' ? 'pdf' : 'docx',
    error: null,
  }
}

/**
 * Validate target job description input (PRD Section 10.B & Section 22 EC-11)
 * @param {string} text 
 * @returns {{ valid: boolean, mode: 'general' | 'targeted', error: { code: string, message: string } | null }}
 */
export function validateJobDescription(text) {
  const trimmed = (text || '').trim()

  // 0 characters is completely valid (General Audit mode)
  if (trimmed.length === 0) {
    return {
      valid: true,
      mode: 'general',
      error: null,
    }
  }

  // 1 to 49 characters is too short for meaningful semantic evaluation
  if (trimmed.length < 50) {
    return {
      valid: false,
      mode: 'targeted',
      error: {
        code: 'JD_TOO_SHORT',
        message: `Please enter at least 50 characters for the job description (currently ${trimmed.length} characters), or leave it blank for a general resume audit.`,
      },
    }
  }

  // 10,000 character maximum ceiling
  if (trimmed.length > 10_000) {
    return {
      valid: false,
      mode: 'targeted',
      error: {
        code: 'JD_TOO_LONG',
        message: `Job description exceeds the 10,000 character maximum limit (currently ${trimmed.length} characters).`,
      },
    }
  }

  return {
    valid: true,
    mode: 'targeted',
    error: null,
  }
}
