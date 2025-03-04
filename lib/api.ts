import axios from "axios"

const API_URL = "http://localhost:5000" // Change this to your Flask server URL in production

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add interceptor to include JWT token in requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface RegisterData {
  full_name: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
}

export interface AuthResponse {
  message: string
  access_token?: string
}

export interface UserInfo {
  name: string
  email: string
  membership: string
  membership_type: string
  word_limit: number
  words_used: number
  total_words_humanized: number
  is_admin?: boolean
  expiration_date: string
  days_remaining: number
}

export interface Activity {
  id: string
  description: string
  word_count: number
  timestamp: string
}

export interface ApiCall {
  id: string
  endpoint: string
  status_code: number
  timestamp: string
  description: string
}

export interface ApiCallStat {
  date: string
  count: number
}

export interface HumanizeRequest {
  text: string
  description?: string
}

export interface HumanizeResponse {
  humanized_text: string
  word_count: number
  words_remaining: number
}

export interface UserSubscription {
  id: string
  user_id: string
  user_email: string
  user_name: string
  membership: string
  membership_type: string
  word_limit: number
  words_used: number
  total_words_humanized: number
  created_at: string
  expiration_date: string
  days_remaining: number
  status: "active" | "canceled" | "expired" | "trial"
}

export interface UpdateSubscriptionData {
  user_id: string
  membership: string
  membership_type?: "monthly" | "yearly"
  word_limit?: number
  status?: "active" | "canceled" | "expired" | "trial"
  reset_usage?: boolean
}

export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/register", data)
      return response.data
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Registration failed")
      }
      throw new Error("Network error. Please try again later.")
    }
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/login", data)
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token)
      }
      return response.data
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Login failed")
      }
      throw new Error("Network error. Please try again later.")
    }
  },

  changePassword: async (data: ChangePasswordData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/change-password", data)
      return response.data
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Password change failed")
      }
      throw new Error("Network error. Please try again later.")
    }
  },

  getUserInfo: async (): Promise<UserInfo> => {
    try {
      const response = await api.get<{ user_info: UserInfo }>("/get-info")
      return response.data.user_info
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to fetch user info")
      }
      throw new Error("Network error. Please try again later.")
    }
  },

  logout: (): void => {
    localStorage.removeItem("token")
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token")
  },
}

export const humanizeService = {
  humanizeText: async (data: HumanizeRequest): Promise<HumanizeResponse> => {
    try {
      const response = await api.post<HumanizeResponse>("/humanize", data)
      return response.data
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Humanization failed")
      }
      throw new Error("Network error. Please try again later.")
    }
  },

  getRecentActivities: async (limit = 10): Promise<Activity[]> => {
    try {
      const response = await api.get<{ activities: Activity[] }>(`/recent-activities?limit=${limit}`)
      return response.data.activities
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to fetch activities")
      }
      throw new Error("Network error. Please try again later.")
    }
  },

  getRecentApiCalls: async (limit = 10): Promise<ApiCall[]> => {
    try {
      const response = await api.get<{ api_calls: ApiCall[] }>(`/recent-api-calls?limit=${limit}`)
      return response.data.api_calls
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to fetch API calls")
      }
      throw new Error("Network error. Please try again later.")
    }
  },

  getApiCallStats: async (days = 7): Promise<ApiCallStat[]> => {
    try {
      const response = await api.get<{ api_call_stats: ApiCallStat[] }>(`/api-call-stats?days=${days}`)
      return response.data.api_call_stats
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to fetch API call stats")
      }
      throw new Error("Network error. Please try again later.")
    }
  },

  resetUsage: async (): Promise<void> => {
    try {
      await api.post("/reset-usage")
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to reset usage")
      }
      throw new Error("Network error. Please try again later.")
    }
  },
}

export const adminService = {
  getAllUsers: async (): Promise<UserSubscription[]> => {
    try {
      const response = await api.get<{ users: UserSubscription[] }>("/admin/users")
      return response.data.users
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to fetch users")
      }
      throw new Error("Network error. Please try again later.")
    }
  },

  getUserById: async (userId: string): Promise<UserSubscription> => {
    try {
      const response = await api.get<{ user: UserSubscription }>(`/admin/users/${userId}`)
      return response.data.user
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to fetch user")
      }
      throw new Error("Network error. Please try again later.")
    }
  },

  getUserActivities: async (userId: string, limit = 10): Promise<Activity[]> => {
    try {
      const response = await api.get<{ activities: Activity[] }>(`/admin/users/${userId}/activities?limit=${limit}`)
      return response.data.activities
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to fetch user activities")
      }
      throw new Error("Network error. Please try again later.")
    }
  },

  updateSubscription: async (data: UpdateSubscriptionData): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>("/admin/update-subscription", data)
      return response.data
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to update subscription")
      }
      throw new Error("Network error. Please try again later.")
    }
  },

  resetUserUsage: async (userId: string): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>(`/admin/reset-usage/${userId}`)
      return response.data
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to reset user usage")
      }
      throw new Error("Network error. Please try again later.")
    }
  },

  checkExpiredMemberships: async (): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>("/admin/check-expired-memberships")
      return response.data
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to check expired memberships")
      }
      throw new Error("Network error. Please try again later.")
    }
  },
}

