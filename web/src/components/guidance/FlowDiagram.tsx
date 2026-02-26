import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, Circle, ChevronRight, Clock } from 'lucide-react'

export interface FlowNode {
  id: string
  label: string
  description: string
  href: string
  estimatedTime?: string
}

export interface FlowEdge {
  from: string
  to: string
  label?: string
}

interface FlowDiagramProps {
  name: string
  description: string
  nodes: FlowNode[]
  edges: FlowEdge[]
}

export default function FlowDiagram({ name, description, nodes, edges }: FlowDiagramProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const isCurrentNode = (node: FlowNode) => {
    return location.pathname === node.href
  }

  const handleNodeClick = (node: FlowNode) => {
    navigate(node.href)
  }

  return (
    <div className="glass rounded-xl border border-theme-subtle p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-theme mb-2">{name}</h3>
        <p className="text-sm text-theme-secondary">{description}</p>
      </div>

      {/* Flow Diagram - Simplified Linear View */}
      <div className="space-y-3">
        {nodes.map((node, index) => {
          const isCurrent = isCurrentNode(node)
          const isLast = index === nodes.length - 1

          return (
            <div key={node.id}>
              {/* Node */}
              <button
                onClick={() => handleNodeClick(node)}
                className={`
                  w-full flex items-start gap-4 p-4 rounded-lg border transition-all text-left
                  ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-theme-subtle hover:border-accent hover:bg-theme-glass-5'
                  }
                `}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  ) : (
                    <Circle className="w-6 h-6 text-theme-tertiary" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4
                      className={`font-medium ${
                        isCurrent ? 'text-accent' : 'text-theme'
                      }`}
                    >
                      {node.label}
                    </h4>
                    {node.estimatedTime && (
                      <span className="flex items-center text-xs text-theme-tertiary">
                        <Clock className="w-3 h-3 mr-1" />
                        {node.estimatedTime}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-theme-secondary">{node.description}</p>
                  {isCurrent && (
                    <p className="text-xs text-accent mt-2 font-medium">
                      You are here
                    </p>
                  )}
                </div>

                {/* Arrow indicator */}
                {!isLast && (
                  <div className="flex-shrink-0">
                    <ChevronRight className="w-5 h-5 text-theme-tertiary" />
                  </div>
                )}
              </button>

              {/* Connector */}
              {!isLast && (
                <div className="ml-7 h-4 w-0.5 bg-theme-glass-20" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
