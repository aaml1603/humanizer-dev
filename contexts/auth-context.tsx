"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { useRouter } from "next/navigation"
import { authService, type LoginData, type RegisterData, type UserInfo } from "@/lib/api"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: UserInfo | null
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshUserInfo: (force?: boolean) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const router = useRouter()

  const fetchUserInfo = useCallback(
    async (force = false) => {
      try {
        const now = Date.now()
        // Increase throttle time from 30 seconds to 2 minutes (120000ms)
        // Only fetch if forced or if 2 minutes have passed since last fetch
        if (force || now - lastFetchTime > 120000) {
          const userInfo = await authService.getUserInfo()
          setUser(userInfo)
          setLastFetchTime(now)
          return userInfo
        } else {
          // Return cached user info if within throttle period
          return user
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error)
        return null
      }
    },
    [lastFetchTime, user],
  )

  useEffect(() => {
    // Check if user is authenticated on initial load
    const checkAuth = async () => {
      const authenticated = authService.isAuthenticated()
      setIsAuthenticated(authenticated)

      if (authenticated && !user) {
        // Only fetch user info if authenticated and no user data exists
        await fetchUserInfo(true)
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [fetchUserInfo, user])

  const login = async (data: LoginData) => {
    try {
      const response = await authService.login(data)
      setIsAuthenticated(true)
      await fetchUserInfo()
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setUser(null)
    router.push("/login")
  }

  const refreshUserInfo = async (force = false) => {
    return await fetchUserInfo(force)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        register,
        logout,
        refreshUserInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

