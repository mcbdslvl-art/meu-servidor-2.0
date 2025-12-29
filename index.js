const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
const express = require('express')
const cors = require('cors')
const OpenAI = require('openai')

const app = express()
app.use(cors())
app.use(express.json())

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

app.post('/api/openai', async (req, res) => {
  try {
    const { prompt } = req.body
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' })
    if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY not set' })

    const resp = await client.responses.create({
      model: 'gpt-4o-mini',
      input: prompt,
      temperature: 0.7,
      max_output_tokens: 500,
    })

    let text = resp.output_text ?? null
    if (!text && Array.isArray(resp.output)) {
      text = resp.output
        .map(item => (Array.isArray(item.content) ? item.content.map(c => c.text || '').join('') : ''))
        .join('\n')
    }

    return res.json({ result: text })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err?.message ?? String(err) })
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`OpenAI proxy server listening on http://localhost:${port}`))
