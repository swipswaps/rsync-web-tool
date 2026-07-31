import { useState } from 'react'

function App() {
  const [src, setSrc] = useState('/path/to/source')
  const [dst, setDst] = useState('/path/to/destination')
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || '/api'

  const runRsync = async () => {
    setRunning(true)
    setOutput('')
    try {
      const res = await fetch(`${API_URL}/rsync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ src, dst })
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`HTTP ${res.status}: ${errText}`)
      }
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        setOutput(prev => prev + chunk)
      }
    } catch (err) {
      setOutput(prev => prev + '\n❌ Error: ' + String(err))
    }
    setRunning(false)
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Rsync Web Tool</h1>
      <div style={{ marginBottom: '1rem' }}>
        <label>Source: <input value={src} onChange={e => setSrc(e.target.value)} style={{ width: '300px' }} /></label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Destination: <input value={dst} onChange={e => setDst(e.target.value)} style={{ width: '300px' }} /></label>
      </div>
      <button onClick={runRsync} disabled={running}>
        {running ? 'Running...' : 'Run rsync'}
      </button>
      <pre style={{
        marginTop: '2rem',
        background: '#1e1e1e',
        color: '#d4d4d4',
        padding: '1rem',
        borderRadius: '8px',
        maxHeight: '400px',
        overflow: 'auto'
      }}>
        {output || 'Output will appear here'}
      </pre>
    </div>
  )
}

export default App
