"use client"

import { Checkbox } from "@/components/ui/checkbox"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { adminService, type UserSubscription, type Activity } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { capitalize } from "@/lib/utils"

export default function UserDetailPage() {
  const params = useParams()
  const userId = params.id as string
  const router = useRouter()
  const { toast } = useToast()

  const [user, setUser] = useState<UserSubscription | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    membership: "",
    membership_type: "",
    word_limit: "",
    status: "",
    reset_usage: false,
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await adminService.getUserById(userId)
        setUser(userData)
        setFormData({
          membership: userData.membership,
          membership_type: userData.membership_type,
          word_limit: userData.word_limit.toString(),
          status: userData.status,
          reset_usage: false,
        })

        // Fetch user activities
        const activitiesData = await adminService.getUserActivities(userId)
        setActivities(activitiesData)

        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch user data:", error)
        setIsLoading(false)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user data",
        })
      }
    }

    fetchUserData()
  }, [userId, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, reset_usage: checked }))
  }

  const handleUpdateSubscription = async () => {
    setIsSubmitting(true)
    try {
      await adminService.updateSubscription({
        user_id: userId,
        membership: formData.membership,
        membership_type: formData.membership_type as "monthly" | "yearly",
        word_limit: Number.parseInt(formData.word_limit),
        status: formData.status as "active" | "canceled" | "expired" | "trial",
        reset_usage: formData.reset_usage,
      })

      // Refresh user data
      const userData = await adminService.getUserById(userId)
      setUser(userData)

      setIsEditDialogOpen(false)
      toast({
        title: "Subscription updated",
        description: "User subscription has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update subscription",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetUsage = async () => {
    setIsSubmitting(true)
    try {
      await adminService.resetUserUsage(userId)

      // Refresh user data
      const userData = await adminService.getUserById(userId)
      setUser(userData)

      setIsResetDialogOpen(false)
      toast({
        title: "Usage reset",
        description: "User usage has been reset successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reset usage",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>Loading user data...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p>User not found</p>
        <Button onClick={() => router.push("/admin/users")}>Back to Users</Button>
      </div>
    )
  }

  // Calculate usage percentage
  const usagePercentage = Math.round((user.words_used / user.word_limit) * 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">User Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsResetDialogOpen(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Usage
          </Button>
          <Button onClick={() => setIsEditDialogOpen(true)}>Edit Subscription</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Basic information about the user.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Name</Label>
                <p className="font-medium">{user.user_name}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Email</Label>
                <p className="font-medium">{user.user_email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Created At</Label>
                <p className="font-medium">{user.created_at}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={user.status === "active" ? "default" : user.status === "trial" ? "outline" : "destructive"}
                  >
                    {capitalize(user.status)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>Current subscription information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Plan</Label>
                <p className="font-medium">{capitalize(user.membership)}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Type</Label>
                <p className="font-medium">{capitalize(user.membership_type)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Word Limit</Label>
                <p className="font-medium">{user.word_limit.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Words Used</Label>
                <p className="font-medium">{user.words_used.toLocaleString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Expiration Date</Label>
                <p className="font-medium">{user.expiration_date}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Days Remaining</Label>
                <p className="font-medium">{user.days_remaining}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Usage</Label>
              <div className="mt-1 h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    usagePercentage > 90 ? "bg-destructive" : usagePercentage > 75 ? "bg-amber-500" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {user.words_used.toLocaleString()} / {user.word_limit.toLocaleString()} words ({usagePercentage}%)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Recent text humanization activities by this user.</CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No recent activities found.</p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex justify-between items-start border-b pb-3">
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.word_count.toLocaleString()} words processed
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>Update the user's subscription details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="membership">Membership</Label>
                <Select value={formData.membership} onValueChange={(value) => handleSelectChange("membership", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select membership" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="membership_type">Membership Type</Label>
                <Select
                  value={formData.membership_type}
                  onValueChange={(value) => handleSelectChange("membership_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="word_limit">Word Limit</Label>
                <Input
                  id="word_limit"
                  name="word_limit"
                  type="number"
                  value={formData.word_limit}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="reset_usage" checked={formData.reset_usage} onCheckedChange={handleCheckboxChange} />
              <Label htmlFor="reset_usage">Reset monthly usage</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubscription} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Usage</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset this user's usage? This will set their current month's word usage to zero.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleResetUsage} disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset Usage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

