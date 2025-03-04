"use client"

import { useEffect, useState } from "react"
import { Bar, Line, XAxis, YAxis, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { humanizeService } from "@/lib/api"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"

interface DataPoint {
  name: string
  words: number
  average: number
}

export function Overview() {
  const [chartData, setChartData] = useState<DataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const activities = await humanizeService.getRecentActivities(60)

        if (activities.length === 0) {
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
          const currentMonth = new Date().getMonth()
          const data: DataPoint[] = []

          const totalWords = user?.words_used || 3000
          const averageBase = totalWords / 2

          for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12
            const monthName = monthNames[monthIndex]

            const progress = (5 - i) / 5
            const words = Math.round(totalWords * progress)
            const average = Math.round(averageBase + (Math.random() - 0.5) * averageBase * 0.5)

            data.push({
              name: monthName,
              words: i === 0 ? totalWords : words,
              average,
            })
          }

          setChartData(data)
        } else {
          const monthlyData: Record<string, { words: number; count: number }> = {}

          activities.forEach((activity) => {
            const date = new Date(activity.timestamp)
            const monthName = date.toLocaleString("default", { month: "short" })

            if (!monthlyData[monthName]) {
              monthlyData[monthName] = { words: 0, count: 0 }
            }
            monthlyData[monthName].words += activity.word_count
            monthlyData[monthName].count++
          })

          const data = Object.entries(monthlyData).map(([name, { words, count }]) => ({
            name,
            words,
            average: Math.round(words / count),
          }))

          const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
          data.sort((a, b) => monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name))

          setChartData(data)
        }
      } catch (err: any) {
        console.error("Failed to fetch usage data:", err)
        setError(err.message || "Failed to load usage data")

        const fallbackData: DataPoint[] = [
          { name: "Jan", words: 1200, average: 1000 },
          { name: "Feb", words: 1900, average: 1500 },
          { name: "Mar", words: 2200, average: 2000 },
          { name: "Apr", words: 2800, average: 2400 },
          { name: "May", words: 3100, average: 2800 },
          { name: "Jun", words: user?.words_used || 3500, average: 3000 },
        ]

        setChartData(fallbackData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsageData()
  }, [user?.words_used])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.1,
      }}
    >
      <Card className="overflow-hidden border-none shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-background">
          <CardTitle>Usage Overview</CardTitle>
          <CardDescription>Words humanized over time</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                className="rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
              />
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    width={60}
                    tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {payload[0].payload.name}
                                </span>
                                <span className="font-bold text-primary">
                                  {payload[0].value.toLocaleString()} words
                                </span>
                                <span className="text-[0.70rem] text-muted-foreground">
                                  Average: {payload[1].value.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar
                    dataKey="words"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    fillOpacity={0.2}
                    barSize={30}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={2000}
                    animationEasing="ease-out"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

