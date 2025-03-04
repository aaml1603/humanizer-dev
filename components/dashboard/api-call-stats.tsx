"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { humanizeService, type ApiCallStat } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ApiCallStats() {
  const [stats, setStats] = useState<ApiCallStat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const data = await humanizeService.getApiCallStats(7) // Last 7 days
        setStats(data)
        setError(null)
      } catch (err: any) {
        console.error("Error fetching API call stats:", err)
        setError(err.message || "Failed to load API call statistics")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Format dates for display
  const formatData = (data: ApiCallStat[]) => {
    return data.map((item) => {
      const date = new Date(item.date)
      return {
        ...item,
        formattedDate: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }
    })
  }

  const formattedStats = formatData(stats)

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Call Statistics</CardTitle>
        <CardDescription>Your API usage over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <Skeleton className="h-[250px] w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : stats.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No API call data available</div>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" name="API Calls" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

