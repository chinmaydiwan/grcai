'use client'

import { useEffect, useRef } from 'react'
import type { Risk } from '@/types/risk'

interface RiskHeatMapProps {
  risks: Risk[]
  width?: number
  height?: number
}

export default function RiskHeatMap({ risks, width = 500, height = 500 }: RiskHeatMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw grid
    const cellWidth = width / 5
    const cellHeight = height / 5

    // Draw cells with color based on risk level
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const score = (5 - i) * (j + 1) // Reverse Y-axis for correct orientation
        ctx.fillStyle = getHeatMapColor(score)
        ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight)

        // Draw grid lines
        ctx.strokeStyle = '#fff'
        ctx.strokeRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight)
      }
    }

    // Plot risks
    risks.forEach((risk) => {
      const x = (risk.likelihood - 1) * cellWidth + cellWidth / 2
      const y = (5 - risk.impact) * cellHeight + cellHeight / 2 // Reverse Y-axis

      // Draw risk point
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, 2 * Math.PI)
      ctx.fillStyle = '#fff'
      ctx.fill()
      ctx.strokeStyle = '#000'
      ctx.stroke()
    })

    // Draw axes labels
    ctx.fillStyle = '#000'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'

    // X-axis (Likelihood)
    for (let i = 1; i <= 5; i++) {
      ctx.fillText(i.toString(), (i - 0.5) * cellWidth, height - 5)
    }
    ctx.fillText('Likelihood', width / 2, height - 20)

    // Y-axis (Impact)
    ctx.save()
    ctx.rotate(-Math.PI / 2)
    for (let i = 1; i <= 5; i++) {
      ctx.fillText(i.toString(), -(5 - i + 0.5) * cellHeight, 15)
    }
    ctx.fillText('Impact', -height / 2, 30)
    ctx.restore()
  }, [risks, width, height])

  return <canvas ref={canvasRef} width={width} height={height} className="max-w-full" />
}

function getHeatMapColor(score: number): string {
  if (score > 15) return '#ef4444' // High risk - red
  if (score > 8) return '#eab308' // Medium risk - yellow
  return '#22c55e' // Low risk - green
}