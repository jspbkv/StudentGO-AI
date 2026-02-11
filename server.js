const express = require('express');
const cors = require('cors');
const path = require('path');

// Load .env from the current script directory
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const GROQ_MODEL = process.env.GROQ_MODEL || 'gemma-7b-it';

// Middleware
app.use(cors());
app.use(express.json());

// Store conversation history
const conversations = new Map();

// Generate unique conversation ID
function generateConversationId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, conversationId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!conversationId) {
            return res.status(400).json({ error: 'Conversation ID is required' });
        }

        // Get or create conversation history
        let history = conversations.get(conversationId) || [];

        // Add user message to history
        history.push({
            role: 'user',
            content: message
        });

        console.log('Calling Groq API with message:', message);
        console.log('Conversation history length:', history.length);

        // Call Groq API
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: history,
                max_tokens: 1024,
                temperature: 0.7,
                top_p: 1
            })
        });

        if (!groqResponse.ok) {
            const errorData = await groqResponse.json();
            console.error('Groq API Error:', errorData);
            throw new Error(errorData.error?.message || `Groq API error: ${groqResponse.status}`);
        }

        const data = await groqResponse.json();
        const assistantMessage = data.choices[0].message.content;

        // Add assistant response to history
        history.push({
            role: 'assistant',
            content: assistantMessage
        });

        // Store updated history (keep only last 20 messages to avoid memory issues)
        if (history.length > 20) {
            history = history.slice(-20);
        }
        conversations.set(conversationId, history);

        res.json({
            success: true,
            message: assistantMessage,
            conversationId: conversationId,
            usage: {
                prompt_tokens: data.usage?.prompt_tokens || 0,
                completion_tokens: data.usage?.completion_tokens || 0
            }
        });

    } catch (error) {
        console.error('Chat Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'An error occurred while processing your request'
        });
    }
});

// Start conversation endpoint
app.post('/api/chat/new', (req, res) => {
    const conversationId = generateConversationId();
    conversations.set(conversationId, []);
    console.log('New conversation created:', conversationId);
    res.json({
        success: true,
        conversationId: conversationId
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Server is running',
        groqKeyPresent: !!process.env.GROQ_API_KEY
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API ready at http://localhost:${PORT}/api/chat`);
    console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
    console.log(`🤖 Using Groq model: ${GROQ_MODEL}`);
    if (!process.env.GROQ_API_KEY) {
        console.warn('⚠️  WARNING: GROQ_API_KEY is not set!');
    }
});
