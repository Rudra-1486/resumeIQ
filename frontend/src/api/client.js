import axios from 'axios'

/**
 * Centralized Axios client for ResumeIQ AI Backend API (PRD Section 18)
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Check backend health and Groq configuration status (PRD Section 18.2)
 * @returns {Promise<{
 *   status: string,
 *   service: string,
 *   version: string,
 *   ai_provider: string,
 *   model: string,
 *   groq_key_configured: boolean,
 *   timestamp: string
 * }>}
 */
export async function checkBackendHealth() {
  const response = await apiClient.get('/api/health')
  return response.data
}

/**
 * Analyze an uploaded resume file and optional job description (PRD Section 18.3)
 * @param {File} file - PDF or DOCX file object
 * @param {string} [jobDescription=''] - Optional target job description
 * @param {string} [targetRole=''] - Optional target job title
 * @returns {Promise<{ status: string, data: object }>}
 */
export async function analyzeResume(file, jobDescription = '', targetRole = '') {
  if (!file) {
    throw new Error('Please select a PDF or DOCX resume file to analyze.')
  }

  const formData = new FormData()
  formData.append('resume_file', file)

  const trimmedJd = (jobDescription || '').trim()
  if (trimmedJd) {
    formData.append('job_description', trimmedJd)
  }

  const trimmedRole = (targetRole || '').trim()
  if (trimmedRole) {
    formData.append('target_role', trimmedRole)
  }

  const response = await apiClient.post('/api/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

/**
 * Rewrite a resume bullet point into 3 improved variations (PRD Section 18.4)
 * @param {object} params
 * @param {string} params.originalBullet - Weak bullet point text (15-600 chars)
 * @param {string} [params.targetRole=''] - Optional target job role
 * @param {'action_oriented'|'concise'|'technical_detail'} [params.rewriteStyle='action_oriented'] - Phrasing tone
 * @returns {Promise<{ status: string, data: object }>}
 */
export async function rewriteBullet({
  originalBullet,
  targetRole = '',
  rewriteStyle = 'action_oriented',
}) {
  const payload = {
    original_bullet: (originalBullet || '').trim(),
    target_role: (targetRole || '').trim(),
    rewrite_style: rewriteStyle,
  }

  const response = await apiClient.post('/api/rewrite-bullet', payload)
  return response.data
}

/**
 * Helper to extract standardized error information from Axios exceptions (PRD Section 18.1 & 22)
 * @param {any} error
 * @returns {{ message: string, code: string, details?: any }}
 */
export function extractErrorMessage(error) {
  if (error?.response?.data?.error) {
    const err = error.response.data.error
    return {
      message: err.message || 'An error occurred during processing.',
      code: err.code || 'UNKNOWN_ERROR',
      details: err.details || null,
    }
  }

  if (error?.code === 'ERR_NETWORK' || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return {
      message:
        'Cannot connect to the ResumeIQ AI server. Please check your internet connection or verify that the backend server is running.',
      code: 'NETWORK_ERROR',
    }
  }

  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return {
      message:
        'The analysis request timed out. Please verify the backend connection and try again.',
      code: 'REQUEST_TIMEOUT',
    }
  }

  return {
    message: error?.message || 'An unexpected error occurred.',
    code: 'CLIENT_ERROR',
  }
}

export default apiClient
