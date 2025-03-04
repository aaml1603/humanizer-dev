"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { humanizeService, type ApiCall } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ApiCalls() {
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApiCalls = async () => {
      try {
        setIsLoading(true)
        const data = await humanizeService.getRecentApiCalls(5)
        setApiCalls(data)
        setError(null)
      } catch (err: any) {
        console.error("Error fetching API calls:", err)
        setError(err.message || "Failed to load recent API calls")
      } finally {
        setIsLoading(false)
      }
    }

    fetchApiCalls()
  }, [])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (e) {
      return dateString
    }
  }

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge className="bg-green-500">Success</Badge>
    } else if (statusCode >= 400 && statusCode < 500) {
      return <Badge className="bg-yellow-500">Client Error</Badge>
    } else if (statusCode >= 500) {
      return <Badge className="bg-red-500">Server Error</Badge>
    }
    return <Badge>{statusCode}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent API Calls</CardTitle>
        <CardDescription>Your recent API activity</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[80px]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : apiCalls.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No recent API calls found</div>
        ) : (
          <div className="space-y-8">
            {apiCalls.map((call) => (
              <div key={call.id} className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{call.description}</p>
                  <p className="text-sm text-muted-foreground">{call.endpoint}</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="mb-1">{getStatusBadge(call.status_code)}</div>
                  <p className="text-sm text-muted-foreground">{formatDate(call.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

