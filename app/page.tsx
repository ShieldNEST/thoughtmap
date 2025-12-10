import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-background flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground mb-4">
          ThoughtMap
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Welcome to ThoughtMap - your space for visualizing and organizing thoughts.
        </p>
        <Link href="/thoughtmap">
          <Button variant="action" size="action-lg">
            View Mindmap
          </Button>
        </Link>
      </div>
    </main>
  )
}

