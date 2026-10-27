import React from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ScrollToTop } from './ScrollToTop'

export function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary font-sans antialiased transition-colors selection:bg-brand-primary/20 selection:text-brand-primary">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default AppLayout
