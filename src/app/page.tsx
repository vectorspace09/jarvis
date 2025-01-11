"use client"

import { VoiceRecorder } from "@/components/voice/voice-recorder"
import { ChatHistory } from "@/components/chat/chat-history"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function Home() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-background to-muted/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-white/[0.02] dark:bg-grid-white/[0.05]" />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-transparent"
          animate={{
            x: ['-100%', '100%'],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col min-h-screen">
        {/* Header */}
        <motion.header 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-block"
            animate={{ 
              scale: [1, 1.02, 1],
              rotate: [0, 1, 0] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              J.A.R.V.I.S
            </h1>
          </motion.div>
          <p className="text-muted-foreground mt-2">
            Just A Rather Very Intelligent System
          </p>
        </motion.header>

        {/* Chat interface */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          <div className="flex-1 relative">
            {/* Hexagonal frame */}
            <div className="absolute inset-0 p-4">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-accent/5 backdrop-blur-sm rounded-lg border border-accent/20" />
                <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent opacity-50" />
              </div>
            </div>
            
            {/* Chat content */}
            <div className="relative h-full p-4">
              <ChatHistory />
            </div>
          </div>

          {/* Voice interface */}
          <motion.div 
            className="mt-8 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative">
              {/* Circular glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl opacity-75" />
              
              {/* Voice recorder with enhanced styling */}
              <div className="relative bg-background/80 backdrop-blur-md rounded-full p-6 border border-accent/20 shadow-lg">
                <VoiceRecorder />
              </div>

              {/* Animated rings */}
              <div className="absolute inset-0 -z-10">
                <motion.div
                  className="absolute inset-0 border border-accent/30 rounded-full"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.1, 0.3] 
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute inset-0 border border-primary/20 rounded-full"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.1, 0.2] 
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
