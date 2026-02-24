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
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
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
                  w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left
                  ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-900/50'
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
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4
                      className={`font-medium ${
                        isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {node.label}
                    </h4>
                    {node.estimatedTime && (
                      <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {node.estimatedTime}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{node.description}</p>
                  {isCurrent && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                      You are here
                    </p>
                  )}
                </div>

                {/* Arrow indicator */}
                {!isLast && (
                  <div className="flex-shrink-0">
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </button>

              {/* Connector */}
              {!isLast && (
                <div className="ml-7 h-4 w-0.5 bg-gray-200 dark:bg-gray-700" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
