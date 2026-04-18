function buildContextPrompt(inputs, nodeImpacts, threePImpacts, modelData, rulesData) {
  const activeRules = rulesData.filter(rule =>
    Object.keys(rule.condition).every(key => inputs[key] === rule.condition[key])
  )

  const impactedNodes = Object.entries(nodeImpacts).map(([nodeId, impacts]) => {
    const node = modelData.nodes.find(n => n.id === nodeId)
    const summary = impacts.map(i => `${i.impact} (${i.strength}) - ${i.reason}`).join('; ')
    return `- ${node?.label || nodeId}: ${summary}`
  }).join('\n')

  const p = v => v === 'POSITIVE' ? '↑ Positive' : v === 'NEGATIVE' ? '↓ Negative' : '→ Neutral'

  return `You are an expert Agriculture Impact Assistant helping users understand a 3P (People, Place, Planet) impact model for a small-scale farm.

CURRENT FARM CONFIGURATION:
- Water Source: ${inputs.water_source}
- Fertilizer Type: ${inputs.fertilizer_type}
- Irrigation Method: ${inputs.irrigation_method}
- Energy Use: ${inputs.energy_use}

BUSINESS: ${modelData.anchor.business} · ${modelData.anchor.location}

CURRENT IMPACTS:
${impactedNodes || 'No active impacts.'}

3P SUMMARY:
- People: ${p(threePImpacts.People)}
- Place:  ${p(threePImpacts.Place)}
- Planet: ${p(threePImpacts.Planet)}

ACTIVE RULES (${activeRules.length}):
${activeRules.map(r => `- ${r.id}: ${r.effects.map(e => `${e.target} → ${e.impact} (${e.strength})`).join(', ')}`).join('\n') || 'None.'}

NODES: ${modelData.nodes.map(n => `${n.label} (${n.type})`).join(', ')}

Answer concisely. Focus on cause-effect relationships and plain-English explanations. The user may not be technical.`
}

export async function getOpenAIResponse(userMessage, context) {
  const { inputs, nodeImpacts, threePImpacts, modelData, rulesData } = context
  const systemPrompt = buildContextPrompt(inputs, nodeImpacts, threePImpacts, modelData, rulesData)

  const res = await fetch('/.netlify/functions/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage },
      ],
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Function error')
  return data.content || 'Sorry, no response received.'
}
