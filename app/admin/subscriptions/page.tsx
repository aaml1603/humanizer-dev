"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { adminService, type UserSubscription } from "@/lib/api"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Search, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function SubscriptionsPage() {
  const { toast } = useToast()
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserSubscription | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    membership: "",
    wordLimit: 0,
    status: "",
    resetUsage: false,
  })

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true)
      const users = await adminService.getAllUsers()
      setSubscriptions(users)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching subscriptions",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      sub.user_email.toLowerCase().includes(searchLower) ||
      sub.user_name.toLowerCase().includes(searchLower) ||
      sub.membership.toLowerCase().includes(searchLower) ||
      sub.status.toLowerCase().includes(searchLower)
    )
  })

  const handleEditSubscription = (subscription: UserSubscription) => {
    setSelectedUser(subscription)
    setFormData({
      membership: subscription.membership,
      wordLimit: subscription.word_limit,
      status: subscription.status,
      resetUsage: false,
    })
    setIsDialogOpen(true)
  }

  const handleUpdateSubscription = async () => {
    if (!selectedUser) return

    try {
      await adminService.updateSubscription({
        user_id: selectedUser.user_id,
        membership: formData.membership,
        word_limit: formData.wordLimit,
        status: formData.status as "active" | "canceled" | "expired" | "trial",
        reset_usage: formData.resetUsage,
      })

      toast({
        title: "Subscription updated",
        description: `Successfully updated subscription for ${selectedUser.user_name}`,
      })

      // Refresh the subscriptions list
      fetchSubscriptions()
      setIsDialogOpen(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating subscription",
        description: error.message,
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "canceled":
        return <Badge className="bg-yellow-500">Canceled</Badge>
      case "expired":
        return <Badge className="bg-red-500">Expired</Badge>
      case "trial":
        return <Badge className="bg-blue-500">Trial</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">Subscriptions</h1>
          <Button variant="outline" size="sm" onClick={fetchSubscriptions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <p className="text-muted-foreground">Manage user subscriptions and billing information.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Subscriptions</CardTitle>
            <CardDescription>View and manage all user subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, email, or plan..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Renewal Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No subscriptions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            <div className="font-medium">{subscription.user_name}</div>
                            <div className="text-sm text-muted-foreground">{subscription.user_email}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium capitalize">{subscription.membership}</div>
                            <div className="text-sm text-muted-foreground">
                              {subscription.word_limit.toLocaleString()} words/month
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {subscription.words_used.toLocaleString()} / {subscription.word_limit.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {Math.round((subscription.words_used / subscription.word_limit) * 100)}% used
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                          <TableCell>
                            {subscription.renewal_date
                              ? (() => {
                                  try {
                                    return format(new Date(subscription.renewal_date), "MMM d, yyyy")
                                  } catch (e) {
                                    return "Invalid date"
                                  }
                                })()
                              : "No renewal date"}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEditSubscription(subscription)}>
                                  Edit subscription
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={async () => {
                                    try {
                                      await adminService.resetUserUsage(subscription.user_id)
                                      toast({
                                        title: "Usage reset",
                                        description: `Successfully reset usage for ${subscription.user_name}`,
                                      })
                                      fetchSubscriptions()
                                    } catch (error: any) {
                                      toast({
                                        variant: "destructive",
                                        title: "Error resetting usage",
                                        description: error.message,
                                      })
                                    }
                                  }}
                                >
                                  Reset usage
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>Update subscription details for {selectedUser?.user_name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="membership" className="text-right">
                Plan
              </Label>
              <Select
                value={formData.membership}
                onValueChange={(value) => setFormData({ ...formData, membership: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="wordLimit" className="text-right">
                Word Limit
              </Label>
              <Input
                id="wordLimit"
                type="number"
                value={formData.wordLimit}
                onChange={(e) => setFormData({ ...formData, wordLimit: Number.parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="resetUsage" className="text-right">
                Reset Usage
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="resetUsage"
                  checked={formData.resetUsage}
                  onCheckedChange={(checked) => setFormData({ ...formData, resetUsage: !!checked })}
                />
                <label
                  htmlFor="resetUsage"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Reset monthly usage to zero
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubscription}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

