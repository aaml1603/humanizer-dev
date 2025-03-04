"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { adminService, type UserSubscription } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Search, Edit, RefreshCw } from "lucide-react"
import { capitalize } from "@/lib/utils"

export default function UsersPage() {
  const [users, setUsers] = useState<UserSubscription[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserSubscription[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminService.getAllUsers()
        setUsers(data)
        setFilteredUsers(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch users:", error)
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = users.filter(
        (user) =>
          user.user_name.toLowerCase().includes(query) ||
          user.user_email.toLowerCase().includes(query) ||
          user.membership.toLowerCase().includes(query),
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id))
    }
  }

  const handleViewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`)
  }

  const handleResetUsage = async () => {
    setIsResetting(true)
    try {
      for (const userId of selectedUsers) {
        await adminService.resetUserUsage(userId)
      }

      // Refresh user data
      const data = await adminService.getAllUsers()
      setUsers(data)
      setFilteredUsers(data)

      setIsResetDialogOpen(false)
      setSelectedUsers([])

      toast({
        title: "Usage reset",
        description: `Successfully reset usage for ${selectedUsers.length} user(s).`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reset usage",
      })
    } finally {
      setIsResetting(false)
    }
  }

  const handleCheckExpiredMemberships = async () => {
    setIsLoading(true)
    try {
      const response = await adminService.checkExpiredMemberships()

      // Refresh user data
      const data = await adminService.getAllUsers()
      setUsers(data)
      setFilteredUsers(data)

      toast({
        title: "Memberships checked",
        description: response.message,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to check expired memberships",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCheckExpiredMemberships} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Expired Memberships
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetDialogOpen(true)}
            disabled={selectedUsers.length === 0}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Usage
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleSelectUser(user.id)}
                      aria-label={`Select ${user.user_name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.user_name}</TableCell>
                  <TableCell>{user.user_email}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{capitalize(user.membership)}</span>
                      <span className="text-xs text-muted-foreground">{capitalize(user.membership_type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>
                        {user.words_used.toLocaleString()} / {user.word_limit.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round((user.words_used / user.word_limit) * 100)}% used
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{user.expiration_date}</span>
                      <span className="text-xs text-muted-foreground">{user.days_remaining} days remaining</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active" ? "default" : user.status === "trial" ? "outline" : "destructive"
                      }
                    >
                      {capitalize(user.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewUser(user.id)}
                      aria-label={`Edit ${user.user_name}`}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Usage</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset the usage for {selectedUsers.length} selected user(s)? This will set their
              current month's word usage to zero.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)} disabled={isResetting}>
              Cancel
            </Button>
            <Button onClick={handleResetUsage} disabled={isResetting}>
              {isResetting ? "Resetting..." : "Reset Usage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

