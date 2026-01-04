import { createContext, useContext, useState, useCallback } from 'react'
import './Toast.css'

const ToastContext = createContext({
  addToast: () => {}
})

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const [exitingToasts, setExitingToasts] = useState(new Set())

  const removeToast = useCallback((id) => {
    setExitingToasts((prev) => new Set([...prev, id]))
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
      setExitingToasts((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 300)
  }, [])

  const addToast = useCallback(
    ({ message, type = 'info', duration = 3500 }) => {
      if (!message) return
      const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => removeToast(id), duration)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`toast ${toast.type} ${exitingToasts.has(toast.id) ? 'toast-exit' : ''}`}
          >
            <span>{toast.message}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => removeToast(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

