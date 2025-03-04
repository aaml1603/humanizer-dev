"use client"

import type { Activity } from "@/lib/api"
import { formatDistanceToNow, parseISO } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { FileText } from "lucide-react"

interface ActivityTimelineProps {
  activities: Activity[]
  isLoading: boolean
}

export function ActivityTimeline({ activities, isLoading }: ActivityTimelineProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (e) {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No activities yet</h3>
        <p className="text-muted-foreground">
          Your humanization activities will appear here once you start using the service.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.4 }}
          className="flex items-start gap-4"
        >
          <div className="relative mt-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            {index < activities.length - 1 && (
              <div className="absolute left-1/2 top-8 h-full w-px -translate-x-1/2 bg-border" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{activity.description}</p>
              <time className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</time>
            </div>
            <p className="text-sm text-muted-foreground">{activity.word_count.toLocaleString()} words processed</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

