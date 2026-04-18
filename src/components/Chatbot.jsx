/**
 * Chatbot - Interactive assistant powered by OpenAI
 * 
 * This chatbot uses OpenAI API to provide intelligent responses based on
 * the current application state (farm inputs, impacts, rules, etc.)
 */

import { useState, useRef, useEffect } from 'react'
import { getOpenAIResponse } from '../services/openai'
import './Chatbot.css'

function Chatbot({ inputs, nodeImpacts, threePImpacts, modelData, rulesData }) {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hi! I'm your Agriculture Impact Assistant powered by AI. Ask me about your farm configuration, active impacts, 3P summary, or get recommendations. Try: 'What's happening with soil?' or 'How can I improve my farm's impact?'"
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    
    // Add user message
    const userMsg = {
      type: 'user',
      text: userMessage
    }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsLoading(true)

    // Add loading message
    const loadingMsg = {
      type: 'bot',
      text: 'Thinking...',
      isLoading: true
    }
    setMessages(prev => [...prev, loadingMsg])

    try {
      // Get AI response with context
      const context = {
        inputs,
        nodeImpacts,
        threePImpacts,
        modelData,
        rulesData
      }

      const aiResponse = await getOpenAIResponse(userMessage, context)

      // Replace loading message with actual response
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = {
          type: 'bot',
          text: aiResponse,
          isLoading: false
        }
        return newMessages
      })
    } catch (error) {
      // Replace loading message with error
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = {
          type: 'bot',
          text: `Sorry, I encountered an error: ${error.message}. Please try again.`,
          isLoading: false,
          isError: true
        }
        return newMessages
      })
      console.error('Chatbot error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-status-bar">
        <span className="chatbot-status">Powered by OpenAI</span>
      </div>
      
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message message-${msg.type} ${msg.isError ? 'message-error' : ''}`}>
            <div className="message-content">
              {msg.isLoading ? (
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                msg.text.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chatbot-input-form" onSubmit={handleSend}>
        <input
          type="text"
          className="chatbot-input"
          placeholder="Ask about impacts, rules, or recommendations..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="chatbot-send-btn"
          disabled={isLoading || !inputValue.trim()}
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default Chatbot
