'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useAnimation, PanInfo } from 'framer-motion'

interface BottomPanelProps {
  children: React.ReactNode
}

export const BottomPanel: React.FC<BottomPanelProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const controls = useAnimation()
  const panelRef = useRef<HTMLDivElement>(null)

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 50) {
      setIsOpen(false)
    } else {
      controls.start('visible')
    }
  }

  useEffect(() => {
    if (isOpen) {
      controls.start('visible')
    } else {
      controls.start('hidden')
    }
  }, [isOpen, controls])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const variants = {
    hidden: { y: '100%' },
    visible: { y: 0 },
  }

  return (
    <>
      <div className='w-full relative bg-white opacity-20 h-16 py-12  rounded-t-2xl'>
        <div className="absolute top-0 left-0 right-0 h-6 flex justify-center items-center">
          <motion.button
            className="w-10 h-1 bg-gray-300 rounded-full"
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
          >
            {
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            }
          </motion.button>
        </div>
      </div>
      <motion.div
        ref={panelRef}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-50"
        style={{ height: '100vh' }}
        initial="hidden"
        animate={controls}
        variants={variants}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        <div className="absolute top-0 left-0 right-0 h-6 flex justify-center items-center">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <motion.div
          className="p-4 mt-6 h-full overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </>
  )
}
