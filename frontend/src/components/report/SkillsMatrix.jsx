import React, { useState } from 'react'
import { Code2, Wrench, Users, CheckCircle2, Quote, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'

/**
 * SkillsMatrix component displaying categorized extracted skills with resume evidence (PRD Section 11.4 & 18.3)
 */
export function SkillsMatrix({ skillsAnalysis }) {
  const technical = skillsAnalysis?.technical_skills || []
  const tools = skillsAnalysis?.tools_and_technologies || []
  const soft = skillsAnalysis?.soft_skills || []

  const totalSkillsCount = technical.length + tools.length + soft.length

  const categories = [
    {
      id: 'technical',
      title: 'Technical & Domain Skills',
      icon: Code2,
      count: technical.length,
      items: technical,
      description: 'Programming languages, database frameworks, and backend/frontend technologies.',
    },
    {
      id: 'tools',
      title: 'Tools & Technologies',
      icon: Wrench,
      count: tools.length,
      items: tools,
      description: 'Developer platforms, testing utilities, version control, and cloud tools.',
    },
    {
      id: 'soft',
      title: 'Professional & Soft Skills',
      icon: Users,
      count: soft.length,
      items: soft,
      description: 'Communication, team collaboration, problem solving, and analytical execution.',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-text-primary">Categorized Skills Matrix</h3>
          <p className="text-xs sm:text-sm text-text-secondary">
            Extracted skills supported by verifiable evidence found inside your resume text.
          </p>
        </div>
        <Badge variant="primary" size="md">
          {totalSkillsCount} Skills Identified
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const CatIcon = cat.icon
          return (
            <Card key={cat.id} className="flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-border-subtle">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                      <CatIcon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-bold">{cat.title}</CardTitle>
                  </div>
                  <Badge variant="outline" size="sm">
                    {cat.count}
                  </Badge>
                </div>
                <CardDescription className="text-xs">{cat.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 py-4 space-y-3">
                {cat.items.length === 0 ? (
                  <p className="text-xs text-text-secondary italic py-6 text-center">
                    No specific items detected in this category.
                  </p>
                ) : (
                  cat.items.map((skill, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 rounded-xl border border-border-subtle bg-bg-surface hover:border-brand-primary/40 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-bold text-text-primary">
                          {skill.name}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {skill.source_section && (
                            <span className="text-[10px] text-text-secondary/80 font-mono bg-bg-elevated px-1.5 py-0.5 rounded">
                              {skill.source_section}
                            </span>
                          )}
                          <Badge
                            variant={skill.confidence === 'high' ? 'success' : 'outline'}
                            size="sm"
                            className="text-[10px]"
                          >
                            {skill.confidence}
                          </Badge>
                        </div>
                      </div>

                      {skill.evidence && (
                        <div className="flex items-start gap-1.5 text-xs text-text-secondary">
                          <Quote className="h-3 w-3 shrink-0 text-text-secondary/50 mt-0.5" />
                          <p className="text-[11px] italic leading-relaxed line-clamp-2" title={skill.evidence}>
                            "{skill.evidence}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
