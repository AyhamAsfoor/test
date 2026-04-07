import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/hello')
      .then(res => res.json())
      .then(json => {
        setData(json)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="container">
      <header className="hero">
        <h1>Small Project <span className="badge">v1.0</span></h1>
        <p>A modern Maven multi-module application with Spring Boot and React.</p>
      </header>

      <main className="content">
        <section className="card">
          <h2>Backend Status</h2>
          {loading ? (
            <p className="loading">Checking backend...</p>
          ) : (
            <div className="status-box">
              <p><strong>Message:</strong> {data?.message || 'Error connecting to backend'}</p>
              <p><strong>Status:</strong> <span className={data?.status === 'success' ? 'text-success' : 'text-danger'}>{data?.status || 'Offline'}</span></p>
            </div>
          )}
        </section>

        <section className="info-grid">
          <div className="info-item">
            <h3>Pipeline Ready</h3>
            <p>Configured with a Jenkinsfile for CI/CD and Fortify scans.</p>
          </div>
          <div className="info-item">
            <h3>Modern Stack</h3>
            <p>Java 17, Spring Boot 3, and Vite-powered React frontend.</p>
          </div>
        </section>
      </main>

      <footer>
        <p>&copy; 2026 Small Project - Powered by Antigravity</p>
      </footer>
    </div>
  )
}

export default App
