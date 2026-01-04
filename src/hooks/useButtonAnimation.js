import { useCallback } from 'react'
import { animateButtonPop, animateButtonRipple } from '../utils/animations'

export const useButtonAnimation = () => {
  const handleButtonClick = useCallback((e, onClick) => {
    const button = e.currentTarget
    
    // Pop animation
    animateButtonPop(button)
    
    // Ripple effect
    animateButtonRipple(button, e)
    
    // Call original onClick if provided
    if (onClick) {
      onClick(e)
    }
  }, [])

  return handleButtonClick
}

