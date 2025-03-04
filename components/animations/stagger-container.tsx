"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  delay?: number
  staggerChildren?: number
  once?: boolean
}

export function StaggerContainer({
  children,
  className,
  delay = 0,
  staggerChildren = 0.05,
  once = true,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      transition={{ delay, staggerChildren, delayChildren: delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

