import visit from 'unist-util-visit'
import { Node } from 'unist'
import mermaid from 'mermaid'
import rehypeParse from 'rehype-parse'
import unified from 'unified'
import { randomBytes } from 'crypto'

const SUPPORTED = ['flowchart', 'mermaid', 'sequence', 'chart', 'chart(yaml)']

mermaid.initialize({
  startOnLoad: false,
})

export function remarkCharts() {
  return (tree: Node) => {
    visit(tree, 'code', (node) => {
      if (typeof node.lang !== 'string' || !SUPPORTED.includes(node.lang)) {
        return
      }

      node.type = node.lang
      node.data = {
        hName: node.lang,
        hChildren: [{ type: 'text', value: node.value }],
        hProperties: {
          className: [node.lang],
        },
      }
    })
  }
}

export function rehypeMermaid() {
  return async (tree: Node) => {
    const mermaidNodes: Node[] = []
    visit(tree, { tagName: 'mermaid' }, (node: any) => {
      mermaidNodes.push(node)
    })
    const parser = unified().use(rehypeParse, { fragment: true })
    await Promise.all(
      mermaidNodes.map(async (node: any) => {
        node.tagName = 'div'
        const value = node.children[0].value
        try {
          const { svg } = await mermaid.render(
            `mermaid-${randomBytes(8).toString('hex')}`,
            value
          )
          node.children = parser.parse(svg).children
        } catch (err) {
          node.children = [{ type: 'text', value: err.message }]
        }
      })
    )
  }
}
