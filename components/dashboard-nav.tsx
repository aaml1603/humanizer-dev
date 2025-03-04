"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FileText, Home, Settings } from "lucide-react"
import { motion } from "framer-motion"

interface DashboardNavProps {
  onItemClick?: () => void
}

export function DashboardNav({ onItemClick }: DashboardNavProps) {
  const pathname = usePathname()

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick()
    }
  }

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
      }}
      className="grid items-start px-2 py-4"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, x: -10 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
        }}
      >
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/dashboard"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
          onClick={handleItemClick}
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
      </motion.div>
      <motion.div
        variants={{
          hidden: { opacity: 0, x: -10 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
        }}
      >
        <Link
          href="/dashboard/humanize"
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/dashboard/humanize"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
          onClick={handleItemClick}
        >
          <FileText className="h-4 w-4" />
          Humanize
        </Link>
      </motion.div>
      <motion.div
        variants={{
          hidden: { opacity: 0, x: -10 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
        }}
      >
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/dashboard/settings"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
          onClick={handleItemClick}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </motion.div>
    </motion.nav>
  )
}

