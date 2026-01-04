import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Load GSAP from CDN
const loadGSAP = () => {
  return new Promise((resolve) => {
    if (window.gsap) {
      resolve()
      return
    }
    
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'
    script.onload = () => resolve()
    script.onerror = () => resolve() // Continue even if GSAP fails to load
    document.head.appendChild(script)
  })
}

// Initialize app after GSAP loads (or timeout)
Promise.race([
  loadGSAP(),
  new Promise(resolve => setTimeout(resolve, 1000)) // Max 1 second wait
]).then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})

