"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function Bubble({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  return (
    <motion.circle
      cx={x}
      cy={y}
      r={size}
      fill={color}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0.7, 0.3, 0.7],
        scale: [1, 1.2, 1],
        x: x + Math.random() * 100 - 50,
        y: y + Math.random() * 100 - 50,
      }}
      transition={{
        duration: 5 + Math.random() * 10,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }}
    />
  )
}

function FloatingBubbles() {
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; size: number; color: string }>>([])

  useEffect(() => {
    const newBubbles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 20 + 5,
      color: `rgba(${Math.floor(Math.random() * 100)},${Math.floor(Math.random() * 100 + 155)},${Math.floor(Math.random() * 100)},0.3)`,
    }))
    setBubbles(newBubbles)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full">
        <title>Floating Bubbles</title>
        {bubbles.map((bubble) => (
          <Bubble key={bubble.id} {...bubble} />
        ))}
      </svg>
    </div>
  )
}

export default function FloatingBubblesBackground({
  title = "Humanize AI",
  subtitle = "Make AI Content Undetectable",
  buttonText = "Get Started",
  buttonLink = "/signup",
}: {
  title?: string
  subtitle?: string
  buttonText?: string
  buttonLink?: string
}) {
  const words = title.split(" ")
  const subtitleWords = subtitle.split(" ")

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-100/80 to-background dark:from-green-950/30 dark:to-background">
      <FloatingBubbles />

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-6 tracking-tighter">
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
                      type: "spring",
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="inline-block text-transparent bg-clip-text 
                               bg-gradient-to-r from-green-600 to-emerald-400 
                               dark:from-green-400 dark:to-emerald-300"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-xl sm:text-2xl md:text-3xl mb-12 text-muted-foreground"
          >
            {subtitleWords.map((word, wordIndex) => (
              <motion.span
                key={wordIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 + wordIndex * 0.1, duration: 0.5 }}
                className="inline-block mr-2 last:mr-0"
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <div
              className="inline-block group relative bg-gradient-to-b from-green-400/30 to-emerald-400/30 
                        dark:from-green-600/30 dark:to-emerald-600/30 p-px rounded-2xl backdrop-blur-lg 
                        overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <Link href={buttonLink}>
                <Button
                  variant="ghost"
                  className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                            bg-white/80 hover:bg-white/90 dark:bg-black/80 dark:hover:bg-black/90 
                            text-green-600 dark:text-green-300 transition-all duration-300 
                            group-hover:-translate-y-0.5 border border-green-200/50 dark:border-green-700/50
                            hover:shadow-md dark:hover:shadow-green-900/30"
                >
                  <span className="opacity-90 group-hover:opacity-100 transition-opacity">{buttonText}</span>
                  <span
                    className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                              transition-all duration-300"
                  >
                    →
                  </span>
                </Button>
              </Link>
            </div>

            <div
              className="inline-block group relative bg-gradient-to-b from-green-400/10 to-emerald-400/10 
                        dark:from-green-600/10 dark:to-emerald-600/10 p-px rounded-2xl backdrop-blur-lg 
                        overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <Link href="#features">
                <Button
                  variant="ghost"
                  className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                            bg-white/60 hover:bg-white/70 dark:bg-black/60 dark:hover:bg-black/70 
                            text-muted-foreground transition-all duration-300 
                            group-hover:-translate-y-0.5 border border-green-200/30 dark:border-green-700/30"
                >
                  <span className="opacity-90 group-hover:opacity-100 transition-opacity">Learn More</span>
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

