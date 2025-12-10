'use client'

import { useEffect, useRef } from 'react'

interface MindmapViewerProps {
  source: string
}

export function MindmapViewer({ source }: MindmapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !source) return

    // Extract mermaid code from markdown code block if present
    let mermaidCode = source
    if (source.includes('```mermaid')) {
      const match = source.match(/```mermaid\n([\s\S]*?)```/)
      if (match) {
        mermaidCode = match[1].trim()
      }
    } else if (source.includes('```')) {
      // Try to extract any code block
      const match = source.match(/```[\w]*\n([\s\S]*?)```/)
      if (match) {
        mermaidCode = match[1].trim()
      }
    }

    // Clear container
    containerRef.current.innerHTML = ''

    // Create a unique ID for this mermaid diagram
    const id = `mermaid-${Date.now()}`

    // Dynamically import and render mermaid
    import('mermaid').then((mermaidModule) => {
      const mermaid = mermaidModule.default || mermaidModule
      
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          primaryColor: '#4ade80',
          primaryTextColor: '#f0f9ff',
          primaryBorderColor: '#22c55e',
          lineColor: '#64748b',
          secondaryColor: '#1e293b',
          tertiaryColor: '#0f172a',
        },
      })

      const element = document.createElement('div')
      element.id = id
      element.className = 'mermaid'
      element.textContent = mermaidCode
      containerRef.current?.appendChild(element)

      mermaid.run({
        nodes: [element],
      }).catch((err) => {
        console.error('Mermaid render error:', err)
        // Fallback: display raw markdown
        if (containerRef.current) {
          containerRef.current.innerHTML = `<pre class="text-sm font-mono p-4 bg-muted rounded overflow-auto"><code>${mermaidCode}</code></pre>`
        }
      })
    }).catch((error) => {
      console.error('Error loading mermaid:', error)
      // Fallback: display raw markdown
      if (containerRef.current) {
        containerRef.current.innerHTML = `<pre class="text-sm font-mono p-4 bg-muted rounded overflow-auto"><code>${mermaidCode}</code></pre>`
      }
    })
  }, [source])

  if (!source) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p className="font-mono text-sm uppercase tracking-wide">No mindmap data available</p>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full min-h-[500px] flex items-center justify-center p-8 overflow-auto"
      style={{ 
        backgroundColor: 'transparent',
      }}
    />
  )
}
