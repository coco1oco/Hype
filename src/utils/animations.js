// GSAP animations with safety checks
let gsap = null

// Lazy load GSAP
const getGSAP = () => {
  if (typeof window !== 'undefined' && window.gsap) {
    return window.gsap
  }
  return null
}

// Initialize GSAP on first use
const initGSAP = () => {
  if (!gsap) {
    gsap = getGSAP()
  }
  return gsap
}

// Button pop animation - Apple style
export const animateButtonPop = (element) => {
  if (!element) return
  
  const gsap = initGSAP()
  if (!gsap) {
    // Fallback: simple CSS animation
    element.style.transform = 'scale(0.95)'
    setTimeout(() => {
      element.style.transform = 'scale(1)'
      element.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }, 10)
    return
  }
  
  const tl = gsap.timeline()
  
  tl.to(element, {
    scale: 0.95,
    duration: 0.1,
    ease: 'power2.in'
  })
  .to(element, {
    scale: 1,
    duration: 0.3,
    ease: 'back.out(1.7)'
  })
  
  return tl
}

// Button ripple effect
export const animateButtonRipple = (element, event) => {
  if (!element || !event) return
  
  const gsap = initGSAP()
  const rect = element.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  const ripple = document.createElement('div')
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    width: 0;
    height: 0;
    left: ${x}px;
    top: ${y}px;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 1000;
  `
  
  if (element.style.position !== 'relative' && element.style.position !== 'absolute') {
    element.style.position = 'relative'
  }
  element.style.overflow = 'hidden'
  element.appendChild(ripple)
  
  if (gsap) {
    gsap.to(ripple, {
      width: 200,
      height: 200,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => ripple.remove()
    })
  } else {
    // Fallback
    ripple.style.transition = 'all 0.6s ease-out'
    ripple.style.width = '200px'
    ripple.style.height = '200px'
    ripple.style.opacity = '0'
    setTimeout(() => ripple.remove(), 600)
  }
}

// Fade in animation
export const animateFadeIn = (element, delay = 0) => {
  if (!element) return
  
  const gsap = initGSAP()
  if (!gsap) {
    element.style.opacity = '0'
    element.style.transform = 'translateY(20px)'
    setTimeout(() => {
      element.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out'
      element.style.opacity = '1'
      element.style.transform = 'translateY(0)'
    }, delay * 1000)
    return
  }
  
  gsap.fromTo(element, 
    {
      opacity: 0,
      y: 20
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      delay,
      ease: 'power2.out'
    }
  )
}

// Stagger animation for lists
export const animateStagger = (elements, delay = 0.05) => {
  if (!elements || elements.length === 0) return
  
  const gsap = initGSAP()
  if (!gsap) {
    // Fallback: simple sequential fade
    Array.from(elements).forEach((el, i) => {
      el.style.opacity = '0'
      setTimeout(() => {
        el.style.transition = 'opacity 0.4s ease-out'
        el.style.opacity = '1'
      }, i * delay * 1000)
    })
    return
  }
  
  gsap.fromTo(elements,
    {
      opacity: 0,
      y: 20
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: delay,
      ease: 'power2.out'
    }
  )
}

// Badge pop animation
export const animateBadgePop = (element) => {
  if (!element) return
  
  const gsap = initGSAP()
  if (!gsap) {
    element.style.transform = 'scale(0.8) rotate(-10deg)'
    setTimeout(() => {
      element.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      element.style.transform = 'scale(1) rotate(0deg)'
    }, 10)
    return
  }
  
  const tl = gsap.timeline()
  
  tl.to(element, {
    scale: 0.8,
    rotation: -10,
    duration: 0.15,
    ease: 'power2.in'
  })
  .to(element, {
    scale: 1,
    rotation: 0,
    duration: 0.4,
    ease: 'back.out(2)'
  })
}

// Nav item active animation
export const animateNavActive = (element) => {
  if (!element) return
  
  const gsap = initGSAP()
  if (!gsap) {
    element.style.transform = 'scale(0.9)'
    setTimeout(() => {
      element.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      element.style.transform = 'scale(1)'
    }, 10)
    return
  }
  
  const tl = gsap.timeline()
  
  tl.to(element, {
    scale: 0.9,
    duration: 0.1,
    ease: 'power2.in'
  })
  .to(element, {
    scale: 1,
    duration: 0.3,
    ease: 'back.out(1.7)'
  })
}

// Scale in animation (for modals)
export const animateScaleIn = (element) => {
  if (!element) return
  
  const gsap = initGSAP()
  if (!gsap) {
    element.style.opacity = '0'
    element.style.transform = 'scale(0.9)'
    setTimeout(() => {
      element.style.transition = 'opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      element.style.opacity = '1'
      element.style.transform = 'scale(1)'
    }, 10)
    return
  }
  
  gsap.fromTo(element,
    {
      scale: 0.9,
      opacity: 0
    },
    {
      scale: 1,
      opacity: 1,
      duration: 0.4,
      ease: 'back.out(1.7)'
    }
  )
}

