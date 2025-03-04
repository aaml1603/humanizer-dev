"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import Link from "next/link"

interface LogoAnimationProps {
  text?: string
  href?: string
  className?: string
}

export function LogoAnimation({ text = "HumanizeAI", href = "/", className }: LogoAnimationProps) {
  const sparkleVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
    hover: {
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 1.2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
        ease: "easeInOut",
      },
    },
  }

  return (
    <Link href={href} className={`flex items-center gap-2 ${className}`}>
      <motion.div initial="initial" animate="animate" whileHover="hover" variants={sparkleVariants}>
        <Sparkles className="h-5 w-5 text-primary" />
      </motion.div>
      <span className="font-medium text-gradient-primary">{text}</span>
    </Link>
  )
}

