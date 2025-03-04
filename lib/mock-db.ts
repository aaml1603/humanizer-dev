// Mock user data
const users = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    membership: "pro",
    membership_type: "monthly",
    word_limit: 50000,
    words_used: 12500,
    total_words_humanized: 45000,
    is_admin: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    expiration_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
    days_remaining: 15,
    status: "active",
  },
  {
    id: "2",
    name: "Free User",
    email: "free@example.com",
    membership: "free",
    membership_type: "daily", // Changed from monthly to daily
    word_limit: 300, // Changed from 10000 to 300
    words_used: 5,
    total_words_humanized: 15000,
    is_admin: false,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    days_remaining: 1,
    status: "active",
  },
]

// Mock activities
const activities = [
  {
    id: "1",
    user_id: "1",
    description: "Blog post humanization",
    word_count: 1200,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: "2",
    user_id: "1",
    description: "Essay humanization",
    word_count: 2500,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: "3",
    user_id: "1",
    description: "Product description humanization",
    word_count: 800,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  },
  {
    id: "4",
    user_id: "1",
    description: "Email campaign humanization",
    word_count: 1500,
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  },
  {
    id: "5",
    user_id: "1",
    description: "Social media posts humanization",
    word_count: 600,
    timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
  },
]

// Mock API calls
const apiCalls = [
  {
    id: "1",
    endpoint: "/humanize",
    status_code: 200,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    description: "Text humanization",
  },
  {
    id: "2",
    endpoint: "/humanize",
    status_code: 200,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    description: "Text humanization",
  },
  {
    id: "3",
    endpoint: "/humanize",
    status_code: 400,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    description: "Text humanization (failed)",
  },
  {
    id: "4",
    endpoint: "/humanize",
    status_code: 200,
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    description: "Text humanization",
  },
  {
    id: "5",
    endpoint: "/humanize",
    status_code: 200,
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    description: "Text humanization",
  },
]

// Mock API call stats
const apiCallStats = [
  { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), count: 5 },
  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), count: 8 },
  { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), count: 12 },
  { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), count: 7 },
  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), count: 10 },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), count: 15 },
  { date: new Date().toISOString(), count: 3 },
]

// Mock user for authentication
let currentUser = null

