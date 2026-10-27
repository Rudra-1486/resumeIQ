import React, { createContext, useContext, useId } from 'react'

const TabsContext = createContext(null)

/**
 * Root Tabs container providing active tab state and accessibility context.
 */
export function Tabs({
  value,
  defaultValue,
  onValueChange,
  children,
  className = '',
}) {
  const [internalTab, setInternalTab] = React.useState(defaultValue || '')
  const isControlled = value !== undefined
  const activeTab = isControlled ? value : internalTab
  const baseId = useId()

  const handleSelect = (tabValue) => {
    if (!isControlled) {
      setInternalTab(tabValue)
    }
    if (onValueChange) {
      onValueChange(tabValue)
    }
  }

  return (
    <TabsContext.Provider value={{ activeTab, onSelect: handleSelect, baseId }}>
      <div className={`space-y-4 ${className}`}>{children}</div>
    </TabsContext.Provider>
  )
}

/**
 * Container list for tab triggers with ARIA tablist semantics.
 */
export function TabsList({ children, className = '' }) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={`flex items-center gap-1.5 p-1.5 rounded-2xl bg-bg-elevated/70 border border-border-subtle overflow-x-auto scrollbar-none ${className}`}
    >
      {children}
    </div>
  )
}

/**
 * Individual tab button trigger with active visual state and accessibility attributes.
 */
export function TabsTrigger({
  value,
  children,
  icon: Icon,
  badge,
  disabled = false,
  className = '',
}) {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component')
  }

  const { activeTab, onSelect, baseId } = context
  const isActive = activeTab === value
  const tabId = `${baseId}-tab-${value}`
  const panelId = `${baseId}-panel-${value}`

  return (
    <button
      id={tabId}
      role="tab"
      type="button"
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => onSelect(value)}
      className={`
        inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium
        transition-all duration-200 select-none whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-brand-primary
        ${
          isActive
            ? 'bg-bg-surface text-brand-primary shadow-sm font-semibold border border-border-subtle/80'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface/50'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {Icon && <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-brand-primary' : 'text-text-secondary'}`} />}
      <span>{children}</span>
      {badge !== undefined && badge !== null && (
        <span
          className={`
            ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold
            ${
              isActive
                ? 'bg-brand-primary/10 text-brand-primary'
                : 'bg-bg-surface text-text-secondary'
            }
          `}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

/**
 * Tab panel content container, displayed only when matching the active tab.
 */
export function TabsContent({ value, children, className = '' }) {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component')
  }

  const { activeTab, baseId } = context
  const isActive = activeTab === value
  const tabId = `${baseId}-tab-${value}`
  const panelId = `${baseId}-panel-${value}`

  if (!isActive) return null

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      tabIndex={0}
      className={`focus:outline-none animate-in fade-in-50 duration-200 ${className}`}
    >
      {children}
    </div>
  )
}
