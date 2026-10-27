import React from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Home, FileSearch } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full text-center p-8 border-border-subtle shadow-xl space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-status-danger/10 text-status-danger flex items-center justify-center">
            <AlertCircle className="h-8 w-8" />
          </div>
        </div>

        <div className="space-y-2">
          <Badge variant="danger" size="md">
            Error 404 &bull; Page Not Found
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Lost in the Resume Stack?
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            The page or report you are looking for does not exist, has been moved, or was cleared from your browser's local storage.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="primary" size="md" icon={Home} className="w-full sm:w-auto">
              Back to Home
            </Button>
          </Link>
          <Link to="/analyze" className="w-full sm:w-auto">
            <Button variant="outline" size="md" icon={FileSearch} className="w-full sm:w-auto">
              Analyze a Resume
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default NotFoundPage
