/**
 * Local Storage Engine for ResumeIQ AI (PRD Section 19)
 * 
 * Handles client-side persistence for UI preferences and analysis report history.
 * Zero server-side database; strict resilience to corrupted data and storage quota limits.
 */

export const STORAGE_KEYS = {
  UI_PREFERENCES: 'resumeiq_ui_preferences_v1',
  REPORT_HISTORY: 'resumeiq_report_history_v1',
}

export const DEFAULT_PREFERENCES = {
  schema_version: 1,
  theme: 'dark',
  auto_save_reports: true,
  updated_at: new Date().toISOString(),
}

export const DEFAULT_HISTORY = {
  schema_version: 1,
  max_items: 15,
  reports: [],
}

/**
 * Safely parse JSON from localStorage with fallback
 * @param {string} key 
 * @param {any} fallback 
 * @returns {any}
 */
function safeGetItem(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed
  } catch (err) {
    console.warn(`[ResumeIQ Storage] Corrupted JSON detected for key "${key}". Resetting to default.`, err)
    return fallback
  }
}

/**
 * Safely save item to localStorage with quota-exceeded retry logic
 * @param {string} key 
 * @param {any} value 
 * @returns {boolean} Success state
 */
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    console.error(`[ResumeIQ Storage] Failed to set localStorage key "${key}"`, err)
    return false
  }
}

/**
 * Retrieve UI Preferences with schema validation & fallback (PRD Section 19.2)
 * @returns {{ schema_version: number, theme: 'light' | 'dark' | 'system', auto_save_reports: boolean, updated_at: string }}
 */
export function getPreferences() {
  const data = safeGetItem(STORAGE_KEYS.UI_PREFERENCES, null)

  if (!data || data.schema_version !== 1) {
    const freshDefaults = { ...DEFAULT_PREFERENCES, updated_at: new Date().toISOString() }
    safeSetItem(STORAGE_KEYS.UI_PREFERENCES, freshDefaults)
    return freshDefaults
  }

  const validThemes = ['light', 'dark', 'system']
  const theme = validThemes.includes(data.theme) ? data.theme : 'dark'
  const autoSave = typeof data.auto_save_reports === 'boolean' ? data.auto_save_reports : true

  return {
    schema_version: 1,
    theme,
    auto_save_reports: autoSave,
    updated_at: data.updated_at || new Date().toISOString(),
  }
}

/**
 * Save updated UI Preferences
 * @param {Partial<typeof DEFAULT_PREFERENCES>} partialPrefs 
 * @returns {typeof DEFAULT_PREFERENCES} Updated preferences
 */
export function savePreferences(partialPrefs) {
  const current = getPreferences()
  const updated = {
    ...current,
    ...partialPrefs,
    schema_version: 1,
    updated_at: new Date().toISOString(),
  }

  // Validate theme value
  if (!['light', 'dark', 'system'].includes(updated.theme)) {
    updated.theme = 'dark'
  }
  if (typeof updated.auto_save_reports !== 'boolean') {
    updated.auto_save_reports = true
  }

  safeSetItem(STORAGE_KEYS.UI_PREFERENCES, updated)
  return updated
}

/**
 * Reset UI Preferences to default values
 * @returns {typeof DEFAULT_PREFERENCES}
 */
export function resetPreferences() {
  const fresh = { ...DEFAULT_PREFERENCES, updated_at: new Date().toISOString() }
  safeSetItem(STORAGE_KEYS.UI_PREFERENCES, fresh)
  return fresh
}

/**
 * Retrieve report history with corruption recovery (PRD Section 19.3 & 19.4)
 * @returns {{ schema_version: number, max_items: number, reports: Array<any> }}
 */
export function getReportHistory() {
  const data = safeGetItem(STORAGE_KEYS.REPORT_HISTORY, null)

  if (!data || data.schema_version !== 1 || !Array.isArray(data.reports)) {
    const freshHistory = { ...DEFAULT_HISTORY, reports: [] }
    safeSetItem(STORAGE_KEYS.REPORT_HISTORY, freshHistory)
    return freshHistory
  }

  return {
    schema_version: 1,
    max_items: data.max_items || 15,
    reports: data.reports,
  }
}

/**
 * Save report object to local history (PRD Section 19.3 & 19.4)
 * Handles deduplication, FIFO eviction (max 15), and QuotaExceededError recovery.
 * @param {Object} reportItem - Standardized report object with report_id, summary, and full_report
 * @returns {Array<any>} Updated list of reports
 */
