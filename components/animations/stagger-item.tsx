"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StaggerItemProps {
  children: React.ReactNode
  className?: string
  direction?: "up" | "down" | "left" | "right" | "none"
}

export function StaggerItem({ children, className, direction = "up" }: StaggerItemProps) {
  const directionVariants = {
    up: { y: 10 },
    down: { y: -10 },
    left: { x: 10 },
    right: { x: -10 },
    none: {},
  }

  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          ...directionVariants[direction],
        },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
        },
      }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

