/**
 * ImpactGraph - Center panel component using ReactFlow for professional graph visualization
 * 
 * Features:
 * - Built-in zoom and pan
 * - Automatic node positioning
 * - Smooth animations
 * - Professional graph layout
 */

import { useMemo, useCallback, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import './ImpactGraph.css'

function ImpactGraph({ nodes, edges, nodeImpacts, edgeImpacts }) {
  // Convert nodes to ReactFlow format
  const flowNodes = useMemo(() => {
    if (!nodes || nodes.length === 0) return []
    return nodes.map((node) => {
      const impact = nodeImpacts[node.id]
      const hasImpact = impact && impact.length > 0
      
      // Determine node color based on impact
      let nodeColor = '#0c2640'
      let borderColor = '#1a3a5c'

      if (hasImpact) {
        const hasPositive = impact.some(i => i.impact === 'POSITIVE')
        const hasNegative = impact.some(i => i.impact === 'NEGATIVE')

        if (hasPositive && !hasNegative) {
          nodeColor = '#0a2e1a'
          borderColor = '#00e676'
        } else if (hasNegative && !hasPositive) {
          nodeColor = '#2e0a0a'
          borderColor = '#ff4d4d'
        } else if (hasPositive && hasNegative) {
          nodeColor = '#2e1f00'
          borderColor = '#ffaa00'
        }
      }

      // Get node type icon
      const typeIcons = {
        Business: '🏢',
        People: '👥',
        Resource: '💧',
        Environment: '🌱',
        Outcome: '📊'
      }
      const icon = typeIcons[node.type] || '●'

      // Calculate position (using a hierarchical layout)
      let position = { x: 0, y: 0 }
      const positions = {
        farm: { x: 400, y: 50 },
        water: { x: 150, y: 200 },
        soil: { x: 150, y: 350 },
        emissions: { x: 150, y: 500 },
        workers: { x: 650, y: 200 },
        local_food: { x: 650, y: 350 },
        yield: { x: 300, y: 600 },
        income: { x: 500, y: 600 }
      }
      position = positions[node.id] || { x: 400, y: 300 }

      return {
        id: node.id,
        type: 'custom',
        position,
        data: {
          label: node.label,
          icon,
          nodeType: node.type,
          color: nodeColor,
          borderColor,
          hasImpact,
          impactCount: hasImpact ? impact.length : 0
        },
        style: {
          background: nodeColor,
          border: `2px solid ${borderColor}`,
          borderRadius: '50%',
          width: 100,
          height: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: hasImpact ? `0 0 18px ${borderColor}66` : '0 2px 10px rgba(0,0,0,0.4)',
          transition: 'all 0.3s ease',
          color: '#d8eef8',
        }
      }
    })
  }, [nodes, nodeImpacts])

  // Convert edges to ReactFlow format
  const flowEdges = useMemo(() => {
    if (!edges || edges.length === 0) return []
    return edges.map((edge) => {
      const edgeKey = `${edge.from}-${edge.to}`
      const impact = edgeImpacts[edgeKey]
      const isActive = impact && impact.length > 0
      
      return {
        id: edgeKey,
        source: edge.from,
        target: edge.to,
        type: 'smoothstep',
        animated: isActive,
        style: {
          stroke: isActive ? '#00c8e8' : '#1a3a5c',
          strokeWidth: isActive ? 2.5 : 1.5,
          opacity: isActive ? 0.9 : 0.35,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isActive ? '#00c8e8' : '#1a3a5c',
        }
      }
    })
  }, [edges, edgeImpacts])

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState([])
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState([])

  // Update nodes and edges when props change
  useEffect(() => {
    if (flowNodes.length > 0) {
      setNodes(flowNodes)
    }
  }, [flowNodes, setNodes])

  useEffect(() => {
    if (flowEdges.length > 0) {
      setEdges(flowEdges)
    }
  }, [flowEdges, setEdges])

  // Custom node component
  const CustomNode = useCallback(({ data }) => {
    if (!data) return null
    return (
      <div className="reactflow-custom-node">
        <div className="node-icon">{data.icon || '●'}</div>
        <div className="node-label">{data.label || 'Node'}</div>
        {data.hasImpact && (
          <div className="node-badge">{data.impactCount || 0}</div>
        )}
      </div>
    )
  }, [])

  const nodeTypes = useMemo(() => ({
    custom: CustomNode
  }), [CustomNode])

  return (
    <ReactFlow
      nodes={reactFlowNodes}
      edges={reactFlowEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      attributionPosition="bottom-left"
      minZoom={0.3}
      maxZoom={2}
      defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Background color="#0d2641" gap={32} size={1} />
      <Controls />
      <MiniMap
        nodeColor={node => node.data?.borderColor || '#1a3a5c'}
        maskColor="rgba(3,8,15,0.65)"
        style={{ backgroundColor: '#060e1c', border: '1px solid rgba(0,212,255,0.15)' }}
      />
    </ReactFlow>
  )
}

export default ImpactGraph
