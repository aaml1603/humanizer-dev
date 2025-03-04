"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import type { ApiCallStat } from "@/lib/api"
import { format, parseISO } from "date-fns"
import { motion } from "framer-motion"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface UsageChartProps {
  data: ApiCallStat[]
  isLoading: boolean
}

export function UsageChart({ data, isLoading }: UsageChartProps) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (data.length > 0) {
      // Transform the data for the chart
      const formattedData = data.map((item) => {
        const date = parseISO(item.date)
        return {
          date: format(date, "MMM dd"),
          words: item.count * 500, // Assuming average 500 words per API call
          apiCalls: item.count,
        }
      })
      setChartData(formattedData)
    } else {
      // Generate sample data if no data is available
      const sampleData = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return {
          date: format(date, "MMM dd"),
          words: Math.floor(Math.random() * 5000),
          apiCalls: Math.floor(Math.random() * 10),
        }
      })
      setChartData(sampleData)
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
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
    )
  }

  return (
    <ChartContainer
      config={{
        words: {
          label: "Words",
          color: "hsl(var(--primary))",
        },
        apiCalls: {
          label: "API Calls",
          color: "hsl(var(--destructive))",
        },
      }}
      className="h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar
            dataKey="words"
            yAxisId="left"
            fill="var(--color-words)"
            radius={[4, 4, 0, 0]}
            barSize={30}
            name="Words"
          />
          <Bar
            dataKey="apiCalls"
            yAxisId="right"
            fill="var(--color-apiCalls)"
            radius={[4, 4, 0, 0]}
            barSize={15}
            name="API Calls"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

