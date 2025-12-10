'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardLabel } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MindmapViewer } from './MindmapViewer'
import { useMindmapPoller } from '@/hooks/useMindmapPoller'
import { regenerateMindmap } from './actions'

export default function ThoughtmapPage() {
  const { mindmap, isLoading: isPolling, refetch } = useMindmapPoller({ interval: 2000, enabled: true })
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [status, setStatus] = useState<'synced' | 'regenerating' | 'error'>('synced')

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true)
      setStatus('regenerating')
      
      await regenerateMindmap()
      
      // Wait a bit for file system to update, then refetch
      setTimeout(() => {
        refetch()
        setStatus('synced')
        setIsRegenerating(false)
      }, 500)
    } catch (error) {
      console.error('Error regenerating mindmap:', error)
      setStatus('error')
      setIsRegenerating(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-[900px] mx-auto px-6 py-8 sm:px-8 sm:py-12">
        <div className="space-y-8">
          {/* Header Card */}
          <Card variant="institutional" bracket="green" hover className="border-border/50">
            <CardHeader className="space-y-3 pb-4">
              <CardLabel comment className="mb-1">Thoughtmap</CardLabel>
              <CardTitle className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">
                THOUGHTMAP
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Live Mindmap View
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 border-t border-border/30">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                    status === 'synced' ? 'bg-[hsl(var(--accent-green))] shadow-[0_0_8px_hsl(var(--accent-green))]' :
                    status === 'regenerating' ? 'bg-yellow-500 animate-pulse shadow-[0_0_8px_rgb(234,179,8)]' :
                    'bg-red-500 shadow-[0_0_8px_rgb(239,68,68)]'
                  }`} />
                  <span className="text-sm font-mono font-medium text-foreground uppercase tracking-wider">
                    {status === 'synced' ? 'Synced' :
                     status === 'regenerating' ? 'Regenerating...' :
                     'Error'}
                  </span>
                </div>
                <Button
                  variant="card-cta"
                  size="action"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  isLoading={isRegenerating}
                  className="w-full sm:w-auto min-w-[140px]"
                >
                  {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mindmap Render Card */}
          <Card variant="institutional" bracket="green" className="border-border/50">
            <CardHeader className="space-y-3 pb-4">
              <CardLabel comment className="mb-1">Mindmap</CardLabel>
              <CardTitle className="text-xl sm:text-2xl font-heading font-semibold">
                Visualization
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isPolling && !mindmap ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <div className="w-10 h-10 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground font-mono uppercase tracking-wide">
                      Loading mindmap...
                    </p>
                  </div>
                </div>
              ) : (
                <MindmapViewer source={mindmap} />
              )}
            </CardContent>
          </Card>

          {/* Status Footer */}
          <div className="text-center pt-4">
            <p className="text-xs font-mono text-muted-foreground/70 uppercase tracking-wider">
              Auto-refresh: <span className={isPolling ? 'text-[hsl(var(--accent-green))]' : 'text-muted-foreground'}>
                {isPolling ? 'Active' : 'Paused'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
