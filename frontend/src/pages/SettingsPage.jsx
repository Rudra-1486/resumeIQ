import React, { useState, useEffect } from 'react'
import {
  Settings,
  Sun,
  Moon,
  Laptop,
  Database,
  Trash2,
  Download,
  RotateCcw,
  Cpu,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  Info,
  ShieldCheck,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useReportHistory } from '../hooks/useReportHistory'
import { checkBackendHealth } from '../api/client'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'
import { Dialog } from '../components/ui/Dialog'

export function SettingsPage() {
  const {
    theme,
    resolvedTheme,
    autoSaveReports,
    setTheme,
    setAutoSaveReports,
    resetPreferences,
  } = useTheme()

  const {
    reports,
    storageStats,
    clearAllReports,
    exportHistoryJson,
    refreshHistory,
  } = useReportHistory()

  // Modals state
  const [clearHistoryModalOpen, setClearHistoryModalOpen] = useState(false)
  const [resetPrefsModalOpen, setResetPrefsModalOpen] = useState(false)
  const [actionNotice, setActionNotice] = useState(null)

  // Backend Health check state
  const [backendHealth, setBackendHealth] = useState(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [healthError, setHealthError] = useState(null)

  const fetchHealth = async () => {
    setHealthLoading(true)
    setHealthError(null)
    try {
      const data = await checkBackendHealth()
      setBackendHealth(data)
    } catch (err) {
      setHealthError(
        err.response?.data?.error?.message ||
          err.message ||
          'Failed to connect to backend at http://localhost:8000'
      )
    } finally {
      setHealthLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
  }, [])

  const handleClearHistory = () => {
    clearAllReports()
    setClearHistoryModalOpen(false)
    setActionNotice({
      type: 'success',
      text: 'All saved resume reports were permanently cleared from this browser.',
    })
  }

  const handleResetPreferences = () => {
    resetPreferences()
    setResetPrefsModalOpen(false)
    setActionNotice({
      type: 'success',
      text: 'UI Preferences were reset to default settings.',
    })
  }

  const handleExportHistory = () => {
    const success = exportHistoryJson()
    if (success) {
      setActionNotice({
        type: 'success',
        text: 'Report history successfully exported as JSON.',
      })
    } else {
      setActionNotice({
        type: 'error',
        text: 'Failed to export history file.',
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm">
          <Settings className="h-4 w-4" />
          <span>Application Configuration</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          Settings &amp; Storage
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          Manage your interface appearance, local browser storage, and verify backend API connectivity.
        </p>
      </div>

      {actionNotice && (
        <Alert
          variant={actionNotice.type === 'success' ? 'success' : 'error'}
          onClose={() => setActionNotice(null)}
        >
          {actionNotice.text}
        </Alert>
      )}

      {/* 1. Appearance Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Interface Appearance</CardTitle>
              <CardDescription>
                Select your preferred visual mode or sync with your system operating system.
              </CardDescription>
            </div>
            <Badge variant="outline">Current: {resolvedTheme} mode</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Dark Theme Option */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold shadow-sm'
                  : 'border-border-subtle bg-bg-elevated/40 text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              }`}
            >
              <Moon className="h-5 w-5" />
              <span className="text-sm">Dark Theme</span>
              <span className="text-[11px] opacity-70">Deep dark palette</span>
            </button>

            {/* Light Theme Option */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                theme === 'light'
                  ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold shadow-sm'
                  : 'border-border-subtle bg-bg-elevated/40 text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              }`}
            >
              <Sun className="h-5 w-5" />
              <span className="text-sm">Light Theme</span>
              <span className="text-[11px] opacity-70">Crisp high-contrast</span>
            </button>

            {/* System Theme Option */}
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                theme === 'system'
                  ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold shadow-sm'
                  : 'border-border-subtle bg-bg-elevated/40 text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              }`}
            >
              <Laptop className="h-5 w-5" />
              <span className="text-sm">System Default</span>
              <span className="text-[11px] opacity-70">Follows OS preferences</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 2. History & Local Storage Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>History &amp; Local Storage</CardTitle>
              <CardDescription>
                ResumeIQ uses zero backend databases. All saved reports and settings exist solely within your device's browser <code>localStorage</code>.
              </CardDescription>
            </div>
            <Badge variant="info">
              {storageStats.reportCount} / {storageStats.maxItems} Slots Used
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-save Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-bg-elevated/40">
            <div className="space-y-0.5 pr-4">
              <label htmlFor="auto-save-toggle" className="text-sm font-semibold text-text-primary cursor-pointer">
                Automatically save generated reports to history
              </label>
              <p className="text-xs text-text-secondary leading-relaxed">
                When enabled, every completed analysis on <code>/analyze</code> will be added to your local history (up to 15 reports).
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                id="auto-save-toggle"
                type="checkbox"
                checked={autoSaveReports}
                onChange={(e) => setAutoSaveReports(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border-subtle peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>

          {/* Storage Capacity Gauge & Stats */}
          <div className="p-4 rounded-xl border border-border-subtle bg-bg-elevated/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-text-secondary uppercase tracking-wider">
              <span>Local Storage Utilization</span>
              <span>~{storageStats.totalKb} KB used</span>
            </div>
            <div className="w-full bg-border-subtle rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-brand-primary h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(5, (storageStats.reportCount / storageStats.maxItems) * 100))}%`,
                }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
              <span>
                Saved Reports: <strong className="text-text-primary">{storageStats.reportCount}</strong> (Max 15 FIFO)
              </span>
              <span>
                Report Data: <strong className="text-text-primary">~{storageStats.historyKb} KB</strong> &bull; Preferences: <strong className="text-text-primary">~{storageStats.preferencesKb} KB</strong>
              </span>
            </div>
          </div>

          {/* Storage Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExportHistory}
              disabled={reports.length === 0}
            >
              Export History as JSON
            </Button>
            <Button
              variant="destructive"
              size="sm"
              icon={Trash2}
              onClick={() => setClearHistoryModalOpen(true)}
              disabled={reports.length === 0}
            >
              Clear All Saved Reports
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={RotateCcw}
              onClick={() => setResetPrefsModalOpen(true)}
            >
              Reset Preferences to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Application Info & Backend Health Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System &amp; AI Provider Information</CardTitle>
              <CardDescription>
                Runtime versioning and live backend API operational verification.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              loading={healthLoading}
              onClick={fetchHealth}
              title="Refresh health status"
            >
              Check Health
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl border border-border-subtle bg-bg-elevated/40 space-y-1">
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Application Version
              </span>
              <p className="text-base font-bold text-text-primary">v1.0.0 (MVP)</p>
              <p className="text-xs text-text-secondary">Stage 2 Frontend Release</p>
            </div>

            <div className="p-3 rounded-xl border border-border-subtle bg-bg-elevated/40 space-y-1">
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                AI Inference Engine
              </span>
              <p className="text-base font-bold text-text-primary">Groq Cloud API</p>
              <p className="text-xs text-brand-primary font-mono truncate">llama-3.3-70b-versatile</p>
            </div>

            <div className="p-3 rounded-xl border border-border-subtle bg-bg-elevated/40 space-y-1">
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Backend Connection
              </span>
              {backendHealth ? (
                <div className="flex items-center gap-1.5 text-status-excellent font-bold text-base">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Online (200 OK)</span>
                </div>
              ) : healthError ? (
                <div className="flex items-center gap-1.5 text-status-danger font-bold text-base">
                  <XCircle className="h-4 w-4" />
                  <span>Offline</span>
                </div>
              ) : (
                <p className="text-base font-bold text-text-secondary">Checking...</p>
              )}
              <p className="text-xs text-text-secondary">
                {backendHealth?.groq_key_configured
                  ? 'Groq API Key Configured'
                  : 'Groq Key: Inactive/Placeholder'}
              </p>
            </div>
          </div>

          {healthError && (
            <Alert variant="error" title="Backend Connection Issue">
              {healthError}
            </Alert>
          )}

          <div className="p-3 rounded-xl border border-border-subtle bg-bg-elevated/20 flex items-start gap-2.5 text-xs text-text-secondary">
            <ShieldCheck className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
            <span>
              <strong>Zero-Account Guarantee:</strong> ResumeIQ has no user accounts, passwords, or cloud databases. Resetting your browser cache or clearing local data completely removes all stored traces.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialogs */}
      <Dialog
        isOpen={clearHistoryModalOpen}
        onClose={() => setClearHistoryModalOpen(false)}
        onConfirm={handleClearHistory}
        title="Clear All Saved Report History?"
        description="This will permanently delete all saved resume analysis reports from this browser's local storage. This action cannot be undone."
        confirmLabel="Yes, Clear All History"
        cancelLabel="Cancel"
        isDestructive={true}
      />

      <Dialog
        isOpen={resetPrefsModalOpen}
        onClose={() => setResetPrefsModalOpen(false)}
        onConfirm={handleResetPreferences}
        title="Reset UI Preferences to Defaults?"
        description="This will reset your theme to Dark Theme and turn Auto-Save on. Your saved analysis reports will not be deleted."
        confirmLabel="Reset Preferences"
        cancelLabel="Cancel"
        isDestructive={false}
      />
    </div>
  )
}

export default SettingsPage
