import { useState, useEffect, useCallback } from 'react'
import {
  getReportHistory,
  saveReportToHistory,
  getReportById as getReportByIdUtil,
  deleteReportById,
  clearAllReportHistory,
  getStorageStats,
  exportHistoryJson as exportHistoryJsonUtil,
  STORAGE_KEYS,
} from '../utils/storage'

/**
 * Custom React hook for managing client-side report history
 * @returns {{
 *   reports: Array<any>,
 *   storageStats: { totalKb: number, historyKb: number, preferencesKb: number, reportCount: number, maxItems: number },
 *   saveReport: (reportItem: any) => void,
 *   getReportById: (reportId: string) => any,
 *   deleteReport: (reportId: string) => void,
 *   clearAllReports: () => void,
 *   exportHistoryJson: () => boolean,
 *   refreshHistory: () => void
 * }}
 */
export function useReportHistory() {
  const [reports, setReports] = useState([])
  const [storageStats, setStorageStats] = useState({
    totalKb: 0,
    historyKb: 0,
    preferencesKb: 0,
    reportCount: 0,
    maxItems: 15,
  })

  const refreshHistory = useCallback(() => {
    const history = getReportHistory()
    setReports(history.reports || [])
    setStorageStats(getStorageStats())
  }, [])

  useEffect(() => {
    refreshHistory()

    // Listen for storage changes across tabs or windows
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.REPORT_HISTORY || !e.key) {
        refreshHistory()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [refreshHistory])

  const saveReport = useCallback((reportItem) => {
    const updated = saveReportToHistory(reportItem)
    setReports(updated)
    setStorageStats(getStorageStats())
    return updated
  }, [])

  const getReportById = useCallback((reportId) => {
    return getReportByIdUtil(reportId)
  }, [])

  const deleteReport = useCallback((reportId) => {
    const updated = deleteReportById(reportId)
    setReports(updated)
    setStorageStats(getStorageStats())
  }, [])

  const clearAllReports = useCallback(() => {
    clearAllReportHistory()
    setReports([])
    setStorageStats(getStorageStats())
  }, [])

  const exportHistoryJson = useCallback(() => {
    return exportHistoryJsonUtil()
  }, [])

  return {
    reports,
    storageStats,
    saveReport,
    getReportById,
    deleteReport,
    clearAllReports,
    exportHistoryJson,
    refreshHistory,
  }
}
