/**
 * Rule Engine - Evaluates rules and calculates impacts
 * 
 * This module contains the core logic for:
 * 1. Evaluating rules based on farm inputs
 * 2. Calculating node impacts (which nodes are affected and how)
 * 3. Calculating edge impacts (which relationships are activated)
 * 4. Aggregating impacts into 3P (People, Place, Planet) summary
 * 
 * Assumptions:
 * - Rules are evaluated independently (no rule conflicts resolved)
 * - Multiple impacts on the same node are combined
 * - Impact strength (LOW/MEDIUM/HIGH) is used for visualization but
 *   not for aggregation (all treated equally for 3P summary)
 */

/**
 * Evaluates all rules against current farm inputs
 * Returns object with nodeImpacts and edgeImpacts
 */
export function evaluateRules(inputs, rules, edges = []) {
  const nodeImpacts = {}
  const edgeImpacts = {}

  // Check each rule
  rules.forEach(rule => {
    // Check if rule condition matches current inputs
    const conditionMet = Object.keys(rule.condition).every(key => {
      return inputs[key] === rule.condition[key]
    })

    if (conditionMet) {
      // Apply all effects from this rule
      rule.effects.forEach(effect => {
        // Track node impact
        if (!nodeImpacts[effect.target]) {
          nodeImpacts[effect.target] = []
        }
        nodeImpacts[effect.target].push({
          impact: effect.impact,
          strength: effect.strength,
          pillar: effect.pillar,
          reason: effect.reason,
          ruleId: rule.id
        })
      })
    }
  })

  // Calculate edge impacts based on node impacts
  // Assumption: An edge is "active" if either its source or target node is impacted
  edges.forEach(edge => {
    const fromImpacted = nodeImpacts[edge.from] && nodeImpacts[edge.from].length > 0
    const toImpacted = nodeImpacts[edge.to] && nodeImpacts[edge.to].length > 0
    
    if (fromImpacted || toImpacted) {
      const edgeKey = `${edge.from}-${edge.to}`
      edgeImpacts[edgeKey] = [
        {
          impact: toImpacted ? nodeImpacts[edge.to][0].impact : nodeImpacts[edge.from][0].impact,
          strength: toImpacted ? nodeImpacts[edge.to][0].strength : nodeImpacts[edge.from][0].strength
        }
      ]
    }
  })

  return {
    nodes: nodeImpacts,
    edges: edgeImpacts
  }
}

/**
 * Calculates 3P (People, Place, Planet) impact summary
 * 
 * Assumption: Each node type maps to a pillar:
 * - People: nodes with type "People" or "Outcome" (income, workers, local_food)
 * - Place: nodes with type "Resource" (water)
 * - Planet: nodes with type "Environment" (soil, emissions)
 * 
 * Aggregation logic:
 * - If any node in a pillar has POSITIVE impact → pillar is POSITIVE
 * - If any node in a pillar has NEGATIVE impact → pillar is NEGATIVE
 * - If mixed (both positive and negative) → NEGATIVE (conservative)
 * - If no impacts → NEUTRAL
 */
export function calculate3PImpacts(nodeImpacts, nodes) {
  // Map nodes to pillars
  const pillarMapping = {
    People: ['workers', 'local_food', 'income'],
    Place: ['water'],
    Planet: ['soil', 'emissions']
  }

  const summary = {
    People: 'NEUTRAL',
    Place: 'NEUTRAL',
    Planet: 'NEUTRAL'
  }

  // Calculate impact for each pillar
  Object.keys(pillarMapping).forEach(pillar => {
    const nodeIds = pillarMapping[pillar]
    let hasPositive = false
    let hasNegative = false

    nodeIds.forEach(nodeId => {
      const impacts = nodeImpacts[nodeId]
      if (impacts && impacts.length > 0) {
        impacts.forEach(impact => {
          if (impact.impact === 'POSITIVE') {
            hasPositive = true
          } else if (impact.impact === 'NEGATIVE') {
            hasNegative = true
          }
        })
      }
    })

    // Determine pillar impact
    if (hasPositive && !hasNegative) {
      summary[pillar] = 'POSITIVE'
    } else if (hasNegative) {
      summary[pillar] = 'NEGATIVE' // Conservative: negative takes precedence
    } else {
      summary[pillar] = 'NEUTRAL'
    }
  })

  return summary
}
