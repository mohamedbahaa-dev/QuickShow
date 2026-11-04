import { useAuth } from "@clerk/react"

export function useAuthConfig() {
  const { getToken } = useAuth()
  return async function authConfig() {
    const token = await getToken()
    return { headers: { Authorization: `Bearer ${token}` } }
  }
}