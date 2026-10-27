import React, { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  Sparkles,
  Sun,
  Moon,
  Settings,
  Menu,
  X,
  FileSearch,
  LayoutDashboard,
  History,
  PenTool,
  Info,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'

export function Navbar() {
  const { resolvedTheme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/analyze', label: 'Analyze', icon: FileSearch },
    { to: '/rewriter', label: 'Rewriter', icon: PenTool },
    { to: '/history', label: 'History', icon: History },
    { to: '/about', label: 'About', icon: Info },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-bg-surface/90 backdrop-blur-md transition-colors pointer-events-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-lg p-1"
          >
            <div className="h-9 w-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-md shadow-brand-primary/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-text-primary leading-tight">
                Resume<span className="text-brand-primary">IQ</span>
              </span>
              <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">
                AI Resume Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-bg-elevated text-brand-primary font-semibold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/60'
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Settings Icon Link */}
          <NavLink
            to="/settings"
            title="Application Settings"
            aria-label="Settings"
            className={({ isActive }) =>
              cn(
                'h-9 w-9 rounded-lg flex items-center justify-center transition-colors',
                isActive
                  ? 'bg-bg-elevated text-brand-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              )
            }
          >
            <Settings className="h-4 w-4" />
          </NavLink>

          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleTheme()
            }}
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Current: ${resolvedTheme} mode (Click to toggle)`}
            className="relative z-50 h-9 w-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary cursor-pointer pointer-events-auto"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform pointer-events-none" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600 hover:-rotate-12 transition-transform pointer-events-none" />
            )}
          </button>

          {/* Primary CTA (Desktop) */}
          <div className="hidden sm:block">
            <Link to="/analyze">
              <Button size="sm" variant="primary" icon={FileSearch}>
                Analyze Resume
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden h-9 w-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Drawer (< 768px) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-subtle bg-bg-surface px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-bg-elevated text-brand-primary font-semibold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
            <NavLink
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-bg-elevated text-brand-primary font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                )
              }
            >
              <Settings className="h-4 w-4" />
              Settings
            </NavLink>
          </nav>

          <div className="pt-2 border-t border-border-subtle">
            <Link to="/analyze" onClick={() => setMobileMenuOpen(false)}>
              <Button size="md" variant="primary" icon={FileSearch} className="w-full justify-center">
                Analyze Resume
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
