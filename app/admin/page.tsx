"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { adminService } from "@/lib/api"
import { motion } from "framer-motion"
import { Users, CreditCard, AlertTriangle, CheckCircle, BarChart, Settings } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AdminDashboardPage() {
  const { toast } = useToast()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    expiringSubscriptions: 0,
    recentSignups: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        // In a real implementation, you would fetch actual stats from the backend
        // For now, we'll simulate with mock data
        const users = await adminService.getAllUsers()

        setStats({
          totalUsers: users.length,
          activeSubscriptions: users.filter((user) => user.status === "active").length,
          expiringSubscriptions: users.filter((user) => {
            const renewalDate = new Date(user.renewal_date)
            const now = new Date()
            const daysUntilRenewal = Math.floor((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            return daysUntilRenewal <= 7 && user.status === "active"
          }).length,
          recentSignups: users.filter((user) => {
            const createdAt = new Date(user.created_at)
            const now = new Date()
            const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
            return daysSinceCreation <= 7
          }).length,
        })
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching dashboard data",
          description: error.message,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [toast])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of users, subscriptions, and system performance.</p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{isLoading ? "..." : stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{isLoading ? "..." : stats.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground mt-1">Current paying customers</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{isLoading ? "..." : stats.expiringSubscriptions}</div>
              <p className="text-xs text-muted-foreground mt-1">Subscriptions expiring in 7 days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5">
              <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{isLoading ? "..." : stats.recentSignups}</div>
              <p className="text-xs text-muted-foreground mt-1">New users in the last 7 days</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/users">
              <Card className="bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer h-full">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Users className="h-8 w-8 mb-2 text-primary" />
                  <p className="text-sm font-medium">Manage Users</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/subscriptions">
              <Card className="bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer h-full">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <CreditCard className="h-8 w-8 mb-2 text-primary" />
                  <p className="text-sm font-medium">Manage Subscriptions</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/analytics">
              <Card className="bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer h-full">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <BarChart className="h-8 w-8 mb-2 text-primary" />
                  <p className="text-sm font-medium">View Analytics</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/settings">
              <Card className="bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer h-full">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Settings className="h-8 w-8 mb-2 text-primary" />
                  <p className="text-sm font-medium">System Settings</p>
                </CardContent>
              </Card>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function Link({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="block h-full">
      {children}
    </a>
  )
}

