import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface UsageStatsProps {
  wordLimit: number
  wordsUsed: number
}

export function UsageStats({ wordLimit, wordsUsed }: UsageStatsProps) {
  // Calculate percentages
  const wordsUsedPercentage = Math.min(100, Math.round((wordsUsed / wordLimit) * 100))
  const daysRemainingPercentage = 60 // This would be calculated based on subscription dates

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Statistics</CardTitle>
        <CardDescription>Your current plan usage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Words Used This Month</p>
              <p className="text-sm text-muted-foreground">
                {wordsUsed.toLocaleString()} / {wordLimit.toLocaleString()} words
              </p>
            </div>
            <p className="text-sm font-medium">{wordsUsedPercentage}%</p>
          </div>
          <Progress value={wordsUsedPercentage} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Days Remaining</p>
              <p className="text-sm text-muted-foreground">18 days until renewal</p>
            </div>
            <p className="text-sm font-medium">{daysRemainingPercentage}%</p>
          </div>
          <Progress value={daysRemainingPercentage} />
        </div>
      </CardContent>
    </Card>
  )
}

