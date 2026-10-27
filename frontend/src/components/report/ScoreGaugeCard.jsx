import React from 'react'
import { Link } from 'react-router-dom'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AlertCircle, HelpCircle, ArrowUpRight, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { useTheme } from '../../context/ThemeContext'

/**
 * Map integer score to color token (PRD Section 15.D & Section 20.1)
 */
function getTierColor(score) {
  if (score >= 85) return '#10B981' // Emerald
  if (score >= 70) return '#3B82F6' // Blue
  if (score >= 50) return '#F59E0B' // Amber
  return '#EF4444' // Red
}

function getTierBadgeVariant(score) {
  if (score >= 85) return 'success'
  if (score >= 70) return 'info'
  if (score >= 50) return 'warning'
  return 'danger'
}

/**
 * ScoreGaugeCard component displaying a Recharts circular score gauge (PRD Section 11.4)
 */
export function ScoreGaugeCard({
  title,
  score,
  tier,
  explanation,
  isAvailable = true,
  disclaimer,
  icon: Icon,
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const trackColor = isDark ? '#1E293B' : '#E2E8F0'

  if (!isAvailable) {
    return (
      <Card className="flex flex-col justify-between border-dashed border-border-subtle bg-bg-surface/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5 text-text-secondary" />}
              <CardTitle className="text-base text-text-secondary">{title}</CardTitle>
            </div>
            <Badge variant="outline" size="sm">
              Not Evaluated
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col items-center justify-center py-8 text-center space-y-4">
          <div className="h-24 w-24 rounded-full border-4 border-dashed border-border-subtle flex items-center justify-center text-text-secondary/60">
            <span className="font-mono text-2xl font-bold">—</span>
          </div>

          <div className="space-y-1.5 max-w-xs">
            <p className="text-sm font-semibold text-text-primary">
              No Job Description Provided
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Job Match Score requires a target job posting to compare candidate skills and requirements.
            </p>
          </div>

          <Link to="/analyze">
            <Button variant="outline" size="sm" icon={ArrowUpRight}>
              Run Targeted Match
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const safeScore = Math.max(0, Math.min(100, Math.round(score ?? 0)))
  const activeColor = getTierColor(safeScore)
  const badgeVariant = getTierBadgeVariant(safeScore)

  const chartData = [
    { name: 'Score', value: safeScore, color: activeColor },
    { name: 'Remaining', value: 100 - safeScore, color: trackColor },
  ]

  return (
    <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-brand-primary" />}
            <CardTitle className="text-base font-bold text-text-primary">{title}</CardTitle>
          </div>
          <Badge variant={badgeVariant} size="sm">
            {tier || (safeScore >= 85 ? 'Excellent' : safeScore >= 70 ? 'Strong' : safeScore >= 50 ? 'Fair' : 'Needs Work')}
          </Badge>
        </div>

        {disclaimer && (
          <p className="text-[11px] text-text-secondary/80 italic leading-snug pt-0.5">
            {disclaimer}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-2 flex-1 flex flex-col justify-between">
        {/* Recharts Semi/Full Donut Gauge */}
        <div className="relative h-44 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                startAngle={90}
                endAngle={-270}
                innerRadius={56}
                outerRadius={74}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Score Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className="text-4xl font-extrabold tracking-tight font-mono"
              style={{ color: activeColor }}
            >
              {safeScore}
            </span>
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              out of 100
            </span>
          </div>
        </div>

        {/* Explanation Footer */}
        {explanation && (
          <p className="text-xs text-text-secondary leading-relaxed border-t border-border-subtle pt-3 text-center sm:text-left">
            {explanation}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
