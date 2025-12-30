const express = require('express')
const cors = require('cors')
const OpenAI = require('openai')

const app = express()
app.use(cors())
app.use(express.json())

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

app.get('/', (req, res) => {
  res.send('🔥 Servidor de Letras com IA Online!')
})

// ADICIONADO PARA CORRESPONDER AO HEALTH CHECK DO RENDER (/healthz)
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.post('/api/openai', async (req, res) => {
  try {
    const { prompt } = req.body
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' })
    }

    const resp = await client.responses.create({
      model: 'gpt-4o-mini',
      input: prompt,
      temperature: 0.7,
      max_output_tokens: 500,
    })

    const text =
      resp.output_text ||
      resp.output?.map(o =>
        o.content?.map(c => c.text || '').join('')
      ).join('\n') ||
      'Nenhum resultado retornado'

    return res.json({ result: text })
  } catch (err) {
    console.error('Erro IA:', err)
    return res.status(500).json({ error: err.message })
  }
})

// Defina o host como '0.0.0.0' para aceitar conexões externas no Render.
const port = process.env.PORT || 3000
const host = '0.0.0.0'
app.listen(port, host, () => {
  console.log(`🚀 Server running on http://${host}:${port}`)
})
