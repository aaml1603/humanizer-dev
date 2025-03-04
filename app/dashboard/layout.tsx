"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogoAnimation } from "@/components/animations/logo-animation"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/protected-route"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-background">
        <motion.header
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6"
        >
          <div className="flex items-center md:hidden">
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] p-0">
                <div className="flex h-14 items-center border-b px-4">
                  <LogoAnimation className="md:mr-4" />
                </div>
                <DashboardNav onItemClick={() => setIsMobileNavOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>

          <LogoAnimation className="md:mr-4" />
          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </motion.header>
        <div className="flex flex-1">
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="hidden w-[240px] flex-col border-r md:flex bg-background"
          >
            <DashboardNav />
          </motion.aside>
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 p-4 md:p-6"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

