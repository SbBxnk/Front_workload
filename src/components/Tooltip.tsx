'use client'
import { useState, useRef, useEffect } from 'react'

interface TooltipProps {
  children: React.ReactNode
  content: string
  className?: string
  disabled?: boolean
}

// Utility function for line clamp styling
const getLineClampStyle = (lines: number = 2) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
  lineHeight: '1.4',
  maxHeight: `${lines * 1.4}em`,
  textOverflow: 'ellipsis'
})

export default function Tooltip({ 
  children, 
  content, 
  className = '', 
  disabled = false
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      
      // Calculate position to center tooltip above the trigger
      const left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
      const top = triggerRect.top - tooltipRect.height - 8
      
      // Ensure tooltip stays within viewport
      const adjustedLeft = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8))
      const adjustedTop = top < 8 ? triggerRect.bottom + 8 : top
      
      setPosition({ top: adjustedTop, left: adjustedLeft })
    }
  }, [isVisible])

  // Don't show tooltip if content is empty or disabled
  if (disabled || !content || content === '-') {
    return <>{children}</>
  }

  return (
    <>
      <div
        ref={triggerRef}
        className="relative inline-block"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`fixed z-[9999] px-3 py-2 text-sm font-light text-gray-700 bg-white rounded-md shadow-lg pointer-events-none max-w-xs whitespace-normal ${className}`}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {content}
          {/* Arrow pointing down */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
        </div>
      )}
    </>
  )
}

// Export the utility function for use in other components
export { getLineClampStyle }