export const mockDb = {
  // Auth methods
  register: async (data: { full_name: string; email: string; password: string }) => {
    // Check if email already exists
    if (users.some((user) => user.email === data.email)) {
      throw new Error("Email address is already in use")
    }

    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      name: data.full_name,
      email: data.email,
      membership: "free",
      membership_type: "daily", // Changed from monthly to daily
      word_limit: 300, // Changed from 10000 to 300
      words_used: 0,
      total_words_humanized: 0,
      is_admin: false,
      created_at: new Date().toISOString(),
      expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
      days_remaining: 1,
      status: "active",
    }

    users.push(newUser)
    return { message: "Account registered successfully." }
  },

  login: async (data: { email: string; password: string }) => {
    // Find user by email
    const user = users.find((user) => user.email === data.email)

    if (!user) {
      throw new Error("Invalid email or password")
    }

    // In a real app, we would check the password here
    // For the mock, we'll just accept any password

    currentUser = user
    return {
      message: "Login successful.",
      access_token: "mock_token_" + user.id,
    }
  },

  getUserInfo: async () => {
    if (!currentUser) {
      throw new Error("Not authenticated")
    }

    return currentUser
  },

  changePassword: async (data: { current_password: string; new_password: string }) => {
    if (!currentUser) {
      throw new Error("Not authenticated")
    }

    // In a real app, we would verify the current password and update to the new one
    // For the mock, we'll just return success

    return { message: "Password updated successfully." }
  },

  logout: () => {
    currentUser = null
  },

  isAuthenticated: () => {
    return !!currentUser
  },

  // Humanize methods
  humanizeText: async (data: { text: string; description?: string }) => {
    if (!currentUser) {
      throw new Error("Not authenticated")
    }

    const wordCount = data.text.split(/\s+/).length

    // Check if user has enough words remaining
    if (wordCount > currentUser.word_limit - currentUser.words_used) {
      throw new Error("Word limit exceeded")
    }

    // Update user's word usage
    currentUser.words_used += wordCount
    currentUser.total_words_humanized += wordCount

    // Add activity
    activities.unshift({
      id: (activities.length + 1).toString(),
      user_id: currentUser.id,
      description: data.description || "Text humanization",
      word_count: wordCount,
      timestamp: new Date().toISOString(),
    })

    // Add API call
    apiCalls.unshift({
      id: (apiCalls.length + 1).toString(),
      endpoint: "/humanize",
      status_code: 200,
      timestamp: new Date().toISOString(),
      description: data.description || "Text humanization",
    })

    // Simple humanization algorithm for demo purposes
    const words = data.text.split(/\s+/)
    const humanizedWords = words.map((word) => {
      // Randomly keep the word as is or modify it slightly
      if (Math.random() > 0.7) {
        return word
      }

      // Add some filler words occasionally
      if (Math.random() > 0.9) {
        const fillers = ["actually", "basically", "literally", "honestly", "you know", "I mean"]
        return fillers[Math.floor(Math.random() * fillers.length)] + " " + word
      }

      return word
    })

    return {
      humanized_text: humanizedWords.join(" "),
      word_count: wordCount,
      words_remaining: currentUser.word_limit - currentUser.words_used,
    }
  },

  getRecentActivities: async (limit = 10) => {
    if (!currentUser) {
      throw new Error("Not authenticated")
    }

    return activities.filter((activity) => activity.user_id === currentUser.id).slice(0, limit)
  },

  getRecentApiCalls: async (limit = 10) => {
    return apiCalls.slice(0, limit)
  },

  getApiCallStats: async (days = 7) => {
    return apiCallStats.slice(0, days)
  },

  resetUsage: async () => {
    if (!currentUser) {
      throw new Error("Not authenticated")
    }

    currentUser.words_used = 0
    return { message: "Usage reset successfully" }
  },

  // Admin methods
  getAllUsers: async () => {
    if (!currentUser?.is_admin) {
      throw new Error("Access denied. Admin privileges required.")
    }

    return users
  },

  getUserById: async (userId: string) => {
    if (!currentUser?.is_admin) {
      throw new Error("Access denied. Admin privileges required.")
    }

    const user = users.find((user) => user.id === userId)

    if (!user) {
      throw new Error("User not found")
    }

    return user
  },

  getUserActivities: async (userId: string, limit = 10) => {
    if (!currentUser?.is_admin) {
      throw new Error("Access denied. Admin privileges required.")
    }

    return activities.filter((activity) => activity.user_id === userId).slice(0, limit)
  },

  updateSubscription: async (data: {
    user_id: string
    membership: string
    membership_type?: "monthly" | "yearly"
    word_limit?: number
    status?: "active" | "canceled" | "expired" | "trial"
    reset_usage?: boolean
  }) => {
    if (!currentUser?.is_admin) {
      throw new Error("Access denied. Admin privileges required.")
    }

    const user = users.find((user) => user.id === data.user_id)

    if (!user) {
      throw new Error("User not found")
    }

    // Update user subscription
    user.membership = data.membership

    if (data.membership_type) {
      user.membership_type = data.membership_type

      // Calculate new expiration date
      const now = new Date()
      if (data.membership_type === "monthly") {
        user.expiration_date = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
        user.days_remaining = 30
      } else if (data.membership_type === "yearly") {
        user.expiration_date = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()
        user.days_remaining = 365
      }
    }

    if (data.word_limit) {
      user.word_limit = data.word_limit
    }

    if (data.status) {
      user.status = data.status
    }

    if (data.reset_usage) {
      user.words_used = 0
    }

    return { message: "Subscription updated successfully" }
  },

  resetUserUsage: async (userId: string) => {
    if (!currentUser?.is_admin) {
      throw new Error("Access denied. Admin privileges required.")
    }

    const user = users.find((user) => user.id === userId)

    if (!user) {
      throw new Error("User not found")
    }

    user.words_used = 0

    return { message: "User usage reset successfully" }
  },

  checkExpiredMemberships: async () => {
    if (!currentUser?.is_admin) {
      throw new Error("Access denied. Admin privileges required.")
    }

    // In a real app, we would check for expired memberships and downgrade them
    // For the mock, we'll just return success

    return { message: "Checked all memberships. 0 users were downgraded to free tier." }
  },
}

