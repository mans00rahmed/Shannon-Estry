/**
 * OpenAI API Service
 * 
 * Handles communication with OpenAI API for chatbot responses.
 * 
 * Note: In production, the API key should be stored in environment variables
 * and API calls should be made through a backend to keep the key secure.
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

/**
 * Generates a context prompt based on current application state
 */
function buildContextPrompt(inputs, nodeImpacts, threePImpacts, modelData, rulesData) {
  // Get active rules
  const activeRules = rulesData.filter(rule => {
    return Object.keys(rule.condition).every(key => {
      return inputs[key] === rule.condition[key]
    })
  })

  // Build impacted nodes summary
  const impactedNodes = Object.entries(nodeImpacts).map(([nodeId, impacts]) => {
    const node = modelData.nodes.find(n => n.id === nodeId)
    const impactSummary = impacts.map(imp => 
      `${imp.impact} (${imp.strength}) - ${imp.reason}`
    ).join('; ')
    return `- ${node?.label || nodeId}: ${impactSummary}`
  }).join('\n')

  return `You are an expert Agriculture Impact Assistant helping users understand a 3P (People, Place, Planet) impact model for agriculture.

CURRENT FARM CONFIGURATION:
- Water Source: ${inputs.water_source}
- Fertilizer Type: ${inputs.fertilizer_type}
- Irrigation Method: ${inputs.irrigation_method}
- Energy Use: ${inputs.energy_use}

BUSINESS CONTEXT:
- Business: ${modelData.anchor.business}
- Location: ${modelData.anchor.location}

CURRENT IMPACTS:
${impactedNodes || 'No active impacts currently.'}

3P IMPACT SUMMARY:
- People: ${threePImpacts.People === 'POSITIVE' ? '↑ Positive' : threePImpacts.People === 'NEGATIVE' ? '↓ Negative' : '→ Neutral'}
- Place: ${threePImpacts.Place === 'POSITIVE' ? '↑ Positive' : threePImpacts.Place === 'NEGATIVE' ? '↓ Negative' : '→ Neutral'}
- Planet: ${threePImpacts.Planet === 'POSITIVE' ? '↑ Positive' : threePImpacts.Planet === 'NEGATIVE' ? '↓ Negative' : '→ Neutral'}

ACTIVE RULES (${activeRules.length}):
${activeRules.map(rule => 
  `- ${rule.id}: ${rule.effects.map(e => `${e.target} → ${e.impact} (${e.strength})`).join(', ')}`
).join('\n') || 'No active rules.'}

AVAILABLE NODES IN THE MODEL:
${modelData.nodes.map(n => `- ${n.label} (${n.type})`).join('\n')}

Answer the user's question about the impact model, current configuration, active impacts, or recommendations. Be concise, informative, and focus on the causal relationships and 3P impacts.`
}

/**
 * Sends a message to OpenAI API and returns the response
 * 
 * @param {string} userMessage - The user's question
 * @param {Object} context - Application context (inputs, impacts, etc.)
 * @returns {Promise<string>} The AI response
 */
export async function getOpenAIResponse(userMessage, context) {
  const { inputs, nodeImpacts, threePImpacts, modelData, rulesData } = context

  const systemPrompt = buildContextPrompt(inputs, nodeImpacts, threePImpacts, modelData, rulesData)

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI API error')
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
  } catch (error) {
    console.error('OpenAI API Error:', error)
    throw new Error(`Failed to get AI response: ${error.message}`)
  }
}
