"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UsageStats } from "@/components/dashboard/usage-stats"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { capitalize } from "@/lib/utils"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
}

const fadeIn = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
}

export default function DashboardPage() {
  const { user, refreshUserInfo } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setIsLoading(true)
        await refreshUserInfo(false) // Changed from true to false to avoid forcing refresh
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [refreshUserInfo, user])

  // Calculate words remaining
  const wordsUsed = user?.words_used || 0
  const wordsRemaining = user ? user.word_limit - wordsUsed : 0
  const totalWordsHumanized = user?.total_words_humanized || 0

  // Format membership for display
  const membershipDisplay = user?.membership ? capitalize(user.membership) : "Free"
  const membershipTypeDisplay = user?.membership_type ? capitalize(user.membership_type) : "Monthly"

  // Format days remaining
  const daysRemaining = user?.days_remaining || 0
  const expirationDate = user?.expiration_date || ""

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, <span className="font-medium text-foreground">{user?.name || "User"}</span>
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        <motion.div variants={item}>
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5">
              <CardTitle className="text-sm font-medium">Total Words Humanized</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-2xl sm:text-3xl font-bold">{totalWordsHumanized.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Lifetime usage</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5">
              <CardTitle className="text-sm font-medium">Words Remaining</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-2xl sm:text-3xl font-bold">{wordsRemaining.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                of {user?.word_limit.toLocaleString()} {user?.membership === "free" ? "daily" : "monthly"} limit
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="sm:col-span-2 lg:col-span-1">
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <div className="text-2xl sm:text-3xl font-bold">{membershipDisplay}</div>
                {user?.membership === "pro" && <Badge className="bg-primary text-primary-foreground">Pro</Badge>}
                {user?.membership === "enterprise" && (
                  <Badge className="bg-primary text-primary-foreground">Enterprise</Badge>
                )}
              </div>
              <div className="flex flex-col mt-1">
                {user?.membership !== "free" ? (
                  <>
                    <p className="text-xs text-muted-foreground">{membershipTypeDisplay} subscription</p>
                    <p className="text-xs text-muted-foreground">
                      {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Expires today"}
                    </p>
                    <p className="text-xs text-muted-foreground">Renews on {expirationDate}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">Free tier</p>
                    <p className="text-xs text-muted-foreground">Limit resets daily</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={fadeIn} initial="hidden" animate="show">
        <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 p-1 w-full grid grid-cols-3">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Activity
            </TabsTrigger>
            <TabsTrigger value="usage" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Usage
            </TabsTrigger>
          </TabsList>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="overview" className="space-y-6 mt-0">
              <Overview />
            </TabsContent>
            <TabsContent value="activity" className="space-y-6 mt-0">
              <RecentActivity />
            </TabsContent>
            <TabsContent value="usage" className="space-y-6 mt-0">
              <UsageStats wordLimit={user?.word_limit || 10000} wordsUsed={wordsUsed} />
            </TabsContent>
          </motion.div>
        </Tabs>
      </motion.div>
    </div>
  )
}

