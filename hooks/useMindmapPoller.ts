'use client'

import { useEffect, useState, useRef } from 'react'

interface UseMindmapPollerOptions {
  interval?: number
  enabled?: boolean
}

export function useMindmapPoller(options: UseMindmapPollerOptions = {}) {
  const { interval = 2000, enabled = true } = options
  const [mindmap, setMindmap] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastHashRef = useRef<string>('')

  const fetchMindmap = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/thoughtmap/mindmap.md', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch mindmap: ${response.statusText}`)
      }

      const content = await response.text()
      
      // Simple hash to detect changes
      const hash = content.slice(0, 100) + content.length.toString()
      
      if (hash !== lastHashRef.current) {
        lastHashRef.current = hash
        setMindmap(content)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      console.error('Error fetching mindmap:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!enabled) return

    // Initial fetch
    fetchMindmap()

    // Set up polling
    intervalRef.current = setInterval(() => {
      fetchMindmap()
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [interval, enabled])

  return { mindmap, isLoading, error, refetch: fetchMindmap }
}
