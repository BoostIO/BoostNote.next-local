import React, { useRef, useEffect, useState } from 'react'
import { Chart as ChartJS, registerables } from 'chart.js'
import YAML from 'js-yaml'
import { Node } from 'unist'
import visit from 'unist-util-visit'
import unified from 'unified'
import rehypeParse from 'rehype-parse'

interface ChartProps {
  config: string
  isYml?: boolean
}

// register once
ChartJS.register(...registerables)

// disable animations globally
ChartJS.defaults.animation = false

interface ChartProps {
  config: string
  isYml?: boolean
}

export const Chart = ({ config, isYml = false }: ChartProps) => {
  const eleRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<ChartJS | null>(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    if (!eleRef.current) return

    if (chartRef.current) {
      chartRef.current.destroy()
    }

    try {
      setErr(false)
      const parsed = isYml ? YAML.load(config) : JSON.parse(config)

      chartRef.current = new ChartJS(
        eleRef.current.getContext('2d')!,
        parsed as any
      )
    } catch (e) {
      console.error(e)
      setErr(true)
    }
  }, [config, isYml])

  return (
    <div>
      {err && <div>Parse Error</div>}
      <canvas ref={eleRef} />
    </div>
  )
}

interface RehypeChartProps {
  tagName: string
  isYml?: boolean
}

export function appendElementToBody(id: string, tagName: string) {
  let chartExportElement = window.document.getElementById(id)
  if (chartExportElement == null) {
    chartExportElement = window.document.createElement(tagName)
    chartExportElement.id = id
    chartExportElement.style.display = 'none'
    const bodyElement = window.document.body
    bodyElement.appendChild(chartExportElement)
  }
}

// create element for export prior to exporting to be able to render them correctly
const chartExportElementId = 'chart-export-container'
appendElementToBody(chartExportElementId, 'canvas')

export function rehypeChart({ tagName, isYml = false }: RehypeChartProps) {
  return async (tree: Node) => {
    const chartCanvasElement = window.document.getElementById(
      chartExportElementId
    ) as HTMLCanvasElement
    if (chartCanvasElement == null) {
      return
    }
    const chartNodes: Node[] = []
    visit(tree, { tagName: tagName }, (node: any) => {
      chartNodes.push(node)
    })
    const parser = unified().use(rehypeParse, { fragment: true })
    await Promise.all(
      chartNodes.map(async (node: any) => {
        node.tagName = 'div'
        const value = node.children[0].value
        try {
          const parsed = isYml ? YAML.load(value) : JSON.parse(value)
          const chartData = new ChartJS(
            chartCanvasElement.getContext('2d'),
            parsed
          )
          if (
            parsed.maintainAspectRatio == null ||
            parsed.maintainAspectRatio == false
          ) {
            let containerStyle = ''
            if (parsed.width != null) {
              containerStyle += `width: ${parsed.width};`
            }
            if (parsed.height != null) {
              containerStyle += `height: ${parsed.height};`
            }
            node.properties.style = `position: relative; ${containerStyle}`
          }
          const img = new Image()
          img.src = chartData.canvas.toDataURL()
          node.children = parser.parse(img.outerHTML).children
        } catch (err) {
          node.children = [{ type: 'text', value: err.message }]
        }
      })
    )
  }
}