export function saveReportToHistory(reportItem) {
  if (!reportItem || !reportItem.report_id) {
    console.warn('[ResumeIQ Storage] Invalid report object passed to saveReportToHistory')
    return getReportHistory().reports
  }

  const history = getReportHistory()
  const maxItems = history.max_items || 15

  // 1. Deduplicate: remove existing item if it has the same report_id
  const filtered = history.reports.filter((r) => r.report_id !== reportItem.report_id)

  // 2. Insert newest at index 0
  filtered.unshift(reportItem)

  // 3. FIFO eviction: enforce max_items cap
  let pruned = filtered.slice(0, maxItems)

  const payload = {
    schema_version: 1,
    max_items: maxItems,
    reports: pruned,
  }

  // 4. QuotaExceeded resilience (PRD 19.4.3)
  try {
    localStorage.setItem(STORAGE_KEYS.REPORT_HISTORY, JSON.stringify(payload))
  } catch (err) {
    const isQuotaError =
      err &&
      (err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err.code === 22 ||
        err.code === 1014)

    if (isQuotaError && pruned.length > 3) {
      console.warn('[ResumeIQ Storage] QuotaExceededError encountered. Evicting oldest 3 reports and retrying...')
      // Evict oldest 3 items from the tail
      pruned = pruned.slice(0, Math.max(1, pruned.length - 3))
      payload.reports = pruned
      try {
        localStorage.setItem(STORAGE_KEYS.REPORT_HISTORY, JSON.stringify(payload))
      } catch (retryErr) {
        console.error('[ResumeIQ Storage] QuotaExceeded retry also failed.', retryErr)
      }
    } else {
      console.error('[ResumeIQ Storage] Failed to persist report history.', err)
    }
  }

  return pruned
}

/**
 * Retrieve a specific report by report_id
 * @param {string} reportId 
 * @returns {Object|null}
 */
export function getReportById(reportId) {
  if (!reportId) return null
  const history = getReportHistory()
  return history.reports.find((r) => r.report_id === reportId) || null
}

/**
 * Delete a specific report by report_id
 * @param {string} reportId 
 * @returns {Array<any>} Updated list of reports
 */
export function deleteReportById(reportId) {
  if (!reportId) return getReportHistory().reports
  const history = getReportHistory()
  const updatedReports = history.reports.filter((r) => r.report_id !== reportId)
  
  safeSetItem(STORAGE_KEYS.REPORT_HISTORY, {
    schema_version: 1,
    max_items: history.max_items || 15,
    reports: updatedReports,
  })

  return updatedReports
}

/**
 * Clear all saved reports from local storage
 * @returns {boolean}
 */
export function clearAllReportHistory() {
  return safeSetItem(STORAGE_KEYS.REPORT_HISTORY, {
    schema_version: 1,
    max_items: 15,
    reports: [],
  })
}

/**
 * Calculate approximate storage size used by ResumeIQ in localStorage in KB
 * @returns {{ totalKb: number, historyKb: number, preferencesKb: number, reportCount: number }}
 */
export function getStorageStats() {
  try {
    const prefsRaw = localStorage.getItem(STORAGE_KEYS.UI_PREFERENCES) || ''
    const historyRaw = localStorage.getItem(STORAGE_KEYS.REPORT_HISTORY) || ''

    // Approximate UTF-16 byte count: length * 2 bytes
    const prefsBytes = prefsRaw.length * 2
    const historyBytes = historyRaw.length * 2
    const totalBytes = prefsBytes + historyBytes

    const history = getReportHistory()

    return {
      totalKb: parseFloat((totalBytes / 1024).toFixed(1)),
      historyKb: parseFloat((historyBytes / 1024).toFixed(1)),
      preferencesKb: parseFloat((prefsBytes / 1024).toFixed(1)),
      reportCount: history.reports.length,
      maxItems: history.max_items || 15,
    }
  } catch (err) {
    return {
      totalKb: 0,
      historyKb: 0,
      preferencesKb: 0,
      reportCount: 0,
      maxItems: 15,
    }
  }
}

/**
 * Export report history as a downloadable JSON file
 * @returns {boolean}
 */
export function exportHistoryJson() {
  try {
    const history = getReportHistory()
    const jsonStr = JSON.stringify(history, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const dateStamp = new Date().toISOString().split('T')[0]
    const a = document.createElement('a')
    a.href = url
    a.download = `resumeiq_history_${dateStamp}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return true
  } catch (err) {
    console.error('[ResumeIQ Storage] Failed to export history JSON', err)
    return false
  }
}
